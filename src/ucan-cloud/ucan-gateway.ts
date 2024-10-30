import { exception2Result, KeyedResolvOnce, Result, URI } from "@adviser/cement";
import { bs, getStore, Logger, SuperThis, ensureSuperLog, NotFoundError, ensureLogger, rt } from "@fireproof/core";
import { DID } from "@ucanto/core";
import { ConnectionView } from "@ucanto/interface";
import { fromEmail } from "@web3-storage/did-mailto";

import { CID } from "multiformats";

import * as Client from "./client";
import { Server, Service } from "./types";

export class UCANGateway implements bs.Gateway {
  readonly sthis: SuperThis;
  readonly logger: Logger;

  inst?: {
    clockId: `did:key:${string}`;
    email?: `${string}@${string}`;
    server: Server;
    service: ConnectionView<Service>;
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
    const emailIdParam = baseUrl.getParam("email-id");
    const clockIdParam = baseUrl.getParam("clock-id");
    const serverId = baseUrl.getParam("server-id");

    if (!dbName) throw new Error("Missing `name` param");
    if (!clockIdParam) throw new Error("Missing `clock-id` param");
    if (!serverId) throw new Error("Missing `server-id` param");

    const clockId = clockIdParam as `did:key:${string}`;
    const email = emailIdParam ? (emailIdParam as `did:mailto:${string}`) : undefined;

    await this.sthis.start();
    this.logger.Debug().Str("url", baseUrl.toString()).Msg("start");

    // Server Host & ID
    const serverHostUrl = baseUrl.getParam("server-host")?.replace(/\/+$/, "");
    if (!serverHostUrl) throw new Error("Expected a `server-host` url param");
    const serverHost = URI.from(serverHostUrl);
    if (!serverHost) throw new Error("`server-host` is not a valid URL");

    const server = { id: DID.parse(serverId), uri: serverHost };
    const service = Client.service(server);

    // Agent

    // This
    this.inst = { agent, clockId, email, server, service };

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
          agent: this.inst.agent,
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
          agent: this.inst.w3.agent.issuer,
          bytes: event.bytes,
          cid: event.cid,
          server: this.inst.server,
          service: this.inst.service,
        });

        this.logger.Debug().Msg("Event stored");

        const { clockId, server, service } = this.inst;
        const agent = await this.agent();

        const advancement = await Client.advanceClock({ agent, clockId, event: event.cid, server, service });
        if (advancement.out.error) throw advancement.out.error;

        this.logger.Debug().Str("cid", event.toString()).Msg("Clock advanced");

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

    this.logger.Debug().Str("store", store).Str("key", key).Msg("get");

    switch (store.toLowerCase()) {
      case "data": {
        const cid = CID.parse(key).toV1();

        const res = await Client.retrieve({
          agent: this.inst.w3.agent.issuer,
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
          agent: await this.agent(),
          clockId: this.inst.clockId,
          server: this.inst.server,
          service: this.inst.service,
        });

        this.logger.Debug().Any("head", head.out).Msg("Meta (head) retrieved");

        if (head.out.error) throw head.out.error;
        if (head.out.ok.head === undefined) throw new NotFoundError();

        const cid = CID.parse(head.out.ok.head).toV1();

        const res = await Client.retrieve({
          agent: this.inst.w3.agent.issuer,
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

  /**
   * Produce an agent.
   */
  async agent(): Promise<Client.Agent> {
    if (this.inst === undefined) {
      throw new Error("Not started yet");
    }

    if (this.inst.email === undefined) {
      throw new Error("Email was not provided");
    }

    const account = fromEmail(this.inst.email);
    const session = W3.Account.list({ agent: this.inst.w3.agent }, { account })[account];

    if (!session) {
      throw new Error("Can't proceed");
    }

    const attestation = session.proofs.find((p) => p.capabilities[0].can === "ucan/attest");
    const delegation = session.proofs.find((p) => p.capabilities[0].can === "*");

    if (!attestation || !delegation) {
      throw new Error("Unable to locate agent attestion or delegation. Make sure you are logged in!");
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
