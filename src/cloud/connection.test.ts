import { ensureLogger, ensureSuperThis, SuperThis } from "@fireproof/core";
import { Logger, Result, URI } from "@adviser/cement";
import {
    buildErrorMsg,
    buildReqGestalt,
    buildReqOpen,
    buildResGestalt,
    buildResOpen,
    MsgIsError,
    MsgIsReqOpen,
    MsgIsReqGestalt,
    MsgIsResGestalt,
    MsgIsResOpen,
    MsgBase,
    Connection,
    defaultGestalt,
    MsgerParams,
    Gestalt,
    ReqOpen,
} from "./msg-types.js";
import { serve, ServerType } from '@hono/node-server'
import { createNodeWebSocket } from '@hono/node-ws'
import { Hono } from 'hono'
import { applyStart, defaultMsgParams, MsgConnection, Msger, } from "./msger.js";
import { top_uint8 } from "../coerce-binary.js";
import exp from "constants";

class Dispatcher {
    readonly sthis: SuperThis
    readonly logger: Logger
    readonly conns = new Map<string, Connection>()
    readonly gestalt: Gestalt

    constructor(sthis: SuperThis, gestalt: Gestalt) {
        this.sthis = sthis
        this.logger = ensureLogger(sthis, "Dispatcher")
        this.gestalt = gestalt
    }

    addConn(aConn: Connection): Result<Connection> {
        const key = [aConn.key.ledgerName, aConn.key.tenantId].join(":")
        let conn = this.conns.get(key)
        if (!conn) {
            if (this.conns.size > 0) {
                return Result.Err("connection")
            }
            conn = { ...aConn, resId: this.sthis.nextId().str }
            this.conns.set(key, conn)
        }
        if (conn.reqId !== aConn.reqId) {
            return Result.Err("unexpected reqId")
        }
        return Result.Ok(conn)
    }

    dispatch(msg: MsgBase, send: (msg: MsgBase) => void) {
        switch (true) {
            case MsgIsReqGestalt(msg):
                return send(buildResGestalt(msg, this.gestalt));
            case MsgIsReqOpen(msg): {
                if (!msg.conn) {
                    return send(buildErrorMsg(this.sthis, this.logger, msg, new Error("missing connection")));
                }
                /* DDoS protection */
                const rConn = this.addConn(msg.conn)
                if (rConn.isErr()) {
                    return send(buildErrorMsg(this.sthis, this.logger, msg, rConn.Err()));
                }
                return send(buildResOpen(this.sthis, msg, rConn.Ok().resId));
            }
            default:
                return send(buildErrorMsg(this.sthis, this.logger, msg, new Error("unexpected message")));
        }
    }
}

