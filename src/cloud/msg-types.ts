import { Logger, SuperThis } from "@fireproof/core";
import { bs } from "@fireproof/core";

export interface ConnId {
  readonly connId: string;
}

// type AddConnId<T extends MsgBase, N> = Omit<T, "type"> & ConnId & { readonly type: N };

interface NextId {
  readonly nextId: SuperThis["nextId"];
}

export interface AuthType {
  readonly type: "ucan";
}

export interface UCanAuth {
  readonly type: "ucan";
  readonly params: {
    readonly tbd: string
  };
}

export interface MsgBase {
  readonly tid: string;
  readonly type: string;
  readonly version: string;
  readonly auth?: AuthType;
}

export interface ErrorMsg extends MsgBase {
  readonly type: "error";
  readonly message: string;
}
export function MsgIsError(rq: MsgBase): rq is ErrorMsg {
  return rq.type === "error";
}
export function MsgIsQSError(rq: ReqRes<MsgBase, MsgBase>): rq is ReqRes<ErrorMsg, ErrorMsg> {
  return rq.res.type === "error" || rq.req.type === "error";
}

export type HttpMethods = "GET" | "PUT" | "DELETE";
export type FPStoreTypes = "meta" | "data" | "wal";

export interface ConnectionKey {
  // readonly protocol: "ws" | "wss"; // ws or wss
  readonly tenantId: string;
  readonly name: string;
}

export interface SignedUrlParam extends ConnectionKey {
  readonly path?: string;
  readonly method: HttpMethods;
  readonly store: FPStoreTypes;
  readonly key: string;
  readonly expires?: number; // seconds
  readonly index?: string;
}

export interface Connection {
  readonly ws: WebSocket;
  readonly params: ConnectionKey;
}

export interface ReqRes<Q extends MsgBase, S extends MsgBase> {
  readonly req: Q;
  readonly res: S;
}

export interface ReqOptRes<Q extends MsgBase, S extends MsgBase> {
  readonly req: Q;
  readonly res?: S;
}

export interface ReqSignedUrlParam {
  readonly tid?: string;
  readonly version?: string;
  readonly auth?: AuthType;
  readonly params: {
    // readonly protocol?: "ws" | "wss"; // ws or wss
    readonly tenantId: string;
    readonly name: string;
    readonly path?: string;
    readonly method: HttpMethods;
    readonly store: FPStoreTypes;
    readonly key: string;
    readonly expires?: number; // seconds
    readonly index?: string;
  };
}

const VERSION = "FP-MSG-1.0";

/* Signed URL */

export function buildReqSignedUrl(sthis: NextId, req: ReqSignedUrlParam): ReqSignedUrl {
  return {
    tid: sthis.nextId().str,
    type: "reqSignedUrl",
    version: VERSION,
    ...req,
    params: {
      // protocol: "wss",
      ...req.params,
    },
  };
}

export function MsgIsReqSignedUrl(msg: MsgBase): msg is ReqSignedUrl {
  return msg.type === "reqSignedUrl";
}

export function buildResSignedUrl(req: ReqSignedUrl, signedUrl: string): ResSignedUrl {
  return {
    tid: req.tid,
    type: "resSignedUrl",
    version: VERSION,
    params: req.params,
    signedUrl,
  };
}

export function buildErrorMsg(logger: Logger, base: Partial<MsgBase>, error: Error): ErrorMsg {
  const msg = {
    type: "error",
    tid: base.tid || "internal",
    message: error.message,
    version: VERSION,
  } satisfies ErrorMsg;
  logger.Error().Any("msg", msg).Msg("error");
  return msg;
}

export interface ReqSignedUrl extends MsgBase {
  readonly type: "reqSignedUrl";
  readonly params: SignedUrlParam;
}

export interface ReqSignedUrl extends MsgBase {
  readonly type: "reqSignedUrl";
  readonly params: SignedUrlParam;
}

export interface ResSignedUrl extends MsgBase {
  readonly type: "resSignedUrl";
  readonly params: SignedUrlParam;
  readonly signedUrl: string;
}

/* Subscribe Meta */

