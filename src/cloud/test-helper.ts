import { Future, URI } from "@adviser/cement";
import { SuperThis } from "@fireproof/core";
import { $, fs } from "zx";
import { HttpConnection } from "./http-connection.js";
import { MsgerParams, ReqOpen, Gestalt, defaultGestalt } from "./msg-types.js";
import { defaultMsgParams, applyStart, Msger, MsgerParamsWithEnDe } from "./msger.js";
import { WSConnection } from "./ws-connection.js";
import * as toml from "smol-toml";
import { Env } from "./backend/env.js";
import { HonoServer } from "./hono-server.js";
import { NodeHonoFactory } from "./node-hono-server.js";
import { CFHonoFactory } from "./backend/cf-hono-server.js";
import { R } from "vitest/dist/chunks/environment.LoooBwUu.js";

export function httpStyle(sthis: SuperThis, port: number, msgP: MsgerParamsWithEnDe, qOpen: ReqOpen, my: Gestalt) {
  const remote = defaultGestalt(defaultMsgParams(sthis, { hasPersistent: true, protocolCapabilities: ["reqRes"] }), {
    id: "HTTP-server",
  });
  const exGt = { my, remote };
  return {
    name: "HTTP",
    remoteGestalt: remote,
    cInstance: HttpConnection,
    ok: {
      url: () => URI.from(`http://127.0.0.1:${port}/fp`),
      open: () =>
        applyStart(
          Msger.openHttp(
            sthis,
            qOpen,
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
      open: () =>
        Msger.openHttp(
          sthis,
          qOpen,
          [URI.from(`http://localhost:${port - 1}/fp`)],
          {
            ...msgP,
            // protocol: "http",
            timeout: 1000,
          },
          exGt
        ),
    },
    timeout: {
      url: () => URI.from(`http://4.7.1.1:${port}/fp`),
      open: () =>
        Msger.openHttp(
          sthis,
          qOpen,
          [URI.from(`http://4.7.1.1:${port}/fp`)],
          {
            ...msgP,
            // protocol: "http",
            timeout: 500,
          },
          exGt
        ),
    },
  };
}

export function wsStyle(sthis: SuperThis, port: number, msgP: MsgerParamsWithEnDe, qOpen: ReqOpen, my: Gestalt) {
  const remote = defaultGestalt(defaultMsgParams(sthis, { hasPersistent: true, protocolCapabilities: ["stream"] }), {
    id: "WS-server",
  });
  const exGt = { my, remote };
  return {
    name: "WS",
    remoteGestalt: remote,
    cInstance: WSConnection,
    ok: {
      url: () => URI.from(`http://127.0.0.1:${port}/ws`),
      open: () =>
        applyStart(
          Msger.openWS(
            sthis,
            qOpen,
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
          qOpen,
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
          qOpen,
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

export async function resolveToml() {
  const tomlFile = "src/cloud/backend/wrangler.toml";
  const tomeStr = await fs.readFile(tomlFile, "utf-8");
  const wranglerFile = toml.parse(tomeStr) as unknown as {
    env: { "test-reqRes": { vars: Env } };
  };
  return {
    tomlFile,
    env: wranglerFile.env["test-reqRes"].vars,
  };
}

export function NodeHonoServerFactory() {
  return {
    name: "NodeHonoServer",
    factory: async (sthis: SuperThis, msgP: MsgerParams, remoteGestalt: Gestalt, _port: number) => {
      const { env } = await resolveToml();
      sthis.env.sets(env as unknown as Record<string, string>);
      return new HonoServer(new NodeHonoFactory(sthis, { msgP, gs: remoteGestalt }))
    },
  };
}
export function CFHonoServerFactory() {
  return {
    name: "CFHonoServer",
    factory: async (_sthis: SuperThis, _msgP: MsgerParams, remoteGestalt: Gestalt, port: number) => {
      if (process.env.FP_WRANGLER_PORT) {
        return new HonoServer(new CFHonoFactory());
      }
      const { tomlFile } = await resolveToml();
      $.verbose = !!process.env.FP_DEBUG;
      const runningWrangler = $`
                wrangler dev -c ${tomlFile} --port ${port} --env test-${remoteGestalt.protocolCapabilities[0]} --no-show-interactive-dev-session &
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
        if (chunk.includes("Ready on http")) {
          waitReady.resolve(true);
        }
      });
      runningWrangler.stderr.on("data", (chunk) => {
        // eslint-disable-next-line no-console
        console.error("!!", chunk.toString());
      });
      await waitReady.asPromise();
      return new HonoServer(new CFHonoFactory(() => {
          if (pid) process.kill(pid);
      }))
    },
  };
}
