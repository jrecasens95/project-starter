import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import fs from "fs-extra";
import { parseInitCommandOptions } from "../src/cli/parse-init-options";
import { applyGenerationPlan } from "../src/core/apply-plan";
import { resolveGenerationPlan } from "../src/core/resolve-plan";
import { collectInitAnswers } from "../src/prompts/init";
import type { InitAnswers } from "../src/types";

function backendExpressAnswers(destinationRoot: string): InitAnswers {
  return {
    projectName: "api-sample",
    targetDirectory: destinationRoot,
    projectKind: "backend",
    backendFramework: "express",
    database: "postgres",
    frontendModules: [],
    backendModules: ["prisma", "jest"],
    sharedModules: ["git", "env.example", "github-actions"],
    installDependencies: false,
    initializeGit: false,
    conflictPolicy: "overwrite"
  };
}

test("parseInitCommandOptions reads non-interactive flags", async () => {
  const options = parseInitCommandOptions([
    "--yes",
    "--project-name",
    "my-app",
    "--project-kind",
    "fullstack",
    "--frontend-framework",
    "react-vite",
    "--backend-framework",
    "express",
    "--database",
    "supabase",
    "--frontend-modules",
    "tailwind,vitest,supabase",
    "--backend-modules",
    "prisma,jest,supabase",
    "--shared-modules",
    "git,env.example,github-actions",
    "--no-install-deps",
    "--no-git",
    "--conflict-policy",
    "skip"
  ]);

  assert.equal(options.yes, true);
  assert.equal(options.projectName, "my-app");
  assert.equal(options.projectKind, "fullstack");
  assert.equal(options.backendFramework, "express");
  assert.deepEqual(options.frontendModules, ["tailwind", "vitest", "supabase"]);
  assert.deepEqual(options.backendModules, ["prisma", "jest", "supabase"]);
  assert.equal(options.installDependencies, false);
  assert.equal(options.initializeGit, false);
  assert.equal(options.conflictPolicy, "skip");
});

test("collectInitAnswers with --yes respects backend-only defaults", async () => {
  const answers = await collectInitAnswers({
    yes: true,
    projectName: "backend-only",
    projectKind: "backend",
    backendFramework: "express",
    database: "postgres",
    backendModules: ["prisma"]
  });

  assert.ok(answers);
  assert.equal(answers?.projectKind, "backend");
  assert.equal(answers?.frontendFramework, undefined);
  assert.deepEqual(answers?.frontendModules, []);
  assert.equal(answers?.backendFramework, "express");
});

test("resolveGenerationPlan creates per-app env layers for fullstack", async () => {
  const destinationRoot = path.join(await mkdtemp(path.join(os.tmpdir(), "ps-plan-")), "workspace");
  const plan = resolveGenerationPlan({
    projectName: "full-app",
    targetDirectory: destinationRoot,
    projectKind: "fullstack",
    frontendFramework: "react-vite",
    backendFramework: "express",
    database: "supabase",
    frontendModules: ["tailwind", "supabase"],
    backendModules: ["prisma", "supabase"],
    sharedModules: ["env.example", "github-actions"],
    installDependencies: false,
    initializeGit: false,
    conflictPolicy: "overwrite"
  });

  const frontendEnvLayer = plan.layers.find((layer) => layer.id === "env.example-frontend");
  const backendEnvLayer = plan.layers.find((layer) => layer.id === "env.example-backend");

  assert.equal(frontendEnvLayer?.targetDir, path.join(destinationRoot, "apps", "web"));
  assert.equal(backendEnvLayer?.targetDir, path.join(destinationRoot, "apps", "api"));
  assert.match(plan.variables.frontendEnvBlock, /SUPABASE/);
  assert.match(plan.variables.backendEnvBlock, /SUPABASE/);
});

