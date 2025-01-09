// import { DurableObject } from "cloudflare:workers";
import { SQLDatabase, sqliteCoerceParams, SQLParams, SQLStatement } from "../meta-merger/abstract-sql.js";
// import { Env } from "./env.js";
import { ExecSQLResult, FPDurableObject } from "./server.js";

export class CFDObjSQLStatement implements SQLStatement {
  readonly sql: string;
  readonly db: CFDObjSQLDatabase;
  constructor(db: CFDObjSQLDatabase, sql: string) {
    this.db = db;
    this.sql = sql;
  }
  async run<T>(...params: SQLParams): Promise<T> {
    const res = (await this.db.dobj.execSql(this.sql, sqliteCoerceParams(params))) as ExecSQLResult;
    return res.rawResults[0] as T;
  }
  async all<T>(...params: SQLParams): Promise<T[]> {
    const res = (await this.db.dobj.execSql(this.sql, sqliteCoerceParams(params))) as ExecSQLResult;
    return res.rawResults as T[];
  }
}

export class CFDObjSQLDatabase implements SQLDatabase {
  readonly dobj: DurableObjectStub<FPDurableObject>;
  constructor(dobj: DurableObjectStub<FPDurableObject>) {
    this.dobj = dobj;
  }
  prepare(sql: string): SQLStatement {
    return new CFDObjSQLStatement(this, sql);
  }
}

// export class FPDurableObject extends DurableObject<Env> {
//   // readonly sessions: Map<WebSocket, FPMetaGroup> = new Map<WebSocket, FPMetaGroup>();
//   // readonly lastMetaByTendant = new Map<string, ReqRes<ReqPutMeta, ResPutMeta>[]>();
//   // readonly wsEvents: WSEvents = {};

//   // injectWSEvents(wsEvents: WSEvents): void {
//   //   Object.assign(this.wsEvents, wsEvents);
//   // }
//   // getSQLDatabase(): SQLDatabase {
//     // return this._cfDObjSQLDatabase;
//   // }

//   async execSql(sql: string, params: unknown[]): Promise<unknown> {
//     console.log("execSql", sql, params);
//     const stmt = await this.ctx.storage.sql.exec(sql, params);
//     return stmt;
//   }

//   // webSocketError(_ws: WebSocket, error: unknown): void | Promise<void> {
//     // this.logger.Error().Any("error", error).Msg("webSocketError");
//     // this.env.WS_EVENTS.onError?.(error as Event, {} as WSContext);
//   // }

//   // async webSocketMessage(ws: WebSocket, msg: string | ArrayBuffer): Promise<void> {
//     // this.env.WS_EVENTS.onMessage?.({ data: msg } as MessageEvent, ws as unknown as WSContext);
//     // if (typeof msg !== "string") {
//     //   this.logger.Error().Any("fromWS", msg).Msg("webSocketMessage:binary");
//     //   return;
//     // }

//     // return CFMsgProcessor.dispatch(
//     //   () => JSON.parse(msg.toString()),
//     //   { env: this.env },
//     //   async (req: MsgBase, ictx: CFCtxBase) => {
//     //     if (req.auth) {
//     //       // do ucan magic
//     //     }
//     //     let group = (ws.deserializeAttachment() || { qs: {} }) as FPMetaGroup;
//     //     group = {
//     //       ...group,
//     //       qs: {
//     //         ...group.qs,
//     //         q: {
//     //           ...group.qs.q,
//     //           [req.type]: {
//     //             msgSeq: group.qs?.q?.[req.type]?.msgSeq + 1,
//     //           },
//     //         },
//     //       },
//     //       connId: group.connId || this.env.FP_META_GROUPS.newUniqueId().toString(),
//     //       lastUsed: new Date(),
//     //     } satisfies FPMetaGroup;
//     //     ws.serializeAttachment(group);
//     //     const ctx = { ...ictx, group } satisfies CFCtxWithGroup;
//     //     return { req, ctx };
//     //   }
//     // ).then((qs) => {
//     //   let group = {
//     //     ...qs.ctx.group,
//     //     qs: {
//     //       ...qs.ctx.group.qs,
//     //       s: {
//     //         ...qs.ctx.group.qs.s,
//     //         [qs.req.type]: {
//     //           msgSeq: qs.ctx.group.qs?.s?.[qs.req.type]?.msgSeq + 1,
//     //         },
//     //       },
//     //     },
//     //   } satisfies FPMetaGroup;
//     //   switch (true) {
//     //     case MsgIsReqPutMeta(qs.req) && MsgIsResPutMeta(qs):
//     //       {
//     //         group = { ...group, lastMeta: qs.req } satisfies FPMetaGroup;
//     //         ws.serializeAttachment(group);
//     //         // console.log("putMeta group", group);
//     //         (qs.res as { metas: CRDTEntry[] }).metas = this.updateMeta(
//     //           buildUpdateMetaEvent(qs, {
//     //             connId: qs.res.connId,
//     //             subscriberId: "later-overriden",
//     //           })
//     //         );
//     //         this.logger.Debug().Any("putMeta", qs.res).Msg("webSocketMessage");
//     //       }
//     //       break;
//     //     case MsgIsResSubscribeMeta(qs):
//     //       {
//     //         group = { ...group, group: qs.res } satisfies FPMetaGroup;
//     //         // console.log("subscribeMeta group", group);
//     //         ws.serializeAttachment(group);
//     //         this.updateMeta({
//     //           connId: qs.res.connId,
//     //           subscriberId: "later-overriden",
//     //           tid: qs.res.tid,
//     //           type: "updateMeta",
//     //           key: qs.res.key,
//     //           metaId: "later-overriden",
//     //           metas: [],
//     //           version: qs.res.version,
//     //         });
//     //       }
//     //       break;
//     //   }
//     //   // this.logger.Debug().Any("ws.send", qs).Msg("webSocketMessage");
//     //   ws.send(JSON.stringify(qs.res));
//     // });
//   // }

