import { Logger } from "@adviser/cement";
import { SuperThis, ensureLogger } from "@fireproof/core";
import {
  Gestalt,
  MsgBase,
  MsgIsReqGestalt,
  buildResGestalt,
  buildErrorMsg,
  buildResOpen,
  MsgWithError,
  MsgIsWithConn,
  MsgWithConn,
  QSId,
  MsgIsReqOpen,
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

// function WithValidConn<T extends MsgBase>(msg: T, rri?: ResOpen): msg is MsgWithConn<T> {
//   return MsgIsWithConn(msg) && !!rri && rri.conn.resId === msg.conn.resId && rri.conn.reqId === msg.conn.reqId;
// }

interface ConnItem {
  conn: QSId;
  touched: Date;
}

class ConnectionManager {
  readonly conns = new Map<string, ConnItem>();
  readonly maxItems: number;

  constructor(maxItems?: number) {
    this.maxItems = maxItems || 100;
  }

  addConn(conn: QSId): QSId {
    if (this.conns.size >= this.maxItems) {
      const oldest = Array.from(this.conns.values());
      const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000).getTime();
      oldest
        .filter((item) => item.touched.getTime() < oneHourAgo)
        .forEach((item) => this.conns.delete(item.conn.resId));
    }
    this.conns.set(`${conn.reqId}:${conn.resId}`, { conn, touched: new Date() });
    return conn;
  }

  isConnected(msg: MsgBase): msg is MsgWithConn<MsgBase> {
    if (!MsgIsWithConn(msg)) {
      return false;
    }
    return this.conns.has(`${msg.conn.reqId}:${msg.conn.resId}`);
  }
}
const connManager = new ConnectionManager();

export class MsgDispatcher {
  readonly sthis: SuperThis;
  readonly logger: Logger;
  // wsConn?: WSConnection;
  readonly gestalt: Gestalt;
  readonly id: string;

  readonly conns = new Map<string, { readonly reqId: string; readonly resId: string; readonly wsc: WSConnection }>();

  constructor(sthis: SuperThis, gestalt: Gestalt) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "Dispatcher");
    this.gestalt = gestalt;
    this.id = sthis.nextId().str;
  }

  // addConn(msg: MsgBase): Result<QSId> {
  //   if (!MsgIsReqOpenWithConn(msg)) {
  //     return this.logger.Error().Msg("msg missing reqId").ResultError();
  //   }
  //   return Result.Ok(connManager.addConn(msg.conn));
  // }

  async dispatch(ctx: HonoServerImpl, msg: MsgBase, send: (msg: MsgBase) => Promisable<Response>): Promise<Response> {
    const validateConn = async <T extends MsgBase>(
      msg: T,
      fn: (msg: MsgWithConn<T>) => Promisable<MsgWithError<MsgBase>>
    ): Promise<Response> => {
      if (!connManager.isConnected(msg)) {
        return send(buildErrorMsg(this.sthis, this.logger, { ...msg }, new Error("dispatch missing connection")));
        // return send(buildErrorMsg(this.sthis, this.logger, msg, new Error("non open connection")));
      }
      // if (WithValidConn(msg, this.myOpen)) {
      const r = await fn(msg);
      return Promise.resolve(send(r));
    };
    switch (true) {
      case MsgIsReqGestalt(msg):
        return send(buildResGestalt(msg, this.gestalt));
      case MsgIsReqOpen(msg): {
        if (!msg.conn) {
          return send(buildErrorMsg(this.sthis, this.logger, msg, new Error("missing connection")));
        }
        if (connManager.isConnected(msg)) {
          return send(buildResOpen(this.sthis, msg, msg.conn.resId));
        }
        const resId = this.sthis.nextId(12).str;
        const resOpen = buildResOpen(this.sthis, msg, resId);
        connManager.addConn(resOpen.conn);
        return send(resOpen);
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
