import { SuperThis } from "@fireproof/core";
import { MsgBase, buildErrorMsg, MsgWithError, QSId, MsgWithConnAuth } from "./msg-types.js";

import { PreSignedMsg } from "./pre-signed-url.js";
import { ExposeCtxItemWithImpl, HonoServerImpl, WSContextWithId } from "./hono-server.js";
import { UnReg } from "./msger.js";
import { WSRoom } from "./ws-room.js";

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

export type Promisable<T> = T | Promise<T>;

// function WithValidConn<T extends MsgBase>(msg: T, rri?: ResOpen): msg is MsgWithConn<T> {
//   return MsgIsWithConn(msg) && !!rri && rri.conn.resId === msg.conn.resId && rri.conn.reqId === msg.conn.reqId;
// }

export interface ConnItem<T = unknown> {
  readonly conn: QSId;
  touched: Date;
  readonly ws: WSContextWithId<T>;
}

// const connManager = new ConnectionManager();

export interface ConnectionInfo {
  readonly conn: WSConnection;
  readonly reqId: string;
  readonly resId: string;
}

export interface MsgDispatcherCtx extends ExposeCtxItemWithImpl<WSRoom> {
  readonly id: string;
  readonly impl: HonoServerImpl;
  // readonly auth: AuthFactory;
  readonly ws: WSContextWithId<unknown>;
}

export interface MsgDispatchItem<S extends MsgBase, Q extends MsgBase> {
  readonly match: (msg: MsgBase) => boolean;
  readonly isNotConn?: boolean;
  fn(ctx: MsgDispatcherCtx, msg: Q): Promisable<MsgWithError<S>>;
}

export class MsgDispatcher {
  readonly sthis: SuperThis;
  // readonly logger: Logger;
  // // wsConn?: WSConnection;
  // readonly gestalt: Gestalt;
  readonly id: string;
  // readonly ende: EnDeCoder;

  // // readonly connManager = connManager;

  // readonly wsRoom: WSRoom;

  static new(sthis: SuperThis /*, gestalt: Gestalt, ende: EnDeCoder, wsRoom: WSRoom*/): MsgDispatcher {
    return new MsgDispatcher(sthis /*, gestalt, ende, wsRoom*/);
  }

  private constructor(sthis: SuperThis /*, gestalt: Gestalt, ende: EnDeCoder, wsRoom: WSRoom*/) {
    this.sthis = sthis;
    // this.logger = ensureLogger(sthis, "Dispatcher");
    // this.gestalt = gestalt;
    this.id = sthis.nextId().str;
    // this.ende = ende;
    // this.wsRoom = wsRoom;
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

  send(ctx: MsgDispatcherCtx, msg: MsgBase) {
    const str = ctx.ende.encode(msg);
    ctx.ws.send(str);
    return new Response(str);
  }

  async dispatch(ctx: MsgDispatcherCtx, msg: MsgBase): Promise<Response> {
    const validateConn = async <T extends MsgBase>(
      msg: T,
      fn: (msg: MsgWithConnAuth<T>) => Promisable<MsgWithError<MsgBase>>
    ): Promise<Response> => {
      if (!ctx.wsRoom.isConnected(msg)) {
        return this.send(ctx, buildErrorMsg(ctx, { ...msg }, new Error("dispatch missing connection")));
        // return send(buildErrorMsg(this.sthis, this.logger, msg, new Error("non open connection")));
      }
      const r = await fn(msg);
      return Promise.resolve(this.send(ctx, r));
    };
    try {
      // console.log("dispatch-1", msg);
      const found = Array.from(this.items.values()).find((item) => item.match(msg));
      if (!found) {
        // console.log("dispatch-2", msg);
        return this.send(ctx, buildErrorMsg(ctx, msg, new Error("unexpected message")));
      }
      if (!found.isNotConn) {
        // console.log("dispatch-3", msg);
        return validateConn(msg, (msg) => found.fn(ctx, msg));
      }
      // console.log("dispatch-4", msg);
      return this.send(ctx, await found.fn(ctx, msg));
    } catch (e) {
      return this.send(ctx, buildErrorMsg(ctx, msg, e as Error));
    }
  }
}
