import { HttpHeader, Logger, LoggerImpl, ResolveOnce, URI } from "@adviser/cement";
import { Context, Hono } from "hono";
import { ConnMiddleware, HonoServerFactory, RunTimeParams, HonoServerBase } from "../hono-server.js";
import { WSContext, WSContextInit, WSEvents } from "hono/ws";
import { buildErrorMsg, defaultGestalt, EnDeCoder, Gestalt } from "../msg-types.js";
// import { RequestInfo as CFRequestInfo } from "@cloudflare/workers-types";
import { defaultMsgParams, jsonEnDe } from "../msger.js";
import { ensureLogger, ensureSuperThis, SuperThis } from "@fireproof/core";
import { SQLDatabase } from "../meta-merger/abstract-sql.js";
import { CFWorkerSQLDatabase } from "../meta-merger/cf-worker-abstract-sql.js";

// function ensureLogger(env: Env, module = "Fireproof"): Logger {
//   const logger = new LoggerImpl()
//     .With()
//     .Module(module)
//     .SetDebug(env.FP_DEBUG)
//     .SetExposeStack(!!env.FP_STACK || false);
//   switch (env.FP_FORMAT) {
//     case "jsonice":
//       logger.SetFormatter(new JSONFormatter(logger.TxtEnDe(), 2));
//       break;
//     case "yaml":
//       logger.SetFormatter(new YAMLFormatter(logger.TxtEnDe(), 2));
//       break;
//     case "json":
//     default:
//       logger.SetFormatter(new JSONFormatter(logger.TxtEnDe()));
//       break;
//   }
//   return logger.Logger();
// }

const startedChs = new ResolveOnce<CFHonoServer>();

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
    const ret = startedChs
      .once(async () => {
        const db = new CFWorkerSQLDatabase(c.env.DB);
        const chs = new CFHonoServer(sthis, logger, ende, gs, db);
        await chs.start();
        return chs;
      })
      .then((chs) => fn({ sthis, logger, ende, impl: chs }));
    return ret; // .then((v) => sthis.logger.Flush().then(() => v))
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
    headers?: HttpHeader
  ) {
    super(sthis, logger, gs, sqlDb, headers);
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

      const wsCtx = new WSContext(server as WSContextInit);

      // server.onopen = (ev) => {
      //   console.log("onopen", ev);
      //   wsEvents.onOpen?.(ev, wsCtx);
      // }
      server.onerror = (err) => {
        // console.log("onerror", err);
        wsEvents.onError?.(err, wsCtx);
      };
      server.onclose = (ev) => {
        // console.log("onclose", ev);
        wsEvents.onClose?.(ev, wsCtx);
      };
      server.onmessage = (evt) => {
        // console.log("onmessage", evt);
        // wsCtx.send("Hellox from server");
        wsEvents.onMessage?.(evt, wsCtx);
      };
      server.accept();

      wsEvents.onOpen?.({} as Event, wsCtx);

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
