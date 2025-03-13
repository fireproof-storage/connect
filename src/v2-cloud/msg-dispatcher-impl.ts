import { SuperThis } from "@fireproof/core";
import { MsgDispatcher } from "./msg-dispatch.js";
import {
  MsgIsReqGetData,
  buildResGetData,
  MsgIsReqPutData,
  MsgIsReqDelData,
  buildResDelData,
  buildResPutData,
  ReqGetData,
  ReqPutData,
  ReqDelData,
} from "./msg-types-data.js";
import {
  MsgIsReqDelWAL,
  MsgIsReqGetWAL,
  MsgIsReqPutWAL,
  ReqDelWAL,
  ReqGetWAL,
  ReqPutWAL,
  buildResDelWAL,
  buildResGetWAL,
  buildResPutWAL,
} from "./msg-types-wal.js";
import {
  MsgIsReqGestalt,
  buildResGestalt,
  MsgIsReqOpen,
  buildErrorMsg,
  buildResOpen,
  ReqGestalt,
  // Gestalt,
  // EnDeCoder,
  buildResChat,
  ReqChat,
  MsgIsReqChat,
  qsidEqual,
  MsgIsReqClose,
  buildResClose,
  ReqClose,
  MsgWithConnAuth,
} from "./msg-types.js";
import {
  BindGetMeta,
  MsgIsBindGetMeta,
  MsgIsReqDelMeta,
  MsgIsReqPutMeta,
  ReqDelMeta,
  ReqPutMeta,
} from "./msg-type-meta.js";
// import { WSRoom } from "./ws-room.js";

export function buildMsgDispatcher(
  _sthis: SuperThis /*, gestalt: Gestalt, ende: EnDeCoder, wsRoom: WSRoom*/
): MsgDispatcher {
  const dp = MsgDispatcher.new(_sthis /*, gestalt, ende, wsRoom*/);
  dp.registerMsg(
    {
      match: MsgIsReqGestalt,
      isNotConn: true,
      fn: (ctx, msg: ReqGestalt) => {
        const resGestalt = buildResGestalt(msg, ctx.gestalt, msg.auth);
        // console.log(">>>>>>>>>>>>>>", resGestalt);
        return resGestalt;
      },
    },
    {
      match: MsgIsReqOpen,
      isNotConn: true,
      fn: (ctx, msg) => {
        if (!MsgIsReqOpen(msg)) {
          return buildErrorMsg(ctx, msg, new Error("missing connection"));
        }
        if (ctx.wsRoom.isConnected(msg)) {
          return buildResOpen(ctx.sthis, msg, msg.conn.resId);
        }
        // const resId = sthis.nextId(12).str;
        const resId = ctx.ws.id;
        const resOpen = buildResOpen(ctx.sthis, msg, resId);
        ctx.wsRoom.addConn(ctx.ws, resOpen.conn);
        return resOpen;
      },
    },
    {
      match: MsgIsReqClose,
      fn: (ctx, msg: MsgWithConnAuth<ReqClose>) => {
        ctx.wsRoom.removeConn(msg.conn);
        return buildResClose(msg, msg.conn);
      },
    },
    {
      match: MsgIsReqChat,
      fn: (ctx, msg: MsgWithConnAuth<ReqChat>) => {
        const conns = ctx.wsRoom.getConns(msg.conn);
        const ci = conns.map((c) => c.conn);
        for (const conn of conns) {
          if (qsidEqual(conn.conn, msg.conn)) {
            continue;
          }
          dp.send(
            {
              ...ctx,
              ws: conn.ws,
            },
            buildResChat(msg, conn.conn, `[${msg.conn.reqId}]: ${msg.message}`, ci)
          );
        }
        return buildResChat(msg, msg.conn, `ack: ${msg.message}`, ci);
      },
    },
    {
      match: MsgIsReqGetData,
      fn: (ctx, msg: MsgWithConnAuth<ReqGetData>) => {
        return buildResGetData(ctx, msg, ctx.impl);
      },
    },
    {
      match: MsgIsReqPutData,
      fn: (ctx, msg: MsgWithConnAuth<ReqPutData>) => {
        return buildResPutData(ctx, msg, ctx.impl);
      },
    },
    {
      match: MsgIsReqDelData,
      fn: (ctx, msg: MsgWithConnAuth<ReqDelData>) => {
        return buildResDelData(ctx, msg, ctx.impl);
      },
    },
    {
      match: MsgIsReqGetWAL,
      fn: (ctx, msg: MsgWithConnAuth<ReqGetWAL>) => {
        return buildResGetWAL(ctx, msg, ctx.impl);
      },
    },
    {
      match: MsgIsReqPutWAL,
      fn: (ctx, msg: MsgWithConnAuth<ReqPutWAL>) => {
        return buildResPutWAL(ctx, msg, ctx.impl);
      },
    },
    {
      match: MsgIsReqDelWAL,
      fn: (ctx, msg: MsgWithConnAuth<ReqDelWAL>) => {
        return buildResDelWAL(ctx, msg, ctx.impl);
      },
    },
    {
      match: MsgIsBindGetMeta,
      fn: (ctx, msg: MsgWithConnAuth<BindGetMeta>) => {
        // console.log("MsgIsBindGetMeta", msg);
        return ctx.impl.handleBindGetMeta(ctx, msg);
      },
    },
    {
      match: MsgIsReqPutMeta,
      fn: (ctx, msg: MsgWithConnAuth<ReqPutMeta>) => {
        return ctx.impl.handleReqPutMeta(ctx, msg);
      },
    },
    {
      match: MsgIsReqDelMeta,
      fn: (ctx, msg: MsgWithConnAuth<ReqDelMeta>) => {
        return ctx.impl.handleReqDelMeta(ctx, msg);
      },
    }
  );
  return dp;
}
