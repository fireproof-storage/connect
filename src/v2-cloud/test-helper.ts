import { BuildURI, CoerceURI, Future, Result, UnPromisify, URI } from "@adviser/cement";
import { ensureSuperThis, SuperThis } from "@fireproof/core";
import { $, fs } from "zx";
import { HttpConnection } from "./http-connection.js";
import {
  MsgerParams,
  Gestalt,
  defaultGestalt,
  buildReqGestalt,
  MsgIsResGestalt,
  MsgIsError,
  MsgBase,
  FPJWKCloudAuthType,
} from "./msg-types.js";
import {
  defaultMsgParams,
  applyStart,
  Msger,
  MsgerParamsWithEnDe,
  MsgRawConnection,
  authTypeFromUri,
} from "./msger.js";
import { WSConnection } from "./ws-connection.js";
import * as toml from "smol-toml";
import { Env } from "./backend/env.js";
import { HonoServer } from "./hono-server.js";
import { NodeHonoFactory } from "./node-hono-server.js";
import { CFHonoFactory } from "./backend/cf-hono-server.js";
import { BetterSQLDatabase } from "./meta-merger/bettersql-abstract-sql.js";
import { env2jwk, envKeyDefaults, KeysResult, SessionTokenService, TokenForParam } from "../sts-service/sts-service.js";
import { GenerateKeyPairOptions } from "jose/key/generate/keypair";
import { portForLocalTest, portRandom } from "./test-utils.js";

export interface MockJWK {
  keys: KeysResult;
  authType: FPJWKCloudAuthType;
  applyAuthToURI: (uri: CoerceURI) => URI;
}
export async function mockJWK(claim: Partial<TokenForParam> = {}, sthis = ensureSuperThis()): Promise<MockJWK> {
  // that could be solved better now with globalSetup.v2-cloud.ts
  const publicJWK = await env2jwk(
    "zeWndr5LEoaySgKSo2aZniYqaZvsKKu1RhfpL2R3hjarNgfXfN7CvR1cAiT74TMB9MQtMvh4acC759Xf8rTwCgxXvGHCBjHngThNtYpK2CoysiAMRJFUi9irMY9H7WApJkfxB15n8ss8iaEojcGB7voQVyk2T6aFPRnNdkoB6v5zk",
    "ES256",
    sthis
  );
  const privateJWK = await env2jwk(
    "z33KxHvFS3jLz72v9DeyGBqo79qkbpv5KNP43VKUKSh1fcLb629pFTFyiJEosZ9jCrr8r9TE44KXCPZ2z1FeWGsV1N5gKjGWmZvubUwNHPynxNjCYy4GeYoQ8ukBiKjcPG22pniWCnRMwZvueUBkVk6NdtNY1uwyPk2HAGTsfrw5CBJvTcYsaFeG11SKZ9Q55Xk1W2p4gtZQHzkYHdfQQhgZ73Ttq7zmFoms73kh7MsudYzErx",
    "ES256",
    sthis
  );

  const keys = await SessionTokenService.generateKeyPair(
    "ES256",
    {
      extractable: true,
    },
    (_alg: string, _options: GenerateKeyPairOptions) => {
      return Promise.resolve({
        privateKey: privateJWK,
        publicKey: publicJWK,
      });
    }
  );

  const sts = await SessionTokenService.create({
    token: keys.strings.privateKey,
  });
  const jwk = await sts.tokenFor({
    userId: "hello",
    tenants: [],
    ledgers: [],
    ...claim,
  });

  return {
    keys,
    authType: {
      type: "fp-cloud-jwk",
      params: {
        jwk,
      },
    },
    applyAuthToURI: (uri: CoerceURI) => BuildURI.from(uri).setParam("authJWK", jwk).URI(),
  };
}

