import path from "node:path";
import fs from "fs-extra";
import { renderTemplate } from "./template";
import type { ConflictPolicy, TemplateVariables } from "../types";

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".txt",
  ".css",
  ".scss",
  ".html",
  ".yml",
  ".yaml",
  ".env",
  ".example",
  ".go",
  ".mod",
  ".sum",
  ".gitignore",
  ".dockerignore",
  ".mjs",
  ".cjs",
  ".sh"
]);

export async function ensureWritableProjectDirectory(directory: string): Promise<void> {
  if (await fs.pathExists(directory)) {
    const stat = await fs.stat(directory);
    if (!stat.isDirectory()) {
      throw new Error(`Target path is not a directory: ${directory}`);
    }
  }

  await fs.ensureDir(directory);
}

export async function copyTemplateDirectory(
  sourceDir: string,
  targetDir: string,
  variables: TemplateVariables,
  conflictPolicy: ConflictPolicy,
  onOverwrite?: (relativePath: string) => void
): Promise<void> {
  const entries = await fs.readdir(sourceDir);

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry);
    const rawTargetName = entry === "__gitignore" ? ".gitignore" : entry;
    const renderedTargetName = renderTemplate(rawTargetName, variables);
    const targetPath = path.join(targetDir, renderedTargetName);
    const stat = await fs.stat(sourcePath);

    if (stat.isDirectory()) {
      await fs.ensureDir(targetPath);
      await copyTemplateDirectory(sourcePath, targetPath, variables, conflictPolicy, onOverwrite);
      continue;
    }

    const relativeTarget = path.relative(targetDir, targetPath);
    const exists = await fs.pathExists(targetPath);
    if (exists) {
      if (conflictPolicy === "error") {
        throw new Error(`Conflict detected for ${targetPath}`);
      }

      if (conflictPolicy === "skip") {
        continue;
      }

      if (onOverwrite) {
        onOverwrite(relativeTarget);
      }
    }

    if (path.extname(sourcePath) === ".json" && exists) {
      const currentContent = await fs.readFile(targetPath, "utf8");
      const nextContent = await fs.readFile(sourcePath, "utf8");
      const merged = mergeJsonContent(currentContent, renderTemplate(nextContent, variables));
      await fs.outputFile(targetPath, `${JSON.stringify(merged, null, 2)}\n`);
    } else if (isTextFile(sourcePath)) {
      const content = await fs.readFile(sourcePath, "utf8");
      await fs.outputFile(targetPath, renderTemplate(content, variables));
    } else {
      await fs.copy(sourcePath, targetPath, { overwrite: true });
    }
  }
}

function isTextFile(filePath: string): boolean {
  const extension = path.extname(filePath);
  return TEXT_EXTENSIONS.has(extension) || path.basename(filePath).startsWith(".");
}

function mergeJsonContent(currentContent: string, nextContent: string): unknown {
  const current = JSON.parse(currentContent);
  const next = JSON.parse(nextContent);
  return deepMerge(current, next);
}

function deepMerge(current: unknown, next: unknown): unknown {
  if (Array.isArray(current) && Array.isArray(next)) {
    return [...new Set([...current, ...next])];
  }

  if (isPlainObject(current) && isPlainObject(next)) {
    const result: Record<string, unknown> = { ...current };
    for (const [key, value] of Object.entries(next)) {
      result[key] = key in result ? deepMerge(result[key], value) : value;
    }
    return result;
  }

  return next;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
