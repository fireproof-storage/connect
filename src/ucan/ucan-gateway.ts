import { exception2Result, KeyedResolvOnce, Logger, Result, URI } from "@adviser/cement";
import { SuperThis, NotFoundError, ensureLogger, rt, isNotFoundError } from "@fireproof/core";
import { getStore, bs } from "@fireproof/core";
import { DID } from "@ucanto/core";
import { ConnectionView, Delegation, Principal } from "@ucanto/interface";
import { Agent, DidMailto } from "@web3-storage/access/agent";
import { Absentee } from "@ucanto/principal";

import { CID } from "multiformats";

import * as Client from "./client.js";
import { Server, Service } from "./types.js";
import stateStore from "./store/state/index.js";
import { agentProofs, extractDelegation } from "./common.js";
import { AddKeyToDbMetaGateway } from "../meta-key-hack.js";

export class UCANGateway implements bs.Gateway {
  readonly sthis: SuperThis;
  readonly logger: Logger;

  inst?: {
    agent: Agent<Service>;
    clockDelegation?: Delegation;
    clockId: Principal<`did:key:${string}`>;
    email?: Principal<DidMailto>;
    polling: boolean;
    server: Server;
    service: ConnectionView<Service>;
  };

  constructor(sthis: SuperThis) {
    this.sthis = sthis;
    this.logger = ensureLogger(sthis, "UCANGateway");
  }

