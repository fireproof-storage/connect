import { getStore } from "@netlify/blobs";

console.log("fireproof edge function loaded netlify");

interface CRDTEntry {
  readonly data: string;
  readonly cid: string;
  readonly parents: string[];
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const carId = url.searchParams.get("car");
  const metaDb = url.searchParams.get("meta");

  if (req.method === "PUT") {
    if (carId) {
      const carFiles = getStore("cars");
      const carArrayBuffer = new Uint8Array(await req.arrayBuffer());
      await carFiles.set(carId, carArrayBuffer);
      return new Response(JSON.stringify({ ok: true }), { status: 201 });
    } else if (metaDb) {
      const meta = getStore("meta");
      const x = await req.json();
      // fixme, marty changed to [0] as it is a slice of the structure we expected
      const { data, cid, parents } = x[0] as CRDTEntry;
      await meta.setJSON(`${metaDb}/${cid}`, { data, parents });
      return new Response(JSON.stringify({ ok: true }), { status: 201 });
    }
  } else if (req.method === "GET") {
    if (carId) {
      const carFiles = getStore("cars");
      const carArrayBuffer = await carFiles.get(carId, { type: "arrayBuffer" });
      return new Response(carArrayBuffer, { status: 200 });
    } else if (metaDb) {
      // Problem: Deletion operations are faster than write operations, leading to an empty list most of the time if deletes happen at PUT time.
      // Solution: Delay deletes until GET operation. Utilize the parents list during read operation to mask and delete outdated entries.
      const meta = getStore("meta");
      const { blobs } = await meta.list({ prefix: `${metaDb}/` });
      const allParents = [] as string[];
      const entries = (
        await Promise.all(
          blobs.map(async (blob) => {
            const blobContents = await meta.get(blob.key, {
              type: "json",
            });
            if (!blobContents) {
              return { cid: blob.key.split("/")[1], data: null };
            }
            const { data, parents } = blobContents;
            if (parents) {
              for (const p of parents) {
                allParents.push(p.toString());
                void meta.delete(`${metaDb}/${p}`);
              }
            }
            return { cid: blob.key.split("/")[1], data, parents };
          })
        )
      ).filter((entry) => entry.data !== null && !allParents.includes(entry.cid));
      return new Response(JSON.stringify(entries), { status: 200 });
    }
  } else if (req.method === "DELETE") {
    if (carId) {
      const carFiles = getStore("cars");
      await carFiles.delete(carId);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    } else if (metaDb) {
      const meta = getStore("meta");
      const { blobs } = await meta.list({ prefix: `${metaDb}/` });
      await Promise.all(blobs.map((blob) => meta.delete(blob.key)));
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    } else {
      const meta = getStore("meta");
      const { blobs } = await meta.list({ prefix: `main/` });
      for (const blob of blobs) {
        await meta.delete(blob.key);
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }
  }

  return new Response(JSON.stringify({ error: "Invalid path" }), {
    status: 400,
  });
};

export const config = { path: "/fireproof" };
