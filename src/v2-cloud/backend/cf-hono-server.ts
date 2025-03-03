import { BuildURI, HttpHeader, KeyedResolvOnce, Logger, LoggerImpl, URI } from "@adviser/cement";
import { Context, Hono } from "hono";
import {
  ConnMiddleware,
  HonoServerFactory,
  RunTimeParams,
  HonoServerBase,
  WSEventsConnId,
  WSContextWithId,
} from "../hono-server.js";
import { SendOptions, WSContextInit, WSMessageReceive, WSReadyState } from "hono/ws";
import {
  buildErrorMsg,
  defaultGestalt,
  EnDeCoder,
  Gestalt,
  MsgBase,
  MsgIsWithConn,
  MsgWithConn,
  QSId,
  qsidEqual,
} from "../msg-types.js";
// import { RequestInfo as CFRequestInfo } from "@cloudflare/workers-types";
import { defaultMsgParams, jsonEnDe } from "../msger.js";
import { ensureLogger, ensureSuperThis, SuperThis } from "@fireproof/core";
import { SQLDatabase } from "../meta-merger/abstract-sql.js";
import { CFWorkerSQLDatabase } from "../meta-merger/cf-worker-abstract-sql.js";
import { CFDObjSQLDatabase } from "./cf-dobj-abstract-sql.js";
import { Env } from "./env.js";
import { WSRoom } from "../ws-room.js";
import { FPBackendDurableObject, FPRoomDurableObject } from "./server.js";
import { ConnItem } from "../msg-dispatch.js";

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
  // console.log("getRoomDurableObject", cfBackendKey);
  const dObjNs = rany[cfBackendKey];
  const id = dObjNs.idFromName(cfBackendKey);
  return dObjNs.get(id);
}

function webSocket2WSContextInit(ws: WebSocket): WSContextInit<WebSocket> {
  return {
    send: (data: string | ArrayBuffer, _options: SendOptions): void => {
      ws.send(data);
    },
    close: (code?: number, reason?: string): void => ws.close(code, reason),
    raw: ws,
    readyState: ws.readyState as WSReadyState,
    url: ws.url,
    protocol: ws.protocol,
  };
}

const eventsWithConnId = new Map<
  string,
  {
    getWebSockets?: () => WebSocket[];
    events?: WSEventsConnId<WebSocket>;
  }
>();
class CFWSRoom implements WSRoom {
  readonly sthis: SuperThis;
  readonly id: string;

  readonly eventsWithConnId = eventsWithConnId;

  constructor(sthis: SuperThis) {
    this.sthis = sthis;
    this.id = sthis.nextId(12).str;
  }

  // private _getWebSocketsCtx = (): WebSocket[] => {
  //   throw new Error("Method not ready");
  // }
  applyGetWebSockets(id: string, fn: () => WebSocket[]): void {
    // console.log("applyGetWebSockets", this.id, fn);
    let val = this.eventsWithConnId.get(id);
    if (!val) {
      val = {};
      this.eventsWithConnId.set(id, val);
    }
    val.getWebSockets = fn;
  }

