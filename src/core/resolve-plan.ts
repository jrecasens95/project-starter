import path from "node:path";
import type {
  BackendFramework,
  BackendModuleName,
  DatabaseChoice,
  FrontendFramework,
  GenerationPlan,
  InitAnswers,
  InstallTask,
  ModuleName,
  TemplateLayer,
  TemplateVariables
} from "../types";
import { getBackendStack, getFrontendStack, fullstackBase } from "../stacks/registry";
import { getModuleDefinition } from "../modules/registry";
import { toPackageName, toProjectSlug } from "../utils/text";

export function resolveGenerationPlan(answers: InitAnswers): GenerationPlan {
  const variables = buildTemplateVariables(answers);
  const layers: TemplateLayer[] = [];
  const installTasks: InstallTask[] = [];
  const summary = buildSummary(answers);

  if (answers.projectKind === "fullstack") {
    layers.push({
      id: fullstackBase.id,
      kind: "base",
      sourceDir: fullstackBase.sourceDir,
      targetDir: answers.targetDirectory,
      description: fullstackBase.description
    });
  }

  if (answers.frontendFramework) {
    const stack = getFrontendStack(answers.frontendFramework);
    const targetDir = getFrontendTargetDir(answers);
    layers.push({
      id: stack.id,
      kind: "base",
      sourceDir: stack.sourceDir,
      targetDir,
      description: stack.description
    });
    installTasks.push({ kind: "node", cwd: targetDir });
  }

  if (answers.backendFramework) {
    const stack = getBackendStack(answers.backendFramework);
    const targetDir = getBackendTargetDir(answers);
    layers.push({
      id: stack.id,
      kind: "base",
      sourceDir: stack.sourceDir,
      targetDir,
      description: stack.description
    });
    installTasks.push({
      kind: answers.backendFramework === "go-fiber" ? "go" : "node",
      cwd: targetDir
    });
  }

  for (const moduleName of resolveModuleSequence(answers)) {
    layers.push(...resolveModuleLayers(moduleName, answers));
  }

  return {
    destinationRoot: answers.targetDirectory,
    variables,
    layers,
    installTasks: uniqueInstallTasks(installTasks),
    shouldInitializeGit: answers.initializeGit,
    conflictPolicy: answers.conflictPolicy,
    summary
  };
}

function buildSummary(answers: InitAnswers): string[] {
  return [
    `Mode: ${answers.projectKind}`,
    answers.frontendFramework ? `Frontend: ${answers.frontendFramework}` : "",
    answers.backendFramework ? `Backend: ${answers.backendFramework}` : "",
    `Database: ${answers.database}`,
    answers.conflictPolicy ? `Conflicts: ${answers.conflictPolicy}` : ""
  ].filter(Boolean);
}