class HonoServer {
    readonly sthis: SuperThis
    server?: ServerType
    readonly msgP: MsgerParams
    readonly gestalt: Gestalt
    readonly logger: Logger
    constructor(sthis: SuperThis, msgP: MsgerParams, gestalt: Gestalt) {
        this.sthis = sthis
        this.logger = ensureLogger(sthis, "HonoServer")
        this.msgP = msgP
        this.gestalt = gestalt
    }
    async start(port: number): Promise<HonoServer> {
        const app = new Hono()
        const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app })
        // app.put('/gestalt', async (c) => c.json(buildResGestalt(await c.req.json(), defaultGestaltItem({ id: "server", hasPersistent: true }).gestalt)))
        // app.put('/error', async (c) => c.json(buildErrorMsg(sthis, sthis.logger, await c.req.json(), new Error("test error"))))
        const dispatcher = new Dispatcher(this.sthis, this.gestalt)
        app.put('/fp', async (c) => {
            const msg = await c.req.json()
            return dispatcher.dispatch(msg, (msg) => c.json(msg))
        })
        app.get("/ws", async (c, next) => {
            const reqOpen = JSON.parse(URI.from(c.req.url).getParam("reqOpen", ""))
            if (!MsgIsReqOpen(reqOpen) || !reqOpen.conn) {
                c.status(401)
                return c.json(buildErrorMsg(this.sthis, this.sthis.logger, reqOpen,
                    this.logger.Error().Msg("expected reqOpen").AsError()
                ))
            }
            const dispatcher = new Dispatcher(this.sthis, this.gestalt)
            dispatcher.addConn(reqOpen.conn)
            return upgradeWebSocket((_c) => ({
                onOpen: () => {
                    // console.log('Connection opened', c.req.url)
                },
                onError: (error) => {
                    this.logger.Error().Err(error).Msg("WebSocket error")
                },
                onMessage: async (event, ws) => {
                    // console.log('onMsg event', event, event.data);
                    dispatcher.dispatch(this.msgP.ende.decode(await top_uint8(event.data)), (msg) => {
                        const str = this.msgP.ende.encode(msg)
                        ws.send(str)
                    })
                },
                onClose: () => {
                    // console.log('Connection closed')
                },
            }))(c, next)
        })
        this.server = await new Promise((resolve) => {
            const server = serve({ fetch: app.fetch, port }, () => resolve(server))
            injectWebSocket(server)
            return server
        })
        return this
    }
    async close() {
        await new Promise((resolve) => this.server?.close(resolve))
    }
}


function httpStyle(sthis: SuperThis, port: number, msgP: MsgerParams, qOpen: ReqOpen, my: Gestalt) {
    const remote = defaultGestalt({ id: "HTTP-server", hasPersistent: true, protocol: "http" })
    const exGt = { my, remote }
    return {
        name: "HTTP",
        remoteGestalt: remote,
        ok: {
            url: () => URI.from(`http://127.0.0.1:${port}/fp`),
            open: () => applyStart(Msger.openHttp(sthis, qOpen, [URI.from(`http://localhost:${port}/fp`)], {
                ...msgP,
                protocol: "http",
                timeout: 1000
            }, exGt))
        },
        connRefused: {
            url: () => URI.from(`http://127.0.0.1:${port - 1}/fp`),
            open: () => Msger.openHttp(sthis, qOpen, [URI.from(`http://localhost:${port - 1}/fp`)], {
                ...msgP,
                protocol: "http",
                timeout: 1000
            }, exGt)
        },
        timeout: {
            url: () => URI.from(`http://4.7.1.1:${port}/fp`),
            open: () => Msger.openHttp(sthis, qOpen, [URI.from(`http://4.7.1.1:${port}/fp`)], {
                ...msgP,
                protocol: "http",
                timeout: 500
            }, exGt)
        }
    }
}

function wsStyle(sthis: SuperThis, port: number, msgP: MsgerParams, qOpen: ReqOpen, my: Gestalt) {
    const remote = defaultGestalt({ id: "WS-server", hasPersistent: true, protocol: "ws" })
    const exGt = { my, remote }
    return {
        name: "WS",
        remoteGestalt: remote,
        ok: {
            url: () => URI.from(`http://127.0.0.1:${port}/ws`),
            open: () => applyStart(Msger.openWS(sthis, qOpen, URI.from(`http://localhost:${port}/ws`), {
                ...msgP,
                protocol: "ws",
                timeout: 1000
            }, exGt))
        },
        connRefused: {
            url: () => URI.from(`http://127.0.0.1:${port - 1}/ws`),
            open: () => Msger.openWS(sthis, qOpen, URI.from(`http://localhost:${port - 1}/ws`), {
                ...msgP,
                protocol: "ws",
                timeout: 1000
            }, exGt)
        },
        timeout: {
            url: () => URI.from(`http://4.7.1.1:${port - 1}/ws`),
            open: () => Msger.openWS(sthis, qOpen, URI.from(`http://4.7.1.1:${port - 1}/ws`), {
                ...msgP,
                protocol: "ws",
                timeout: 500
            }, exGt)
        }
    }
}


