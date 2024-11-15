import { exception2Result, HttpHeader, param, ResolveOnce, Result, URI } from "@adviser/cement";
import { Logger, SuperThis } from "@fireproof/core";
import { Context, Hono, Next } from "hono";
import { top_uint8 } from "../coerce-binary.js";
import {
  Gestalt,
  buildErrorMsg,
  MsgBase,
  EnDeCoder,
  ErrorMsg,
  MsgWithError,
  buildRes,
  MsgWithConn,
  GwCtx,
  MsgIsError,
} from "./msg-types.js";
import { MsgDispatcher, WSConnection } from "./msg-dispatch.js";
import { WSEvents } from "hono/ws";
import { calculatePreSignedUrl, PreSignedMsg } from "./pre-signed-url.js";
import { buildMsgDispatcher } from "./msg-dispatcher-impl.js";
import {
  BindGetMeta,
  buildEventGetMeta,
  buildResDelMeta,
  buildResPutMeta,
  EventGetMeta,
  ReqDelMeta,
  ReqPutMeta,
  ResDelMeta,
  ResPutMeta,
} from "./msg-type-meta.js";
import { MetaMerger } from "./meta-merger/meta-merger.js";
import { SQLDatabase } from "./meta-merger/abstract-sql.js";
import { WSRoom } from "./ws-room.js";

export interface RunTimeParams {
  readonly sthis: SuperThis;
  readonly logger: Logger;
  readonly ende: EnDeCoder;
  readonly impl: HonoServerImpl;
}
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type ConnMiddleware = (conn: WSConnection, c: Context, next: Next) => Promise<Response | void>;
export interface HonoServerImpl {
  start(): Promise<HonoServerImpl>;
  gestalt(): Gestalt;
  calculatePreSignedUrl(p: PreSignedMsg): Promise<Result<URI>>;
  upgradeWebSocket: (createEvents: (c: Context) => WSEvents | Promise<WSEvents>) => ConnMiddleware;
  handleBindGetMeta(sthis: SuperThis, logger: Logger, msg: BindGetMeta): Promise<MsgWithError<EventGetMeta>>;
  handleReqPutMeta(sthis: SuperThis, logger: Logger, msg: ReqPutMeta): Promise<MsgWithError<ResPutMeta>>;
  handleReqDelMeta(sthis: SuperThis, logger: Logger, msg: ReqDelMeta): Promise<MsgWithError<ResDelMeta>>;
  readonly headers: HttpHeader;
}

export abstract class HonoServerBase implements HonoServerImpl {
  readonly _gs: Gestalt;
  readonly sthis: SuperThis;
  readonly logger: Logger;
  readonly metaMerger: MetaMerger;
  readonly headers: HttpHeader;
  readonly wsRoom: WSRoom;
  constructor(sthis: SuperThis, logger: Logger, gs: Gestalt, sqlDb: SQLDatabase, wsRoom: WSRoom, headers?: HttpHeader) {
    this.logger = logger;
    this._gs = gs;
    this.sthis = sthis;
    this.wsRoom = wsRoom;
    this.metaMerger = new MetaMerger(sqlDb);
    this.headers = headers ? headers.Clone().Merge(CORS) : CORS.Clone();
  }

  abstract upgradeWebSocket(createEvents: (c: Context) => WSEvents | Promise<WSEvents>): ConnMiddleware;

  start(drop = false): Promise<HonoServerImpl> {
    return this.metaMerger.createSchema(drop).then(() => this);
  }

  gestalt(): Gestalt {
    return this._gs;
  }

  async handleReqPutMeta(
    sthis: SuperThis,
    logger: Logger,
    msg: MsgWithConn<ReqPutMeta>
  ): Promise<MsgWithError<ResPutMeta>> {
    const rUrl = await buildRes("PUT", "meta", "resPutMeta", sthis, logger, msg, this);
    if (MsgIsError(rUrl)) {
      return rUrl;
    }
    await this.metaMerger.addMeta({
      logger,
      connection: msg,
      metas: msg.metas,
    });
    return buildResPutMeta(sthis, logger, msg, { ...rUrl, metas: await this.metaMerger.metaToSend(msg) });
  }

  async handleReqDelMeta(
    sthis: SuperThis,
    logger: Logger,
    msg: MsgWithConn<ReqDelMeta>
  ): Promise<MsgWithError<ResDelMeta>> {
    const rUrl = await buildRes("DELETE", "meta", "resDelMeta", sthis, logger, msg, this);
    if (MsgIsError(rUrl)) {
      return rUrl;
    }
    await this.metaMerger.delMeta({
      logger,
      connection: msg,
    });
    return buildResDelMeta(sthis, logger, msg, rUrl.signedUrl);
  }

  async handleBindGetMeta(
    sthis: SuperThis,
    logger: Logger,
    msg: MsgWithConn<BindGetMeta>,
    gwCtx: GwCtx = msg
  ): Promise<MsgWithError<EventGetMeta>> {
    const rUrl = await buildRes("GET", "meta", "eventGetMeta", sthis, logger, msg, this);
    if (MsgIsError(rUrl)) {
      return rUrl;
    }
    return buildEventGetMeta(
      sthis,
      logger,
      msg,
      {
        ...rUrl,
        metas: await this.metaMerger.metaToSend(msg),
      },
      gwCtx
    );
  }

