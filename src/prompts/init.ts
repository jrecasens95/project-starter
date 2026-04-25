import path from "node:path";
import prompts, { type Choice } from "prompts";
import type {
  BackendFramework,
  BackendModuleName,
  ConflictPolicy,
  DatabaseChoice,
  FrontendFramework,
  FrontendModuleName,
  InitAnswers,
  InitCommandOptions,
  ProjectKind,
  SharedModuleName
} from "../types";
import { toProjectSlug } from "../utils/text";

const FRONTEND_MODULE_CHOICES: Choice[] = [
  { title: "tailwind", value: "tailwind", selected: true },
  { title: "react-query", value: "react-query" },
  { title: "router", value: "router" },
  { title: "radix-ui", value: "radix-ui" },
  { title: "shadcn", value: "shadcn" },
  { title: "vitest", value: "vitest" },
  { title: "supabase", value: "supabase" }
];

const BACKEND_MODULE_CHOICES: Choice[] = [
  { title: "gorm", value: "gorm" },
  { title: "auth-jwt", value: "auth-jwt" },
  { title: "prisma", value: "prisma" },
  { title: "drizzle", value: "drizzle" },
  { title: "go-test", value: "go-test" },
  { title: "jest", value: "jest" },
  { title: "supabase", value: "supabase" }
];

const SHARED_MODULE_CHOICES: Choice[] = [
  { title: "docker", value: "docker" },
  { title: "docker-compose", value: "docker-compose" },
  { title: "git", value: "git", selected: true },
  { title: "readme", value: "readme", selected: true },
  { title: "env.example", value: "env.example", selected: true },
  { title: "vercel", value: "vercel" },
  { title: "railway", value: "railway" },
  { title: "github-actions", value: "github-actions" }
];

export async function collectInitAnswers(overrides: InitCommandOptions): Promise<InitAnswers | null> {
  prompts.override({});

  const defaults = applyDefaults(overrides);
  if (defaults.yes) {
    return normalizeAnswers(defaults);
  }

  const response = await prompts(
    [
      {
        type: defaults.projectName ? null : "text",
        name: "projectName",
        message: "Project name",
        initial: overrides.projectName ?? "my-app",
        validate: (value: string) => (value.trim() ? true : "Project name is required")
      },
      {
        type: defaults.projectKind ? null : "select",
        name: "projectKind",
        message: "Project type",
        choices: [
          { title: "frontend only", value: "frontend" },
          { title: "backend only", value: "backend" },
          { title: "fullstack", value: "fullstack" }
        ],
        initial: indexOf(["frontend", "backend", "fullstack"], overrides.projectKind)
      },
      {
        type: (_: unknown, values: Partial<InitAnswers>) =>
          defaults.frontendFramework || (values.projectKind ?? defaults.projectKind) === "backend" ? null : "select",
        name: "frontendFramework",
        message: "Frontend framework",
        choices: [
          { title: "React + Vite", value: "react-vite" },
          { title: "Next.js", value: "nextjs" }
        ],
        initial: indexOf(["react-vite", "nextjs"], overrides.frontendFramework)
      },
      {
        type: (_: unknown, values: Partial<InitAnswers>) =>
          defaults.backendFramework || (values.projectKind ?? defaults.projectKind) === "frontend" ? null : "select",
        name: "backendFramework",
        message: "Backend framework",
        choices: [
          { title: "Go + Fiber", value: "go-fiber" },
          { title: "Express", value: "express" },
          { title: "Fastify", value: "fastify" },
          { title: "NestJS", value: "nestjs" }
        ],
        initial: indexOf(["go-fiber", "express", "fastify", "nestjs"], overrides.backendFramework)
      },
      {
        type: defaults.database ? null : "select",
        name: "database",
        message: "Database",
        choices: [
          { title: "Postgres", value: "postgres" },
          { title: "Supabase", value: "supabase" },
          { title: "None", value: "none" }
        ],
        initial: indexOf(["postgres", "supabase", "none"], overrides.database)
      },
      {
        type: (_: unknown, values: Partial<InitAnswers>) =>
          defaults.frontendModules || (values.projectKind ?? defaults.projectKind) === "backend" ? null : "multiselect",
        name: "frontendModules",
        message: "Optional frontend modules",
        instructions: false,
        choices: (_prev: unknown, values: Partial<InitAnswers>) =>
          getFrontendChoices((values.frontendFramework ?? defaults.frontendFramework) as FrontendFramework | undefined),
        hint: "Space to select"
      },
      {
        type: (_: unknown, values: Partial<InitAnswers>) =>
          defaults.backendModules || (values.projectKind ?? defaults.projectKind) === "frontend" ? null : "multiselect",
        name: "backendModules",
        message: "Optional backend modules",
        instructions: false,
        choices: (_prev: unknown, values: Partial<InitAnswers>) =>
          getBackendChoices((values.backendFramework ?? defaults.backendFramework) as BackendFramework | undefined),
        hint: "Space to select"
      },
      {
        type: defaults.sharedModules ? null : "multiselect",
        name: "sharedModules",
        message: "Shared modules",
        instructions: false,
        choices: SHARED_MODULE_CHOICES,
        hint: "Space to select"
      },
      {
        type: defaults.installDependencies !== undefined ? null : "toggle",
        name: "installDependencies",
        message: "Install dependencies automatically?",
        active: "yes",
        inactive: "no",
        initial: true
      },
      {
        type: defaults.initializeGit !== undefined ? null : "toggle",
        name: "initializeGit",
        message: "Initialize git repository?",
        active: "yes",
        inactive: "no",
        initial: true
      },
      {
        type: defaults.conflictPolicy ? null : "select",
        name: "conflictPolicy",
        message: "File conflict policy",
        choices: [
          { title: "overwrite existing files", value: "overwrite" },
          { title: "skip conflicting files", value: "skip" },
          { title: "fail on first conflict", value: "error" }
        ],
        initial: 0
      }
    ],
    {
      onCancel: () => {
        throw new Error("Prompt cancelled");
      }
    }
  );

  return normalizeAnswers({
    ...defaults,
    ...response
  });
}

