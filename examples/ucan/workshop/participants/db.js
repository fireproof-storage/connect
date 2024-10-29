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

  try {
    /** @type {DocWithId<{ images: Uint8Array[] }>} */
    const existing = await db.get("images");
    images = [...existing.images, ...images];
  } catch (err) {
    if (!isNotFoundError(err)) throw err;
  }

  await db.put({
    did,
    images,
  });

  return images;
}
