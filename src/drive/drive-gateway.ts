import { KeyedResolvOnce, Result, URI } from "@adviser/cement";
import { bs, getStore, Logger, SuperThis, ensureSuperLog } from "@fireproof/core";

export class GDriveGateway implements bs.Gateway {
  readonly sthis: SuperThis;
  readonly logger: Logger;

  constructor(sthis: SuperThis) {
    this.sthis = ensureSuperLog(sthis, "GDriveGateway");
    this.logger = this.sthis.logger;
  }

  async buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
    return Result.Ok(baseUrl.build().setParam("key", key).URI());
  }

  async destroy(url: URI): Promise<Result<void>> {
    const { store } = getStore(url, this.sthis, (...args) => args.join("/"));

    if (store !== "meta") {
      // why are the other store types not supported?
      return Result.Ok(undefined);
      // return Result.Err(new Error("Store is not meta"));
    }
    const rParams = url.getParamsResult("auth", "name");
    if ('undefined' !== typeof rParams && rParams.isErr()) {
      return this.logger.Error().Url(url).Err(rParams).Msg("Put Error").ResultError();
    }
    const { auth } = rParams.Ok();
    let { name } = rParams.Ok();    
    name += ".fp";    

    const fileId = await search(this.logger, '', name, auth);
    if ('undefined' !== typeof fileId || fileId !== 404) {
        const fileMetadata = await get(this.logger, fileId, 'fileMetaData', auth);

        const fileData = new Blob([new Uint16Array(0)], { type: "text/plain" });
        const done = await update(this.logger, fileId, fileMetadata, fileData, auth);
        if ('undefined' == typeof done ) {
          return this.logger
            .Error()
            .Url(url)           
            .Msg(`failed to update ${store}`)
            .ResultError();
        }
        return Result.Ok(undefined);
    }else{
      return this.logger.Error().Url(url).Err(rParams).Msg("Database not found").ResultError();
    }    
  }

  async start(uri: URI): Promise<Result<URI>> {
    this.logger.Debug().Str("url", uri.toString()).Msg("start");
    const ret = uri.build().defParam("version", "v0.1-gdrive").defParam("remoteBaseUrl", uri.toString()).URI();
    return Result.Ok(ret);
  }

  async close(): Promise<bs.VoidResult> {
    return Result.Ok(undefined);
  }

  async put(url: URI, body: Uint8Array): Promise<bs.VoidResult> {
    const { store } = getStore(url, this.sthis, (...args) => args.join("/"));

    const rParams = url.getParamsResult("auth", "name");
    if ('undefined' !== typeof rParams && rParams.isErr()) {
      return this.logger.Error().Url(url).Err(rParams).Msg("Put Error").ResultError();
    }
    const { auth } = rParams.Ok();
    let { name } = rParams.Ok();  
    const index = url.getParam("index");  
    if ('undefined'!== typeof index) {
      name += `-${index}`;
    }
    name += ".fp";    

    const fileId = await search(this.logger, '', name, auth);
    if ('undefined' !== typeof fileId || fileId !== 404) {
        const fileMetadata = await get(this.logger, fileId, 'fileMetaData', auth);
        const fileData = new Blob([body], { type: "text/plain" });
        const done = await update(this.logger, fileId, fileMetadata, fileData, auth);
        if ('undefined' == typeof done ) {
          return this.logger
            .Error()
            .Url(url)           
            .Msg(`failed to update ${store}`)
            .ResultError();
        }
        return Result.Ok(undefined);
    }else{
      return this.logger.Error().Url(url).Err(rParams).Msg("Database not found").ResultError();
    }   
  }

  async get(url: URI): Promise<bs.GetResult> {
    let response;
    const { store } = getStore(url, this.sthis, (...args) => args.join("/"));
    const rParams = url.getParamsResult("auth", "name");
    if ('undefined' !== typeof rParams && rParams.isErr()) {
      return Result.Err(rParams.Err());
    }
    let { name } = rParams.Ok();
    let { auth } = rParams.Ok();

    const index = url.getParam("index");
    if ('undefined'!== typeof index) {
      name += `-${index}`;
    }
    name += ".fp";
    
    try{
      const fileId = await search(this.logger, '', name, auth);
      if( 'undefined' !== typeof fileId && fileId !== 404){
        response = await get(this.logger, fileId, 'fileContent', auth);
        var contentArray = new Array(response.length);
        for (var i = 0; i < contentArray.length; i++) {
          contentArray[i] = response.charCodeAt(i);
        }
        const data = new Uint8Array(contentArray);

        return Result.Ok(data);

      }     

    }catch(err){
      return this.logger.Error().Url(url).Err(rParams).Msg("Database not found").ResultError();
    }    
  }

  async delete(url: URI): Promise<bs.VoidResult> {
    let response;
    const { store } = getStore(url, this.sthis, (...args) => args.join("/"));
    const rParams = url.getParamsResult("auth", "name");
    if ('undefined' !== typeof rParams && rParams.isErr()) {
      return Result.Err(rParams.Err());
    }
    const { auth } = rParams.Ok();
    var { name } = rParams.Ok();
    const index = url.getParam("index");
    if (index) {
      name += `-${index}`;
    }
    name += ".fp";

    try{
      const fileId = await search(this.logger, '', name, auth);
      if('undefined'!== typeof fileId && fileId !== 404){
        response = await deleteDB(this.logger, fileId, auth);
        if(response.id){
          return Result.Ok(undefined);
        }else{
          return this.logger.Error().Url(url).Err(rParams).Msg("Could not delete").ResultError();
        }
      }
    }catch(err){
      return this.logger.Error().Url(url).Err(rParams).Msg("Database not found").ResultError();
    }  
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
}
function generateRandom21DigitNumber() {
  let num = Math.floor(Math.random() * 9) + 1; // First digit can't be 0
  for (let i = 1; i < 21; i++) {
      num = num * 10 + Math.floor(Math.random() * 10);
  }
  return num.toString();
}
async function deleteDB(logger: Logger, fileId: string, auth: string): Promise<object | undefined | Result<unknown>>{
  let response;
  const url = "https://www.googleapis.com/drive/v3/files/";
  const headers = {
    'Authorization': `Bearer ${auth}`
  };
  try{
    response = await fetch(url+fileId, {
      method: "DELETE",
      headers: headers
    });
    return await response.json();
  }catch(err){
    return logger.Error().Url(url).Any("init", auth).Err(err).Msg("Could not delete").ResultError();
  }
}
async function get(logger: Logger, fileId:string, type: string, auth: string): Promise<object | string | undefined | Result<unknown>> {
  let response;
  let headers;
  const url = "https://www.googleapis.com/drive/v3/files/";
  headers = {
    'Authorization': `Bearer ${auth}`,
    'Content-Type': 'application/json'
  };
  try{
    if(type == 'fileMetaData'){
      response = await fetch(url+fileId, {
        method: "GET",
        headers: headers
      });
      return await response.json();
    }else{
      headers = {
        'Authorization': `Bearer ${auth}`
      };
      response = await fetch(url+fileId+"?alt=media", {
        method: "GET",
        headers: headers
      });
      return await response.text();
    }
    
  }catch(err){
    return logger.Error().Url(url).Any("init", auth).Err(err).Msg("Fetch Error").ResultError();
  }
  
}
async function update(logger: Logger, fileId: string, fileMetadata: object, fileData: Blob, auth: string): Promise<object | undefined | Result<unknown>>{
  const url = "https://www.googleapis.com/upload/drive/v3/files/";
  let response;
  const boundary = '-------'+generateRandom21DigitNumber();
    var reader = new FileReader();
    reader.readAsBinaryString(fileData);
    reader.onload = function (e) {
      var content = reader.result;
      const headers = new Headers({
        'Authorization': `Bearer ${auth}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      });
      const body = `--${boundary}
      Content-Type: application/json
      
      {"name": ${fileMetadata.name}}
      
      --${boundary}
      Content-Type: text/plain
      
      ${content}
      
      --${boundary}--`;
    }
              
    try{
      response = await fetch(url+`${fileId}?uploadType=multipart&fields=id`, {
        method: 'PATCH',
        headers,
        body,
      });
      return await response.json();
    }catch(err){
      return logger.Error().Url(url).Any("init", auth).Err(err).Msg("Insert Error").ResultError();
    }       


}
async function insert(logger: Logger, fileName: string, content: string, auth: string): Promise<string | undefined | Result<unknown>> {
  let response;
  const url = "https://www.googleapis.com/upload/drive/v3/files";
  var file = new Blob([content], { type: "text/plain" });
  var metadata = {
    name: fileName,
    mimeType: "text/plain"
  };

  var form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", file);
  try{
    response = await fetch(url+"?uploadType=multipart&supportsAllDrives=true", {
      method: "POST",
      headers: new Headers({ Authorization: "Bearer " + auth }),
      body: form,
    });
    response = await response.json();
    return response.id;
  }catch(err){
    return logger.Error().Url(url).Any("init", auth).Err(err).Msg("Insert Error").ResultError();
  }
  
  
    
}
async function search(logger: Logger, query = '', fileName: string, auth: string): Promise<string | number | Result<unknown> | undefined>  {
  let response;
  var result;
  var exists = false;
  const url = 'https://www.googleapis.com/drive/v3/files';
  try {
    response = await fetch(url+"?q="+query,{
      headers: {
        'Authorization': 'Bearer '+auth,
    }
    });
    response = await response.json();
    const files = response?.files;
    if ("undefined" === typeof files || files.length == 0) {
      result = 404;
    } else {
      
        files.forEach(async function (data, index) {
          if (data.name === fileName) {
            exists = true;
            result = data.id;
            return; 
          }
          if (index === files.length - 1 && exists === false) {
            result = 404;
          }
        });
      
      return result;
    }
    
  } catch (err) {
    return logger.Error().Url(url).Any("init", auth).Err(err).Msg("Fetch Error").ResultError();
  }
  
};
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
        return new GDriveGateway(sthis);
      },
      test: async (sthis: SuperThis) => {
        const gateway = new GDriveGateway(sthis);
        return new GDriveTestStore(sthis, gateway);
      },
    });
  });
}

