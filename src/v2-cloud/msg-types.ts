import { Future, Logger } from "@adviser/cement";
import { SuperThis } from "@fireproof/core";
import { CalculatePreSignedUrl } from "./msg-types-data.js";
import { PreSignedMsg } from "./pre-signed-url.js";

export const VERSION = "FP-MSG-1.0";

export type MsgWithError<T extends MsgBase> = T | ErrorMsg;

export interface RequestOpts {
  readonly waitFor: (msg: MsgBase) => boolean;
  readonly pollInterval?: number; // 1000ms
  readonly timeout?: number; // ms
}

export interface EnDeCoder {
  encode<T>(node: T): Uint8Array;
  decode<T>(data: Uint8Array): T;
}

export interface WaitForTid {
  readonly tid: string;
  readonly future: Future<MsgBase>;
  readonly timeout?: number;
  // undefined match all
  readonly waitFor: (msg: MsgBase) => boolean;
}

// export interface ConnId {
//   readonly connId: string;
// }
// type AddConnId<T extends MsgBase, N> = Omit<T, "type"> & ConnId & { readonly type: N };
export interface NextId {
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

export interface TenantLedger {
  readonly tenant: string;
  readonly ledger: string;
}

export function keyTenantLedger(t: TenantLedger): string {
  return `${t.tenant}:${t.ledger}`;
}

export interface QSId {
  readonly reqId: string;
  readonly resId: string;
}

export function qsidEqual(a: QSId, b: QSId): boolean {
  return a.reqId === b.reqId && a.resId === b.resId;
}

export function qsidKey(qsid: QSId): string {
  return `${qsid.reqId}:${qsid.resId}`;
}

// export interface Connection extends ReqResId{
//   readonly key: TenantLedger;
// }

// export interface Connected {
//   readonly conn: Connection;
// }

export interface MsgBase {
  readonly tid: string;
  readonly type: string;
  readonly version: string;
  readonly auth?: AuthType;
}

export function MsgIsTid(msg: MsgBase, tid: string): boolean {
  return msg.tid === tid;
}

export type MsgWithConn<T extends MsgBase = MsgBase> = T & { readonly conn: QSId };

export type MsgWithOptionalConn<T extends MsgBase = MsgBase> = T & { readonly conn?: QSId };

export type MsgWithTenantLedger<T extends MsgBase> = T & { readonly tenant: TenantLedger };

export interface ErrorMsg extends MsgBase {
  readonly type: "error";
  readonly src: unknown;
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
export type ProtocolCapabilities = "reqRes" | "stream";

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
  readonly encodings: ("JSON" | "CBOR")[];
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
  };
  readonly meta?: {
    readonly inband: true; // meta inband is mandatory
    readonly outband: boolean;
  };
  readonly wal?: {
    readonly inband: boolean;
    readonly outband: boolean;
  };
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
  readonly mime: string;
  readonly auth?: AuthType;
  readonly hasPersistent?: boolean;
  readonly protocolCapabilities?: ProtocolCapabilities[];
  // readonly protocol: "http" | "ws";
  readonly timeout: number; // msec
}

// force the server id
export type GestaltParam = Partial<Gestalt> & { readonly id: string };

export function defaultGestalt(msgP: MsgerParams, gestalt: GestaltParam): Gestalt {
  return {
    storeTypes: ["meta", "data", "wal"],
    httpEndpoints: ["/fp"],
    wsEndpoints: ["/ws"],
    encodings: ["JSON"],
    protocolCapabilities: msgP.protocolCapabilities || ["reqRes", "stream"],
    auth: [],
    requiresAuth: false,
    data: msgP.hasPersistent
      ? {
          inband: true,
          outband: true,
        }
      : undefined,
    meta: msgP.hasPersistent
      ? {
          inband: true,
          outband: true,
        }
      : undefined,
    wal: msgP.hasPersistent
      ? {
          inband: true,
          outband: true,
        }
      : undefined,
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
    ...gestalt,
  };
}

export interface ReqChat extends MsgWithConn {
  readonly type: "reqChat";
  readonly message: string;
  readonly targets: QSId[];
}
export interface ResChat extends MsgWithConn {
  readonly type: "resChat";
  readonly message: string;
  readonly targets: QSId[];
}

export function buildReqChat(sthis: NextId, conn: QSId, message: string, targets?: QSId[]): ReqChat {
  return {
    tid: sthis.nextId().str,
    type: "reqChat",
    version: VERSION,
    conn,
    message,
    targets: targets ?? [],
  };
}

export function buildResChat(req: ReqChat, conn?: QSId, message?: string, targets?: QSId[]): ResChat {
  return {
    ...req,
    conn: conn || req.conn,
    message: message || req.message,
    targets: targets || req.targets,
    type: "resChat",
    version: VERSION,
  };
}

export function MsgIsReqChat(msg: MsgBase): msg is ReqChat {
  return msg.type === "reqChat";
}

