# project-starter

`project-starter` is a composable CLI for bootstrapping modern development projects through an interactive questionnaire.

Instead of shipping one giant template per combination, it uses a layered architecture:

- minimal base templates for project shape
- optional modules layered on top
- deterministic composition rules
- post-generation hooks for install, git init, and summary output

That keeps the codebase maintainable today and much easier to extend tomorrow.

## Features

- Supports `frontend only`, `backend only`, and `fullstack`
- Frontend starters: `react-vite`, `nextjs`
- Backend starters: `go-fiber`, `express`, `fastify`, `nestjs`
- Data modules: `gorm`, `postgres`, `prisma`, `drizzle`, `supabase`
- Frontend modules: `tailwind`, `react-query`, `router`, `radix-ui`, `shadcn`, `vitest`, `supabase`
- Shared modules: `docker`, `docker-compose`, `vercel`, `railway`, `github-actions`, `git`, `readme`, `env.example`
- Per-app `.env.example` files instead of a single root env file
- Feature-oriented starter structures for both frontend and backend
- Non-interactive CLI flags for scripting and CI
- Conflict policies: `overwrite`, `skip`, and `error`
- Strongly typed registries for stacks and modules
- File rendering with placeholder replacement
- Post steps for dependency installation and git initialization

## Quick start

Clone the repository and install dependencies:

```bash
npm install
```

Run the CLI in development:

```bash
npm run dev -- init
```

Install the CLI globally from the local repository:

```bash
npm install -g .
project-starter init
```

Update a local global install after making changes:

```bash
npm install -g .
```

That reinstalls the current state of the repository globally, so the `project-starter`
command picks up your latest local changes.

Build the executable:

```bash
npm run build
node dist/index.js init
```

Run the generator test suite:

```bash
npm test
```

After publishing, the intended usage is:

```bash
npx project-starter init
```

## CLI usage

```bash
project-starter init
```

Example non-interactive usage:

```bash
project-starter init \
  --yes \
  --project-name my-app \
  --project-kind fullstack \
  --frontend-framework react-vite \
  --backend-framework express \
  --database postgres \
  --frontend-modules tailwind,react-query,vitest \
  --backend-modules prisma,jest \
  --shared-modules git,readme,env.example,github-actions \
  --conflict-policy overwrite
```

The interactive flow asks for:

1. Project name
2. Project mode
3. Frontend framework when applicable
4. Backend framework when applicable
5. Database choice
6. Frontend modules
7. Backend modules
8. Shared modules
9. Whether to install dependencies
10. Whether to initialize git
11. Conflict policy

## Generated layouts

### Frontend only

```txt
my-app/
  src/
    app/
    features/
    shared/
    styles/
  package.json
  .env.example
```

### Backend only

```txt
my-api/
  # go-fiber
  cmd/server
  internal/
    features/
    platform/
    server/
  # express / fastify / nestjs
  src/
    features/
    platform/
  .env.example
```

### Fullstack

```txt
my-app/
  apps/
    web/
      .env.example
    api/
      .env.example
  packages/
```

## Architecture

The project is intentionally split by responsibility:

```txt
src/
  cli/          # command entrypoints and argument parsing
  prompts/      # interactive questionnaire
  core/         # plan resolution, file application, post steps
  generators/   # orchestration layer
  modules/      # module registry
  stacks/       # framework/base registry
  types/        # shared contracts
  utils/        # filesystem, rendering, logging helpers

templates/
  base/         # minimal framework and topology templates
  modules/      # composable opt-in layers
```

Generation works in layers:

1. Resolve the project selection into a generation plan.
2. Add base layers for the chosen mode and framework(s).
3. Add module layers compatible with that selection.
4. Copy files into the destination in deterministic order.
5. Render placeholders like `{{projectName}}`.
6. Run optional post steps for Node.js and Go apps.

## Support notes

- `router` is only available for `react-vite`
- `gorm` and `go-test` are only available for `go-fiber`
- `prisma`, `drizzle`, `jest`, and backend `supabase` target Node.js backends
- `auth-jwt` is currently scaffolded for `go-fiber`, `express`, and `fastify`
- `vercel` targets frontend apps, while `railway` targets backend apps

## Current template versions

These are the versions currently used by the generated starters in this repository.
They are template defaults, so they may change over time as the project evolves.

- Node.js engine for this CLI: `>=18.17.0`
- TypeScript in the CLI: `5.8.3`
- React starters: `react 18.3.1`
- Vite starter: `vite 5.4.10`
- Next.js starter: `next 15.0.3`
- Go starter: `go 1.23.0`
- Fiber starter: `github.com/gofiber/fiber/v2 2.52.5`
- Express starter: `express 4.21.2`
- Fastify starter: `fastify 5.2.1`
- NestJS starter: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` `11.0.1`
- Tailwind module: `tailwindcss 3.4.15`
- React Query module: `@tanstack/react-query 5.59.13`
- Radix UI module: `@radix-ui/themes 3.2.1`
- Supabase module: `@supabase/supabase-js 2.49.4`
- Prisma module: `prisma 5.22.0`
- Drizzle module: `drizzle-orm 0.36.4`
- Vitest module: `vitest 2.1.8`
- Jest module: `jest 29.7.0`

If you want stricter control later, we can also add:

- a dedicated `VERSION_MATRIX.md`
- a test that asserts the documented versions match the templates
- a release checklist step to review version bumps intentionally

## Adding a new frontend or backend framework

1. Create a new template folder under `templates/base/...`.
2. Register it in `src/stacks/registry.ts`.
3. Point the stack to its source directory and default target.
4. Optionally mark incompatible modules through the module registry.

Because the generator works with typed definitions, most new frameworks only need files plus one registry entry.

## Adding a new module

1. Create a template folder under `templates/modules/...`.
2. Register it in `src/modules/registry.ts`.
3. Define which project kinds and frameworks it supports.
4. Add any post hook if the module needs follow-up steps later.

Modules can target the root, `apps/web`, or `apps/api` depending on the active mode.

## Design choices

- `prompts` keeps the questionnaire lightweight
- `fs-extra` handles recursive file operations cleanly
- `child_process.spawn` keeps post-generation shell steps dependency-light
- a small placeholder renderer avoids unnecessary template complexity in V1
- later layers override earlier ones intentionally, which lets modules augment base templates without branching the generator

## License

MIT
