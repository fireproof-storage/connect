// import { Future, Logger, exception2Result, Result, CoerceURI, KeyedResolvOnce, URI } from "@adviser/cement";
// import { SuperThis, } from "@fireproof/core";
// import { RequestOpts, } from "./msg-processor.js";
// import { MsgBase, AuthType, Gestalt, defaultGestalt, ResGestalt, ReqGestalt, MsgIsResGestalt, MsgIsError, } from "./msg-types.js";

// import * as json from 'multiformats/codecs/json';
// import * as cborg from '@fireproof/vendor/cborg';
// import { MsgConnection } from "./msger.js";

// export interface EnDeCoder {
//   encode<T>(node: T): Uint8Array;
//   decode<T>(data: Uint8Array): T;
// }

// export interface WaitForTid {
//   readonly tid: string;
//   readonly future: Future<MsgBase>;
//   // undefined match all
//   readonly waitFor: (msg: MsgBase) => boolean;
// }

// export interface FetchGestaltParams {
//   readonly auth?: AuthType;
//   readonly sthis: SuperThis;
//   readonly gestaltURL: URI;
//   readonly uniqServerId?: string;
//   readonly getConn: () => Promise<MsgConnection>;
// }

// export interface HttpConnectionParams {
//   readonly gestaltURL: CoerceURI;
//   readonly fetchConnection?: MsgConnection;
//   readonly ende?: EnDeCoder;
//   readonly uniqServerId?: string;
// }

// export type RequestFN<Q extends MsgBase, S extends MsgBase> = (req: Q, opts: RequestOpts) => Promise<Result<S>>

// const serverId = "FP-Universal-Client"

// export function encoded(logger: Logger, g: "JSON" | "CBOR") {
//   let ende: EnDeCoder
//   let mime: string
//   switch (g) {
//     case "JSON":
//       ende = json
//       mime = "application/json"
//       break;
//     case "CBOR":
//       ende = cborg
//       mime = "application/cbor"
//       break;
//     default:
//       throw logger.Error().Str("typ", g).Msg(`Unknown encoding: ${g}`).AsError()
//   }
//   return { ende, mime }
// }

// const getGestalts = new KeyedResolvOnce<Gestalt>();

// async function fetchGestalt(fgp: FetchGestaltParams): Promise<MsgerParams> {
//   return getGestalts.get(fgp.gestaltURL.toString()).once(async () => {
//     const conn = await fgp.getConn();
//     const rGestalt = await conn.request<ReqGestalt, ResGestalt>({
//       type: "reqGestalt",
//       tid: fgp.sthis.nextId().str,
//       version: serverId,
//       gestalt: defaultGestalt({ id: fgp.uniqServerId || serverId }),
//     }, { waitFor: MsgIsResGestalt });
//     if (MsgIsError(rGestalt)) {
//       throw Error(rGestalt.message)
//     }
//     const gestalt = rGestalt.gestalt
//     const ende = encoded(fgp.sthis.logger, gestalt.encodings[0])
//     return {
//       ende: ende.ende,
//       mime: ende.mime,
//       auth: gestalt.auth,
//       gestalt: gestalt
//     }
//   })
// }

// export function selectRandom<T>(arr: T[]): T {
//   return arr[Math.floor(Math.random() * arr.length)];
// }

// export interface MsgErrorClose {
//   readonly msgFn: (msg: MessageEvent<MsgBase>) => void;
//   readonly errFn: (err: Event) => void;
//   readonly closeFn: () => void;
//   readonly openFn: () => void;
// }

// export interface GestaltParams {
//   readonly auth?: AuthType;
//   readonly sthis: SuperThis;
//   readonly gestaltURL: URI;
//   readonly uniqServerId?: string;
// }

// const keyedHttpConnection = new KeyedResolvOnce<Connection>();
// function httpFactory(sthis: SuperThis, uniqServerId: string, auth?: AuthType): (() => Promise<Connection>) {
//   return () => keyedHttpConnection.get(uniqServerId || serverId).once(async () => {
//     return new HttpConnection(sthis, {
//       ende: json,
//       mime: "application/json",
//       auth: auth,
//       params: defaultGestalt(uniqServerId || serverId, false),
//     })
//   })
// }

// const keyedWSConnection = new KeyedResolvOnce<Connection>();

// export interface Attachable<T> {
//   attach(t: T): Promise<Connection>
// }

// export class WSAttachable implements Attachable<WebSocket> {
//   readonly gestalt: MsgerParams
//   readonly sthis: SuperThis
//   readonly waitForTid = new Map<string, WaitForTid>();
//   constructor(sthis: SuperThis, gestalt: MsgerParams) {
//     this.gestalt = gestalt
//     this.sthis = sthis
//   }
//   attach(t: WebSocket): Promise<Connection> {
//     return keyedWSConnection.get(this.gestalt.params.id).once(async () => {
//       const c = new WSAttachConnection(this.sthis, t, this.waitForTid, {
//         openFn: () => this.open(t),
//         errFn: (err) => this.error(t, err),
//         msgFn: (msg) => this.msg(t, msg),
//         closeFn: () => this.close(t)
//       })
//       return c
//     })
//   }

//   open(ws: WebSocket) {
//     this.sthis.logger.Info().Msg("open")
//   }

//   error(ws: WebSocket, err: Event) {
//     this.sthis.logger.Error().Msg("error")

//   }
//   msg(ws: WebSocket, msg: MessageEvent<MsgBase>) {
//     this.sthis.logger.Info().Any("msg", msg).Msg("msg")
//     ws.onmessage = async (event) => {
//       const rMsg = await exception2Result(() => JSON.parse(event.data) as MsgBase);
//       if (rMsg.isErr()) {
//         this.logger.Error().Err(rMsg).Any(event.data).Msg("Invalid message");
//         return;
//       }
//       const msg = rMsg.Ok();
//       const waitFor = this.waitForTid.get(msg.tid);
//       if (waitFor) {
//         if (MsgIsError(msg)) {
//           this.msgCallbacks.forEach((cb) => cb(msg));
//           this.waitForTid.delete(msg.tid);
//           waitFor.future.resolve(msg);
//         } else if (waitFor.type) {
//           // what for a specific type
//           if (waitFor.type === msg.type) {
//             this.msgCallbacks.forEach((cb) => cb(msg));
//             this.waitForTid.delete(msg.tid);
//             waitFor.future.resolve(msg);
//           } else {
//             this.msgCallbacks.forEach((cb) => cb(msg));
//           }
//         } else {
//           // wild-card
//           this.msgCallbacks.forEach((cb) => cb(msg));
//           this.waitForTid.delete(msg.tid);
//           waitFor.future.resolve(msg);
//         }
//       } else {
//         this.msgCallbacks.forEach((cb) => cb(msg));
//       }
//     };
//   }

//   close(ws: WebSocket) {
//     this.sthis.logger.Info().Msg("close")
//   }

//     // this.params = params;

// }

// export async function getAttachable<T = void>(p: FetchGestaltParams): Promise<Attachable<T>> {
//   const g = await fetchGestalt({
//     gestaltURL: p.gestaltURL,
//     sthis: p.sthis,
//     getConn: httpFactory(p.sthis, p.uniqServerId || serverId, p.auth),
//   })
//   if (g.params.wsEndpoints.length > 0) {
//     return new WSAttachable(p.sthis, g) as Attachable<T>
//   }
//   return {
//     attach: async () => new HttpConnection(p.sthis, g)
//   }
// }

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