function buildTemplateVariables(answers: InitAnswers): TemplateVariables {
  const projectSlug = toProjectSlug(answers.projectName);
  const packageName = toPackageName(answers.projectName);
  const hasReactQuery = answers.frontendModules.includes("react-query");
  const hasRouter = answers.frontendFramework === "react-vite" && answers.frontendModules.includes("router");
  const hasRadixUi = answers.frontendModules.includes("radix-ui");
  const hasTailwind = answers.frontendModules.includes("tailwind");
  const hasShadcn = answers.frontendModules.includes("shadcn");
  const backendIsGo = answers.backendFramework === "go-fiber";
  const backendIsNode = Boolean(answers.backendFramework && !backendIsGo);
  const backendUsesPrisma = answers.backendModules.includes("prisma");
  const backendUsesDrizzle = answers.backendModules.includes("drizzle");
  const backendUsesSupabase = answers.backendModules.includes("supabase") || answers.database === "supabase";
  const backendUsesGorm = answers.backendModules.includes("gorm");
  const backendUsesAuthJwt = answers.backendModules.includes("auth-jwt");
  const frontendUsesSupabase = answers.frontendModules.includes("supabase") || answers.database === "supabase";

  return {
    projectName: answers.projectName,
    projectSlug,
    projectKind: answers.projectKind,
    frontendFramework: answers.frontendFramework ?? "none",
    backendFramework: answers.backendFramework ?? "none",
    database: answers.database,
    packageName,
    reactAppImports: buildReactAppImports(hasRouter, hasShadcn, hasRadixUi),
    reactAppBody: buildReactAppBody(hasRouter, hasShadcn, hasRadixUi),
    reactMainImports: [
      hasReactQuery ? "import { AppProviders } from \"./app/providers\";" : "",
      hasRouter ? "import { BrowserRouter } from \"react-router-dom\";" : ""
    ]
      .filter(Boolean)
      .join("\n"),
    reactProviderOpen: buildReactProviderOpen(hasReactQuery, hasRouter),
    reactProviderClose: buildReactProviderClose(hasReactQuery, hasRouter),
    reactThemeImports: hasRadixUi ? "import \"@radix-ui/themes/styles.css\";\nimport { Theme } from \"@radix-ui/themes\";" : "",
    reactThemeOpen: hasRadixUi ? "<Theme appearance=\"dark\" accentColor=\"crimson\" grayColor=\"sand\" radius=\"large\">" : "",
    reactThemeClose: hasRadixUi ? "</Theme>" : "",
    reactAppImportPath: "./app",
    nextBodyClassName: hasTailwind ? "min-h-screen bg-slate-950 text-slate-50 antialiased" : "antialiased",
    nextProvidersImport: hasReactQuery ? "import { Providers } from \"./providers\";\n" : "",
    nextProvidersOpen: hasReactQuery ? "<Providers>" : "",
    nextProvidersClose: hasReactQuery ? "</Providers>" : "",
    nextThemeImport: hasRadixUi
      ? "import \"@radix-ui/themes/styles.css\";\nimport { Theme } from \"@radix-ui/themes\";\n"
      : "",
    nextThemeOpen: hasRadixUi ? "<Theme appearance=\"dark\" accentColor=\"crimson\" grayColor=\"sand\" radius=\"large\">" : "",
    nextThemeClose: hasRadixUi ? "</Theme>" : "",
    nodeBackendImports: "",
    nodeBackendBootstrap: "",
    nodeBackendRoutesImport: "",
    nodeBackendRoutesRegistration: "",
    nodeBackendPortExpression: "process.env.PORT ?? \"4000\"",
    nodeBackendPrismaProviderImport: backendUsesPrisma ? "import { PrismaModule } from \"./platform/prisma/prisma.module\";\n" : "",
    nodeBackendPrismaProviderEntry: backendUsesPrisma ? "PrismaModule," : "",
    nodeBackendDrizzleProviderImport: backendUsesDrizzle ? "import { DrizzleModule } from \"./platform/drizzle/drizzle.module\";\n" : "",
    nodeBackendDrizzleProviderEntry: backendUsesDrizzle ? "DrizzleModule," : "",
    nodeBackendSupabaseProviderImport: backendUsesSupabase ? "import { SupabaseModule } from \"./platform/supabase/supabase.module\";\n" : "",
    nodeBackendSupabaseProviderEntry: backendUsesSupabase ? "SupabaseModule," : "",
    nodeBackendAuthModuleImport: backendUsesAuthJwt ? "import { AuthModule } from \"./features/auth/auth.module\";\n" : "",
    nodeBackendAuthModuleEntry: backendUsesAuthJwt ? "AuthModule," : "",
    backendGoModuleBlock: [
      backendUsesGorm ? "\tgorm.io/gorm v1.25.12" : "",
      backendUsesGorm && answers.database === "postgres" ? "\tgorm.io/driver/postgres v1.5.11" : "",
      backendUsesAuthJwt && backendIsGo ? "\tgithub.com/golang-jwt/jwt/v5 v5.2.1" : ""
    ]
      .filter(Boolean)
      .join("\n"),
    backendModuleImports: backendUsesGorm ? `\tdatabase "${projectSlug}/internal/platform/database"\n` : "",
    backendFeatureImports: backendUsesAuthJwt && backendIsGo ? `\tauthhttp "${projectSlug}/internal/features/auth/http"\n` : "",
    backendRouteRegistrations: backendUsesAuthJwt && backendIsGo ? "\tauthhttp.RegisterRoutes(app)\n" : "",
    backendStartupLines: backendUsesGorm ? "\tif err := database.Connect(); err != nil {\n\t\treturn nil, err\n\t}\n" : "",
    frontendEnvBlock: [
      answers.frontendFramework === "react-vite" ? "VITE_API_URL=http://localhost:4000" : "",
      answers.frontendFramework === "nextjs" ? "NEXT_PUBLIC_API_URL=http://localhost:4000" : "",
      frontendUsesSupabase ? "VITE_SUPABASE_URL=https://your-project.supabase.co" : "",
      frontendUsesSupabase ? "VITE_SUPABASE_ANON_KEY=change-me" : "",
      frontendUsesSupabase && answers.frontendFramework === "nextjs" ? "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co" : "",
      frontendUsesSupabase && answers.frontendFramework === "nextjs" ? "NEXT_PUBLIC_SUPABASE_ANON_KEY=change-me" : ""
    ]
      .filter(Boolean)
      .join("\n"),
    backendEnvBlock: [
      answers.database === "postgres"
        ? `DATABASE_URL=postgres://postgres:postgres@localhost:5432/${projectSlug}?sslmode=disable`
        : "",
      backendUsesAuthJwt ? "JWT_SECRET=change-me" : "",
      backendUsesSupabase ? "SUPABASE_URL=https://your-project.supabase.co" : "",
      backendUsesSupabase ? "SUPABASE_SERVICE_ROLE_KEY=change-me" : ""
    ]
      .filter(Boolean)
      .join("\n"),
    frontendSupabaseUrlLine:
      answers.frontendFramework === "nextjs"
        ? "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
        : "VITE_SUPABASE_URL=https://your-project.supabase.co",
    frontendSupabaseAnonKeyLine:
      answers.frontendFramework === "nextjs"
        ? "NEXT_PUBLIC_SUPABASE_ANON_KEY=change-me"
        : "VITE_SUPABASE_ANON_KEY=change-me",
    backendSupabaseUrlLine: "SUPABASE_URL=https://your-project.supabase.co",
    backendSupabaseServiceKeyLine: "SUPABASE_SERVICE_ROLE_KEY=change-me",
    frontendReadmeRunBlock: buildFrontendReadmeRunBlock(answers.frontendFramework),
    backendReadmeRunBlock: buildBackendReadmeRunBlock(answers.backendFramework),
    readmeSections: [
      answers.frontendFramework ? `- Frontend: ${answers.frontendFramework}` : "",
      answers.backendFramework ? `- Backend: ${answers.backendFramework}` : "",
      answers.database !== "none" ? `- Database: ${answers.database}` : "",
      answers.frontendModules.length ? `- Frontend modules: ${answers.frontendModules.join(", ")}` : "",
      answers.backendModules.length ? `- Backend modules: ${answers.backendModules.join(", ")}` : "",
      answers.sharedModules.length ? `- Shared modules: ${answers.sharedModules.join(", ")}` : ""
    ]
      .filter(Boolean)
      .join("\n"),
    rootPackageJson: buildRootPackageJson(answers, projectSlug)
  };
}

