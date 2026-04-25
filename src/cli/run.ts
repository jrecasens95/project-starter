import { bold, cyan, red } from "kolorist";
import { runInitCommand } from "./commands/init";
import { parseInitCommandOptions } from "./parse-init-options";

const HELP_TEXT = `
${bold("project-starter")}

Usage:
  project-starter init
  project-starter init --project-name my-app --project-kind fullstack --frontend-framework react-vite --backend-framework express

Commands:
  init       Create a new project interactively
  help       Show this help

Init flags:
  --project-name <name>
  --target-dir <path>
  --project-kind <frontend|backend|fullstack>
  --frontend-framework <react-vite|nextjs>
  --backend-framework <go-fiber|express|fastify|nestjs>
  --database <postgres|supabase|none>
  --frontend-modules <csv>
  --backend-modules <csv>
  --shared-modules <csv>
  --install-deps / --no-install-deps
  --git / --no-git
  --conflict-policy <overwrite|skip|error>
  --yes
`.trim();

export async function runCli(args: string[]): Promise<void> {
  const [command] = args;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    console.log(HELP_TEXT);
    return;
  }

  if (command === "init") {
    console.log(cyan(`\n${bold("project-starter")} initializing a new project...\n`));
    await runInitCommand(parseInitCommandOptions(args.slice(1)));
    return;
  }

  console.error(red(`Unknown command: ${command}`));
  console.log(HELP_TEXT);
  process.exitCode = 1;
}
