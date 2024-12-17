import { Future, Logger, exception2Result, Result, CoerceURI, KeyedResolvOnce, URI } from "@adviser/cement";
import { SuperThis, ensureLogger } from "@fireproof/core";
import { RequestOpts, WithErrorMsg } from "./msg-processor.js";
import { MsgBase, AuthType, Gestalt, defaultGestalt, ResGestalt, ReqGestalt, buildErrorMsg } from "./msg-types.js";

import * as json from 'multiformats/codecs/json';
import * as cborg from '@fireproof/vendor/cborg';

export interface EnDeCoder {
  encode<T>(node: T): Uint8Array;
  decode<T>(data: Uint8Array): T;
}

export interface WaitForTid {
  readonly tid: string;
  readonly future: Future<MsgBase>;
  // undefined match all
  readonly type?: string;
}

export interface Connection {
  // readonly ws: WebSocket;
  // readonly params: ConnectionKey;
  request<Q extends MsgBase, S extends MsgBase>(req: Q, opts: RequestOpts): Promise<Result<WithErrorMsg<S>>>

}

export interface FetchGestaltParams {
  readonly auth?: AuthType;
  readonly sthis: SuperThis;
  readonly gestaltURL: URI;
  readonly uniqServerId?: string;
  readonly getConn: () => Promise<Connection>;
}

export interface HttpConnectionParams {
  readonly gestaltURL: CoerceURI;
  readonly fetchConnection?: Connection;
  readonly ende?: EnDeCoder;
  readonly uniqServerId?: string;
}

export interface GestaltItem {
  readonly ende: EnDeCoder;
  readonly mime: string;
  readonly auth?: AuthType;
  readonly params: Gestalt;
}

export type RequestFN<Q extends MsgBase, S extends MsgBase> = (req: Q, opts: RequestOpts) => Promise<Result<S>>

const serverId = "FP-Universal-Client"

export function encoded(logger: Logger, g: "JSON" | "CBOR") {
  let ende: EnDeCoder
  let mime: string
  switch (g) {
    case "JSON":
      ende = json
      mime = "application/json"
      break;
    case "CBOR":
      ende = cborg
      mime = "application/cbor"
      break;
    default:
      throw logger.Error().Str("typ", g).Msg(`Unknown encoding: ${g}`).AsError()
  }
  return { ende, mime }
}

const getGestalts = new KeyedResolvOnce<Gestalt>();

async function fetchGestalt(fgp: FetchGestaltParams): Promise<GestaltItem> {
  return getGestalts.get(fgp.gestaltURL.toString()).once(async () => {
    const conn = await fgp.getConn();
    const rGestalt = await conn.request<ReqGestalt, ResGestalt>({
      type: "reqGestalt",
      tid: fgp.sthis.nextId().str,
      version: serverId,
      gestalt: defaultGestalt(fgp.uniqServerId || serverId, false),
    }, { waitType: "resGestalt" });
    if (rGestalt.isErr()) {
      throw rGestalt.Err();
    }
    const gestalt = rGestalt.Ok() as ResGestalt;
    const ende = encoded(fgp.sthis.logger, gestalt.params.encodings[0])
    return {
      ende: ende.ende,
      mime: ende.mime,
      auth: gestalt.auth,
      params: gestalt.params
    }
  })
}

function selectRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class HttpConnection implements Connection {
  readonly sthis: SuperThis;
  readonly logger: Logger;
  readonly gestaltItem: GestaltItem;
  readonly mec: MsgErrorClose;
  constructor(sthis: SuperThis, gi: GestaltItem, mec: MsgErrorClose = {}) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "HttpConnection");
    this.gestaltItem = gi;
    this.mec = mec;
  }

  async request<Q extends MsgBase, S extends MsgBase>(req: Q, _opts: RequestOpts): Promise<Result<WithErrorMsg<S>>> {
    const headers = new Headers();
    headers.append("Content-Type", this.gestaltItem.mime);
    headers.append("Accept", this.gestaltItem.mime);
    const rReqBody = exception2Result(() => this.gestaltItem.ende.encode(req));
    if (rReqBody.isErr()) {
      return this.toOnMessage(buildErrorMsg(this.logger, req,
        this.logger.Error().Err(rReqBody.Err()).Msg("encode error").AsError()
      ));
    }
    headers.append("Content-Length", rReqBody.Ok().byteLength.toString());
    const url = selectRandom(this.gestaltItem.params.httpEndpoints)
    const rRes = await exception2Result(() => fetch(url, {
      method: "PUT",
      headers,
      body: rReqBody.Ok(),
    }));
    if (rRes.isErr()) {
      return this.toOnMessage(buildErrorMsg(this.logger, req,
        this.logger.Error().Err(rRes.Ok()).Msg("fetch error").AsError()
      ));
    }
    const res = rRes.Ok();
    if (!res.ok) {
      return this.toOnMessage(
        buildErrorMsg(this.logger, req, this.logger.Error()
        .Url(url)
        .Str("status", res.status.toString())
        .Str("statusText", res.statusText).Msg("HTTP Error").AsError()));
    }
    const data = new Uint8Array(await res.arrayBuffer());
    const ret = await exception2Result(async () => this.gestaltItem.ende.decode(data) as S);
    if (ret.isErr()) {
      return this.toOnMessage(buildErrorMsg(this.logger, req,
        this.logger.Error().Err(ret.Err()).Msg("decode error").AsError()
      ));
    }
    return this.toOnMessage(ret.Ok())
  }

  toOnMessage<T extends MsgBase>(msg: WithErrorMsg<T>): Result<WithErrorMsg<T>> {
    this.mec.msgFn?.(msg as unknown as MessageEvent<MsgBase>);
    return Result.Ok(msg);
  }

}

export interface MsgErrorClose {
  readonly msgFn: (msg: MessageEvent<MsgBase>) => void;
  readonly errFn: (err: Event) => void;
  readonly closeFn: () => void;
  readonly openFn: () => void;
}

export class WSAttachConnection implements Connection {
  readonly ws: WebSocket;
  // readonly key: ConnectionKey;
  readonly sthis: SuperThis;
  readonly logger: Logger;

  // readonly errFns = new Map<string, (err: Error) => void>();
  // readonly closeFns = new Map<string, () => void>();
  // readonly msgFns = new Map<string, (msg: MsgBase) => void>();

  readonly waitForTid: WSAttachable["waitForTid"];
  constructor(sthis: SuperThis, ws: WebSocket, waitForTid: WSAttachable["waitForTid"], mec: MsgErrorClose) {
    this.ws = ws;
    // this.key = key;
    this.sthis = sthis;
    // this.onClose = onClose;
    this.logger = ensureLogger(sthis, "WSAttachConnection", {
      this: true,
    });
    this.waitForTid = waitForTid;
    ws.onmessage = mec.msgFn
    ws.onopen = mec.openFn;
    ws.onerror = mec.errFn
    ws.onclose = mec.closeFn
  }

  async close(): Promise<void> {
    this.logger.Debug().Msg("close");
    this.ws.close();
  }

  async request<Q extends MsgBase, S extends MsgBase>(req: Q, opts: RequestOpts): Promise<Result<S>> {
    opts = {
      ...{
        timeout: 1000,
      },
      ...opts,
    };
    const future = new Future<MsgBase>();
    this.waitForTid.set(req.tid, {
      tid: req.tid,
      future,
      type: opts.waitType,
    });
    const start = Date.now();
    const logger = ensureLogger(this.sthis, "ConnectionImpl.request")
      .With()
      .Str("tid", req.tid)
      .Uint64("timeout", opts.timeout)
      .Ref("start", () => new Date().getTime() - start)
      .Any("req", req)
      .Logger();
    this.ws.send(JSON.stringify(req));
    const clean = setTimeout(() => {
      this.waitForTid.delete(req.tid);
      future.reject(new Error("Timeout"));
    }, opts.timeout);
    // add timeout handling
    logger.Debug().Msg("request-enter");
    return future
      .asPromise()
      .finally(() => clearTimeout(clean))
      .then((res) => {
        logger.Debug().Any("res", res).Msg("request-ok");
        return Result.Ok(res as S);
      })
      .catch((err) => {
        logger.Error().Err(err).Msg("request-error");
        return Result.Ok(buildErrorMsg(this.logger, req, err) as MsgBase as S);
      });
  }
}



