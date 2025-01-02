import { MetaSendSql } from "./meta-send.js";

async function main() {
  // eslint-disable-next-line no-console
  console.log(MetaSendSql.schema());
}

// eslint-disable-next-line no-console
main().catch(console.error);
