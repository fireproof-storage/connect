
export default {
  async fetch(request, env, ctx) {
    await env.STORAGE.put("x", "y")
    console.log(">>>>", env, await env.STORAGE.get("x"))
    return new Response("Hello World!");
  },
};
