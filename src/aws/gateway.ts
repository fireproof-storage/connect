import { BuildURI, CoerceURI, exception2Result, KeyedResolvOnce, Result, URI } from "@adviser/cement";
import { bs, getStore, Logger, NotFoundError, SuperThis, ensureSuperLog } from "@fireproof/core";

async function resultFetch(logger: Logger, curl: CoerceURI, init?: RequestInit): Promise<Result<Response>> {
  const url = URI.from(curl);
  try {
    const ret = await fetch(url.asURL(), init);
    // logger.Debug().Url(url).Any("init", init).Int("status", ret.status).Msg("Fetch Done");
    return Result.Ok(ret);
  } catch (err) {
    return logger.Error().Url(url).Any("init", init).Err(err).Msg("Fetch Error").ResultError();
  }
}

export class AWSGateway implements bs.Gateway {
  readonly sthis: SuperThis;
  readonly logger: Logger;

  constructor(sthis: SuperThis) {
    this.sthis = ensureSuperLog(sthis, "AWSGateway");
    this.logger = this.sthis.logger;
  }

  async buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
    return Result.Ok(baseUrl.build().setParam("key", key).URI());
  }

  async destroy(): Promise<Result<void>> {
    // Implement the destroy logic for AWS
    return Result.Ok(undefined);
  }

  async start(baseUrl: URI): Promise<Result<URI>> {
    await this.sthis.start();
    this.logger.Debug().Str("url", baseUrl.toString()).Msg("start");

    const rParams = baseUrl.getParamsResult("uploadUrl", "webSocketUrl", "dataUrl");
    if (rParams.isErr()) {
      return Result.Err(rParams.Err());
    }
    const ret = baseUrl
      .build()
      .defParam("version", "v0.1-aws")
      .defParam("region", baseUrl.getParam("region") || "us-east-2")
      .URI();

    return Result.Ok(ret);
  }

  async close(): Promise<bs.VoidResult> {
    return Result.Ok(undefined);
  }

  async put(url: URI, body: Uint8Array): Promise<bs.VoidResult> {
    const { store } = getStore(url, this.sthis, (...args) => args.join("/"));

    const rParams = url.getParamsResult("uploadUrl", "key", "name");
    if (rParams.isErr()) {
      return this.logger.Error().Url(url).Err(rParams).Msg("Put Error").ResultError();
    }
    const { uploadUrl, key, name } = rParams.Ok();
    return store === "meta"
      ? this.putMeta(url, uploadUrl, key, name, body)
      : this.putData(uploadUrl, store, key, name, body);
  }
  private async putMeta(
    url: URI,
    uploadUrl: string,
    key: string,
    name: string,
    body: Uint8Array
  ): Promise<bs.VoidResult> {
    const index = url.getParam("index");
    if (index) {
      name += `-${index}`;
    }
    name += ".fp";
    const fetchUrl = BuildURI.from(uploadUrl)
      .setParam("type", "meta")
      .setParam("key", key)
      .setParam("name", name)
      .URI();

    // const rPrefetch = await resultFetch(this.logger, fetchUrl, { method: "GET" });
    // if (rPrefetch.isErr()) {
    //   return Result.Err(rPrefetch.Err());
    // }
    // const prefetch = rPrefetch.Ok();
    // // if (!prefetch.ok) {
    // //   return this.logger.Error().Url(fetchUrl).Int("status", prefetch.status).Msg("failed to upload meta").ResultError();
    // // }

    // const doneJson = await prefetch.json();
    // if (!doneJson.uploadURL) {
    //   return this.logger.Error().Url(fetchUrl).Any({doneJson}).Msg("Upload URL not found in the response").ResultError();
    // }

    const meta = await bs.addCryptoKeyToGatewayMetaPayload(url, this.sthis, body);
    if (meta.isErr()) {
      return Result.Err(meta.Err());
    }
    this.logger.Debug().Url(fetchUrl).Any({ meta }).Msg("putMeta");
    const rDone = await resultFetch(this.logger, fetchUrl, {
      method: "PUT",
      body: this.sthis.txt.decode(meta.Ok()),
    });
    if (rDone.isErr()) {
      return Result.Err(rDone.Err());
    }
    const done = rDone.Ok();
    if (!done.ok) {
      return this.logger
        .Error()
        .Url(fetchUrl)
        .Any({ done, x: await done.text() })
        .Msg("failed to upload meta")
        .ResultError();
    }
    return Result.Ok(undefined);
  }

  private async putData(
    uploadUrl: string,
    store: string,
    key: string,
    name: string,
    body: Uint8Array
  ): Promise<bs.VoidResult> {
    const fetchUrl = BuildURI.from(uploadUrl).setParam("type", store).setParam("car", key).setParam("name", name).URI();

    const rDone = await resultFetch(this.logger, fetchUrl, { method: "GET" });
    if (rDone.isErr()) {
      return Result.Err(rDone.Err());
    }
    const done = rDone.Ok();
    if (!done.ok) {
      return this.logger.Error().Any({ resp: done }).Msg("failed to upload meta").ResultError();
    }

    const doneJson = await done.json();
    if (!doneJson.uploadURL) {
      return this.logger.Error().Url(fetchUrl).Msg("Upload URL not found in the response").ResultError();
    }

    const ruploadDone = await resultFetch(this.logger, doneJson.uploadURL, { method: "PUT", body });
    if (ruploadDone.isErr()) {
      return Result.Err(ruploadDone.Err());
    }
    const uploadDone = ruploadDone.Ok();
    if (!uploadDone.ok) {
      return this.logger.Error().Any({ resp: uploadDone }).Msg("Upload Data response error").ResultError();
    }

    return Result.Ok(undefined);
  }

  async get(url: URI): Promise<bs.GetResult> {
    const { store } = getStore(url, this.sthis, (...args) => args.join("/"));
    switch (store) {
      case "meta":
        return this.getMeta(url);
      case "data":
        return this.getData(url);
      case "wal":
        return this.getWal(url);
      default:
        throw new Error(`Unknown store type: ${store}`);
    }
  }

  private async getData(url: URI): Promise<bs.GetResult> {
    const rParams = url.getParamsResult("dataUrl", "key", "name");
    // console.log("Get Data URL:", url.toString());
    if (rParams.isErr()) {
      return Result.Err(rParams.Err());
    }
    const { dataUrl, name, key } = rParams.Ok();
    const fetchUrl = BuildURI.from(dataUrl).appendRelative(`/data/${name}/${key}.car`).URI();
    const rresponse = await resultFetch(this.logger, fetchUrl);
    if (rresponse.isErr()) {
      return Result.Err(rresponse.Err());
    }
    const response = rresponse.Ok();
    if (!response.ok) {
      this.logger
        .Error()
        .Url(fetchUrl, "fetchUrl")
        .Url(dataUrl, "dataUrl")
        .Int("status", response.status)
        .Msg("Download Data response error");
      return Result.Err(new NotFoundError(`data not found: ${url}`));
    }

    const data = new Uint8Array(await response.arrayBuffer());
    return Result.Ok(data);
  }

  private async getMeta(url: URI): Promise<bs.GetResult> {
    const rParams = url.getParamsResult("uploadUrl", "name", "key");
    if (rParams.isErr()) {
      return Result.Err(rParams.Err());
    }
    const { uploadUrl, key } = rParams.Ok();
    let name = rParams.Ok().name;
    const index = url.getParam("index");
    if (index) {
      name += `-${index}`;
    }
    name += ".fp";
    const fetchUrl = BuildURI.from(uploadUrl)
      .setParam("type", "meta")
      .setParam("key", key)
      .setParam("name", name)
      .URI();
    const rresponse = await resultFetch(this.logger, fetchUrl);
    if (rresponse.isErr()) {
      return Result.Err(rresponse.Err());
    }
    const response = rresponse.Ok();
    if (!response.ok) {
      if (response.status === 403) {
        return Result.Err(new NotFoundError(`meta not found: ${url}->${fetchUrl}`));
      }
      return this.logger.Error().Url(fetchUrl).Any({ response }).Msg("Download Meta response error").ResultError();
    }

    const data = new Uint8Array(await response.arrayBuffer());
    // bs.setCryptoKeyFromGatewayMetaPayload(url, this.sthis, data);
    const res = await bs.setCryptoKeyFromGatewayMetaPayload(url, this.sthis, data);
    if (res.isErr()) {
      return Result.Err(res.Err());
    }
    return Result.Ok(data);
  }

  private async getWal(url: URI): Promise<bs.GetResult> {
    const rParams = url.getParamsResult("dataUrl", "key", "name");
    if (rParams.isErr()) {
      return Result.Err(rParams.Err());
    }
    const { dataUrl, name } = rParams.Ok();
    const fetchUrl = BuildURI.from(dataUrl).appendRelative(`/wal/${name}.wal`).URI();
    const rresponse = await exception2Result(() => fetch(fetchUrl.asURL()));
    if (rresponse.isErr()) {
      return Result.Err(rresponse.Err());
    }
    const response = rresponse.Ok();
    if (!response.ok) {
      // console.log("Download Wal response error:", response.status);
      return Result.Err(new NotFoundError(`wal not found: ${url}`));
    }
    const data = new Uint8Array(await response.arrayBuffer());
    return Result.Ok(data);
  }

  async delete(_url: URI): Promise<bs.VoidResult> {
    // throw new Error("Method not implemented.");
    return Result.Ok(undefined);
  }

  async subscribe(url: URI, callback: (meta: Uint8Array) => void): Promise<bs.UnsubscribeResult> {
    url = url.build().setParam("key", "main").defParam("interval", "100").URI();

    let lastData: Uint8Array | undefined = undefined;
    let interval = parseInt(url.getParam("interval") || "100", 10);
    const fetchData = async () => {
      const result = await this.get(url);

      if (result.isOk()) {
        const data = result.Ok();
        if (!lastData || !data.every((value, index) => lastData && value === lastData[index])) {
          lastData = data;

          callback(data);
          interval = 100; // Reset interval when data changes
        } else {
          interval = Math.min(interval * 2, 3000); // Double the interval when data is unchanged, but limit to 3 secs
        }
      }
      timeoutId = setTimeout(fetchData, interval);
    };
    let timeoutId = setTimeout(fetchData, interval);

    return Result.Ok(() => {
      clearTimeout(timeoutId);
    });
  }
}

export class AWSTestStore implements bs.TestGateway {
  readonly logger: Logger;
  readonly sthis: SuperThis;
  readonly gateway: bs.Gateway;

  constructor(sthis: SuperThis, gw: bs.Gateway) {
    this.sthis = ensureSuperLog(sthis, "AWSTestStore");
    this.logger = this.sthis.logger;
    this.gateway = gw;
  }

  async get(iurl: URI, key: string): Promise<Uint8Array> {
    const url = iurl.build().setParam("key", key).URI();
    const buffer = await this.gateway.get(url);
    return buffer.Ok();
  }
}

const onceRegisterAWSStoreProtocol = new KeyedResolvOnce<() => void>();
export function registerAWSStoreProtocol(protocol = "aws:", overrideBaseURL?: string) {
  return onceRegisterAWSStoreProtocol.get(protocol).once(() => {
    URI.protocolHasHostpart(protocol);
    return bs.registerStoreProtocol({
      protocol,
      overrideBaseURL,
      gateway: async (sthis) => {
        return new AWSGateway(sthis);
      },
      test: async (sthis: SuperThis) => {
        const gateway = new AWSGateway(sthis);
        return new AWSTestStore(sthis, gateway);
      },
    });
  });
}
