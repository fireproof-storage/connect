import { Logger } from "@adviser/cement";
import { SuperThis } from "@fireproof/core";
import { MsgBase, ErrorMsg, buildErrorMsg } from "./msg-types.js";
import { ExchangedGestalt, OnErrorFn, UnReg } from "./msger.js";

export class MsgRawConnectionBase {
  readonly sthis: SuperThis;
  readonly exchangedGestalt: ExchangedGestalt;

  constructor(sthis: SuperThis, exGestalt: ExchangedGestalt) {
    this.sthis = sthis;
    this.exchangedGestalt = exGestalt;
  }

  readonly onErrorFns = new Map<string, OnErrorFn>();
  onError(fn: OnErrorFn): UnReg {
    const key = this.sthis.nextId().str;
    this.onErrorFns.set(key, fn);
    return () => this.onErrorFns.delete(key);
  }

  buildErrorMsg(logger: Logger, msg: Partial<MsgBase>, err: Error): ErrorMsg {
    // const logLine = this.sthis.logger.Error().Err(err).Any("msg", msg);
    const rmsg = Array.from(this.onErrorFns.values()).reduce((msg, fn) => {
      return fn(msg, err);
    }, msg);
    const emsg = buildErrorMsg(this.sthis, logger, rmsg, err);
    logger.Error().Err(err).Any("msg", rmsg).Msg("connection error");
    return emsg;
  }
}
