import { DurableObject } from "cloudflare:workers";
// import { Env } from './env.js';

export class CFTestStorageProvider extends DurableObject {
  // constructor(ctx: DurableObjectState, env: Env) {
  //   super(ctx, env);
  // }

  put(key: string, value: string): Promise<void> {
    // console.log("put", key, value);
    return this.ctx.storage.put(key, value);
  }

  async get(key: string): Promise<string | null | undefined> {
    const ret = await this.ctx.storage.get<string>(key);
    // console.log("get", key, ret);
    return ret;
  }

  async delete(key: string): Promise<void> {
    // console.log("delete", key);
    await this.ctx.storage.delete(key);
  }
}
