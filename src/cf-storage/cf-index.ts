import { Env } from "./env.js";
export { CFTestStorageProvider } from "./cf-test-dobj.js";
export default {
  async fetch(_request: Request, env: Env, _ctx: unknown) {
    const id = env.CFTestStorage.idFromName("test");
    const dobj = env.CFTestStorage.get(id);
    await dobj.put("test", "test-db");
    return new Response(`Hello World!${await dobj.get("test")}`, { status: 200 });
  },
};