test("resolveGenerationPlan wires Radix UI theme wrappers for React frontends", async () => {
  const destinationRoot = path.join(await mkdtemp(path.join(os.tmpdir(), "ps-radix-")), "workspace");
  const plan = resolveGenerationPlan({
    projectName: "radix-app",
    targetDirectory: destinationRoot,
    projectKind: "frontend",
    frontendFramework: "react-vite",
    database: "none",
    frontendModules: ["radix-ui"],
    backendModules: [],
    sharedModules: ["env.example"],
    installDependencies: false,
    initializeGit: false,
    conflictPolicy: "overwrite"
  });

  assert.match(plan.variables.reactThemeImports, /@radix-ui\/themes/);
  assert.match(plan.variables.reactThemeOpen, /<Theme/);
  assert.equal(plan.layers.some((layer) => layer.id === "radix-ui"), true);
});

test("applyGenerationPlan creates backend express project with prisma and ci files", async () => {
  const destinationRoot = await mkdtemp(path.join(os.tmpdir(), "ps-express-"));
  const plan = resolveGenerationPlan(backendExpressAnswers(destinationRoot));

  await applyGenerationPlan(plan);

  assert.equal(await fs.pathExists(path.join(destinationRoot, "package.json")), true);
  assert.equal(await fs.pathExists(path.join(destinationRoot, "prisma", "schema.prisma")), true);
  assert.equal(await fs.pathExists(path.join(destinationRoot, ".github", "workflows", "ci.yml")), true);
  assert.equal(await fs.pathExists(path.join(destinationRoot, ".env.example")), true);

  const packageJson = await fs.readJson(path.join(destinationRoot, "package.json"));
  assert.equal(packageJson.dependencies.express.startsWith("^"), true);
  assert.equal(packageJson.dependencies["@prisma/client"].startsWith("^"), true);
});

test("conflict policy skip preserves user changes", async () => {
  const destinationRoot = await mkdtemp(path.join(os.tmpdir(), "ps-skip-"));
  const plan = resolveGenerationPlan(backendExpressAnswers(destinationRoot));

  await applyGenerationPlan(plan);
  await fs.writeFile(path.join(destinationRoot, "README.md"), "custom readme\n");

  await applyGenerationPlan({ ...plan, conflictPolicy: "skip" });

  const readme = await fs.readFile(path.join(destinationRoot, "README.md"), "utf8");
  assert.equal(readme, "custom readme\n");
});

test("conflict policy error fails on existing files", async () => {
  const destinationRoot = await mkdtemp(path.join(os.tmpdir(), "ps-error-"));
  const plan = resolveGenerationPlan(backendExpressAnswers(destinationRoot));

  await applyGenerationPlan(plan);

  await assert.rejects(
    () => applyGenerationPlan({ ...plan, conflictPolicy: "error" }),
    /Conflict detected/
  );
});

