import { BuildURI, KeyedResolvOnce, Logger, Result, URI } from "@adviser/cement";
import { bs, getStore, SuperThis, ensureSuperLog, NotFoundError, isNotFoundError } from "@fireproof/core";

interface GDriveGatewayParams {
  readonly driveURL: string;
}

export class GDriveGateway implements bs.Gateway {
  readonly sthis: SuperThis;
  readonly logger: Logger;

  readonly params: GDriveGatewayParams;

  constructor(sthis: SuperThis, params: GDriveGatewayParams) {
    this.sthis = ensureSuperLog(sthis, "GDriveGateway");
    this.logger = this.sthis.logger;
    this.params = params;
  }

  async buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
    return Result.Ok(baseUrl.build().setParam("key", key).URI());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async destroy(url: URI): Promise<Result<void>> {
    throw new Error("Method not implemented.");
    // const { pathPart } = getStore(url, this.sthis, (...args) => args.join("/"));

    // if (pathPart !== "meta") {
    //   // why are the other store types not supported?
    //   return Result.Ok(undefined);
    //   // return Result.Err(new Error("Store is not meta"));
    // }
    // const rParams = url.getParamsResult("auth", "name");
    // if (rParams.isErr()) {
    //   return this.logger.Error().Url(url).Err(rParams).Msg("Put Error").ResultError();
    // }
    // const { auth } = rParams.Ok();
    // const { name } = rParams.Ok();

    // const fileId = await search(this.logger, name, auth);
    // if (fileId.Err()) {
    //   return fileId;
    // }
    // const fileMetadata = await get(this.logger, fileId.Ok(), "fileMetaData", auth);
    // const fileData = new Blob([new Uint16Array(0)], { type: "application/json" });
    //   const done = await update(this.logger, fileId, fileMetadata, fileData, auth);
    //   if (!done) {
    //     return this.logger.Error().Url(url).Msg(`failed to update ${pathPart}`).ResultError();
    //   }
    //   return Result.Ok(undefined);
    // } else {
    //   return this.logger.Error().Url(url).Err(rParams).Msg("Database not found").ResultError();
    // }
  }

  async start(uri: URI): Promise<Result<URI>> {
    this.logger.Debug().Str("url", uri.toString()).Msg("start");
    const ret = uri.build().defParam("version", "v0.1-gdrive").URI();
    return Result.Ok(ret);
  }

  async close(): Promise<bs.VoidResult> {
    return Result.Ok(undefined);
  }

  async put(url: URI, body: Uint8Array): Promise<bs.VoidResult> {
    const rParams = url.getParamsResult("auth", "name", "store");
    if (rParams.isErr()) {
      return this.logger.Error().Url(url).Err(rParams).Msg("Put Error").ResultError();
    }
    const { auth, store } = rParams.Ok();
    let { name } = rParams.Ok();
    const index = url.getParam("index");
    if (index) {
      name += `-${index}`;
    }
    const fileId = await this.#search(name, auth, store);
    if (fileId.isErr()) {
      if (isNotFoundError(fileId.Err())) {
        const fileData = new Blob([body], { type: "application/octet-stream" });

        const done = await this.#insert(name, body, auth, store);
        if (done.isErr()) {
          return done;
        }
        return Result.Ok(undefined);
      }
    }
    const fileData = new Blob([body], { type: "application/octet-stream" });

    const done = await this.#update(fileId.Ok(), fileData, auth, store);
    if (done.isErr()) {
      return done;
    }
    return Result.Ok(undefined);
  }