export function httpStyle(
  sthis: SuperThis,
  applyAuthToURI: (uri: CoerceURI) => URI,
  port: number,
  msgP: MsgerParamsWithEnDe,
  my: Gestalt
) {
  const remote = defaultGestalt(defaultMsgParams(sthis, { hasPersistent: true, protocolCapabilities: ["reqRes"] }), {
    id: "HTTP-server",
  });
  const exGt = { my, remote };
  return {
    name: "HTTP",
    remoteGestalt: remote,
    cInstance: HttpConnection,
    ok: {
      url: (path = "fp") =>
        BuildURI.from(`http://127.0.0.1:${port}`)
          .pathname(path)
          .setParam("capabilities", remote.protocolCapabilities.join(","))
          .URI(),
      open: () =>
        applyStart(
          Msger.openHttp(
            sthis,
            [
              BuildURI.from(`http://127.0.0.1:${port}/fp`)
                .setParam("capabilities", remote.protocolCapabilities.join(","))
                .URI(),
            ],
            {
              ...msgP,
              // protocol: "http",
              timeout: 1000,
            },
            exGt
          )
        ),
    },
    connRefused: {
      url: () => URI.from(`http://127.0.0.1:${port - 1}/fp`),
      open: async (): Promise<Result<MsgRawConnection<MsgBase>>> => {
        const ret = await Msger.openHttp(
          sthis,
          [URI.from(`http://localhost:${port - 1}/fp`)],
          {
            ...msgP,
            // protocol: "http",
            timeout: 1000,
          },
          exGt
        );
        if (ret.isErr()) {
          return ret;
        }

        const rAuth = await authTypeFromUri(sthis.logger, applyAuthToURI(`http://localhost:${port - 1}/fp`));
        // should fail
        const res = await ret.Ok().request(buildReqGestalt(sthis, rAuth.Ok(), my), { waitFor: MsgIsResGestalt });
        if (MsgIsError(res)) {
          return Result.Err(res.message);
        }
        return ret;
      },
    },
    timeout: {
      url: () => URI.from(`http://4.7.1.1:${port}/fp`),
      open: async (): Promise<Result<MsgRawConnection<MsgBase>>> => {
        const ret = await Msger.openHttp(
          sthis,
          [URI.from(`http://4.7.1.1:${port}/fp`)],
          {
            ...msgP,
            // protocol: "http",
            timeout: 500,
          },
          exGt
        );
        // should fail
        const rAuth = await authTypeFromUri(sthis.logger, applyAuthToURI(`http://4.7.1.1:${port}/fp`));
        const res = await ret.Ok().request(buildReqGestalt(sthis, rAuth.Ok(), my), { waitFor: MsgIsResGestalt });
        if (MsgIsError(res)) {
          return Result.Err(res.message);
        }
        return ret;
      },
    },
  };
}

export function wsStyle(
  sthis: SuperThis,
  applyAuthToURI: (uri: CoerceURI) => URI,
  port: number,
  msgP: MsgerParamsWithEnDe,
  my: Gestalt
) {
  const remote = defaultGestalt(defaultMsgParams(sthis, { hasPersistent: true, protocolCapabilities: ["stream"] }), {
    id: "WS-server",
  });
  const exGt = { my, remote };
  return {
    name: "WS",
    remoteGestalt: remote,
    cInstance: WSConnection,
    ok: {
      url: (path = "ws") =>
        BuildURI.from(`http://127.0.0.1:${port}`)
          .pathname(path)
          .setParam("capabilities", remote.protocolCapabilities.join(","))
          .URI(),
      open: () =>
        applyStart(
          Msger.openWS(
            sthis,
            applyAuthToURI(
              BuildURI.from(`http://127.0.0.1:${port}/ws`)
                .setParam("capabilities", remote.protocolCapabilities.join(","))
                .URI()
            ),
            {
              ...msgP,
              // protocol: "ws",
              timeout: 1000,
            },
            exGt
          )
        ),
    },
    connRefused: {
      url: () => URI.from(`http://127.0.0.1:${port - 1}/ws`),
      open: () =>
        Msger.openWS(
          sthis,
          applyAuthToURI(URI.from(`http://localhost:${port - 1}/ws`)),
          {
            ...msgP,
            // protocol: "ws",
            timeout: 1000,
          },
          exGt
        ),
    },
    timeout: {
      url: () => URI.from(`http://4.7.1.1:${port - 1}/ws`),
      open: () =>
        Msger.openWS(
          sthis,
          applyAuthToURI(URI.from(`http://4.7.1.1:${port - 1}/ws`)),
          {
            ...msgP,
            // protocol: "ws",
            timeout: 500,
          },
          exGt
        ),
    },
  };
}

