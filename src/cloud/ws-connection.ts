import { exception2Result, Future, Logger, Result } from "@adviser/cement";
import { SuperThis, ensureLogger } from "@fireproof/core";
import { RequestOpts, WithErrorMsg } from "./msg-processor.js";
import { WaitForTid } from "./msg-request.js";
import { MsgBase, MsgIsError, buildErrorMsg, ReqOpen, ResOpen, MsgIsResOpen, MsgerParams } from "./msg-types.js";
import { ExchangedGestalt, MsgConnection, OnMsgFn, UnReg } from "./msger.js";

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
  readonly msgP: MsgerParams;
  readonly exchangedGestalt: ExchangedGestalt;
  // readonly baseURI: URI;
  readonly wqs: WSQSOpen;

  readonly #onMsg = new Map<string, OnMsgFn>();
  readonly #onClose = new Map<string, UnReg>();

  readonly waitForTid = new Map<string, WaitForTid>();
  opened = false;

  get conn(): ResOpen|undefined {
    return this.wqs.resOpen
  }

  constructor(sthis: SuperThis, wsq: WSReqOpen, msgP: MsgerParams, exGestalt: ExchangedGestalt) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "WSConnection");
    this.msgP = msgP;
    this.exchangedGestalt = exGestalt;
    this.wqs = { ...wsq };
  }

  async start(): Promise<Result<void>> {
    const onOpenFuture: Future<Result<unknown>> = new Future<Result<unknown>>();
    const timer = setTimeout(() => {
      const err = this.logger.Error().Dur("timeout", this.msgP.timeout).Msg("Timeout").AsError()
      this.toMsg(buildErrorMsg(this.sthis, this.logger, { tid: "internal" } as MsgBase, err));
      onOpenFuture.resolve(Result.Err(err));
    }, this.msgP.timeout);
    this.wqs.ws.onopen = () => {
        onOpenFuture.resolve(Result.Ok(undefined));
        this.opened = true;
    }
    this.wqs.ws.onerror = (ierr) => {
        const err =  this.logger.Error().Err(ierr).Msg("WS Error").AsError()
        onOpenFuture.resolve(Result.Err(err));
        this.toMsg(buildErrorMsg(this.sthis, this.logger, { tid: "internal", conn: this.conn } as MsgBase, err));
    }
    this.wqs.ws.onmessage = (evt) => {
        if (!this.opened) {
          this.toMsg(buildErrorMsg(this.sthis, this.logger, { tid: "internal" } as MsgBase, this.logger.Error().Msg("Received message before onOpen").AsError()));
        }
        this.#wsOnMessage(evt);
    }
    this.wqs.ws.onclose = () => {
      this.opened = false;
      this.close().catch((ierr) => {
        const err = this.logger.Error().Err(ierr).Msg("close error").AsError()
        onOpenFuture.resolve(Result.Err(err));
        this.toMsg(buildErrorMsg(this.sthis, this.logger, { tid: "internal" } as MsgBase, err));
      });
    }
    /* wait for onOpen */
    const rOpen = await onOpenFuture.asPromise().finally(() => clearTimeout(timer));
    if (rOpen.isErr()) {
      return rOpen;
    }
    const resOpen = await this.request(this.wqs.reqOpen, { waitFor: MsgIsResOpen })
    if (!MsgIsResOpen(resOpen)) {
      return Result.Err(this.logger.Error().Any("ErrMsg", resOpen).Msg("Invalid response").AsError());
    }
    this.wqs.resOpen = resOpen;
    return Result.Ok(undefined);
  }

  readonly #wsOnMessage = async (event: MessageEvent) => {
    const rMsg = await exception2Result(() => this.msgP.ende.decode(event.data) as MsgBase);
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
    this.wqs.ws.send(this.msgP.ende.encode(msg));
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
