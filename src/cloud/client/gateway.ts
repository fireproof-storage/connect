// import PartySocket, { PartySocketOptions } from "partysocket";
import { Result, URI, KeyedResolvOnce, exception2Result, Future } from "@adviser/cement";
import { bs, CRDTEntry, ensureLogger, Logger, NotFoundError, rt, SuperThis } from "@fireproof/core";
import {
  buildReqDelMeta,
  buildReqGetMeta,
  buildReqPutMeta,
  buildReqSubscriptMeta,
  Connection,
  ConnectionKey,
  HttpMethods,
  MsgBase,
  MsgIsError,
  MsgIsUpdateMetaEvent,
  ReqSignedUrl,
  ResDelMeta,
  ResGetMeta,
  ResPutMeta,
  ResSignedUrl,
  ResSubscribeMeta,
} from "../msg-types.js";
import { newWebSocket } from "../new-websocket.js";
import { to_uint8 } from "../../coerce-binary.js";

const VERSION = "v0.1-fp-cloud";

export interface StoreTypeGateway {
  get(uri: URI, conn: Promise<Result<Connection>>): Promise<Result<Uint8Array>>;
  put(uri: URI, body: Uint8Array, conn: Promise<Result<Connection>>): Promise<Result<void>>;
  delete(uri: URI, conn: Promise<Result<Connection>>): Promise<Result<void>>;
}

