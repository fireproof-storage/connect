import {Result, URI} from "@adviser/cement";
import {Logger, Store, SuperThis} from "@fireproof/core";

export function getPath(uri: URI, sthis: SuperThis): string {
    let basePath = "https://";
    if (uri.getParam("insecure") === "true") {
        basePath = "http://"
    }
    const host = uri.host;
    const partyPath = "parties/fireproof"
    // .toString()
    // .replace(new RegExp(`^${url.protocol}//`), "")
    // .replace(/\?.*$/, "");
    const name = uri.getParam("name");
    if (name) {
        const version = uri.getParam("version");
        if (!version) throw sthis.logger.Error().Url(uri.asURL()).Msg(`version not found`).AsError();
        return sthis.pathOps.join(basePath, host, partyPath, version, name);
    }
    return sthis.pathOps.join(basePath);
}

export function getFileName(uri: URI, sthis: SuperThis): string {
    const key = uri.getParam("key");
    if (!key) throw sthis.logger.Error().Url(uri.asURL()).Msg(`key not found`).AsError();
    const res = getStore(uri, sthis.logger, (...a: string[]) => a.join("-"));
    switch (res.store) {
        case "data":
            return sthis.pathOps.join(res.name, key + ".car");
        case "wal":
        case "meta":
            return sthis.pathOps.join(res.name, key + ".json");
        default:
            throw sthis.logger.Error().Url(uri.asURL()).Msg(`unsupported store type`).AsError();
    }
}

export type Joiner = (...toJoin: string[]) => string;

export function getStore(uri: URI, logger: Logger, joiner: Joiner): Store {
    const store = uri.getParam("store");
    switch (store) {
        case "data":
        case "wal":
        case "meta":
            break;
        default:
            throw logger.Error().Url(uri.asURL()).Msg(`store not found`).AsError();
    }
    let name: string = store;
    if (uri.hasParam("index")) {
        name = joiner(uri.getParam("index") || "idx", name);
    }
    return { store, name };
}

export async function exceptionWrapper<T, E extends Error>(fn: () => Promise<Result<T, E>>): Promise<Result<T, E>> {
    return fn().catch((e) => Result.Err(e));
}