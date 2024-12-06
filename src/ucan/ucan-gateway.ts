import { exception2Result, KeyedResolvOnce, Result, URI } from "@adviser/cement";
import { Logger, SuperThis, NotFoundError, ensureLogger, rt, isNotFoundError } from "@fireproof/core";
import { getStore, bs } from "@fireproof/core";
import { DID } from "@ucanto/core";
import { ConnectionView, Delegation, Principal } from "@ucanto/interface";
import { Agent, DidMailto } from "@web3-storage/access/agent";
import { Absentee } from "@ucanto/principal";

import { CID } from "multiformats";

import * as Client from "./client.js";
import { Server, Service } from "./types.js";
import stateStore from "./store/state/index.js";
import { extractDelegation } from "./common.js";

export class UCANGateway implements bs.Gateway {
  readonly sthis: SuperThis;
  readonly logger: Logger;

  inst?: {
    agent: Agent<Service>;
    clockDelegation?: Delegation;
    clockId: Principal<`did:key:${string}`>;
    email?: Principal<DidMailto>;
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
    this.inst = { agent, clockDelegation, clockId, email, server, service };

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
    const { store } = getStore(url, this.sthis, (...args) => args.join("/"));

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

    this.logger.Debug().Str("store", store).Str("key", key).Msg("put");

    switch (store.toLowerCase()) {
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
        const bodyWithCrypto = await bs.addCryptoKeyToGatewayMetaPayload(url, this.sthis, body);
        if (bodyWithCrypto.isErr()) throw bodyWithCrypto.Err();
        const metadata = bodyWithCrypto.Ok();

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
    const { store } = getStore(url, this.sthis, (...args) => args.join("/"));

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

    this.logger.Debug().Str("store", store).Str("key", key).Msg("get");

    switch (store.toLowerCase()) {
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

        // eslint-disable-next-line no-console
        console.log(head.out);

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
        const resKeyInfo = await bs.setCryptoKeyFromGatewayMetaPayload(url, this.sthis, metadata);

        this.logger.Debug().Any("meta", metadata).Msg("Meta (event) decoded");

        if (resKeyInfo.isErr()) {
          this.logger.Error().Err(resKeyInfo).Any("body", metadata).Msg("Error in setCryptoKeyFromGatewayMetaPayload");
          throw resKeyInfo.Err();
        }

        return metadata;
      }
    }

    throw new NotFoundError();
  }

  async delete(_url: URI): Promise<bs.VoidResult> {
    // TODO
    return Result.Ok(undefined);
  }

  ////////////////////////////////////////
  // AGENT
  ////////////////////////////////////////

  proofs(): Delegation[] {
    if (this.inst && this.inst.email) {
      const proofs = this.inst.agent.proofs([{ with: /did:mailto:.*/, can: "*" }]);

      const delegations = proofs.filter(
        (p) => p.capabilities[0].can === "*" && p.issuer.did() === this.inst?.email?.did()
      );

      const delegationCids = delegations.map((d) => d.cid.toString());
      const attestations = proofs.filter((p) => {
        const cap = p.capabilities[0];
        return (
          cap.can === "ucan/attest" &&
          delegationCids.includes((cap.nb as { proof: { toString(): string } }).proof.toString())
        );
      });

      return [...delegations, ...attestations];
    }

    if (this.inst && this.inst.clockDelegation) {
      return [this.inst.clockDelegation];
    }

    return [];
  }
}

export class UCANTestStore implements bs.TestGateway {
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
    this.logger.Debug().Url(url).Str("dbFile", dbFile).Msg("get");
    const buffer = await this.gateway.get(url);
    this.logger.Debug().Url(url).Str("dbFile", dbFile).Len(buffer).Msg("got");
    return buffer.Ok();
  }
}

const onceRegisterPartyKitStoreProtocol = new KeyedResolvOnce<() => void>();
export function registerUCANStoreProtocol(protocol = "ucan:", overrideBaseURL?: string) {
  return onceRegisterPartyKitStoreProtocol.get(protocol).once(() => {
    URI.protocolHasHostpart(protocol);
    return bs.registerStoreProtocol({
      protocol,
      overrideBaseURL,
      gateway: async (sthis) => {
        return new UCANGateway(sthis);
      },
      test: async (sthis: SuperThis) => {
        const gateway = new UCANGateway(sthis);
        return new UCANTestStore(gateway, sthis);
      },
    });
  });
}
