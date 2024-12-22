
// export class WSAttachConnection implements Connection {
//     readonly ws: WebSocket;
//     // readonly key: ConnectionKey;
//     readonly sthis: SuperThis;
//     readonly logger: Logger;

//     // readonly errFns = new Map<string, (err: Error) => void>();
//     // readonly closeFns = new Map<string, () => void>();
//     // readonly msgFns = new Map<string, (msg: MsgBase) => void>();

//     readonly waitForTid: WSAttachable["waitForTid"];
//     constructor(sthis: SuperThis, ws: WebSocket, waitForTid: WSAttachable["waitForTid"], mec: MsgErrorClose) {
//       this.ws = ws;
//       // this.key = key;
//       this.sthis = sthis;
//       // this.onClose = onClose;
//       this.logger = ensureLogger(sthis, "WSAttachConnection", {
//         this: true,
//       });
//       this.waitForTid = waitForTid;
//       ws.onmessage = mec.msgFn
//       ws.onopen = mec.openFn;
//       ws.onerror = mec.errFn
//       ws.onclose = mec.closeFn
//     }

//     async close(): Promise<void> {
//       this.logger.Debug().Msg("close");
//       this.ws.close();
//     }

//     async request<Q extends MsgBase, S extends MsgBase>(req: Q, opts: RequestOpts): Promise<Result<S>> {
//       opts = {
//         ...{
//           timeout: 1000,
//         },
//         ...opts,
//       };
//       const future = new Future<MsgBase>();
//       this.waitForTid.set(req.tid, {
//         tid: req.tid,
//         future,
//         type: opts.waitType,
//       });
//       const start = Date.now();
//       const logger = ensureLogger(this.sthis, "ConnectionImpl.request")
//         .With()
//         .Str("tid", req.tid)
//         .Uint64("timeout", opts.timeout)
//         .Ref("start", () => new Date().getTime() - start)
//         .Any("req", req)
//         .Logger();
//       this.ws.send(JSON.stringify(req));
//       const clean = setTimeout(() => {
//         this.waitForTid.delete(req.tid);
//         future.reject(new Error("Timeout"));
//       }, opts.timeout);
//       // add timeout handling
//       logger.Debug().Msg("request-enter");
//       return future
//         .asPromise()
//         .finally(() => clearTimeout(clean))
//         .then((res) => {
//           logger.Debug().Any("res", res).Msg("request-ok");
//           return Result.Ok(res as S);
//         })
//         .catch((err) => {
//           logger.Error().Err(err).Msg("request-error");
//           return Result.Ok(buildErrorMsg(this.logger, req, err) as MsgBase as S);
//         });
//     }
//   }


import { exception2Result, Future, Logger, Result } from "@adviser/cement";
import { SuperThis, ensureLogger } from "@fireproof/core";
import { RequestOpts, WithErrorMsg } from "./msg-processor.js";
import { GestaltItem, WaitForTid } from "./msg-request.js";
import { MsgBase, MsgIsError, buildErrorMsg, ReqOpen, ResOpen, MsgIsResOpen } from "./msg-types.js";
import { MsgConnection, OnMsgFn, UnReg } from "./msger.js";

export interface WSReqOpen {
  readonly reqOpen: ReqOpen;
  readonly ws: WebSocket; // this WS is opened with a specific URL-Param
}

interface WSQSOpen extends WSReqOpen {
  resOpen?: ResOpen;
}

export class WSConnection implements MsgConnection {
  readonly sthis: SuperThis;
  readonly logger: Logger;
  readonly gestaltItem: GestaltItem;
  // readonly baseURI: URI;
  readonly wqs: WSQSOpen;

  readonly #onMsg = new Map<string, OnMsgFn>();
  readonly #onClose = new Map<string, UnReg>();

  readonly waitForTid = new Map<string, WaitForTid>();
  opened = false;

  get conn(): ResOpen|undefined {
    return this.wqs.resOpen
  }

