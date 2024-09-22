import { connectionFactory } from "../connection-from-store";
import { bs } from "@fireproof/core";

// Usage:
//
// import { useFireproof } from 'use-fireproof'
// import { connect } from '@fireproof/netlify'
//
// const { db } = useFireproof('test')
//
// const url = URI.from("netlify://localhost:8888").build();
//
// const cx = connect.netlify(db, url);

if (!process.env.FP_KEYBAG_URL?.includes("extractKey=_deprecated_internal_api")) {
  const url = new URL(process.env.FP_KEYBAG_URL || "file://./dist/kb-dir-netlify?fs=mem");
  url.searchParams.set("extractKey", "_deprecated_internal_api");
  process.env.FP_KEYBAG_URL = url.toString();
}

export const connect = {
  netlify: ({ sthis, blockstore, name }: bs.Connectable, url = "https://localhost:8888") => {
    const urlObj = new URL(url.toString());
    urlObj.searchParams.set("name", name || "default");
    const fpUrl = urlObj.toString().replace("https", "netlify");
    const connection = connectionFactory(sthis, fpUrl);
    connection.connect_X(blockstore);
    return connection;
  },
};
