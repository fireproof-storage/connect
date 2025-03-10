import { BuildURI, CoerceURI, Result, runtimeFn, URI } from "@adviser/cement";
import {
  buildReqGestalt,
  defaultGestalt,
  EnDeCoder,
  Gestalt,
  MsgBase,
  MsgerParams,
  MsgIsResGestalt,
  RequestOpts,
  ResGestalt,
  MsgWithError,
  MsgWithConn,
  buildReqOpen,
  MsgIsConnected,
  MsgIsError,
  MsgIsResOpen,
  MsgWithOptionalConn,
  QSId,
  MsgIsTid,
  ReqGestalt,
  buildReqClose,
  MsgIsResClose,
  AuthFactory,
} from "./msg-types.js";
import { SuperThis } from "@fireproof/core";
import { HttpConnection } from "./http-connection.js";
import { WSConnection } from "./ws-connection.js";

// const headers = {
//     "Content-Type": "application/json",
//     "Accept": "application/json",
// };

export function selectRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function timeout<T>(ms: number, promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`TIMEOUT after ${ms}ms`));
    }, ms);
    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer));
  });
}

export type OnMsgFn<T extends MsgBase = MsgBase> = (msg: MsgWithError<T>) => void;
export type UnReg = () => void;

export interface ExchangedGestalt {
  readonly my: Gestalt;
  readonly remote: Gestalt;
}

export type OnErrorFn = (msg: Partial<MsgBase>, err: Error) => Partial<MsgBase>;

export interface ActiveStream<S extends MsgBase, Q extends MsgBase> {
  readonly id: string;
  readonly bind: {
    readonly msg: Q;
    readonly opts: RequestOpts;
  };
  timeout?: unknown;
  controller?: ReadableStreamDefaultController<MsgWithError<S>>;
}

export interface MsgRawConnection<T extends MsgBase = MsgBase> {
  // readonly ws: WebSocket;
  // readonly params: ConnectionKey;
  // qsOpen: ReqRes<ReqOpen, ResOpen>;
  readonly sthis: SuperThis;
  readonly exchangedGestalt: ExchangedGestalt;
  readonly activeBinds: Map<string, ActiveStream<T, MsgBase>>;
  bind<S extends T, Q extends T>(req: Q, opts: RequestOpts): ReadableStream<MsgWithError<S>>;
  request<S extends T, Q extends T>(req: Q, opts: RequestOpts): Promise<MsgWithError<S>>;
  send<S extends T, Q extends T>(msg: Q): Promise<MsgWithError<S>>;
  start(): Promise<Result<void>>;
  close(): Promise<Result<void>>;
  onMsg(msg: OnMsgFn<T>): UnReg;
}

export function jsonEnDe(sthis: SuperThis): EnDeCoder {
  return {
    encode: (node: unknown) => sthis.txt.encode(JSON.stringify(node)),
    decode: (data: Uint8Array) => JSON.parse(sthis.txt.decode(data)),
  };
}

export type MsgerParamsWithEnDe = MsgerParams & { readonly ende: EnDeCoder };

export function defaultMsgParams(sthis: SuperThis, igs: Partial<MsgerParamsWithEnDe>): MsgerParamsWithEnDe {
  return {
    mime: "application/json",
    ende: jsonEnDe(sthis),
    timeout: 3000,
    protocolCapabilities: ["reqRes", "stream"],
    ...igs,
  } satisfies MsgerParamsWithEnDe;
}

export interface OpenParams {
  readonly timeout: number;
}

export async function applyStart(prC: Promise<Result<MsgRawConnection>>): Promise<Result<MsgRawConnection>> {
  const rC = await prC;
  if (rC.isErr()) {
    return rC;
  }
  const c = rC.Ok();
  const r = await c.start();
  if (r.isErr()) {
    return Result.Err(r.Err());
  }
  return rC;
}

export class MsgConnected implements MsgRawConnection<MsgWithConn> {
  static async connect(
    authFactory: AuthFactory,
    mrc: Result<MsgRawConnection> | MsgRawConnection,
    conn: Partial<QSId> = {}
  ): Promise<Result<MsgConnected>> {
    if (Result.Is(mrc)) {
      if (mrc.isErr()) {
        return Result.Err(mrc.Err());
      }
      mrc = mrc.Ok();
    }
    const res = await mrc.request(buildReqOpen(mrc.sthis, await authFactory(), conn), { waitFor: MsgIsResOpen });
    if (MsgIsError(res) || !MsgIsResOpen(res)) {
      return mrc.sthis.logger.Error().Err(res).Msg("unexpected response").ResultError();
    }
    return Result.Ok(new MsgConnected(mrc, authFactory, res.conn));
  }

  readonly sthis: SuperThis;
  readonly conn: QSId;
  readonly raw: MsgRawConnection;
  readonly exchangedGestalt: ExchangedGestalt;
  readonly activeBinds: Map<string, ActiveStream<MsgWithConn, MsgBase>>;
  readonly id: string;
  readonly authFactory: AuthFactory;
  private constructor(raw: MsgRawConnection, auth: AuthFactory, conn: QSId) {
    this.sthis = raw.sthis;
    this.raw = raw;
    this.exchangedGestalt = raw.exchangedGestalt;
    this.conn = conn;
    this.authFactory = auth;
    this.activeBinds = raw.activeBinds;
    this.id = this.sthis.nextId().str;
  }

