import { Logger, Result } from "@adviser/cement";
import { SuperThis, ensureLogger } from "@fireproof/core";
import {
  Gestalt,
  MsgBase,
  MsgIsReqGestalt,
  buildResGestalt,
  MsgIsReqOpen,
  buildErrorMsg,
  buildResOpen,
  WithErrorMsg,
  MsgWithConn,
  MsgIsWithReqResId,
  ResOpen,
} from "./msg-types.js";
import {
  MsgIsReqGetData,
  buildResGetData,
  MsgIsReqPutData,
  MsgIsReqDelData,
  buildResDelData,
  buildResPutData,
} from "./msg-types-data.js";
import {
  MsgIsReqDelWAL,
  MsgIsReqGetWAL,
  MsgIsReqPutWAL,
  buildResDelWAL,
  buildResGetWAL,
  buildResPutWAL,
} from "./msg-types-wal.js";
import { PreSignedMsg } from "./pre-signed-url.js";
import { HonoServerImpl } from "./hono-server.js";

export interface MsgContext {
  calculatePreSignedUrl(p: PreSignedMsg): Promise<string>;
}

export interface WSPair {
  readonly client: WebSocket;
  readonly server: WebSocket;
}

export class WSConnection {
  wspair?: WSPair;

  attachWSPair(wsp: WSPair) {
    if (!this.wspair) {
      this.wspair = wsp;
    } else {
      throw new Error("wspair already set");
    }
  }
}

type Promisable<T> = T | Promise<T>;


function WithValidConn<T extends MsgBase>(msg: T, rri?: ResOpen): msg is MsgWithConn<T> {
  return MsgIsWithReqResId(msg) &&
         !!rri &&
         rri.conn.resId === msg.conn.resId &&
         rri.conn.reqId === msg.conn.reqId;
}

export class MsgDispatcher {
  readonly sthis: SuperThis;
  readonly logger: Logger;
  // wsConn?: WSConnection;
  myOpen?: ResOpen;
  readonly gestalt: Gestalt;
  readonly id: string;

  readonly conns = new Map<string, { readonly reqId: string; readonly resId: string; readonly wsc: WSConnection }>();

  constructor(sthis: SuperThis, gestalt: Gestalt) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "Dispatcher");
    this.gestalt = gestalt;
    this.id = sthis.nextId().str;
  }

  addConn(msg: MsgBase): Result<ResOpen> {
    if (!MsgIsReqOpen(msg)) {
      return this.logger.Error().Msg("msg missing reqId").ResultError();
    }
    if (this.myOpen) {
      return this.logger.Error().Msg("myConn set").ResultError();
    }
    this.myOpen = buildResOpen(this.sthis, msg, this.sthis.nextId(12).str);
    return Result.Ok(this.myOpen);
  }

  async dispatch(ctx: HonoServerImpl, msg: MsgBase, send: (msg: MsgBase) => Promisable<Response>): Promise<Response> {
    const validateConn = async <T extends MsgBase>(
      msg: T,
      fn: (msg: MsgWithConn<T>) => Promisable<WithErrorMsg<MsgBase>>
    ): Promise<Response> => {
      if (!MsgIsWithReqResId({ ...msg, conn: this.myOpen?.conn })) {
        return send(buildErrorMsg(this.sthis, this.logger, msg, new Error("dispatch missing connection")));
      }
      if (!MsgIsWithReqResId(msg)) {
        return send(buildErrorMsg(this.sthis, this.logger, msg, new Error("req missing connection")));
      }
      if (WithValidConn(msg, this.myOpen)) {
        const r = await fn(msg);
        return Promise.resolve(send(r));
      }
      return send(buildErrorMsg(this.sthis, this.logger, msg, new Error("non open connection")));
    };
    switch (true) {
      case MsgIsReqGestalt(msg):
        return send(buildResGestalt(msg, this.gestalt));
      case MsgIsReqOpen(msg): {
        if (!msg.conn) {
          return send(buildErrorMsg(this.sthis, this.logger, msg, new Error("missing connection")));
        }
        /* DDoS protection */
        const rConn = this.addConn(msg);
        if (rConn.isErr()) {
          return send(buildErrorMsg(this.sthis, this.logger, msg, rConn.Err()));
        }
        return send(buildResOpen(this.sthis, msg, rConn.Ok().conn.resId));
      }
      case MsgIsReqGetData(msg): {
        return validateConn(msg, (msg) => buildResGetData(this.sthis, this.logger, msg, ctx));
      }
      case MsgIsReqPutData(msg): {
        return validateConn(msg, (msg) => buildResPutData(this.sthis, this.logger, msg, ctx));
      }
      case MsgIsReqDelData(msg): {
        return validateConn(msg, (msg) => buildResDelData(this.sthis, this.logger, msg, ctx));
      }

      case MsgIsReqGetWAL(msg): {
        return validateConn(msg, (msg) => buildResGetWAL(this.sthis, this.logger, msg, ctx));
      }
      case MsgIsReqPutWAL(msg): {
        return validateConn(msg, (msg) => buildResPutWAL(this.sthis, this.logger, msg, ctx));
      }
      case MsgIsReqDelWAL(msg): {
        return validateConn(msg, (msg) => buildResDelWAL(this.sthis, this.logger, msg, ctx));
      }

      default:
        return send(buildErrorMsg(this.sthis, this.logger, msg, new Error("unexpected message")));
    }
  }
}
