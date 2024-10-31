/* eslint-disable no-console */
import { Agent } from "@web3-storage/access/agent";
// import { StoreConf } from '@web3-storage/access/stores/store-conf'
import { Delegation, DID, generate } from "@ucanto/principal/ed25519";
import { Driver } from "@web3-storage/access/drivers/types";
import { AgentDataExport, AgentDataModel, CIDString, DelegationMeta, SpaceMeta } from "@web3-storage/access/types";
import { ResolveOnce, URI } from "@adviser/cement";
import { Database, fireproof } from "@fireproof/core";

function replacer(_k: string, v: { type: string; data: unknown[] }): unknown {
  // eslint-disable-next-line no-restricted-globals
  if (v instanceof URL) {
    return { $url: v.toString() };
  } else if (v instanceof Map) {
    return { $map: [...v.entries()] };
  } else if (v instanceof Uint8Array) {
    return { $bytes: [...v.values()] };
  } else if (v instanceof ArrayBuffer) {
    return { $bytes: [...new Uint8Array(v).values()] };
  } else if (v?.type === "Buffer" && Array.isArray(v.data)) {
    return { $bytes: v.data };
  }
  return v;
}

export function reviver(
  _k: string,
  v: {
    $url: string;
    $map: [string, unknown][];
    $bytes: number[];
    [key: string]: unknown;
  }
): unknown {
  if (!v) return v;
  if (v.$url)
    // eslint-disable-next-line no-restricted-globals
    return new URL(v.$url);
  if (v.$map) return new Map(v.$map);
  if (v.$bytes) return new Uint8Array(v.$bytes);
  return v;
}

class FPStore implements Driver<AgentDataExport> {
  readonly path = "doof";
  readonly #fpStoreUrl: URI;

  readonly db: Database;
  readonly profile: string;
  constructor(opts: { fpStoreUrl: string; profile: string }) {
    this.#fpStoreUrl = URI.from(opts.fpStoreUrl);
    if (!this.#fpStoreUrl.getParam("name")) {
      throw new Error("Missing name parameter in the store URL");
    }
    this.profile = opts.profile;
    this.db = fireproof(this.#fpStoreUrl.getParam("name", ""), {
      store: {
        stores: {
          base: this.#fpStoreUrl,
        },
      },
    });
  }

  readonly _open = new ResolveOnce();
  async open(): Promise<void> {
    return;
  }
  async close(): Promise<void> {
    return;
  }
  async reset(): Promise<void> {
    return;
  }
  /** @param {T} data */
  async save(data: AgentDataExport): Promise<void> {
    await this.db.put({
      _id: this.profile,
      agentData: JSON.parse(JSON.stringify(data, replacer)),
    });
  }
  /** @returns {Promise<AgentDataExport|undefined>} */
  async load(): Promise<AgentDataExport | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await this.db.get<{ agentData: any }>(this.profile);
    console.log("load", res);
    return JSON.parse(JSON.stringify(res.agentData), reviver);
  }
}

async function createAgent() {
  // const store = new StoreConf({ profile: 'my-w3up-app' })
  const store = new FPStore({ profile: "my-w3up-app", fpStoreUrl: "./store?name=fp-store" });
  // console.log("store", store)
  //  if (!(await store.exists())) {
  //    await store.init({})
  //  }

  // if agent data already exists in the store, use it to create an Agent.
  const data = await store.load();
  if (data) {
    return Agent.from(data, { store });
  }

  // otherwise, generate a new Ed25519 signing key to act as the Agent's principal
  // and create a new Agent, passing in the store so the Agent can persist its state
  const principal = await generate();
  const agentData = {
    meta: {
      name: "my-nodejs-agent",
      type: "device", // | 'app' | 'service';
    },
    principal,
    spaces: new Map<DID, SpaceMeta>(),
    delegations: new Map<CIDString, { meta: DelegationMeta; delegation: Delegation }>(),
  } as AgentDataModel;
  return Agent.create(agentData, { store });
}

(async () => {
  await createAgent();
})().catch(console.error);
