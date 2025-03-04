import { CoerceURI, runtimeFn, URI } from "@adviser/cement";

export async function newWebSocket(url: CoerceURI): Promise<WebSocket> {
  const wsUrl = URI.from(url).toString();
  if (runtimeFn().isNodeIsh) {
    const { WebSocket: MyWS } = await import("ws");
    return new MyWS(wsUrl) as unknown as WebSocket;
  } else {
    return new WebSocket(wsUrl);
  }
}
