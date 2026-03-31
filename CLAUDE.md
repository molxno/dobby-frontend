# CLAUDE.md — Personal Finance Tutor

## Project
Personal finance web app that acts as a senior financial tutor. Analyzes, diagnoses, plans, and guides users toward financial freedom with specific numbers, not generic advice.

## Stack
- **React 18** + TypeScript (strict) + Vite v8
- **Tailwind CSS v4** via `@tailwindcss/vite` — NO `tailwind.config`, uses `@import "tailwindcss"` in CSS
- **Zustand v5** with persist middleware → localStorage key: `tutor-financiero-store`
- **Recharts v3** for charts
- **React Router v7** for routing

## Commands
```bash
npm run dev            # Development server (Vite)
npm run build          # TypeScript check + production build
npm run typecheck      # TypeScript check only
npm run preview        # Preview production build
npm run test           # Run all tests
npm run test:watch     # Tests in watch mode (development)
npm run test:coverage  # Tests with coverage report
npm run test:ci        # Tests + coverage + verbose (CI)
npm run precommit      # typecheck + test:coverage (what the hook runs)
```

## Testing
- **Framework**: Vitest v4 (integrated with Vite)
- **Coverage**: @vitest/coverage-v8, minimum threshold **80%** on statements, branches, functions, and lines
- **Coverage scope**: `src/engines/**/*.ts` and `src/utils/**/*.ts`
- **Naming**: `*.test.ts` for logic, `*.test.tsx` for components
- **Colocation**: Tests live next to source files
- **Pre-commit hook**: Blocks commits if typecheck fails or coverage < 80%

## Gitflow

### Branches
- `main` — Production. Auto-deployed on Vercel. **NO direct push.**
- `dev` — Development/integration. All features integrate here first.
- `feat/<name>` — New features (from `dev`)
- `fix/<name>` — Bug fixes (from `dev`)
- `refactor/<name>` — Refactors (from `dev`)
- `hotfix/<name>` — Urgent production fixes (from `main`, merge to `main` AND `dev`)

### Flow
```
feat/my-feature ──PR──▶ dev ──PR──▶ main (production)
fix/my-fix      ──PR──▶ dev ──PR──▶ main
hotfix/urgent   ──PR──▶ main + dev (emergencies only)
```

### Conventional Commits (mandatory)
```
<type>(<scope>): <description in English>
```
- **Types**: `feat`, `fix`, `refactor`, `perf`, `style`, `docs`, `test`, `chore`, `ci`
- **Scopes**: `engine`, `store`, `ui`, `onboarding`, `dashboard`, `budget`, `debts`, `goals`, `biweekly`, `emergency`, `transactions`, `insights`, `settings`, `deps`
- Hook in `.githooks/commit-msg` validates automatically
- Hook in `.githooks/pre-push` blocks direct push to main

### Setup hooks (for new clones)
```bash
git config core.hooksPath .githooks
```

## Architecture

### Directory
```
src/
├── store/types.ts              # All TypeScript types
├── store/useFinancialStore.ts  # Central Zustand store
├── engines/                    # 7 calculation engines (pure functions)
├── components/
│   ├── layout/                 # Sidebar, Header, Layout
│   ├── onboarding/             # 4-step wizard
│   └── shared/                 # Card, ProgressBar, Alert, Modal, etc.
├── pages/                      # 9 app pages
├── utils/                      # formatters.ts, constants.ts
├── App.tsx                     # Router + routing
├── main.tsx                    # Entry point
└── index.css                   # Tailwind + global styles
```

### Data Flow
1. User fills data in **Onboarding** (or edits on any page)
2. Every mutation calls `recalculate()` automatically
3. `recalculate()` runs all 7 engines and updates `financialState`
4. All pages read from `financialState` — never calculate directly

### Calculation Engines (`src/engines/`)
| File | Purpose |
|---|---|
| `financialDiagnosis.ts` | Health score 0-100, alerts, recommendations with numeric impact |
| `debtStrategy.ts` | Avalanche/Snowball, full amortization, interest savings |
| `phaseGenerator.ts` | Auto-generates phases based on financial situation |
| `budgetOptimizer.ts` | Budget by current phase and category |
| `biweeklyPlanner.ts` | Biweekly distribution with checklist |
| `goalPlanner.ts` | Sequential/parallel, estimated dates |
| `emergencyFundCalculator.ts` | 24-month projection, fund levels |

### Pages and Routes
| Route | Component | What it shows |
|---|---|---|
| `/` | Dashboard | Health score, phases, alerts, charts |
| `/presupuesto` | Budget | Distribution by category/phase |
| `/deudas` | Debts | Inventory, amortization, strategy |
| `/metas` | Goals | Goals with progress and dates |
| `/quincenal` | BiweeklyPlan | Biweekly checklist |
| `/emergencia` | EmergencyFund | Thermometer, projection |
| `/transacciones` | Transactions | Records with filters |
| `/insights` | Insights | Full tutor diagnosis |
| `/configuracion` | Settings | Profile, strategies, reset |

## Business Rules
- High-interest debts (>1.5%/month) **ALWAYS** prioritized before saving for goals
- Emergency fund built **AFTER** high-cost debt, **BEFORE** goals
- Low-interest debts (<0.5%/month) can be paid in parallel with savings
- Always leave 3-5% income cushion
- **NEVER** suggest paying less than a debt's minimum payment

