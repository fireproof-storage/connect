import { Ledger } from "@fireproof/core";

export async function smokeDB(db: Ledger) {
  const ran = Math.random().toString();
  for (let i = 0; i < 10; i++) {
    await db.put({ _id: `key${i}:${ran}`, hello: `world${i}` });
  }
  for (let i = 0; i < 10; i++) {
    expect(await db.get<{ hello: string }>(`key${i}:${ran}`)).toEqual({
      _id: `key${i}:${ran}`,
      hello: `world${i}`,
    });
  }
  const docs = await db.allDocs();
  expect(docs.rows.length).toBeGreaterThan(9);
  return docs.rows.map((row) => row.value);
}