  bind<S extends MsgWithConn, Q extends MsgWithOptionalConn>(
    req: Q,
    opts: RequestOpts
  ): ReadableStream<MsgWithError<S>> {
    const stream = this.raw.bind({ ...req, conn: req.conn || this.conn }, opts);
    const ts = new TransformStream<MsgWithError<S>, MsgWithError<S>>({
      transform: (chunk, controller) => {
        if (!MsgIsTid(chunk, req.tid)) {
          return;
        }
        if (MsgIsConnected(chunk, this.conn)) {
          if (opts.waitFor?.(chunk) || MsgIsError(chunk)) {
            controller.enqueue(chunk);
          }
        }
      },
    });

    // why the hell pipeTo sends an error that is undefined?
    stream.pipeThrough(ts);
    // stream.pipeTo(ts.writable).catch((err) => err && err.message && console.error("bind error", err));
    return ts.readable;
  }

  request<S extends MsgWithConn, Q extends MsgWithOptionalConn>(req: Q, opts: RequestOpts): Promise<MsgWithError<S>> {
    return this.raw.request({ ...req, conn: req.conn || this.conn }, opts);
  }

  send<S extends MsgWithConn, Q extends MsgWithOptionalConn>(msg: Q): Promise<MsgWithError<S>> {
    return this.raw.send({ ...msg, conn: msg.conn || this.conn });
  }

  start(): Promise<Result<void>> {
    return this.raw.start();
  }
  async close(): Promise<Result<void>> {
    await this.request(buildReqClose(this.sthis, await this.authFactory(), this.conn), { waitFor: MsgIsResClose });
    return await this.raw.close();
    // return Result.Ok(undefined);
  }
  onMsg(msgFn: OnMsgFn<MsgWithConn>): UnReg {
    return this.raw.onMsg((msg) => {
      if (MsgIsConnected(msg, this.conn)) {
        msgFn(msg);
      }
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Msger {
  static async openHttp(
    sthis: SuperThis,
    auth: AuthFactory,
    // reqOpen: ReqOpen | undefined,
    urls: URI[],
    msgP: MsgerParamsWithEnDe,
    exGestalt: ExchangedGestalt
  ): Promise<Result<MsgRawConnection>> {
    return Result.Ok(new HttpConnection(sthis, auth, urls, msgP, exGestalt));
  }
  static async openWS(
    sthis: SuperThis,
    authFactory: AuthFactory,
    // qOpen: ReqOpen,
    url: URI,
    msgP: MsgerParamsWithEnDe,
    exGestalt: ExchangedGestalt
  ): Promise<Result<MsgRawConnection>> {
    let ws: WebSocket;
    // const { encode } = jsonEnDe(sthis);
    url = url.build().setParam("random", sthis.nextId().str).URI();
    // .setParam("reqOpen", sthis.txt.decode(encode(qOpen)))
    if (runtimeFn().isNodeIsh) {
      const { WebSocket } = await import("ws");
      ws = new WebSocket(url.toString()) as unknown as WebSocket;
    } else {
      ws = new WebSocket(url.toString());
    }
    return Result.Ok(new WSConnection(sthis, authFactory, ws, msgP, exGestalt));
  }
  static async open(
    sthis: SuperThis,
    auth: AuthFactory,
    curl: CoerceURI,
    imsgP: Partial<MsgerParamsWithEnDe> = {}
  ): Promise<Result<MsgRawConnection>> {
    // initial exchange with JSON encoding
    const jsMsgP = defaultMsgParams(sthis, { ...imsgP, mime: "application/json", ende: jsonEnDe(sthis) });
    const url = URI.from(curl);
    const gs = defaultGestalt(defaultMsgParams(sthis, imsgP), { id: "FP-Universal-Client" });
    /*
     * request Gestalt with Http
     */
    const rHC = await Msger.openHttp(sthis, auth, [url], jsMsgP, { my: gs, remote: gs });
    if (rHC.isErr()) {
      return rHC;
    }
    const hc = rHC.Ok();
    const resGestalt = await hc.request<ResGestalt, ReqGestalt>(buildReqGestalt(sthis, await auth(), gs), {
      waitFor: MsgIsResGestalt,
    });
    if (!MsgIsResGestalt(resGestalt)) {
      return Result.Err(new Error("Invalid Gestalt"));
    }
    await hc.close();
    const exGt = { my: gs, remote: resGestalt.gestalt } satisfies ExchangedGestalt;
    const msgP = defaultMsgParams(sthis, imsgP);
    if (exGt.remote.protocolCapabilities.includes("reqRes") && !exGt.remote.protocolCapabilities.includes("stream")) {
      return applyStart(
        Msger.openHttp(
          sthis,
          auth,
          exGt.remote.httpEndpoints.map((i) => BuildURI.from(url).resolve(i).URI()),
          msgP,
          exGt
        )
      );
    }
    return applyStart(
      Msger.openWS(sthis, auth, BuildURI.from(url).resolve(selectRandom(exGt.remote.wsEndpoints)).URI(), msgP, exGt)
    );
  }

  static connect(
    sthis: SuperThis,
    auth: AuthFactory,
    curl: CoerceURI,
    imsgP: Partial<MsgerParamsWithEnDe> = {},
    conn: Partial<QSId> = {}
  ): Promise<Result<MsgConnected>> {
    return Msger.open(sthis, auth, curl, imsgP).then((srv) => MsgConnected.connect(auth, srv, conn));
  }

  private constructor() {
    /* */
  }
}
