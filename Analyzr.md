# Analyzr.md

_Generated: 2026-07-28_

## Project Description

A minimal currency converter web app that lets users convert between major currencies (30 supported, e.g. USD, EUR, GBP, JPY) using live exchange rates. It calls the free [Frankfurter](https://www.frankfurter.dev/) exchange-rate API directly from the browser — no API key or backend required. Target users are general end users who want a quick, no-signup currency conversion tool. The UI is a single-page app: an amount/currency input, a convert button, and a read-only result field showing the converted amount in the target currency.

## Project Layout

Single project, not a monorepo. Standard Vite + React app structure:

- `src/App.jsx` — root component, holds conversion state
- `src/components/` — `CurrencyButton.jsx`, `ConvertButton.jsx`, `Footer.jsx`, `SocialLink.jsx` (present but empty — unused/in-progress)
- `src/components/ui/` — shadcn/ui primitives (`button.jsx`, `input.jsx`, `select.jsx`) built on `radix-ui`
- `src/lib/utils.js` — `cn()` className helper (clsx + tailwind-merge)
- `public/` — static assets served as-is (`CurrencyConvertIcon.png`, `favicon.svg`, `gears.png`)
- `images/` — README screenshot only, not shipped with the app
- `.claude/skills/` and `.agents/skills/` — identical copies of the Analyzr CI/CD skill suite's own skill definitions (not part of the app itself)

## Languages & Runtimes

- JavaScript (JSX), ES modules (`"type": "module"` in `package.json`)
- React 19.2.4 (`react`, `react-dom`)
- No TypeScript — `jsconfig.json` exists only to configure the `@/*` → `./src/*` path alias for editor tooling, not type-checking
- Node.js runtime version is not pinned anywhere in the project (no `engines` field in `package.json`, no `.nvmrc`)

## Package Manager

npm, with `package-lock.json` present (`lockfileVersion: 3`). No other lockfiles (yarn/pnpm) found — single, unambiguous package manager. No workspace configuration.

## Build, Test & Lint Commands

From `package.json` scripts:
- `npm run dev` — `vite` (dev server)
- `npm run build` — `vite build`
- `npm run lint` — `eslint .`
- `npm run preview` — `vite preview`

No test script and no test framework/dependency detected anywhere in the project.

## Existing CI/CD Configuration

None found. No `.github/workflows/`, `.gitlab-ci.yml`, `azure-pipelines.yml`, or similar pipeline files exist in the project. No Dependabot/Renovate config and no pre-commit hook config (e.g. `.pre-commit-config.yaml`) found either.

Note: `.claude/skills/`, `.agents/skills/`, and `skills-lock.json` are Claude Code skill definitions for the Analyzr CI/CD skill suite itself (including this skill) — they are not CI/CD pipeline configuration for the project and should not be treated as such by downstream skills.

## Containerization

None found. No `Dockerfile`, `docker-compose.yml`, or `.dockerignore` present anywhere in the project.

## Deployment Targets

None found. No Dockerfile, Kubernetes manifests, IaC (Terraform/Pulumi/CloudFormation), or PaaS config files (e.g. `Procfile`, `app.json`) exist in the project.

## Environment Variables

None found. No `.env`/`.env.example` files are present, and no source file references `import.meta.env.*` or `process.env.*`. The Frankfurter API call in `src/components/ConvertButton.jsx` is unauthenticated and requires no key.
