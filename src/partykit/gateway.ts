import PartySocket, { PartySocketOptions } from "partysocket";
import { Result, URI, BuildURI, KeyedResolvOnce, runtimeFn, exception2Result } from "@adviser/cement";
import { bs, ensureLogger, getStore, Logger, rt, SuperThis } from "@fireproof/core";

export class PartyKitGateway implements bs.Gateway {
  readonly logger: Logger;
  readonly sthis: SuperThis;
  readonly id: string;
  party?: PartySocket;
  url?: URI;

  constructor(sthis: SuperThis) {
    this.sthis = sthis;
    this.id = sthis.nextId().str.toString();
    this.logger = ensureLogger(sthis, "PartyKitGateway", {
      url: () => this.url?.toString(),
      this: this.id,
    }); //.EnableLevel(Level.DEBUG);
    this.logger.Debug().Msg("constructor");
  }

  async buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
    return Result.Ok(baseUrl.build().setParam("key", key).URI());
  }

  pso?: PartySocketOptions;
  async start(uri: URI): Promise<Result<URI>> {
    this.logger.Debug().Msg("Starting PartyKitGateway with URI: " + uri.toString());

    await this.sthis.start();

    this.url = uri;
    const ret = uri.build().defParam("version", "v0.1-partykit").URI();

    let dbName = uri.getParam("name");
    if (!dbName) {
      this.logger.Error().Msg("Database name (name) parameter is missing in the URI");
      return Result.Err(this.logger.Error().Msg("name not found").AsError());
    }
    if (this.url.hasParam("index")) {
      dbName = dbName + "-idx";
    }
    const party = uri.getParam("party") || "fireproof";
    const proto = uri.getParam("protocol") || "wss";
    let possibleUndef = {};
    if (proto) {
      possibleUndef = { protocol: proto };
    }

    const protocolsStr = uri.getParam("protocols");
    if (protocolsStr) {
      const ps = protocolsStr
        .split(",")
        .map((x) => x.trim())
        .filter((x) => x);
      if (ps.length > 0) {
        possibleUndef = { ...possibleUndef, protocols: ps };
      }
    }
    const prefixStr = uri.getParam("prefix");
    if (prefixStr) {
      possibleUndef = { ...possibleUndef, prefix: prefixStr };
    }

    const query: PartySocketOptions["query"] = {};

    const partySockOpts: PartySocketOptions = {
      id: this.id,
      host: this.url.host,
      room: dbName,
      party,
      ...possibleUndef,
      query,
      path: this.url.pathname.replace(/^\//, ""),
    };

    if (runtimeFn().isNodeIsh) {
      const { WebSocket } = await import("ws");
      partySockOpts.WebSocket = WebSocket;
    }
    this.pso = partySockOpts;

    return Result.Ok(ret);
  }

  async ready(): Promise<void> {
    this.logger.Debug().Msg("ready");
  }

  async connectPartyKit() {
    const pkKeyThis = pkKey(this.pso);
    return pkSockets.get(pkKeyThis).once(async () => {
      if (!this.pso) {
        throw new Error("Party socket options not found");
      }
      this.party = new PartySocket(this.pso);
      let exposedResolve: (value: boolean) => void;
      const openFn = () => {
        this.logger.Debug().Msg("party open");
        this.party?.addEventListener("message", async (event: MessageEvent<string>) => {
          this.logger.Debug().Msg(`got message: ${event.data}`);
          const enc = new TextEncoder();
          const mbin = enc.encode(event.data);
          this.notifySubscribers(mbin);
        });
        exposedResolve(true);
      };
      return await new Promise<boolean>((resolve) => {
        exposedResolve = resolve;
        this.party?.addEventListener("open", openFn);
      });
    });
  }

  async close(): Promise<bs.VoidResult> {
    await this.ready();
    this.logger.Debug().Msg("close");
    this.party?.close();
    return Result.Ok(undefined);
  }

  async put(uri: URI, body: Uint8Array): Promise<Result<void>> {
    await this.ready();
    return exception2Result(async () => {
      const { store } = getStore(uri, this.sthis, (...args) => args.join("/"));
      if (store === "meta") {
        const bodyRes = await bs.addCryptoKeyToGatewayMetaPayload(uri, this.sthis, body);
        if (bodyRes.isErr()) {
          this.logger.Error().Err(bodyRes.Err()).Msg("Error in addCryptoKeyToGatewayMetaPayload");
          throw bodyRes.Err();
        }
        body = bodyRes.Ok();
      }
      const key = uri.getParam("key");
      if (!key) throw new Error("key not found");
      const uploadUrl = store === "meta" ? pkMetaURL(uri, key) : pkCarURL(uri, key);
      const response = await fetch(uploadUrl.toString(), { method: "PUT", body: body });
      if (response.status === 404) {
        throw new Error(`Failure in uploading ${store}!`);
      }
    });
  }

  private readonly subscriberCallbacks = new Set<(data: Uint8Array) => void>();

  private notifySubscribers(data: Uint8Array): void {
    for (const callback of this.subscriberCallbacks) {
      callback(data);
    }
  }
  async subscribe(uri: URI, callback: (data: Uint8Array) => void): Promise<bs.VoidResult> {
    await this.ready();
    await this.connectPartyKit();
    return exception2Result(async () => {
      const store = uri.getParam("store");
      switch (store) {
        case "meta":
          this.subscriberCallbacks.add(callback);
          return Result.Ok(() => {
            this.subscriberCallbacks.delete(callback);
          });
        default:
          throw new Error("store must be meta");
      }
    });
  }

  async get(uri: URI): Promise<bs.GetResult> {
    await this.ready();
    return exception2Result(async () => {
      const { store } = getStore(uri, this.sthis, (...args) => args.join("/"));
      const key = uri.getParam("key");
      if (!key) throw new Error("key not found");
      const downloadUrl = store === "meta" ? pkMetaURL(uri, key) : pkCarURL(uri, key);
      const response = await fetch(downloadUrl.toString(), { method: "GET" });
      if (response.status === 404) {
        throw new Error(`Failure in downloading ${store}!`);
      }
      const body = new Uint8Array(await response.arrayBuffer());
      if (store === "meta") {
        // console.log("download body", new TextDecoder().decode(body));
        // console.log("download body", new TextDecoder().decode(body));
        const resKeyInfo = await bs.setCryptoKeyFromGatewayMetaPayload(uri, this.sthis, body);
        if (resKeyInfo.isErr()) {
          this.logger
            .Error()
            .Err(resKeyInfo.Err())
            .Str("body", new TextDecoder().decode(body))
            .Msg("Error in setCryptoKeyFromGatewayMetaPayload");
          throw resKeyInfo.Err();
        }
      }
      return body;
    });
  }

  async delete(uri: URI): Promise<bs.VoidResult> {
    await this.ready();
    return exception2Result(async () => {
      const { store } = getStore(uri, this.sthis, (...args) => args.join("/"));
      const key = uri.getParam("key");
      if (!key) throw new Error("key not found");
      if (store === "meta") throw new Error("Cannot delete from meta store");
      const deleteUrl = pkCarURL(uri, key);
      const response = await fetch(deleteUrl.toString(), { method: "DELETE" });
      if (response.status === 404) {
        throw new Error(`Failure in deleting ${store}!`);
      }
    });
  }

  async destroy(uri: URI): Promise<Result<void>> {
    await this.ready();
    return exception2Result(async () => {
      const deleteUrl = pkBaseURL(uri);
      const response = await fetch(deleteUrl.toString(), { method: "DELETE" });
      if (response.status === 404) {
        throw new Error("Failure in deleting data!");
      }
      return Result.Ok(undefined);
    });
  }
}

