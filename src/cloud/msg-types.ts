import { CRDTEntry, Logger, SuperThis } from "@fireproof/core";
import { EnDeCoder } from "./msg-request.js";

export const VERSION = "FP-MSG-1.0";

// export interface ConnId {
//   readonly connId: string;
// }
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
    readonly tbd: string;
  };
}

export interface ConnectionKey {
  readonly tenantId: string;
  readonly ledgerName: string;
}

export interface Connection {
  readonly key: ConnectionKey;
  readonly reqId: string;
  readonly resId: string;
}

export interface Connected {
  readonly conn: Connection;
}

export interface MsgBase {
  readonly tid: string;
  readonly type: string;
  readonly version: string;
  readonly auth?: AuthType;
  readonly conn?: Connection;
}

export interface ErrorMsg extends MsgBase {
  readonly type: "error";
  readonly message: string;
  readonly body?: string;
  readonly stack?: string[];
}

export function MsgIsError(rq: MsgBase): rq is ErrorMsg {
  return rq.type === "error";
}

export function MsgIsQSError(rq: ReqRes<MsgBase, MsgBase>): rq is ReqRes<ErrorMsg, ErrorMsg> {
  return rq.res.type === "error" || rq.req.type === "error";
}

export type HttpMethods = "GET" | "PUT" | "DELETE";
export type FPStoreTypes = "meta" | "data" | "wal";



// reqRes is http
// stream is WebSocket
export type ProtocolCapabilities = "reqRes" | "stream"

export interface Gestalt {
  /**
   * Describes StoreTypes which are handled
   */
  readonly storeTypes: FPStoreTypes[];
  /**
   * A unique identifier
   */
  readonly id: string;
  /**
   * protocol capabilities
   * defaults "stream"
   */
  readonly protocolCapabilities: ProtocolCapabilities[];
  /**
   * HttpEndpoints (URL) required atleast one
   * could be absolute or relative
   */
  readonly httpEndpoints: string[];
  /**
   * WebsocketEndpoints (URL) required atleast one
   * could be absolute or relative
   */
  readonly wsEndpoints: string[];
  /**
   * Encodings supported
   * JSON, CBOR
   */
  readonly encodings: ("JSON"|"CBOR")[];
  /**
   * Authentication methods supported
   */
  readonly auth: AuthType[];
  /**
   * Requires Authentication
   */
  readonly requiresAuth: boolean;
  /**
   * In|Outband Data | Meta | WAL Support
   * Inband Means that the Payload is part of the message
   * Outband Means that the Payload is PUT/GET to a different URL
   * A Clien implementation usally not support reading or writing
   * support
   */
  readonly data?: {
    readonly inband: boolean;
    readonly outband: boolean;
  }
  readonly meta?: {
    readonly inband: true; // meta inband is mandatory
    readonly outband: boolean;
  }
  readonly wal?: {
    readonly inband: boolean;
    readonly outband: boolean;
  }
  /**
   * Request Types supported
   * reqGestalt, reqSubscribeMeta, reqPutMeta, reqGetMeta, reqDelMeta, reqUpdateMeta
   */
  readonly reqTypes: string[];
  /**
   * Response Types supported
   * resGestalt, resSubscribeMeta, resPutMeta, resGetMeta, resDelMeta, updateMeta
   */
  readonly resTypes: string[];
  /**
   * Event Types supported
   * updateMeta
   */
  readonly eventTypes: string[];
}

export interface MsgerParams {
  readonly ende: EnDeCoder;
  readonly mime: string;
  readonly auth?: AuthType;
  readonly hasPersistent?: boolean;
  readonly protocol: "http" | "ws";
  readonly timeout: number; // msec
}

// force the server id
export type GestaltParam = Partial<MsgerParams & { gestalt: Gestalt}> & { readonly id: string };

