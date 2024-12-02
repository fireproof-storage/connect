export function to_uint8(input: ArrayBuffer | ArrayBufferView | Uint8Array): Uint8Array {
  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }

  if (input instanceof Uint8Array) {
    return input;
  }
  // not nice but we make the cloudflare types happy
  return new Uint8Array(input as unknown as ArrayBuffer);
}

export function to_blob(input: ArrayBuffer | ArrayBufferView | Uint8Array | Blob): Blob {
  if (input instanceof Blob) {
    return input;
  }
  return new Blob([to_uint8(input)]);
}
export function to_arraybuf(input: ArrayBuffer | ArrayBufferView | Uint8Array): ArrayBuffer {
  if (input instanceof ArrayBuffer) {
    return input;
  }
  return to_uint8(input).buffer as ArrayBuffer;
}
