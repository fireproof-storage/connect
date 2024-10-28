import { KeyedResolvOnce, Result, URI, BuildURI, exception2Result } from "@adviser/cement";
import { bs, getStore, Logger, NotFoundError, SuperThis, ensureSuperLog } from "@fireproof/core";

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
      // why are the other store types not supported?
      return Result.Ok(undefined);
      // return Result.Err(new Error("Store is not meta"));
    }
    const rName = url.getParamResult("name");
    if (rName.isErr()) {
      return Result.Err(rName.Err());
    }
    let name = rName.Ok();
    const index = url.getParam("index");
    if (index) {
      name += `-${index}`;
    }
    name += ".fp";
    const remoteBaseUrl = url.getParam("remoteBaseUrl");
    if (!remoteBaseUrl) {
      return Result.Err(new Error("Remote base URL not found in the URI"));
    }
    const fetchUrl = BuildURI.from(remoteBaseUrl).setParam("meta", name).URI();

    const response = await fetch(fetchUrl.asURL(), { method: "DELETE" });
    if (!response.ok) {
      return this.logger
        .Error()
        .Str("status", response.statusText)
        .Msg("Failed to destroy meta database")
        .ResultError();
    }
    return Result.Ok(undefined);
  }

  async start(uri: URI): Promise<Result<URI>> {
    // Convert netlify: to https: or http: based on the environment
    // the url should contain a parameter which describe if http or https is to use
    // the other parameters should also configurable
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

    const rParams = url.getParamsResult("key", "name");
    if (rParams.isErr()) {
      return this.logger.Error().Url(url).Err(rParams).Msg("Put Error").ResultError();
    }
    const { key } = rParams.Ok();
    let { name } = rParams.Ok();
    const index = url.getParam("index");
    if (index) {
      name += `-${index}`;
    }
    name += ".fp";
    const remoteBaseUrl = url.getParam("remoteBaseUrl");
    if (!remoteBaseUrl) {
      return Result.Err(new Error("Remote base URL not found in the URI"));
    }
    const fetchUrl = BuildURI.from(remoteBaseUrl);
    switch (store) {
      case "meta":
        fetchUrl.setParam("meta", name);
        break;
      default:
        fetchUrl.setParam("car", key);
        break;
    }
    if (store === "meta") {
      const bodyRes = await bs.addCryptoKeyToGatewayMetaPayload(url, this.sthis, body);
      if (bodyRes.isErr()) {
        return Result.Err(bodyRes.Err());
      }
      body = bodyRes.Ok();
    }

    const done = await fetch(fetchUrl.asURL(), { method: "PUT", body });
    if (!done.ok) {
      return this.logger
        .Error()
        .Url(fetchUrl.URI())
        .Int("status", done.status)
        .Str("statusText", done.statusText)
        .Msg(`failed to upload ${store}`)
        .ResultError();
    }
    return Result.Ok(undefined);
  }

  async get(url: URI): Promise<bs.GetResult> {
    const { store } = getStore(url, this.sthis, (...args) => args.join("/"));
    const rParams = url.getParamsResult("key", "name", "remoteBaseUrl");
    if (rParams.isErr()) {
      return Result.Err(rParams.Err());
    }
    const { key, remoteBaseUrl } = rParams.Ok();
    let { name } = rParams.Ok();
    const index = url.getParam("index");
    if (index) {
      name += `-${index}`;
    }
    name += ".fp";
    const fetchUrl = BuildURI.from(remoteBaseUrl);
    switch (store) {
      case "meta":
        fetchUrl.setParam("meta", name);
        break;
      default:
        fetchUrl.setParam("car", key);
        break;
    }

    const rresponse = await exception2Result(() => {
      return fetch(fetchUrl.URI().asURL());
    });
    if (rresponse.isErr()) {
      return this.logger.Error().Url(fetchUrl).Err(rresponse).Msg("Failed to fetch").ResultError();
    }
    const response = rresponse.Ok();

    if (!response.ok) {
      return Result.Err(new NotFoundError(`${store} not found: ${url}`));
    }

    const data = new Uint8Array(await response.arrayBuffer());
    if (store === "meta") {
      const res = await bs.setCryptoKeyFromGatewayMetaPayload(url, this.sthis, data);
      if (res.isErr()) {
        return this.logger.Error().Url(url).Err(res).Msg("Failed to set crypto key").ResultError();
      }
    }
    return Result.Ok(data);
  }

  async delete(url: URI): Promise<bs.VoidResult> {
    const { store } = getStore(url, this.sthis, (...args) => args.join("/"));
    const rParams = url.getParamsResult("key", "name", "remoteBaseUrl");
    if (rParams.isErr()) {
      return Result.Err(rParams.Err());
    }
    const { key, remoteBaseUrl } = rParams.Ok();
    let { name } = rParams.Ok();

    const index = url.getParam("index");
    if (index) {
      name += `-${index}`;
    }
    name += ".fp";
    const fetchUrl = BuildURI.from(remoteBaseUrl);
    switch (store) {
      case "meta":
        fetchUrl.setParam("meta", name);
        break;
      default:
        if (!key) {
          return Result.Err(new Error("Key not found in the URI"));
        }
        fetchUrl.setParam("car", key);
        break;
    }
    const response = await fetch(fetchUrl.URI().asURL(), { method: "DELETE" });
    if (!response.ok) {
      return Result.Err(new Error(`Failed to delete car: ${response.statusText}`));
    }
    return Result.Ok(undefined);
  }

  async subscribe(url: URI, callback: (msg: Uint8Array) => void): Promise<bs.UnsubscribeResult> {
    url = url.build().setParam("key", "main").defParam("interval", "100").defParam("maxInterval", "3000").URI();

    let lastData: Uint8Array | undefined = undefined;
    const initInterval = parseInt(url.getParam("interval") || "100", 10);
    const maxInterval = parseInt(url.getParam("maxInterval") || "3000", 10);
    let interval = initInterval;
    const fetchData = async () => {
      const result = await this.get(url);

      if (result.isOk()) {
        const data = result.Ok();
        if (!lastData || !data.every((value, index) => lastData && value === lastData[index])) {
          lastData = data;

          callback(data);
          interval = initInterval; // Reset interval when data changes
        } else {
          interval = Math.min(interval * 2, maxInterval);
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
      gateway: async (sthis): Promise<bs.Gateway> => {
        return new NetlifyGateway(sthis);
      },
      test: async (sthis: SuperThis) => {
        const gateway = new NetlifyGateway(sthis);
        return new NetlifyTestStore(sthis, gateway);
      },
    });
  });
}
