import { Logger, SuperThis } from "@fireproof/core";

export interface MsgBase {
  readonly tid: string;
  readonly type: string;
  readonly version: string;
}

export interface ErrorMsg extends MsgBase {
  readonly type: "error";
  readonly message: string;
}
export function MsgIsError(msg: MsgBase): msg is ErrorMsg {
  return msg.type === "error";
}

export type HttpMethods = "GET" | "PUT" | "DELETE";
export type FPStoreTypes = "meta" | "data" | "wal";

export interface ConnectionKey {
  // readonly protocol: "ws" | "wss"; // ws or wss
  readonly tendantId: string;
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

export interface ReqSignedUrlParam {
  readonly tid?: string;
  readonly type?: "reqSignedUrl";
  readonly version?: string;
  readonly params: {
    // readonly protocol?: "ws" | "wss"; // ws or wss
    readonly tendantId: string;
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

export function buildReqSignedUrl(sthis: SuperThis, req: ReqSignedUrlParam): ReqSignedUrl {
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

export function buildResSignedUrl(req: ReqSignedUrl, signedUrl: string): ResSignedUrl {
  return {
    tid: req.tid,
    type: "resSignedUrl",
    version: VERSION,
    params: req.params,
    signedUrl,
  };
}

export function buildErrorMsg(logger: Logger, base: MsgBase, error: Error): ErrorMsg {
  const msg = {
    type: "error",
    tid: base.tid,
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
