import path from "node:path";
import fs from "fs-extra";
import { copyTemplateDirectory, ensureWritableProjectDirectory } from "../utils/files";
import { info, note, warn } from "../utils/logger";
import type { GenerationPlan } from "../types";

export async function applyGenerationPlan(plan: GenerationPlan): Promise<void> {
  await ensureWritableProjectDirectory(plan.destinationRoot);

  const overwrittenPaths = new Set<string>();

  for (const layer of plan.layers) {
    if (!(await fs.pathExists(layer.sourceDir))) {
      throw new Error(`Template layer not found: ${layer.sourceDir}`);
    }

    info(`Applying ${layer.kind} layer: ${layer.id}`);
    note(`  ${layer.description}`);

    await fs.ensureDir(layer.targetDir);
    await copyTemplateDirectory(
      layer.sourceDir,
      layer.targetDir,
      plan.variables,
      plan.conflictPolicy,
      (relativePath) => {
        overwrittenPaths.add(path.join(layer.targetDir, relativePath));
      }
    );
  }

  if (overwrittenPaths.size > 0) {
    warn(`Overwrote ${overwrittenPaths.size} file(s) while applying modules.`);
  }
}
