import { HttpHeader, Logger, Result, URI } from "@adviser/cement";
import { Context, Hono } from "hono";
import { HonoServerImpl, CORS, ConnMiddleware } from "../hono-server.js";
import { WSEvents } from "hono/ws";
import { buildErrorMsg, EnDeCoder } from "../msg-types.js";
import { ensureLogger, SuperThis } from "@fireproof/core";
import { Env } from "./env.js";
import { RequestInfo as CFRequestInfo } from "@cloudflare/workers-types";
import { calculatePreSignedUrl, PreSignedConnMsg } from "../pre-signed-url.js";

export class CFHonoServer implements HonoServerImpl {
  // _upgradeWebSocket?: UpgradeWebSocket

  readonly headers: HttpHeader;
  readonly sthis: SuperThis;
  readonly logger: Logger;
  readonly ende: EnDeCoder;
  readonly env: Env;
  constructor(sthis: SuperThis, ende: EnDeCoder, env: Env, headers?: HttpHeader) {
    this.headers = HttpHeader.from(headers).Merge(CORS);
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "CFHonoServer");
    this.ende = ende;
    this.env = env;
  }

  // getDurableObject(conn: Connection) {
  //     const id = env.FP_META_GROUPS.idFromName("fireproof");
  //     const stub = env.FP_META_GROUPS.get(id);
  // }
  calculatePreSignedUrl(p: PreSignedConnMsg): Promise<Result<URI>> {
    return calculatePreSignedUrl(p, {
      storageUrl: URI.from(this.env.STORAGE_URL),
      aws: {
        accessKeyId: this.env.ACCESS_KEY_ID,
        secretAccessKey: this.env.SECRET_ACCESS_KEY,
        region: this.env.REGION,
      },
    });
  }

  upgradeWebSocket(createEvents: (c: Context) => WSEvents | Promise<WSEvents>): ConnMiddleware {
    // if (!this._upgradeWebSocket) {
    //   throw new Error("upgradeWebSocket not implemented");
    // }
    return async (conn, c, _next) => {
      const upgradeHeader = c.req.header("Upgrade");
      if (!upgradeHeader || upgradeHeader !== "websocket") {
        return new Response(
          this.ende.encode(
            buildErrorMsg(this.sthis, this.logger, {}, new Error("Durable Object expected Upgrade: websocket"))
          ),
          { status: 426 }
        );
      }
      const env = c.env as Env;
      const id = env.FP_META_GROUPS.idFromName([conn.key.tenant, conn.key.ledger].join(":"));
      const dObj = env.FP_META_GROUPS.get(id);
      c.env.WS_EVENTS = createEvents(c);
      return dObj.fetch(c.req.raw as unknown as CFRequestInfo) as unknown as Promise<Response>;
      // this._upgradeWebSocket!(createEvents)(c, next);
    };
  }

  async start(_app: Hono): Promise<void> {
    // const { upgradeWebSocket } = await import("hono/cloudflare-workers");
    // this._upgradeWebSocket = upgradeWebSocket;
  }

  async serve<T>(_app: Hono, _port?: number): Promise<T> {
    return {} as T;
  }
  async close(): Promise<void> {
    return;
  }
}