function applyDefaults(overrides: InitCommandOptions): InitCommandOptions {
  const withDefaults = { ...overrides };

  if (withDefaults.yes) {
    withDefaults.projectName ??= "my-app";
    withDefaults.projectKind ??= "frontend";
    if (withDefaults.projectKind !== "backend") {
      withDefaults.frontendFramework ??= "react-vite";
      withDefaults.frontendModules ??= ["tailwind"];
    }
    if (withDefaults.projectKind !== "frontend") {
      withDefaults.backendFramework ??= "go-fiber";
      withDefaults.backendModules ??= [];
    }
    withDefaults.database ??= "none";
    withDefaults.sharedModules ??= ["git", "readme", "env.example"];
    withDefaults.installDependencies ??= true;
    withDefaults.initializeGit ??= true;
    withDefaults.conflictPolicy ??= "overwrite";
  }

  return withDefaults;
}

function normalizeAnswers(input: InitCommandOptions): InitAnswers {
  const projectName = String(input.projectName).trim();
  const projectKind = input.projectKind ?? "frontend";
  const frontendFramework =
    projectKind === "backend" ? undefined : input.frontendFramework ?? "react-vite";
  const backendFramework =
    projectKind === "frontend" ? undefined : input.backendFramework ?? "go-fiber";
  const database = input.database ?? "none";
  const targetDirectory =
    input.targetDirectory ?? path.resolve(process.cwd(), toProjectSlug(projectName));

  return {
    projectName,
    targetDirectory,
    projectKind,
    frontendFramework,
    backendFramework,
    database,
    frontendModules: normalizeFrontendModules(input.frontendModules ?? [], frontendFramework, database),
    backendModules: normalizeBackendModules(input.backendModules ?? [], backendFramework, database),
    sharedModules: normalizeSharedModules(
      input.sharedModules ?? [],
      projectKind,
      Boolean(frontendFramework),
      Boolean(backendFramework)
    ),
    installDependencies: input.installDependencies ?? true,
    initializeGit: input.initializeGit ?? true,
    conflictPolicy: input.conflictPolicy ?? "overwrite"
  };
}

function getFrontendChoices(frontendFramework?: FrontendFramework): Choice[] {
  return FRONTEND_MODULE_CHOICES.filter((choice) =>
    frontendFramework === "react-vite" ? true : choice.value !== "router"
  );
}

function getBackendChoices(backendFramework?: BackendFramework): Choice[] {
  return BACKEND_MODULE_CHOICES.filter((choice) => isBackendModuleSupported(choice.value as BackendModuleName, backendFramework));
}

function normalizeFrontendModules(
  modules: FrontendModuleName[],
  frontendFramework?: FrontendFramework,
  database?: DatabaseChoice
): FrontendModuleName[] {
  if (!frontendFramework) {
    return [];
  }

  const normalized = modules.filter((moduleName) => moduleName !== "router" || frontendFramework === "react-vite");
  if (database === "supabase" && !normalized.includes("supabase")) {
    normalized.push("supabase");
  }

  return unique(normalized);
}

function normalizeBackendModules(
  modules: BackendModuleName[],
  backendFramework?: BackendFramework,
  database?: DatabaseChoice
): BackendModuleName[] {
  if (!backendFramework) {
    return [];
  }

  const normalized = modules.filter((moduleName) => isBackendModuleSupported(moduleName, backendFramework));
  if (database === "supabase" && backendFramework && backendFramework !== "go-fiber" && !normalized.includes("supabase")) {
    normalized.push("supabase");
  }
  if (database === "postgres") {
    if (normalized.includes("gorm")) {
      return unique(normalized.filter((moduleName) => moduleName !== "prisma" && moduleName !== "drizzle"));
    }
    if (normalized.includes("prisma") && normalized.includes("drizzle")) {
      return unique(normalized.filter((moduleName) => moduleName !== "drizzle"));
    }
  }

  return unique(normalized);
}

function normalizeSharedModules(
  modules: SharedModuleName[],
  projectKind: ProjectKind,
  hasFrontend: boolean,
  hasBackend: boolean
): SharedModuleName[] {
  return unique(
    modules.filter((moduleName) => {
      if (moduleName === "docker-compose") {
        return projectKind === "fullstack";
      }
      if (moduleName === "vercel") {
        return hasFrontend;
      }
      if (moduleName === "railway") {
        return hasBackend;
      }
      return true;
    })
  );
}

function isBackendModuleSupported(
  moduleName: BackendModuleName,
  backendFramework?: BackendFramework
): boolean {
  if (!backendFramework) {
    return false;
  }

  switch (moduleName) {
    case "gorm":
    case "go-test":
      return backendFramework === "go-fiber";
    case "prisma":
    case "drizzle":
    case "jest":
      return backendFramework !== "go-fiber";
    case "supabase":
      return backendFramework !== "go-fiber";
    case "auth-jwt":
      return backendFramework !== "nestjs";
    default:
      return true;
  }
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function indexOf<T>(items: readonly T[], value: T | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const index = items.indexOf(value);
  return index >= 0 ? index : undefined;
}
