import { yellow } from "kolorist";
import { collectInitAnswers } from "../../prompts/init";
import { generateProject } from "../../generators/project-generator";
import type { InitCommandOptions } from "../../types";

export async function runInitCommand(options: InitCommandOptions): Promise<void> {
  try {
    const answers = await collectInitAnswers(options);
    if (!answers) {
      return;
    }

    await generateProject(answers);
  } catch (error) {
    if (error instanceof Error && error.message === "Prompt cancelled") {
      console.log(yellow("Initialization cancelled."));
      return;
    }

    throw error;
  }
}
