import { $ } from "zx";

async function main() {
  const out = await $`which docker-compose`;
  const dockerComposePrg = out.exitCode === 0 ? "docker-compose" : "docker compose";
  $.verbose = true;
  await $`${dockerComposePrg} ${process.argv.slice(2)}`;
}

// eslint-disable-next-line no-console
main().catch(console.error);
