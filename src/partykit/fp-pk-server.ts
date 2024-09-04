import type * as Party from "partykit/server";
import { decode, encode } from "cborg";

// interface PartyMessage {
//   readonly data: string;
//   readonly cid: string;
//   readonly parents: string[];
// };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT,  DELETE",
};

// interface CRDTEntry {
//   readonly data: string
//   readonly cid: string
//   readonly parents: string[]
// }

function json<T>(data: T, status = 200) {
  return Response.json(data, { status, headers: CORS });
}

function cbor<T>(data: T, status = 200) {
  return new Response(encode(data), {
    status, headers: {
      "Content-Type": "application/cbor",
      ...CORS
    }
  });
}


function ok() {
  return json({ ok: true });
}

export default class FPPartyKitServer implements Party.Server {
  // readonly clockHead = new Map<string, string>()

  constructor(public party: Party.Room) {
  }

  async onStart() {
    console.log("on start");
    // return this.party.storage.get("main").then((head) => {
    //   if (head) {
    //     this.clockHead = head as Map<string, string>;
    //   }
    // });
  }

  async onRequest(request: Party.Request): Promise<Response> {
    // console.log("on request", request.method, request.url)
    // const url = URI.from(request.url);
    // let path = url.pathname
    // const prefix = "/parties/fireproof"
    // if (path.startsWith(prefix)) {
    //   path = path.slice(prefix.length)
    // }
    // this.logger.Info().Str("path", path).Msg("on request")

    // Check if it's a preflight request (OPTIONS) and handle it
    // console.log("1-on request", request.method, request.url);
    if (request.method === "OPTIONS") {
      return ok();
    }

    // console.log("2-on request", request.method, request.url);
    if (request.method !== "POST") {
      return cbor({ action: "ERROR", error: "Invalid request method" }, 400);
    }
    // console.log("3-on request", request.method, request.url);
    if (request.headers.get("content-type") !== "application/cbor") {
      return cbor({ action: "ERROR", error: "non parseable content-type" }, 400);
    }
    const action = decode(new Uint8Array(await request.arrayBuffer()));
    console.log("4-on request", request.method, request.url, action);

    switch (action.action) {
      case "GET": {
        const carArrayBuffer = await this.party.storage.get(action.key) as Uint8Array;
        // console.log(`GET ${action.key}`, carArrayBuffer.length);
        return cbor({ action: action.key, key: action.key, data: carArrayBuffer }, carArrayBuffer ? 200 : 404);
      }
      case "PUT":
        await this.party.storage.put(action.key, action.data);
        return cbor({ action: action.key, key: action.key, }, 201);
      case "DELETE":
        await this.party.storage.delete(action.key);
        return cbor({ action: action.key, key: action.key, }, 201);
      case "DESTROY": {
        const keys = [...(await this.party.storage.list({ prefix: '' })).keys()];
        for (const key of keys) {
          console.log(`destroy ${key}`);
          const ok = await this.party.storage.delete(key)
          if (!ok) {
            console.error(`error deleting during destroy ${key}`)
            // this.logger.Error().Str("key", key).Msg(`error deleting during destroy`)
          }
          return cbor({ action: action.key }, 201);
        }
      }
    }
    return cbor({ action: "ERROR", error: `invalid action ${action.action}` }, 400);
  }

  async onConnect(conn: Party.Connection) {
    console.log("on connect", conn.id);
    // for (const value of this.clockHead.values()) {
    //   conn.send(value);
    // }
  }

  onMessage(message: string, sender: Party.Connection) {
    console.log("on message", message, sender.id);
    // const { data, cid, parents } = JSON.parse(message) as PartyMessage;
    //
    // this.clockHead.set(cid, data);
    // for (const p of parents) {
    //   this.clockHead.delete(p);
    // }
    //
    // this.party.broadcast(data, [sender.id]);
    // // console.log('clockHead', sender.id, [...this.clockHead.keys()])
    // void this.party.storage.put("main", this.clockHead);
  }
}

FPPartyKitServer satisfies Party.Worker;
