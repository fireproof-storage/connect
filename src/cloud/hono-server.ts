import { exception2Result, HttpHeader, runtimeFn, URI } from "@adviser/cement";
import { ensureLogger, Logger, SuperThis } from "@fireproof/core";
import { Hono } from "hono";
import { top_uint8 } from "../coerce-binary.js";
import { MsgerParams, Gestalt, MsgIsReqOpen, buildErrorMsg } from "./msg-types.js";
import { MsgDispatcher } from "./msg-dispatch.js";
import { UpgradeWebSocket } from "hono/ws";

export interface HonoServerImpl {
  start(app: Hono): Promise<void>;
  serve(app: Hono, port?: number): Promise<void>;
  close(): Promise<void>;
  upgradeWebSocket: UpgradeWebSocket;
  readonly headers: HttpHeader;
}

export const CORS = HttpHeader.from({
  // "Accept": "application/json",
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS,PUT,DELETE",
  "Access-Control-Max-Age": "86400", // Cache pre-flight response for 24 hours
});

export class HonoServer {
  readonly sthis: SuperThis;
  readonly msgP: MsgerParams;
  readonly gestalt: Gestalt;
  readonly logger: Logger;
  readonly impl: HonoServerImpl;
  constructor(sthis: SuperThis, msgP: MsgerParams, gestalt: Gestalt, impl: HonoServerImpl) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "HonoServer");
    this.msgP = msgP;
    this.gestalt = gestalt;
    this.impl = impl;
  }
  async start(app: Hono, port?: number): Promise<HonoServer> {
    await this.impl.start(app);
    // app.put('/gestalt', async (c) => c.json(buildResGestalt(await c.req.json(), defaultGestaltItem({ id: "server", hasPersistent: true }).gestalt)))
    // app.put('/error', async (c) => c.json(buildErrorMsg(sthis, sthis.logger, await c.req.json(), new Error("test error"))))
    const dispatcher = new MsgDispatcher(this.sthis, this.gestalt);
    app.put("/fp", async (c) => {
      const rMsg = await exception2Result(() => c.req.json());
      if (rMsg.isErr()) {
        c.status(500);
        return c.json(buildErrorMsg(this.sthis, this.logger, { tid: "internal" }, rMsg.Err()));
      }
      this.impl.headers.Items().forEach((i) => {
        c.res.headers.append(i[0], i[1][0]);
      });
      return dispatcher.dispatch(rMsg.Ok(), (msg) => c.json(msg));
    });
    app.get("/ws", async (c, next) => {
      this.impl.headers.AsHeaders().forEach((v, k) => c.res.headers.set(k, v));
      const rReqOpen = await exception2Result(() => JSON.parse(URI.from(c.req.url).getParam("reqOpen", "")));
      if (rReqOpen.isErr()) {
        c.status(500);
        return c.json(buildErrorMsg(this.sthis, this.logger, { tid: "internal" }, rReqOpen.Err()));
      }
      const reqOpen = rReqOpen.Ok();
      if (!MsgIsReqOpen(reqOpen) || !reqOpen.conn) {
        c.status(401);
        return c.json(
          buildErrorMsg(this.sthis, this.sthis.logger, reqOpen, this.logger.Error().Msg("expected reqOpen").AsError())
        );
      }
      const dispatcher = new MsgDispatcher(this.sthis, this.gestalt);
      dispatcher.addConn(reqOpen.conn);
      return this.impl.upgradeWebSocket((_c) => ({
        onOpen: () => {
          // console.log('Connection opened', c.req.url)
        },
        onError: (error) => {
          this.logger.Error().Err(error).Msg("WebSocket error");
        },
        onMessage: async (event, ws) => {
          // console.log('onMsg event', event, event.data);
          dispatcher.dispatch(this.msgP.ende.decode(await top_uint8(event.data)), (msg) => {
            const str = this.msgP.ende.encode(msg);
            ws.send(str);
          });
        },
        onClose: () => {
          // console.log('Connection closed')
        },
      }))(c, next);
    });
    await this.impl.serve(app, port);
    return this;
  }
  async close() {
    return this.impl.close();
  }
}

export async function honoServer(_sthis: SuperThis, _msgP: MsgerParams, _gestalt: Gestalt) {
  const rt = runtimeFn();
  if (rt.isNodeIsh) {
    // const { NodeHonoServer } = await import("./node-hono-server.js");
    // return new HonoServer(sthis, msgP, gestalt, new NodeHonoServer());
  }
  throw new Error("Not implemented");
}
