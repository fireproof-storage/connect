import { VERSION } from "@adviser/cement";
import { CRDTEntry } from "@fireproof/core";
import { MsgBase, Connection, NextId, ReqRes, ReqSignedUrlParam, SignedUrlParam } from "./msg-types.js";

/* Subscribe Meta */

export interface ReqSubscribeMeta extends MsgBase {
  readonly type: "reqSubscribeMeta";
  readonly subscriberId: string;
  readonly conn: Connection;
}

// export type ReqSubscribeMetaWithConnId = AddConnId<ReqSubscribeMeta, "reqSubscribeMetaWithConnId">;

// export function MsgIsReqSubscribeMetaWithConnId(req: MsgBase): req is ReqSubscribeMetaWithConnId {
//   return req.type === "reqSubscribeMetaWithConnId";
// }

export function MsgIsReqSubscribeMeta(req: MsgBase): req is ReqSubscribeMeta {
  return req.type === "reqSubscribeMeta";
}

export function buildReqSubscribeMeta(sthis: NextId, ck: Connection, subscriberId: string): ReqSubscribeMeta {
  return {
    tid: sthis.nextId().str,
    subscriberId,
    type: "reqSubscribeMeta",
    version: VERSION,
    conn: ck,
  };
}

export interface ResSubscribeMeta extends MsgBase {
  readonly type: "resSubscribeMeta";
  readonly subscriberId: string;
  readonly conn: Connection;
}

export function buildResSubscribeMeta(req: ReqSubscribeMeta /*, _conn: Connection*/): ResSubscribeMeta {
  return {
    tid: req.tid,
    type: "resSubscribeMeta",
    subscriberId: req.subscriberId,
    conn: req.conn,
    version: VERSION,
  };
}

export function MsgIsResSubscribeMeta<T extends ReqRes<MsgBase, MsgBase>>(
  qs: T
): qs is T & ReqRes<MsgBase, ResSubscribeMeta> {
  return qs.res.type === "resSubscribeMeta";
}

/* Put Meta */
export interface ReqPutMeta extends MsgBase {
  readonly type: "reqPutMeta";
  readonly params: ReqSignedUrlParam;
  readonly metas: CRDTEntry[];
  readonly conn: Connection;
}

// export type ReqPutMetaWithConnId = AddConnId<ReqPutMeta, "reqPutMetaWithConnId">;

// export function MsgIsReqPutMetaWithConnId(msg: MsgBase): msg is ReqPutMetaWithConnId {
//   return msg.type === "reqPutMetaWithConnId";
// }

export interface PutMetaParam {
  readonly metaId: string;
  readonly metas: CRDTEntry[];
  readonly signedPutUrl: string;
}

export interface ResPutMeta extends MsgBase, PutMetaParam {
  readonly type: "resPutMeta";
  readonly metas: CRDTEntry[];
  readonly conn: Connection;
}

export function buildReqPutMeta(
  sthis: NextId,
  conn: Connection,
  signedUrlParams: ReqSignedUrlParam,
  metas: CRDTEntry[]
): ReqPutMeta {
  return {
    tid: sthis.nextId().str,
    type: "reqPutMeta",
    conn,
    version: VERSION,
    params: signedUrlParams,
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
    conn: req.conn,
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

/**
 * This is used for non WebSocket server implementations
 * to retrieve the meta data. It should be done by polling
 * and might implement long polling.
 * It will answer with a UpdateMetaEvent.
 */
export interface ReqUpdateMeta extends MsgBase, ConnSubId {
  readonly type: "reqUpdateMeta";
  readonly conn: Connection;
}

export interface UpdateMetaEvent extends MsgBase, ConnSubId {
  readonly type: "updateMeta";
  readonly conn: Connection;
  readonly metaId: string;
  readonly metas: CRDTEntry[];
}

export function buildUpdateMetaEvent(rq: ReqRes<ReqPutMeta, ResPutMeta>, consub: ConnSubId): UpdateMetaEvent {
  return {
    ...consub,
    tid: rq.res.tid,
    type: "updateMeta",
    conn: rq.res.conn,
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
  readonly params: ReqSignedUrlParam;
  readonly conn: Connection;
}

// export type ReqGetMetaWithConnId = AddConnId<ReqGetMeta, "reqGetMetaWithConnId">;

export function MsgIsReqGetMeta(msg: MsgBase): msg is ReqGetMeta {
  return msg.type === "reqGetMeta";
}

// export function MsgIsReqGetMetaWithConnId(msg: MsgBase): msg is ReqGetMetaWithConnId {
//   return msg.type === "reqGetMetaWithConnId";
// }

export interface GetMetaParam {
  // readonly params: SignedUrlParam;
  // readonly key: ConnectionKey;
  readonly status: "found" | "not-found" | "redirect";
  readonly metas: CRDTEntry[];
  readonly connId: string;
  // if set client should query this url to retrieve the meta
  readonly signedGetUrl?: string;
}

export interface ResGetMeta extends MsgBase, GetMetaParam {
  readonly type: "resGetMeta";
  readonly params: SignedUrlParam;
}

export function buildReqGetMeta(sthis: NextId, conn: Connection, signedUrlParams: ReqSignedUrlParam): ReqGetMeta {
  return {
    tid: sthis.nextId().str,
    conn,
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
    params: { ...req.params, method: "GET", store: "meta" },
    version: VERSION,
  };
}

export function MsgIsResGetMeta(qs: ReqRes<MsgBase, MsgBase>): qs is ReqRes<ReqGetMeta, ResGetMeta> {
  return qs.res.type === "resGetMeta" && qs.req.type === "reqGetMeta";
}

/* Del Meta */
export interface ReqDelMeta extends MsgBase {
  readonly type: "reqDelMeta";
  readonly params: ReqSignedUrlParam;
  readonly conn: Connection;
}

// export type ReqDelMetaWithConnId = AddConnId<ReqDelMeta, "reqDelMetaWithConnId">;

// export function MsgIsReqDelMetaWithConnId(msg: MsgBase): msg is ReqDelMetaWithConnId {
//   return msg.type === "reqDelMetaWithConnId";
// }

export interface DelMetaParam {
  readonly params: SignedUrlParam;
  // readonly key: ConnectionKey;
  readonly status: "found" | "not-found" | "redirect" | "unsupported";
  // readonly connId: string;
  // if set client should query this url to retrieve the meta
  readonly signedDelUrl?: string;
}

export interface ResDelMeta extends MsgBase, DelMetaParam {
  readonly type: "resDelMeta";
}

export function buildReqDelMeta(sthis: NextId, conn: Connection, signedUrlParams: SignedUrlParam): ReqDelMeta {
  return {
    tid: sthis.nextId().str,
    conn,
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
    // key: req.key,
    version: VERSION,
  };
}

export function MsgIsResDelMeta(qs: ReqRes<MsgBase, MsgBase>): qs is ReqRes<ReqDelMeta, ResDelMeta> {
  return qs.res.type === "resDelMeta" && qs.req.type === "reqDelMeta";
}