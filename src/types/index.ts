export type ProjectKind = "frontend" | "backend" | "fullstack";
export type FrontendFramework = "react-vite" | "nextjs";
export type BackendFramework = "go-fiber" | "express" | "fastify" | "nestjs";
export type DatabaseChoice = "postgres" | "supabase" | "none";
export type FrontendModuleName =
  | "tailwind"
  | "react-query"
  | "router"
  | "radix-ui"
  | "shadcn"
  | "vitest"
  | "supabase";
export type BackendModuleName =
  | "gorm"
  | "auth-jwt"
  | "prisma"
  | "drizzle"
  | "go-test"
  | "jest"
  | "supabase";
export type SharedModuleName =
  | "docker"
  | "docker-compose"
  | "git"
  | "readme"
  | "env.example"
  | "vercel"
  | "railway"
  | "github-actions";
export type ModuleName = FrontendModuleName | BackendModuleName | SharedModuleName | "postgres";
export type Surface = "frontend" | "backend" | "shared";
export type ConflictPolicy = "overwrite" | "skip" | "error";

export interface InitAnswers {
  projectName: string;
  targetDirectory: string;
  projectKind: ProjectKind;
  frontendFramework?: FrontendFramework;
  backendFramework?: BackendFramework;
  database: DatabaseChoice;
  frontendModules: FrontendModuleName[];
  backendModules: BackendModuleName[];
  sharedModules: SharedModuleName[];
  installDependencies: boolean;
  initializeGit: boolean;
  conflictPolicy: ConflictPolicy;
}

export interface TemplateLayer {
  id: string;
  kind: "base" | "module";
  sourceDir: string;
  targetDir: string;
  description: string;
}

export interface StackDefinition {
  id: string;
  kind: ProjectKind | "fullstack-base";
  framework?: FrontendFramework | BackendFramework;
  sourceDir: string;
  description: string;
}

export interface ModuleDefinition {
  id: ModuleName;
  surface: Surface;
  sourceDir: string;
  description: string;
  supportedProjectKinds: ProjectKind[];
  supportedFrontendFrameworks?: FrontendFramework[];
  supportedBackendFrameworks?: BackendFramework[];
}

export interface GenerationPlan {
  destinationRoot: string;
  variables: TemplateVariables;
  layers: TemplateLayer[];
  installTasks: InstallTask[];
  shouldInitializeGit: boolean;
  conflictPolicy: ConflictPolicy;
  summary: string[];
}

export interface InstallTask {
  kind: "node" | "go";
  cwd: string;
}

export interface TemplateVariables {
  projectName: string;
  projectSlug: string;
  projectKind: ProjectKind;
  frontendFramework: string;
  backendFramework: string;
  database: DatabaseChoice;
  packageName: string;
  reactAppImports: string;
  reactAppBody: string;
  reactMainImports: string;
  reactProviderOpen: string;
  reactProviderClose: string;
  reactThemeImports: string;
  reactThemeOpen: string;
  reactThemeClose: string;
  reactAppImportPath: string;
  nextBodyClassName: string;
  nextProvidersImport: string;
  nextProvidersOpen: string;
  nextProvidersClose: string;
  nextThemeImport: string;
  nextThemeOpen: string;
  nextThemeClose: string;
  nodeBackendImports: string;
  nodeBackendBootstrap: string;
  nodeBackendRoutesImport: string;
  nodeBackendRoutesRegistration: string;
  nodeBackendPortExpression: string;
  nodeBackendPrismaProviderImport: string;
  nodeBackendPrismaProviderEntry: string;
  nodeBackendDrizzleProviderImport: string;
  nodeBackendDrizzleProviderEntry: string;
  nodeBackendSupabaseProviderImport: string;
  nodeBackendSupabaseProviderEntry: string;
  nodeBackendAuthModuleImport: string;
  nodeBackendAuthModuleEntry: string;
  backendGoModuleBlock: string;
  backendModuleImports: string;
  backendFeatureImports: string;
  backendRouteRegistrations: string;
  backendStartupLines: string;
  frontendEnvBlock: string;
  backendEnvBlock: string;
  frontendSupabaseUrlLine: string;
  frontendSupabaseAnonKeyLine: string;
  backendSupabaseUrlLine: string;
  backendSupabaseServiceKeyLine: string;
  frontendReadmeRunBlock: string;
  backendReadmeRunBlock: string;
  readmeSections: string;
  rootPackageJson: string;
}

export interface InitCommandOptions {
  projectName?: string;
  targetDirectory?: string;
  projectKind?: ProjectKind;
  frontendFramework?: FrontendFramework;
  backendFramework?: BackendFramework;
  database?: DatabaseChoice;
  frontendModules?: FrontendModuleName[];
  backendModules?: BackendModuleName[];
  sharedModules?: SharedModuleName[];
  installDependencies?: boolean;
  initializeGit?: boolean;
  conflictPolicy?: ConflictPolicy;
  yes?: boolean;
}
