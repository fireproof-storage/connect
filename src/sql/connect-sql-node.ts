// import { ensureLogger, Falsy, bs } from "@fireproof/core";
// import { ensureSQLOpts } from "./ensurer.js";
// import { DataSQLStore, MetaSQLStore, SQLOpts, WalSQLStore } from "./types.js";

// export interface StoreOptions {
//   readonly data: DataSQLStore;
//   readonly meta: MetaSQLStore;
//   readonly wal: WalSQLStore;
// }

// export class ConnectSQL extends bs.ConnectionBase {
//   readonly store: StoreOptions;
//   readonly textEncoder = new TextEncoder();

//   constructor(store: StoreOptions, iopts: Partial<SQLOpts> = {}) {
//     super(ensureLogger(iopts, "ConnectSQL"));
//     this.store = store;
//     const opts = ensureSQLOpts(
//       new URL("noready://"),
//       {
//         ...iopts,
//         logger: this.logger,
//       },
//       "ConnectSQL"
//     );
//     this.textEncoder = opts.textEncoder;
//   }

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   async dataUpload(bytes: Uint8Array, params: bs.UploadDataFnParams) {
//     this.logger.Debug().Msg("dataUpload");
//     throw this.logger.Error().Msg("dataUpload not implemented").AsError();
//     // await this.store.data.insert(DataSQLRecordBuilder.fromUploadParams(bytes, params).build());
//     return Promise.resolve();
//   }

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   dataDownload(params: bs.DownloadDataFnParams): Promise<Uint8Array | null> {
//     this.logger.Debug().Msg("dataDownload");

//     // const { type, name, car } = params
//     // const fetchFromUrl = new URL(`${type}/${name}/${car}.car`, this.downloadUrl)
//     // const response = await fetch(fetchFromUrl)
//     // if (!response.ok) return null // throw new Error('failed to download data ' + response.statusText)
//     // const bytes = new Uint8Array(await response.arrayBuffer())
//     // return bytes
//     return Promise.resolve(null);
//   }

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   async metaUpload(bytes: Uint8Array, params: bs.UploadMetaFnParams): Promise<Uint8Array[] | null> {
//     this.logger.Debug().Msg("metaUpload");
//     throw this.logger.Error().Msg("metaUpload not implemented").AsError();
//     // await this.store.meta.insert(MetaSQLRecordBuilder.fromUploadMetaFnParams(bytes, params, this.textEncoder).build());
//     return Promise.resolve(null);
//   }

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   async metaDownload(params: bs.DownloadMetaFnParams): Promise<Uint8Array[] | Falsy> {
//     this.logger.Debug().Msg("metaDownload");
//     throw this.logger.Error().Msg("metaDownload not implemented").AsError();
//     // const result = await this.store.meta.select({
//     //   name: params.name,
//     //   branch: params.branch,
//     // });
//     // if (result.length !== 1) return undefined;
//     return undefined;
//     // return result[0].blob
//     // const { name, branch } = params
//     // const fetchUploadUrl = new URL(
//     //   `?${new URLSearchParams({ type: 'meta', ...params }).toString()}`,
//     //   this.uploadUrl
//     // )
//     // const data = await fetch(fetchUploadUrl)
//     // let response = await data.json()
//     // if (response.status != 200) throw new Error('Failed to download data')
//     // response = JSON.parse(response.body).items
//     // const events = await Promise.all(
//     //   response.map(async (element: any) => {
//     //     const base64String = element.data
//     //     const bytes = Base64.toUint8Array(base64String)
//     //     return { cid: element.cid, bytes }
//     //   })
//     // )
//     // const cids = events.map(e => e.cid)
//     // const uniqueParentsMap = new Map([...this.parents, ...cids].map(p => [p.toString(), p]))
//     // this.parents = Array.from(uniqueParentsMap.values())
//     // return events.map(e => e.bytes)
//   }

//   async onConnect(): Promise<void> {
//     if (!this.loader || !this.taskManager) {
//       throw this.logger.Error().Msg("loader and taskManager must be set").AsError();
//     }
//     throw this.logger.Error().Msg("onConnect not implemented").AsError();
//     // await this.store.data.start();
//     // await this.store.meta.start();
//     // await this.store.wal.start();
//     return Promise.resolve();
//   }
// }
