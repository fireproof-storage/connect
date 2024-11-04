import { Header, Main } from "./view";

document.body.prepend(Header());
document.body.querySelector("main#root")?.replaceWith(Main());
