import { Result, URI } from "@adviser/cement";
import { AwsClient } from "aws4fetch";
import { Connection, SignedUrlParam } from "./msg-types.js";

export interface PreSignedMsg {
  readonly params: SignedUrlParam;
  readonly tid: string;
  readonly conn?: Connection;
}

export interface PreSignedConnMsg {
  readonly params: SignedUrlParam;
  readonly tid: string;
  readonly conn: Connection;
}

export interface PreSignedEnv {
  readonly storageUrl: URI;
  readonly aws: {
    readonly accessKeyId: string;
    readonly secretAccessKey: string;
    readonly region?: string;
  };
  readonly test?: {
    readonly amzDate?: string;
  };
}

export async function calculatePreSignedUrl(ipsm: PreSignedMsg, env: PreSignedEnv): Promise<Result<URI>> {
  if (!ipsm.conn) {
    return Result.Err(new Error("Connection is not supported"));
  }
  const psm = ipsm as PreSignedConnMsg;

  // verify if you are not overriding
  let store: string = psm.params.store;
  if (psm.params.index?.length) {
    store = `${store}-${psm.params.index}`;
  }
  const expiresInSeconds = psm.params.expires || 60 * 60;

  const suffix = "";
  // switch (psm.params.store) {
  //   case "wal":
  //   case "meta":
  //     suffix = ".json";
  //     break;
  //   default:
  //     break;
  // }

  const opUrl = env.storageUrl
    .build()
    // .protocol(vals.protocuol === "ws" ? "http:" : "https:")
    .setParam("X-Amz-Expires", expiresInSeconds.toString())
    .setParam("tid", psm.tid)
    .appendRelative(psm.conn.key.tenant)
    .appendRelative(psm.conn.key.ledger)
    .appendRelative(store)
    .appendRelative(`${psm.params.key}${suffix}`)
    .URI();
  const a4f = new AwsClient({
    ...env.aws,
    region: env.aws.region || "us-east-1",
    service: "s3",
  });
  const signedUrl = await a4f
    .sign(
      new Request(opUrl.toString(), {
        method: psm.params.method,
      }),
      {
        aws: {
          signQuery: true,
          datetime: env.test?.amzDate,
          // datetime: env.TEST_DATE,
        },
      }
    )
    .then((res) => res.url);
  return Result.Ok(URI.from(signedUrl));
}