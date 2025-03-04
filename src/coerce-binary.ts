export async function top_uint8(
  input: string | ArrayBufferLike | ArrayBufferView | Uint8Array | SharedArrayBuffer | Blob
): Promise<Uint8Array> {
  if (input instanceof Blob) {
    return new Uint8Array(await input.arrayBuffer());
  }
  return to_uint8(input);
}

export function to_uint8(
  input: string | ArrayBufferLike | ArrayBufferView | Uint8Array | SharedArrayBuffer
): Uint8Array {
  if (typeof input === "string") {
    // eslint-disable-next-line no-restricted-globals
    return new TextEncoder().encode(input);
  }
  if (input instanceof ArrayBuffer || input instanceof SharedArrayBuffer) {
    return new Uint8Array(input);
  }

  if (input instanceof Uint8Array) {
    return input;
  }
  // not nice but we make the cloudflare types happy
  return new Uint8Array(input as unknown as ArrayBufferLike);
}

export function to_blob(input: ArrayBufferLike | ArrayBufferView | Uint8Array | Blob): Blob {
  if (input instanceof Blob) {
    return input;
  }
  return new Blob([to_uint8(input)]);
}

export function to_arraybuf(input: ArrayBufferLike | ArrayBufferView | Uint8Array): ArrayBuffer {
  if (input instanceof ArrayBuffer) {
    return input;
  }
  const u8 = to_uint8(input);
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
  // return to_uint8(input).buffer; //  as ArrayBuffer;
}