describe("Connection", () => {
    const sthis = ensureSuperThis();
    const msgP = defaultMsgParams(sthis, { hasPersistent: true })
    const port = 1024 + Math.floor(Math.random() * (65536 - 1024))
    const qOpen = buildReqOpen(sthis, {
        key: {
            ledgerName: "test",
            tenantId: "test",
        },
        reqId: "req-open-test",
    })
    const my = defaultGestalt({ id: "test" })
    for (const style of [httpStyle(sthis, port, msgP, qOpen, my)/*, wsStyle(sthis, port, msgP, qOpen, my)*/]) {
        describe(style.name, () => {
            let server: HonoServer
            beforeAll(async () => {
                server = await (new HonoServer(sthis, msgP, style.remoteGestalt)).start(port)
            })
            afterAll(async () => {
                await server.close()
            })
            it(`conn refused`, async () => {
                const rC = await applyStart(style.connRefused.open())
                expect(rC.isErr()).toBeTruthy()
                expect(rC.Err().message).toMatch(/ECONNREFUSED/)
            })

            it(`timeout`, async () => {
                const rC = await applyStart(style.timeout.open())
                expect(rC.isErr()).toBeTruthy()
                expect(rC.Err().message).toMatch(/Timeout/i)
            })

            describe(`connection`, () => {
                let c: MsgConnection
                beforeEach(async () => {
                    const rC = await style.ok.open()
                    expect(rC.isOk()).toBeTruthy()
                    c = rC.Ok()
                    expect(c.conn).toEqual({
                        conn: {
                            "key": {
                                "ledgerName": "test",
                                "tenantId": "test",
                            },
                            "reqId": "req-open-test",
                            "resId": c.conn?.conn.resId,
                        },
                        "tid": qOpen.tid,
                        "type": "resOpen",
                        "version": "FP-MSG-1.0",
                    })
                })
                afterEach(async () => {
                    await c.close()
                })

                it("kaputt url http", async () => {
                    const r = await c.request({
                        tid: "test",
                        type: "kaputt",
                        version: "FP-MSG-1.0",
                    }, { waitFor: () => true })
                    if (!MsgIsError(r)) {
                        assert.fail("expected MsgError")
                        return
                    }
                    expect(r).toEqual({
                        "message": "unexpected message",
                        "tid": "test",
                        "type": "error",
                        "version": "FP-MSG-1.0",
                    })
                })
                it("gestalt url http", async () => {
                    const msgP = defaultMsgParams(sthis, {})
                    const req = buildReqGestalt(sthis, defaultGestalt({ id: "test", ...msgP }))
                    const r = await c.request(req, { waitFor: MsgIsResGestalt })
                    if (!MsgIsResGestalt(r)) {
                        assert.fail("expected MsgError", JSON.stringify(r))
                    }
                    expect(r.gestalt).toEqual(c.exchangedGestalt?.remote)
                })

                it("openConnection", async () => {
                    const req = buildReqOpen(sthis, {
                        ...c.conn?.conn as Connection,
                    })
                    const r = await c.request(req, { waitFor: MsgIsResOpen })
                    if (!MsgIsResOpen(r)) {
                        assert.fail(JSON.stringify(r))
                    }
                    expect(r).toEqual({
                        conn: c.conn?.conn,
                        tid: req.tid,
                        "type": "resOpen",
                        "version": "FP-MSG-1.0",
                    })
                })

                it("open", async () => {
                    const qOpen = buildReqOpen(sthis, {
                        key: {
                            ledgerName: "test",
                            tenantId: "test",
                        },
                        reqId: "req-open-test",
                    })
                    const rC = await Msger.open(sthis, URI.from(`http://localhost:${port}`), qOpen, msgP)
                    expect(rC.isOk()).toBeTruthy()
                    const c = rC.Ok()
                    expect(c.conn).toEqual({})
                    expect(c.exchangedGestalt).toEqual({})

                })
            })
        })
    }
})