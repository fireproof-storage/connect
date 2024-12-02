// / <reference types="@cloudflare/workers-types" />
import type { Env } from "./env";
import { exception2Result, Logger, LoggerImpl, URI } from "@adviser/cement";
import {
  buildErrorMsg,
  buildResDelMeta,
  buildResGetMeta,
  buildResPutMeta,
  buildResSignedUrl,
  buildResSubscriptMeta,
  buildUpdateMetaEvent,
  ErrorMsg,
  MsgBase,
  MsgIsQSError,
  MsgIsReqDelMeta,
  MsgIsReqGetMeta,
  MsgIsReqPutMeta,
  MsgIsReqSignedUrl,
  MsgIsReqSubscribeMeta,
  MsgIsResPutMeta,
  MsgIsResSubscribeMeta,
  ReqDelMeta,
  ReqGetMeta,
  ReqOptRes,
  ReqPutMeta,
  ReqRes,
  ReqSignedUrl,
  ReqSubscribeMeta,
  ResDelMeta,
  ResGetMeta,
  ResPutMeta,
  ResSignedUrl,
  ResSubscribeMeta,
  UpdateMetaEvent,
} from "../msg-types";
// import { Hono } from "hono";
import { CRDTEntry, NotFoundError } from "@fireproof/core";
// import { DurableObject } from "cloudflare:workers";
import { DurableObject } from "cloudflare:workers";
import { calculatePreSignedUrl } from "../pre-signed-url";

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS,PUT,DELETE",
  "Access-Control-Max-Age": "86400", // Cache pre-flight response for 24 hours
};

function json<T>(data: T, status = 200) {
  return Response.json(data, { status, headers: CORS });
}

function ensureLogger(env: Env, module = "Fireproof"): Logger {
  return (
    new LoggerImpl()
      .With()
      .Module(module)
      .SetDebug(env.FP_DEBUG)
      // .SetFormatter((env.FP_FORMAT || "json") as LogFormatter)
      .SetExposeStack(!!env.FP_STACK || false)
      .Logger()
  );
}

interface FPMetaGroup {
  readonly group: ResSubscribeMeta;
  readonly connId: string;
  readonly msgSeq: number;
  readonly lastUsed: Date;
  readonly lastMeta: ReqPutMeta;
}

// interface NextId {
//   nextId: SuperThis["nextId"];
// }
// class NextIdImpl implements  NextId {
//     nextId(bytes = 6): { str: string; bin: Uint8Array } {
//       const buf = new Uint8Array(bytes);
//       const bin = crypto.getRandomValues(buf);
//       return {
//         str: base58btc.encode(bin),
//         bin,
//       };
//     }
// }

// const sthis = new NextIdImpl();

export class FPMetaGroups extends DurableObject<Env> {
  // readonly sessions: Map<WebSocket, FPMetaGroup> = new Map<WebSocket, FPMetaGroup>();
  // readonly lastMetaByTendant = new Map<string, ReqRes<ReqPutMeta, ResPutMeta>[]>();

