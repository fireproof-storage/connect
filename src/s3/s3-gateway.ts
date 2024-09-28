import { KeyedResolvOnce, Result, URI } from "@adviser/cement";
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from "@aws-sdk/client-s3";
import { AwsCredentialIdentity } from "@smithy/types";
import { bs, rt, ensureLogger, getStore, Logger, NotFoundError, SuperThis, ensureSuperLog } from "@fireproof/core";

export const S3_VERSION = "v0.1-s3";

export interface S3Opts {
  readonly region: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
}

function getFromUrlAndEnv(url: URI, paramKey: string, envKey: string, destKey: string) {
  const sparam = url.getParam(paramKey);
  if (sparam) {
    return {
      [destKey]: sparam,
    };
  }
  if (process.env[envKey]) {
    return {
      [destKey]: process.env[envKey],
    };
  }
  return {};
}

const s3ClientOnce = new KeyedResolvOnce<S3Client>();
export async function s3Client(sthis: SuperThis, url: URI) {
  const burl = url.build().setParam("key", "s3client").URI(); // dummy for getBucket
  const { bucket } = getBucket(sthis, burl);
  return s3ClientOnce.get(bucket).once(async (bucket) => {
    const logger = ensureLogger(sthis, "s3Client");
    const cred: Partial<AwsCredentialIdentity> = {
      ...getFromUrlAndEnv(url, "accessKey", "AWS_ACCESS_KEY_ID", "accessKeyId"),
      ...getFromUrlAndEnv(url, "secretKey", "AWS_SECRET_ACCESS_KEY", "secretAccessKey"),
    };
    const optionalCred: {
      credentials?: AwsCredentialIdentity;
    } = {};
    if (cred.accessKeyId && cred.secretAccessKey) {
      optionalCred.credentials = cred as AwsCredentialIdentity;
    }
    const cfg: S3ClientConfig = {
      ...getFromUrlAndEnv(url, "endpoint", "AWS_S3_ENDPOINT", "endpoint"),
      ...getFromUrlAndEnv(url, "region", "AWS_REGION", "region"),
      ...optionalCred,
    };
    logger.Debug().Any("cfg", cfg).Msg("create S3Client");
    const client = new S3Client(cfg);
    if (url.getParam("ensureBucket")) {
      const command = new HeadBucketCommand({
        Bucket: bucket,
      });
      const response = await client.send(command).catch((e) => {
        logger.Error().Err(e).Any("cfg", cfg).Str("bucket", bucket).Msg("head Bucket");
        return undefined;
      });
      if (!response) {
        logger.Debug().Any("cfg", cfg).Str("bucket", bucket).Msg("create Bucket");
        const command = new CreateBucketCommand({
          Bucket: bucket,
        });
        await client.send(command);
      } else {
        logger.Debug().Any("cfg", cfg).Str("bucket", bucket).Msg("bucket exists");
      }
    }
    return client;
  });
}

export interface S3File {
  readonly bucket: string;
  readonly prefix: string;
}

function getBucketFromString(s: string) {
  const splitPath = s.split("/");
  const ret = { bucket: splitPath[0], prefix: splitPath.slice(1).join("/") };
  return ret;
}

function getBucket(sthis: SuperThis, url: URI): S3File {
  const path = sthis.pathOps.join(rt.getPath(url, sthis), rt.getFileName(url, sthis));
  return getBucketFromString(path);
}

export class S3Gateway implements bs.Gateway {
  readonly sthis: SuperThis;
  readonly logger: Logger;
  constructor(sthis: SuperThis) {
    this.sthis = ensureSuperLog(sthis, "S3Gateway");
    this.logger = this.sthis.logger;
  }

  buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
    const url = baseUrl.build();
    url.setParam("key", key);
    return Promise.resolve(Result.Ok(url.URI()));
  }

  async destroy(iurl: URI): Promise<Result<void>> {
    const s3 = await s3Client(this.sthis, iurl);
    const url = iurl.build().setParam("key", "destroy").URI();
    const { bucket, prefix } = await getBucket(this.sthis, url);
    const s3Directory = this.sthis.pathOps.dirname(prefix);
    this.logger.Debug().Url(url).Str("bucket", bucket).Str("key", s3Directory).Msg("destroyDir");
    let next: { ContinuationToken?: string } = {};
    do {
      const objs = await s3.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: s3Directory,
          ...next,
        })
      );
      if (objs.Contents) {
        this.logger
          .Debug()
          .Str("bucket", bucket)
          .Str("prefix", s3Directory)
          .Any(
            "objs",
            objs.Contents.map((i) => i.Key)
          )
          .Msg("destroyDir");
        for (const obj of objs.Contents) {
          await s3.send(
            new DeleteObjectCommand({
              Key: obj.Key,
              Bucket: bucket,
            })
          );
        }
      }
      next = { ContinuationToken: objs.NextContinuationToken };
    } while (next.ContinuationToken);
    return Result.Ok(undefined);
  }

  async start(url: URI): Promise<Result<URI>> {
    await this.sthis.start();
    this.logger.Debug().Str("url", url.toString()).Msg("start");
    const ret = url.build().defParam("version", S3_VERSION).URI();
    return Result.Ok(ret);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async close(url: URI): Promise<bs.VoidResult> {
    return Result.Ok(undefined);
  }

  async put(url: URI, body: Uint8Array): Promise<bs.VoidResult> {
    const { store } = getStore(url, this.sthis, (...args) => args.join("/"));
    const { bucket, prefix } = getBucket(this.sthis, url);
    this.logger.Debug().Url(url).Str("bucket", bucket).Str("key", prefix).Msg("put");
    const putObjectCommand = new PutObjectCommand({
      Key: prefix,
      Bucket: bucket,
      ContentType: `fireproof/${store}`,
      Body: body,
    });
    try {
      await (await s3Client(this.sthis, url)).send(putObjectCommand);
    } catch (e) {
      return Result.Err(e as Error);
    }
    return Result.Ok(undefined);
  }

  async get(url: URI): Promise<bs.GetResult> {
    const { bucket, prefix } = getBucket(this.sthis, url);
    this.logger.Debug().Url(url).Str("bucket", bucket).Str("key", prefix).Msg("get");
    const getObjectCommand = new GetObjectCommand({
      Key: prefix,
      Bucket: bucket,
    });
    try {
      const ret = await (await s3Client(this.sthis, url)).send(getObjectCommand);
      if (!ret.Body) {
        return Result.Err(new NotFoundError(`no body: ${prefix}/${bucket}`));
      }
      return Result.Ok(await ret.Body.transformToByteArray());
    } catch (e) {
      if ((e as NoSuchKey).name === "NoSuchKey") {
        return Result.Err(new NotFoundError(`file not found: ${url}:${JSON.stringify(getObjectCommand.input)}`));
      }
      return Result.Err(e as Error);
    }
  }
  async delete(url: URI): Promise<bs.VoidResult> {
    const { bucket, prefix } = getBucket(this.sthis, url);
    this.logger.Debug().Url(url).Str("bucket", bucket).Str("key", prefix).Msg("delete");
    await (
      await s3Client(this.sthis, url)
    ).send(
      new DeleteObjectCommand({
        Key: prefix,
        Bucket: bucket,
      })
    );
    return Result.Ok(undefined);
  }
}

export class S3TestStore implements bs.TestGateway {
  readonly logger: Logger;
  readonly sthis: SuperThis;
  readonly gateway: bs.Gateway;
  constructor(sthis: SuperThis, gw: bs.Gateway) {
    this.sthis = ensureSuperLog(sthis, "S3TestStore");
    this.logger = this.sthis.logger;
    this.gateway = gw;
  }
  async get(iurl: URI, key: string): Promise<Uint8Array> {
    const url = iurl.build().setParam("key", key).URI();
    const dbFile = this.sthis.pathOps.join(rt.getPath(url, this.sthis), rt.getFileName(url, this.sthis));
    this.logger.Debug().Url(url).Str("dbFile", dbFile).Msg("get");
    const buffer = await this.gateway.get(url);
    this.logger.Debug().Url(url).Str("dbFile", dbFile).Len(buffer).Msg("got");
    return buffer.Ok();
  }
}

export interface versionUnregister {
  (): void;
  readonly version: string;
}

export function registerS3StoreProtocol(protocol = "s3:", overrideBaseURL?: string): versionUnregister {
  URI.protocolHasHostpart(protocol);
  const unreg: versionUnregister = (() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _f: any = bs.registerStoreProtocol({
      protocol,
      overrideBaseURL,
      gateway: async (sthis) => {
        return new S3Gateway(sthis);
      },
      test: async (sthis: SuperThis) => {
        const gateway = new S3Gateway(sthis);
        return new S3TestStore(sthis, gateway);
      },
    });
    _f.version = S3_VERSION;
    return _f;
  })();
  return unreg;
}
