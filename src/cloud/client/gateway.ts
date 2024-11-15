// import PartySocket, { PartySocketOptions } from "partysocket";
import { Result, URI, KeyedResolvOnce, exception2Result, Future } from "@adviser/cement";
import { bs, ensureLogger, Logger, NotFoundError, rt, SuperThis } from "@fireproof/core";
import { buildReqSignedUrl, ConnectionKey, FPStoreTypes, HttpMethods, MsgBase, ResSignedUrl } from "../msg-types.js";
import { newWebSocket } from "../new-websocket.js";

const VERSION = "v0.1-fp-cloud";

interface Connection {
  readonly ws: WebSocket;
  readonly params: ConnectionKey;
  request<T extends MsgBase>(msg: MsgBase): Promise<Result<T>>;
}

export class ConnectionImpl implements Connection {
  readonly ws: WebSocket;
  readonly params: ConnectionKey;
  readonly waitForTid = new Map<string, Future<MsgBase>>();
  constructor(logger: Logger, ws: WebSocket, params: ConnectionKey) {
    this.ws = ws;
    this.params = params;
    ws.onmessage = async (event) => {
      const rMsg = await exception2Result(() => JSON.parse(event.data));
      if (rMsg.isErr()) {
        logger.Error().Err(rMsg).Any(event.data).Msg("Invalid message");
        return;
      }
      const msg = rMsg.Ok() as MsgBase;
      const future = this.waitForTid.get(msg.tid);
      if (future) {
        this.waitForTid.delete(msg.tid);
        future.resolve(msg);
      }
    };
  }
  async request<T extends MsgBase>(msg: MsgBase): Promise<Result<T>> {
    const future = new Future<MsgBase>();
    this.waitForTid.set(msg.tid, future);
    this.ws.send(JSON.stringify(msg));
    // add timeout handling
    return future
      .asPromise()
      .then((msg) => {
        return Result.Ok(msg as T);
      })
      .catch((err) => {
        return Result.Err(err);
      });
  }
}

export class FireproofCloudGateway implements bs.Gateway {
  readonly logger: Logger;
  readonly sthis: SuperThis;
  readonly id: string;
  // party?: PartySocket;
  url?: URI;

  readonly trackPuts = new Set<string>();

  constructor(sthis: SuperThis) {
    this.sthis = sthis;
    this.id = sthis.nextId().str;
    this.logger = ensureLogger(sthis, "FireproofCloudGateway", {
      url: () => this.url?.toString(),
      this: this.id,
    }); //.EnableLevel(Level.DEBUG);
    // this.logger.Debug().Msg("constructor");
  }