abstract class BaseGateway {
  readonly logger: Logger;
  readonly sthis: SuperThis;
  constructor(sthis: SuperThis, module: string) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, module);
  }

  abstract getConn(uri: URI, conn: Connection): Promise<Result<Uint8Array>>;
  async get(uri: URI, prConn: Promise<Result<Connection>>): Promise<Result<Uint8Array>> {
    const rConn = await prConn;
    if (rConn.isErr()) {
      return this.logger.Error().Err(rConn).Msg("Error in getConn").ResultError();
    }
    const conn = rConn.Ok();
    this.logger.Debug().Any("conn", conn.key).Msg("get");
    return this.getConn(uri, conn);
  }
  abstract putConn(uri: URI, body: Uint8Array, conn: Connection): Promise<Result<void>>;

  async put(uri: URI, body: Uint8Array, prConn: Promise<Result<Connection>>): Promise<Result<void>> {
    const rConn = await prConn;
    if (rConn.isErr()) {
      return this.logger.Error().Err(rConn).Msg("Error in putConn").ResultError();
    }
    const conn = rConn.Ok();
    this.logger.Debug().Any("conn", conn.key).Msg("put");
    return this.putConn(uri, body, conn);
  }
  abstract delConn(uri: URI, conn: Connection): Promise<Result<void>>;
  async delete(uri: URI, prConn: Promise<Result<Connection>>): Promise<Result<void>> {
    const rConn = await prConn;
    if (rConn.isErr()) {
      return this.logger.Error().Err(rConn).Msg("Error in putConn").ResultError();
    }
    const conn = rConn.Ok();
    this.logger.Debug().Any("conn", conn.key).Msg("del");
    return this.delConn(uri, conn);
  }

  prepareReqSignedUrl(uri: URI, method: HttpMethods, cKey: ConnectionKey): Result<ReqSignedUrl> {
    const rParams = uri.getParamsResult({
      store: 0,
      key: 0,
    });
    if (rParams.isErr()) {
      return this.logger.Error().Err(rParams).Msg("Error in getParamsResult").ResultError();
    }
    const { store, key } = rParams.Ok();
    return Result.Ok({
      buildReqSignedUrl({
        // auth: await getUcanAuthFromUri(uri),
        params: {
          ...cKey,
          store: store as FPStoreTypes,
          key,
          method,
        },
      })
    );
  }

  async getResSignedUrl(uri: URI, method: HttpMethods, conn: Connection): Promise<Result<ResSignedUrl>> {
    const rsu = this.prepareReqSignedUrl(uri, method, conn.key);
    if (rsu.isErr()) {
      return Result.Err(rsu.Err());
    }
    return conn.request<ResSignedUrl>(rsu.Ok(), { waitType: "resSignedUrl" });
  }

  async putObject(uri: URI, uploadUrl: string, body: Uint8Array): Promise<Result<void>> {
    this.logger.Debug().Any("url", { uploadUrl, uri }).Msg("put-fetch-url");
    const rUpload = await exception2Result(async () => fetch(uploadUrl, { method: "PUT", body }));
    if (rUpload.isErr()) {
      return this.logger.Error().Url(uploadUrl, "uploadUrl").Err(rUpload).Msg("Error in put fetch").ResultError();
    }
    if (!rUpload.Ok().ok) {
      return this.logger.Error().Url(uploadUrl, "uploadUrl").Http(rUpload.Ok()).Msg("Error in put fetch").ResultError();
    }
    if (uri.getParam("testMode")) {
      trackPuts.add(uri.toString());
    }
    return Result.Ok(undefined);
  }

  async getObject(uri: URI, downloadUrl: string): Promise<Result<Uint8Array>> {
    this.logger.Debug().Any("url", { downloadUrl, uri }).Msg("get-fetch-url");
    const rDownload = await exception2Result(async () => fetch(downloadUrl.toString(), { method: "GET" }));
    if (rDownload.isErr()) {
      return this.logger
        .Error()
        .Url(downloadUrl, "uploadUrl")
        .Err(rDownload)
        .Msg("Error in get downloadUrl")
        .ResultError();
    }
    const download = rDownload.Ok();
    if (!download.ok) {
      if (download.status === 404) {
        return Result.Err(new NotFoundError("Not found"));
      }
      return this.logger.Error().Url(downloadUrl, "uploadUrl").Err(rDownload).Msg("Error in get fetch").ResultError();
    }
    return Result.Ok(to_uint8(await download.arrayBuffer()));
  }

  async delObject(uri: URI, deleteUrl: string): Promise<Result<void>> {
    this.logger.Debug().Any("url", { deleteUrl, uri }).Msg("get-fetch-url");
    const rDelete = await exception2Result(async () => fetch(deleteUrl.toString(), { method: "DELETE" }));
    if (rDelete.isErr()) {
      return this.logger.Error().Url(deleteUrl, "deleteUrl").Err(rDelete).Msg("Error in get deleteURL").ResultError();
    }
    const download = rDelete.Ok();
    if (!download.ok) {
      if (download.status === 404) {
        return Result.Err(new NotFoundError("Not found"));
      }
      return this.logger.Error().Url(deleteUrl, "deleteUrl").Err(rDelete).Msg("Error in del fetch").ResultError();
    }
    return Result.Ok(undefined);
  }
}

class DataGateway extends BaseGateway implements StoreTypeGateway {
  constructor(sthis: SuperThis) {
    super(sthis, "DataGateway");
  }
  async getConn(uri: URI, conn: Connection): Promise<Result<Uint8Array>> {
    const rResSignedUrl = await this.getResSignedUrl(uri, "GET", conn);
    if (rResSignedUrl.isErr()) {
      return this.logger.Error().Err(rResSignedUrl).Msg("Error in buildResSignedUrl").ResultError();
    }
    const { signedUrl: downloadUrl } = rResSignedUrl.Ok();
    return this.getObject(uri, downloadUrl);
  }
  async putConn(uri: URI, body: Uint8Array, conn: Connection): Promise<Result<void>> {
    const rResSignedUrl = await this.getResSignedUrl(uri, "PUT", conn);
    if (rResSignedUrl.isErr()) {
      return this.logger.Error().Err(rResSignedUrl).Msg("Error in buildResSignedUrl").ResultError();
    }
    const { signedUrl: uploadUrl } = rResSignedUrl.Ok();
    return this.putObject(uri, uploadUrl, body);
  }
  async delConn(uri: URI, conn: Connection): Promise<Result<void>> {
    const rResSignedUrl = await this.getResSignedUrl(uri, "DELETE", conn);
    if (rResSignedUrl.isErr()) {
      return this.logger.Error().Err(rResSignedUrl).Msg("Error in buildResSignedUrl").ResultError();
    }
    const { signedUrl: deleteUrl } = rResSignedUrl.Ok();
    return this.delObject(uri, deleteUrl);
  }
}

