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
  Connection,
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

export class MsgDispatcher {
  readonly sthis: SuperThis;
  readonly logger: Logger;
  conn?: Connection;
  readonly gestalt: Gestalt;
  readonly id: string;

  constructor(sthis: SuperThis, gestalt: Gestalt) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "Dispatcher");
    this.gestalt = gestalt;
    this.id = sthis.nextId().str;
  }

  addConn(aConn: Connection): Result<Connection> {
    if (!this.conn) {
      this.conn = { ...aConn, resId: this.sthis.nextId().str };
      return Result.Ok(this.conn);
    }
    if (aConn.reqId === this.conn.reqId) {
      return Result.Ok(this.conn);
    }
    return this.logger.Error().Msg(`unexpected reqId: ${aConn.reqId}!==${this.conn.reqId}`).ResultError();
  }

  async dispatch(ctx: HonoServerImpl, msg: MsgBase, send: (msg: MsgBase) => void) {
    switch (true) {
      case MsgIsReqGestalt(msg):
        return send(buildResGestalt(msg, this.gestalt));
      case MsgIsReqOpen(msg): {
        if (!msg.conn) {
          return send(buildErrorMsg(this.sthis, this.logger, msg, new Error("missing connection")));
        }
        /* DDoS protection */
        const rConn = this.addConn(msg.conn);
        if (rConn.isErr()) {
          return send(buildErrorMsg(this.sthis, this.logger, msg, rConn.Err()));
        }
        return send(buildResOpen(this.sthis, msg, rConn.Ok().resId));
      }

      case MsgIsReqGetData(msg): {
        return send(await buildResGetData(this.sthis, this.logger, msg, ctx));
      }
      case MsgIsReqPutData(msg): {
        return send(await buildResPutData(this.sthis, this.logger, msg, ctx));
      }
      case MsgIsReqDelData(msg): {
        return send(await buildResDelData(this.sthis, this.logger, msg, ctx));
      }

      case MsgIsReqGetWAL(msg): {
        return send(await buildResGetWAL(this.sthis, this.logger, msg, ctx));
      }
      case MsgIsReqPutWAL(msg): {
        return send(await buildResPutWAL(this.sthis, this.logger, msg, ctx));
      }
      case MsgIsReqDelWAL(msg): {
        return send(await buildResDelWAL(this.sthis, this.logger, msg, ctx));
      }

      default:
        return send(buildErrorMsg(this.sthis, this.logger, msg, new Error("unexpected message")));
    }
  }
}
