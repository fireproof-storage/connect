import { Logger } from "@adviser/cement";
import { SuperThis, ensureLogger } from "@fireproof/core";
import { Gestalt, MsgBase, buildErrorMsg, MsgWithError, MsgIsWithConn, MsgWithConn, QSId } from "./msg-types.js";

import { PreSignedMsg } from "./pre-signed-url.js";
import { HonoServerImpl } from "./hono-server.js";
import { UnReg } from "./msger.js";

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

export interface MsgDispatcherCtx {
  readonly impl: HonoServerImpl;
}
export interface MsgDispatchItem<S extends MsgBase, Q extends MsgBase> {
  readonly match: (msg: MsgBase) => boolean;
  readonly isNotConn?: boolean;
  fn(sthis: SuperThis, logger: Logger, ctx: MsgDispatcherCtx, msg: Q): Promisable<MsgWithError<S>>;
}

export class MsgDispatcher {
  readonly sthis: SuperThis;
  readonly logger: Logger;
  // wsConn?: WSConnection;
  readonly gestalt: Gestalt;
  readonly id: string;

  readonly connManager = connManager;

  static new(sthis: SuperThis, gestalt: Gestalt): MsgDispatcher {
    return new MsgDispatcher(sthis, gestalt);
  }

  private constructor(sthis: SuperThis, gestalt: Gestalt) {
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

  readonly items = new Map<string, MsgDispatchItem<MsgBase, MsgBase>>();
  registerMsg(...iItems: MsgDispatchItem<MsgBase, MsgBase>[]): UnReg {
    const items = iItems.flat();
    const ids: string[] = items.map((item) => {
      const id = this.sthis.nextId(12).str;
      this.items.set(id, item);
      return id;
    });
    return () => ids.forEach((id) => this.items.delete(id));
  }

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
    const found = Array.from(this.items.values()).find((item) => item.match(msg));
    if (!found) {
      return send(buildErrorMsg(this.sthis, this.logger, msg, new Error("unexpected message")));
    }
    if (!found.isNotConn) {
      return validateConn(msg, (msg) => found.fn(this.sthis, this.logger, { impl: ctx }, msg));
    }
    return send(await found.fn(this.sthis, this.logger, { impl: ctx }, msg));
  }
}
