import { DurableObject } from "cloudflare:workers";
import { Env } from "./env.js";

export class FPMetaGroups extends DurableObject {
  currentlyConnectedWebSockets: number;

  constructor(ctx: DurableObjectState, env: Env) {
    // This is reset whenever the constructor runs because
    // regular WebSockets do not survive Durable Object resets.
    //
    // WebSockets accepted via the Hibernation API can survive
    // a certain type of eviction, but we will not cover that here.
    super(ctx, env);
    this.currentlyConnectedWebSockets = 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetch(request: Request): Promise<Response> {
    // Creates two ends of a WebSocket connection.
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    // Calling `accept()` tells the runtime that this WebSocket is to begin terminating
    // request within the Durable Object. It has the effect of "accepting" the connection,
    // and allowing the WebSocket to send and receive messages.
    server.accept();
    this.currentlyConnectedWebSockets += 1;

    // Upon receiving a message from the client, the server replies with the same message,
    // and the total number of connections with the "[Durable Object]: " prefix
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    server.addEventListener("message", (event: MessageEvent) => {
      server.send(`[Durable Object] currentlyConnectedWebSockets: ${this.currentlyConnectedWebSockets}`);
    });

    // If the client closes the connection, the runtime will close the connection too.
    server.addEventListener("close", (cls: CloseEvent) => {
      this.currentlyConnectedWebSockets -= 1;
      server.close(cls.code, "Durable Object is closing WebSocket");
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
}
