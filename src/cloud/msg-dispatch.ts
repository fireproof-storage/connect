import { HttpHeader, Logger, Result } from "@adviser/cement";
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

export class MsgDispatcher {
  readonly sthis: SuperThis;
  readonly logger: Logger;
  readonly conns = new Map<string, Connection>();
  readonly gestalt: Gestalt;

  constructor(sthis: SuperThis, gestalt: Gestalt) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "Dispatcher");
    this.gestalt = gestalt;
  }

  addConn(aConn: Connection): Result<Connection> {
    const key = [aConn.key.ledgerName, aConn.key.tenantId].join(":");
    let conn = this.conns.get(key);
    if (!conn) {
      if (this.conns.size > 0) {
        return Result.Err("connection");
      }
      conn = { ...aConn, resId: this.sthis.nextId().str };
      this.conns.set(key, conn);
    }
    if (conn.reqId !== aConn.reqId) {
      return Result.Err("unexpected reqId");
    }
    return Result.Ok(conn);
  }

  dispatch(msg: MsgBase, send: (msg: MsgBase) => void) {
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
      default:
        return send(buildErrorMsg(this.sthis, this.logger, msg, new Error("unexpected message")));
    }
  }
}
