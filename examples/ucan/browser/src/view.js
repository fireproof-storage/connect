import { tags, text } from "spellcaster/hyperscript.js";

import "./index.css";
import { state, send } from "./state.js";
import { computed } from "spellcaster/spellcaster.js";

/**
 * @typedef {import("spellcaster/hyperscript.js").Props} Props
 *
 * @typedef {import("./types").Msg} Msg
 * @typedef {import("./types").State} State
 */

const {
  a,
  button,
  div,
  fieldset,
  footer,
  form,
  h1,
  h2,
  h3,
  header,
  hgroup,
  hr,
  input,
  label,
  main,
  mark,
  p,
  section,
  small,
  span,
  strong,
} = tags;

// 🛠️

/**
 * @param event {Event}
 */
function preventDefault(event) {
  event.preventDefault();
}

/**
 * @param props {Props}
 * @param labelText {string}
 */
const Label = (props, labelText) => label(props, [small({}, [strong({}, text(labelText))])]);

// AGENT

const Agent = () =>
  section({}, [
    // Header
    hgroup({}, [h2({}, text("Agent"))]),

    // Using
    Label({}, "Utilised agent DID"),
    p({}, [mark({}, text(computed(() => state().agent.agent.did())))]),
  ]);

// CLOCK

const Clock = () =>
  section({}, [
    // Header
    hgroup({}, [h2({}, text("Clock"))]),

    // Form
    form({}, [
      fieldset({}, [
        Label({ for: "clock" }, "Custom clock ID"),
        input(
          {
            "aria-label": "Custom clock ID",
            name: "clock",
            type: "text",

            value: "storeName" in state().clock ? "" : state().clock.id.did(),
          },
          []
        ),
      ]),
    ]),

    // Using
    Label({}, "Utilised clock DID"),
    p({}, [mark({}, text(computed(() => state().clock.id.did())))]),
  ]);

// DATABASE NAME

const Database = () =>
  section({}, [
    // Header
    hgroup({}, [h2({}, text("Database name"))]),

    // Form
    form({ onsubmit: preventDefault }, [
      fieldset({}, [
        Label({ for: "database" }, "Database name"),
        input(
          {
            "aria-label": "Database name",

            /**
             * @param event {object}
             * @param event.target {HTMLInputElement}
             */
            onchange: (event) => send({ type: "SET_DATABASE_NAME", name: event.target.value }),
            name: "database",
            type: "text",
            value: state().databaseName,
          },
          []
        ),
      ]),
    ]),

    // Using
    Label({}, "Utilised database name"),
    p({}, [mark({}, text(computed(() => state().databaseName)))]),
  ]);

// EMAIL

const Email = () =>
  section({}, [
    // Header
    hgroup({}, [
      h2({}, text("Email")),
      p({}, [
        small({}, text("Optional email address, enables sync across devices/instances without any agent delegations.")),
      ]),
    ]),

    // Form
    form({}, [
      fieldset({}, [
        Label({ for: "email" }, "Email address"),
        input({ "aria-label": "Email address", autocomplete: "email", name: "email", type: "email" }, []),
      ]),
    ]),

    // Using
    Label({}, "Utilised clock delegation"),
    p({}, [
      span({}, text("Delegating new clocks to the ")),
      mark({}, text(computed(() => (state().email ? "given email address" : "agent")))),
    ]),
  ]);

// SERVER

const Server = () =>
  section({}, [
    // Header
    hgroup({}, [
      h2({}, text("Server")),
      p({}, [
        small({}, [
          span({}, text("Which ")),
          a({ href: "https://github.com/fireproof-storage/fireproof-ucan" }, text("fireproof-ucan")),
          span({}, text(" server would you like to use?")),
        ]),
      ]),
    ]),

    // Form
    form({}, [
      fieldset({}, [
        Label({ for: "server" }, "Custom server URL"),
        input({ "aria-label": "Custom server URL", autocomplete: "url", name: "server", type: "text" }, []),
      ]),
    ]),

    // Using
    Label({}, "Utilised server"),
    p({}, [mark({}, text(computed(() => state().server.uri.toString())))]),
  ]);

// 🔮

export const Header = () =>
  header({ className: "container" }, [
    hgroup({}, [
      h1({}, text("🦜 UCAN")),
      p({}, text("Configurable example on how to use the Fireproof UCAN connector.")),
    ]),
  ]);

export const Main = () =>
  main({ className: "container" }, [Database(), hr(), Server(), hr(), Agent(), hr(), Email(), hr(), Clock()]);