export function defaultGestalt(gs: GestaltParam & {
  hasPersitance?: boolean;
  protocol?: "http" | "ws";
}): Gestalt {
  const hasPersitance = gs.hasPersitance || false;
  delete gs.hasPersitance;
  return {
    storeTypes: ["meta", "data", "wal"],
    id: gs.id,
    httpEndpoints: ["/fp"],
    wsEndpoints: gs.protocol === 'ws' ? ["/ws"] : [],
    encodings: ["JSON"],
    protocolCapabilities: gs.protocol === 'ws' ? ["stream"] : ["reqRes"],
    auth: [],
    requiresAuth: false,
    data: hasPersitance ? {
      inband: true,
      outband: true,
    }: undefined,
    meta: hasPersitance ? {
      inband: true,
      outband: true,
    }: undefined,
    wal: hasPersitance ? {
      inband: true,
      outband: true,
    }: undefined,
    reqTypes: [
      "reqOpen",
      "reqGestalt",
      // "reqSignedUrl",
      "reqSubscribeMeta",
      "reqPutMeta",
      "reqGetMeta",
      "reqDelMeta",
      "reqPutData",
      "reqGetData",
      "reqDelData",
      "reqPutWAL",
      "reqGetWAL",
      "reqDelWAL",
      "reqUpdateMeta",
    ],
    resTypes: [
      "resOpen",
      "resGestalt",
      // "resSignedUrl",
      "resSubscribeMeta",
      "resPutMeta",
      "resGetMeta",
      "resDelMeta",
      "resPutData",
      "resGetData",
      "resDelData",
      "resPutWAL",
      "resGetWAL",
      "resDelWAL",
      "updateMeta",
    ],
    eventTypes: ["updateMeta"],
    ...gs.gestalt
  }
}

/**
 * The ReqGestalt message is used to request the
 * features of the Responder.
 */
export interface ReqGestalt extends MsgBase {
  readonly type: "reqGestalt";
  readonly gestalt: Gestalt;
}

export function MsgIsReqGestalt(msg: MsgBase): msg is ReqGestalt {
  return msg.type === "reqGestalt";
}

export function buildReqGestalt(sthis: NextId, gestalt: Gestalt): ReqGestalt {
  return {
    tid: sthis.nextId().str,
    type: "reqGestalt",
    version: VERSION,
    gestalt
  };
}

/**
 * The ResGestalt message is used to respond with
 * the features of the Responder.
 */
export interface ResGestalt extends MsgBase {
  readonly type: "resGestalt";
  readonly gestalt: Gestalt;
}

export function buildResGestalt(req: ReqGestalt, gestalt: Gestalt): ResGestalt | ErrorMsg {
  return {
    tid: req.tid,
    type: "resGestalt",
    version: VERSION,
    gestalt
  };
}

export function MsgIsResGestalt(msg: MsgBase): msg is ResGestalt {
  return msg.type === "resGestalt";
}

export interface ReqOpenConnection {
  readonly key: ConnectionKey;
  readonly reqId?: string;
}

export interface ReqOpen extends MsgBase {
  readonly type: "reqOpen";
}

export function buildReqOpen(sthis: NextId, conn: ReqOpenConnection): ReqOpen {
  return {
    tid: sthis.nextId().str,
    type: "reqOpen",
    version: VERSION,
    conn: {
      ...conn as Connection,
      reqId: conn.reqId || sthis.nextId().str
    }
  };
}

export function MsgIsReqOpen(msg: MsgBase): msg is ReqOpen {
  return msg.type === "reqOpen";
}

export interface ResOpen extends MsgBase {
  readonly type: "resOpen";
  readonly conn: Connection;
}

export function buildResOpen(sthis: NextId, req: ReqOpen, resStreamId?: string): ResOpen {
  if (!(req.conn && req.conn.reqId)) {
    throw new Error("req.conn.reqId is required");
  }
  return {
    ...req,
    type: "resOpen",
    conn: {
      ...req.conn as Connection,
      resId: resStreamId || sthis.nextId().str
    }
  };
}

