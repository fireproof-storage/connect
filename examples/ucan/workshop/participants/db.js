/**
 * @typedef {import("@fireproof/core").Database} Database
 */

import { isNotFoundError } from "@fireproof/core";

/**
 * @template T
 * @typedef {import("@fireproof/core").AllDocsResponse<DocBase & T>} AllDocsResponse
 */

/**
 * @param db {Database}
 * @param did {string}
 * @param image {Uint8Array}
 */
export async function addImage(db, did, image) {
  let images = [image];

  await db.put({
    did,
    images,
  });

  return images;
}