class MetaGateway extends BaseGateway implements StoreTypeGateway {
  constructor(sthis: SuperThis) {
    super(sthis, "MetaGateway");
  }

  async getConn(uri: URI, conn: Connection): Promise<Result<Uint8Array>> {
    const rkey = uri.getParamResult("key");
    if (rkey.isErr()) {
      return Result.Err(rkey.Err());
    }
    const rsu = buildReqGetMeta(this.sthis, conn.key, {
      ...conn.key,
      method: "GET",
      store: "meta",
      key: rkey.Ok(),
    });
    const rRes = await conn.request<ResGetMeta>(rsu, {
      waitType: "resGetMeta",
    });
    if (rRes.isErr()) {
      return Result.Err(rRes.Err());
    }
    const res = rRes.Ok();
    if (MsgIsError(res)) {
      return Result.Err(res);
    }
    if (res.signedGetUrl) {
      return this.getObject(uri, res.signedGetUrl);
    }
    return Result.Ok(this.sthis.txt.encode(JSON.stringify(res.metas)));
  }
  async putConn(uri: URI, body: Uint8Array, conn: Connection): Promise<Result<void>> {
    const bodyRes = Result.Ok(body); // await bs.addCryptoKeyToGatewayMetaPayload(uri, this.sthis, body);
    if (bodyRes.isErr()) {
      return this.logger.Error().Err(bodyRes).Msg("Error in addCryptoKeyToGatewayMetaPayload").ResultError();
    }
    const rsu = this.prepareReqSignedUrl(uri, "PUT", conn.key);
    if (rsu.isErr()) {
      return Result.Err(rsu.Err());
    }
    const dbMetas = JSON.parse(this.sthis.txt.decode(bodyRes.Ok())) as CRDTEntry[];
    this.logger.Debug().Any("dbMetas", dbMetas).Msg("putMeta");
    const req = buildReqPutMeta(this.sthis, conn.key, rsu.Ok().params, dbMetas);
    const res = await conn.request<ResPutMeta>(req, { waitType: "resPutMeta" });
    if (res.isErr()) {
      return Result.Err(res.Err());
    }
    // console.log("putMeta", JSON.stringify({dbMetas, res}));
    this.logger.Debug().Any("qs", { req, res: res.Ok() }).Msg("putMeta");
    this.putObject(uri, res.Ok().signedPutUrl, bodyRes.Ok());
    return res;
  }
  async delConn(uri: URI, conn: Connection): Promise<Result<void>> {
    const rsu = this.prepareReqSignedUrl(uri, "DELETE", conn.key);
    if (rsu.isErr()) {
      return Result.Err(rsu.Err());
    }
    const res = await conn.request<ResDelMeta>(buildReqDelMeta(this.sthis, conn.key, rsu.Ok().params), {
      waitType: "resDelMeta",
    });
    if (res.isErr()) {
      return Result.Err(res.Err());
    }
    const { signedDelUrl } = res.Ok();
    if (signedDelUrl) {
      return this.delObject(uri, signedDelUrl);
    }
    return Result.Ok(undefined);
  }
}

