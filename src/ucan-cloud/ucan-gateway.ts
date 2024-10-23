import { exception2Result, KeyedResolvOnce, Result, URI } from "@adviser/cement";
import { bs, getStore, Logger, SuperThis, ensureSuperLog, NotFoundError, ensureLogger, rt } from "@fireproof/core";
import { DID } from "@ucanto/core";
import { ConnectionView, Principal } from "@ucanto/interface";
import * as W3 from "@web3-storage/w3up-client";
import { Service as W3Service } from "@web3-storage/w3up-client/types";

import { CID } from "multiformats";

import * as Client from "./client";
import { Service } from "./types";
import stateStore from "./store/state";

export class UCANGateway implements bs.Gateway {
  readonly sthis: SuperThis;
  readonly logger: Logger;

  inst?: {
    clockId: `did:key:${string}`;
    email: `${string}@${string}`;
    server: Principal;
    service: ConnectionView<Service>;
    w3: W3.Client;
  };

  constructor(sthis: SuperThis) {
    this.sthis = ensureSuperLog(sthis, "UCANGateway");
    this.logger = this.sthis.logger;
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
    const emailParam = baseUrl.getParam("email");
    const clockIdParam = baseUrl.getParam("clock-id");
    const serverId = baseUrl.getParam("server-id");

    if (!dbName) throw new Error("Missing `name` param");
    if (!emailParam) throw new Error("Missing `email` param");
    if (!clockIdParam) throw new Error("Missing `clock-id` param");
    if (!serverId) throw new Error("Missing `server-id` param");

    const clockId = clockIdParam as `did:key:${string}`;
    const email = emailParam as `${string}@${string}`;

    await this.sthis.start();
    this.logger.Debug().Str("url", baseUrl.toString()).Msg("start");

    // W3 client
    const serverHostUrl = baseUrl.getParam("server-host")?.replace(/\/+$/, "");
    if (!serverHostUrl) throw new Error("Expected a `server-host` url param");
    const serverHost = URI.from(serverHostUrl);
    if (!serverHost) throw new Error("`server-host` is not a valid URL");

    const server = DID.parse(serverId);
    const service = Client.service({ host: serverHost, id: server });
    const w3Service = service as unknown as ConnectionView<W3Service>;
    const store = await stateStore(baseUrl.getParam("conf-profile") || "w3up-client");

    const w3 = await W3.create({
      store,
      serviceConf: {
        access: w3Service,
        filecoin: w3Service,
        upload: w3Service,
      },
    });

    console.log("⏰ CLOCK", clockId);

    // This
    this.inst = { clockId, email, server, service, w3 };

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

    console.log("🥘 PUT", store, key);

    switch (store.toLowerCase()) {
      case "data": {
        await Client.store({
          agent: this.inst.w3.agent.issuer,
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

        await Client.store({
          agent: this.inst.w3.agent.issuer,
          bytes: event.bytes,
          cid: event.cid,
          server: this.inst.server,
          service: this.inst.service,
        });

        const { clockId, server, service } = this.inst;
        const agent = await this.agent();

        const advancement = await Client.advanceClock({ agent, clockId, event: event.cid, server, service });
        if (advancement.out.error) throw advancement.out.error;

        break;
      }
    }
  }

  async get(url: URI): Promise<bs.GetResult> {
    const result = await exception2Result(() => this.#get(url));
    if (result.isErr() && result.Err().constructor.name !== "NotFoundError")
      this.logger.Error().Msg(result.Err().message);
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

    name += ".fp";

    console.log("🔮 GET", store, key);

    switch (store.toLowerCase()) {
      case "data": {
        const cid = CID.parse(key).toV1();

        const res = await Client.retrieve({
          agent: this.inst.w3.agent.issuer,
          cid: cid as CID<unknown, 514, number, 1>,
          server: this.inst.server,
          service: this.inst.service,
        });

        console.log("DATA FOUND", res);

        if (!res) throw new NotFoundError();
        return res;
      }
      case "meta": {
        const head = await Client.getClockHead({
          agent: await this.agent(),
          clockId: this.inst.clockId,
          server: this.inst.server,
          service: this.inst.service,
        });

        console.log("HEAD", head.out);

        if (head.out.error) throw head.out.error;
        if (head.out.ok.head === undefined) throw new NotFoundError();

        const cid = CID.parse(head.out.ok.head).toV1();

        const res = await Client.retrieve({
          agent: this.inst.w3.agent.issuer,
          cid: cid,
          server: this.inst.server,
          service: this.inst.service,
        });

        console.log("META RETRIEVED", res);

        if (!res) throw new NotFoundError();
        const metadata = await Client.metadataFromClockEvent(res);
        const resKeyInfo = await bs.setCryptoKeyFromGatewayMetaPayload(url, this.sthis, metadata);

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

  /**
   * Produce an agent.
   */
  async agent(): Promise<Client.Agent> {
    if (this.inst === undefined) {
      throw new Error("Not started yet");
    }

    const account = await this.inst.w3.login(this.inst.email);

    const attestation = account.proofs.find((p) => p.capabilities[0].can === "ucan/attest");
    const delegation = account.proofs.find((p) => p.capabilities[0].can === "*");

    if (!attestation || !delegation) {
      throw new Error("Unable to locate agent attestion or delegation");
    }

    return {
      attestation,
      delegation,
      signer: this.inst.w3.agent.issuer,
    };
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
