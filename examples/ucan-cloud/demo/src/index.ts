import { type Database, fireproof, type AllDocsResponse } from "use-fireproof";
import * as UCAN from "@fireproof/connect/ucan";

let clockId: string = "";
let rows: AllDocsResponse<{}>["rows"] = [];

// 🚀

let db: Database | undefined;
let databaseName = "my-db-0001";

await UCAN.login({
  email: UCAN.email("steven+001@fireproof.storage"),
});

// Connection + Clock ID

async function connect(ci?: `did:key:${string}`) {
  if (!db) return;

  const email = undefined;

  const connection = await UCAN.connect(db, {
    clock: ci ? UCAN.clockId(ci) : undefined,
    email,
  });

  clockId = (connection as any).url.getParam("clock-id");
}

// DB ROWS

async function fetchRows() {
  rows = db ? (await db.allDocs()).rows : [];
}

await fetchRows();

// 🔮

function render() {
  const paragraph = document.body.querySelector("p");

  if (paragraph)
    paragraph.innerHTML = `
    <strong>Clock ID:</strong> <span>${clockId}</span><br />

    <code>${rows.length === 0 ? "No data" : JSON.stringify(rows)}</code>
  `;
}

render();

document.body.addEventListener("submit", (e) => e.preventDefault());

// ADD DATA

const add = document.querySelector("#add");

if (add)
  add.addEventListener("click", async (e) => {
    // @ts-ignore
    const val = document.querySelector("#add-input")?.value;
    if (val) {
      if (db === undefined) {
        db = fireproof(databaseName);
        await connect();
      }
      await db.put({ _id: Date.now().toString(), data: val });
      await fetchRows();
      render();
    }
  });

// SWITCH

const swtch = document.querySelector("#switch");

if (swtch)
  swtch.addEventListener("click", async (e) => {
    // @ts-ignore
    const val = document.querySelector("#switch-input")?.value;
    if (val && val.startsWith("did:key:")) {
      db = fireproof(databaseName);
      await connect(val as `did:key:${string}`);
      await fetchRows();
      render();
    }
  });

// RE-RENDER DATA

const rerender = document.querySelector("#render-data");

if (rerender)
  rerender.addEventListener("click", async (e) => {
    e.preventDefault();

    if (db === undefined) {
      db = fireproof(databaseName);
      await connect();
    }

    await fetchRows();
    render();
  });
