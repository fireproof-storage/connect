import { URI } from "@adviser/cement";

export function add(a: number, b: number) {
  return a + b;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = URI.from(request.url);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const a = parseInt(url.getParam("a")!);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const b = parseInt(url.getParam("b")!);
    return new Response(add(a, b).toString());
  },
};