function buildRootPackageJson(answers: InitAnswers, projectSlug: string): string {
  if (answers.projectKind !== "fullstack") {
    return "";
  }

  const scripts: Record<string, string> = {
    "dev:web": "npm run dev --prefix apps/web",
    "build:web": "npm run build --prefix apps/web"
  };

  if (answers.backendFramework === "go-fiber") {
    scripts["dev:api"] = "go run ./apps/api/cmd/server";
    scripts["build:api"] = "go build ./apps/api/...";
    scripts["deps:api"] = "go mod tidy -C apps/api";
  } else {
    scripts["dev:api"] = "npm run dev --prefix apps/api";
    scripts["build:api"] = "npm run build --prefix apps/api";
  }

  return JSON.stringify(
    {
      name: projectSlug,
      private: true,
      version: "0.1.0",
      scripts
    },
    null,
    2
  );
}

function resolveModuleSequence(answers: InitAnswers): ModuleName[] {
  const names: ModuleName[] = [];

  if (answers.database === "postgres" && answers.backendFramework) {
    names.push("postgres");
  }

  if (answers.database === "supabase") {
    names.push("supabase");
  }

  names.push(...answers.frontendModules, ...answers.backendModules, ...answers.sharedModules);
  return unique(names);
}

function resolveModuleLayers(moduleName: ModuleName, answers: InitAnswers): TemplateLayer[] {
  if (moduleName === "env.example") {
    return resolveEnvExampleLayers(answers);
  }

  if (moduleName === "supabase") {
    return resolveSupabaseLayers(answers);
  }

  if (moduleName === "docker") {
    return resolveDockerLayers(answers);
  }

  if (moduleName === "github-actions") {
    return resolveGithubActionLayers(answers);
  }

  const definition = getModuleDefinition(moduleName);
  const sourceDir = resolveModuleSourceDir(definition.sourceDir, answers, moduleName);
  const targetDir = resolveModuleTargetDir(moduleName, answers);

  return [
    {
      id: definition.id,
      kind: "module",
      sourceDir,
      targetDir,
      description: definition.description
    }
  ];
}

