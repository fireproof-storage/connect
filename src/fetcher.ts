import { BuildURI, Logger, Result, URI } from "@adviser/cement";
import { NotFoundError } from "@fireproof/core";

export async function resultFetch(logger: Logger, curl: URI | BuildURI, init?: RequestInit): Promise<Result<Response>> {
  try {
    const ret = await fetch(curl.asURL(), init);
    logger.Debug().Url(curl).Any("init", init).Int("status", ret.status).Msg("Fetch Done");
    return Result.Ok(ret);
  } catch (err) {
    return logger.Error().Url(curl).Any("init", init).Err(err).Msg("Fetch Error").ResultError();
  }
}

export async function fetchUint8(logger: Logger, url: URI | BuildURI, init?: RequestInit): Promise<Result<Uint8Array>> {
  const rresponse = await resultFetch(logger, url, init);
  if (rresponse.isErr()) {
    return Result.Err(rresponse.Err());
  }
  const response = rresponse.Ok();
  if (!response.ok) {
    logger
      .Error()
      .Url(url, "fetchUrl") /* .Url(dataUrl, "dataUrl") .Int("status", response.status)*/
      .Msg("Download Data response error");
    return Result.Err(new NotFoundError(`data not found: ${url.toString()}`));
  }
  return Result.Ok(new Uint8Array(await response.arrayBuffer()));
}
