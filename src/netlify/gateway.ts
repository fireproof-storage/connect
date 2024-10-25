import { KeyedResolvOnce, Result, URI, BuildURI } from "@adviser/cement";
import { bs, getStore, Logger, SuperThis, ensureSuperLog, rt } from "@fireproof/core";
import { fetchUint8, resultFetch } from "../fetcher";
import { attachKeyToMeta, deserializeMetaWithKeySideEffect } from "../meta-key-hack";

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

  async put<T>(url: URI, fpenv: bs.FPEnvelope<T>, loader: bs.Loadable): Promise<bs.VoidResult> {
    // const { store } = getStore(url, this.sthis, (...args) => args.join("/"));

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
    let body = await rt.gw.fpSerialize(this.sthis, fpenv, url);
    switch (fpenv.type) {
      case "meta":
        {
          fetchUrl.setParam("meta", name);
          body = await attachKeyToMeta(this.sthis, body, loader);
        }
        break;
      default:
        fetchUrl.setParam("car", key);
        break;
    }
    const done = await resultFetch(this.logger, fetchUrl, { method: "PUT", body });
    if (done.isErr()) {
      return done;
    }
    return Result.Ok(undefined);
  }

  async get<T>(url: URI, loader: bs.Loadable): Promise<bs.GetResult<T>> {
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
    const raw = await fetchUint8(this.logger, fetchUrl);
    return rt.gw.fpDeserialize<T>(this.sthis, deserializeMetaWithKeySideEffect(this.sthis, raw, loader), url);
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
    const response = await fetchUint8(this.logger, fetchUrl.URI(), { method: "DELETE" });
    if (response.isErr()) {
      return Result.Err(response.Err());
      // return Result.Err(new Error(`Failed to delete car: ${response.statusText}`));
    }
    return Result.Ok(undefined);
  }

  async subscribe(url: URI, callback: (msg: bs.FPEnvelopeMeta) => void): Promise<bs.UnsubscribeResult> {
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