function resolveModuleSourceDir(baseDir: string, answers: InitAnswers, moduleName: ModuleName): string {
  if (moduleName === "git") {
    return baseDir;
  }

  if (moduleName === "readme") {
    return path.join(baseDir, answers.projectKind, "files");
  }

  if (moduleName === "vercel") {
    return path.join(baseDir, answers.frontendFramework ?? "react-vite", "files");
  }

  if (moduleName === "railway") {
    return path.join(baseDir, answers.backendFramework ?? "go-fiber", "files");
  }

  if (moduleName === "docker-compose") {
    return path.join(baseDir, "fullstack", "files");
  }

  if (isFrontendModule(moduleName)) {
    return path.join(baseDir, answers.frontendFramework ?? "react-vite", "files");
  }

  if (isBackendModule(moduleName) || moduleName === "postgres") {
    return path.join(baseDir, answers.backendFramework ?? "go-fiber", "files");
  }

  return baseDir;
}

function resolveModuleTargetDir(moduleName: ModuleName, answers: InitAnswers): string {
  if (isFrontendModule(moduleName) || moduleName === "vercel") {
    return getFrontendTargetDir(answers);
  }

  if (isBackendModule(moduleName) || moduleName === "postgres" || moduleName === "railway") {
    return getBackendTargetDir(answers);
  }

  return answers.targetDirectory;
}

function resolveEnvExampleLayers(answers: InitAnswers): TemplateLayer[] {
  const layers: TemplateLayer[] = [];
  const definition = getModuleDefinition("env.example");

  if (answers.frontendFramework) {
    layers.push({
      id: "env.example-frontend",
      kind: "module",
      sourceDir: path.join(definition.sourceDir, "frontend", "files"),
      targetDir: getFrontendTargetDir(answers),
      description: "Adds a frontend environment example."
    });
  }

  if (answers.backendFramework) {
    layers.push({
      id: "env.example-backend",
      kind: "module",
      sourceDir: path.join(definition.sourceDir, "backend", "files"),
      targetDir: getBackendTargetDir(answers),
      description: "Adds a backend environment example."
    });
  }

  return layers;
}

