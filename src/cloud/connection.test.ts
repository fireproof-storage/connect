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
} from "./msg-types.js";
import { serve, ServerType } from '@hono/node-server'
import { createNodeWebSocket } from '@hono/node-ws'
import { Hono } from 'hono'
import { defaultMsgParams, MsgConnection, Msger, } from "./msger.js";
import { top_uint8 } from "../coerce-binary.js";

class Dispatcher {
    readonly sthis: SuperThis
    readonly logger: Logger
    readonly conns = new Map<string, Connection>()

    constructor(sthis: SuperThis) {
        this.sthis = sthis
        this.logger = ensureLogger(sthis, "Dispatcher")
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
                return send(buildResGestalt(msg, {
                    ...defaultMsgParams(this.sthis, {
                        hasPersistent: true
                    }),
                    ...msg.gestalt,
                    id: "server",
                }));
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
    readonly gsi: MsgerParams
    readonly logger: Logger
    constructor(sthis: SuperThis, gsi: MsgerParams) {
        this.sthis = sthis
        this.logger = ensureLogger(sthis, "HonoServer")
        this.gsi = gsi
    }
    async start(port: number): Promise<HonoServer> {
        const app = new Hono()
        const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app })
        const dispatcher = new Dispatcher(this.sthis)
        // app.put('/gestalt', async (c) => c.json(buildResGestalt(await c.req.json(), defaultGestaltItem({ id: "server", hasPersistent: true }).gestalt)))
        // app.put('/error', async (c) => c.json(buildErrorMsg(sthis, sthis.logger, await c.req.json(), new Error("test error"))))
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
                    dispatcher.dispatch(this.gsi.ende.decode(await top_uint8(event.data)), (msg) => {
                        const str = this.gsi.ende.encode(msg)
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

async function applyStart(prC: Promise<Result<MsgConnection>>): Promise<Result<MsgConnection>> {
    const rC = await prC
    if (rC.isErr()) {
        return rC
    }
    const c = rC.Ok()
    const r = await c.start()
    if (r.isErr()) {
        return Result.Err(r.Err())
    }
    return rC
}

describe("Connection", () => {
    const sthis = ensureSuperThis();
    const gsi = defaultMsgParams(sthis, { hasPersistent: true })
    let server: HonoServer
    const port = 1024 + Math.floor(Math.random() * (65536 - 1024))
    beforeAll(async () => {
        server = await (new HonoServer(sthis, gsi)).start(port)
    })
    afterAll(async () => {
        await server.close()
    })

    const qOpen = buildReqOpen(sthis, {
        key: {
            ledgerName: "test",
            tenantId: "test",
        },
        reqId: "req-open-test",
    })

    const exGt = {
        my: defaultGestalt({ id: "test" }),
        remote: defaultGestalt({ id: "server" }),
    }

    for (const style of [{
        name: "HTTP",
        url: () => URI.from(`http://127.0.0.1:${port - 1}/fp`),
        open: () => Msger.openHttp(sthis, qOpen, [URI.from(`http://localhost:${port - 1}/fp`)], {
            ...gsi,
            protocol: "http",
            timeout: 100
        }, exGt)
    }, {
        name: "WS",
        url: () => URI.from(`http://127.0.0.1:${port - 1}/ws`),
        open: () => Msger.openWS(sthis, qOpen, URI.from(`http://localhost:${port - 1}/ws`), {
            ...gsi,
            protocol: "ws",
            timeout: 100
        }, exGt)
    }]) {
        it(`${style.name} - conn refused`, async () => {
            const rC = await applyStart(style.open())
            expect(rC.isErr()).toBeTruthy()
            expect(rC.Err().message).toMatch(/ECONNREFUSED/)
        })
    }

    for (const style of [{
        name: "HTTP",
        url: () => URI.from(`http://4.7.1.1:${port - 1}/fp`),
        open: () => Msger.openHttp(sthis, qOpen, [URI.from(`http://4.7.1.1:${port - 1}/fp`)], {
            ...gsi,
            protocol: "http",
            timeout: 100
        }, exGt)
    }, {
        name: "WS",
        url: () => URI.from(`http://4.7.1.1:${port - 1}/ws`),
        open: () => Msger.openWS(sthis, qOpen, URI.from(`http://4.7.1.1:${port - 1}/ws`), {
            ...gsi,
            protocol: "ws",
            timeout: 100
        }, exGt)
    }]) {
        it(`${style.name} - timeout`, async () => {
            const rC = await applyStart(style.open())
            expect(rC.isErr()).toBeTruthy()
            expect(rC.Err().message).toMatch(/Timeout/i)
        })
    }

    for (const style of [{
        name: "HTTP",
        url: () => URI.from(`http://localhost:${port}/fp`),
        open: () => applyStart(Msger.openHttp(sthis, qOpen, [URI.from(`http://localhost:${port}/fp`)], {
            ...gsi,
            protocol: "http",
        }, exGt))
    }, {
        name: "WS",
        url: () => URI.from(`http://localhost:${port}/ws`),
        open: () => applyStart(Msger.openWS(sthis, qOpen, URI.from(`http://localhost:${port}/ws`), {
            ...gsi,
            protocol: "ws",
        }, exGt))
    }]) {
        describe(style.name, () => {
            let c: MsgConnection
            beforeEach(async () => {
                const rC = await style.open()
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
                const msgP = defaultMsgParams(sthis, {  })
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
        })
    }
})

// describe("connection -- http", async () => {
//     const sthis = ensureSuperThis();
//     const port = 1024 + Math.floor(Math.random() * (65536 - 1024))
//     const gsi = defaultGestaltItem(sthis, { id: "test", hasPersistent: true, protocol: "http" })
//     beforeAll(async () => {
//     })
//     afterAll(async () => {
//     })
//     it("open", async () => {
//         Msger.open(sthis, URI.from(`http://localhost:${port}`), buildReqOpen(sthis, {
//             key: {
//                 ledgerName: "test",
//                 tenantId: "test",
//             },
//             reqId: "req-open-test",
//         }), gsi)
//     })
// })