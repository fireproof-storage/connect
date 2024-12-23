import { HttpHeader } from "@adviser/cement";
import { Hono } from "hono";
import { UpgradeWebSocket } from "hono/ws";
import { HonoServerImpl, CORS } from "../hono-server.js";

export class CFHonoServer implements HonoServerImpl {
  upgradeWebSocket!: UpgradeWebSocket;

  readonly headers: HttpHeader;
  constructor(headers?: HttpHeader) {
    this.headers = headers ? headers.Clone().Merge(CORS) : CORS.Clone();
    // console.log("CFHonoServer", this.headers.AsHeaderInit())
  }

  async start(_app: Hono): Promise<void> {
    const { upgradeWebSocket } = await import("hono/cloudflare-workers");
    this.upgradeWebSocket = upgradeWebSocket;
  }

  async serve<T>(_app: Hono, _port?: number): Promise<T> {
    return {} as T;
  }
  async close(): Promise<void> {
    return;
  }
}
