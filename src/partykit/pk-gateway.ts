import PartySocket, { PartySocketOptions } from "partysocket";
import { Result, URI, exception2Result, Level, runtimeFn, BuildURI, KeyedResolvOnce } from "@adviser/cement";
import { bs, ensureLogger, exceptionWrapper, Logger, NotFoundError, rt, SuperThis } from "@fireproof/core";
import { encode, decode } from "cborg";

// const knownParamKeys = new Set([
//   "name", "store", "index", "version", "room", "party", "protocol", "protocols"
// ])

// interface GatewayActionReq {
  // readonly action: "PUT"|"GET"|"DELETE"|"DESTROY"
// }

interface GETGatewayActionReq {
  readonly action: "GET"
  readonly key: string
}

interface PUTGatewayActionReq {
  readonly action: "PUT"
  readonly key: string
  readonly data: Uint8Array
}

interface DESTROYGatewayActionReq {
  readonly action: "DESTROY"
}

interface DELETEGatewayActionReq {
  readonly action: "DELETE"
  readonly key: string
}

type GatewayActionReq = GETGatewayActionReq|DELETEGatewayActionReq|DESTROYGatewayActionReq|PUTGatewayActionReq

interface GatewayActionRes {
  readonly action: "PUT"|"GET"|"DELETE"|"DESTROY"
  readonly key: string
  readonly data?: Uint8Array
}