function resolveSupabaseLayers(answers: InitAnswers): TemplateLayer[] {
  const layers: TemplateLayer[] = [];
  const definition = getModuleDefinition("supabase");

  if (answers.frontendFramework) {
    layers.push({
      id: `supabase-frontend-${answers.frontendFramework}`,
      kind: "module",
      sourceDir: path.join(definition.sourceDir, "frontend", answers.frontendFramework, "files"),
      targetDir: getFrontendTargetDir(answers),
      description: "Adds Supabase frontend client helpers."
    });
  }

  if (answers.backendFramework && answers.backendFramework !== "go-fiber") {
    layers.push({
      id: `supabase-backend-${answers.backendFramework}`,
      kind: "module",
      sourceDir: path.join(definition.sourceDir, "backend", answers.backendFramework, "files"),
      targetDir: getBackendTargetDir(answers),
      description: "Adds Supabase backend client helpers."
    });
  }

  return layers;
}

function resolveDockerLayers(answers: InitAnswers): TemplateLayer[] {
  const definition = getModuleDefinition("docker");
  const layers: TemplateLayer[] = [];

  if (answers.projectKind === "frontend" && answers.frontendFramework) {
    layers.push({
      id: `docker-frontend-${answers.frontendFramework}`,
      kind: "module",
      sourceDir: path.join(definition.sourceDir, "frontend", answers.frontendFramework, "files"),
      targetDir: answers.targetDirectory,
      description: "Adds Docker support for the frontend app."
    });
  }

  if (answers.projectKind === "backend" && answers.backendFramework) {
    layers.push({
      id: `docker-backend-${answers.backendFramework}`,
      kind: "module",
      sourceDir: path.join(definition.sourceDir, "backend", answers.backendFramework, "files"),
      targetDir: answers.targetDirectory,
      description: "Adds Docker support for the backend app."
    });
  }

  if (answers.projectKind === "fullstack" && answers.frontendFramework && answers.backendFramework) {
    layers.push({
      id: "docker-fullstack-root",
      kind: "module",
      sourceDir: path.join(definition.sourceDir, "fullstack", "root", "files"),
      targetDir: answers.targetDirectory,
      description: "Adds root Docker assets for the fullstack workspace."
    });
    layers.push({
      id: `docker-fullstack-web-${answers.frontendFramework}`,
      kind: "module",
      sourceDir: path.join(definition.sourceDir, "fullstack", "web", answers.frontendFramework, "files"),
      targetDir: getFrontendTargetDir(answers),
      description: "Adds Docker support for the web app."
    });
    layers.push({
      id: `docker-fullstack-api-${answers.backendFramework}`,
      kind: "module",
      sourceDir: path.join(definition.sourceDir, "fullstack", "api", answers.backendFramework, "files"),
      targetDir: getBackendTargetDir(answers),
      description: "Adds Docker support for the API app."
    });
  }

  return layers;
}

function resolveGithubActionLayers(answers: InitAnswers): TemplateLayer[] {
  const definition = getModuleDefinition("github-actions");
  const layerName =
    answers.projectKind === "fullstack"
      ? "fullstack"
      : answers.projectKind === "frontend"
        ? "frontend"
        : answers.backendFramework === "go-fiber"
          ? "backend-go"
          : "backend-node";

  return [
    {
      id: "github-actions",
      kind: "module",
      sourceDir: path.join(definition.sourceDir, layerName, "files"),
      targetDir: answers.targetDirectory,
      description: "Adds a starter GitHub Actions workflow."
    }
  ];
}

function buildFrontendReadmeRunBlock(frontendFramework?: FrontendFramework): string {
  if (!frontendFramework) {
    return "";
  }

  return ["npm install", "npm run dev"].join("\n");
}

function buildBackendReadmeRunBlock(backendFramework?: BackendFramework): string {
  switch (backendFramework) {
    case "go-fiber":
      return ["go mod tidy", "go run ./cmd/server"].join("\n");
    case "express":
    case "fastify":
    case "nestjs":
      return ["npm install", "npm run dev"].join("\n");
    default:
      return "";
  }
}

function getFrontendTargetDir(answers: InitAnswers): string {
  return answers.projectKind === "fullstack"
    ? path.join(answers.targetDirectory, "apps", "web")
    : answers.targetDirectory;
}

