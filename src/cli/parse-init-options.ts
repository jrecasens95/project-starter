import path from "node:path";
import type {
  BackendFramework,
  BackendModuleName,
  ConflictPolicy,
  DatabaseChoice,
  FrontendFramework,
  FrontendModuleName,
  InitCommandOptions,
  ProjectKind,
  SharedModuleName
} from "../types";
import { toProjectSlug } from "../utils/text";

const BOOLEAN_FLAGS = new Set(["yes", "install-deps", "no-install-deps", "git", "no-git"]);

export function parseInitCommandOptions(args: string[]): InitCommandOptions {
  const raw = parseArgv(args);
  const projectName = getString(raw, "project-name");

  return {
    yes: getBoolean(raw, "yes"),
    projectName,
    targetDirectory: getString(raw, "target-dir")
      ? path.resolve(getString(raw, "target-dir")!)
      : projectName
        ? path.resolve(process.cwd(), toProjectSlug(projectName))
        : undefined,
    projectKind: getEnum<ProjectKind>(raw, "project-kind", ["frontend", "backend", "fullstack"]),
    frontendFramework: getEnum<FrontendFramework>(raw, "frontend-framework", ["react-vite", "nextjs"]),
    backendFramework: getEnum<BackendFramework>(raw, "backend-framework", [
      "go-fiber",
      "express",
      "fastify",
      "nestjs"
    ]),
    database: getEnum<DatabaseChoice>(raw, "database", ["postgres", "supabase", "none"]),
    frontendModules: getList<FrontendModuleName>(raw, "frontend-modules"),
    backendModules: getList<BackendModuleName>(raw, "backend-modules"),
    sharedModules: getList<SharedModuleName>(raw, "shared-modules"),
    installDependencies: resolveBooleanFlag(raw, "install-deps", "no-install-deps"),
    initializeGit: resolveBooleanFlag(raw, "git", "no-git"),
    conflictPolicy: getEnum<ConflictPolicy>(raw, "conflict-policy", ["overwrite", "skip", "error"])
  };
}

function parseArgv(args: string[]): Record<string, string | boolean> {
  const result: Record<string, string | boolean> = {};

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = args[index + 1];

    if (BOOLEAN_FLAGS.has(key) || !next || next.startsWith("--")) {
      result[key] = true;
      continue;
    }

    result[key] = next;
    index += 1;
  }

  return result;
}

function getString(raw: Record<string, string | boolean>, key: string): string | undefined {
  const value = raw[key];
  return typeof value === "string" ? value : undefined;
}

function getBoolean(raw: Record<string, string | boolean>, key: string): boolean | undefined {
  const value = raw[key];
  return typeof value === "boolean" ? value : undefined;
}

function resolveBooleanFlag(
  raw: Record<string, string | boolean>,
  positiveKey: string,
  negativeKey: string
): boolean | undefined {
  if (raw[positiveKey] === true) {
    return true;
  }

  if (raw[negativeKey] === true) {
    return false;
  }

  return undefined;
}

function getEnum<T extends string>(
  raw: Record<string, string | boolean>,
  key: string,
  allowed: readonly T[]
): T | undefined {
  const value = getString(raw, key);
  if (!value) {
    return undefined;
  }

  return allowed.includes(value as T) ? (value as T) : undefined;
}

function getList<T extends string>(raw: Record<string, string | boolean>, key: string): T[] | undefined {
  const value = getString(raw, key);
  if (!value) {
    return undefined;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean) as T[];
}
