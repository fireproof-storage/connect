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
  MsgIsReqOpenWithConn,
  MsgWithConn,
  ReqGestalt,
  Gestalt,
  EnDeCoder,
  buildResChat,
  ReqChat,
  MsgIsReqChat,
  qsidEqual,
  MsgIsReqClose,
  buildResClose,
  ReqClose,
} from "./msg-types.js";
import {
  BindGetMeta,
  MsgIsBindGetMeta,
  MsgIsReqDelMeta,
  MsgIsReqPutMeta,
  ReqDelMeta,
  ReqPutMeta,
} from "./msg-type-meta.js";
import { WSRoom } from "./ws-room.js";

export function buildMsgDispatcher(sthis: SuperThis, gestalt: Gestalt, ende: EnDeCoder, wsRoom: WSRoom): MsgDispatcher {
  const dp = MsgDispatcher.new(sthis, gestalt, ende, wsRoom);
  dp.registerMsg(
    {
      match: MsgIsReqGestalt,
      isNotConn: true,
      fn: (_sthis, _logger, _ctx, msg: ReqGestalt) => {
        const resGestalt = buildResGestalt(msg, dp.gestalt);
        return resGestalt;
      },
    },
    {
      match: MsgIsReqOpen,
      isNotConn: true,
      fn: (sthis, logger, ctx, msg) => {
        if (!MsgIsReqOpenWithConn(msg)) {
          return buildErrorMsg(sthis, logger, msg, new Error("missing connection"));
        }
        if (dp.wsRoom.isConnected(msg)) {
          return buildResOpen(sthis, msg, msg.conn.resId);
        }
        // const resId = sthis.nextId(12).str;
        const resId = ctx.ws.id;
        const resOpen = buildResOpen(sthis, msg, resId);
        dp.wsRoom.addConn(ctx.ws, resOpen.conn);
        return resOpen;
      },
    },
    {
      match: MsgIsReqClose,
      fn: (_sthis, _logger, _ctx, msg: MsgWithConn<ReqClose>) => {
        dp.wsRoom.removeConn(msg.conn);
        return buildResClose(msg, msg.conn);
      },
    },
    {
      match: MsgIsReqChat,
      fn: (_sthis, _logger, _ctx, msg: MsgWithConn<ReqChat>) => {
        const conns = dp.wsRoom.getConns(msg.conn);
        const ci = conns.map((c) => c.conn);
        for (const conn of conns) {
          if (qsidEqual(conn.conn, msg.conn)) {
            continue;
          }
          dp.send(conn.ws, buildResChat(msg, conn.conn, `[${msg.conn.reqId}]: ${msg.message}`, ci));
        }
        return buildResChat(msg, msg.conn, `ack: ${msg.message}`, ci);
      },
    },
    {
      match: MsgIsReqGetData,
      fn: (sthis, logger, ctx, msg: MsgWithConn<ReqGetData>) => {
        return buildResGetData(sthis, logger, msg, ctx.impl);
      },
    },
    {
      match: MsgIsReqPutData,
      fn: (sthis, logger, ctx, msg: MsgWithConn<ReqPutData>) => {
        return buildResPutData(sthis, logger, msg, ctx.impl);
      },
    },
    {
      match: MsgIsReqDelData,
      fn: (sthis, logger, ctx, msg: MsgWithConn<ReqDelData>) => {
        return buildResDelData(sthis, logger, msg, ctx.impl);
      },
    },
    {
      match: MsgIsReqGetWAL,
      fn: (sthis, logger, ctx, msg: MsgWithConn<ReqGetWAL>) => {
        return buildResGetWAL(sthis, logger, msg, ctx.impl);
      },
    },
    {
      match: MsgIsReqPutWAL,
      fn: (sthis, logger, ctx, msg: MsgWithConn<ReqPutWAL>) => {
        return buildResPutWAL(sthis, logger, msg, ctx.impl);
      },
    },
    {
      match: MsgIsReqDelWAL,
      fn: (sthis, logger, ctx, msg: MsgWithConn<ReqDelWAL>) => {
        return buildResDelWAL(sthis, logger, msg, ctx.impl);
      },
    },
    {
      match: MsgIsBindGetMeta,
      fn: (sthis, logger, ctx, msg: MsgWithConn<BindGetMeta>) => {
        return ctx.impl.handleBindGetMeta(sthis, logger, msg);
      },
    },
    {
      match: MsgIsReqPutMeta,
      fn: (sthis, logger, ctx, msg: MsgWithConn<ReqPutMeta>) => {
        return ctx.impl.handleReqPutMeta(sthis, logger, msg);
      },
    },
    {
      match: MsgIsReqDelMeta,
      fn: (sthis, logger, ctx, msg: MsgWithConn<ReqDelMeta>) => {
        return ctx.impl.handleReqDelMeta(sthis, logger, msg);
      },
    }
  );
  return dp;
}