export function MsgIsResOpen(msg: MsgBase): msg is ResOpen {
  return msg.type === "resOpen";
}

export interface SignedUrlParam extends ConnectionKey {
  readonly path?: string;
  readonly method: HttpMethods;
  readonly store: FPStoreTypes;
  readonly key: string;
  readonly expires?: number; // seconds
  readonly index?: string;
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
    // readonly tenantId: string;
    // readonly name: string;
    readonly connectionKey: ConnectionKey;
    readonly path?: string;
    readonly method: HttpMethods;
    readonly store: FPStoreTypes;
    readonly key: string;
    readonly expires?: number; // seconds
    readonly index?: string;
  };
}


/* Signed URL */

export function buildReqSignedUrl(req: ReqSignedUrlParam): ReqSignedUrlParam {
  return {
    tid: req.tid,
    params: {
      // protocol: "wss",
      ...req.params,
    },
  };
}

// export function MsgIsReqSignedUrl(msg: MsgBase): msg is ReqSignedUrl {
//   return msg.type === "reqSignedUrl";
// }

interface StoreAndType {
  readonly store: FPStoreTypes;
  readonly resType: string;
}
const reqToRes: Record<string, StoreAndType>  = {
  reqGetData: { store: "data", resType: "resGetData" },
  reqPutData: { store: "data", resType: "resPutData" },
  reqDelData: { store: "data", resType: "resDelData" },
  reqGetWAL: { store: "wal", resType: "resGetWAL" },
  reqPutWAL: { store: "wal", resType: "resPutWAL" },
  reqDelWAL: { store: "wal", resType: "resDelWAL" },
}

export function getStoreFromType(req: MsgBase): StoreAndType {
  return reqToRes[req.type] || (() => { throw new Error(`unknown req.type=${req.type}`) })();
}

export function buildResSignedUrl(req: ReqSignedUrl, signedUrl: string): ResSignedUrl {
  return {
    tid: req.tid,
    type: getStoreFromType(req).resType,
    version: VERSION,
    params: req.params,
    signedUrl,
  };
}

export function buildErrorMsg(sthis: SuperThis, logger: Logger, base: Partial<MsgBase>, error: Error, body?: string, stack?: string[]): ErrorMsg {
  if (!stack && sthis.env.get("FP_STACK")) {
    stack = error.stack?.split("\n");
  }
  const msg = {
    type: "error",
    tid: base.tid || "internal",
    message: error.message,
    version: VERSION,
    body, stack
  } satisfies ErrorMsg;
  logger.Error().Any("msg", msg).Msg("error");
  return msg;
}

export interface ReqSignedUrl extends MsgBase {
  // readonly type: "reqSignedUrl";
  readonly params: SignedUrlParam;
}

export interface ResSignedUrl extends MsgBase {
  // readonly type: "resSignedUrl";
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
  readonly conn: Connection;
  readonly key: ConnectionKey;
}

