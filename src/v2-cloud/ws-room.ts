import { WSEvents } from "hono/ws";

export interface WSRoom<CTX> {
  acceptConnection(ws: WebSocket, wse: WSEvents, ctx: CTX): Promise<void>;
}
