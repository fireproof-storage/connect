import { VERSION } from "@adviser/cement";
import { CRDTEntry } from "@fireproof/core";
import {
  GwCtx,
  MsgBase,
  MsgWithConn,
  MsgWithOptionalConn,
  MsgWithTenantLedger,
  NextId,
  ReqSignedUrlParam,
  ResOptionalSignedUrl,
  SuperThisLogger,
} from "./msg-types.js";

/* Put Meta */
export interface ReqPutMeta extends MsgWithTenantLedger<MsgWithOptionalConn> {
  readonly type: "reqPutMeta";
  readonly params: ReqSignedUrlParam;
  readonly metas: CRDTEntry[];
}

export interface ResPutMeta extends MsgWithTenantLedger<MsgWithConn>, QSMeta {
  readonly type: "resPutMeta";
}

export function buildReqPutMeta(
  sthis: NextId,
  signedUrlParams: ReqSignedUrlParam,
  metas: CRDTEntry[],
  gwCtx: GwCtx
): ReqPutMeta {
  return {
    tid: sthis.nextId().str,
    type: "reqPutMeta",
    ...gwCtx,
    version: VERSION,
    params: signedUrlParams,
    metas,
  };
}

export function MsgIsReqPutMeta(msg: MsgBase): msg is ReqPutMeta {
  return msg.type === "reqPutMeta";
}

export function buildResPutMeta(
  _slogger: SuperThisLogger,
  req: MsgWithTenantLedger<MsgWithConn<ReqPutMeta>>,
  meta: QSMeta
): ResPutMeta {
  return {
    ...meta,
    tid: req.tid,
    conn: req.conn,
    tenant: req.tenant,
    type: "resPutMeta",
    // key: req.key,
    version: VERSION,
  };
}

export function MsgIsResPutMeta(qs: MsgBase): qs is ResPutMeta {
  return qs.type === "resPutMeta";
}

/* Bind Meta */
export interface BindGetMeta extends MsgWithTenantLedger<MsgWithOptionalConn> {
  readonly type: "bindGetMeta";
  readonly params: ReqSignedUrlParam;
}

export function MsgIsBindGetMeta(msg: MsgBase): msg is BindGetMeta {
  return msg.type === "bindGetMeta";
}

export interface QSMeta extends ResOptionalSignedUrl {
  readonly metas: CRDTEntry[];
  readonly keys?: string[];
}

export interface EventGetMeta extends MsgWithTenantLedger<MsgWithConn>, ResOptionalSignedUrl {
  readonly type: "eventGetMeta";
}

export function buildBindGetMeta(sthis: NextId, params: ReqSignedUrlParam, gwCtx: GwCtx): BindGetMeta {
  return {
    tid: sthis.nextId().str,
    ...gwCtx,
    type: "bindGetMeta",
    version: VERSION,
    params,
  };
}

export function buildEventGetMeta(
  _slogger: SuperThisLogger,
  req: MsgWithTenantLedger<MsgWithConn<BindGetMeta>>,
  metaParam: QSMeta,
  gwCtx: GwCtx
): EventGetMeta {
  return {
    ...metaParam,
    ...gwCtx,
    tid: req.tid,
    type: "eventGetMeta",
    params: { ...req.params, method: "GET", store: "meta" },
    version: VERSION,
  };
}

export function MsgIsEventGetMeta(qs: MsgBase): qs is EventGetMeta {
  return qs.type === "eventGetMeta";
}

/* Del Meta */
export interface ReqDelMeta extends MsgWithTenantLedger<MsgWithOptionalConn> {
  readonly type: "reqDelMeta";
  readonly params: ReqSignedUrlParam;
}

export function buildReqDelMeta(sthis: NextId, signedUrlParams: ReqSignedUrlParam, gwCtx: GwCtx): ReqDelMeta {
  return {
    tid: sthis.nextId().str,
    ...gwCtx,
    type: "reqDelMeta",
    version: VERSION,
    params: signedUrlParams,
  };
}

export function MsgIsReqDelMeta(msg: MsgBase): msg is ReqDelMeta {
  return msg.type === "reqDelMeta";
}

export interface ResDelMeta extends MsgWithTenantLedger<MsgWithConn>, ResOptionalSignedUrl {
  readonly type: "resDelMeta";
}

export function buildResDelMeta(
  _slogger: SuperThisLogger,
  req: MsgWithTenantLedger<MsgWithConn<ReqDelMeta>>,
  signedUrl?: string
): ResDelMeta {
  return {
    params: { ...req.params, method: "DELETE", store: "meta" },
    signedUrl,
    tid: req.tid,
    conn: req.conn,
    tenant: req.tenant,
    type: "resDelMeta",
    // key: req.key,
    version: VERSION,
  };
}

export function MsgIsResDelMeta(qs: MsgBase): qs is ResDelMeta {
  return qs.type === "resDelMeta";
}
