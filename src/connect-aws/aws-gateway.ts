import { Result, URI } from "@adviser/cement";
import { bs,SuperThis,Logger,ensureSuperLog,ensureLogger,getStore, StoreType, Store } from "@fireproof/core";
import {UploadMetaFnParams,UploadDataFnParams, DownloadFnParamTypes, DownloadDataFnParams, DownloadMetaFnParams} from './types'

function builduploadawsurl(store:StoreType,url:URI,logger:Logger,params:any,uploadurl:string)
{
  if(!params) throw logger.Error().Msg("Cannot find parameters").AsError();
  //The upload URL is hardcoded for now
  if(store=="data") 
  {
    const {name,car,size}=params
    if(!name && !car && !size)
    {
      throw logger.Error().Msg("Missing 1 or more data upload parameters").AsError();
    }

    return new URL(
      `?${new URLSearchParams({ cache: Math.random().toString(), ...params }).toString()}`,
      uploadurl
    )
  }
  else if(store=="meta")
  {
    const {name,branch}=params
    if(!name && !branch)
    {
      throw logger.Error().Msg("Missing 1 or more meta upload parameters").AsError();
    }

    return new URL(
      `?${new URLSearchParams({...params}).toString()}`,
      uploadurl
    )
  }

  //Only written so that typescript doesn't complain
  return new URL('');
}


export class AWSGateway implements bs.Gateway
{
  readonly sthis: SuperThis;
  readonly logger: Logger;
  urlparams:UploadDataFnParams | UploadMetaFnParams | undefined;
  store:StoreType | undefined;
  uploadUrl:string="https://udvtu5wy39.execute-api.us-east-2.amazonaws.com/uploads"
  downloadUrl:string="https://crdt-s3uploadbucket-dcjyurxwxmba.s3.us-east-2.amazonaws.com"
  websocketurl:string=""

  constructor(sthis:SuperThis)
  {
    this.sthis=ensureSuperLog(sthis,"AWSGateway");
    this.logger=ensureLogger(this.sthis,"AWSGateway");
  }

  buildUrl(baseUrl: URI, params: string): Promise<Result<URI>>
  {
    const buildparams=JSON.parse(params)
    if(buildparams.type=="data")
    {
     const {key,...other}=buildparams;
     this.urlparams={car:key,...other};
    }
    if(buildparams.type=="meta")
    {
     const {key,...other}=buildparams;
     this.urlparams={branch:key,...other};
    }
    const url = baseUrl.build().setParam("key", buildparams.key).URI();
    return Promise.resolve(Result.Ok(url));
  }


  async start(baseUrl: URI): Promise<Result<URI>>
  {
    //This starts the connection with the gateway
    await this.sthis.start();
    this.logger.Debug().Str("url", baseUrl.toString()).Msg("start");
    const ret = baseUrl.build().defParam("version", "v0.1-aws").URI();
    return Result.Ok(ret);
  }

  close(): Promise<bs.VoidResult>
  {
    //This terminates the connection with the gateway
    //Implementation pending
    return Promise.resolve(Result.Ok(undefined));
  }

  destroy(baseUrl: URI): Promise<bs.VoidResult>
  {
    //Implementation pending
    return Promise.resolve(Result.Ok(undefined));
  }

  async put(url: URI, body: Uint8Array): Promise<bs.VoidResult>
  {
    const {store}=getStore(url,this.sthis,(...args) => args.join("/"));
    const tosend=this.sthis.txt.decode(body);

    //Now that we have the store name and body the next step is to upload
    const requestoptions=
    {
      method: 'PUT',
      body: tosend
    }

    const fetchUploadUrl=builduploadawsurl(store,url,this.logger,this.urlparams,this.uploadUrl);

    const done= await fetch(fetchUploadUrl,requestoptions)

    if (!done.ok) {
      return Result.Err(new Error(`failed to upload ${store} ${done.statusText}`));
    }
    return Result.Ok(undefined);

  }

  async get(url: URI): Promise<bs.GetResult>
  {
    const {store}=getStore(url,this.sthis,(...args) => args.join("/"));
    const fetchUploadUrl=builduploadawsurl(store,url,this.logger,this.urlparams,this.uploadUrl);
    let result;
    if(store=="meta") 
    {
      result=await fetch(fetchUploadUrl,{method:"GET"});
    }
    else
    {
      result=await fetch(this.downloadUrl);
    } 

    if (!(result.status==200)) {
      return Result.Err(new Error(`failed to download ${store} ${result.statusText}`));
    }
    const bytes = new Uint8Array(await result.arrayBuffer())
    return Result.Ok(new Uint8Array(bytes));
  }

  delete(url: URI): Promise<bs.VoidResult>
  {
    return Promise.resolve(Result.Ok(undefined));
  }
}