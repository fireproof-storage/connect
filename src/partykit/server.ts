import type * as Party from "partykit/server";

interface CRDTEntry {
  data: string;
  cid: string;
  parents: string[];
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT,  DELETE",
};

const json = <T>(data: T, status = 200) => Response.json(data, { status, headers: CORS });

const ok = () => json({ ok: true });
export default class Server implements Party.Server {
  clockHead = new Map<string, CRDTEntry>();
  constructor(public party: Party.Party) {}

  async onStart() {
    // console.log("starting");
    return this.party.storage.get("main").then((head) => {
      if (head) {
        // console.log("loaded existing clock head", head);
        this.clockHead = head as Map<string, CRDTEntry>;
      }
    });
  }

  async onRequest(request: Party.Request) {
    // console.log("request!", request.method, request.url);
    // Check if it's a preflight request (OPTIONS) and handle it
    if (request.method === "OPTIONS") {
      return ok();
    }

    const url = new URL(request.url);
    // console.log("url", url.toString());
    const carId = url.searchParams.get("car");
    if (carId) {
      // console.log("carid", request.method, carId, request.url);
      if (request.method === "PUT") {
        const carArrayBuffer = await request.arrayBuffer();
        if (carArrayBuffer) {
          await this.party.storage.put(`car-${carId}`, carArrayBuffer);
          return json({ ok: true }, 201);
        }
        return json({ ok: false }, 400);
      } else if (request.method === "GET") {
        const carArrayBuffer = (await this.party.storage.get(`car-${carId}`)) as Uint8Array;
        if (carArrayBuffer) {
          return new Response(carArrayBuffer, { status: 200, headers: CORS });
        }
        return json({ ok: false }, 404);
      } else if (request.method === "DELETE") {
        const deleted = await this.party.storage.delete(`car-${carId}`);
        if (deleted) {
          return json({ ok: true }, 200);
        }
        return json({ ok: false, error: "CAR not found" }, 404);
      } else {
        return json({ error: "Method not allowed" }, 405);
      }
    } else {
      // console.log("meta", request.method, request.url);
      if (request.method === "GET") {
        const metaValues = Array.from(this.clockHead.values());
        // console.log("meta GOT", metaValues);
        return json(metaValues, 200);
      } else if (request.method === "DELETE") {
        await this.party.storage.deleteAll();
        this.clockHead.clear();
        await this.party.storage.put("main", this.clockHead);
        return json({ ok: true }, 200);
      } else if (request.method === "PUT") {
        const requestBody = await request.text();
        // console.log("meta PUT", requestBody);
        this.onMessage(requestBody, { id: "server" } as Party.Connection);
        return json({ ok: true }, 200);
      }
      return json({ error: "Invalid URL path" }, 400);
    }
  }

  async onConnect(conn: Party.Connection) {
    // console.log("connected", this.party.id, conn.id, [...this.clockHead.values()].length);
    for (const value of this.clockHead.values()) {
      conn.send(JSON.stringify(value));
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    // console.log("got", message);
    const entries = JSON.parse(message) as CRDTEntry[];
    const { cid, parents } = entries[0];

    this.clockHead.set(cid, entries[0]);
    for (const p of parents) {
      this.clockHead.delete(p);
    }

    this.party.broadcast(message, [sender.id]);
    void this.party.storage.put("main", this.clockHead);
  }
}

Server satisfies Party.Worker;