class WALGateway extends BaseGateway implements StoreTypeGateway {
  // WAL will not pollute to the cloud
  readonly wals = new Map<string, Uint8Array>();
  constructor(sthis: SuperThis) {
    super(sthis, "WALGateway");
  }
  getWalKeyFromUri(uri: URI): Result<string> {
    const rKey = uri.getParamsResult({
      key: 0,
      name: 0,
    });
    if (rKey.isErr()) {
      return Result.Err(rKey.Err());
    }
    const { name, key } = rKey.Ok();
    return Result.Ok(`${name}:${key}`);
  }
  async getConn(uri: URI): Promise<Result<Uint8Array>> {
    const rKey = this.getWalKeyFromUri(uri);
    if (rKey.isErr()) {
      return Result.Err(rKey.Err());
    }
    const wal = this.wals.get(rKey.Ok());
    if (!wal) {
      return Result.Err(new NotFoundError("Not found"));
    }
    return Result.Ok(wal);
  }
  async putConn(uri: URI, body: Uint8Array): Promise<Result<void>> {
    const rKey = this.getWalKeyFromUri(uri);
    if (rKey.isErr()) {
      return Result.Err(rKey.Err());
    }
    this.wals.set(rKey.Ok(), body);
    return Result.Ok(undefined);
  }
  async delConn(uri: URI): Promise<Result<void>> {
    const rKey = this.getWalKeyFromUri(uri);
    if (rKey.isErr()) {
      return Result.Err(rKey.Err());
    }
    this.wals.delete(rKey.Ok());
    return Result.Ok(undefined);
  }
}

const storeTypedGateways = new KeyedResolvOnce<StoreTypeGateway>();
function getStoreTypeGateway(sthis: SuperThis, uri: URI): StoreTypeGateway {
  const store = uri.getParam("store");
  switch (store) {
    case "data":
      return storeTypedGateways.get(store).once(() => new DataGateway(sthis));
    case "meta":
      return storeTypedGateways.get(store).once(() => new MetaGateway(sthis));
    case "wal":
      return storeTypedGateways.get(store).once(() => new WALGateway(sthis));
    default:
      throw ensureLogger(sthis, "getStoreTypeGateway")
        .Error()
        .Str("store", store)
        .Msg("Invalid store type")
        .ResultError();
  }
}

const keyedConnections = new KeyedResolvOnce<Connection>();
interface Subscription {
  readonly sid: string;
  readonly uri: string; // optimization
  readonly callback: (msg: Uint8Array) => void;
  readonly unsub: () => void;
}
const subscriptions = new Map<string, Subscription[]>();
const doServerSubscribe = new KeyedResolvOnce();
const trackPuts = new Set<string>();
export class FireproofCloudGateway implements bs.Gateway {
  readonly logger: Logger;
  readonly sthis: SuperThis;

