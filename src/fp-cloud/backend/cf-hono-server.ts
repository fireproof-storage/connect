import { HttpHeader, KeyedResolvOnce, Logger, LoggerImpl, URI } from "@adviser/cement";
import { Context, Hono } from "hono";
import { ConnMiddleware, HonoServerFactory, RunTimeParams, HonoServerBase } from "../hono-server.js";
import { WSContext, WSContextInit, WSEvents } from "hono/ws";
import { buildErrorMsg, defaultGestalt, EnDeCoder, Gestalt } from "../msg-types.js";
// import { RequestInfo as CFRequestInfo } from "@cloudflare/workers-types";
import { defaultMsgParams, jsonEnDe } from "../msger.js";
import { ensureLogger, ensureSuperThis, SuperThis } from "@fireproof/core";
import { SQLDatabase } from "../meta-merger/abstract-sql.js";
import { CFWorkerSQLDatabase } from "../meta-merger/cf-worker-abstract-sql.js";
import { CFDObjSQLDatabase } from "./cf-dobj-abstract-sql.js";
import { Env } from "./env.js";
import { WSRoom } from "../ws-room.js";
import { FPBackendDurableObject, FPRoomDurableObject } from "./server.js";

const startedChs = new KeyedResolvOnce<CFHonoServer>();

export function getBackendDurableObject(env: Env) {
  // console.log("getDurableObject", env);
  const cfBackendKey = env.CF_BACKEND_KEY ?? "FP_BACKEND_DO";
  const rany = env as unknown as Record<string, DurableObjectNamespace<FPBackendDurableObject>>;
  const dObjNs = rany[cfBackendKey];
  const id = dObjNs.idFromName(env.FP_BACKEND_DO_ID ?? cfBackendKey);
  return dObjNs.get(id);
}

export function getRoomDurableObject(env: Env) {
  // console.log("getDurableObject", env);
  const cfBackendKey = env.CF_BACKEND_KEY ?? "FP_WS_ROOM";
  const rany = env as unknown as Record<string, DurableObjectNamespace<FPRoomDurableObject>>;
  const dObjNs = rany[cfBackendKey];
  const id = dObjNs.idFromName(cfBackendKey);
  return dObjNs.get(id);
}

class CFWSRoom implements WSRoom {
  readonly dobj: DurableObjectStub<FPRoomDurableObject>;
  constructor(dobj: DurableObjectStub<FPRoomDurableObject>) {
    this.dobj = dobj;
  }
  async acceptConnection(ws: WebSocket, wse: WSEvents): Promise<void> {
    const ret = await this.dobj.acceptWebSocket(ws, wse);
    const wsCtx = new WSContext(ws as WSContextInit);
    wse.onOpen?.({} as Event, wsCtx);
    // return Promise.resolve();
    // ws.accept();
    return ret;
  }
}

export class CFHonoFactory implements HonoServerFactory {
  readonly _onClose: () => void;
  constructor(
    onClose: () => void = () => {
      /* */
    }
  ) {
    this._onClose = onClose;
  }
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  inject(c: Context, fn: (rt: RunTimeParams) => Promise<Response | void>): Promise<Response | void> {
    // this._env = c.env
    const sthis = ensureSuperThis({
      logger: new LoggerImpl(),
    });
    sthis.env.sets(c.env);
    const logger = ensureLogger(sthis, `CFHono[${URI.from(c.req.url).pathname}]`);
    const ende = jsonEnDe(sthis);
    // this.sthis.env.
    const fpProtocol = sthis.env.get("FP_PROTOCOL");
    const msgP = defaultMsgParams(sthis, {
      hasPersistent: true,
      protocolCapabilities: fpProtocol ? (fpProtocol === "ws" ? ["stream"] : ["reqRes"]) : ["reqRes", "stream"],
    });
    const gs = defaultGestalt(msgP, {
      id: fpProtocol ? (fpProtocol === "http" ? "HTTP-server" : "WS-server") : "FP-CF-Server",
    });

    const wsRoom = new CFWSRoom(c.env);
    const cfBackendMode = c.env.CF_BACKEND_MODE && c.env.CF_BACKEND_MODE === "DURABLE_OBJECT" ? "DURABLE_OBJECT" : "D1";
    let db: SQLDatabase;
    switch (cfBackendMode) {
      case "DURABLE_OBJECT": {
        db = new CFDObjSQLDatabase(getBackendDurableObject(c.env));
        const chs = new CFHonoServer(sthis, logger, ende, gs, db, wsRoom);
        // TODO WE NEED TO START THE DURABLE OBJECT
        // but then on every request we import the schema
        return chs.start().then((chs) => fn({ sthis, logger, ende, impl: chs }));
      }
      // break;
      case "D1":
      default: {
        const cfBackendKey = c.env.CF_BACKEND_KEY ?? "FP_BACKEND_D1";
        return startedChs
          .get(cfBackendKey)
          .once(async () => {
            db = new CFWorkerSQLDatabase(c.env[cfBackendKey] as D1Database);
            const chs = new CFHonoServer(sthis, logger, ende, gs, db, wsRoom);
            await chs.start();
            return chs;
          })
          .then((chs) => fn({ sthis, logger, ende, impl: chs }));
      }
      // break;
    }
    // return ret; // .then((v) => sthis.logger.Flush().then(() => v))
  }