  async buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
    return Result.Ok(baseUrl.build().setParam("key", key).URI());
  }

  async start(baseUrl: URI): Promise<Result<URI>> {
    const result = await exception2Result(() => this.#start(baseUrl));
    if (result.isErr()) this.logger.Error().Msg(result.Err().message);
    return result;
  }

  async #start(baseUrl: URI): Promise<URI> {
    const dbName = baseUrl.getParam("name");

    const agentStoreName = baseUrl.getParam("agent-store");
    const clockIdParam = baseUrl.getParam("clock-id");
    const clockStoreName = baseUrl.getParam("clock-store");
    const emailIdParam = baseUrl.getParam("email-id");
    const serverId = baseUrl.getParam("server-id");
    const polling = baseUrl.getParam("poll") === "t" ? true : false;

    // Validate params
    if (!dbName) throw new Error("Missing `name` param");

    if (!agentStoreName) throw new Error("Missing `agent-store` param");
    if (!clockIdParam) throw new Error("Missing `clock-id` param");
    if (!serverId) throw new Error("Missing `server-id` param");

    const clockId = DID.parse(clockIdParam) as Principal<`did:key:${string}`>;
    const email = emailIdParam ? Absentee.from({ id: emailIdParam as DidMailto }) : undefined;

    // Server Host & ID
    const serverHostUrl = baseUrl.getParam("server-host")?.replace(/\/+$/, "");
    if (!serverHostUrl) throw new Error("Expected a `server-host` url param");
    const serverHost = URI.from(serverHostUrl);
    if (!serverHost) throw new Error("`server-host` is not a valid URL");

    const server = { id: DID.parse(serverId), uri: serverHost };
    const service = Client.service(server);

    // Agent
    const agentStore = await stateStore(agentStoreName);
    const agentData = await agentStore.load();
    if (!agentData) throw new Error("Could not load agent from store, has it been created yet?");
    const agent = Agent.from(agentData, { store: agentStore, connection: service });

    // Clock delegation
    let clockDelegation;

    if (email === undefined) {
      if (clockStoreName === undefined) {
        throw new Error("Cannot operate without an email address or `clock-store` param");
      }

      const clockStore = await stateStore(clockStoreName);
      const clockExport = await clockStore.load();

      clockDelegation = clockExport ? await extractDelegation(clockExport) : undefined;

      if (clockDelegation === undefined) {
        throw new Error("Cannot operate without an email address or clock delegation");
      }
    }

    // This
    this.inst = { agent, clockDelegation, clockId, email, polling, server, service };

    // Super
    await this.sthis.start();
    this.logger.Debug().Str("url", baseUrl.toString()).Msg("start");

    // Start URI
    return baseUrl.build().defParam("version", "v0.1-ucan").URI();
  }

  async close(): Promise<bs.VoidResult> {
    return Result.Ok(undefined);
  }

  async destroy(): Promise<Result<void>> {
    return Result.Ok(undefined);
  }

  async put(url: URI, body: Uint8Array): Promise<bs.VoidResult> {
    const result = await exception2Result(() => this.#put(url, body));
    if (result.isErr()) this.logger.Error().Msg(result.Err().message);
    return result;
  }

  async #put(url: URI, body: Uint8Array): Promise<void> {
    const { pathPart } = getStore(url, this.sthis, (...args) => args.join("/"));

    if (this.inst === undefined) {
      throw new Error("Not started yet");
    }

    const key = url.getParam("key");
    if (!key) {
      throw new Error("Key not found in the URI");
    }

    const name = url.getParam("name");
    if (!name) {
      throw new Error("Name not found in the URI");
    }

    this.logger.Debug().Str("store", pathPart).Str("key", key).Msg("put");

    switch (pathPart) {
      case "data": {
        await Client.store({
          agent: this.inst.agent.issuer,
          bytes: body,
          cid: CID.parse(key).toV1(),
          server: this.inst.server,
          service: this.inst.service,
        });
        break;
      }

      case "meta": {
        // attachKeyToMeta
        // const bodyWithCrypto = await attachKeyToMeta(this.sthis, body);
        // if (bodyWithCrypto.isErr()) throw bodyWithCrypto.Err();
        // const metadata = bodyWithCrypto // .Ok();
        const metadata = body;

        // const cid = CID.parse(key).toV1();
        const event = await Client.createClockEvent({ metadata });

        this.logger.Debug().Str("cid", event.toString()).Msg("Event created");

        await Client.store({
          agent: this.inst.agent.issuer,
          bytes: event.bytes,
          cid: event.cid,
          server: this.inst.server,
          service: this.inst.service,
        });

        this.logger.Debug().Msg("Event stored");

        const { agent, clockId, server, service } = this.inst;
        const advancement = await Client.advanceClock({
          agent: agent.issuer,
          clockId,
          event: event.cid,
          proofs: this.proofs(),
          server,
          service,
        });

        if (advancement.out.error) throw advancement.out.error;

        this.logger.Debug().Str("cid", event.cid.toString()).Msg("Clock advanced");

        break;
      }
    }
  }

  async get(url: URI): Promise<bs.GetResult> {
    const result = await exception2Result(() => this.#get(url));
    if (result.isErr() && !isNotFoundError(result.Err())) {
      return this.logger.Error().Err(result).Msg("get").ResultError();
    }
    return result;
  }

  async #get(url: URI): Promise<Uint8Array> {
    const { pathPart } = getStore(url, this.sthis, (...args) => args.join("/"));

    if (this.inst === undefined) {
      throw new Error("Not started yet");
    }

    const key = url.getParam("key");
    if (!key) {
      throw new Error("Key not found in the URI");
    }

    let name = url.getParam("name");
    if (!name) {
      throw new Error("Name not found in the URI");
    }

    const index = url.getParam("index");
    if (index) {
      name += `-${index}`;
    }

    this.logger.Debug().Str("store", pathPart).Str("key", key).Msg("get");

    switch (pathPart) {
      case "data": {
        const cid = CID.parse(key).toV1();

        const res = await Client.retrieve({
          agent: this.inst.agent.issuer,
          cid: cid as CID<unknown, 514, number, 1>,
          server: this.inst.server,
          service: this.inst.service,
        });

        this.logger.Debug().Str("cid", cid.toString()).Any("data", res).Msg("Data retrieved");

        if (!res) throw new NotFoundError();
        return res;
      }
      case "meta": {
        const head = await Client.getClockHead({
          agent: this.inst.agent.issuer,
          clockId: this.inst.clockId,
          proofs: this.proofs(),
          server: this.inst.server,
          service: this.inst.service,
        });

        this.logger.Debug().Any("head", head.out).Msg("Meta (head) retrieved");

        if (head.out.error) throw head.out.error;
        if (head.out.ok.head === undefined) throw new NotFoundError();

        const cid = CID.parse(head.out.ok.head).toV1();

        const res = await Client.retrieve({
          agent: this.inst.agent.issuer,
          cid: cid,
          server: this.inst.server,
          service: this.inst.service,
        });

        this.logger.Debug().Any("meta", res).Msg("Meta (bytes) retrieved");

        if (!res) throw new NotFoundError();
        const metadata = await Client.metadataFromClockEvent(res);

        // deserializeMetaWithKeySideEffect(this.sthis, metadata, loader: bs.Loadable): Promise<Result<Uint8Array>> {

        // const resKeyInfo = await bs.setCryptoKeyFromGatewayMetaPayload(url, this.sthis, metadata);

        // this.logger.Debug().Any("meta", metadata).Msg("Meta (event) decoded");

        // if (resKeyInfo.isErr()) {
        //   this.logger.Error().Err(resKeyInfo).Any("body", metadata).Msg("Error in setCryptoKeyFromGatewayMetaPayload");
        //   throw resKeyInfo.Err();
        // }

        return metadata;
      }
    }

    throw new NotFoundError();
  }

  async delete(_url: URI): Promise<bs.VoidResult> {
    // TODO
    return Result.Ok(undefined);
  }

  private readonly subscriberCallbacks = new Set<(data: Uint8Array) => void>();

  private notifySubscribers(data: Uint8Array): void {
    for (const callback of this.subscriberCallbacks) {
      try {
        callback(data);
      } catch (error) {
        this.logger.Error().Err(error).Msg("Error in subscriber callback execution");
      }
    }
  }

  async subscribe(url: URI, callback: (msg: Uint8Array) => void): Promise<bs.UnsubscribeResult> {
    // eslint-disable-next-line
    if (!this.inst?.polling) return Result.Ok(() => {});

    // Setup polling
    url = url.build().setParam("key", "main").URI();

    const interval = 10000;
    let lastData: Uint8Array | undefined = undefined;

    const fetchData = async () => {
      const result = await this.get(url);

      if (result.isOk()) {
        const data = result.Ok();

        if (!lastData || !data.every((value, index) => lastData && value === lastData[index])) {
          lastData = data;
          this.notifySubscribers(data);
        }
      }

      timeoutId = setTimeout(fetchData, interval);
    };

    this.subscriberCallbacks.add(callback);
    let timeoutId = setTimeout(fetchData, interval);

    return Result.Ok(() => {
      clearTimeout(timeoutId);
      this.subscriberCallbacks.delete(callback);
    });
  }

  async getPlain(uri: URI, key: string): Promise<Result<Uint8Array>> {
    const url = uri.build().setParam("key", key).URI();
    const dbFile = this.sthis.pathOps.join(rt.getPath(url, this.sthis), rt.getFileName(url, this.sthis));
    this.logger.Debug().Url(url).Str("dbFile", dbFile).Msg("get");
    const buffer = await this.get(url);
    this.logger.Debug().Url(url).Str("dbFile", dbFile).Len(buffer).Msg("got");
    return buffer;
  }

  ////////////////////////////////////////
  // AGENT
  ////////////////////////////////////////

  proofs(): Delegation[] {
    if (this.inst && this.inst.email) {
      const proofs = agentProofs(this.inst.agent);
      return [...proofs.delegations, ...proofs.attestations];
    }

    if (this.inst && this.inst.clockDelegation) {
      return [this.inst.clockDelegation];
    }

    return [];
  }
}

const onceRegisterPartyKitStoreProtocol = new KeyedResolvOnce<() => void>();
export function registerUCANStoreProtocol(protocol = "ucan:", overrideBaseURL?: string) {
  return onceRegisterPartyKitStoreProtocol.get(protocol).once(() => {
    URI.protocolHasHostpart(protocol);
    return bs.registerStoreProtocol({
      protocol,
      defaultURI: () => URI.from(overrideBaseURL || `${protocol}://localhost`),
      serdegateway: async (sthis) => {
        return new AddKeyToDbMetaGateway(new UCANGateway(sthis), "v1");
      },
    });
  });
}
