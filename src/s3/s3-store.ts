import { bs, SuperThis } from "@fireproof/core";
import { S3_VERSION, S3Gateway, S3TestStore } from "./s3-gateway";

export interface versionUnregister {
  (): void;
  readonly version: string;
}

export function registerS3StoreProtocol(protocol = "s3:", overrideBaseURL?: string): versionUnregister {
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
