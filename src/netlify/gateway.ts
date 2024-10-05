import { KeyedResolvOnce, Result, URI, BuildURI } from "@adviser/cement";
import { bs, getStore, Logger, NotFoundError, SuperThis, ensureSuperLog } from "@fireproof/core";
import fetch from "cross-fetch";

export class NetlifyGateway implements bs.Gateway {
  readonly sthis: SuperThis;
  readonly logger: Logger;

  constructor(sthis: SuperThis) {
    this.sthis = ensureSuperLog(sthis, "NetlifyGateway");
    this.logger = this.sthis.logger;
  }

  async buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
    return Result.Ok(baseUrl.build().setParam("key", key).URI());
  }

  async destroy(url: URI): Promise<Result<void>> {
    const { store } = getStore(url, this.sthis, (...args) => args.join("/"));

    if (store !== "meta") {
      return Result.Ok(undefined);
      // return Result.Err(new Error("Store is not meta"));
    }
    let name = url.getParam("name");
    if (!name) {
      return Result.Err(new Error("Name not found in the URI"));
    }
    const index = url.getParam("index");
    if (index) {
      name += `-${index}`;
    }
    name += ".fp";
    const remoteBaseUrl = url.getParam("remoteBaseUrl");
    if (!remoteBaseUrl) {
      return Result.Err(new Error("Remote base URL not found in the URI"));
    }
    const fetchUrl = new URL(remoteBaseUrl);
    fetchUrl.searchParams.set("meta", name);

    const response = await fetch(fetchUrl.toString(), { method: "DELETE" });
    if (!response.ok) {
      return Result.Err(new Error(`Failed to destroy meta database: ${response.statusText}`));
    }
    return Result.Ok(undefined);
  }

  async start(uri: URI): Promise<Result<URI>> {
    // Convert netlify: to https: or http: based on the environment
    const protocol = uri.host.startsWith("localhost") ? "http" : "https";
    const host = uri.host;
    const path = "/fireproof";
    const urlString = `${protocol}://${host}${path}`;
    const baseUrl = BuildURI.from(urlString).URI();
    const ret = uri.build().defParam("version", "v0.1-netlify").defParam("remoteBaseUrl", baseUrl.toString()).URI();
    return Result.Ok(ret);
  }

  async close(): Promise<bs.VoidResult> {
    return Result.Ok(undefined);
  }

  async put(url: URI, body: Uint8Array): Promise<bs.VoidResult> {
    const { store } = getStore(url, this.sthis, (...args) => args.join("/"));

    const key = url.getParam("key");
    if (!key) {
      return Result.Err(new Error("Key not found in the URI"));
    }
    let name = url.getParam("name");
    if (!name) {
      return Result.Err(new Error("Name not found in the URI"));
    }
    const index = url.getParam("index");
    if (index) {
      name += `-${index}`;
    }
    name += ".fp";
    const remoteBaseUrl = url.getParam("remoteBaseUrl");
    if (!remoteBaseUrl) {
      return Result.Err(new Error("Remote base URL not found in the URI"));
    }
    const fetchUrl = new URL(remoteBaseUrl);
    switch (store) {
      case "meta":
        fetchUrl.searchParams.set("meta", name);
        break;
      default:
        fetchUrl.searchParams.set("car", key);
        break;
    }
    if (store === "meta") {
      const bodyRes = await bs.addCryptoKeyToGatewayMetaPayload(url, this.sthis, body);
      if (bodyRes.isErr()) {
        return Result.Err(bodyRes.Err());
      }
      body = bodyRes.Ok();
    }

    const done = await fetch(fetchUrl.toString(), { method: "PUT", body });
    if (!done.ok) {
      return Result.Err(new Error(`failed to upload ${store} ${done.statusText}`));
    }
    return Result.Ok(undefined);
  }

  async get(url: URI): Promise<bs.GetResult> {
    const { store } = getStore(url, this.sthis, (...args) => args.join("/"));
    const key = url.getParam("key");
    if (!key) {
      return Result.Err(new Error("Key not found in the URI"));
    }
    let name = url.getParam("name");
    if (!name) {
      return Result.Err(new Error("Name not found in the URI"));
    }
    const index = url.getParam("index");
    if (index) {
      name += `-${index}`;
    }
    name += ".fp";
    const remoteBaseUrl = url.getParam("remoteBaseUrl");
    if (!remoteBaseUrl) {
      return Result.Err(new Error("Remote base URL not found in the URI"));
    }
    const fetchUrl = new URL(remoteBaseUrl);
    switch (store) {
      case "meta":
        fetchUrl.searchParams.set("meta", name);
        break;
      default:
        fetchUrl.searchParams.set("car", key);
        break;
    }

    const response = await fetch(fetchUrl.toString());

    if (!response.ok) {
      return Result.Err(new NotFoundError(`${store} not found: ${url}`));
    }

    const data = new Uint8Array(await response.arrayBuffer());
    if (store === "meta") {
      const res = await bs.setCryptoKeyFromGatewayMetaPayload(url, this.sthis, data);
      if (res.isErr()) {
        return Result.Err(res.Err());
      }
    }
    return Result.Ok(data);
  }

  async delete(url: URI): Promise<bs.VoidResult> {
    const { store } = getStore(url, this.sthis, (...args) => args.join("/"));
    const key = url.getParam("key");

    let name = url.getParam("name");
    if (!name) {
      return Result.Err(new Error("Name not found in the URI"));
    }
    const index = url.getParam("index");
    if (index) {
      name += `-${index}`;
    }
    name += ".fp";
    const remoteBaseUrl = url.getParam("remoteBaseUrl");
    if (!remoteBaseUrl) {
      return Result.Err(new Error("Remote base URL not found in the URI"));
    }
    const fetchUrl = new URL(remoteBaseUrl);
    switch (store) {
      case "meta":
        fetchUrl.searchParams.set("meta", name);
        break;
      default:
        if (!key) {
          return Result.Err(new Error("Key not found in the URI"));
        }
        fetchUrl.searchParams.set("car", key);
        break;
    }
    const response = await fetch(fetchUrl.toString(), { method: "DELETE" });
    if (!response.ok) {
      return Result.Err(new Error(`Failed to delete car: ${response.statusText}`));
    }
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
          interval = Math.min(interval * 2, 3000);
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

export class NetlifyTestStore implements bs.TestGateway {
  readonly logger: Logger;
  readonly sthis: SuperThis;
  readonly gateway: bs.Gateway;

  constructor(sthis: SuperThis, gw: bs.Gateway) {
    this.sthis = ensureSuperLog(sthis, "NetlifyTestStore");
    this.logger = this.sthis.logger;
    this.gateway = gw;
  }

  async get(iurl: URI, key: string): Promise<Uint8Array> {
    const url = iurl.build().setParam("key", key).URI();
    const buffer = await this.gateway.get(url);
    return buffer.Ok();
  }
}

const onceRegisterNetlifyStoreProtocol = new KeyedResolvOnce<() => void>();
export function registerNetlifyStoreProtocol(protocol = "netlify:", overrideBaseURL?: string) {
  return onceRegisterNetlifyStoreProtocol.get(protocol).once(() => {
    URI.protocolHasHostpart(protocol);
    return bs.registerStoreProtocol({
      protocol,
      overrideBaseURL,
      gateway: async (sthis) => {
        return new NetlifyGateway(sthis);
      },
      test: async (sthis: SuperThis) => {
        const gateway = new NetlifyGateway(sthis);
        return new NetlifyTestStore(sthis, gateway);
      },
    });
  });
}
