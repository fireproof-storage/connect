import type { bs } from "@fireproof/core";
import { ConnectUCAN, ConnectUCANParams } from "../ucan/index.js";

const ipfsCxs = new Map<string, ConnectUCAN>();

export const connect = {
  ucan: ({ name, blockstore }: bs.Connectable, schemaName?: string) => {
    if (!name) throw new Error("database name is required");
    if (ipfsCxs.has(name)) {
      return ipfsCxs.get(name);
    }
    if (!schemaName && location) {
      schemaName = location.origin;
    }
    const connection = new ConnectUCAN({
      name,
      schema: schemaName,
    } as ConnectUCANParams);
    connection.connect_X(blockstore);
    ipfsCxs.set(name, connection);
    return connection;
  },
};