  getConns(conn: QSId): ConnItem<WebSocket>[] {
    if (!this.eventsWithConnId.has(conn.resId)) {
      // eslint-disable-next-line no-console
      console.error("getConns:missing", conn);
      return [];
    }
    const getWebSockets = this.eventsWithConnId.get(conn.resId)?.getWebSockets;
    if (!getWebSockets) {
      // eslint-disable-next-line no-console
      console.error("getConns:missing-getWebSockets", conn);
      return [];
    }
    // console.log("getConns-enter:", this.id);
    try {
      const res = getWebSockets()
        .map((i) => {
          const o = i.deserializeAttachment();
          if (!o.conn) {
            return;
          }

          // console.log("getConns", o);
          return {
            conn: o.conn,
            touched: new Date(),
            ws: new WSContextWithId(o.id, webSocket2WSContextInit(i)),
          } satisfies ConnItem;
        })
        .filter((i) => !!i);
      // console.log("getConns", this.id, res);
      return res ?? [];
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("getConns", e);
      return [];
    }
    // throw new Error("Method not implemented.");
  }
  removeConn(conn: QSId): void {
    const found = this.getConns(conn).find((i) => qsidEqual(i.conn, conn));
    if (!found) {
      return;
    }
    // console.log("removeConn", this.id, conn);
    const s = found.ws.raw?.deserializeAttachment();
    delete s.conn;
    found.ws.raw?.serializeAttachment(s);

    // throw new Error("Method not implemented.");
  }
  addConn(ws: WSContextWithId<WebSocket>, conn: QSId): QSId {
    const x = ws.raw?.deserializeAttachment();
    ws.raw?.serializeAttachment({ ...x, conn });
    // console.log("addConn", this.id, conn);
    // throw new Error("Method not implemented.");
    return conn;
  }
  isConnected(msg: MsgBase): msg is MsgWithConn<MsgBase> {
    if (!MsgIsWithConn(msg)) {
      return false;
    }
    return !!this.getConns(msg.conn).find((i) => qsidEqual(i.conn, msg.conn));
    // // eslint-disable-next-line no-console
    // console.log("isConnected", this.id, this.getWebSockets().length);
    // // throw new Error("Method not implemented.");
    // return true;
  }
  // readonly dobj: DurableObjectStub<FPRoomDurableObject>;
  // constructor(dobj: DurableObjectStub<FPRoomDurableObject>) {
  //   this.dobj = dobj;
  // }

  applyEvents(id: string, events: WSEventsConnId<WebSocket>): void {
    // if (this.eventsWithConnId.has(id)) {
    //   throw new Error("applyEvents:already set");
    // }
    let val = this.eventsWithConnId.get(id);
    if (!val) {
      val = {};
      this.eventsWithConnId.set(id, val);
    }
    val.events = events;
    // console.log("applyEvents", this.id, id);
  }

  readonly events = {
    onOpen: (id: string, evt: Event, ws: WebSocket) => {
      if (!this.eventsWithConnId.has(id)) {
        throw new Error(`applyEvents:onOpen missing not ${id} => ${Array.from(this.eventsWithConnId.keys())}`);
      }
      // const o = ws.deserializeAttachment();
      this.eventsWithConnId.get(id)?.events?.onOpen(evt, new WSContextWithId(id, webSocket2WSContextInit(ws)));
    },
    onMessage: (id: string, evt: MessageEvent<WSMessageReceive>, ws: WebSocket) => {
      if (!this.eventsWithConnId.has(id)) {
        // console.log("onMessaged:Error", this.id);
        throw new Error(`applyEvents:onMessagee missing not ${id}`);
      }
      // const o = ws.deserializeAttachment();
      const wci = new WSContextWithId(id, webSocket2WSContextInit(ws));
      this.eventsWithConnId.get(id)?.events?.onMessage(evt, wci);
      // console.log("onMessaged", this.id);
    },
    onClose: (id: string, evt: CloseEvent, ws: WebSocket) => {
      // console.log("onClosing", ws);
      if (!this.eventsWithConnId.has(id)) {
        throw new Error(`applyEvents:onClose missing not ${id}`);
      }
      // const o = ws.deserializeAttachment();
      this.eventsWithConnId.get(id)?.events?.onClose(evt, new WSContextWithId(id, webSocket2WSContextInit(ws)));
      // console.log("onClosed", this.id);
    },
    onError: (id: string, evt: Event, ws: WebSocket) => {
      // console.log("onError", ws);
      if (!this.eventsWithConnId.has(id)) {
        throw new Error(`applyEvents:onError missing not ${id}`);
      }
      // const o = ws.deserializeAttachment();
      this.eventsWithConnId.get(id)?.events?.onError(evt, new WSContextWithId(id, webSocket2WSContextInit(ws)));
    },
  }; // satisfies CFWSEvents;