export interface ReqSubscribeMeta extends MsgBase {
  readonly type: "reqSubscribeMeta";
  readonly subscriberId: string;
  readonly key: ConnectionKey;
}

// export type ReqSubscribeMetaWithConnId = AddConnId<ReqSubscribeMeta, "reqSubscribeMetaWithConnId">;

// export function MsgIsReqSubscribeMetaWithConnId(req: MsgBase): req is ReqSubscribeMetaWithConnId {
//   return req.type === "reqSubscribeMetaWithConnId";
// }

export function MsgIsReqSubscribeMeta(req: MsgBase): req is ReqSubscribeMeta {
  return req.type === "reqSubscribeMeta";
}

export function buildReqSubscriptMeta(sthis: NextId, ck: ConnectionKey, subscriberId: string): ReqSubscribeMeta {
  return {
    tid: sthis.nextId().str,
    subscriberId,
    type: "reqSubscribeMeta",
    version: VERSION,
    key: ck,
  };
}

export interface ResSubscribeMeta extends MsgBase {
  readonly type: "resSubscribeMeta";
  readonly subscriberId: string;
  readonly connId: string;
  readonly key: ConnectionKey;
}

export function buildResSubscriptMeta(req: ReqSubscribeMeta, ctx: ConnId): ResSubscribeMeta {
  return {
    tid: req.tid,
    type: "resSubscribeMeta",
    connId: ctx.connId,
    subscriberId: req.subscriberId,
    key: req.key,
    version: VERSION,
  };
}

export function MsgIsResSubscribeMeta(msg: MsgBase): msg is ResSubscribeMeta {
  return msg.type === "resSubscribeMeta";
}


/* Put Meta */
export interface ReqPutMeta extends MsgBase {
  readonly type: "reqPutMeta";
  readonly key: ConnectionKey;
  readonly params: SignedUrlParam;
  readonly metas: bs.DbMeta[];
}

// export type ReqPutMetaWithConnId = AddConnId<ReqPutMeta, "reqPutMetaWithConnId">;

// export function MsgIsReqPutMetaWithConnId(msg: MsgBase): msg is ReqPutMetaWithConnId {
//   return msg.type === "reqPutMetaWithConnId";
// }

export interface PutMetaParam {
  readonly metaId: string;
  readonly metas: bs.DbMeta[];
  readonly signedPutUrl: string;
  readonly connId: string;
}

export interface ResPutMeta extends MsgBase, PutMetaParam {
  readonly type: "resPutMeta";
  readonly key: ConnectionKey;
}

export function buildReqPutMeta(
  sthis: NextId,
  key: ConnectionKey,
  signedUrlParams: SignedUrlParam,
  metas: bs.DbMeta[],
): ReqPutMeta {
  return {
    tid: sthis.nextId().str,
    type: "reqPutMeta",
    version: VERSION,
    params: signedUrlParams,
    key,
    metas,
  };
}

export function MsgIsReqPutMeta(msg: MsgBase): msg is ReqPutMeta {
  return msg.type === "reqPutMeta";
}

export function buildResPutMeta(req: ReqPutMeta, metaParam: PutMetaParam): ResPutMeta {
  return {
    ...metaParam,
    tid: req.tid,
    type: "resPutMeta",
    key: req.key,
    version: VERSION,
  };
}

export function MsgIsResPutMeta(qs: ReqRes<MsgBase, MsgBase>): qs is ReqRes<ReqPutMeta, ResPutMeta> {
  return qs.res.type === "resPutMeta" && qs.req.type === "reqPutMeta";
}

export interface ConnSubId {
  readonly connId: string;
  readonly subscriberId: string;
}

export interface UpdateMetaEvent extends MsgBase, ConnSubId {
  readonly type: "updateMeta";
  readonly key: ConnectionKey;
  readonly metaId: string;
  readonly metas: bs.DbMeta[];
}

export function buildUpdateMetaEvent(rq: ReqRes<ReqPutMeta, ResPutMeta>, consub: ConnSubId): UpdateMetaEvent {
  return {
    ...consub,
    tid: rq.res.tid,
    type: "updateMeta",
    key: rq.res.key,
    metaId: rq.res.metaId,
    metas: rq.req.metas,
    version: rq.res.version,
  };
}