  constructor(sthis: SuperThis, wsq: WSReqOpen, gi: GestaltItem) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "WSConnection");
    this.gestaltItem = gi;
    // this.baseURI = uri;
    this.wqs = { ...wsq };
  }

  async start(): Promise<Result<void>> {
    const onOpenFuture = new Future<void>();
    this.wqs.ws.onopen = () => {
        onOpenFuture.resolve();
        this.opened = true;
    }
    this.wqs.ws.onerror = (err) => {
        this.toMsg(buildErrorMsg(this.sthis, this.logger, { tid: "internal" } as MsgBase, this.logger.Error().Err(err).Msg("WS Error").AsError()));
    }
    this.wqs.ws.onmessage = (evt) => {
        if (!this.opened) {
          this.toMsg(buildErrorMsg(this.sthis, this.logger, { tid: "internal" } as MsgBase, this.logger.Error().Msg("Received message before onOpen").AsError()));
        }
        this.#wsOnMessage(evt);
    }
    this.wqs.ws.onclose = () => {
      this.opened = false;
      this.close().catch((err) => this.logger.Error().Err(err).Msg("close error"));
    }
    /* wait for onOpen */
    await onOpenFuture.asPromise()
    const resOpen = await this.request(this.wqs.reqOpen, { waitFor: MsgIsResOpen })
    if (!MsgIsResOpen(resOpen)) {
      return Result.Err(this.logger.Error().Any("ErrMsg", resOpen).Msg("Invalid response").AsError());
    }
    this.wqs.resOpen = resOpen;
    return Result.Ok(undefined);
  }

  readonly #wsOnMessage = async (event: MessageEvent) => {
    const rMsg = await exception2Result(() => this.gestaltItem.ende.decode(event.data) as MsgBase);
    if (rMsg.isErr()) {
      this.logger.Error().Err(rMsg).Any(event.data).Msg("Invalid message");
      return;
    }
    const msg = rMsg.Ok();
    const waitFor = this.waitForTid.get(msg.tid);
    this.#onMsg.forEach((cb) => cb(msg));
    if (waitFor) {
      if (MsgIsError(msg)) {
        this.waitForTid.delete(msg.tid);
        waitFor.future.resolve(msg);
      } else if (waitFor.waitFor(msg)) {
        // what for a specific type
        this.waitForTid.delete(msg.tid);
        waitFor.future.resolve(msg);
      } else {
        // wild-card
        this.waitForTid.delete(msg.tid);
        waitFor.future.resolve(msg);
      }
    }
  }

  async close(): Promise<Result<void>> {
    this.#onClose.forEach((fn) => fn());
    this.#onClose.clear();
    this.#onMsg.clear();
    this.wqs.ws.close();
    return Result.Ok(undefined);
  }

  toMsg<S extends MsgBase>(msg: WithErrorMsg<S>): WithErrorMsg<S> {
    this.#onMsg.forEach((fn) => fn(msg));
    return msg;
  }

  async sendMsg(msg: MsgBase): Promise<void> {
    this.wqs.ws.send(this.gestaltItem.ende.encode(msg));
  }

  onMsg(fn: OnMsgFn): UnReg {
    const key = this.sthis.nextId().str
    this.#onMsg.set(key, fn);
    return () => this.#onMsg.delete(key);
  }

  onClose(fn: UnReg): UnReg {
    const key = this.sthis.nextId().str
    this.#onClose.set(key, fn);
    return () => this.#onClose.delete(key);
  }

  async request<Q extends MsgBase, S extends MsgBase>(req: Q, opts: RequestOpts): Promise<WithErrorMsg<S>> {
    if (!this.opened) {
      return buildErrorMsg(this.sthis, this.logger, req, this.logger.Error().Msg("Connection not open").AsError());
    }
    const future = new Future<S>();
    this.waitForTid.set(req.tid, { tid: req.tid, future, waitFor: opts.waitFor });
    await this.sendMsg(req);
    return future.asPromise()
  }

  // toOnMessage<T extends MsgBase>(msg: WithErrorMsg<T>): Result<WithErrorMsg<T>> {
  //   this.mec.msgFn?.(msg as unknown as MessageEvent<MsgBase>);
  //   return Result.Ok(msg);
  // }

}
