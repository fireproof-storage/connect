import { $ } from "zx";

async function main() {
  $.verbose = true;
  const out = await $`which docker-compose`.catch(() => ({ exitCode: 1 }));
  const dockerComposePrg = out.exitCode === 0 ? ["docker-compose"] : ["docker", "compose"];
  const res = await $`${dockerComposePrg} ${process.argv.slice(2)}`;
  process.exit(res.exitCode);
}

// eslint-disable-next-line no-console
main().catch((e) => {
  console.error(e);
  process.exit(2);
});
