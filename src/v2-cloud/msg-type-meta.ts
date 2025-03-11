import { VERSION } from "@adviser/cement";
import { CRDTEntry } from "@fireproof/core";
import {
  AuthType,
  GwCtx,
  MsgBase,
  MsgWithTenantLedger,
  NextId,
  ReqSignedUrlParam,
  ResOptionalSignedUrl,
  MsgTypesCtx,
  MsgWithOptionalConnAuth,
  MsgWithConnAuth,
} from "./msg-types.js";

/* Put Meta */
export interface ReqPutMeta extends MsgWithTenantLedger<MsgWithOptionalConnAuth> {
  readonly type: "reqPutMeta";
  readonly params: ReqSignedUrlParam;
  readonly metas: CRDTEntry[];
}

export interface ResPutMeta extends MsgWithTenantLedger<MsgWithConnAuth>, QSMeta {
  readonly type: "resPutMeta";
}

export function buildReqPutMeta(
  sthis: NextId,
  auth: AuthType,
  signedUrlParams: ReqSignedUrlParam,
  metas: CRDTEntry[],
  gwCtx: GwCtx
): ReqPutMeta {
  return {
    auth,
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
  _msgCtx: MsgTypesCtx,
  req: MsgWithTenantLedger<MsgWithConnAuth<ReqPutMeta>>,
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
export interface BindGetMeta extends MsgWithTenantLedger<MsgWithOptionalConnAuth> {
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

export interface EventGetMeta extends MsgWithTenantLedger<MsgWithConnAuth>, ResOptionalSignedUrl {
  readonly type: "eventGetMeta";
}

export function buildBindGetMeta(sthis: NextId, auth: AuthType, params: ReqSignedUrlParam, gwCtx: GwCtx): BindGetMeta {
  return {
    auth,
    tid: sthis.nextId().str,
    ...gwCtx,
    type: "bindGetMeta",
    version: VERSION,
    params,
  };
}

export function buildEventGetMeta(
  _msgCtx: MsgTypesCtx,
  req: MsgWithTenantLedger<MsgWithConnAuth<BindGetMeta>>,
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
export interface ReqDelMeta extends MsgWithTenantLedger<MsgWithOptionalConnAuth> {
  readonly type: "reqDelMeta";
  readonly params: ReqSignedUrlParam;
}

export function buildReqDelMeta(
  sthis: NextId,
  auth: AuthType,
  signedUrlParams: ReqSignedUrlParam,
  gwCtx: GwCtx
): ReqDelMeta {
  return {
    auth,
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

export interface ResDelMeta extends MsgWithTenantLedger<MsgWithConnAuth>, ResOptionalSignedUrl {
  readonly type: "resDelMeta";
}

export function buildResDelMeta(
  // msgCtx: MsgTypesCtx,
  req: MsgWithTenantLedger<MsgWithConnAuth<ReqDelMeta>>,
  signedUrl?: string
): ResDelMeta {
  return {
    auth: req.auth,
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
