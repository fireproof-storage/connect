import { UpgradeWebSocket, WSContext, WSContextInit, WSEvents } from "hono/ws";
import { ConnMiddleware, HonoServerBase, HonoServerFactory, HonoServerImpl, RunTimeParams } from "./hono-server.js";
import { HttpHeader, URI } from "@adviser/cement";
import { Context, Hono } from "hono";
import { ensureLogger, SuperThis } from "@fireproof/core";
import { defaultMsgParams, jsonEnDe } from "./msger.js";
import { defaultGestalt, Gestalt, MsgerParams } from "./msg-types.js";
import { SQLDatabase } from "./meta-merger/abstract-sql.js";
import { WSRoom } from "./ws-room.js";

interface ServerType {
  close(fn: () => void): void;
}

type serveFn = (options: unknown, listeningListener?: ((info: unknown) => void) | undefined) => ServerType;

export interface NodeHonoFactoryParams {
  readonly msgP?: MsgerParams;
  readonly gs?: Gestalt;
  readonly sql: SQLDatabase;
}

const wsConnections = new Map<string, WebSocket>();
class NodeWSRoom implements WSRoom {
  readonly sthis: SuperThis;
  constructor(sthis: SuperThis) {
    this.sthis = sthis;
  }
  acceptConnection(ws: WebSocket, wse: WSEvents): Promise<void> {
    const id = this.sthis.nextId(12).str;
    wsConnections.set(id, ws);

    const wsCtx = new WSContext(ws as WSContextInit);

    ws.onerror = (err) => {
      // console.log("onerror", err);
      wse.onError?.(err, wsCtx);
    };
    ws.onclose = (ev) => {
      // console.log("onclose", ev);
      wse.onClose?.(ev, wsCtx);
    };
    ws.onmessage = (evt) => {
      // console.log("onmessage", evt);
      // wsCtx.send("Hellox from server");
      wse.onMessage?.(evt, wsCtx);
    };

    ws.accept();
    return Promise.resolve();
  }
}

export class NodeHonoFactory implements HonoServerFactory {
  _upgradeWebSocket!: UpgradeWebSocket;
  _injectWebSocket!: (t: unknown) => void;
  _serve!: serveFn;
  _server!: ServerType;
  // _env!: Env;

  readonly sthis: SuperThis;
  readonly params: NodeHonoFactoryParams;
  constructor(sthis: SuperThis, params: NodeHonoFactoryParams) {
    this.sthis = sthis;
    this.params = params;
  }

  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  inject(c: Context, fn: (rt: RunTimeParams) => Promise<Response | void>): Promise<Response | void> {
    // this._env = c.env;
    // const sthis = ensureSuperThis();
    const sthis = this.sthis;
    const logger = ensureLogger(sthis, `NodeHono[${URI.from(c.req.url).pathname}]`);
    const ende = jsonEnDe(sthis);

    const fpProtocol = sthis.env.get("FP_PROTOCOL");
    const msgP =
      this.params.msgP ??
      defaultMsgParams(sthis, {
        hasPersistent: true,
        protocolCapabilities: fpProtocol ? (fpProtocol === "ws" ? ["stream"] : ["reqRes"]) : ["reqRes", "stream"],
      });
    const gs =
      this.params.gs ??
      defaultGestalt(msgP, {
        id: fpProtocol ? (fpProtocol === "http" ? "HTTP-server" : "WS-server") : "FP-CF-Server",
      });
    const wsRoom = new NodeWSRoom(sthis);
    const nhs = new NodeHonoServer(sthis, this, gs, this.params.sql, wsRoom);
    return nhs.start().then((nhs) => fn({ sthis, logger, ende, impl: nhs }));
  }

  async start(app: Hono): Promise<void> {
    try {
      const { createNodeWebSocket } = await import("@hono/node-ws");
      const { serve } = await import("@hono/node-server");
      this._serve = serve as serveFn;
      const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app });
      this._upgradeWebSocket = upgradeWebSocket;
      this._injectWebSocket = injectWebSocket as (t: unknown) => void;
    } catch (e) {
      throw this.sthis.logger.Error().Err(e).Msg("Failed to start NodeHonoFactory").AsError();
    }
  }

  async serve(app: Hono, port: number): Promise<void> {
    await new Promise<void>((resolve) => {
      this._server = this._serve({ fetch: app.fetch, port }, () => {
        this._injectWebSocket(this._server);
        resolve();
      });
    });
  }
  async close(): Promise<void> {
    this._server.close(() => {
      /* */
    });
    // return new Promise((res) => this._server.close(() => res()));
  }
}

export class NodeHonoServer extends HonoServerBase implements HonoServerImpl {
  readonly _upgradeWebSocket: UpgradeWebSocket;
  constructor(
    sthis: SuperThis,
    factory: NodeHonoFactory,
    gs: Gestalt,
    sqldb: SQLDatabase,
    wsRoom: WSRoom,
    headers?: HttpHeader
  ) {
    super(sthis, sthis.logger, gs, sqldb, wsRoom, headers);
    this._upgradeWebSocket = factory._upgradeWebSocket;
  }

  override upgradeWebSocket(createEvents: (c: Context) => WSEvents | Promise<WSEvents>): ConnMiddleware {
    return async (_conn, c, next) => {
      // conn.attachWSPair({ client: c.req, server: c.res });
      return this._upgradeWebSocket(createEvents)(c, next);
    };
  }
}
