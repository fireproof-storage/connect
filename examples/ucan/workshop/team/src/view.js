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
  img,
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

// PARTS

// ...

// 🔮

export const Main = () =>
  main({ className: "container" }, [
    h1({}, text("Workshop")),

    // CLOCK
    p({}, [strong({}, text("⏰ CLOCK DID")), br(), mark({}, text(computed(() => state().clock.id.did())))]),

    // AGENT
    p({}, [strong({}, text("👤 AGENT DID")), br(), mark({}, text(computed(() => state().agent.id.did())))]),

    // DATABASE
    p(
      {},
      computed(() => state().images)().map(({ url }) => {
        return img({ src: url, style: "height: auto; max-width: 100%" });
      })
    ),
  ]);
