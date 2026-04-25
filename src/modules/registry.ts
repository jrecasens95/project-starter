import path from "node:path";
import type { ModuleDefinition, ModuleName } from "../types";
import { templatesRoot } from "../utils/paths";

const moduleDefinitions: Record<ModuleName, ModuleDefinition> = {
  tailwind: {
    id: "tailwind",
    surface: "frontend",
    sourceDir: path.join(templatesRoot, "modules", "frontend", "tailwind"),
    description: "Adds Tailwind CSS setup.",
    supportedProjectKinds: ["frontend", "fullstack"],
    supportedFrontendFrameworks: ["react-vite", "nextjs"]
  },
  "react-query": {
    id: "react-query",
    surface: "frontend",
    sourceDir: path.join(templatesRoot, "modules", "frontend", "react-query"),
    description: "Adds TanStack Query provider scaffolding.",
    supportedProjectKinds: ["frontend", "fullstack"],
    supportedFrontendFrameworks: ["react-vite", "nextjs"]
  },
  router: {
    id: "router",
    surface: "frontend",
    sourceDir: path.join(templatesRoot, "modules", "frontend", "router"),
    description: "Adds React Router setup for React + Vite.",
    supportedProjectKinds: ["frontend", "fullstack"],
    supportedFrontendFrameworks: ["react-vite"]
  },
  "radix-ui": {
    id: "radix-ui",
    surface: "frontend",
    sourceDir: path.join(templatesRoot, "modules", "frontend", "radix-ui"),
    description: "Adds Radix Themes to the frontend app.",
    supportedProjectKinds: ["frontend", "fullstack"],
    supportedFrontendFrameworks: ["react-vite", "nextjs"]
  },
  shadcn: {
    id: "shadcn",
    surface: "frontend",
    sourceDir: path.join(templatesRoot, "modules", "frontend", "shadcn"),
    description: "Adds a lightweight shadcn-ready component structure.",
    supportedProjectKinds: ["frontend", "fullstack"],
    supportedFrontendFrameworks: ["react-vite", "nextjs"]
  },
  vitest: {
    id: "vitest",
    surface: "frontend",
    sourceDir: path.join(templatesRoot, "modules", "frontend", "vitest"),
    description: "Adds Vitest setup and a starter test.",
    supportedProjectKinds: ["frontend", "fullstack"],
    supportedFrontendFrameworks: ["react-vite", "nextjs"]
  },
  supabase: {
    id: "supabase",
    surface: "shared",
    sourceDir: path.join(templatesRoot, "modules", "shared", "supabase"),
    description: "Adds Supabase client and environment scaffolding.",
    supportedProjectKinds: ["frontend", "backend", "fullstack"],
    supportedFrontendFrameworks: ["react-vite", "nextjs"],
    supportedBackendFrameworks: ["express", "fastify", "nestjs"]
  },
  gorm: {
    id: "gorm",
    surface: "backend",
    sourceDir: path.join(templatesRoot, "modules", "backend", "gorm"),
    description: "Adds GORM database bootstrapping.",
    supportedProjectKinds: ["backend", "fullstack"],
    supportedBackendFrameworks: ["go-fiber"]
  },
  postgres: {
    id: "postgres",
    surface: "backend",
    sourceDir: path.join(templatesRoot, "modules", "backend", "postgres"),
    description: "Adds PostgreSQL env configuration.",
    supportedProjectKinds: ["backend", "fullstack"],
    supportedBackendFrameworks: ["go-fiber"]
  },
  "auth-jwt": {
    id: "auth-jwt",
    surface: "backend",
    sourceDir: path.join(templatesRoot, "modules", "backend", "auth-jwt"),
    description: "Adds a simple JWT auth helper and route.",
    supportedProjectKinds: ["backend", "fullstack"],
    supportedBackendFrameworks: ["go-fiber", "express", "fastify"]
  },
  prisma: {
    id: "prisma",
    surface: "backend",
    sourceDir: path.join(templatesRoot, "modules", "backend", "prisma"),
    description: "Adds Prisma schema, client, and scripts.",
    supportedProjectKinds: ["backend", "fullstack"],
    supportedBackendFrameworks: ["express", "fastify", "nestjs"]
  },
  drizzle: {
    id: "drizzle",
    surface: "backend",
    sourceDir: path.join(templatesRoot, "modules", "backend", "drizzle"),
    description: "Adds Drizzle ORM config and starter schema.",
    supportedProjectKinds: ["backend", "fullstack"],
    supportedBackendFrameworks: ["express", "fastify", "nestjs"]
  },
  "go-test": {
    id: "go-test",
    surface: "backend",
    sourceDir: path.join(templatesRoot, "modules", "backend", "go-test"),
    description: "Adds a sample Go test.",
    supportedProjectKinds: ["backend", "fullstack"],
    supportedBackendFrameworks: ["go-fiber"]
  },
  jest: {
    id: "jest",
    surface: "backend",
    sourceDir: path.join(templatesRoot, "modules", "backend", "jest"),
    description: "Adds Jest testing for Node.js backends.",
    supportedProjectKinds: ["backend", "fullstack"],
    supportedBackendFrameworks: ["express", "fastify", "nestjs"]
  },
  docker: {
    id: "docker",
    surface: "shared",
    sourceDir: path.join(templatesRoot, "modules", "shared", "docker"),
    description: "Adds Docker support.",
    supportedProjectKinds: ["frontend", "backend", "fullstack"]
  },
  "docker-compose": {
    id: "docker-compose",
    surface: "shared",
    sourceDir: path.join(templatesRoot, "modules", "shared", "docker-compose"),
    description: "Adds a docker-compose stack for fullstack projects.",
    supportedProjectKinds: ["fullstack"]
  },
  git: {
    id: "git",
    surface: "shared",
    sourceDir: path.join(templatesRoot, "modules", "shared", "git", "all", "files"),
    description: "Adds a starter .gitignore layer.",
    supportedProjectKinds: ["frontend", "backend", "fullstack"]
  },
  readme: {
    id: "readme",
    surface: "shared",
    sourceDir: path.join(templatesRoot, "modules", "shared", "readme"),
    description: "Adds a generated README.",
    supportedProjectKinds: ["frontend", "backend", "fullstack"]
  },
  "env.example": {
    id: "env.example",
    surface: "shared",
    sourceDir: path.join(templatesRoot, "modules", "shared", "env"),
    description: "Adds environment example files.",
    supportedProjectKinds: ["frontend", "backend", "fullstack"]
  },
  vercel: {
    id: "vercel",
    surface: "shared",
    sourceDir: path.join(templatesRoot, "modules", "shared", "vercel"),
    description: "Adds Vercel deployment configuration.",
    supportedProjectKinds: ["frontend", "fullstack"],
    supportedFrontendFrameworks: ["react-vite", "nextjs"]
  },
  railway: {
    id: "railway",
    surface: "shared",
    sourceDir: path.join(templatesRoot, "modules", "shared", "railway"),
    description: "Adds Railway deployment configuration.",
    supportedProjectKinds: ["backend", "fullstack"],
    supportedBackendFrameworks: ["go-fiber", "express", "fastify", "nestjs"]
  },
  "github-actions": {
    id: "github-actions",
    surface: "shared",
    sourceDir: path.join(templatesRoot, "modules", "shared", "github-actions"),
    description: "Adds CI workflow templates.",
    supportedProjectKinds: ["frontend", "backend", "fullstack"]
  }
};

export function getModuleDefinition(name: ModuleName): ModuleDefinition {
  return moduleDefinitions[name];
}
