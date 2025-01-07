import { UpgradeWebSocket, WSEvents } from "hono/ws";
import { ConnMiddleware, CORS, HonoServerBase, HonoServerFactory, RunTimeParams } from "./hono-server.js";
import { HttpHeader, URI } from "@adviser/cement";
import { Context, Hono } from "hono";
import { ensureLogger, SuperThis } from "@fireproof/core";
import { defaultMsgParams, jsonEnDe } from "./msger.js";
import { defaultGestalt, Gestalt, MsgerParams } from "./msg-types.js";

interface ServerType {
  close(fn: () => void): void;
}

type serveFn = (options: unknown, listeningListener?: ((info: unknown) => void) | undefined) => ServerType;

export interface NodeHonoFactoryParams {
  readonly msgP?: MsgerParams;
  readonly gs?: Gestalt;
}

export class NodeHonoFactory implements HonoServerFactory {
  _upgradeWebSocket!: UpgradeWebSocket;
  _injectWebSocket!: (t: unknown) => void;
  _serve!: serveFn;
  _server!: ServerType;
  // _env!: Env;

  readonly sthis: SuperThis;
  readonly params: NodeHonoFactoryParams;
  constructor(sthis: SuperThis, params: NodeHonoFactoryParams = {}) {
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
      this.params.msgP ||
      defaultMsgParams(sthis, {
        hasPersistent: true,
        protocolCapabilities: fpProtocol ? (fpProtocol === "ws" ? ["stream"] : ["reqRes"]) : ["reqRes", "stream"],
      });
    const gs =
      this.params.gs ||
      defaultGestalt(msgP, {
        id: fpProtocol ? (fpProtocol === "http" ? "HTTP-server" : "WS-server") : "FP-CF-Server",
      });

    // this.sthis.env.
    return fn({ sthis, logger, ende, impl: new NodeHonoServer(sthis, this, gs) });
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

export class NodeHonoServer extends HonoServerBase {
  readonly headers: HttpHeader;
  readonly _upgradeWebSocket: UpgradeWebSocket;
  constructor(sthis: SuperThis, factory: NodeHonoFactory, gs: Gestalt, headers?: HttpHeader) {
    super(sthis, sthis.logger, gs);
    this.headers = headers ? headers.Clone().Merge(CORS) : CORS.Clone();
    this._upgradeWebSocket = factory._upgradeWebSocket;
  }

  upgradeWebSocket(createEvents: (c: Context) => WSEvents | Promise<WSEvents>): ConnMiddleware {
    return async (_conn, c, next) => {
      // conn.attachWSPair({ client: c.req, server: c.res });
      return this._upgradeWebSocket(createEvents)(c, next);
    };
  }
}
