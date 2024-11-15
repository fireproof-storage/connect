import type { Env } from "./env";
import { AwsClient } from "aws4fetch";
import { BuildURI, exception2Result, LoggerImpl, Result, URI } from "@adviser/cement";
import { buildErrorMsg, buildResSignedUrl, MsgBase, MsgIsError, ReqSignedUrl } from "../msg-types";
import { Hono } from "hono";
import { NotFoundError } from "@fireproof/core";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import { a } from "@adviser/cement/txt-en-decoder-CZYJUju2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS,PUT,DELETE",
  "Access-Control-Max-Age": "86400", // Cache pre-flight response for 24 hours
};

function json<T>(data: T, status = 200) {
  return Response.json(data, { status, headers: CORS });
}

// function ok() {
//   return json({ ok: true });
// }

// class FireProofWSockConnection extends DurableObject {
// }




const app = new Hono<{ Bindings: Env }>();

function getLogger(env: Env) {
  return (
    new LoggerImpl()
      .With()
      .Module("Fireproof")
      .SetDebug(env.FP_DEBUG)
      // .SetFormatter((env.FP_FORMAT || "json") as LogFormatter)
      .SetExposeStack(!!env.FP_STACK || false)
      .Logger()
  );
}

async function doMsg(decodeFn: () => Promise<unknown>, env: Env): Promise<MsgBase> {
  const rReqMsg = await exception2Result(async () => (await decodeFn()) as MsgBase);
  const logger = getLogger(env);
  if (rReqMsg.isErr()) {
    return buildErrorMsg(logger, { tid: "internal" } as MsgBase, rReqMsg.Err());
  }
  const reqMsg = rReqMsg.Ok();
  switch (reqMsg.type) {
    case "reqSignedUrl": {
      const rSignedUrl = await calculatePreSignedUrl(reqMsg as ReqSignedUrl, env);
      if (rSignedUrl.isErr()) {
        return buildErrorMsg(logger, reqMsg as ReqSignedUrl, rSignedUrl.Err());
      }
      const resSignedUrl = buildResSignedUrl(reqMsg as ReqSignedUrl, rSignedUrl.Ok().toString());
      return resSignedUrl;
    }
  }
  return buildErrorMsg(logger, { tid: "internal" } as ReqSignedUrl, new Error(`unknown msg.type=${reqMsg.type}`));
}

app.put("/get-signed-url", async (c) => {
  c.env = c.env || {};
  const rRes = await doMsg(() => c.req.json(), c.env);
  return json(rRes, MsgIsError(rRes) ? 422 : 200);
});

app.get("/ws", async (c) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return new Response('Durable Object expected Upgrade: websocket', { status: 426 });
  }
  const id = c.env.FP_META_GROUPS.idFromName("foo");
  const stub = c.env.FP_META_GROUPS.get(id);

  return stub.fetch(c.req.raw) as unknown as Promise<Response>;


  // upgradeWebSocket((c) => {
  //   return {
  //     onMessage(event, ws) {
  //       // console.log('Received message', event.data.toString())
  //       doMsg(() => JSON.parse(event.data.toString()), c.env).then((msg) => {
  //         // console.log('Sending', msg)
  //         ws.send(JSON.stringify(msg));
  //       });
  //     },
  //     onClose: () => {
  //       getLogger(c.env).Debug().Msg("Connection closed");
  //     },
  //   };
  // })
});

app.notFound(async (c) => {
  c.env = c.env || {};
  const logger = getLogger(c.env);
  return json(
    buildErrorMsg(
      logger,
      {
        tid: "internal",
      } as ReqSignedUrl,
      new NotFoundError(`Notfound:${c.req.path}`)
    ),
    404
  );
});
export default app;

export async function calculatePreSignedUrl(req: ReqSignedUrl, env: Env): Promise<Result<URI>> {
  let store: string = req.params.store;
  if (req.params.index?.length) {
    store = `${store}-${req.params.index}`;
  }
  const expiresInSeconds = req.params.expires || 60 * 60;

  let suffix = "";
  switch (req.params.store) {
    case "wal":
    case "meta":
      suffix = ".json";
      break;
    default:
      break;
  }

  const opUrl = BuildURI.from(env.STORAGE_URL)
    // .protocol(vals.protocol === "ws" ? "http:" : "https:")
    .setParam("X-Amz-Expires", expiresInSeconds.toString())
    .setParam("tid", req.tid)
    .appendRelative(req.params.tendantId)
    .appendRelative(req.params.name)
    .appendRelative(store)
    .appendRelative(`${req.params.key}${suffix}`)
    .URI();
  const a4f = new AwsClient({
    accessKeyId: env.ACCESS_KEY_ID,
    secretAccessKey: env.SECRET_ACCESS_KEY,
    region: env.REGION || "us-east-1",
    service: "s3",
  });
  const signedUrl = await a4f
    .sign(
      new Request(opUrl.toString(), {
        method: req.params.method,
      }),
      {
        aws: {
          signQuery: true,
          // datetime: env.TEST_DATE,
        },
      }
    )
    .then((res) => res.url);
  return Result.Ok(URI.from(signedUrl));
}