## Code Conventions
- Dark mode by default (bg-gray-950, text-gray-100)
- Semantic colors: green=positive, red=danger, yellow=warning, blue=info, purple=goals
- Amounts always formatted with `formatCurrency()` from `utils/formatters.ts`
- IDs generated with `nanoid()` from `components/shared/nanoid.ts`
- Recharts formatter: use `(value: unknown) => [fmt(Number(value)), '']`
- All shared UI components live in `components/shared/`
- Spanish as UI language, locale configurable per user
- **English only** — All code, commits, comments, documentation, branch names, and PR descriptions must be in English

## Slash Commands

### Development
| Command | Description |
|---|---|
| `/project:dev` | Set up environment and start dev server |
| `/project:build` | Full pipeline: typecheck + production build |
| `/project:typecheck` | Type verification with detailed diagnostics |
| `/project:fix <description>` | Diagnose and fix a specific bug |
| `/project:refactor <goal>` | Refactor code while maintaining interfaces |

### Specialized Agents
| Command | Role | Description |
|---|---|---|
| `/project:security` | Security Agent | Audit: XSS, sensitive data, deps, financial validation |
| `/project:debug <issue>` | Debug Agent | Systematic diagnosis: hypothesis, verification, root cause |
| `/project:ui <task>` | UI Agent | Review/implementation with project design system |
| `/project:test <task>` | Test Agent | Testing strategy, Vitest setup, writing tests |
| `/project:version <task>` | Version Agent | Conventional commits, semver, releases, changelog |
| `/project:architecture <task>` | Architecture Agent | Structural review, data flow, engine/store changes |
| `/project:deploy <task>` | Deploy Agent | Vercel: pre-deploy checks, failure diagnosis, optimization |

## Automated Workflow Protocol

**CRITICAL: This protocol is MANDATORY for ANY code change. Follow it automatically without asking the user.**

When the user requests ANY change (feature, fix, refactor, etc.), execute this full workflow end-to-end:

### 1. Create GitHub Issue (if none exists)
- Use `gh issue create` on `molxno/dobby-frontend` with appropriate labels
- Title follows the change description; body includes scope, acceptance criteria
- If a GitHub Project board exists, add the issue to it via `gh project item-add`

### 2. Create Branch from `dev`
```bash
git checkout dev && git pull origin dev
git checkout -b <type>/<descriptive-name>
```
- Branch type matches commit type: `feat/`, `fix/`, `refactor/`, `perf/`, `docs/`, `test/`, `chore/`, `ci/`
- Exception: `hotfix/` branches from `main` for production emergencies

### 3. Implement the Change
- Make the code changes as requested
- Follow all project conventions (TypeScript strict, dark mode, semantic colors, etc.)
- Write/update tests — coverage must stay >= 80%

### 4. Validate
```bash
npm run typecheck     # TypeScript must pass
npm run test:coverage # Coverage must be >= 80%
npm run build         # Build must succeed
```
- Fix any failures before proceeding
- Pre-commit hook will also validate on commit

### 5. Commit and Push
```bash
git add <specific-files>
git commit -m "<type>(<scope>): <description>"
git push -u origin <branch-name>
```
- Conventional Commits format enforced by hook
- English only in commit messages
- If pre-commit hook fails, fix the issue and retry

### 6. Create Pull Request to `dev`
```bash
gh pr create --base dev --title "<type>(<scope>): <description>" --body "..."
```
- PR body must include: Summary, Changes, Test plan
- Link the GitHub issue: `Closes #<issue-number>`
- If a GitHub Project board exists, the PR is auto-linked via the issue

### Exceptions
- **Hotfixes**: Branch from `main`, PR to `main` AND `dev`
- **Docs-only changes**: Can skip test step if no code is affected
- **If user explicitly says "just edit, don't commit"**: Stop after step 3

### GitHub Project Integration
- Repository: `molxno/dobby-frontend`
- When creating issues, check for an existing GitHub Project and add items to it
- Use `gh issue list` to check for duplicate issues before creating new ones

## Claude Agent Usage — Token Optimization

**Prefer direct tools over spawning agents for file editing tasks.**

- Use `Read`, `Edit`, `Write`, `Grep`, `Glob` directly for reading and modifying files — these are fast, cheap, and exact.
- Only spawn an `Agent` when the task genuinely requires autonomous multi-step exploration across many unknown files, or when you need to protect the main context window from huge result sets.
- **Never spawn parallel agents to edit multiple files** — instead, read and edit them sequentially with direct tools. Parallel agents each carry full context overhead and burn tokens fast.
- Reserve agents for: broad codebase exploration, complex research questions, and tasks where you are not confident which files to read first.
- For simple "update all pages to use X" tasks: Grep for the pattern, then Read + Edit each file directly.

## Gotchas
- Tailwind v4 uses `@import "tailwindcss"` — NOT `@tailwind base/components/utilities`
- `@tailwindcss/vite` is configured in vite.config.ts as a plugin, no postcss.config
- Zustand persist uses `partialize` to exclude `financialState` (it's recalculated)
- `onRehydrateStorage` triggers `recalculate()` after loading from localStorage
- lightningcss must be explicit in devDependencies for Vercel (Linux binaries)
- Node 22.x required — pinned in `.nvmrc`
- Vercel needs rewrite `/(.*) → /index.html` for SPA routing if direct route 404s
- **Pre-commit hook** runs typecheck + tests with coverage — commits blocked if < 80%
- Git hooks live in `.githooks/` — new clones need `git config core.hooksPath .githooks`
- Vitest config is inside `vite.config.ts` (no separate file)