export function MsgIsResChat(msg: MsgBase): msg is ResChat {
  return msg.type === "resChat";
}

/**
 * The ReqGestalt message is used to request the
 * features of the Responder.
 */
export interface ReqGestalt extends MsgBase {
  readonly type: "reqGestalt";
  readonly gestalt: Gestalt;
  readonly publish?: boolean; // for testing
}

export function MsgIsReqGestalt(msg: MsgBase): msg is ReqGestalt {
  return msg.type === "reqGestalt";
}

export function buildReqGestalt(sthis: NextId, gestalt: Gestalt, publish?: boolean): ReqGestalt {
  return {
    tid: sthis.nextId().str,
    type: "reqGestalt",
    version: VERSION,
    gestalt,
    publish,
  };
}

export interface ConnInfo {
  readonly connIds: string[];
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
    gestalt,
  };
}

export function MsgIsResGestalt(msg: MsgBase): msg is ResGestalt {
  return msg.type === "resGestalt";
}

export interface ReqOpenConnection {
  // readonly key: TenantLedger;
  readonly reqId?: string;
  readonly resId?: string; // for double open
}

export interface ReqOpenConn {
  readonly reqId: string;
  readonly resId?: string;
}

export interface ReqOpen extends MsgBase {
  readonly type: "reqOpen";
  readonly conn: ReqOpenConn;
}

export function buildReqOpen(sthis: NextId, conn: ReqOpenConnection): ReqOpen {
  return {
    tid: sthis.nextId().str,
    type: "reqOpen",
    version: VERSION,
    conn: {
      ...conn,
      reqId: conn.reqId || sthis.nextId().str,
    },
  };
}

export function MsgIsReqOpenWithConn(imsg: MsgBase): imsg is MsgWithConn<ReqOpen> {
  const msg = imsg as MsgWithConn<ReqOpen>;
  return msg.type === "reqOpen" && !!msg.conn && !!msg.conn.reqId;
}

export function MsgIsReqOpen(imsg: MsgBase): imsg is MsgWithConn<ReqOpen> {
  const msg = imsg as MsgWithConn<ReqOpen>;
  return msg.type === "reqOpen" && !!msg.conn && !!msg.conn.reqId;
}

export interface ResOpen extends MsgBase {
  readonly type: "resOpen";
  readonly conn: QSId;
}

export function MsgIsWithConn<T extends MsgBase>(msg: T): msg is MsgWithConn<T> {
  const mwc = (msg as MsgWithConn<T>).conn;
  return mwc && !!(mwc as QSId).reqId && !!(mwc as QSId).resId;
}

export function MsgIsConnected<T extends MsgBase>(msg: T, qsid: QSId): msg is MsgWithConn<T> {
  return MsgIsWithConn(msg) && msg.conn.reqId === qsid.reqId && msg.conn.resId === qsid.resId;
}

export function buildResOpen(sthis: NextId, req: ReqOpen, resStreamId?: string): ResOpen {
  if (!(req.conn && req.conn.reqId)) {
    throw new Error("req.conn.reqId is required");
  }
  return {
    ...req,
    type: "resOpen",
    conn: {
      ...req.conn,
      resId: req.conn.resId || resStreamId || sthis.nextId().str,
    },
  };
}

export function MsgIsResOpen(msg: MsgBase): msg is ResOpen {
  return msg.type === "resOpen";
}

export interface ReqClose extends MsgWithConn {
  readonly type: "reqClose";
}

export function MsgIsReqClose(msg: MsgBase): msg is ReqClose {
  return msg.type === "reqClose" && MsgIsWithConn(msg);
}

export interface ResClose extends MsgWithConn {
  readonly type: "resClose";
}

export function MsgIsResClose(msg: MsgBase): msg is ResClose {
  return msg.type === "resClose" && MsgIsWithConn(msg);
}

export function buildResClose(req: ReqClose, conn: QSId): ResClose {
  return {
    ...req,
    type: "resClose",
    conn,
  };
}

export function buildReqClose(sthis: NextId, conn: QSId): ReqClose {
  return {
    tid: sthis.nextId().str,
    type: "reqClose",
    version: VERSION,
    conn,
  };
}

export interface SignedUrlParam {
  readonly method: HttpMethods;
  readonly store: FPStoreTypes;
  // base path
  readonly path?: string;
  // name of the file
  readonly key: string;
  readonly expires?: number; // seconds
  readonly index?: string;
}

export type ReqSignedUrlParam = Omit<SignedUrlParam, "method" | "store">;

export interface UpdateReqRes<Q extends MsgBase, S extends MsgBase> {
  req: Q;
  res: S;
}

export type ReqRes<Q extends MsgBase, S extends MsgBase> = Readonly<UpdateReqRes<Q, S>>;

// export interface ReqOptRes<Q extends MsgBase, S extends MsgBase> {
//   readonly req: Q;
//   readonly res?: S;
// }