function getBackendTargetDir(answers: InitAnswers): string {
  return answers.projectKind === "fullstack"
    ? path.join(answers.targetDirectory, "apps", "api")
    : answers.targetDirectory;
}

function isFrontendModule(moduleName: ModuleName): boolean {
  return ["tailwind", "react-query", "router", "radix-ui", "shadcn", "vitest"].includes(moduleName);
}

function isBackendModule(moduleName: ModuleName): boolean {
  return ["gorm", "auth-jwt", "prisma", "drizzle", "go-test", "jest"].includes(moduleName);
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function uniqueInstallTasks(tasks: InstallTask[]): InstallTask[] {
  const seen = new Set<string>();
  return tasks.filter((task) => {
    const key = `${task.kind}:${task.cwd}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function buildReactAppImports(hasRouter: boolean, hasShadcn: boolean, hasRadixUi: boolean): string {
  const imports = [
    hasRouter ? "import { Link } from \"react-router-dom\";\nimport { AppRouter } from \"./router\";" : "",
    hasShadcn ? "import { Button } from \"../shared/components/ui/button\";" : "",
    hasRadixUi ? "import { Button as RadixButton, Card, Flex, Text } from \"@radix-ui/themes\";" : "",
    !hasRouter ? "import { HomePage } from \"../features/home\";" : "",
    "import { FeatureShell } from \"../shared/components\";"
  ].filter(Boolean);

  return imports.join("\n");
}

function buildReactAppBody(hasRouter: boolean, hasShadcn: boolean, hasRadixUi: boolean): string {
  if (hasRouter) {
    return `
  return (
    <FeatureShell>
      <header className="app-header">
        <div>
          <p className="eyebrow">project-starter</p>
          <h1>React + Vite starter</h1>
          <p className="hero-copy">Composable starter generated with modular layers.</p>
        </div>
        <nav className="app-nav">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      ${hasShadcn ? "<section className=\"card\"><Button>shadcn-ready button</Button></section>" : ""}
      ${
        hasRadixUi
          ? `<section className="card">
        <Card size="2">
          <Flex direction="column" gap="3">
            <Text size="3" weight="bold">Radix Themes ready</Text>
            <Text color="gray">Accessible UI primitives are now available in your starter.</Text>
            <div>
              <RadixButton>Radix button</RadixButton>
            </div>
          </Flex>
        </Card>
      </section>`
          : ""
      }
      <AppRouter />
    </FeatureShell>
  );
`.trim();
  }

  return `
  return (
    <FeatureShell>
      <HomePage />
      ${
        hasShadcn
          ? `<section className="card-grid">
        <article className="card">
          <h2>Prepared UI primitives</h2>
          <Button>shadcn-ready button</Button>
        </article>
      </section>`
          : ""
      }
      ${
        hasRadixUi
          ? `<section className="card-grid">
        <article className="card">
          <Card size="2">
            <Flex direction="column" gap="3">
              <Text size="3" weight="bold">Radix Themes ready</Text>
              <Text color="gray">Use Theme, Card, Button, Text, and the rest of the Radix surface immediately.</Text>
              <div>
                <RadixButton>Radix button</RadixButton>
              </div>
            </Flex>
          </Card>
        </article>
      </section>`
          : ""
      }
    </FeatureShell>
  );
`.trim();
}

function buildReactProviderOpen(hasReactQuery: boolean, hasRouter: boolean): string {
  const wrappers: string[] = [];
  if (hasReactQuery) {
    wrappers.push("<AppProviders>");
  }
  if (hasRouter) {
    wrappers.push("<BrowserRouter>");
  }

  return wrappers.join("\n    ");
}

function buildReactProviderClose(hasReactQuery: boolean, hasRouter: boolean): string {
  const wrappers: string[] = [];
  if (hasRouter) {
    wrappers.push("</BrowserRouter>");
  }
  if (hasReactQuery) {
    wrappers.push("</AppProviders>");
  }

  return wrappers.join("\n    ");
}
