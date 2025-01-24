import { WSEvents } from "hono/ws";

export interface WSRoom {
  acceptConnection(ws: WebSocket, wse: WSEvents): Promise<void>;
}
