import path from "node:path";
import type { BackendFramework, FrontendFramework, StackDefinition } from "../types";
import { templatesRoot } from "../utils/paths";

export const fullstackBase: StackDefinition = {
  id: "fullstack-basic",
  kind: "fullstack-base",
  sourceDir: path.join(templatesRoot, "base", "fullstack", "basic", "files"),
  description: "Simple monorepo root with apps/web and apps/api."
};

const frontendStacks: Record<FrontendFramework, StackDefinition> = {
  "react-vite": {
    id: "react-vite",
    kind: "frontend",
    framework: "react-vite",
    sourceDir: path.join(templatesRoot, "base", "frontend", "react-vite", "files"),
    description: "React + Vite base template."
  },
  nextjs: {
    id: "nextjs",
    kind: "frontend",
    framework: "nextjs",
    sourceDir: path.join(templatesRoot, "base", "frontend", "nextjs", "files"),
    description: "Next.js App Router base template."
  }
};

const backendStacks: Record<BackendFramework, StackDefinition> = {
  "go-fiber": {
    id: "go-fiber",
    kind: "backend",
    framework: "go-fiber",
    sourceDir: path.join(templatesRoot, "base", "backend", "go-fiber", "files"),
    description: "Go + Fiber API base template."
  },
  express: {
    id: "express",
    kind: "backend",
    framework: "express",
    sourceDir: path.join(templatesRoot, "base", "backend", "express", "files"),
    description: "Express + TypeScript API base template."
  },
  fastify: {
    id: "fastify",
    kind: "backend",
    framework: "fastify",
    sourceDir: path.join(templatesRoot, "base", "backend", "fastify", "files"),
    description: "Fastify + TypeScript API base template."
  },
  nestjs: {
    id: "nestjs",
    kind: "backend",
    framework: "nestjs",
    sourceDir: path.join(templatesRoot, "base", "backend", "nestjs", "files"),
    description: "NestJS API base template."
  }
};

export function getFrontendStack(framework: FrontendFramework): StackDefinition {
  return frontendStacks[framework];
}

export function getBackendStack(framework: BackendFramework): StackDefinition {
  return backendStacks[framework];
}