  // async acceptConnection(ws: WebSocket, wse: WSEvents, ctx: Env): Promise<void> {
  //   throw new Error("Method not implemented.");
  //   // const dobj = getRoomDurableObject(ctx);
  //   // console.log("acceptConnection", dobj);
  //   // // const ret = dobj.acceptWebSocket(ws, wse);
  //   // const wsCtx = new WSContext(ws as WSContextInit);
  //   // wse.onOpen?.({} as Event, wsCtx);
  //   // // return Promise.resolve();
  //   // // ws.accept();
  //   // return Promise.resolve();
  // }

  // getEvents(): CFWSEvents {
  //   return this.events;
  // }

  // getWebSockets = (): WebSocket[] => {
  //   // console.log("getWebSockets", this.id);
  //   throw new Error("Method not ready");
  // }
  //   applyExposeCtx(ctx: { getWebSockets: () => WebSocket[] }): void {
  //     this.getWebSockets = ctx.getWebSockets;
  //   }
}

export class CFExposeCtx {
  readonly sthis: SuperThis;
  readonly wsRoom: CFWSRoom;
  readonly logger: Logger;
  readonly ende: EnDeCoder;
  readonly gs: Gestalt;
  readonly db: SQLDatabase;

  constructor(sthis: SuperThis, logger: Logger, ende: EnDeCoder, gs: Gestalt, db: SQLDatabase, wsRoom: CFWSRoom) {
    this.sthis = sthis;
    this.logger = logger;
    this.ende = ende;
    this.gs = gs;
    this.db = db;
    this.wsRoom = wsRoom;
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
  async inject(c: Context, fn: (rt: RunTimeParams) => Promise<Response | void>): Promise<Response | void> {
    // this._env = c.env
    const sthis = ensureSuperThis({
      logger: new LoggerImpl(),
    });
    sthis.env.sets(c.env);

    const logger = ensureLogger(sthis, `CFHono[${URI.from(c.req.url).pathname}]`);
    const ende = jsonEnDe(sthis);
    const fpProtocol = sthis.env.get("FP_PROTOCOL");
    const msgP = defaultMsgParams(sthis, {
      hasPersistent: true,
      protocolCapabilities: fpProtocol ? (fpProtocol === "ws" ? ["stream"] : ["reqRes"]) : ["reqRes", "stream"],
    });
    const gs = defaultGestalt(msgP, {
      id: fpProtocol ? (fpProtocol === "http" ? "HTTP-server" : "WS-server") : "FP-CF-Server",
    });

    const cfBackendMode = c.env.CF_BACKEND_MODE && c.env.CF_BACKEND_MODE === "DURABLE_OBJECT" ? "DURABLE_OBJECT" : "D1";
    let db: SQLDatabase;
    let cfBackendKey: string;
    switch (cfBackendMode) {
      case "DURABLE_OBJECT":
        {
          cfBackendKey = c.env.CF_BACKEND_KEY ?? "FP_BACKEND_DO";
          // console.log("DO-CF_BACKEND_KEY", cfBackendKey, c.env[cfBackendKey]);
          db = new CFDObjSQLDatabase(getBackendDurableObject(c.env));
        }
        break;

      case "D1":
      default:
        {
          cfBackendKey = c.env.CF_BACKEND_KEY ?? "FP_BACKEND_D1";
          // console.log("D1-CF_BACKEND_KEY", cfBackendKey, c.env[cfBackendKey]);
          db = new CFWorkerSQLDatabase(c.env[cfBackendKey] as D1Database);
        }
        break;
      // return startedChs
      //   .get(cfBackendKey)
      //   .once(async () => {
      //     const chs = new CFHonoServer(sthis, logger, ende, gs, db, wsRoom);
      //     await chs.start();
      //     return chs;
      //   })
      //   .then((chs) => fn({ sthis, logger, ende, impl: chs }));
      // break;
    }

    const wsRoom = new CFWSRoom(sthis);
    c.env.FP_EXPOSE_CTX = new CFExposeCtx(sthis, logger, ende, gs, db, wsRoom);
    // wsRoom.applyGetWebSockets(c.env.FP_EXPOSE_CTX.getWebSockets);

    // TODO WE NEED TO START THE DURABLE OBJECT
    // but then on every request we import the schema
    // return chs.start().then((chs) => fn({ sthis, logger, ende, impl: chs }));
    return startedChs
      .get(cfBackendKey)
      .once(async () => {
        const chs = new CFHonoServer(sthis, logger, ende, gs, db, wsRoom);
        await chs.start();
        return chs;
      })
      .then((chs) => fn({ sthis, logger, ende, impl: chs, wsRoom }));

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

  upgradeWebSocket(
    createEvents: (c: Context) => WSEventsConnId<WebSocket> | Promise<WSEventsConnId<WebSocket>>
  ): ConnMiddleware {
    // throw new Error("upgradeWebSocket Method not implemented.");
    // if (!this._upgradeWebSocket) {
    //   throw new Error("upgradeWebSocket not implemented");
    // }
    return async (_conn, c, _next) => {
      const upgradeHeader = c.req.header("Upgrade");
      if (!upgradeHeader || upgradeHeader !== "websocket") {
        return new Response(
          this.ende.encode(buildErrorMsg(this.sthis, this.logger, {}, new Error("expected Upgrade: websocket"))),
          { status: 426 }
        );
      }

      // console.log("upgradeWebSocket", Object.keys(_conn));

      //wsRoom.getEvents();
      //wsRoom.applyExposeCtx(c.env.EXPOSE_CTX);

      const id = c.env.FP_EXPOSE_CTX.sthis.nextId().str;
      // console.log("upgradeWebSocket:createEvents: ", id);
      c.env.FP_EXPOSE_CTX.wsRoom.applyEvents(id, await createEvents(c));

      // const { sthis, logger, ende, wsRoom, gs, db } = c.env.EXPOSE_CTX;
      // const chs = new CFHonoServer(sthis, logger, ende, gs, db, wsRoom);
      // await chs.start().then((chs) => fn({ sthis, logger, ende, impl: chs, wsRoom }));

      const url = BuildURI.from(c.req.url).setParam("ctxId", id).toString();

      const dobjRoom = getRoomDurableObject(c.env);
      const ret = dobjRoom.fetch(url, c.req.raw);
      return ret;

      // // const env = c.env as Env;
      // // const id = env.FP_META_GROUPS.idFromName([conn.key.tenant, conn.key.ledger].join(":"));
      // // const dObj = env.FP_META_GROUPS.get(id);
      // // c.env.WS_EVENTS = createEvents(c);
      // // return dObj.fetch(c.req.raw as unknown as CFRequestInfo) as unknown as Promise<Response>;
      // // this._upgradeWebSocket!(createEvents)(c, next);

      // const { 0: client, 1: server } = new WebSocketPair();
      // conn.attachWSPair({ client, server });

      // const wsEvents = await createEvents(c);
      // (this.wsRoom as CFWSRoom).applyEvents(wsEvents);

      // // console.log("applyEvents", c.env.WS_EVENTS);

      // // const wsEvents = await createEvents(c);
      // // console.log("upgradeWebSocket", c.req.url);

      // // const wsCtx = new WSContext(server as WSContextInit);

      // // server.onopen = (ev) => {
      // //   console.log("onopen", ev);
      // //   wsEvents.onOpen?.(ev, wsCtx);
      // // }

      // // await this.wsRoom.acceptConnection(server, wsEvents , c.env);

      // // server.send("Hello from server");

      // // this.wsConnections.set(this.sthis.nextId().str, { client, server });
      // // const client = webSocketPair[0],
      // //   server = webSocketPair[1];

      // return new Response(null, {
      //   status: 101,
      //   webSocket: client,
      // });
    };
  }
}
