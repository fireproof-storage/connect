/**
 * @typedef {import("@fireproof/core").Database} Database
 * @typedef {import("@fireproof/core").DocBase} DocBase
 * @typedef {import("@fireproof/core").DocTypes} DocTypes
 */

/**
 * @template T
 * @typedef {import("@fireproof/core").AllDocsResponse<DocBase & T>} AllDocsResponse
 */

/**
 * @template T
 * @typedef {import("@fireproof/core").DocWithId<DocBase & T>} DocWithId
 */

/**
 * @param db {Database}
 */
export async function docIds(db) {
  const docs = await db.allDocs();
  return new Set(docs.rows.map((doc) => doc.key));
}

/**
 * @param db {Database}
 */
export async function imageUrls(db) {
  /** @type {Uint8Array[]} */
  let images = [];

  /** @type {AllDocsResponse<{ did: string; images: Uint8Array[] }>} */
  const docs = await db.allDocs();
  const values = docs.rows.map((r) => r.value);
  images = values.map((v) => v.images).flat();

  return images.map((bytes) => {
    return {
      url: URL.createObjectURL(new Blob([bytes])),
    };
  });
}
