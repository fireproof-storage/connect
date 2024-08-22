import PartySocket, {PartySocketOptions} from "partysocket";
import {Result, URI, runtimeFn} from "@adviser/cement";
import {bs, ensureLogger, exception2Result, Logger, NotFoundError, rt, SuperThis} from "@fireproof/core";
import {exceptionWrapper, getFileName, getPath} from "./utils";


export class PartyKitGateway implements bs.Gateway {
  readonly logger: Logger;
  readonly sthis: SuperThis;
  party: PartySocket | null;
  logName: string | undefined;

  constructor(sthis: SuperThis) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "PartyKitGateway");
    this.party = null;
  }

  async buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
    this.logger.Debug().Msg("build url");
    return Result.Ok(baseUrl.build().setParam("key", key).URI());
  }

  async start(uri: URI): Promise<Result<URI>> {
    await this.sthis.start();
    this.logger.Debug().Url(uri.asURL()).Msg("start");
    const ret = uri.build().defParam("version", "v0.1-partykit").URI();

    let name = uri.getParam("name");
    if (!name) {
      name = "fireproof"
    }
    this.logName = uri.getParam("logname");
    this.logger.Debug().Msg(`starting with ${name}`);

    const partySockOpts: PartySocketOptions = {
      party: "fireproof",
      host: uri.host,
      room: name,
    };

    if (runtimeFn().isNodeIsh) {
      const { WebSocket } = await import("ws");
      partySockOpts.WebSocket = WebSocket;
    }

    this.party = new PartySocket(partySockOpts);

    const ready = new Promise<void>((resolve) => {
      this.party?.addEventListener("open", () => {
        resolve();
      });
    });
    this.logger.Debug().Msg(`waiting for party to open`);
    await ready.then();
    this.logger.Debug().Msg(`party open for business`);
    this.logger.Debug().Url(ret.asURL()).Msg("return");
    return Result.Ok(ret);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async close(url: URI): Promise<bs.VoidResult> {
    this.logger.Debug().Msg("close");
    //this.party?.close()
    return Result.Ok(undefined);
  }

  async put(uri: URI, body: Uint8Array): Promise<Result<void>> {
    return exception2Result(async () => {
      const uploadMetaUrl = await this.getFilePath(uri);
      this.logger.Debug().Url(uri.asURL()).Msg("put");
      const done = await fetch(uploadMetaUrl, { method: 'PUT', body: body })
      if (!done.ok) throw new Error('failed to upload meta ' + done.statusText)
    });
  }

  async get(uri: URI): Promise<bs.GetResult> {
    return exceptionWrapper(async () => {
        const downloadUrl = this.getFilePath(uri);
        this.logger.Debug().Url(uri.asURL()).Msg("get");
        const response = await fetch(downloadUrl, { method: "GET" });
        if (response.status === 404) {
          return Result.Err(new NotFoundError(`file not found: ${downloadUrl}`));
        }
        const data = await response.arrayBuffer();
        return Result.Ok(new Uint8Array(data));
    });
  }

  getFilePath(uri: URI): string {
    const key = uri.getParam("key");
    if (!key) throw this.logger.Error().Url(uri.asURL()).Msg(`key not found`).AsError();
    return this.sthis.pathOps.join(getPath(uri, this.sthis), getFileName(uri, this.sthis));
  }

  async delete(uri: URI): Promise<bs.VoidResult> {
    this.logger.Debug().Url(uri.asURL()).Msg("delete");
    return exception2Result(async () => {
      const deleteUrl = this.getFilePath(uri);
      this.logger.Debug().Url(uri.asURL()).Msg("delete");
      const done = await fetch(deleteUrl, { method: 'DELETE' })
      if (!done.ok) throw new Error(`failed to delete ${deleteUrl} ` + done.statusText)
    });
  }

  async destroy(uri: URI): Promise<Result<void>> {
    this.logger.Debug().Url(uri.asURL()).Msg("destroy");
    const url = await this.buildUrl(uri, "x");
    if (url.isErr()) return url;
    const delPrefix = dirname(this.getFilePath(url.Ok()));
    this.logger.Debug().Url(uri.asURL()).Str("target", delPrefix).Msg("destroy");
    const done = await fetch(`${delPrefix}?destroyPrefix=true`, { method: 'DELETE' })
    if (!done.ok) throw new Error(`failed to delete ${deleteUrl} ` + done.statusText)
    return Result.Ok(undefined);
  }
}

function dirname(path: string) {
  return path.split("/").slice(0, -1).join("/");
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