  async start(_app: Hono): Promise<void> {
    // const { upgradeWebSocket } = await import("hono/cloudflare-workers");
    // this._upgradeWebSocket = upgradeWebSocket;
  }

  async serve<T>(_app: Hono, _port?: number): Promise<T> {
    return {} as T;
  }
  async close(): Promise<void> {
    this._onClose();
    return;
  }
}

export class CFHonoServer extends HonoServerBase {
  // _upgradeWebSocket?: UpgradeWebSocket

  readonly ende: EnDeCoder;
  // readonly env: Env;
  // readonly wsConnections = new Map<string, WSPair>()
  constructor(
    sthis: SuperThis,
    logger: Logger,
    ende: EnDeCoder,
    gs: Gestalt,
    sqlDb: SQLDatabase,
    wsRoom: WSRoom,
    headers?: HttpHeader
  ) {
    super(sthis, logger, gs, sqlDb, wsRoom, headers);
    this.ende = ende;
    // this.env = env;
  }

  // getDurableObject(conn: Connection) {
  //     const id = env.FP_META_GROUPS.idFromName("fireproof");
  //     const stub = env.FP_META_GROUPS.get(id);
  // }

  upgradeWebSocket(createEvents: (c: Context) => WSEvents | Promise<WSEvents>): ConnMiddleware {
    // if (!this._upgradeWebSocket) {
    //   throw new Error("upgradeWebSocket not implemented");
    // }
    return async (conn, c, _next) => {
      const upgradeHeader = c.req.header("Upgrade");
      if (!upgradeHeader || upgradeHeader !== "websocket") {
        return new Response(
          this.ende.encode(buildErrorMsg(this.sthis, this.logger, {}, new Error("expected Upgrade: websocket"))),
          { status: 426 }
        );
      }
      // const env = c.env as Env;
      // const id = env.FP_META_GROUPS.idFromName([conn.key.tenant, conn.key.ledger].join(":"));
      // const dObj = env.FP_META_GROUPS.get(id);
      // c.env.WS_EVENTS = createEvents(c);
      // return dObj.fetch(c.req.raw as unknown as CFRequestInfo) as unknown as Promise<Response>;
      // this._upgradeWebSocket!(createEvents)(c, next);

      const { 0: client, 1: server } = new WebSocketPair();
      conn.attachWSPair({ client, server });

      const wsEvents = await createEvents(c);
      // console.log("upgradeWebSocket", c.req.url);

      // const wsCtx = new WSContext(server as WSContextInit);

      // server.onopen = (ev) => {
      //   console.log("onopen", ev);
      //   wsEvents.onOpen?.(ev, wsCtx);
      // }

      await this.wsRoom.acceptConnection(server, wsEvents);

      // server.send("Hello from server");

      // this.wsConnections.set(this.sthis.nextId().str, { client, server });
      // const client = webSocketPair[0],
      //   server = webSocketPair[1];

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    };
  }
}
