import path from "node:path";
import { spawn } from "node:child_process";
import fs from "fs-extra";
import type { GenerationPlan } from "../types";
import { info, note, success, warn } from "../utils/logger";

export async function runPostGenerationSteps(plan: GenerationPlan, installDependencies: boolean): Promise<void> {
  if (installDependencies) {
    for (const installTask of plan.installTasks) {
      if (installTask.kind === "node") {
        if (!(await fs.pathExists(path.join(installTask.cwd, "package.json")))) {
          continue;
        }

        info(`Installing Node.js dependencies in ${installTask.cwd}`);
        await runCommand("npm", ["install"], installTask.cwd);
        continue;
      }

      if (!(await fs.pathExists(path.join(installTask.cwd, "go.mod")))) {
        continue;
      }

      info(`Installing Go dependencies in ${installTask.cwd}`);
      await runCommand("go", ["mod", "tidy"], installTask.cwd);
    }
  } else {
    note("Skipping dependency installation.");
  }

  if (plan.shouldInitializeGit) {
    info("Initializing git repository");
    await runCommand("git", ["init"], plan.destinationRoot);
  } else {
    note("Skipping git initialization.");
  }

  success("\nProject generated successfully.\n");
  for (const line of plan.summary) {
    note(`- ${line}`);
  }
  note(`- Location: ${plan.destinationRoot}`);

  if (!installDependencies) {
    warn("Remember to install dependencies in the generated app(s).");
  }
}

async function runCommand(command: string, args: string[], cwd: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command failed: ${command} ${args.join(" ")}`));
    });
  });
}
