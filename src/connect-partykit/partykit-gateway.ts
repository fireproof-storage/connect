import PartySocket, {PartySocketOptions} from "partysocket";
import {Result, URI, runtimeFn} from "@adviser/cement";
import {bs, ensureLogger, exception2Result, Logger, NotFoundError, rt, Store, SuperThis} from "@fireproof/core";
import {decodeEventBlock, EventBlock} from "@web3-storage/pail/clock";
import {MemoryBlockstore} from "@web3-storage/pail/block";
import {EventView} from "@web3-storage/pail/clock/api";

import {Base64} from "js-base64";
import type {Link} from "multiformats";


type DbMetaEventBlock = EventBlock<{ dbMeta: Uint8Array }>;
type CarClockHead = Link<DbMetaEventBlock>[];

export class PartyKitGateway implements bs.Gateway {
  readonly logger: Logger;
  readonly sthis: SuperThis;

  party: PartySocket | null;
  parents: CarClockHead = [];
  eventBlocks = new MemoryBlockstore();

  logName: string | undefined;

  messagePromise: Promise<Uint8Array[]>;
  messageResolve?: (value: Uint8Array[] | PromiseLike<Uint8Array[]>) => void;

  constructor(sthis: SuperThis) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "PartyKitGateway");
    this.party = null;

    this.messagePromise = new Promise<Uint8Array[]>((resolve) => {
      this.messageResolve = resolve;
    });
  }

  async buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
    this.logger.Debug().Msg("build url");
    return Result.Ok(baseUrl.build().setParam("key", key).URI());
  }

  async start(url: URI): Promise<Result<URI>> {
    await this.sthis.start();
    this.logger.Debug().Url(url).Msg("start");
    const ret = url.build().defParam("version", "v0.1-partykit").URI();

    let name = url.getParam("name");
    if (!name) {
      name = "fireproof"
    }
    this.logName = url.getParam("logname");
    this.logger.Debug().Msg(`starting with ${name}`);

    const partySockOpts: PartySocketOptions = {
      party: "fireproof",
      host: url.host,
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

    this.party.addEventListener("message", (event: MessageEvent<string>) => {
      this.logger.Debug().Msg(`got partykit message for {this.logName}`);
      const afn = async () => {
        const base64String = event.data;
        const uint8ArrayBuffer = Base64.toUint8Array(base64String);
        const eventBlock = await this.decodeEventBlock(uint8ArrayBuffer);

        // FIXME we lack a way to do this right now
        //await this.taskManager!.handleEvent(eventBlock)

        // @ts-ignore
        this.messageResolve?.([eventBlock.value.data.dbMeta as Uint8Array]);
        // add the cid to our parents so we delete it when we send the update
        //this.parents.push(eventBlock.cid);
        setTimeout(() => {
          this.messagePromise = new Promise<Uint8Array[]>((resolve) => {
            this.messageResolve = resolve;
          });
        }, 0);
      };
      void afn();
    });

    this.logger.Debug().Url(ret).Msg("return");
    return Result.Ok(ret);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async close(url: URI): Promise<bs.VoidResult> {
    this.logger.Debug().Msg("close");
    return Result.Ok(undefined);
  }

  async put(url: URI, body: Uint8Array): Promise<Result<void>> {
    return exception2Result(async () => {
      const host = url.host;
      const file = await this.getFilePath(url);
      this.logger.Debug().Str("url", url.toString()).Str("file", file).Msg("put");
      const uploadMetaUrl = `http://${host}/parties/fireproof${file}`;
      const done = await fetch(uploadMetaUrl, { method: 'PUT', body: body })
      if (!done.ok) throw new Error('failed to upload meta ' + done.statusText)
    });
  }

  getFilePath(url: URI): string {
    const key = url.getParam("key");
    if (!key) throw this.logger.Error().Url(url).Msg(`key not found`).AsError();
    return this.sthis.pathOps.join(getPath(url, this.sthis), getFileName(url, this.sthis));
  }

  // async put(url: URI, body: Uint8Array): Promise<bs.VoidResult> {
  //   this.logger.Debug().Msg("put");
  //   return exception2Result(async () => {
  //     const store = url.getParam("store");
  //     const host = url.host;
  //     const key = url.getParam("key");
  //
  //     let name = url.getParam("name");
  //     if (!name) {
  //       name = "fireproof"
  //     }
  //
  //     switch (store) {
  //       case "data":
  //
  //
  //
  //         const uploadUrl = `http://${host}/parties/fireproof/${name}?car=${key}`;
  //         this.logger.Debug().Msg(`putting to url {uploadUrl}`);
  //         const response = await fetch(uploadUrl, { method: "PUT", body: body });
  //         this.logger.Debug().Msg(`got ${response.statusText}`);
  //         if (response.status === 404) {
  //           throw new Error("Failure in uploading data!");
  //         }
  //
  //         break;
  //       case "meta":
  //         this.logger.Debug().Msg(`got a put for meta`);
  //         this.logger.Debug().Msg(`body: ${body}`);
  //         // const event = await this.createEventBlock(body);
  //         // const base64String = Base64.fromUint8Array(event.bytes);
  //         // const partyMessage = {
  //         //   data: base64String,
  //         //   cid: event.cid.toString(),
  //         //   parents: this.parents.map((p) => p.toString()),
  //         // };
  //
  //         // new handling
  //         const uploadMetaUrl = `http://${host}/parties/fireproof/${name}?meta=${name}`;
  //         //const done = await fetch(uploadMetaUrl, { method: 'PUT', body: JSON.stringify(partyMessage) })
  //         const done = await fetch(uploadMetaUrl, { method: 'PUT', body: body })
  //         if (!done.ok) throw new Error('failed to upload meta ' + done.statusText)
  //
  //         // old handling
  //         //this.party?.send(JSON.stringify(partyMessage));
  //
  //         //this.parents = [event.cid];
  //         break;
  //       default:
  //         throw this.logger.Error().Url(url).Msg(`store ${store} not supported`).AsError();
  //     }
  //   });
  // }

  async decodeEventBlock(bytes: Uint8Array): Promise<DbMetaEventBlock> {
    const event = await decodeEventBlock<{ dbMeta: Uint8Array }>(bytes);
    return event as EventBlock<{ dbMeta: Uint8Array }>; // todo test these `as` casts
  }

  async createEventBlock(bytes: Uint8Array): Promise<DbMetaEventBlock> {
    const data = {
      dbMeta: bytes,
    };
    const event = await EventBlock.create(
      data,
      this.parents as unknown as Link<EventView<{ dbMeta: Uint8Array }>, number, number, 1>[]
    );
    await this.eventBlocks.put(event.cid, event.bytes);
    return event as EventBlock<{ dbMeta: Uint8Array }>; // todo test these `as` casts
  }

  async get(url: URI): Promise<bs.GetResult> {
    return exceptionWrapper(async () => {
      const host = url.host;
      const file = this.getFilePath(url);
      try {
        const downloadUrl = `http://${host}/parties/fireproof${file}`;
        const response = await fetch(downloadUrl, { method: "GET" });
        if (response.status === 404) {
          throw new Error("Failure in downloading data!");
        }
        //const res = await this.fs.readfile(file);
        this.logger.Debug().Url(url.asURL()).Str("file", file).Msg("get");
        const data = await response.arrayBuffer();
        return Result.Ok(new Uint8Array(data));
      } catch (e: unknown) {
        // this.logger.Error().Err(e).Str("file", file).Msg("get");
        if (isNotFoundError(e)) {
          return Result.Err(new NotFoundError(`file not found: ${file}`));
        }
        return Result.Err(e as Error);
      }
    });
  }

  // async get(url: URI): Promise<bs.GetResult> {
  //   this.logger.Debug().Msg("get");
  //   try {
  //     const store = url.getParam("store");
  //     const key = url.getParam("key");
  //     const host = url.host;
  //
  //     let name = url.getParam("name");
  //     if (!name) {
  //       name = "fireproof"
  //     }
  //
  //     switch (store) {
  //       case "data":
  //         this.logger.Debug().Msg("get data");
  //         const uploadUrl = `http://${host}/parties/fireproof/${name}?car=${key}`;
  //         this.logger.Debug().Msg(`getting to url ${uploadUrl}`);
  //         const response = await fetch(uploadUrl, { method: "GET" });
  //         if (response.status === 404) {
  //           throw new Error("Failure in downloading data!");
  //         }
  //         const data = await response.arrayBuffer();
  //         // const data = Base64.toUint8Array(base64String)
  //         return Result.Ok(new Uint8Array(data));
  //       case "meta":
  //         this.logger.Debug().Msg("get meta");
  //         const downloadMetaUrl = `http://${host}/parties/fireproof/${name}?meta=${name}`;
  //         this.logger.Debug().Msg(`getting meta from url ${downloadMetaUrl}`);
  //         const metaResponse = await fetch(downloadMetaUrl, { method: "GET" });
  //         if (!metaResponse.ok) {
  //           throw new Error('failed to download meta ' + metaResponse.statusText)
  //         }
  //
  //         // const crdtEntries = await metaResponse.json()
  //         // //this.logger.Debug().Msg(`getting meta response ${crdtEntries.toString()}`);
  //         //   console.log('foob', crdtEntries)
  //         //   this.logger.Debug().Msg(crdtEntries.toString())
  //         // const events = await Promise.all(
  //         //     crdtEntries.map(async (entry: any) => {
  //         //       const base64String = entry.data
  //         //       const bytes = Base64.toUint8Array(base64String)
  //         //       // const event = await this.createEventBlock(bytes)
  //         //       return await decodeEventBlock(bytes)
  //         //     })
  //         // )
  //         // const cids = events.map(e => e.cid)
  //         // const uniqueParentsMap = new Map([...this.parents, ...cids].map(p => [p.toString(), p]))
  //         // this.parents = Array.from(uniqueParentsMap.values())
  //         // const eventBytes = events.map(e => e.bytes)
  //         return Result.Ok(metaResponse);
  //
  //         // // old handling
  //         // //const datas = await this.messagePromise;
  //         // this.logger.Debug().Msg(`get meta returning ${datas[0]}`);
  //         // return Result.Ok(datas[0]); // WTF?
  //     }
  //     return Result.Err(new NotFoundError(`fyou error`));
  //   } catch (e) {
  //     if ((e as NoSuchKey).name === "NoSuchKey") {
  //       return Result.Err(new NotFoundError(`fyou two error`));
  //     }
  //     return Result.Err(e as Error);
  //   }
  // }

  async delete(url: URI): Promise<bs.VoidResult> {
    this.logger.Debug().Msg("delete");
    return Result.Ok(undefined);
  }

  async destroy(baseURL: URI): Promise<Result<void>> {
    this.logger.Debug().Msg("destroy");
    return Result.Ok(undefined);
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
  async get(iurl: URI, key: string): Promise<Uint8Array> {
    const url = iurl.build().setParam("key", key).URI();
    const dbFile = this.sthis.pathOps.join(rt.getPath(url, this.sthis), rt.getFileName(url, this.sthis));
    this.logger.Debug().Url(url).Str("dbFile", dbFile).Msg("get");
    const buffer = await this.gateway.get(url);
    this.logger.Debug().Url(url).Str("dbFile", dbFile).Len(buffer).Msg("got");
    return buffer.Ok();
  }
}

export function getPath(url: URI, sthis: SuperThis): string {
  const basePath = "";
  // .toString()
  // .replace(new RegExp(`^${url.protocol}//`), "")
  // .replace(/\?.*$/, "");
  const name = url.getParam("name");
  if (name) {
    const version = url.getParam("version");
    if (!version) throw sthis.logger.Error().Url(url).Msg(`version not found`).AsError();
    return sthis.pathOps.join(basePath, version, name);
  }
  return sthis.pathOps.join(basePath);
}

export function getFileName(url: URI, sthis: SuperThis): string {
  const key = url.getParam("key");
  if (!key) throw sthis.logger.Error().Url(url).Msg(`key not found`).AsError();
  const res = getStore(url, sthis.logger, (...a: string[]) => a.join("-"));
  switch (res.store) {
    case "data":
      return sthis.pathOps.join(res.name, key + ".car");
    case "wal":
    case "meta":
      return sthis.pathOps.join(res.name, key + ".json");
    default:
      throw sthis.logger.Error().Url(url).Msg(`unsupported store type`).AsError();
  }
}

export type Joiner = (...toJoin: string[]) => string;

export function getStore(url: URI, logger: Logger, joiner: Joiner): Store {
  const store = url.getParam("store");
  switch (store) {
    case "data":
    case "wal":
    case "meta":
      break;
    default:
      throw logger.Error().Url(url).Msg(`store not found`).AsError();
  }
  let name: string = store;
  if (url.hasParam("index")) {
    name = joiner(url.getParam("index") || "idx", name);
  }
  return { store, name };
}

export async function exceptionWrapper<T, E extends Error>(fn: () => Promise<Result<T, E>>): Promise<Result<T, E>> {
  return fn().catch((e) => Result.Err(e));
}

export function isNotFoundError(e: Error | Result<unknown> | unknown): e is NotFoundError {
  if (Result.Is(e)) {
    if (e.isOk()) return false;
    e = e.Err();
  }
  if ((e as NotFoundError).code === "ENOENT") return true;
  return false;
}