export interface GestaltParams {
  readonly auth?: AuthType;
  readonly sthis: SuperThis;
  readonly gestaltURL: URI;
  readonly uniqServerId?: string;
}

const keyedHttpConnection = new KeyedResolvOnce<Connection>();
function httpFactory(sthis: SuperThis, uniqServerId: string, auth?: AuthType): (() => Promise<Connection>) {
  return () => keyedHttpConnection.get(uniqServerId || serverId).once(async () => {
    return new HttpConnection(sthis, {
      ende: json,
      mime: "application/json",
      auth: auth,
      params: defaultGestalt(uniqServerId || serverId, false),
    })
  })
}

const keyedWSConnection = new KeyedResolvOnce<Connection>();

export interface Attachable<T> {
  attach(t: T): Promise<Connection>
}

export class WSAttachable implements Attachable<WebSocket> {
  readonly gestalt: GestaltItem
  readonly sthis: SuperThis
  readonly waitForTid = new Map<string, WaitForTid>();
  constructor(sthis: SuperThis, gestalt: GestaltItem) {
    this.gestalt = gestalt
    this.sthis = sthis
  }
  attach(t: WebSocket): Promise<Connection> {
    return keyedWSConnection.get(this.gestalt.params.id).once(async () => {
      const c = new WSAttachConnection(this.sthis, t, this.waitForTid, {
        openFn: () => this.open(t),
        errFn: (err) => this.error(t, err),
        msgFn: (msg) => this.msg(t, msg),
        closeFn: () => this.close(t)
      })
      return c
    })
  }

  open(ws: WebSocket) {
    this.sthis.logger.Info().Msg("open")
  }

  error(ws: WebSocket, err: Event) {
    this.sthis.logger.Error().Msg("error")

  }
  msg(ws: WebSocket, msg: MessageEvent<MsgBase>) {
    this.sthis.logger.Info().Any("msg", msg).Msg("msg")
    ws.onmessage = async (event) => {
      const rMsg = await exception2Result(() => JSON.parse(event.data) as MsgBase);
      if (rMsg.isErr()) {
        this.logger.Error().Err(rMsg).Any(event.data).Msg("Invalid message");
        return;
      }
      const msg = rMsg.Ok();
      const waitFor = this.waitForTid.get(msg.tid);
      if (waitFor) {
        if (MsgIsError(msg)) {
          this.msgCallbacks.forEach((cb) => cb(msg));
          this.waitForTid.delete(msg.tid);
          waitFor.future.resolve(msg);
        } else if (waitFor.type) {
          // what for a specific type
          if (waitFor.type === msg.type) {
            this.msgCallbacks.forEach((cb) => cb(msg));
            this.waitForTid.delete(msg.tid);
            waitFor.future.resolve(msg);
          } else {
            this.msgCallbacks.forEach((cb) => cb(msg));
          }
        } else {
          // wild-card
          this.msgCallbacks.forEach((cb) => cb(msg));
          this.waitForTid.delete(msg.tid);
          waitFor.future.resolve(msg);
        }
      } else {
        this.msgCallbacks.forEach((cb) => cb(msg));
      }
    };
  }

  close(ws: WebSocket) {
    this.sthis.logger.Info().Msg("close")
  }

    // this.params = params;

}

export async function getAttachable<T = void>(p: FetchGestaltParams): Promise<Attachable<T>> {
  const g = await fetchGestalt({
    gestaltURL: p.gestaltURL,
    sthis: p.sthis,
    getConn: httpFactory(p.sthis, p.uniqServerId || serverId, p.auth),
  })
  if (g.params.wsEndpoints.length > 0) {
    return new WSAttachable(p.sthis, g) as Attachable<T>
  }
  return {
    attach: async () => new HttpConnection(p.sthis, g)
  }
}



// export class ConnectionImpl implements Connection {
//   readonly sthis: SuperThis;
//   constructor(sthis: SuperThis) {
//     this.sthis = sthis;
//   }



//   async request<Q extends MsgBase, S extends MsgBase>(req: Q, opts: RequestOpts): Promise<Result<S>> {

//   }


// }

// export class ConnectionImpl implements Connection {

// }
