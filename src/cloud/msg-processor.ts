import { exception2Result, Logger, Result } from "@adviser/cement";
import {
  buildErrorMsg,
  buildResDelMeta,
  buildResGestalt,
  buildResGetMeta,
  buildResPutMeta,
  ConnectionKey,
  defaultGestalt,
  ErrorMsg,
  getStoreFromType,
  MsgBase,
  MsgIsReqDelData,
  MsgIsReqDelMeta,
  MsgIsReqDelWAL,
  MsgIsReqGestalt,
  MsgIsReqGetData,
  MsgIsReqGetMeta,
  MsgIsReqGetWAL,
  MsgIsReqPutData,
  MsgIsReqPutMeta,
  MsgIsReqPutWAL,
  MsgIsReqSubscribeMeta,
  ReqDelMeta,
  ReqGetMeta,
  ReqOptRes,
  ReqPutMeta,
  ReqRes,
  ResDelMeta,
  ResGetMeta,
  ResPutMeta,
} from "./msg-types.js";
import { calculatePreSignedUrl } from "./pre-signed-url.js";

export type WithErrorMsg<T extends MsgBase> = T | ErrorMsg

export interface CtxBase {
  readonly logger: Logger;
}


export interface ReqOptResCtx<Q extends MsgBase, S extends MsgBase, C extends CtxBase> extends ReqOptRes<Q, S> {
  readonly ctx?: C;
}

export interface ReqResCtx<Q extends MsgBase, S extends MsgBase, C extends CtxBase> extends ReqRes<Q, S> {
  readonly ctx: C;
}


export interface MsgProcessor<O extends CtxBase> {
  dispatch<Q extends MsgBase, S extends MsgBase>(
    decodeFn: () => Promise<unknown>
  ): Promise<ReqResCtx<Q, WithErrorMsg<S>, O>>;

  // signedUrl(req: ReqSignedUrl, ctx: CtxBase): Promise<WithErrorMsg<ResSignedUrl>>;
  // subscribeMeta(req: ReqSubscribeMeta, ctx: CtxBase): Promise<WithErrorMsg<ResSubscribeMeta>>;

  // delMeta(req: ReqDelMeta, ctx: CtxBase): Promise<WithErrorMsg<ResDelMeta>>;
  // putMeta(req: ReqPutMeta, ctx: CtxBase): Promise<WithErrorMsg<ResPutMeta>>;
  // getMeta(req: ReqGetMeta, ctx: CtxBase): Promise<WithErrorMsg<ResGetMeta>>;
}

export interface RequestOpts {
  readonly waitType: string;
  readonly timeout?: number; // ms
}
export interface Connection {
  readonly ws: WebSocket;
  readonly key: ConnectionKey;
  request<T extends MsgBase>(msg: MsgBase, opts: RequestOpts): Promise<Result<T>>;
  onMessage(msgFn: (msg: MsgBase) => void): () => void;
  close(): Promise<void>;
}


export abstract class MsgProcessorBase<I extends CtxBase, O extends CtxBase = I> implements MsgProcessor<O> {

  readonly logger: Logger;
  readonly serverId: string
  readonly ctx: O
  constructor(logger: Logger, ctx: O, serverId: string) {
    this.serverId = serverId
    this.logger = logger
    this.ctx = ctx
  }

  async dispatch<Q extends MsgBase, S extends MsgBase>(
    decodeFn: () => Promise<unknown>,
    reqFn: (msg: Q, ctx: O) => Promise<ReqOptResCtx<Q, S, O>> = async (req) => ({ req })
  ): Promise<ReqResCtx<Q, S | ErrorMsg, O>> {
    const rReqMsg = await exception2Result(async () => (await decodeFn()) as Q);
    if (rReqMsg.isErr()) {
      const errMsg = buildErrorMsg(this.logger, { tid: "internal" } as MsgBase, rReqMsg.Err());
      return {
        req: errMsg as unknown as Q,
        res: errMsg,
        ctx: this.ctx
      };
    }
    const { req, ctx: optCtx } = await reqFn(rReqMsg.Ok() as Q, this.ctx);
    const ctx = { ...(optCtx || this.ctx) }
    switch (true) {
      case MsgIsReqGestalt(req):
        return {
          req,
          res: buildResGestalt(req, defaultGestalt(this.serverId, true)) as S | ErrorMsg,
          ctx,
        };

      case MsgIsReqGetData(req):
      case MsgIsReqGetWAL(req):
        return {
          req,
          res: (await this.signedUrl({
            ...req, params: {
              ...req.params,
              method: "GET",
              store: getStoreFromType(req).store
            }
          }, ctx)) as S | ErrorMsg,
          ctx,
        };

      case MsgIsReqPutData(req):
      case MsgIsReqPutWAL(req):
        if (req.payload) {
          return {
            req,
            res: buildErrorMsg(this.logger, req, new Error("inband payload not implemented")) as S | ErrorMsg,
            ctx,
          };
        }
        return {
          req,
          res: (await this.signedUrl({
            ...req, params: {
              ...req.params,
              method: "PUT",
              store: getStoreFromType(req).store
            }
          }, ctx)) as S | ErrorMsg,
          ctx,
        };

      case MsgIsReqDelData(req):
      case MsgIsReqDelWAL(req):
        return {
          req,
          res: (await this.signedUrl({
            ...req, params: {
              ...req.params,
              method: "DELETE",
              store: getStoreFromType(req).store
            }
          }, ctx)) as S | ErrorMsg,
          ctx,
        };


      // case MsgIsReqSignedUrl(req):
      //   return {
      //     req,
      //     res: (await this.signedUrl(req, ctx)) as S | ErrorMsg,
      //     ctx,
      //   };
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

  async delMeta(req: ReqDelMeta, ctx: CFCtxWithGroup): Promise<ResDelMeta | ErrorMsg> {
    // delete meta does nothing in this implementation
    // if you delete meta basically you are deleting the whole ledger
    return buildResDelMeta(req, {
      params: req.params,
      status: "unsupported",
      connId: ctx.group.connId,
    });
  }

  async getMeta(req: ReqGetMeta, ctx: CF): Promise<ResGetMeta | ErrorMsg> {
    const rSignedUrl = await calculatePreSignedUrl(
      {
        tid: req.tid,
        type: "reqSignedUrl",
        version: req.version,
        params: { ...req.params, method: "GET" },
      },
      ctx.env
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

  async putMeta(req: ReqPutMeta, ctx: CtxHasGroup): Promise<ResPutMeta | ErrorMsg> {
    const rSignedUrl = await calculatePreSignedUrl(
      {
        tid: req.tid,
        type: "reqSignedUrl",
        version: req.version,
        params: { ...req.params, method: "PUT" },
      },
      ctx.env
    );
    if (rSignedUrl.isErr()) {
      return buildErrorMsg(this.logger, req, rSignedUrl.Err());
    }
    // roughly time ordered
    return buildResPutMeta(req, {
      // metaId should be a hash of metas.
      metaId: new Date().getTime().toString(),
      metas: req.metas,
      signedPutUrl: rSignedUrl.Ok().toString(),
      connId: ctx.group.connId,
    });
  }

}