  constructor(sthis: SuperThis) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "FireproofCloudGateway", {
      this: true,
    });
  }

  async buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
    return Result.Ok(baseUrl.build().setParam("key", key).URI());
  }

  async start(uri: URI): Promise<Result<URI>> {
    await this.sthis.start();
    const ret = uri.build().defParam("version", VERSION);
    const rName = uri.getParamResult("name");
    if (rName.isErr()) {
      return this.logger.Error().Err(rName).Msg("name not found").ResultError();
    }
    ret.defParam("protocol", "wss");
    return Result.Ok(ret.URI());
  }

  async get(uri: URI): Promise<bs.GetResult> {
    return getStoreTypeGateway(this.sthis, uri).get(uri, this.getCloudConnection(uri));
  }

  async put(uri: URI, body: Uint8Array): Promise<Result<void>> {
    const ret = await getStoreTypeGateway(this.sthis, uri).put(uri, body, this.getCloudConnection(uri));
    if (ret.isOk()) {
      if (uri.getParam("testMode")) {
        trackPuts.add(uri.toString());
      }
    }
    return ret;
  }

  async delete(uri: URI): Promise<bs.VoidResult> {
    trackPuts.delete(uri.toString());
    return getStoreTypeGateway(this.sthis, uri).delete(uri, this.getCloudConnection(uri));
  }

  async put(uri: URI, body: Uint8Array): Promise<Result<void>> {
    const ret = await getStoreTypeGateway(this.sthis, uri).put(uri, body, this.getCloudConnection(uri));
    if (ret.isOk()) {
      if (uri.getParam("testMode")) {
        trackPuts.add(uri.toString());
      }
    }
    return ret;
  }

  async delete(uri: URI): Promise<bs.VoidResult> {
    trackPuts.delete(uri.toString());
    return getStoreTypeGateway(this.sthis, uri).delete(uri, this.getCloudConnection(uri));
  }

  async close(uri: URI): Promise<bs.VoidResult> {
    const uriStr = uri.toString();
    // CAUTION here is my happen a mutation of subscriptions caused by unsub
    for (const sub of Array.from(subscriptions.values())) {
      for (const s of sub) {
        if (s.uri.toString() === uriStr) {
          s.unsub();
        }
      }
    }
    const rConn = await this.getCloudConnection(uri);
    if (rConn.isErr()) {
      return this.logger.Error().Err(rConn).Msg("Error in getCloudConnection").ResultError();
    }
    const conn = rConn.Ok();
    await conn.close();
    return Result.Ok(undefined);
  }

  // fireproof://localhost:1999/?name=test-public-api&protocol=ws&store=meta
  async getCloudConnection(uri: URI): Promise<Result<Connection>> {
    const rParams = uri.getParamsResult({
      name: 0,
      protocol: "wss",
      store: 0,
      storekey: 0,
    });
    if (rParams.isErr()) {
      return this.logger.Error().Url(uri).Err(rParams).Msg("getCloudConnection:err").ResultError();
    }
    const params = rParams.Ok();
    const dataKey = params.storekey.replace(/:(meta|wal)@$/, `:data@`);
    const kb = await rt.kb.getKeyBag(this.sthis);
    const rfingerprint = await kb.getNamedKey(dataKey);
    if (rfingerprint.isErr()) {
      return this.logger.Error().Err(rfingerprint).Msg("Error in getNamedKey").ResultError();
    }
    const connectionKey = {
      tenantId: uri.build().getParam("tendenId", rfingerprint.Ok().fingerPrint) as string,
      name: params.name,
      // protocol: params.protocol as ConnectionKey["protocol"],
    } satisfies ConnectionKey;

    const wsUrl = uri
      .build()
      .protocol(params.protocol === "ws" ? "ws" : "wss")
      .appendRelative("ws")
      .cleanParams();

    // forces to open a new websocket connection
    const connId = uri.getParam("connId");
    if (connId) {
      wsUrl.setParam("connId", connId);
    }
    return Result.Ok(
      await keyedConnections.get(wsUrl.toString()).once(async (cKey) => {
        const ws = await newWebSocket(wsUrl);
        const waitOpen = new Future<void>();
        ws.onopen = () => {
          this.logger.Debug().Url(wsUrl).Msg("ws open");
          waitOpen.resolve();
        };
        ws.onerror = (err) => {
          this.logger.Error().Err(err).Url(wsUrl).Msg("ws error");
          keyedConnections.unget(cKey);
        };
        ws.onclose = () => {
          keyedConnections.unget(cKey);
          this.logger.Debug().Url(wsUrl).Msg("ws close");
        };
        await waitOpen.asPromise();
        return new ConnectionImpl(this.sthis, ws, connectionKey, () => {
          keyedConnections.unget(cKey);
        });
      })
    );
  }

  private notifySubscribers(data: Uint8Array, callbacks: ((msg: Uint8Array) => void)[] = []): void {
    for (const cb of callbacks) {
      try {
        cb(data);
      } catch (error) {
        this.logger.Error().Err(error).Msg("Error in subscriber callback execution");
      }
    }
  }
  async subscribe(uri: URI, callback: (meta: Uint8Array) => void): Promise<bs.UnsubscribeResult> {
    const rParams = uri.getParamsResult({
      store: 0,
      storekey: 0,
    });
    if (rParams.isErr()) {
      return this.logger.Error().Err(rParams).Msg("Error in subscribe").ResultError();
    }
    const { store } = rParams.Ok();
    if (store !== "meta") {
      return Result.Err(new Error("store must be meta"));
    }
    const rConn = await this.getCloudConnection(uri);
    if (rConn.isErr()) {
      return this.logger.Error().Err(rConn).Msg("Error in subscribe:getCloudConnection").ResultError();
    }
    const conn = rConn.Ok();
    const rResSubscribeMeta = await doServerSubscribe.get(pkKey(conn.key)).once(async () => {
      const subId = this.sthis.nextId().str;
      const fn = (subId: string) => (msg: MsgBase) => {
        if (MsgIsUpdateMetaEvent(msg) && subId === msg.subscriberId) {
          // console.log("onMessage", subId, conn.key, msg.metas);
          const s = subscriptions.get(subId);
          if (!s) {
            return;
          }
          console.log("msg", JSON.stringify(msg));
          this.notifySubscribers(
            this.sthis.txt.encode(JSON.stringify(msg.metas)),
            s.map((s) => s.callback)
          );
        }
      };
      conn.onMessage(fn(subId));
      return conn.request<ResSubscribeMeta>(buildReqSubscriptMeta(this.sthis, conn.key, subId), {
        waitType: "resSubscribeMeta",
      });
    });
    if (rResSubscribeMeta.isErr()) {
      return this.logger.Error().Err(rResSubscribeMeta).Msg("Error in subscribe:request").ResultError();
    }
    const subId = rResSubscribeMeta.Ok().subscriberId;
    let callbacks = subscriptions.get(subId);
    if (!callbacks) {
      callbacks = [];
      subscriptions.set(subId, callbacks);
    }
    const sid = this.sthis.nextId().str;
    const unsub = () => {
      const idx = callbacks.findIndex((c) => c.sid === sid);
      if (idx !== -1) {
        callbacks.splice(idx, 1);
      }
      if (callbacks.length === 0) {
        subscriptions.delete(subId);
      }
    };
    callbacks.push({ uri: uri.toString(), callback, sid, unsub });
    return Result.Ok(unsub);
  }

  async destroy(_uri: URI): Promise<Result<void>> {
    await Promise.all(Array.from(trackPuts).map(async (k) => this.delete(URI.from(k))));
    return Result.Ok(undefined);
  }
}