  async #delete(fileId: string, auth: string): Promise<Result<unknown>> {
    const url = this.params.driveURL;
    const headers = {
      Authorization: `Bearer ${auth}`,
    };
    try {
      const response = await fetch(BuildURI.from(url).appendRelative('drive/v3/files') + fileId, {
        method: "DELETE",
        headers
      });
      return await response.json();
    } catch (err) {
      return this.logger.Error().Url(url).Any("init", auth).Err(err).Msg("Could not delete").ResultError();
    }
  }

  async #get(fileId: string, auth: string): Promise<Result<Uint8Array>> {
    let response;
    let headers;
    const url = BuildURI.from(this.params.driveURL);
    headers = {
      Authorization: `Bearer ${auth}`,
      "Content-Type": "application/json",
    };

    headers = {
      Authorization: `Bearer ${auth}`,
    };
    response = await fetch(url.appendRelative(`drive/v3/files/${fileId}`).setParam("alt", "media").toString(), {
      method: "GET",
      headers,
    });
    return Result.Ok(new Uint8Array(await response.arrayBuffer()));

  }

  async get(url: URI): Promise<bs.GetResult> {
    const rParams = url.getParamsResult("auth", "name", "store");
    if (rParams.isErr()) {
      return Result.Err(rParams.Err());
    }
    let { name } = rParams.Ok();
    const { auth, store } = rParams.Ok();

    const index = url.getParam("index");
    if (index) {
      name += `-${index}`;
    }
    const fileId = await this.#search(name, auth, store);
    if (fileId.isErr()) {
      return Result.Err(fileId.Err());
    }
    const response = await this.#get(fileId.Ok(), auth);
    return response;
  }

  async delete(url: URI): Promise<bs.VoidResult> {
    const rParams = url.getParamsResult("auth", "name", "store");
    if (rParams.isErr()) {
      return Result.Err(rParams.Err());
    }
    const { auth, store } = rParams.Ok();
    let { name } = rParams.Ok();
    const index = url.getParam("index");
    if (index) {
      name += `-${index}`;
    }
    const fileId = await this.#search(name, auth, store);
    if (fileId.isErr()) {
      return fileId;
    }
    return await this.#delete(fileId.Ok(), auth);
  }

  async subscribe(url: URI, callback: (msg: Uint8Array) => void): Promise<bs.UnsubscribeResult> {
    url = url.build().setParam("key", "main").defParam("interval", "100").defParam("maxInterval", "3000").URI();

    let lastData: Uint8Array | undefined = undefined;
    const initInterval = parseInt(url.getParam("interval") || "100", 10);
    const maxInterval = parseInt(url.getParam("maxInterval") || "3000", 10);
    let interval = initInterval;
    const fetchData = async () => {
      const result = await this.get(url);

      if (result.isOk()) {
        const data = result.Ok();
        if (!lastData || !data.every((value, index) => lastData && value === lastData[index])) {
          lastData = data;

          callback(data);
          interval = initInterval; // Reset interval when data changes
        } else {
          interval = Math.min(interval * 2, maxInterval);
        }
      }
      timeoutId = setTimeout(fetchData, interval);
    };
    let timeoutId = setTimeout(fetchData, interval);

    return Result.Ok(() => {
      clearTimeout(timeoutId);
    });
  }

  getPlain(): Promise<Result<Uint8Array>> {
    throw new Error("Method not implemented.");
  }

  async #update(
    fileId: string,
    fileData: Blob,
    auth: string,
    store: string
  ): Promise<Result<string>> {
    const url = BuildURI.from(this.params.driveURL);

    const headers = {
      Authorization: `Bearer ${auth}`,
      "Content-Type": `fireproof/${store}`,
    };
    const response = await fetch(
      url.appendRelative(`upload/drive/v3/files/${fileId}`).setParam("uploadType", "media").toString(),
      {
        method: "PATCH",
        headers,
        body: fileData
      }
    );
    if (!response.ok) {
      return this.logger.Error().Any({ auth, store }).Msg("Insert Error").ResultError();
    }
    return Result.Ok(fileId);
  }
  async #insert(fileName: string, content: Uint8Array, auth: string, store: string): Promise<Result<string>> {
    const url = BuildURI.from(this.params.driveURL);
    const mime = `fireproof/${store}`;
    const file = new Blob([content], { type: mime });
    const metadata = {
      name: fileName,
      mimeType: mime,
    };
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", file);
    try {
      const response = await fetch(
        url.appendRelative('upload/drive/v3/files').setParam("uploadType", "multipart").setParam("supportsAllDrives", "true").toString(),
        {
          method: "POST",
          headers: { Authorization: "Bearer " + auth },
          body: form,
        }
      );
      const jsonRes = (await response.json()) as { id: string };
      return Result.Ok(jsonRes.id);
    } catch (err) {
      return this.logger.Error().Any({ auth, store }).Err(err).Msg("Insert Error").ResultError();
    }
  }
  async #search(fileName: string, auth: string, store: string): Promise<Result<string>> {
    try {
      const response = await fetch(
        BuildURI.from("https://www.googleapis.com/drive/v3/files").setParam("q=mimeType", `"fireproof/${store}" and name="${fileName}"`).toString(),
        {
          headers: {
            Authorization: "Bearer " + auth,
          },
        }
      );
      const jsonRes = (await response.json()) as { files?: { name: string; id: string }[] };
      if (jsonRes.files) {
        const found = jsonRes.files.find((data) => data.name === fileName);
        if (found) {
          return Result.Ok(found.id);
        }
      }
      return Result.Err(new NotFoundError("File not found"));
    } catch (err) {
      return this.logger.Error().Any({ auth, fileName }).Err(err).Msg("Fetch Error").ResultError();
    }
  }
}
// function generateRandom21DigitNumber() {
//   let num = Math.floor(Math.random() * 9) + 1; // First digit can't be 0
//   for (let i = 1; i < 21; i++) {
//     num = num * 10 + Math.floor(Math.random() * 10);
//   }
//   return num.toString();
// }

export class GDriveTestStore implements bs.TestGateway {
  readonly logger: Logger;
  readonly sthis: SuperThis;
  readonly gateway: bs.Gateway;

  constructor(sthis: SuperThis, gw: bs.Gateway) {
    this.sthis = ensureSuperLog(sthis, "GDriveTestStore");
    this.logger = this.sthis.logger;
    this.gateway = gw;
  }

  async get(iurl: URI, key: string): Promise<Uint8Array> {
    const url = iurl.build().setParam("key", key).URI();
    const buffer = await this.gateway.get(url);
    return buffer.Ok();
  }
}

const onceregisterGDriveStoreProtocol = new KeyedResolvOnce<() => void>();
export function registerGDriveStoreProtocol(protocol = "gdrive:", overrideBaseURL?: string) {
  return onceregisterGDriveStoreProtocol.get(protocol).once(() => {
    URI.protocolHasHostpart(protocol);
    return bs.registerStoreProtocol({
      protocol,
      overrideBaseURL,
      gateway: async (sthis): Promise<bs.Gateway> => {
        return new GDriveGateway(sthis, {
          driveURL: "https://www.googleapis.com/",
        });
      },
      test: async (sthis: SuperThis) => {
        const gateway = new GDriveGateway(sthis, {
          driveURL: "https://www.googleapis.com/",
        });
        return new GDriveTestStore(sthis, gateway);
      },
    });
  });
}
