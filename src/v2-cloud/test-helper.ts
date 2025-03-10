import { Future, Result, URI } from "@adviser/cement";
import { SuperThis } from "@fireproof/core";
import { $, fs, sleep } from "zx";
import { HttpConnection } from "./http-connection.js";
import {
  MsgerParams,
  Gestalt,
  defaultGestalt,
  buildReqGestalt,
  MsgIsResGestalt,
  MsgIsError,
  MsgBase,
  AuthFactory,
} from "./msg-types.js";
import { defaultMsgParams, applyStart, Msger, MsgerParamsWithEnDe, MsgRawConnection } from "./msger.js";
import { WSConnection } from "./ws-connection.js";
import * as toml from "smol-toml";
import { Env } from "./backend/env.js";
import { HonoServer } from "./hono-server.js";
import { NodeHonoFactory } from "./node-hono-server.js";
import { CFHonoFactory } from "./backend/cf-hono-server.js";
import { BetterSQLDatabase } from "./meta-merger/bettersql-abstract-sql.js";
import { envKeyDefaults, SessionTokenService, TokenForParam } from "../sts-service/sts-service.js";

export function httpStyle(
  sthis: SuperThis,
  authFactory: AuthFactory,
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
    authFactory,
    cInstance: HttpConnection,
    ok: {
      url: () => URI.from(`http://127.0.0.1:${port}/fp`),
      open: () =>
        applyStart(
          Msger.openHttp(
            sthis,
            authFactory,
            [URI.from(`http://localhost:${port}/fp`)],
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
          authFactory,
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
        // should fail
        const res = await ret
          .Ok()
          .request(buildReqGestalt(sthis, await authFactory(), my), { waitFor: MsgIsResGestalt });
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
          authFactory,
          [URI.from(`http://4.7.1.1:${port}/fp`)],
          {
            ...msgP,
            // protocol: "http",
            timeout: 500,
          },
          exGt
        );
        // should fail
        const res = await ret
          .Ok()
          .request(buildReqGestalt(sthis, await authFactory(), my), { waitFor: MsgIsResGestalt });
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
  authFactory: AuthFactory,
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
    authFactory,
    cInstance: WSConnection,
    ok: {
      url: () => URI.from(`http://127.0.0.1:${port}/ws`),
      open: () =>
        applyStart(
          Msger.openWS(
            sthis,
            authFactory,
            URI.from(`http://localhost:${port}/ws`),
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
          authFactory,
          URI.from(`http://localhost:${port - 1}/ws`),
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
          authFactory,
          URI.from(`http://4.7.1.1:${port - 1}/ws`),
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

export async function resolveToml(backend: "D1" | "DO") {
  const tomlFile = "src/v2-cloud/backend/wrangler.toml";
  const tomeStr = await fs.readFile(tomlFile, "utf-8");
  const wranglerFile = toml.parse(tomeStr) as unknown as {
    env: Record<string, { vars: Env }>;
  };
  return {
    tomlFile,
    env: wranglerFile.env[`test-reqRes-${backend}`].vars,
  };
}

export function NodeHonoServerFactory() {
  return {
    name: "NodeHonoServer",
    factory: async (sthis: SuperThis, msgP: MsgerParams, remoteGestalt: Gestalt, _port: number, pubEnvJWK: string) => {
      const { env } = await resolveToml("D1");
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

async function writeEnvFile(sthis: SuperThis, tomlFile: string, env: string, envJWK: string) {
  fs.writeFile(
    sthis.pathOps.join(sthis.pathOps.dirname(tomlFile), `dev.vars.${env}`),
    `${envKeyDefaults.PUBLIC}=${envJWK}\n`
  );
}

export function CFHonoServerFactory(backend: "D1" | "DO") {
  return {
    name: `CFHonoServer(${backend})`,
    factory: async (sthis: SuperThis, _msgP: MsgerParams, remoteGestalt: Gestalt, port: number, pubEnvJWK: string) => {
      if (process.env.FP_WRANGLER_PORT) {
        return new HonoServer(new CFHonoFactory());
      }
      const { tomlFile } = await resolveToml(backend);
      $.verbose = !!process.env.FP_DEBUG;
      const envName = `test-${remoteGestalt.protocolCapabilities[0]}-${backend}`;
      await writeEnvFile(sthis, tomlFile, envName, pubEnvJWK);
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
      await sleep(300);
      return new HonoServer(
        new CFHonoFactory(() => {
          if (pid) process.kill(pid);
        })
      );
    },
  };
}

export async function mockGetAuthFactory(pk: string, factoryTp: TokenForParam, sthis: SuperThis): Promise<AuthFactory> {
  const sts = await SessionTokenService.create(
    {
      token: pk,
    },
    sthis
  );

  return async (tp: Partial<TokenForParam> = {}) => {
    const token = await sts.tokenFor({
      ...factoryTp,
      ...tp,
      userId: tp.userId || factoryTp.userId,
      tenants: tp.tenants || factoryTp.tenants,
      ledgers: tp.ledgers || factoryTp.ledgers,
    });
    return {
      type: "fp-cloud-jwk",
      params: {
        jwk: token,
      },
    };
  };
}
