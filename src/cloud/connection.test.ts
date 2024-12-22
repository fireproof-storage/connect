import { ensureSuperThis, SuperThis } from "@fireproof/core";
import { Result, URI } from "@adviser/cement";
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
    ReqOpen
} from "./msg-types.js";
import { serve, ServerType } from '@hono/node-server'
import { createNodeWebSocket } from '@hono/node-ws'
import { Hono } from 'hono'
import { defaultGestaltItem, MsgConnection, Msger } from "./msger.js";
import { top_uint8 } from "../coerce-binary.js";

function dispatch(sthis: SuperThis, msg: MsgBase, send: (msg: MsgBase) => void) {
    switch (true) {
        case MsgIsReqGestalt(msg):
            return send(buildResGestalt(msg, defaultGestaltItem(sthis, { id: "server", hasPersistent: true }).gestalt));
        case MsgIsReqOpen(msg):
            return send(buildResOpen(msg));
        default:
            // c.status(501)
            return send(buildErrorMsg(sthis, sthis.logger, msg, new Error("unexpected message")));
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
        return Result.Ok(c)
    }
    return rC
}

describe("Connection", () => {
    const sthis = ensureSuperThis();
    const gsi = defaultGestaltItem(sthis, { id: "test", hasPersistent: true })
    let server: ServerType
    let port: number
    beforeAll(async () => {
        const app = new Hono()
        const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app })
        // app.put('/gestalt', async (c) => c.json(buildResGestalt(await c.req.json(), defaultGestaltItem({ id: "server", hasPersistent: true }).gestalt)))
        // app.put('/error', async (c) => c.json(buildErrorMsg(sthis, sthis.logger, await c.req.json(), new Error("test error"))))
        app.put('/fp', async (c) => {
            const msg = await c.req.json()
            return dispatch(sthis, msg, (msg) => c.json(msg))
        })
        app.get("/ws", upgradeWebSocket((c) => {
            return {
                onOpen: () => {
                    // console.log('Connection opened', c.req.url)
                },
                onError: (error) => {
                    console.error(`WebSocket error: ${error}`)
                },
                async onMessage(event, ws) {
                    // console.log('onMsg event', event, event.data);
                    dispatch(sthis, gsi.ende.decode(await top_uint8(event.data)), (msg) => {
                        const str = gsi.ende.encode(msg)
                        ws.send(str)
                    })
                },
                onClose: () => {
                    // console.log('Connection closed')
                },
            }
        })
        )

        port = 1024 + Math.floor(Math.random() * (65536 - 1024))
        server = await new Promise((resolve) => {
            const server = serve({ fetch: app.fetch, port }, () => resolve(server))
            injectWebSocket(server)
            return server
        })
    })
    afterAll(async () => {
        await new Promise((resolve) => server.close(resolve))
    })

    const qOpen = {
        tid: "WS-OPEN",
        version: "FP-MSG-1.0",
        type: "reqOpen",
        key: {
            ledgerName: "test",
            tenantId: "test",
        },
        streamId: {
            req: "req-open-test",
        }
    } satisfies ReqOpen

    for (const style of [{
        name: "HTTP",
        url: () => URI.from(`http://localhost:${port}/fp`),
        open: () => applyStart(Msger.openHttp(sthis, qOpen, [URI.from(`http://localhost:${port}/fp`)], gsi))
    }, {
        name: "WS",
        url: () => URI.from(`http://localhost:${port}/ws`),
        open: () => applyStart(Msger.openWS(sthis, qOpen, URI.from(`http://localhost:${port}/ws`), gsi))
    }]) {
        describe(style.name, () => {

            let c: MsgConnection
            beforeEach(async () => {
                const rC = await style.open()
                expect(rC.isOk()).toBeTruthy()
                c = rC.Ok()
                expect(c.conn).toEqual({
                    "key": {
                        "ledgerName": "test",
                        "tenantId": "test",
                    },
                    "streamId": {
                        "req": "req-open-test",
                        "res": "res-req-open-test",
                    },
                    "tid": "WS-OPEN",
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
                const gsi = defaultGestaltItem(sthis, { id: "test" })
                const req = buildReqGestalt(sthis, gsi.gestalt)
                const r = await c.request(req, { waitFor: MsgIsResGestalt })
                if (!MsgIsResGestalt(r)) {
                    assert.fail("expected MsgError", JSON.stringify(r))
                }
                expect(r).toEqual({
                    "gestalt": {
                        "auth": [],
                        "encodings": [
                            "JSON",
                        ],
                        "eventTypes": [
                            "updateMeta",
                        ],
                        "httpEndpoints": [
                            "/fp",
                        ],
                        "id": "server",
                        "protocolCapabilities": [
                            "stream",
                            "reqRes",
                        ],
                        "reqTypes": [
                            "reqOpen",
                            "reqGestalt",
                            "reqSubscribeMeta",
                            "reqPutMeta",
                            "reqGetMeta",
                            "reqDelMeta",
                            "reqPutData",
                            "reqGetData",
                            "reqDelData",
                            "reqPutWAL",
                            "reqGetWAL",
                            "reqDelWAL",
                            "reqUpdateMeta",
                        ],
                        "requiresAuth": false,
                        "resTypes": [
                            "resOpen",
                            "resGestalt",
                            "resSubscribeMeta",
                            "resPutMeta",
                            "resGetMeta",
                            "resDelMeta",
                            "resPutData",
                            "resGetData",
                            "resDelData",
                            "resPutWAL",
                            "resGetWAL",
                            "resDelWAL",
                            "updateMeta",
                        ],
                        "storeTypes": [
                            "meta",
                            "data",
                            "wal",
                        ],
                        "wsEndpoints": [
                            "/ws",
                        ],
                    },
                    "tid": req.tid,
                    "type": "resGestalt",
                    "version": "FP-MSG-1.0",
                })
            })

            it("openConnection", async () => {
                const req = buildReqOpen(sthis, {
                    tenantId: "tenant",
                    ledgerName: "ledger",
                }, "open-test")
                const r = await c.request(req, { waitFor: MsgIsResOpen })
                if (!MsgIsResOpen(r)) {
                    assert.fail("expected MsgError")
                }
                expect(r).toEqual({
                    key: {
                        "ledgerName": "ledger",
                        "tenantId": "tenant",
                    },
                    streamId: {
                        "req": "open-test",
                        "res": "res-open-test",
                    },
                    tid: req.tid,
                    "type": "resOpen",
                    "version": "FP-MSG-1.0",
                })
            })
        })
    }
})