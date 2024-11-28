import { Result, URI, BuildURI } from "@adviser/cement";
import { AwsClient } from "aws4fetch";
import { Env } from "./backend/env";
import { ReqSignedUrl } from "./msg-types";

export async function calculatePreSignedUrl(req: ReqSignedUrl, env: Env, amzDate?: string): Promise<Result<URI>> {
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
    .appendRelative(req.params.tenantId)
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
          datetime: amzDate,
          // datetime: env.TEST_DATE,
        },
      }
    )
    .then((res) => res.url);
  return Result.Ok(URI.from(signedUrl));
}
