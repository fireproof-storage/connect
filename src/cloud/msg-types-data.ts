import { VERSION, Logger, Result, URI } from "@adviser/cement";
import { SuperThis } from "@fireproof/core";
import {
  ReqSignedUrl,
  NextId,
  Connection,
  MsgBase,
  ResSignedUrl,
  WithErrorMsg,
  buildRes,
  ReqSignedUrlParam,
} from "./msg-types.js";
import { PreSignedMsg } from "./pre-signed-url.js";

export interface ReqGetData extends ReqSignedUrl {
  readonly type: "reqGetData";
}

export function buildReqGetData(sthis: NextId, sup: ReqSignedUrlParam, conn: Connection): ReqGetData {
  return {
    params: sup,
    conn,
    tid: sthis.nextId().str,
    type: "reqGetData",
    // key: req.key,
    version: VERSION,
  };
}

export function MsgIsReqGetData(msg: MsgBase): msg is ReqGetData {
  return msg.type === "reqGetData";
}

export interface ResGetData extends ResSignedUrl {
  readonly type: "resGetData";
  // readonly payload: Uint8Array; // transfered via JSON base64
}

export function MsgIsResGetData(msg: MsgBase): msg is ResGetData {
  return msg.type === "resGetData";
}

export interface CalculatePreSignedUrl {
  calculatePreSignedUrl(p: PreSignedMsg): Promise<Result<URI>>;
}

export function buildResGetData(
  sthis: SuperThis,
  logger: Logger,
  req: ReqGetData,
  ctx: CalculatePreSignedUrl
): Promise<WithErrorMsg<ResGetData>> {
  return buildRes<ReqGetData, ResGetData>("GET", "data", "resGetData", sthis, logger, req, ctx);
}

export interface ReqPutData extends ReqSignedUrl {
  readonly type: "reqPutData";
  // readonly payload: Uint8Array; // transfered via JSON base64
}

export function MsgIsReqPutData(msg: MsgBase): msg is ReqPutData {
  return msg.type === "reqPutData";
}

export function buildReqPutData(sthis: NextId, sup: ReqSignedUrlParam, conn: Connection): ReqPutData {
  return {
    params: sup,
    conn,
    tid: sthis.nextId().str,
    type: "reqPutData",
    // key: req.key,
    version: VERSION,
  };
}

export interface ResPutData extends ResSignedUrl {
  readonly type: "resPutData";
}

export function MsgIsResPutData(msg: MsgBase): msg is ResPutData {
  return msg.type === "resPutData";
}

export function buildResPutData(
  sthis: SuperThis,
  logger: Logger,
  req: ReqPutData,
  ctx: CalculatePreSignedUrl
): Promise<WithErrorMsg<ResPutData>> {
  return buildRes<ReqPutData, ResPutData>("PUT", "data", "resPutData", sthis, logger, req, ctx);
}

export interface ReqDelData extends ReqSignedUrl {
  readonly type: "reqDelData";
}

export function MsgIsReqDelData(msg: MsgBase): msg is ReqDelData {
  return msg.type === "reqDelData";
}

export function buildReqDelData(sthis: NextId, sup: ReqSignedUrlParam, conn: Connection): ReqDelData {
  return {
    params: sup,
    conn,
    tid: sthis.nextId().str,
    type: "reqDelData",
    // key: req.key,
    version: VERSION,
  };
}

export interface ResDelData extends ResSignedUrl {
  readonly type: "resDelData";
}

export function MsgIsResDelData(msg: MsgBase): msg is ResDelData {
  return msg.type === "resDelData";
}

export function buildResDelData(
  sthis: SuperThis,
  logger: Logger,
  req: ReqDelData,
  ctx: CalculatePreSignedUrl
): Promise<WithErrorMsg<ResDelData>> {
  return buildRes<ReqDelData, ResDelData>("DELETE", "data", "resDelData", sthis, logger, req, ctx);
}
