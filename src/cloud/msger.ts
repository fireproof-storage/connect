import { BuildURI, CoerceURI, Result, runtimeFn, URI } from "@adviser/cement";
import {
  buildReqGestalt,
  defaultGestalt,
  EnDeCoder,
  Gestalt,
  MsgBase,
  MsgerParams,
  MsgIsResGestalt,
  ReqGestalt,
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

export interface MsgRawConnection<T extends MsgBase = MsgBase> {
  // readonly ws: WebSocket;
  // readonly params: ConnectionKey;
  // qsOpen: ReqRes<ReqOpen, ResOpen>;
  readonly sthis: SuperThis;
  readonly exchangedGestalt: ExchangedGestalt;
  request<Q extends T, S extends T>(req: Q, opts: RequestOpts): Promise<MsgWithError<S>>;
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
    mrc: Result<MsgRawConnection> | MsgRawConnection,
    conn: Partial<QSId> = {}
  ): Promise<Result<MsgConnected>> {
    if (Result.Is(mrc)) {
      if (mrc.isErr()) {
        return Result.Err(mrc.Err());
      }
      mrc = mrc.Ok();
    }
    const res = await mrc.request(buildReqOpen(mrc.sthis, conn), { waitFor: MsgIsResOpen });
    if (MsgIsError(res) || !MsgIsResOpen(res)) {
      return mrc.sthis.logger.Error().Err(res).Msg("unexpected response").ResultError();
    }
    return Result.Ok(new MsgConnected(mrc, res.conn));
  }

  readonly sthis: SuperThis;
  readonly conn: QSId;
  readonly raw: MsgRawConnection;
  readonly exchangedGestalt: ExchangedGestalt;
  private constructor(raw: MsgRawConnection, conn: QSId) {
    this.sthis = raw.sthis;
    this.raw = raw;
    this.exchangedGestalt = raw.exchangedGestalt;
    this.conn = conn;
  }

  request<Q extends MsgWithOptionalConn, S extends MsgWithConn>(req: Q, opts: RequestOpts): Promise<MsgWithError<S>> {
    return this.raw.request({ ...req, conn: req.conn || this.conn }, opts);
  }
  start(): Promise<Result<void>> {
    return this.raw.start();
  }
  close(): Promise<Result<void>> {
    return this.raw.close();
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
    // reqOpen: ReqOpen | undefined,
    urls: URI[],
    msgP: MsgerParamsWithEnDe,
    exGestalt: ExchangedGestalt
  ): Promise<Result<MsgRawConnection>> {
    return Result.Ok(new HttpConnection(sthis, urls, msgP, exGestalt));
  }
  static async openWS(
    sthis: SuperThis,
    // qOpen: ReqOpen,
    url: URI,
    msgP: MsgerParamsWithEnDe,
    exGestalt: ExchangedGestalt
  ): Promise<Result<MsgRawConnection>> {
    let ws: WebSocket;
    // const { encode } = jsonEnDe(sthis);
    url = url.build().URI();
    // .setParam("reqOpen", sthis.txt.decode(encode(qOpen)))
    if (runtimeFn().isNodeIsh) {
      const { WebSocket } = await import("ws");
      ws = new WebSocket(url.toString()) as unknown as WebSocket;
    } else {
      ws = new WebSocket(url.toString());
    }
    return Result.Ok(new WSConnection(sthis, ws, msgP, exGestalt));
  }
  static async open(
    sthis: SuperThis,
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
    const rHC = await Msger.openHttp(sthis, [url], jsMsgP, { my: gs, remote: gs });
    if (rHC.isErr()) {
      return rHC;
    }
    const hc = rHC.Ok();
    const resGestalt = await hc.request<ReqGestalt, ResGestalt>(buildReqGestalt(sthis, gs), {
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
          exGt.remote.httpEndpoints.map((i) => BuildURI.from(url).resolve(i).URI()),
          msgP,
          exGt
        )
      );
    }
    return applyStart(
      Msger.openWS(sthis, BuildURI.from(url).resolve(selectRandom(exGt.remote.wsEndpoints)).URI(), msgP, exGt)
    );
  }

  static connect(
    sthis: SuperThis,
    curl: CoerceURI,
    imsgP: Partial<MsgerParamsWithEnDe> = {},
    conn: Partial<QSId> = {}
  ): Promise<Result<MsgConnected>> {
    return Msger.open(sthis, curl, imsgP).then((srv) => MsgConnected.connect(srv, conn));
  }

  private constructor() {
    /* */
  }
}
