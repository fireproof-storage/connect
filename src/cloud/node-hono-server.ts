import { UpgradeWebSocket, WSEvents } from "hono/ws";
import { ConnMiddleware, CORS, HonoServerImpl } from "./hono-server.js";
import { HttpHeader, Result, URI } from "@adviser/cement";
import { Context, Hono } from "hono";
import { calculatePreSignedUrl, PreSignedConnMsg } from "./pre-signed-url.js";
import { Env } from "./backend/env.js";

interface ServerType {
  close(fn: () => void): void;
}

type serveFn = (options: unknown, listeningListener?: ((info: unknown) => void) | undefined) => ServerType;

export class NodeHonoServer implements HonoServerImpl {
  _upgradeWebSocket!: UpgradeWebSocket;
  _injectWebSocket!: (t: unknown) => void;
  _serve!: serveFn;
  _server!: ServerType;

  readonly headers: HttpHeader;
  readonly env: Env;
  constructor(env: Env, headers?: HttpHeader) {
    this.headers = headers ? headers.Clone().Merge(CORS) : CORS.Clone();
    this.env = env;
  }

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
    return async (_conn, c, next) => {
      // conn.attachWSPair({ client: c.req, server: c.res });
      return this._upgradeWebSocket(createEvents)(c, next);
    };
  }

  async start(app: Hono): Promise<void> {
    const { createNodeWebSocket } = await import("@hono/node-ws");
    const { serve } = await import("@hono/node-server");
    this._serve = serve as serveFn;
    const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app });
    this._upgradeWebSocket = upgradeWebSocket;
    this._injectWebSocket = injectWebSocket as (t: unknown) => void;
  }

  async serve(app: Hono, port: number): Promise<void> {
    await new Promise<void>((resolve) => {
      this._server = this._serve({ fetch: app.fetch, port }, () => resolve());
    });
    this._injectWebSocket(this._server);
  }
  async close(): Promise<void> {
    this._server.close(() => {
      /* */
    });
    // return new Promise((res) => this._server.close(() => res()));
  }
}
