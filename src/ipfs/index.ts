// import type { CRDT } from "@fireproof/core";
// import { ConnectUCAN, ConnectUCANParams } from "../ucan/index.js";
// import { KeyedResolvOnce } from "@adviser/cement";

// const ipfsCxs = new KeyedResolvOnce<ConnectUCAN>();

// export const connect = {
//   ucan: ({ blockstore }: CRDT<{}>, schemaName?: string) => {
//     // if (!name) throw new Error("database name is required");
//     return ipfsCxs.get(name).once(() => {
//       if (!schemaName && location) {
//         schemaName = location.origin;
//       }
//       const connection = new ConnectUCAN({
//         name,
//         schema: schemaName,
//       } as ConnectUCANParams);
//       connection.connect_X(blockstore);
//       return connection;
//     });
//   },
// };
