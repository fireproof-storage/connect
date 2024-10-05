import { KeyedResolvOnce, Result, URI } from "@adviser/cement";
import { bs, getStore, Logger, NotFoundError, SuperThis, ensureSuperLog } from "@fireproof/core";
import fetch from "cross-fetch";

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

    const uploadUrl = baseUrl.getParam("uploadUrl");
    const webSocketUrl = baseUrl.getParam("webSocketUrl");
    const dataUrl = baseUrl.getParam("dataUrl");

    if (!uploadUrl) {
      throw new Error("uploadUrl is not configured");
    }
    if (!webSocketUrl) {
      throw new Error("webSocketUrl is not configured");
    }
    if (!dataUrl) {
      throw new Error("dataUrl is not configured");
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
    const uploadUrl = url.getParam("uploadUrl");
    const key = url.getParam("key");
    const name = url.getParam("name");

    if (!uploadUrl || !key || !name) {
      return Result.Err(
        new Error(
          !uploadUrl
            ? "Upload URL not found in the URI"
            : !key
              ? "Key not found in the URI"
              : "Name not found in the URI"
        )
      );
    }

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
    const fetchUrl = new URL(`${uploadUrl}?${new URLSearchParams({ type: "meta", key, name }).toString()}`);
    const bodyRes = await bs.addCryptoKeyToGatewayMetaPayload(url, this.sthis, body);
    if (bodyRes.isErr()) {
      return Result.Err(bodyRes.Err());
    }
    const done = await fetch(fetchUrl, { method: "PUT", body: new TextDecoder().decode(bodyRes.Ok()) });
    if (!done.ok) {
      return Result.Err(new Error(`failed to upload meta ${done.statusText}`));
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
    const fetchUrl = new URL(`${uploadUrl}?${new URLSearchParams({ type: store, car: key, name }).toString()}`);
    // console.log("Upload Data URL:", fetchUrl.toString());

    const done = await fetch(fetchUrl, { method: "GET" });
    if (!done.ok) {
      return Result.Err(new Error(`failed to get upload URL ${done.statusText}`));
    }

    const doneJson = await done.json();

    if (!doneJson.uploadURL) {
      // console.log("Upload URL not found in the response", doneJson);
      return Result.Err(new Error("Upload URL not found in the response"));
    }

    // console.log("Upload Data URL:", doneJson.uploadURL);

    const uploadDone = await fetch(doneJson.uploadURL, { method: "PUT", body });

    if (!uploadDone.ok) {
      this.logger.Error().Int("status", uploadDone.status).Msg("Upload Data response error");
      return Result.Err(new Error(`failed to upload ${store} ${done.statusText}`));
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
    const dataUrl = url.getParam("dataUrl");
    const key = url.getParam("key");
    const name = url.getParam("name");
    // console.log("Get Data URL:", url.toString());
    if (!dataUrl) {
      return Result.Err(new Error("Download URL not found in the URI"));
    }
    if (!key) {
      return Result.Err(new Error("Key not found in the URI"));
    }
    const fetchUrl = new URL(`/data/${name}/${key}.car`, dataUrl);

    const response = await fetch(fetchUrl);

    if (!response.ok) {
      this.logger.Error().Int("status", response.status).Msg("Download Data response error");
      return Result.Err(new NotFoundError(`data not found: ${url}`));
    }

    const data = new Uint8Array(await response.arrayBuffer());
    return Result.Ok(data);
  }

  private async getMeta(url: URI): Promise<bs.GetResult> {
    const dataUrl = url.getParam("uploadUrl");
    const key = url.getParam("key");
    let name = url.getParam("name");
    const index = url.getParam("index");
    if (index) {
      name += `-${index}`;
    }
    name += ".fp";

    if (!dataUrl) {
      return Result.Err(new Error("Download URL not found in the URI"));
    }
    if (!key) {
      return Result.Err(new Error("Key not found in the URI"));
    }
    if (!name) {
      return Result.Err(new Error("Name not found in the URI"));
    }
    const fetchUrl = new URL(`${dataUrl}?${new URLSearchParams({ type: "meta", key, name }).toString()}`);

    const response = await fetch(fetchUrl);

    if (!response.ok) {
      this.logger
        .Error()
        .Int("status", response.status)
        .Str("statusText", response.statusText)
        .Str("response", await response.text())
        .Msg("Download Meta response error");
      return Result.Err(new NotFoundError(`meta not found: ${url}`));
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
    const dataUrl = url.getParam("dataUrl");
    const key = url.getParam("key");
    const name = url.getParam("name");
    if (!dataUrl) {
      return Result.Err(new Error("Download URL not found in the URI"));
    }
    if (!key) {
      return Result.Err(new Error("Key not found in the URI"));
    }
    const fetchUrl = new URL(`/wal/${name}.wal`, dataUrl);

    const response = await fetch(fetchUrl);

    if (!response.ok) {
      // console.log("Download Wal response error:", response.status);
      return Result.Err(new NotFoundError(`data not found: ${url}`));
    }

    const data = new Uint8Array(await response.arrayBuffer());
    return Result.Ok(data);
  }

  async delete(_url: URI): Promise<bs.VoidResult> {
    // throw new Error("Method not implemented.");
    return Result.Ok(undefined);
  }

  // this should be a shared fallback
  async subscribe(url: URI, callback: (msg: Uint8Array) => void): Promise<bs.VoidResult> {
    url = url.build().setParam("key", "main").URI();

    let lastData: Uint8Array | undefined = undefined;
    let interval = 100;
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
