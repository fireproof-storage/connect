// / <reference types="@cloudflare/workers-types" />
// import { Logger } from "@adviser/cement";
// import { Hono } from "hono";
import { DurableObject } from "cloudflare:workers";
import { HonoServer } from "../hono-server.js";
import { Hono } from "hono";
import { Env } from "./env.js";
import { CFHonoFactory } from "./cf-hono-server.js";
import { WSMessageReceive } from "hono/ws";
import { URI } from "@adviser/cement";

const app = new Hono();
const honoServer = new HonoServer(new CFHonoFactory());

export default {
  fetch: async (req, env, ctx): Promise<Response> => {
    await honoServer.register(app);
    return app.fetch(req, env, ctx);
  },
} satisfies ExportedHandler<Env>;
/*
  async fetch(req, env, _ctx): Promise<Response> {
    const id = env.FP_META_GROUPS.idFromName("fireproof");
    const stub = env.FP_META_GROUPS.get(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return stub.fetch(req as any) as unknown as Promise<Response>;
  },
} satisfies ExportedHandler<Env>;
*/

export interface ExecSQLResult {
  readonly rowsRead: number;
  readonly rowsWritten: number;
  readonly rawResults: unknown[];
}

export class FPBackendDurableObject extends DurableObject<Env> {
  async execSql(sql: string, params: unknown[]): Promise<ExecSQLResult> {
    const cursor = await this.ctx.storage.sql.exec(sql, ...params);
    const rawResults = cursor.toArray();
    const res = {
      rowsRead: cursor.rowsRead,
      rowsWritten: cursor.rowsWritten,
      rawResults,
    };
    // console.log("execSql", sql, params, res);
    return res;
  }
}

export interface CFWSEvents {
  readonly onOpen: (evt: Event, ws: WebSocket) => void;
  readonly onMessage: (evt: MessageEvent<WSMessageReceive>, ws: WebSocket) => void;
  readonly onClose: (evt: CloseEvent, ws: WebSocket) => void;
  readonly onError: (evt: Event, ws: WebSocket) => void;
}

export class FPRoomDurableObject extends DurableObject<Env> {
  // wsEvents?: CFWSEvents;

  readonly id = Math.random().toString(36).slice(2);

  // _id!: string;

  async fetch(request: Request): Promise<Response> {
    // console.log("DO-fetch", request.url, request.method, request.headers);
    // Creates two ends of a WebSocket connection.
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    // Calling `acceptWebSocket()` informs the runtime that this WebSocket is to begin terminating
    // request within the Durable Object. It has the effect of "accepting" the connection,
    // and allowing the WebSocket to send and receive messages.
    // Unlike `ws.accept()`, `state.acceptWebSocket(ws)` informs the Workers Runtime that the WebSocket
    // is "hibernatable", so the runtime does not need to pin this Durable Object to memory while
    // the connection is open. During periods of inactivity, the Durable Object can be evicted
    // from memory, but the WebSocket connection will remain open. If at some later point the
    // WebSocket receives a message, the runtime will recreate the Durable Object
    // (run the `constructor`) and deliver the message to the appropriate handler.
    this.ctx.acceptWebSocket(server);

    // server.onopen = () => {
    //   console.log("client onopen");
    // }
    // server.onmessage = (event) => {
    //   console.log("client onmessage", event.data);
    // }
    // server.onclose = (event) => {
    //   console.log("client onclose", event.code, event.reason);
    // }
    // server.onerror = (event) => {
    //   console.log("client onerror", event);
    // }
    // const wss = this.ctx.getWebSockets();

    const id = URI.from(request.url).getParam("ctxId", "none");

    // console.log("DO-ids:", id, this.id);

    this.env.FP_EXPOSE_CTX.wsRoom.applyGetWebSockets(id, () => this.ctx.getWebSockets());
    server.serializeAttachment({ id });

    this.env.FP_EXPOSE_CTX.wsRoom.events.onOpen(id, {} as Event, server);

    // for (const ws of wss) {
    //   ws.setnd(`New WebSocket connection established: ${wss.length}`);
    // }

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  // acceptWebSocket(ws: WebSocket, wsEvents: WSEvents): void {
  //   this.ctx.acceptWebSocket(ws);
  //   this.wsEvents = wsEvents;
  // }

  webSocketOpen(ws: WebSocket): void | Promise<void> {
    const { id } = ws.deserializeAttachment();
    this.env.FP_EXPOSE_CTX.wsRoom.events.onOpen(id, {} as Event, ws);
  }

  webSocketError(ws: WebSocket, error: unknown): void | Promise<void> {
    const { id } = ws.deserializeAttachment();
    this.env.FP_EXPOSE_CTX.wsRoom.events.onError(id, error as Event, ws);
  }

  async webSocketMessage(ws: WebSocket, msg: string | ArrayBuffer): Promise<void> {
    const { id } = ws.deserializeAttachment();
    // console.log("webSocketMessage", msg);
    this.env.FP_EXPOSE_CTX.wsRoom.events.onMessage(id, { data: msg } as MessageEvent, ws);
  }

  webSocketClose(ws: WebSocket, code: number, reason: string): void | Promise<void> {
    const { id } = ws.deserializeAttachment();
    this.env.FP_EXPOSE_CTX.wsRoom.events.onClose(id, { code, reason } as CloseEvent, ws);
  }
}