function pkKey(set?: PartySocketOptions): string {
  const ret = JSON.stringify(Object.entries(set || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .filter(([k]) => k !== 'id')
    .map(([k, v]) => ({ [k]: v })));
    // console.log("pkKey", ret)
    return ret;
}

const pkSockets = new KeyedResolvOnce<PartySocket>();

async function gatewayActionReq(party: PartySocket|undefined, uri: URI, req: GatewayActionReq): Promise<GatewayActionRes> {
  if (!party) {
    throw new Error("party not found")
  }
  let proto = "https"
  const protocol = uri.getParam("protocol")
  if (protocol === "ws") {
    proto = "http"
  }
  const fetchUrl = BuildURI.from(party.url).protocol(proto).delParam("_pk").URI()
  const res = await fetch(fetchUrl.asURL(), {
    method: "POST", body: encode(req), headers: { "Content-Type": "application/cbor" }
  })
  const gres = decode(new Uint8Array(await res.arrayBuffer()))
  console.log("fetchUrl", fetchUrl.toString(), req, gres)
  return gres
}

function toKey(uri: URI): string {
  const keyp = []
  const index = uri.getParam("index");
  if (index) {
    keyp.push(index);
  }
  const store = uri.getParam("store");
  if (!store) throw new Error("store not found");
  keyp.push(store);

  const key = uri.getParam("key");
  if (!key) throw new Error("key not found");
  keyp.push(key);
  return keyp.join("/");
}

export class PartyKitGateway implements bs.Gateway {
  readonly logger: Logger;
  readonly sthis: SuperThis;
  readonly id: string;
  party?: PartySocket
  url?: URI

  constructor(sthis: SuperThis) {
    this.sthis = sthis;
    this.id = sthis.nextId().str;
    this.logger = ensureLogger(sthis, "PartyKitGateway", {
      url: () => this.url?.toString(),
      this: this.id,
    }).EnableLevel(Level.DEBUG);
    this.logger.Error().Msg("constructor");
  }

  async buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
    this.logger.Debug().Msg("build url");
    return Result.Ok(baseUrl.build().setParam("key", key).URI());
  }

  pso?: PartySocketOptions
  async start(uri: URI): Promise<Result<URI>> {
    console.log("start-1", uri.toString())
    await this.sthis.start();
    this.logger.Debug().Url(uri.asURL()).Msg("start");
    this.url = uri;
    const ret = uri.build().defParam("version", "v0.1-partykit").URI();
    // const name = uri.getParam("name");
    // if (!name) {
    // return Result.Err(this.logger.Error().Msg("name not found").AsError());
    // }
    this.logger.Debug().Msg(`starting`);

    // partykit://project-name.username.partykit.dev:1999/path/jojo?room=my-room&party=main&protocol=ws|wss&protocols=p1,p2&prefix?=/xxx/&params1=1&params2=2
    // ws[s]://project-name.username.partykit.dev:1999/path/jojo?room=my-room&party=main&protocols=p1,p2&prefix?=/xxx/&params1=1&params2=2

    const room = uri.getParam("room") || uri.getParam("name");
    if (!room) {
      console.error("room|name not found")
      return Result.Err(this.logger.Error().Msg("room|name not found").AsError());
    }
    const party = uri.getParam("party") || "main";
    const proto = uri.getParam("protocol") || "wss";
    let possibleUndef = {}
    if (proto) {
      possibleUndef = { protocol: proto }
    }

    const protocolsStr = uri.getParam("protocols");
    if (protocolsStr) {
      const ps = protocolsStr.split(",").map((x) => x.trim()).filter((x) => x);
      if (ps.length > 0) {
        possibleUndef = { ...possibleUndef, protocols: ps }
      }
    }
    const prefixStr = uri.getParam("prefix");
    if (prefixStr) {
      possibleUndef = { ...possibleUndef, prefix: prefixStr }
    }

    const query: PartySocketOptions['query'] = {}
    // for (const [key, value] of ret.getParams) {
    //   if (!knownParamKeys.has(key)) {
    //     query[key] = value;
    //   }
    // }

    const partySockOpts: PartySocketOptions = {
      id: this.id,
      host: this.url.host,
      room,
      party,
      ...possibleUndef,
      query,
      path: this.url.pathname.replace(/^\//, ''),
    };


    if (runtimeFn().isNodeIsh) {
      const { WebSocket } = await import("ws");
      partySockOpts.WebSocket = WebSocket;
    }
    this.pso = partySockOpts;
    // this.logger.Debug().Any("partySockOpts", partySockOpts).Msg("party socket options");
    console.log("start-2", ret.toString())
    return Result.Ok(ret);
  }

  async ready() {
    if (!this.pso) {
      throw new Error("not started");
    }
    // console.log("ready", this.party?.url, this.party?.roomUrl)
    return pkSockets.get(pkKey(this.pso)).once(async () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.party = new PartySocket(this.pso!);
      // // needed to have openFn to be a stable reference
      console.log("ready-1", this.id, this.pso, this.party?.url)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let exposedResolve = (b: boolean) => { /* noop */ };
      const openFn = () => {
        this.logger.Debug().Msg("party open");
        console.log("ready-open", this.id, this.party?.url)
        exposedResolve(true);
      }
      // const deleteFn = () => {
      //   this.party?.removeEventListener("close", deleteFn);
      //   this.party?.removeEventListener("open", openFn);
      //   this.logger.Debug().Msg("party close");
      //   this._ready.reset();
      //   this.party?.reconnect()
      // }
      // this.party?.addEventListener("close", deleteFn);
      return await new Promise<boolean>((resolve) => {
        exposedResolve = resolve;
        this.party?.addEventListener("open", openFn);
        console.log("ready-reg", this.id, this.party?.url)
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async close(url: URI): Promise<bs.VoidResult> {
    await this.ready();
    this.logger.Debug().Msg("close");
    // this.party?.close()
    return Result.Ok(undefined);
  }

  async put(uri: URI, body: Uint8Array): Promise<Result<void>> {
    console.log("put-1", uri.toString())
    await this.ready();
    console.log("put-2", uri.toString())
    return exception2Result(async () => {
      return gatewayActionReq(this.party, uri, {
        action: "PUT",
        key: toKey(uri),
        data: body
       })
    });
  }

  async get(uri: URI): Promise<bs.GetResult> {
    console.log("get-1", uri.toString())
    await this.ready();
    console.log("get-2", uri.toString())
    return exceptionWrapper(async () => {
      return gatewayActionReq(this.party, uri, {
        action: "GET",
        key: toKey(uri)
      }).then((r) => {
        if (!r.data) {
          return Result.Err(new NotFoundError(`no body: ${toKey(uri)}`));
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return Result.Ok(r.data!)
      })
    });
  }

  // getFilePath(uri: URI): string {
  //   const key = uri.getParam("key");
  //   if (!key) throw this.logger.Error().Url(uri.asURL()).Msg(`key not found`).AsError();
  //   return this.sthis.pathOps.join(rt.getPath(uri, this.sthis), rt.getFileName(uri, this.sthis));
  // }

  async delete(uri: URI): Promise<bs.VoidResult> {
    console.log("del-1", uri.toString())
    await this.ready();
    console.log("del-2", uri.toString())
    return exception2Result(async () => {
      return gatewayActionReq(this.party, uri, {
        action: "DELETE",
        key: toKey(uri)
      })
      // const deleteUrl = this.getFilePath(uri);
      // this.logger.Debug().Url(uri).Msg("delete");
      // const done = await fetch(deleteUrl, { method: 'DELETE' })
      // if (!done.ok) throw new Error(`failed to delete ${deleteUrl} ` + done.statusText)
    });
  }

  async destroy(uri: URI): Promise<Result<void>> {
    console.log("dty-1", uri.toString())
    await this.ready();
    console.log("dty-2", uri.toString())
    return exception2Result(async () => {
      return gatewayActionReq(this.party, uri, {
        action: "DESTROY",
        // key: uri.getParam("key") || ""
      })
    });
    // const delPrefix = dirname(this.getFilePath(url.Ok()));
    // this.logger.Debug().Str("target", delPrefix).Msg("destroy");
    // const done = await fetch(`${delPrefix}?destroyPrefix=true`, { method: 'DELETE' })
    // if (!done.ok) throw new Error(`failed to delete ${delPrefix} ` + done.statusText)
    // return Result.Ok(undefined);
  }
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