test("README version matrix matches template versions", async () => {
  const readme = await fs.readFile(path.join(process.cwd(), "README.md"), "utf8");
  const cliPackageJson = await fs.readJson(path.join(process.cwd(), "package.json"));
  const reactVitePackageJson = await fs.readJson(
    path.join(process.cwd(), "templates/base/frontend/react-vite/files/package.json")
  );
  const nextPackageJson = await fs.readJson(
    path.join(process.cwd(), "templates/base/frontend/nextjs/files/package.json")
  );
  const expressPackageJson = await fs.readJson(
    path.join(process.cwd(), "templates/base/backend/express/files/package.json")
  );
  const fastifyPackageJson = await fs.readJson(
    path.join(process.cwd(), "templates/base/backend/fastify/files/package.json")
  );
  const nestPackageJson = await fs.readJson(
    path.join(process.cwd(), "templates/base/backend/nestjs/files/package.json")
  );
  const tailwindPackageJson = await fs.readJson(
    path.join(process.cwd(), "templates/modules/frontend/tailwind/react-vite/files/package.json")
  );
  const reactQueryPackageJson = await fs.readJson(
    path.join(process.cwd(), "templates/modules/frontend/react-query/react-vite/files/package.json")
  );
  const radixPackageJson = await fs.readJson(
    path.join(process.cwd(), "templates/modules/frontend/radix-ui/react-vite/files/package.json")
  );
  const supabasePackageJson = await fs.readJson(
    path.join(process.cwd(), "templates/modules/shared/supabase/frontend/react-vite/files/package.json")
  );
  const prismaPackageJson = await fs.readJson(
    path.join(process.cwd(), "templates/modules/backend/prisma/express/files/package.json")
  );
  const drizzlePackageJson = await fs.readJson(
    path.join(process.cwd(), "templates/modules/backend/drizzle/express/files/package.json")
  );
  const vitestPackageJson = await fs.readJson(
    path.join(process.cwd(), "templates/modules/frontend/vitest/react-vite/files/package.json")
  );
  const jestPackageJson = await fs.readJson(
    path.join(process.cwd(), "templates/modules/backend/jest/express/files/package.json")
  );
  const goMod = await fs.readFile(
    path.join(process.cwd(), "templates/base/backend/go-fiber/files/go.mod"),
    "utf8"
  );

  const expectedMatrix = new Map<string, string>([
    ["Node.js engine for this CLI", cliPackageJson.engines.node],
    ["TypeScript in the CLI", cliPackageJson.devDependencies.typescript.replace("^", "")],
    ["React starters", `react ${reactVitePackageJson.dependencies.react.replace("^", "")}`],
    ["Vite starter", `vite ${reactVitePackageJson.devDependencies.vite.replace("^", "")}`],
    ["Next.js starter", `next ${nextPackageJson.dependencies.next.replace("^", "")}`],
    ["Go starter", `go ${extractGoVersion(goMod)}`],
    [
      "Fiber starter",
      `github.com/gofiber/fiber/v2 ${extractGoDependency(goMod, "github.com/gofiber/fiber/v2").replace(/^v/, "")}`
    ],
    ["Express starter", `express ${expressPackageJson.dependencies.express.replace("^", "")}`],
    ["Fastify starter", `fastify ${fastifyPackageJson.dependencies.fastify.replace("^", "")}`],
    ["NestJS starter", nestPackageJson.dependencies["@nestjs/common"].replace("^", "")],
    ["Tailwind module", `tailwindcss ${tailwindPackageJson.devDependencies.tailwindcss.replace("^", "")}`],
    [
      "React Query module",
      `@tanstack/react-query ${reactQueryPackageJson.dependencies["@tanstack/react-query"].replace("^", "")}`
    ],
    ["Radix UI module", `@radix-ui/themes ${radixPackageJson.dependencies["@radix-ui/themes"].replace("^", "")}`],
    ["Supabase module", `@supabase/supabase-js ${supabasePackageJson.dependencies["@supabase/supabase-js"].replace("^", "")}`],
    ["Prisma module", `prisma ${prismaPackageJson.devDependencies.prisma.replace("^", "")}`],
    ["Drizzle module", `drizzle-orm ${drizzlePackageJson.dependencies["drizzle-orm"].replace("^", "")}`],
    ["Vitest module", `vitest ${vitestPackageJson.devDependencies.vitest.replace("^", "")}`],
    ["Jest module", `jest ${jestPackageJson.devDependencies.jest.replace("^", "")}`]
  ]);

  for (const [label, version] of expectedMatrix) {
    if (label === "NestJS starter") {
      assert.match(
        readme,
        new RegExp(
          `- NestJS starter: \`@nestjs/common\`, \`@nestjs/core\`, \`@nestjs/platform-express\` \`${escapeRegExp(version)}\``
        )
      );
      continue;
    }

    assert.match(readme, new RegExp(`- ${escapeRegExp(label)}: \`${escapeRegExp(version)}\``));
  }
});

function extractGoVersion(goMod: string): string {
  const match = goMod.match(/^go\s+(.+)$/m);
  assert.ok(match);
  return match[1];
}

function extractGoDependency(goMod: string, moduleName: string): string {
  const match = goMod.match(new RegExp(`^\\s*${escapeRegExp(moduleName)}\\s+(.+)$`, "m"));
  assert.ok(match);
  return match[1];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
