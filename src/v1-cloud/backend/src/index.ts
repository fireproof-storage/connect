import { ExportedHandler, Request as CFRequest, Response as CFResponse } from "@cloudflare/workers-types";
import { routePartykitRequest, Server } from "partyserver";

import type { Connection } from "partyserver";

import type { Env } from "../worker-configuration.js";

import { AwsClient } from "aws4fetch";
import { BuildURI, URI } from "@adviser/cement";

export class Fireproof extends Server<Env> {
  clockHead = new Map<string, CRDTEntry>();

  async onStart() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.ctx.storage.get("main").then((head: any) => {
      if (head) {
        this.clockHead = head as Map<string, CRDTEntry>;
      }
    });
  }

  async onRequest(request: Request): Promise<Response> {
    // Check if it's a preflight request (OPTIONS) and handle it
    if (request.method === "OPTIONS") {
      return ok() as unknown as Response;
    }

    const url = URI.from(request.url);
    const carId = url.getParam("car");
    if (carId) {
      if (request.method === "PUT" || request.method === "GET") {
        // const carArrayBuffer = await request.arrayBuffer();
        // if (carArrayBuffer) {
        //   await this.ctx.storage.put(`car-${carId}`, carArrayBuffer);
        //   return json({ ok: true }, 201);
        // }
        const res = await prepareSignedUpload(request, this.env as Env);

        return res;
        /*
      } else if (request.method === "GET") {
        // const carArrayBuffer = (await this.ctx.storage.get(`car-${carId}`)) as Uint8Array;
        // if (carArrayBuffer) {
        //   return new Response(carArrayBuffer, { status: 200, headers: CORS });
        // }
        return json({ ok: false, error: "Bad route" }, 404);
        */
      } else if (request.method === "DELETE") {
        const deleted = await this.ctx.storage.delete(`car-${carId}`);
        if (deleted) {
          return json({ ok: true }, 200);
        }
        return json({ ok: false, error: "CAR not found" }, 404);
      } else {
        return json({ error: "Method not allowed" }, 405);
      }
    } else {
      if (request.method === "GET") {
        const metaValues = Array.from(this.clockHead.values());
        return json(metaValues, 200);
      } else if (request.method === "DELETE") {
        await this.ctx.storage.deleteAll();
        this.clockHead.clear();
        await this.ctx.storage.put("main", this.clockHead);
        return json({ ok: true }, 200);
      } else if (request.method === "PUT") {
        const requestBody = await request.text();
        this.onMessage({ id: "server" } as Connection, requestBody);
        return json({ ok: true }, 200);
      }
      return json({ error: "Invalid URL path" }, 400);
    }
  }

  async onConnect(conn: Connection) {
    for (const value of this.clockHead.values()) {
      conn.send(JSON.stringify(value));
    }
  }

  onMessage(sender: Connection, message: string) {
    const entries = JSON.parse(message) as CRDTEntry[];
    const { cid, parents } = entries[0];
    this.clockHead.set(cid, entries[0]);
    for (const p of parents) {
      this.clockHead.delete(p);
    }

    this.broadcast(message, [sender.id]);
    void this.ctx.storage.put("main", this.clockHead);
  }
}

async function prepareSignedUpload(request: Request, env: Env): Promise<Response> {
  // Parse URL
  const origUrl = URI.from(request.url);
  const carId = origUrl.getParam("car");

  const dbName = origUrl.pathname.split("/").pop();
  const expiresInSeconds = 60 * 60 * 24; // 1 day

  const url = BuildURI.from(env.STORAGE_URL)
    .appendRelative(dbName)
    .appendRelative(carId)
    .setParam("X-Amz-Expires", expiresInSeconds.toString());
  // `https://${env.BUCKET_NAME}.${env.ACCOUNT_ID}.r2.cloudflarestorage.com/${dbName}/${carId}`;

  const R2 = new AwsClient({
    accessKeyId: env.ACCESS_KEY_ID,
    secretAccessKey: env.SECRET_ACCESS_KEY,
    region: "us-east-1",
    service: "s3",
  });

  const signedUrl = await R2.sign(
    new Request(url.toString(), {
      method: request.method,
    }),
    {
      aws: {
        signQuery: true,
        // datetime: env.test?.amzDate,
        // datetime: env.TEST_DATE,
      },
    }
  );
  // .then((res) => res.url);

  // const signedUrl = await R2.sign(
  //   new Request(url.asURL(), {
  //     method: "PUT",
  //   }),
  //   {
  //     aws: { signQuery: true },
  //   }
  // );
  // eslint-disable-next-line no-console
  console.log("signedUrl", request.method, url.toString(), signedUrl.url);
  return json({
    ok: true,
    status: "upload",
    // allocated: size,
    // link,
    url: signedUrl.url,
  });
}

// X() {
//   const opUrl = env.storageUrl
//   .build()
//   // .protocol(vals.protocuol === "ws" ? "http:" : "https:")
//   .setParam("X-Amz-Expires", expiresInSeconds.toString())
//   .appendRelative(psm.tenant.tenant)
//   .appendRelative(psm.tenant.ledger)
//   .appendRelative(store)
//   .appendRelative(`${psm.params.key}${suffix}`)
//   .URI();
// const a4f = new AwsClient({
//   ...env.aws,
//   region: env.aws.region || "us-east-1",
//   service: "s3",
// });
// const signedUrl = await a4f
//   .sign(
//     new Request(opUrl.toString(), {
//       method: psm.params.method,
//     }),
//     {
//       aws: {
//         signQuery: true,
//         datetime: env.test?.amzDate,
//         // datetime: env.TEST_DATE,
//       },
//     }
//   )
//   .then((res) => res.url);

// }

// async function handlePresignedUpload(request: Request, env: Env): Promise<Response | null> {
//   const url = new URL(request.url);
//   const presign = url.pathname.match(/^\/presignUpload\/([^(\/|$)]+)\/?$/);
//   if (presign && presign[1]) {
//     console.log("trying to handle presigned")
//     const res = await prepareSignedUpload(request, env)
//     return res
//   }
//   return null
// }

export default {
  async fetch(request: CFRequest, env: Env): Promise<CFResponse> {
    const url = URI.from(request.url);
    if (url.pathname === "/health") {
      return json({ ok: true }) as unknown as CFResponse;
    }
    return (
      // (await handlePresignedUpload(request, env)) ||
      ((await routePartykitRequest(
        request as unknown as Request,
        env as unknown as Record<string, string>
      )) as unknown as CFResponse) || json({ ok: false, error: "Not Found" }, 404)
    );
  },
} satisfies ExportedHandler<Env>;

interface CRDTEntry {
  readonly data: string;
  readonly cid: string;
  readonly parents: string[];
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT,  DELETE",
  "Access-Control-Max-Age": "86400", // Cache pre-flight response for 24 hours
};

const json = <T>(data: T, status = 200) => Response.json(data, { status, headers: CORS });

const ok = () => json({ ok: true });
