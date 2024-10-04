import "./styles.css";

import { fireproof } from "@fireproof/core";
// import { connect } from "../../../../src/partykit";
import { connect } from "@fireproof/partykit";

// Import necessary types
import type { Database, DocBase } from "@fireproof/core";
// import type { PartyKitConnection } from "../../../../src/partykit";
interface TodoDoc extends DocBase {
  actor: string;
  created: number;
  task: string;
  completed: boolean;
  clicks?: number;
}

type ConnectionType = unknown;

declare global {
  interface Window {
    db: Database;
    cx: ConnectionType;
    changeList: (event: Event) => void;
    createTodoClick: (event: Event) => void;
    redraw: () => void;
  }
}

// Let's append all the messages we get into this DOM element
// const output = document.getElementById("app") as HTMLDivElement;

// Helper function to add a new line to the DOM
// function add(text: string) {
//   const node = document.createElement("div");
//   node.textContent = text;
//   output.appendChild(node);
// }

// Main application function
function todoApp() {
  const actorTag = Math.random().toString(36).substring(2, 7);
  let dbName: string;
  let db: Database;
  let cx: ConnectionType;
  let dbUnsubscribe: () => void;

  // Initialize the database
  async function setupDb(name: string) {
    const input = document.querySelector<HTMLInputElement>("#todo");
    if (!input) {
      return;
    }
    input.disabled = true;

    dbName = name;
    db = fireproof(name, { autoCompact: 100, threshold: 50000 });
    cx = connect(db);

    window.db = db;
    window.cx = cx;

    await db.changes([], { limit: 1 });
    input.disabled = false;

    if (dbUnsubscribe) {
      dbUnsubscribe();
    }

    dbUnsubscribe = db.subscribe(redraw);
  }

  let doing: Promise<void> | null = null;
  const redraw = async () => {
    if (doing) {
      return doing;
    }
    doing = doRedraw().finally(() => {
      doing = null;
    });
    return doing;
  };
  window.redraw = redraw;

  const doRedraw = async () => {
    const result = await db.allDocs().catch((e) => {
      console.error("allDocs error", e);
      return { rows: [] };
    });
    const ul = document.querySelector<HTMLUListElement>("ul");
    if (!ul) {
      return;
    }
    ul.innerHTML = "";
    for (const row of result.rows) {
      const doc = row.value as TodoDoc;
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = doc.completed;

      checkbox.onchange = async (e) => {
        const target = e.target as HTMLInputElement;
        target.indeterminate = true;
        const clicks = doc.clicks || 0;
        doc.clicks = clicks + 1;
        doc.completed = !doc.completed;
        await db.put(doc);
      };

      const textSpan = document.createElement("span");
      textSpan.innerText = `${doc.actor}:${doc.clicks || 0} ${doc.task}`;

      const li = document.createElement("li");
      li.appendChild(checkbox);
      li.appendChild(textSpan);
      ul.appendChild(li);
    }
  };

  async function initialize() {
    const params = new URLSearchParams(location.search);
    const listQ = params.get("list");
    await setupDb(listQ || "my-list");

    const input = document.querySelector<HTMLInputElement>("#list");
    if (!input) {
      return;
    }
    input.value = dbName;
    redraw();
  }

  async function changeList(e: Event) {
    e.preventDefault();
    const input = document.querySelector<HTMLInputElement>("#list");
    if (!input) {
      return;
    }
    dbName = input.value;
    history.pushState(null, "", location.pathname + "?list=" + encodeURIComponent(dbName));
    await setupDb(dbName);
    redraw();
  }
  window.changeList = changeList;

  async function createTodoClick(e: Event) {
    e.preventDefault();
    const input = document.querySelector<HTMLInputElement>("#todo");
    if (!input) {
      return;
    }
    input.disabled = true;
    await db.put({
      actor: actorTag,
      created: Date.now(),
      task: input.value,
      completed: false,
    });
    input.disabled = false;
    input.value = "";
  }
  window.createTodoClick = createTodoClick;

  window.onload = initialize;
}

todoApp();
