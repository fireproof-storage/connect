import "./index.css";

import * as UCAN from "@fireproof/connect/ucan";
import { signal, store } from "spellcaster/spellcaster.js";
import { tags, text } from "spellcaster/hyperscript.js";

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

// 📣

/**
 * @param state {State}
 * @param msg {Msg}
 */
const update = (state, msg) => {
  switch (msg) {
    default:
      return state;
  }
};

// Initial state
const databaseName = "my-db";
const server = await UCAN.server();
const agent = await UCAN.agent({ server });
const clock = await UCAN.clock({ audience: agent.agent, databaseName });

const [state, send] = store({
  state: {
    agent,
    clock,
    databaseName,
    server,
  },
  update,
});

// 🔮  ❄︎  COMMON

/**
 * @param props {Props}
 * @param labelText {string}
 */
const Label = (props, labelText) => label(props, [small({}, [strong({}, text(labelText))])]);

// 🔮  ❄︎  SECTIONS  ❄︎  AGENT

const Agent = () =>
  section({}, [
    // Header
    hgroup({}, [h2({}, text("Agent"))]),

    // Using
    Label({}, "Utilised agent DID"),
    mark({}, text(state().agent.agent.did())),
  ]);

// 🔮  ❄︎  SECTIONS  ❄︎  CLOCK

const Clock = () =>
  section({}, [
    // Header
    hgroup({}, [h2({}, text("Clock"))]),

    // Form
    form({}, [
      fieldset({}, [
        Label({ for: "clock" }, "Custom clock ID"),
        input({ "aria-label": "Custom clock ID", name: "clock", type: "text" }, []),
      ]),
    ]),

    // Using
    Label({}, "Utilised clock DID"),
    mark({}, text(state().clock?.id.did())),
  ]);

// 🔮  ❄︎  SECTIONS  ❄︎  EMAIL

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
    Label({}, "Utilised clock DID"),
    mark({}, text(state().clock?.id.did())),
  ]);

// 🔮  ❄︎  SECTIONS  ❄︎  SERVER

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
    mark({}, text(state().server.uri.toString())),
  ]);

// 🔮  ❄︎  ROOT

const Header = () =>
  header({ className: "container" }, [
    hgroup({}, [
      h1({}, text("🦜 UCAN")),
      p({}, text("Configurable example on how to use the Fireproof UCAN connector.")),
    ]),
  ]);

const Main = () => main({ className: "container" }, [Server(), Agent(), Email(), Clock()]);

document.body.prepend(Header());
document.body.querySelector("main#root")?.replaceWith(Main());
