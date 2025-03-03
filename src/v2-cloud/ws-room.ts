import { WSContextWithId } from "./hono-server.js";
import { MsgBase, MsgWithConn, QSId } from "./msg-types.js";
import { ConnItem } from "./msg-dispatch.js";

export interface WSRoom {
  // acceptConnection(ws: WebSocket, wse: WSEvents, ctx: CTX): Promise<void>;

  getConns(conn: QSId): ConnItem[];
  removeConn(conn: QSId): void;
  addConn(ws: WSContextWithId<unknown>, conn: QSId): QSId;
  isConnected(msg: MsgBase): msg is MsgWithConn<MsgBase>;
}

// class ConnectionManager {
//   readonly conns = new Map<string, ConnItem>();
//   readonly maxItems: number;

//   constructor(maxItems?: number) {
//     this.maxItems = maxItems || 100;
//   }

//   getConns(): ConnItem[] {
//     console.log("getConns", this.conns);
//     return Array.from(this.conns.values());
//   }

//   removeConn(conn: QSId): void {
//     this.conns.delete(qsidKey(conn));
//   }

//   addConn(ws: WSContextWithId, conn: QSId): QSId {
//     console.log("addConn", conn);
//     if (this.conns.size >= this.maxItems) {
//       const oldest = Array.from(this.conns.values());
//       const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000).getTime();
//       oldest
//         .filter((item) => item.touched.getTime() < oneHourAgo)
//         .forEach((item) => this.conns.delete(item.conn.resId));
//     }
//     this.conns.set(qsidKey(conn), { ws, conn, touched: new Date() });
//     return conn;
//   }

//   isConnected(msg: MsgBase): msg is MsgWithConn<MsgBase> {
//     if (!MsgIsWithConn(msg)) {
//       return false;
//     }
//     return this.conns.has(`${msg.conn.reqId}:${msg.conn.resId}`);
//   }
// }
