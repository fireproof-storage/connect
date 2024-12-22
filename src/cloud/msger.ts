import { BuildURI, CoerceURI, Result, runtimeFn, URI } from "@adviser/cement";
import { buildReqGestalt, defaultGestalt, GestaltParam, MsgBase, MsgIsResGestalt, ReqGestalt, ReqOpen, ResGestalt, ResOpen } from "./msg-types.js";
import { SuperThis } from "@fireproof/core";
import { RequestOpts, WithErrorMsg } from "./msg-processor.js";
import { HttpConnection } from "./http-connection.js";
import { EnDeCoder, GestaltItem, selectRandom } from "./msg-request.js";
import { WSConnection } from "./ws-connection.js";

// const headers = {
//     "Content-Type": "application/json",
//     "Accept": "application/json",
// };

export type OnMsgFn = (msg: WithErrorMsg<MsgBase>) => void
export type UnReg = () => void

export interface MsgConnection {
  // readonly ws: WebSocket;
  // readonly params: ConnectionKey;
  conn?: ResOpen;
  request<Q extends MsgBase, S extends MsgBase>(req: Q, opts: RequestOpts): Promise<WithErrorMsg<S>>
  start(): Promise<Result<void>>;
  close(): Promise<Result<void>>;
  onMsg(msg: OnMsgFn): UnReg
}

function jsonEnDe(sthis: SuperThis) {
    return {
        encode: (node: unknown) => sthis.txt.encode(JSON.stringify(node)),
        decode: (data: Uint8Array) => JSON.parse(sthis.txt.decode(data)),
    } satisfies EnDeCoder;
}

export function defaultGestaltItem(sthis: SuperThis, igs: GestaltParam): GestaltItem {
    return {
        ende: igs.ende || jsonEnDe(sthis),
        mime: igs.mime || "application/json",
        gestalt: defaultGestalt(igs),
    } satisfies GestaltItem;
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Msger {
    static async openHttp(sthis: SuperThis, reqOpen: ReqOpen|undefined, urls: URI[], gi: GestaltItem): Promise<Result<MsgConnection>> {
        return Result.Ok(new HttpConnection(sthis, reqOpen, urls, gi))
    }
    static async openWS(sthis: SuperThis, qOpen: ReqOpen, url: URI, gs: GestaltItem): Promise<Result<MsgConnection>> {
        let ws: WebSocket;
        const { encode } = jsonEnDe(sthis);
        url = url.build().setParam("reqOpen", sthis.txt.decode(encode(qOpen))).URI();
        if (runtimeFn().isNodeIsh) {
            const { WebSocket }= await import('ws');
            ws = new WebSocket(url.toString()) as unknown as WebSocket;
        } else {
            ws = new WebSocket(url.toString());
        }
        return Result.Ok(new WSConnection(sthis, {
            reqOpen: qOpen,
            ws,
        }, gs))
    }
    static async open(sthis: SuperThis, curl: CoerceURI, qOpen: ReqOpen, igs: GestaltParam): Promise<Result<MsgConnection>> {
        // initial exchange with JSON encoding
        const jsGI = defaultGestaltItem(sthis, { ...igs, ende: jsonEnDe(sthis) });
        const url = URI.from(curl)
        /*
         * request Gestalt with Http
         */
        const rHC = await Msger.openHttp(sthis, undefined, [url], jsGI);
        if (rHC.isErr()) {
            return rHC;
        }
        const hc = rHC.Ok();
        const resGestalt = await hc.request<ReqGestalt, ResGestalt>(buildReqGestalt(sthis, jsGI.gestalt), { waitFor: MsgIsResGestalt });
        if (!MsgIsResGestalt(resGestalt)) {
            return Result.Err(new Error("Invalid Gestalt"));
        }
        await hc.close();
        const gt = resGestalt.gestalt
        const gi = defaultGestaltItem(sthis, igs);
        if (gt.protocolCapabilities.includes("reqRes") && !gt.protocolCapabilities.includes("stream")) {
            return Msger.openHttp(sthis, qOpen, gi.gestalt.httpEndpoints.map(i => BuildURI.from(url).resolve(i).URI()), gi);
        }
        return Msger.openWS(sthis, qOpen, BuildURI.from(url).resolve(selectRandom(gi.gestalt.wsEndpoints)).URI(), gi);
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