export function buildResSubscriptMeta(req: ReqSubscribeMeta, ctx: Connection): ResSubscribeMeta {
  return {
    tid: req.tid,
    type: "resSubscribeMeta",
    conn: ctx,
    subscriberId: req.subscriberId,
    key: req.key,
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
  readonly key: ConnectionKey;
  readonly params: SignedUrlParam;
  readonly metas: CRDTEntry[];
}

// export type ReqPutMetaWithConnId = AddConnId<ReqPutMeta, "reqPutMetaWithConnId">;

// export function MsgIsReqPutMetaWithConnId(msg: MsgBase): msg is ReqPutMetaWithConnId {
//   return msg.type === "reqPutMetaWithConnId";
// }

export interface PutMetaParam {
  readonly metaId: string;
  readonly metas: CRDTEntry[];
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
  metas: CRDTEntry[]
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

/**
 * This is used for non WebSocket server implementations
 * to retrieve the meta data. It should be done by polling
 * and might implement long polling.
 * It will answer with a UpdateMetaEvent.
 */
export interface ReqUpdateMeta extends MsgBase, ConnSubId {
  readonly type: "reqUpdateMeta";
  readonly key: ConnectionKey;
}

export interface UpdateMetaEvent extends MsgBase, ConnSubId {
  readonly type: "updateMeta";
  readonly key: ConnectionKey;
  readonly metaId: string;
  readonly metas: CRDTEntry[];
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
  readonly key: ConnectionKey;
}

export function buildReqGetMeta(sthis: NextId, key: ConnectionKey, signedUrlParams: SignedUrlParam): ReqGetMeta {
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
    params: req.params,
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
  // readonly key: ConnectionKey;
  readonly status: "found" | "not-found" | "redirect" | "unsupported";
  readonly connId: string;
  // if set client should query this url to retrieve the meta
  readonly signedDelUrl?: string;
}

export interface ResDelMeta extends MsgBase, DelMetaParam {
  readonly type: "resDelMeta";
}

export function buildReqDelMeta(sthis: NextId, key: ConnectionKey, signedUrlParams: SignedUrlParam): ReqDelMeta {
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
    // key: req.key,
    version: VERSION,
  };
}

export function MsgIsResDelMeta(qs: ReqRes<MsgBase, MsgBase>): qs is ReqRes<ReqDelMeta, ResDelMeta> {
  return qs.res.type === "resDelMeta" && qs.req.type === "reqDelMeta";
}

export interface ReqGetData extends ReqSignedUrl {
  readonly type: "reqGetData";
}

export function MsgIsReqGetData(msg: MsgBase): msg is ReqGetData {
  return msg.type === "reqGetData";
}

export interface ResGetData extends ResSignedUrl {
  readonly type: "resGetData";
  readonly payload: Uint8Array; // transfered via JSON base64
}

export interface ReqPutData extends ReqSignedUrl {
  readonly type: "reqPutData";
  readonly payload: Uint8Array; // transfered via JSON base64
}

export function MsgIsReqPutData(msg: MsgBase): msg is ReqPutData {
  return msg.type === "reqPutData";
}

export interface ResPutData extends ResSignedUrl {
  readonly type: "resPutData";
}

export interface ReqDelData extends ReqSignedUrl {
  readonly type: "reqGetData";
}

export function MsgIsReqDelData(msg: MsgBase): msg is ReqDelData {
  return msg.type === "reqDelData";
}

export interface ResDelData extends ResSignedUrl {
  readonly type: "resDelData";
}

export interface ReqGetWAL extends ReqSignedUrl {
  readonly type: "reqGetWAL";
}

export function MsgIsReqGetWAL(msg: MsgBase): msg is ReqGetWAL {
  return msg.type === "reqGetWAL";
}

export interface ResGetWAL extends ResSignedUrl {
  readonly type: "resGetWAL";
  readonly payload: Uint8Array; // transfered via JSON base64
}


export interface ReqPutWAL extends Omit<ReqSignedUrl, "type"> {
  readonly type: "reqPutWAL";
  readonly payload: Uint8Array; // transfered via JSON base64
}

export function MsgIsReqPutWAL(msg: MsgBase): msg is ReqPutWAL {
  return msg.type === "reqPutWAL";
}

export interface ResPutWAL extends Omit<ResSignedUrl, "type"> {
  readonly type: "resPutWAL";
}

export interface ReqDelWAL extends Omit<ReqSignedUrl, "type"> {
  readonly type: "reqGetWAL";
}

export function MsgIsReqDelWAL(msg: MsgBase): msg is ReqDelWAL {
  return msg.type === "reqDelWAL";
}

export interface ResDelWAL extends Omit<ResSignedUrl, "type"> {
  readonly type: "resDelWAL";
}