function pkKey(set?: ConnectionKey): string {
  const ret = JSON.stringify(
    Object.entries(set || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .filter(([k]) => k !== "id")
      .map(([k, v]) => ({ [k]: v }))
  );
  return ret;
}

export class FireproofCloudTestStore implements bs.TestGateway {
  readonly logger: Logger;
  readonly sthis: SuperThis;
  readonly gateway: bs.Gateway;
  constructor(gw: bs.Gateway, sthis: SuperThis) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "FireproofCloudTestStore");
    this.gateway = gw;
  }
  async get(uri: URI, key: string): Promise<Uint8Array> {
    const url = uri.build().setParam("key", key).URI();
    const dbFile = this.sthis.pathOps.join(rt.getPath(url, this.sthis), rt.getFileName(url, this.sthis));
    this.logger.Debug().Url(url).Str("dbFile", dbFile).Msg("get");
    const buffer = await this.gateway.get(url);
    this.logger.Debug().Url(url).Str("dbFile", dbFile).Len(buffer).Msg("got");
    return buffer.Ok();
  }
}

const onceRegisterFireproofCloudStoreProtocol = new KeyedResolvOnce<() => void>();
export function registerFireproofCloudStoreProtocol(protocol = "fireproof:", overrideBaseURL?: string) {
  return onceRegisterFireproofCloudStoreProtocol.get(protocol).once(() => {
    URI.protocolHasHostpart(protocol);
    return bs.registerStoreProtocol({
      protocol,
      overrideBaseURL,
      gateway: async (sthis) => {
        return new FireproofCloudGateway(sthis);
      },
      test: async (sthis: SuperThis) => {
        const gateway = new FireproofCloudGateway(sthis);
        return new FireproofCloudTestStore(gateway, sthis);
      },
    });
  });
}