export async function resolveToml() {
  const tomlFile = "src/v2-cloud/backend/wrangler.toml";
  const tomeStr = await fs.readFile(tomlFile, "utf-8");
  const wranglerFile = toml.parse(tomeStr) as unknown as {
    env: Record<string, { vars: Env }>;
  };
  return {
    tomlFile,
    env: wranglerFile.env[`test`].vars,
  };
}

export function NodeHonoServerFactory() {
  return {
    name: "NodeHonoServer",
    port: portRandom(),
    factory: async (sthis: SuperThis, msgP: MsgerParams, remoteGestalt: Gestalt, _port: number, pubEnvJWK: string) => {
      const { env } = await resolveToml();
      sthis.env.set(envKeyDefaults.PUBLIC, pubEnvJWK);
      sthis.env.sets(env as unknown as Record<string, string>);
      const nhf = new NodeHonoFactory(sthis, {
        msgP,
        gs: remoteGestalt,
        sql: new BetterSQLDatabase("./dist/node-meta.sqlite"),
      });
      return new HonoServer(nhf);
    },
  };
}

export type BackendParams = UnPromisify<ReturnType<typeof setupBackend>>;

export async function setupBackend(
  sthis: SuperThis,
  // backend: "D1" | "DO",
  // key: string,
  port = portRandom()
): Promise<{ port: number; pid: number; envName: string }> {
  const envName = `test`;
  if (process.env.FP_WRANGLER_PORT) {
    return Promise.resolve({ port: +process.env.FP_WRANGLER_PORT, pid: 0, envName });
  }
  const { tomlFile } = await resolveToml();
  $.verbose = !!process.env.FP_DEBUG;
  const auth = await mockJWK({}, sthis);
  await writeEnvFile(sthis, tomlFile, envName, auth.keys.strings.publicKey);
  // .dev.vars.<environment-name>
  const runningWrangler = $`
            wrangler dev -c ${tomlFile} --port ${port} --env ${envName} --no-show-interactive-dev-session --no-live-reload &
            waitPid=$!
            echo "PID:$waitPid"
            wait $waitPid`;
  const waitReady = new Future();
  let pid: number | undefined;
  runningWrangler.stdout.on("data", (chunk) => {
    // console.log(">>", chunk.toString())
    const mightPid = chunk.toString().match(/PID:(\d+)/)?.[1];
    if (mightPid) {
      pid = +mightPid;
    }
    if (chunk.includes("Starting local serv")) {
      waitReady.resolve(true);
    }
  });
  runningWrangler.stderr.on("data", (chunk) => {
    // eslint-disable-next-line no-console
    console.error("!!", chunk.toString());
  });
  await waitReady.asPromise();
  return { port, pid: pid || 0, envName };
}

async function writeEnvFile(sthis: SuperThis, tomlFile: string, env: string, envJWK: string) {
  const fname = sthis.pathOps.join(sthis.pathOps.dirname(tomlFile), `.dev.vars.${env}`);
  // console.log("Writing to", fname);
  await fs.writeFile(fname, `${envKeyDefaults.PUBLIC}=${envJWK}\n`);
}

export function CFHonoServerFactory(sthis: SuperThis) {
  return {
    name: `CFHonoServer`,
    port: portForLocalTest(sthis),
    factory: async (
      _sthis: SuperThis,
      _msgP: MsgerParams,
      _remoteGestalt: Gestalt,
      _port: number,
      _pubEnvJWK: string
    ) => {
      return new HonoServer(new CFHonoFactory());
    },
  };
}

export function applyBackend(backend: "DO" | "D1", fn: (uri: CoerceURI) => URI): (uri: CoerceURI) => URI {
  return (uri) => {
    return fn(BuildURI.from(uri).setParam("backendMode", backend).URI());
  };
}

// export async function mockGetAuthFactory(pk: string, factoryTp: TokenForParam, sthis: SuperThis): Promise<AuthFactory> {
//   const sts = await SessionTokenService.create(
//     {
//       token: pk,
//     },
//     sthis
//   );

//   return async (tp: Partial<TokenForParam> = {}) => {
//     const token = await sts.tokenFor({
//       ...factoryTp,
//       ...tp,
//       userId: tp.userId || factoryTp.userId,
//       tenants: tp.tenants || factoryTp.tenants,
//       ledgers: tp.ledgers || factoryTp.ledgers,
//     });
//     return {
//       type: "fp-cloud-jwk",
//       params: {
//         jwk: token,
//       },
//     };
//   };
// }
