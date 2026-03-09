# AGENTS.md - Operational Guide

Keep this file under 60 lines. It's loaded every iteration.

## Build Commands

```bash
npm run build          # Production build
npm run dev            # Development server
npm run preview        # Preview production build
```

## Test Commands

```bash
npm run test:run       # Run tests once
npm run test:coverage  # Coverage report
```

## Validation (run before committing)

```bash
npm run check          # Run ALL checks (typecheck, lint, format, tests)
```

## Fix Commands

```bash
npm run lint:fix       # Auto-fix ESLint issues
npm run format         # Auto-fix Prettier formatting
```

## Architecture

- TypeScript + Vite PWA
- Path aliases: `@/*` → `src/*`, `@api/*`, `@core/*`, `@utils/*`, `@config/*`, `@types/*`
- Use `Logger` from `@utils/logger` instead of console.log
- Config loaded async with Zod validation: `loadConfig()` then `getConfig()`
- Content: 36 YAML topic files in `content/` across 8 categories
- 4 audience levels: child (7-11), teenager (12-17), adult, researcher

## Project Notes

- Completion criteria: `npm run check` passes
- Content is YAML schema v1.0 — see `content/_schema.yaml`
