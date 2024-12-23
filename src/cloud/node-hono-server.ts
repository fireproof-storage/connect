import { UpgradeWebSocket } from "hono/ws";
import { CORS, HonoServerImpl } from "./hono-server.js";
import { HttpHeader } from "@adviser/cement";
import { Hono } from "hono";

interface ServerType {
  close(fn: () => void): void;
}

type serveFn = (options: unknown, listeningListener?: ((info: unknown) => void) | undefined) => ServerType;

export class NodeHonoServer implements HonoServerImpl {
  upgradeWebSocket!: UpgradeWebSocket;
  _injectWebSocket!: (t: unknown) => void;
  _serve!: serveFn;
  _server!: ServerType;

  readonly headers: HttpHeader;
  constructor(headers?: HttpHeader) {
    this.headers = headers ? headers.Clone().Merge(CORS) : CORS.Clone();
  }

  async start(app: Hono): Promise<void> {
    const { createNodeWebSocket } = await import("@hono/node-ws");
    const { serve } = await import("@hono/node-server");
    this._serve = serve as serveFn;
    const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app });
    this.upgradeWebSocket = upgradeWebSocket;
    this._injectWebSocket = injectWebSocket as (t: unknown) => void;
  }

  async serve(app: Hono, port: number): Promise<void> {
    await new Promise<void>((resolve) => {
      this._server = this._serve({ fetch: app.fetch, port }, () => resolve());
    });
    this._injectWebSocket(this._server);
  }
  async close(): Promise<void> {
    return new Promise((res) => this._server.close(() => res()));
  }
}