  readonly logger: Logger;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.logger = ensureLogger(env, "FPMetaGroups");
    // this.ctx.getWebSockets().forEach((webSocket) => {
    //   const fpMetaGroup = webSocket.deserializeAttachment() as FPMetaGroup;
    //   if (MsgIsResSubscribeMeta(fpMetaGroup.group)) {
    //     this.sessions.set(webSocket, fpMetaGroup);
    //   }
    // });
  }

  async webSocketMessage(ws: WebSocket, msg: string | ArrayBuffer): Promise<void> {
    if (typeof msg !== "string") {
      this.logger.Error().Any("fromWS", msg).Msg("webSocketMessage:binary");
      return;
    }

    return CFMsgProcessor.dispatch(
      () => JSON.parse(msg.toString()),
      {
        env: this.env,
        dobj: this.ctx,
      },
      async (req: MsgBase, ictx: CtxBase) => {
        if (req.auth) {
          // do ucan magic
        }
        let group = (ws.deserializeAttachment() || { msgSeq: 0 }) as FPMetaGroup;
        group = {
          ...group,
          msgSeq: group.msgSeq + 1,
          connId: group.connId || this.env.FP_META_GROUPS.newUniqueId().toString(),
          lastUsed: new Date(),
        } satisfies FPMetaGroup;
        ws.serializeAttachment(group);
        const ctx = { ...ictx, group } satisfies CtxWithGroup;
        return { req, ctx };
      }
    ).then((qs) => {
      switch (true) {
        case MsgIsReqPutMeta(qs.req) && MsgIsResPutMeta(qs): {
          const group = { ...qs.ctx.group, lastMeta: qs.req } satisfies FPMetaGroup;
          ws.serializeAttachment(group);
          this.updateMeta(
            buildUpdateMetaEvent(qs, {
              connId: qs.res.connId,
              subscriberId: "later-overriden",
            }),
            qs.ctx
          );
          break;
        }
        case MsgIsResSubscribeMeta(qs): {
          const group = { ...qs.ctx.group, group: qs.res } satisfies FPMetaGroup;
          ws.serializeAttachment(group);
          this.updateMeta(
            {
              connId: qs.res.connId,
              subscriberId: "later-overriden",
              tid: qs.res.tid,
              type: "updateMeta",
              key: qs.res.key,
              metaId: "later-overriden",
              metas: [],
              version: qs.res.version,
            },
            qs.ctx
          );
          break;
        }
      }
      ws.send(JSON.stringify(qs.res));
    });
  }

  async fetch(req: Request): Promise<Response> {
    const path = URI.from(req.url).pathname;
    switch (path) {
      case "/fp": {
        const rq = await CFMsgProcessor.dispatch(() => req.json(), { env: this.env, dobj: this.ctx });
        return json(rq.res, MsgIsQSError(rq) ? 422 : 200);
      }
      case "/ws": {
        const upgradeHeader = req.headers.get("Upgrade");
        if (!upgradeHeader || upgradeHeader !== "websocket") {
          return new Response("Durable Object expected Upgrade: websocket", { status: 426 });
        }
        const { 0: fromClient, 1: toClient } = new WebSocketPair();
        this.ctx.acceptWebSocket(toClient);
        this.logger.Debug().Msg("fetch");
        return new Response(null, {
          status: 101,
          webSocket: fromClient,
        });
      }
      default: {
        const logger = ensureLogger(this.env);
        return json(buildErrorMsg(logger, { tid: "internal" }, new NotFoundError(`Notfound:${path}`)), 404);
      }
    }
  }

  webSocketClose(ws: WebSocket, code: number, reason: string): void | Promise<void> {
    try {
      ws.close(code, reason);
    } finally {
      this.logger.Debug().Str("code", code.toString()).Str("reason", reason).Msg("webSocketClose");
    }
  }

  // updateMeta(qs: ReqResCtx<ReqPutMeta, ResPutMeta, CtxWithGroup>): void {
  updateMeta(up: UpdateMetaEvent, ctx: CtxWithGroup): void {
    const wsSocks = ctx.dobj.getWebSockets();
    const groupWs = wsSocks.map((ws) => ({
      ws,
      group: ws.deserializeAttachment() as FPMetaGroup,
    }));
    const joinedMeta = groupWs.reduce((acc, { group }) => {
      if (group && group.lastMeta) {
        acc.push(...group.lastMeta.metas);
      }
      return acc;
    }, [] as CRDTEntry[]);
    const now = new Date();
    const joinedUp = {
      ...up,
      metas: joinedMeta,
    };
    groupWs.forEach(({ ws, group }) => {
      ws.serializeAttachment({
        ...group,
        msgSeq: group.msgSeq + 1,
        lastUsed: now,
      } satisfies FPMetaGroup);
      ws.send(
        // this is not the best way to do this
        JSON.stringify({
          ...joinedUp,
          subscriberId: group.group.subscriberId,
          connId: group.group.connId,
        })
      );
    });
  }
}

// const app = new Hono<{ Bindings: Env }>();

interface MsgProcessor {
  dispatch<Q extends MsgBase, S extends MsgBase, C extends CtxBase>(
    decodeFn: () => Promise<unknown>
  ): Promise<ReqResCtx<Q, S | ErrorMsg, C>>;

  signedUrl(req: ReqSignedUrl, ctx: CtxBase): Promise<ResSignedUrl | ErrorMsg>;
  subscribeMeta(req: ReqSubscribeMeta, ctx: CtxBase): Promise<ResSubscribeMeta | ErrorMsg>;

  delMeta(req: ReqDelMeta, ctx: CtxBase): Promise<ResDelMeta | ErrorMsg>;
  putMeta(req: ReqPutMeta, ctx: CtxBase): Promise<ResPutMeta | ErrorMsg>;
  getMeta(req: ReqGetMeta, ctx: CtxBase): Promise<ResGetMeta | ErrorMsg>;
}

interface CFMsgProcessorParams {
  readonly env: Env;
  readonly logger: Logger;
}

interface CtxBaseParam {
  readonly env: Env;
  readonly module?: string;
  readonly dobj: DurableObjectState;
}

interface CtxBase {
  readonly dobj: DurableObjectState;
  readonly env: Env;
  readonly logger: Logger;
}

type CtxWithGroup = CtxBase & { readonly group: FPMetaGroup };

interface ReqOptResCtx<Q extends MsgBase, S extends MsgBase, C extends CtxBase> extends ReqOptRes<Q, S> {
  readonly ctx?: C;
}

interface ReqResCtx<Q extends MsgBase, S extends MsgBase, C extends CtxBase> extends ReqRes<Q, S> {
  readonly ctx: C;
}

class CFMsgProcessor implements MsgProcessor {
  private readonly env: Env;
  private readonly logger: Logger;

  static dispatch<Q extends MsgBase, S extends MsgBase, C extends CtxBase>(
    decodeFn: () => Promise<unknown>,
    ctx: CtxBaseParam,
    reqFn?: (msg: Q, ctx: C) => Promise<ReqOptResCtx<Q, S, C>>
  ): Promise<ReqResCtx<Q, S | ErrorMsg, C>> {
    return new CFMsgProcessor({
      env: ctx.env,
      logger: ensureLogger(ctx.env, ctx.module || "CFMsgProcessor"),
    }).dispatch<Q, S, C>(decodeFn, reqFn);
  }

