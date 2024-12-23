import { Logger, Result, URI, exception2Result } from "@adviser/cement";
import { SuperThis, ensureLogger } from "@fireproof/core";
import { RequestOpts, WithErrorMsg } from "./msg-processor.js";
import { MsgBase, MsgIsResOpen, ReqOpen, ResOpen, buildErrorMsg, MsgerParams } from "./msg-types.js";
import { ExchangedGestalt, MsgConnection, OnMsgFn, selectRandom, timeout, UnReg } from "./msger.js";

export class HttpConnection implements MsgConnection {
  readonly sthis: SuperThis;
  readonly logger: Logger;
  readonly msgParam: MsgerParams;
  readonly exchangedGestalt: ExchangedGestalt;

  readonly baseURIs: URI[];

  readonly qsOpen: {
    readonly req?: ReqOpen;
    res?: ResOpen;
  };

  get conn(): ResOpen | undefined {
    return this.qsOpen.res;
  }

  readonly #onMsg = new Map<string, OnMsgFn>();

  constructor(
    sthis: SuperThis,
    reqOpen: ReqOpen | undefined,
    uris: URI[],
    msgP: MsgerParams,
    exGestalt: ExchangedGestalt
  ) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "HttpConnection");
    this.msgParam = msgP;
    this.baseURIs = uris;
    this.qsOpen = { req: reqOpen };
    this.exchangedGestalt = exGestalt;
  }

  async start(): Promise<Result<void>> {
    if (this.qsOpen.req) {
      const sOpen = await this.request(this.qsOpen.req, { waitFor: MsgIsResOpen });
      if (!MsgIsResOpen(sOpen)) {
        return Result.Err(this.logger.Error().Any("Err", sOpen).Msg("unexpected response").AsError());
      }
      this.qsOpen.res = sOpen;
    }
    return Result.Ok(undefined);
  }

  async close(): Promise<Result<void>> {
    this.#onMsg.clear();
    return Result.Ok(undefined);
  }

  toMsg<S extends MsgBase>(msg: WithErrorMsg<S>): WithErrorMsg<S> {
    this.#onMsg.forEach((fn) => fn(msg));
    return msg;
  }

  onMsg(fn: OnMsgFn): UnReg {
    const key = this.sthis.nextId().str;
    this.#onMsg.set(key, fn);
    return () => this.#onMsg.delete(key);
  }

  async request<Q extends MsgBase, S extends MsgBase>(req: Q, _opts: RequestOpts): Promise<WithErrorMsg<S>> {
    const headers = new Headers();
    headers.append("Content-Type", this.msgParam.mime);
    headers.append("Accept", this.msgParam.mime);
    const rReqBody = exception2Result(() => this.msgParam.ende.encode(req));
    if (rReqBody.isErr()) {
      return this.toMsg(
        buildErrorMsg(
          this.sthis,
          this.logger,
          req,
          this.logger.Error().Err(rReqBody.Err()).Any("req", req).Msg("encode error").AsError()
        )
      );
    }
    headers.append("Content-Length", rReqBody.Ok().byteLength.toString());
    const url = selectRandom(this.baseURIs);
    this.logger.Debug().Url(url).Any("body", req).Msg("request");
    const rRes = await exception2Result(() =>
      timeout(
        this.msgParam.timeout,
        fetch(url.toString(), {
          method: "PUT",
          headers,
          body: rReqBody.Ok(),
        })
      )
    );
    this.logger.Debug().Url(url).Any("body", rRes).Msg("response");
    if (rRes.isErr()) {
      return this.toMsg(
        buildErrorMsg(this.sthis, this.logger, req, this.logger.Error().Err(rRes).Msg("fetch error").AsError())
      );
    }
    const res = rRes.Ok();
    if (!res.ok) {
      return this.toMsg(
        buildErrorMsg(
          this.sthis,
          this.logger,
          req,
          this.logger
            .Error()
            .Url(url)
            .Str("status", res.status.toString())
            .Str("statusText", res.statusText)
            .Msg("HTTP Error")
            .AsError(),
          await res.text()
        )
      );
    }
    const data = new Uint8Array(await res.arrayBuffer());
    const ret = await exception2Result(async () => this.msgParam.ende.decode(data) as S);
    if (ret.isErr()) {
      return this.toMsg(
        buildErrorMsg(
          this.sthis,
          this.logger,
          req,
          this.logger.Error().Err(ret.Err()).Msg("decode error").AsError(),
          this.sthis.txt.decode(data)
        )
      );
    }
    return this.toMsg(ret.Ok());
  }

  // toOnMessage<T extends MsgBase>(msg: WithErrorMsg<T>): Result<WithErrorMsg<T>> {
  //   this.mec.msgFn?.(msg as unknown as MessageEvent<MsgBase>);
  //   return Result.Ok(msg);
  // }
}
