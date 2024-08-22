import type * as Party from "partykit/server";

type PartyMessage = {
  data: string;
  cid: string;
  parents: string[];
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT,  DELETE",
};

type CRDTEntry = {
  data: string
  cid: string
  parents: string[]
}

const json = <T>(data: T, status = 200) => Response.json(data, { status, headers: CORS });

const ok = () => json({ ok: true });
export default class Server implements Party.Server {
  clockHead: Map<string, string> = new Map();
  constructor(public party: Party.Party) {}

  async onStart() {
    // return this.party.storage.get("main").then((head) => {
    //   if (head) {
    //     this.clockHead = head as Map<string, string>;
    //   }
    // });
  }

  async onRequest(request: Party.Request) {
    const url = new URL(request.url);
    let path = url.pathname
    const prefix = "/parties/fireproof"
    if (path.startsWith(prefix)) {
      path = path.slice(prefix.length)
    }
    console.log('on request', path)

    // Check if it's a preflight request (OPTIONS) and handle it
    if (request.method === "OPTIONS") {
      return ok();
    }

    const destroyPrefix = url.searchParams.get("destroyPrefix");
    if (request.method === 'PUT') {
      const buffer = await request.arrayBuffer();
      if (buffer) {
        await this.party.storage.put(path, buffer);
        return json({ ok: true }, 201);
      }
      return json({ ok: false, message: "missing body" }, 400);
    } else if ( request.method === 'DELETE' && destroyPrefix === "true") {
      console.log(`DESTROYING PREFIX - ${path}`)
      const keys = [...(await this.party.storage.list({prefix: path})).keys()];
      for (const key of keys) {
        const ok = await this.party.storage.delete(key)
        if (!ok) {
          console.log(`error deleting during destroy: ${key}`)
        }
        // for now ignoring errors in an attempt to keep going
      }
      return json({ ok: true }, 200);
    } else if ( request.method === 'DELETE') {
      const ok = await this.party.storage.delete(path, {allowUnconfirmed: false})
      if (ok) {
        return json({ ok: true }, 200); // probably should be 204 No Content
      }
      return json({ error: `error deleting ${path}` }, 400);
    } else if (request.method === 'GET') {
      const carArrayBuffer = (await this.party.storage.get(path)) as Uint8Array;
      if (carArrayBuffer) {
        return new Response(carArrayBuffer, { status: 200, headers: CORS });
      }
      return json({ ok: false }, 404);
    }

    return json({ error: "Invalid URL path" }, 400);
  }

  // async onRequest(request: Party.Request) {
  //   console.log("got a request");
  //   // Check if it's a preflight request (OPTIONS) and handle it
  //   if (request.method === "OPTIONS") {
  //     return ok();
  //   }
  //
  //   const url = new URL(request.url);
  //   const carId = url.searchParams.get("car");
  //   const metaDb = url.searchParams.get('meta')
  //
  //   if (carId) {
  //     if (request.method === "PUT") {
  //       const carArrayBuffer = await request.arrayBuffer();
  //       if (carArrayBuffer) {
  //         await this.party.storage.put(`car-${carId}`, carArrayBuffer);
  //         return json({ ok: true }, 201);
  //       }
  //       return json({ ok: false }, 400);
  //     } else if (request.method === "GET") {
  //       const carArrayBuffer = (await this.party.storage.get(`car-${carId}`)) as Uint8Array;
  //       if (carArrayBuffer) {
  //         return new Response(carArrayBuffer, { status: 200, headers: CORS });
  //       }
  //       return json({ ok: false }, 404);
  //     } else {
  //       return json({ error: "Method not allowed" }, 405);
  //     }
  //   } else if (metaDb) {
  //     if (request.method === 'PUT') {
  //       const { data, cid, parents } = (await request.json()) as CRDTEntry
  //       await this.party.storage.put(`${metaDb}/${cid}`, { data, parents });
  //       return json({ ok: true }, 201);
  //     } else if (request.method === 'GET') {
  //
  //
  //       const allParents = [] as string[]
  //       const items = await this.party.storage.list({prefix: `${metaDb}/`})
  //       const keys = Array.from(items.keys())
  //       const entries = (
  //           await Promise.all(
  //               keys.map(async key => {
  //                 const { data, parents } = items.get(key) as CRDTEntry
  //                 for (const p of parents) {
  //                   allParents.push(p.toString())
  //                   void this.party.storage.delete(`${metaDb}/${p}`)
  //                 }
  //                 return { cid: key.split('/')[1], data }
  //               })
  //           )
  //       ).filter(entry => (entry.data !== null && !allParents.includes(entry.cid)))
  //       return new Response(JSON.stringify(entries), { status: 200 })
  //
  //     }
  //   } else {
  //     return json({ error: "Invalid URL path" }, 400);
  //   }
  // }

  async onConnect(conn: Party.Connection) {
    // for (const value of this.clockHead.values()) {
    //   conn.send(value);
    // }
  }

  onMessage(message: string, sender: Party.Connection) {
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

Server satisfies Party.Worker;
