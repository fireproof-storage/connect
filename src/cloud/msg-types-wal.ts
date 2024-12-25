import { Logger } from "@adviser/cement";
import { SuperThis } from "@fireproof/core";
import {
  MsgBase,
  Connection,
  WithErrorMsg,
  buildRes,
  NextId,
  ReqSignedUrl,
  ResSignedUrl,
  ReqSignedUrlParam,
  buildReqSignedUrl,
} from "./msg-types.js";
import { CalculatePreSignedUrl } from "./msg-types-data.js";

export interface ReqGetWAL extends ReqSignedUrl {
  readonly type: "reqGetWAL";
}

export function MsgIsReqGetWAL(msg: MsgBase): msg is ReqGetWAL {
  return msg.type === "reqGetWAL";
}

export function buildReqGetWAL(sthis: NextId, sup: ReqSignedUrlParam, conn: Connection): ReqGetWAL {
  return buildReqSignedUrl<ReqGetWAL>(sthis, "reqGetWAL", sup, conn);
}

export interface ResGetWAL extends ResSignedUrl {
  readonly type: "resGetWAL";
  // readonly payload: Uint8Array; // transfered via JSON base64
}

export function MsgIsResGetWAL(msg: MsgBase): msg is ResGetWAL {
  return msg.type === "resGetWAL";
}

export function buildResGetWAL(
  sthis: SuperThis,
  logger: Logger,
  req: ReqGetWAL,
  ctx: CalculatePreSignedUrl
): Promise<WithErrorMsg<ResGetWAL>> {
  return buildRes<ReqGetWAL, ResGetWAL>("GET", "wal", "resGetWAL", sthis, logger, req, ctx);
}

export interface ReqPutWAL extends Omit<ReqSignedUrl, "type"> {
  readonly type: "reqPutWAL";
  // readonly payload: Uint8Array; // transfered via JSON base64
}

export function MsgIsReqPutWAL(msg: MsgBase): msg is ReqPutWAL {
  return msg.type === "reqPutWAL";
}

export function buildReqPutWAL(sthis: NextId, sup: ReqSignedUrlParam, conn: Connection): ReqPutWAL {
  return buildReqSignedUrl<ReqPutWAL>(sthis, "reqPutWAL", sup, conn);
}

export interface ResPutWAL extends Omit<ResSignedUrl, "type"> {
  readonly type: "resPutWAL";
}

export function MsgIsResPutWAL(msg: MsgBase): msg is ResPutWAL {
  return msg.type === "resPutWAL";
}

export function buildResPutWAL(
  sthis: SuperThis,
  logger: Logger,
  req: ReqPutWAL,
  ctx: CalculatePreSignedUrl
): Promise<WithErrorMsg<ResPutWAL>> {
  return buildRes<ReqPutWAL, ResPutWAL>("PUT", "wal", "resPutWAL", sthis, logger, req, ctx);
}

export interface ReqDelWAL extends Omit<ReqSignedUrl, "type"> {
  readonly type: "reqDelWAL";
}

export function MsgIsReqDelWAL(msg: MsgBase): msg is ReqDelWAL {
  return msg.type === "reqDelWAL";
}

export function buildReqDelWAL(sthis: NextId, sup: ReqSignedUrlParam, conn: Connection): ReqDelWAL {
  return buildReqSignedUrl<ReqDelWAL>(sthis, "reqDelWAL", sup, conn);
}

export interface ResDelWAL extends Omit<ResSignedUrl, "type"> {
  readonly type: "resDelWAL";
}

export function MsgIsResDelWAL(msg: MsgBase): msg is ResDelWAL {
  return msg.type === "resDelWAL";
}

export function buildResDelWAL(
  sthis: SuperThis,
  logger: Logger,
  req: ReqDelWAL,
  ctx: CalculatePreSignedUrl
): Promise<WithErrorMsg<ResDelWAL>> {
  return buildRes<ReqDelWAL, ResDelWAL>("DELETE", "wal", "resDelWAL", sthis, logger, req, ctx);
}