const pkSockets = new KeyedResolvOnce<PartySocket>();

function pkKey(set?: PartySocketOptions): string {
  const ret = JSON.stringify(
    Object.entries(set || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .filter(([k]) => k !== "id")
      .map(([k, v]) => ({ [k]: v }))
  );
  return ret;
}
// ws://localhost:1999/parties/fireproof/test-public-api?_pk=zp9BXhS6u
// partykit://localhost:1999/?name=test-public-api&protocol=ws&store=meta
function pkURL(uri: URI, key: string, type: "car" | "meta"): URI {
  const host = uri.host;
  const name = uri.getParam("name");
  const idx = uri.getParam("index") || "";
  const protocol = uri.getParam("protocol") === "ws" ? "http" : "https";
  const path = `/parties/fireproof/${name}${idx}`;
  return BuildURI.from(`${protocol}://${host}${path}`).setParam(type, key).URI();
}

function pkBaseURL(uri: URI): URI {
  const host = uri.host;
  const name = uri.getParam("name");
  const idx = uri.getParam("index") || "";
  const protocol = uri.getParam("protocol") === "ws" ? "http" : "https";
  const path = `/parties/fireproof/${name}${idx}`;
  return BuildURI.from(`${protocol}://${host}${path}`).URI();
}

function pkCarURL(uri: URI, key: string): URI {
  return pkURL(uri, key, "car");
}

function pkMetaURL(uri: URI, key: string): URI {
  return pkURL(uri, key, "meta");
}

export class PartyKitTestStore implements bs.TestGateway {
  readonly logger: Logger;
  readonly sthis: SuperThis;
  readonly gateway: bs.Gateway;
  constructor(gw: bs.Gateway, sthis: SuperThis) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "PartyKitTestStore");
    this.gateway = gw;
  }
  async get(uri: URI, key: string): Promise<Uint8Array> {
    const url = uri.build().setParam("key", key).URI();
    const dbFile = this.sthis.pathOps.join(rt.getPath(url, this.sthis), rt.getFileName(url, this.sthis));
    this.logger.Debug().Url(url.asURL()).Str("dbFile", dbFile).Msg("get");
    const buffer = await this.gateway.get(url);
    this.logger.Debug().Url(url).Str("dbFile", dbFile).Len(buffer).Msg("got");
    return buffer.Ok();
  }
}

const onceRegisterPartyKitStoreProtocol = new KeyedResolvOnce<() => void>();
export function registerPartyKitStoreProtocol(protocol = "partykit:", overrideBaseURL?: string) {
  return onceRegisterPartyKitStoreProtocol.get(protocol).once(() => {
    URI.protocolHasHostpart(protocol);
    return bs.registerStoreProtocol({
      protocol,
      overrideBaseURL,
      gateway: async (sthis) => {
        return new PartyKitGateway(sthis);
      },
      test: async (sthis: SuperThis) => {
        const gateway = new PartyKitGateway(sthis);
        return new PartyKitTestStore(gateway, sthis);
      },
    });
  });
}
