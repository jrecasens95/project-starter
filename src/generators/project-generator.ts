import { applyGenerationPlan } from "../core/apply-plan";
import { runPostGenerationSteps } from "../core/post-steps";
import { resolveGenerationPlan } from "../core/resolve-plan";
import type { InitAnswers } from "../types";

export async function generateProject(answers: InitAnswers): Promise<void> {
  const plan = resolveGenerationPlan(answers);
  await applyGenerationPlan(plan);
  await runPostGenerationSteps(plan, answers.installDependencies);
}
