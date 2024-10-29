/**
 * @param url {string}
 * @returns {Promise<Uint8Array>}
 */
export async function imgUrlToUint8Array(url) {
  return await fetch(url)
    .then((r) => r.arrayBuffer())
    .then((a) => new Uint8Array(a));
}
