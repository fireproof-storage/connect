import { $ } from "zx";

// if [ $(which podman) -a "$FP_CI" != "fp_ci" ]
// then
//   dockerCompose="podman compose"
// elif which docker-compose
// then
//   dockerCompose="docker-compose"
// else
//   dockerCompose="docker compose"
// fi

async function main() {
  $.verbose = true;
  const whichPodman = await $`which podman`.catch(() => ({ exitCode: 1 }));
  let dockerComposePrg = [];
  if (whichPodman.exitCode === 0 && process.env.FP_CI !== "fp_ci") {
    dockerComposePrg = ["podman", "compose"];
  } else {
    const out = await $`which docker-compose`.catch(() => ({ exitCode: 1 }));
    dockerComposePrg = out.exitCode === 0 ? ["docker-compose"] : ["docker", "compose"];
  }
  const res = await $`${dockerComposePrg} ${process.argv.slice(2)}`;
  process.exit(res.exitCode);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(2);
});
