# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations (gpt-5.3-codex for coding tasks)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Application: AI Code Comment Generator & Documenter

A full-stack developer tool (branded "Aegis") for AI-powered code documentation.

### Features
- **Inline Comments**: Adds line-by-line code explanations for Python, Java, C++
- **Docstrings**: Generates function/class-level docstrings in language-appropriate format
- **README**: Creates full README.md from code snippets
- **Bug Detection**: Finds bugs, edge cases, security issues with severity ratings
- **History**: Persists all generations with full input/output
- **Stats**: Usage analytics by language and mode

### Artifacts
- `artifacts/code-commenter` — React + Vite frontend (preview path: `/`)
- `artifacts/api-server` — Express 5 backend API (preview path: `/api`)

### Key Files
- `artifacts/api-server/src/routes/codegen.ts` — AI generation routes
- `lib/db/src/schema/codegen.ts` — codegen_history table schema
- `lib/api-spec/openapi.yaml` — OpenAPI contract
- `lib/integrations-openai-ai-server/` — OpenAI SDK integration package

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