//   // async fetch(_req: Request): Promise<Response> {
//   //   const { 0: fromClient, 1: toClient } = new WebSocketPair();
//   //   this.ctx.acceptWebSocket(toClient);
//   //   // this.logger.Debug().Msg("fetch");
//   //   this.env.WS_EVENTS.onOpen?.({} as Event, toClient as unknown as WSContext);
//   //   return new Response(null, {
//   //     status: 101,
//   //     webSocket: fromClient,
//   //   });

//   //   // const path = URI.from(req.url).pathname;
//   //   // switch (path) {
//   //   //   case "/fp": {
//   //   //     const rq = await CFMsgProcessor.dispatch(() => req.json(), { env: this.env });
//   //   //     return json(rq.res, MsgIsQSError(rq) ? 422 : 200);
//   //   //   }
//   //   //   case "/ws": {
//   //   //     const upgradeHeader = req.headers.get("Upgrade");
//   //   //     if (!upgradeHeader || upgradeHeader !== "websocket") {
//   //   //       return new Response("Durable Object expected Upgrade: websocket", { status: 426 });
//   //   //     }
//   //   //     const { 0: fromClient, 1: toClient } = new WebSocketPair();
//   //   //     this.ctx.acceptWebSocket(toClient);
//   //   //     // this.logger.Debug().Msg("fetch");
//   //   //     return new Response(null, {
//   //   //       status: 101,
//   //   //       webSocket: fromClient,
//   //   //     });
//   //   //   }
//   //   //   default: {
//   //   //     const logger = ensureLogger(this.env);
//   //   //     return json(buildErrorMsg(logger, { tid: "internal" }, new NotFoundError(`Notfound:${path}`)), 404);
//   //   //   }
//   //   // }
//   //   // return new Response("Not implemented", { status: 501 });
//   // }

//   // webSocketClose(ws: WebSocket, code: number, reason: string): void | Promise<void> {
//   //   try {
//   //     // if (typeof this.env.WS_EVENTS.onClose === "function") {
//   //     this.env.WS_EVENTS.onClose?.({ code, reason } as CloseEvent, {} as WSContext);
//   //     // }
//   //     ws.close(code, reason);
//   //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   //   } catch (e) {
//   //     // ignore
//   //   } finally {
//   //     this.logger.Debug().Str("code", code.toString()).Str("reason", reason).Msg("webSocketClose");
//   //   }
//   // }

//   // updateMeta(up: UpdateMetaEvent, ctx: CtxWithGroup): void {
//   //   const wsSocks = ctx.dobj.getWebSockets();
//   //   const groupWs = wsSocks.map((ws) => ({
//   //     ws,
//   //     group: ws.deserializeAttachment() as FPMetaGroup,
//   //   }));
//   //   const joinedMeta = groupWs.reduce((acc, { group }) => {
//   //     if (group && group.lastMeta) {
//   //       acc.push(...group.lastMeta.metas);
//   //     }
//   //     return acc
//   //   }, [] as CRDTEntry[])
//   //   const now = new Date()
//   //   const joinedQS = {
//   //     req: { ...qs.req, metas: joinedMeta },
//   //     res: qs.res,
//   //   }
//   //     return acc;
//   //   }, [] as CRDTEntry[]);
//   //   if (joinedMeta.length === 0) {
//   //     return [];
//   //   }
//   //   const now = new Date();
//   //   const joinedUp = {
//   //     ...up,
//   //     metas: joinedMeta,
//   //   };
//   //   groupWs.forEach(({ ws, group }) => {
//   //     // console.log("group->", group);
//   //     // group = {
//   //     //   ...group,
//   //     //   msgSeq: (group ? group.msgSeq : 0) + 1,
//   //     // }
//   //     group = {
//   //       ...group,
//   //       qs: {
//   //         ...group.qs,
//   //         s: {
//   //           ...group.qs.s,
//   //           [up.type]: {
//   //             msgSeq: group.qs?.s?.[up.type]?.msgSeq + 1,
//   //           },
//   //         },
//   //       },
//   //       lastUsed: now,
//   //     } satisfies FPMetaGroup;
//   //     ws.serializeAttachment(group);
//   //     const toSend = {
//   //       ...joinedUp,
//   //       subscriberId: group.group.subscriberId,
//   //       connId: group.group.connId,
//   //     };
//   //     this.logger.Debug().Any("event", toSend).Msg("updateMeta");
//   //     ws.send(
//   //       // this is not the best way to do this
//   //       JSON.stringify(toSend)
//   //     );
//   //   });
//   //   return joinedMeta;
//   // }
// }
