// / <reference types="@cloudflare/workers-types" />
// import { Logger } from "@adviser/cement";
// import { Hono } from "hono";
import { DurableObject } from "cloudflare:workers";
import { HonoServer } from "../hono-server.js";
import { Hono } from "hono";
import { Env } from "./env.js";
import { CFHonoFactory } from "./cf-hono-server.js";
import { WSContext, WSContextInit, WSEvents } from "hono/ws";

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

export class FPRoomDurableObject extends DurableObject<Env> {
  private wsEvents?: WSEvents;

  async acceptWebSocket(ws: WebSocket, wsEvents: WSEvents): Promise<void> {
    this.ctx.acceptWebSocket(ws);
    this.wsEvents = wsEvents;
  }

  webSocketError(ws: WebSocket, error: unknown): void | Promise<void> {
    const wsCtx = new WSContext(ws as WSContextInit);
    this.wsEvents?.onError?.(error as Event, wsCtx);
  }

  async webSocketMessage(ws: WebSocket, msg: string | ArrayBuffer): Promise<void> {
    const wsCtx = new WSContext(ws as WSContextInit);
    this.wsEvents?.onMessage?.({ data: msg } as MessageEvent, wsCtx);
  }

  webSocketClose(ws: WebSocket, code: number, reason: string): void | Promise<void> {
    const wsCtx = new WSContext(ws as WSContextInit);
    this.wsEvents?.onClose?.({ code, reason } as CloseEvent, wsCtx);
  }
}