export function MsgIsUpdateMetaEvent(msg: MsgBase): msg is UpdateMetaEvent {
  return msg.type === "updateMeta";
}

/* Get Meta */
export interface ReqGetMeta extends MsgBase {
  readonly type: "reqGetMeta";
  readonly params: SignedUrlParam;
  readonly key: ConnectionKey;
}

// export type ReqGetMetaWithConnId = AddConnId<ReqGetMeta, "reqGetMetaWithConnId">;

export function MsgIsReqGetMeta(msg: MsgBase): msg is ReqGetMeta {
  return msg.type === "reqGetMeta";
}

// export function MsgIsReqGetMetaWithConnId(msg: MsgBase): msg is ReqGetMetaWithConnId {
//   return msg.type === "reqGetMetaWithConnId";
// }

export interface GetMetaParam {
  readonly params: SignedUrlParam;
  readonly key: ConnectionKey;
  readonly status: "found" | "not-found" | "redirect";
  readonly metas: bs.DbMeta[];
  readonly connId: string;
  // if set client should query this url to retrieve the meta
  readonly signedGetUrl?: string;
}

export interface ResGetMeta extends MsgBase, GetMetaParam {
  readonly type: "resGetMeta";
}

export function buildReqGetMeta(
  sthis: NextId,
  key: ConnectionKey,
  signedUrlParams: SignedUrlParam
): ReqGetMeta {
  return {
    tid: sthis.nextId().str,
    key,
    type: "reqGetMeta",
    version: VERSION,
    params: signedUrlParams,
  };
}

export function buildResGetMeta(req: ReqGetMeta, metaParam: GetMetaParam): ResGetMeta {
  return {
    ...metaParam,
    tid: req.tid,
    type: "resGetMeta",
    key: req.key,
    version: VERSION,
  };
}

export function MsgIsResGetMeta(qs: ReqRes<MsgBase, MsgBase>): qs is ReqRes<ReqGetMeta, ResGetMeta> {
  return qs.res.type === "resGetMeta" && qs.req.type === "reqGetMeta";
}


/* Del Meta */
export interface ReqDelMeta extends MsgBase {
  readonly type: "reqDelMeta";
  readonly params: SignedUrlParam;
  readonly key: ConnectionKey;
}

// export type ReqDelMetaWithConnId = AddConnId<ReqDelMeta, "reqDelMetaWithConnId">;

// export function MsgIsReqDelMetaWithConnId(msg: MsgBase): msg is ReqDelMetaWithConnId {
//   return msg.type === "reqDelMetaWithConnId";
// }

export interface DelMetaParam {
  readonly params: SignedUrlParam;
  readonly key: ConnectionKey;
  readonly status: "found" | "not-found" | "redirect";
  readonly connId: string;
  // if set client should query this url to retrieve the meta
  readonly signedDelUrl?: string;
}

export interface ResDelMeta extends MsgBase, DelMetaParam {
  readonly type: "resDelMeta";
}

export function buildReqDelMeta(
  sthis: NextId,
  key: ConnectionKey,
  signedUrlParams: SignedUrlParam
): ReqDelMeta {
  return {
    tid: sthis.nextId().str,
    key,
    type: "reqDelMeta",
    version: VERSION,
    params: signedUrlParams,
  };
}

export function MsgIsReqDelMeta(msg: MsgBase): msg is ReqDelMeta {
  return msg.type === "reqDelMeta";
}

export function buildResDelMeta(req: ReqDelMeta, metaParam: DelMetaParam): ResDelMeta {
  return {
    ...metaParam,
    tid: req.tid,
    type: "resDelMeta",
    key: req.key,
    version: VERSION,
  };
}

export function MsgIsResDelMeta(qs: ReqRes<MsgBase, MsgBase>): qs is ReqRes<ReqDelMeta, ResDelMeta> {
  return qs.res.type === "resDelMeta" && qs.req.type === "reqDelMeta";
}