  constructor(cfp: CFMsgProcessorParams) {
    this.env = cfp.env;
    this.logger = cfp.logger;
  }

  async dispatch<Q extends MsgBase, S extends MsgBase, C extends CtxBase>(
    decodeFn: () => Promise<unknown>,
    reqFn: (msg: Q, ctx: C) => Promise<ReqOptResCtx<Q, S, C>> = async (req) => ({ req })
  ): Promise<ReqResCtx<Q, S | ErrorMsg, C>> {
    const ictx = {
      env: this.env,
      logger: this.logger,
    } as CtxBase;
    const rReqMsg = await exception2Result(async () => (await decodeFn()) as Q);
    if (rReqMsg.isErr()) {
      const errMsg = buildErrorMsg(this.logger, { tid: "internal" } as MsgBase, rReqMsg.Err());
      return {
        req: errMsg as unknown as Q,
        res: errMsg,
        ctx: ictx as C,
      };
    }
    const { req, ctx: optCtx } = await reqFn(rReqMsg.Ok() as Q, ictx as C);
    const ctx = { ...ictx, ...optCtx } as C & { readonly group: FPMetaGroup };
    switch (true) {
      case MsgIsReqSignedUrl(req):
        return {
          req,
          res: (await this.signedUrl(req, ctx)) as S | ErrorMsg,
          ctx,
        };
      case MsgIsReqSubscribeMeta(req):
        return {
          req,
          res: (await this.subscribeMeta(req, ctx)) as S | ErrorMsg,
          ctx,
        };
      case MsgIsReqPutMeta(req):
        return {
          req,
          res: (await this.putMeta(req, ctx)) as S | ErrorMsg,
          ctx,
        };
      case MsgIsReqGetMeta(req):
        return {
          req,
          res: (await this.getMeta(req, ctx)) as S | ErrorMsg,
          ctx,
        };
      case MsgIsReqDelMeta(req):
        return {
          req,
          res: (await this.delMeta(req, ctx)) as S | ErrorMsg,
          ctx,
        };
    }
    return {
      req: req,
      res: buildErrorMsg(this.logger, req, new Error(`unknown msg.type=${req.type}`)) as S | ErrorMsg,
      ctx,
    };
  }

  async delMeta(req: ReqDelMeta, ctx: CtxWithGroup): Promise<ResDelMeta | ErrorMsg> {
    // delete meta does nothing in this implementation
    // if you delete meta basically you are deleting the whole ledger
    return buildResDelMeta(req, {
      params: req.params,
      status: "unsupported",
      connId: ctx.group.connId,
    });
  }

  async getMeta(req: ReqGetMeta, _ctx: CtxWithGroup): Promise<ResGetMeta | ErrorMsg> {
    const rSignedUrl = await calculatePreSignedUrl(
      {
        tid: req.tid,
        type: "reqSignedUrl",
        version: req.version,
        params: { ...req.params, method: "GET" },
      },
      this.env
    );
    if (rSignedUrl.isErr()) {
      return buildErrorMsg(this.logger, req, rSignedUrl.Err());
    }
    return buildResGetMeta(req, {
      signedGetUrl: rSignedUrl.Ok().toString(),
      status: "found",
      metas: [],
      connId: "",
    });
  }

  async putMeta(req: ReqPutMeta, ctx: CtxWithGroup): Promise<ResPutMeta | ErrorMsg> {
    const rSignedUrl = await calculatePreSignedUrl(
      {
        tid: req.tid,
        type: "reqSignedUrl",
        version: req.version,
        params: { ...req.params, method: "PUT" },
      },
      this.env
    );
    if (rSignedUrl.isErr()) {
      return buildErrorMsg(this.logger, req, rSignedUrl.Err());
    }
    // roughly time ordered
    return buildResPutMeta(req, {
      metaId: new Date().getTime().toString(),
      metas: req.metas,
      signedPutUrl: rSignedUrl.Ok().toString(),
      connId: ctx.group.connId,
    });
  }

  async signedUrl(req: ReqSignedUrl, _ctx: CtxBase): Promise<ResSignedUrl | ErrorMsg> {
    const rSignedUrl = await calculatePreSignedUrl(req, this.env);
    if (rSignedUrl.isErr()) {
      return buildErrorMsg(this.logger, req, rSignedUrl.Err());
    }
    const resSignedUrl = buildResSignedUrl(req, rSignedUrl.Ok().toString());
    return resSignedUrl;
  }

  async subscribeMeta(req: ReqSubscribeMeta, ctx: CtxWithGroup): Promise<ResSubscribeMeta | ErrorMsg> {
    // console.log("subscribeMeta", req)
    return buildResSubscriptMeta(req, ctx.group);
  }
}

export default {
  async fetch(req, env, _ctx): Promise<Response> {
    const id = env.FP_META_GROUPS.idFromName("fireproof");
    const stub = env.FP_META_GROUPS.get(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return stub.fetch(req as any) as unknown as Promise<Response>;
  },
} satisfies ExportedHandler<Env>;