  async buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
    return Result.Ok(baseUrl.build().setParam("key", key).URI());
  }

  // pso?: PartySocketOptions;
  async start(uri: URI): Promise<Result<URI>> {
    this.url = uri;
    // this.logger.Debug().Msg("Starting FireproofCloudGateway");

    await this.sthis.start();

    const ret = uri.build().defParam("version", VERSION);

    const rName = uri.getParamResult("name");
    if (rName.isErr()) {
      return this.logger.Error().Err(rName).Msg("name not found").ResultError();
    }
    ret.defParam("protocol", "wss");
    this.url = ret.URI();
    return Result.Ok(this.url);
  }

  async close(_uri: URI): Promise<bs.VoidResult> {
    // console.log("close:gateway");
    // await this.ready();
    // this.logger.Debug().Msg("close");
    // this.party?.close();
    return Result.Ok(undefined);
  }

  // fireproof://localhost:1999/?name=test-public-api&protocol=ws&store=meta
  async getCloudConnection(uri: URI): Promise<Result<Connection>> {
    const rParams = uri.getParamsResult({
      name: 0,
      protocol: 0,
      store: 0,
      key: 0,
      storekey: 0,
    });
    if (rParams.isErr()) {
      return this.logger.Error().Err(rParams).Msg("Error in getParamsResult").ResultError();
    }
    const params = rParams.Ok();
    const dataKey = params.storekey.replace(/:(meta|wal)@$/, `:data@`);
    const kb = await rt.kb.getKeyBag(this.sthis);
    const rfingerprint = await kb.getNamedKey(dataKey);
    if (rfingerprint.isErr()) {
      return this.logger.Error().Err(rfingerprint).Msg("Error in getNamedKey").ResultError();
    }
    const connectionKey = {
      tendantId: uri.build().getParam("tendenId", rfingerprint.Ok().fingerPrint) as string,
      name: params.name,
      // protocol: params.protocol as ConnectionKey["protocol"],
    } satisfies ConnectionKey;
    return Result.Ok(
      await wsSockets.get(pkKey(connectionKey)).once(async (cKey) => {
        const wsUrl = uri
          .build()
          .protocol(params.protocol === "ws" ? "ws" : "wss")
          .appendRelative("ws")
          .URI();
        const ws = await newWebSocket(wsUrl);
        const waitOpen = new Future<void>();
        ws.onopen = () => {
          this.logger.Debug().Url(wsUrl).Msg("ws open");
          waitOpen.resolve();
        };
        ws.onclose = () => {
          wsSockets.unget(cKey);
          this.logger.Debug().Url(wsUrl).Msg("ws close");
        };
        await waitOpen.asPromise();
        return new ConnectionImpl(this.logger, ws, connectionKey);
      })
    );
  }

  async getResSignedUrl(uri: URI, method: HttpMethods): Promise<Result<ResSignedUrl>> {
    const rParams = uri.getParamsResult({
      store: 0,
      key: 0,
    });
    if (rParams.isErr()) {
      return this.logger.Error().Err(rParams).Msg("Error in getParamsResult").ResultError();
    }
    const rConn = await this.getCloudConnection(uri);
    if (rConn.isErr()) {
      return this.logger.Error().Err(rConn).Msg("Error in getCloudConnection").ResultError();
    }
    const conn = rConn.Ok();

    const { store, key } = rParams.Ok();

    return conn.request<ResSignedUrl>(
      buildReqSignedUrl(this.sthis, {
        params: {
          ...conn.params,
          store: store as FPStoreTypes,
          key,
          method,
        },
      })
    );
  }

  async put(uri: URI, body: Uint8Array): Promise<Result<void>> {
    const rResSignedUrl = await this.getResSignedUrl(uri, "PUT");
    if (rResSignedUrl.isErr()) {
      return this.logger.Error().Err(rResSignedUrl).Msg("Error in buildResSignedUrl").ResultError();
    }
    const {
      signedUrl: uploadUrl,
      params: { store },
    } = rResSignedUrl.Ok();
    if (store === "meta") {
      const bodyRes = await bs.addCryptoKeyToGatewayMetaPayload(uri, this.sthis, body);
      if (bodyRes.isErr()) {
        return this.logger.Error().Err(bodyRes).Msg("Error in addCryptoKeyToGatewayMetaPayload").ResultError();
      }
      body = bodyRes.Ok();
    }
    this.logger.Debug().Any("url", { uri, uploadUrl }).Msg("put-fetch-url");
    const rUpload = await exception2Result(async () => fetch(uploadUrl, { method: "PUT", body }));
    if (rUpload.isErr()) {
      return this.logger.Error().Url(uploadUrl, "uploadUrl").Err(rUpload).Msg("Error in put fetch").ResultError();
    }
    if (!rUpload.Ok().ok) {
      return this.logger.Error().Url(uploadUrl, "uploadUrl").Http(rUpload.Ok()).Msg("Error in put fetch").ResultError();
    }
    if (uri.getParam("testMode")) {
      this.trackPuts.add(uri.toString());
    }
    return Result.Ok(undefined);
  }

  private readonly subscriberCallbacks = new Set<(data: Uint8Array) => void>();

  private notifySubscribers(data: Uint8Array): void {
    console.log("notifySubscribers", data);
    for (const callback of this.subscriberCallbacks) {
      try {
        callback(data);
      } catch (error) {
        this.logger.Error().Err(error).Msg("Error in subscriber callback execution");
      }
    }
  }
  async subscribe(uri: URI, callback: (meta: Uint8Array) => void): Promise<bs.UnsubscribeResult> {
    const store = uri.getParam("store");
    if (store !== "meta") {
      return Result.Err(new Error("store must be meta"));
    }
    this.subscriberCallbacks.add(callback);

    // only ask for meta url if we are connected
    // if (this.party) {
    //   const rSignedUrl = await SignedUrl.from(this.sthis, this.logger, uri, "GET");
    //   if (rSignedUrl.isErr()) {
    //     return this.logger.Error().Err(rSignedUrl).Msg("Error in getOpUrl").ResultError();
    //   }
    //   await this.sendReqSignedMetaUrl(rSignedUrl.Ok());
    // }
    return Result.Ok(() => {
      this.subscriberCallbacks.delete(callback);
    });
  }

  async get(uri: URI): Promise<bs.GetResult> {
    const rResSignedUrl = await this.getResSignedUrl(uri, "GET");
    if (rResSignedUrl.isErr()) {
      return this.logger.Error().Err(rResSignedUrl).Msg("Error in buildResSignedUrl").ResultError();
    }
    const { signedUrl: downloadUrl } = rResSignedUrl.Ok();
    this.logger.Debug().Url(downloadUrl).Msg("get-fetch-url");
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
    return Result.Ok(new Uint8Array(await download.arrayBuffer()));
  }

  async delete(uri: URI): Promise<bs.VoidResult> {
    const rResSignedUrl = await this.getResSignedUrl(uri, "DELETE");
    if (rResSignedUrl.isErr()) {
      return this.logger.Error().Err(rResSignedUrl).Msg("Error in buildResSignedUrl").ResultError();
    }
    const { signedUrl: deleteUrl } = rResSignedUrl.Ok();
    this.logger.Debug().Url(deleteUrl).Msg("delete-fetch-url");
    const rDelete = await exception2Result(async () => fetch(deleteUrl.toString(), { method: "DELETE" }));
    if (rDelete.isErr()) {
      return this.logger.Error().Url(deleteUrl, "uploadUrl").Err(rDelete).Msg("Error in get deleteURL").ResultError();
    }
    const download = rDelete.Ok();
    if (!download.ok) {
      if (download.status === 404) {
        return Result.Err(new NotFoundError("Not found"));
      }
      return this.logger.Error().Url(deleteUrl, "uploadUrl").Err(rDelete).Msg("Error in del fetch").ResultError();
    }
    this.trackPuts.delete(uri.toString());
    return Result.Ok(undefined);
  }

  async destroy(_uri: URI): Promise<Result<void>> {
    // await this.ready();
    for (const key of this.trackPuts) {
      await this.delete(URI.from(key));
    }
    return Result.Ok(undefined);
  }
}

const wsSockets = new KeyedResolvOnce<Connection>();

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
