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
  ReqOpen,
  ResGestalt,
  ResOpen,
} from "./msg-types.js";
import { SuperThis } from "@fireproof/core";
import { RequestOpts, WithErrorMsg } from "./msg-processor.js";
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

export type OnMsgFn = (msg: WithErrorMsg<MsgBase>) => void;
export type UnReg = () => void;

export interface ExchangedGestalt {
  readonly my: Gestalt;
  readonly remote: Gestalt;
}

export interface MsgConnection {
  // readonly ws: WebSocket;
  // readonly params: ConnectionKey;
  conn?: ResOpen;
  readonly exchangedGestalt: ExchangedGestalt;
  request<Q extends MsgBase, S extends MsgBase>(req: Q, opts: RequestOpts): Promise<WithErrorMsg<S>>;
  start(): Promise<Result<void>>;
  close(): Promise<Result<void>>;
  onMsg(msg: OnMsgFn): UnReg;
}

function jsonEnDe(sthis: SuperThis) {
  return {
    encode: (node: unknown) => sthis.txt.encode(JSON.stringify(node)),
    decode: (data: Uint8Array) => JSON.parse(sthis.txt.decode(data)),
  } satisfies EnDeCoder;
}

export function defaultMsgParams(sthis: SuperThis, igs: Partial<MsgerParams>): MsgerParams {
  return {
    ende: jsonEnDe(sthis),
    mime: "application/json",
    protocol: "http",
    timeout: 3000,
    ...igs,
  } satisfies MsgerParams;
}

export interface OpenParams {
  readonly timeout: number;
}

export async function applyStart(prC: Promise<Result<MsgConnection>>): Promise<Result<MsgConnection>> {
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

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Msger {
  static async openHttp(
    sthis: SuperThis,
    reqOpen: ReqOpen | undefined,
    urls: URI[],
    msgP: MsgerParams,
    exGestalt: ExchangedGestalt
  ): Promise<Result<MsgConnection>> {
    return Result.Ok(new HttpConnection(sthis, reqOpen, urls, msgP, exGestalt));
  }
  static async openWS(
    sthis: SuperThis,
    qOpen: ReqOpen,
    url: URI,
    msgP: MsgerParams,
    exGestalt: ExchangedGestalt
  ): Promise<Result<MsgConnection>> {
    let ws: WebSocket;
    const { encode } = jsonEnDe(sthis);
    url = url
      .build()
      .setParam("reqOpen", sthis.txt.decode(encode(qOpen)))
      .URI();
    if (runtimeFn().isNodeIsh) {
      const { WebSocket } = await import("ws");
      ws = new WebSocket(url.toString()) as unknown as WebSocket;
    } else {
      ws = new WebSocket(url.toString());
    }
    return Result.Ok(
      new WSConnection(
        sthis,
        {
          reqOpen: qOpen,
          ws,
        },
        msgP,
        exGestalt
      )
    );
  }
  static async open(
    sthis: SuperThis,
    curl: CoerceURI,
    qOpen: ReqOpen,
    imsgP: MsgerParams
  ): Promise<Result<MsgConnection>> {
    // initial exchange with JSON encoding
    const jsGI = defaultMsgParams(sthis, { ...imsgP, ende: jsonEnDe(sthis) });
    const url = URI.from(curl);
    const gs = defaultGestalt(imsgP, { id: "FP-Universal-Client" });
    /*
     * request Gestalt with Http
     */
    const rHC = await Msger.openHttp(sthis, undefined, [url], jsGI, { my: gs, remote: gs });
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
          qOpen,
          exGt.remote.httpEndpoints.map((i) => BuildURI.from(url).resolve(i).URI()),
          msgP,
          exGt
        )
      );
    }
    return applyStart(
      Msger.openWS(sthis, qOpen, BuildURI.from(url).resolve(selectRandom(exGt.remote.wsEndpoints)).URI(), msgP, exGt)
    );
  }

  private constructor() {
    /* */
  }

  // readonly logger: Logger;
  // readonly url: URI;
  // readonly qs: ReqRes<ReqOpen, ResOpen>;
  // constructor(logger: Logger, url: URI, qs: ReqRes<ReqOpen, ResOpen>) {
  //     this.logger = logger;
  //     this.url = url;
  //     this.qs = qs;
  // }
}