  calculatePreSignedUrl(p: PreSignedMsg): Promise<Result<URI>> {
    const rRes = this.sthis.env.gets({
      STORAGE_URL: param.REQUIRED,
      ACCESS_KEY_ID: param.REQUIRED,
      SECRET_ACCESS_KEY: param.REQUIRED,
      REGION: "us-east-1",
    });
    if (rRes.isErr()) {
      return Promise.resolve(Result.Err(rRes.Err()));
    }
    const res = rRes.Ok();
    return calculatePreSignedUrl(p, {
      storageUrl: URI.from(res.STORAGE_URL),
      aws: {
        accessKeyId: res.ACCESS_KEY_ID,
        secretAccessKey: res.SECRET_ACCESS_KEY,
        region: res.REGION,
      },
    });
  }
}

export interface HonoServerFactory {
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  inject(c: Context, fn: (rt: RunTimeParams) => Promise<Response | void>): Promise<Response | void>;

  start(app: Hono): Promise<void>;
  serve(app: Hono, port?: number): Promise<void>;
  close(): Promise<void>;
}

export const CORS = HttpHeader.from({
  // "Accept": "application/json",
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS,PUT,DELETE",
  "Access-Control-Max-Age": "86400", // Cache pre-flight response for 24 hours
});

export class HonoServer {
  // readonly sthis: SuperThis;
  // readonly msgP: MsgerParams;
  // readonly gestalt: Gestalt;
  // readonly logger: Logger;
  readonly factory: HonoServerFactory;
  constructor(/* sthis: SuperThis, msgP: MsgerParams, gestalt: Gestalt, */ factory: HonoServerFactory) {
    // this.sthis = sthis;
    // this.logger = ensureLogger(sthis, "HonoServer");
    // this.msgP = msgP;
    // this.gestalt = gestalt;
    this.factory = factory;
  }
  readonly _register = new ResolveOnce<HonoServer>();
  async register(app: Hono, port?: number): Promise<HonoServer> {
    return this._register.once(async () => {
      await this.factory.start(app);
      // app.put('/gestalt', async (c) => c.json(buildResGestalt(await c.req.json(), defaultGestaltItem({ id: "server", hasPersistent: true }).gestalt)))
      // app.put('/error', async (c) => c.json(buildErrorMsg(sthis, sthis.logger, await c.req.json(), new Error("test error"))))
      app.put("/fp", (c) =>
        this.factory.inject(c, async ({ sthis, logger, impl }) => {
          impl.headers.Items().forEach(([k, v]) => c.res.headers.set(k, v[0]));
          const rMsg = await exception2Result(() => c.req.json() as Promise<MsgBase>);
          if (rMsg.isErr()) {
            c.status(400);
            return c.json(buildErrorMsg(sthis, logger, { tid: "internal" }, rMsg.Err()));
          }
          const dispatcher = buildMsgDispatcher(sthis, impl.gestalt());
          return dispatcher.dispatch(impl, rMsg.Ok(), (msg) => c.json(msg));
        })
      );
      app.get("/ws", (c, next) =>
        this.factory.inject(c, async ({ sthis, logger, ende, impl }) => {
          return impl.upgradeWebSocket((_c) => {
            let dp: MsgDispatcher;
            return {
              onOpen: (_e, _ws) => {
                dp = buildMsgDispatcher(sthis, impl.gestalt());
              },
              onError: (error) => {
                logger.Error().Err(error).Msg("WebSocket error");
              },
              onMessage: async (event, ws) => {
                const rMsg = await exception2Result(async () => ende.decode(await top_uint8(event.data)) as MsgBase);
                if (rMsg.isErr()) {
                  ws.send(
                    ende.encode(
                      buildErrorMsg(
                        sthis,
                        logger,
                        {
                          message: event.data,
                        } as ErrorMsg,
                        rMsg.Err()
                      )
                    )
                  );
                } else {
                  await dp.dispatch(impl, rMsg.Ok(), (msg) => {
                    const str = ende.encode(msg);
                    ws.send(str);
                    return new Response(str);
                  });
                }
              },
              onClose: () => {
                dp = undefined as unknown as MsgDispatcher;
                // console.log('Connection closed')
              },
            };
          })(new WSConnection(), c, next);
        })
      );
      await this.factory.serve(app, port);
      return this;
    });
  }
  async close() {
    const ret = await this.factory.close();
    return ret;
  }
}

// export async function honoServer(_sthis: SuperThis, _msgP: MsgerParams, _gestalt: Gestalt) {
//   const rt = runtimeFn();
//   if (rt.isNodeIsh) {
//     // const { NodeHonoServer } = await import("./node-hono-server.js");
//     // return new HonoServer(sthis, msgP, gestalt, new NodeHonoServer());
//   }
//   throw new Error("Not implemented");
// }
