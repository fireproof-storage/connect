import { repeat, tags, text } from "spellcaster/hyperscript.js";

import "./index.css";
import { state, send } from "./state.js";
import { computed, effect } from "spellcaster/spellcaster.js";

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
  em,
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
    form({ onsubmit: preventDefault }, [
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

// CLAIM SHARE

const ClaimShare = () =>
  section({}, [
    // Header
    hgroup({}, [
      h2({}, text("Claim share")),
      p({}, [small({}, [span({}, text("Retrieve the UCAN delegation for a share."))])]),
    ]),

    // Buttons
    p({}, [
      button(
        {
          onclick: () => {
            const { loggedIn } = state();

            if (loggedIn !== true) {
              alert("Need to be logged in first before you can claim shares.");
              return;
            }

            send({ type: "CLAIM_ALL_SHARES" });
          },
        },
        text("Claim all shares")
      ),
    ]),

    // Delegations
    div({}, (element) => {
      const signal = computed(() => {
        const { shareClaims } = state();
        if (!shareClaims) return span({}, []);
        if (shareClaims === "loading") return p({}, [small({ ariaBusy: "true" }, text("Loading delegations"))]);

        console.log(
          shareClaims.map((d) => {
            return {
              iss: d.issuer.did(),
              aud: d.audience.did(),
              caps: JSON.stringify(d.capabilities),
            };
          })
        );

        const clockDIDs = shareClaims.flatMap((d) => {
          const cap = d.capabilities[0];
          if (cap.can === "clock/*") return [cap.with];
          return [];
        });

        if (clockDIDs.length === 0) return p({}, text("No shares found."));
        const activeClock = state().clock.id.did();

        return div({}, [
          p({}, text("Available databases:")),
          ul(
            {},
            clockDIDs.map((did) => {
              return li({}, [
                a(
                  {
                    style: "cursor: pointer; word-break: break-all;",
                    title: "Click to use database",
                    onclick: () => {
                      send({ type: "SET_CLOCK_ID_INPUT", clockId: did });
                    },
                  },
                  text(did === activeClock ? `⚡ ${did} (active)` : did)
                ),
              ]);
            })
          ),
        ]);
      });

      return effect(() => {
        element.replaceChildren(signal());
      });
    }),
  ]);

// DATABASE DATA

const Data = () =>
  section({}, [
    // Header
    hgroup({}, [h2({}, text("Database contents"))]),

    // Add data
    form(
      {
        /**
         * @param event {Event & { target: HTMLElement }}
         */
        onsubmit: async (event) => {
          event.preventDefault();

          const db = state().database;
          const form = event.target;

          if (!db || !form) return;

          const input = /** @type {HTMLInputElement | null} */ (event.target.querySelector('input[name="data"]'));
          const val = input && input.value.trim();
          if (val && val.length) await db.put({ text: val });

          send({ type: "DATABASE_CONTENTS_CHANGED" });
          if (input) input.value = "";
        },
      },
      [
        Label({ for: "data" }, "Add data"),
        fieldset({ role: "group" }, [
          input(
            {
              "aria-label": "Add data",
              name: "data",
              type: "text",
              required: true,
            },
            []
          ),
          input(
            {
              value: "Add",
              type: "submit",
            },
            []
          ),
        ]),
      ]
    ),

    // Contents
    div({}, (element) => {
      const signal = computed(() => {
        const contents = state().databaseContents;

        if (contents === "loading") {
          return p({}, [small({ ariaBusy: "true" }, text("Loading database contents"))]);
        }

        return ul(
          {},
          repeat(
            computed(() => contents),
            (row) => li({}, text(row))
          )
        );
      });

      return effect(() => {
        element.replaceChildren(signal());
      });
    }),
  ]);

// DATABASE NAME

const Database = () =>
  section({}, [
    // Header
    hgroup({}, [h2({}, text("Database name"))]),

    // Using
    Label({}, "Utilised database name"),
    p({}, text("Using the clock DID as the database name.")),
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
        input(
          {
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
          },
          []
        ),
      ]),
    ]),

    // Logged in
    div({}, (element) => {
      const signal = computed(() => {
        const { email, loggedIn } = state();

        if (email === undefined) {
          return div({}, [Label({}, "No login needed when not using an email address"), p({}, [span({}, text("☑️"))])]);
        }

        if (loggedIn === true) {
          return div({}, [Label({}, "Logged in successfully"), p({}, [span({}, text("☑️"))])]);
        }

        if (loggedIn === "in-progress") {
          return div({}, [Label({}, "Logging in ..."), p({}, [span({}, text("Check your email inbox ⚡"))])]);
        }

        return div({}, [
          Label({}, "Login required"),
          p({}, [button({ onclick: () => send({ type: "LOGIN" }) }, text("Log in"))]),
        ]);
      });

      return effect(() => {
        element.replaceChildren(signal());
      });
    }),

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
        input(
          {
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
          },
          []
        ),
      ]),
    ]),

    // Using
    Label({}, "Utilised server"),
    p({}, [mark({}, text(computed(() => state().server.uri.toString())))]),
  ]);

// SHARE

export const Share = () =>
  section({}, [
    // Header
    hgroup({}, [
      h2({}, text("Share")),
      p({}, [
        small({}, [
          span(
            {},
            text(
              "Share the database with an email address. Note that sharing with a specific agent is possible too, but not enabled here."
            )
          ),
        ]),
      ]),
    ]),

    // Form
    form(
      {
        /**
         * @param event {Event & { target: HTMLElement }}
         */
        onsubmit: async (event) => {
          event.preventDefault();

          const { loggedIn } = state();

          if (loggedIn !== true) {
            alert("Need to be logged in first before you can share.");
            return;
          }

          const form = event.target;
          if (!form) return;

          const input = /** @type {HTMLInputElement | null} */ (
            event.target.querySelector('input[name="shareTarget"]')
          );
          const val = input?.value?.trim();
          if (val && val.length) {
            send({ type: "SHARE_WITH_EMAIL", email: /** @type {`${string}@${string}`} */ (val) });
            if (input) input.value = "";
          }
        },
      },
      [
        Label({ for: "shareTarget" }, "Email address"),
        fieldset({ role: "group" }, [
          input(
            {
              "aria-label": "Email address",
              name: "shareTarget",
              type: "email",
              required: true,
            },
            []
          ),
          input(
            {
              value: "Share",
              type: "submit",
            },
            []
          ),
        ]),
      ]
    ),

    // Status
    p({}, (element) => {
      const signal = computed(() => {
        const { email, shareStatus } = state();
        if (shareStatus === undefined) return span({}, []);

        switch (shareStatus.type) {
          case "LOADING":
            return p({}, [
              small({ ariaBusy: "true" }, text("Creating share delegation and invoking share authorization")),
            ]);

          case "SHARED":
            return p({}, [
              small({}, [
                span({}, text(`Shared database with: `)),
                mark({}, text(shareStatus.email)),
                br({}),
                span({}, text(`Share CID: `)),
                mark({}, text(shareStatus.cid)),
                br({}),
                span({}, text(`Check your email inbox (${email}) to confirm the share.`)),
              ]),
            ]);
        }
      });

      return effect(() => {
        element.replaceChildren(signal());
      });
    }),
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
  main({ className: "container" }, [
    Data(),
    hr(),
    ClaimShare(),
    hr(),
    Share(),
    hr(),
    Clock(),
    hr(),
    Email(),
    hr(),
    Agent(),
    hr(),
    Server(),
    hr(),
    Database(),
  ]);
