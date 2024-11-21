import { repeat, tags, text } from "spellcaster/hyperscript.js";

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
  br,
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
  li,
  main,
  mark,
  p,
  section,
  small,
  span,
  strong,
  ul,
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

            value: state().clockIdInput || "",

            /**
             * @param event {object}
             * @param event.target {HTMLInputElement}
             */
            onchange: (event) => send({ type: "SET_CLOCK_ID_INPUT", clockId: event.target.value }),
          },
          []
        ),
      ]),
    ]),

    // Using
    Label({}, "Utilised clock DID"),
    p({}, [mark({}, text(computed(() => state().clock.id.did())))]),
  ]);

// DATABASE DATA

const Data = () =>
  section({}, [
    // Header
    hgroup({}, [h2({}, text("Database contents"))]),

    // Add data
    form({

      /**
       * @param event {Event & { target: HTMLElement }}
       */
      onsubmit: async (event) => {
        event.preventDefault()

        const db = state().database
        const form = event.target

        if (!db || !form) return

        const input = event.target.querySelector('input[name="data"]')
        const val = input && /** @type {HTMLInputElement} */ (input).value.trim()
        if (val && val.length) await db.put({ text: val })

        send({ type: "DATABASE_CONTENTS_CHANGED" })
      }

    }, [
      Label({ for: "data" }, "Add data"),
      fieldset({ role: "group" }, [
        input(
          {
            "aria-label": "Add data",
            name: "data",
            type: "text"
          },
          []
        ),
        input(
          {
            value: "Add",
            type: "submit"
          },
          []
        ),
      ]),
    ]),

    // ---
    hr(),

    // Contents
    ul({}, repeat(

      computed(() => state().databaseContents),
      row => li({}, text(row))

    ))
  ])

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
            name: "database",
            type: "text",
            value: state().databaseName,

            /**
             * @param event {object}
             * @param event.target {HTMLInputElement}
             */
            onchange: (event) => send({ type: "SET_DATABASE_NAME", name: event.target.value }),
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
    form({ onsubmit: preventDefault }, [
      fieldset({}, [
        Label({ for: "email" }, "Email address"),
        input({
          "aria-label": "Email address",
          autocomplete: "email",
          name: "email",
          type: "email",

          value: state().email || "",

          /**
           * @param event {object}
           * @param event.target {HTMLInputElement}
           */
          onchange: (event) => send({ type: "SET_EMAIL", email: event.target.value }),
        }, []),
      ]),
    ]),

    // Logged in
    Label({}, "Logged in"),
    computed(() => {
      const { email, loggedIn } = state()

      if (email === undefined) {
        return p({}, [ span({}, text("No login needed when not using an email address.")) ])
      }

      if (loggedIn) {
        return p({}, [ span({}, text("Logged in successfully.")) ])
      }

      return div({}, [
        p({},text("Login needed.")),
        p({}, [
          button({ onclick: () => send({ type: "LOGIN" }) }, text("Log in"))
        ])
      ])
    })(),

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
    form({ onsubmit: preventDefault }, [
      fieldset({}, [
        Label({ for: "server" }, "Custom server URL"),
        input({
          "aria-label": "Custom server URL",
          autocomplete: "url",
          name: "server",
          type: "text",

          value: state().serverInput || "",

          /**
           * @param event {object}
           * @param event.target {HTMLInputElement}
           */
          onchange: (event) => send({ type: "SET_SERVER_INPUT", server: event.target.value }),
        }, []),
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
  main({ className: "container" }, [Database(), hr(), Server(), hr(), Agent(), hr(), Email(), hr(), Clock(), hr(), Data()]);