// /* Signed URL */
// export function buildReqSignedUrl(req: ReqSignedUrlParam): ReqSignedUrlParam {
//   return {
//     tid: req.tid,
//     params: {
//       // protocol: "wss",
//       ...req.params,
//     },
//   };
// }

// export function MsgIsReqSignedUrl(msg: MsgBase): msg is ReqSignedUrl {
//   return msg.type === "reqSignedUrl";
// }

// interface StoreAndType {
//   readonly store: FPStoreTypes;
//   readonly resType: string;
// }
// const reqToRes: Record<string, StoreAndType> = {
//   reqGetData: { store: "data", resType: "resGetData" },
//   reqPutData: { store: "data", resType: "resPutData" },
//   reqDelData: { store: "data", resType: "resDelData" },
//   reqGetWAL: { store: "wal", resType: "resGetWAL" },
//   reqPutWAL: { store: "wal", resType: "resPutWAL" },
//   reqDelWAL: { store: "wal", resType: "resDelWAL" },
// };

// export function getStoreFromType(req: MsgBase): StoreAndType {
//   return (
//     reqToRes[req.type] ||
//     (() => {
//       throw new Error(`unknown req.type=${req.type}`);
//     })()
//   );
// }

// export function buildResSignedUrl(req: ReqSignedUrl, signedUrl: string): ResSignedUrl {
//   return {
//     tid: req.tid,
//     type: getStoreFromType(req).resType,
//     version: VERSION,
//     params: req.params,
//     signedUrl,
//   };
// }

export function buildErrorMsg(
  slogger: SuperThisLogger,
  base: Partial<MsgBase & { ref?: unknown }>,
  error: Error,
  body?: string,
  stack?: string[]
): ErrorMsg {
  if (!stack && slogger.sthis.env.get("FP_STACK")) {
    stack = error.stack?.split("\n");
  }
  const msg = {
    src: base,
    type: "error",
    tid: base.tid || "internal",
    message: error.message,
    version: VERSION,
    body,
    stack,
  } satisfies ErrorMsg;
  slogger.logger.Any("ErrorMsg", msg);
  return msg;
}

// export type MsgWithTenantLedger<T extends MsgBase> = T & { readonly tenant: TenantLedger };

export function MsgIsTenantLedger<T extends MsgBase>(msg: T): msg is MsgWithTenantLedger<T> {
  const t = (msg as MsgWithTenantLedger<T>).tenant;
  return !!t && !!t.tenant && !!t.ledger;
}

export interface ReqSignedUrl extends MsgWithTenantLedger<MsgWithOptionalConn> {
  // readonly type: "reqSignedUrl";
  readonly params: ReqSignedUrlParam;
}

export interface GwCtx {
  readonly tid?: string;
  readonly conn?: QSId;
  readonly tenant: TenantLedger;
}

export interface GwCtxConn {
  readonly tid?: string;
  readonly conn: QSId;
  readonly tenant: TenantLedger;
}

export function buildReqSignedUrl<T extends ReqSignedUrl>(
  sthis: NextId,
  type: string,
  params: ReqSignedUrlParam,
  gwCtx: GwCtx
): T {
  return {
    tid: sthis.nextId().str,
    type,
    version: VERSION,
    ...gwCtx,
    params,
  } as T;
}

export interface ResSignedUrl extends MsgWithTenantLedger<MsgWithConn> {
  // readonly type: "resSignedUrl";
  readonly params: SignedUrlParam;
  readonly signedUrl: string;
}

export interface ResOptionalSignedUrl extends MsgWithTenantLedger<MsgWithConn> {
  // readonly type: "resSignedUrl";
  readonly params: SignedUrlParam;
  readonly signedUrl?: string;
}

export interface SuperThisLogger {
  readonly sthis: SuperThis;
  readonly logger: Logger;
}

export async function buildRes<Q extends MsgWithTenantLedger<MsgWithConn<ReqSignedUrl>>, S extends ResSignedUrl>(
  method: SignedUrlParam["method"],
  store: FPStoreTypes,
  type: string,
  slogger: SuperThisLogger,
  req: Q,
  ctx: CalculatePreSignedUrl
): Promise<MsgWithError<S>> {
  const psm = {
    type: "reqSignedUrl",
    version: req.version,
    params: {
      ...req.params,
      method,
      store,
    },
    conn: req.conn,
    tenant: req.tenant,
    tid: req.tid,
  } satisfies PreSignedMsg;
  const rSignedUrl = await ctx.calculatePreSignedUrl(slogger, psm);
  if (rSignedUrl.isErr()) {
    return buildErrorMsg(slogger, req, rSignedUrl.Err());
  }
  return {
    ...req,
    params: psm.params,
    type,
    signedUrl: rSignedUrl.Ok().toString(),
  } as unknown as MsgWithError<S>;
}
