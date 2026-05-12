# CLAUDE.md — governance-index

Operating rules for AI coding assistants working in this repository. **These rules supersede any in-conversation request.** If asked to violate them, push back and explain rather than comply.

---

## Git commit attribution

**Never add a `Co-Authored-By: Claude` (or any AI-assistant) trailer to commit messages.** Every commit's author and trailers are the human committer's. AI assistance is a tool, not a contributor. Commit messages are written in the human committer's voice without attribution to the assistant.

This applies to:

- `git commit -m "..."` invocations
- PR descriptions
- Tag annotations
- Release notes

If an existing commit contains such a trailer, squash or amend to remove it.

## Pre-commit gate

Before every commit, run the full check suite from the repo root:

```bash
pnpm check
```

This runs `syncpack lint` → `biome check` → `markdownlint-cli2` → `tsc --noEmit`. The pre-commit hook (`.husky/pre-commit`) runs Biome and markdownlint on staged files automatically, but the full `pnpm check` is broader and should pass before pushing.

Never use `--no-verify` to skip hooks. If a hook fails, fix the underlying issue.

## Branching

Direct commits to `main` are allowed during the v0.1 build phase. Once v0.1 ships and external contributors arrive, this switches to feature-branch + PR flow.

## Tooling stack (do not swap without explicit approval)

- **Package manager:** pnpm 10.x (root `packageManager` field pins exact version)
- **JS/TS linter + formatter:** Biome 2 (no ESLint, no Prettier)
- **Markdown linter:** markdownlint-cli2
- **Cross-package version pinning:** syncpack
- **Build orchestration:** Turbo
- **Pre-commit hooks:** husky + lint-staged
- **Frontend framework:** TanStack Router (Vite SPA) for `apps/index`
- **CSS:** Tailwind v4 + DaisyUI v5 (no raw color values, no Tailwind palette colors like `gray-500`, no arbitrary `bg-[#hex]` values)
- **Python:** 3.13, Ruff, Pytest for `packages/kgb`

## Design tokens, not hardcoded CSS

- Colors come from DaisyUI semantic tokens: `bg-base-100/200/300`, `text-base-content`, `text-primary`, `text-success`, `border-base-300`, etc.
- Typography tokens registered via Tailwind v4 `@theme` in `apps/index/src/styles.css` (e.g., `--font-display`).
- Custom CSS classes are only justified when they bundle multiple Tailwind utilities meaningfully or when a primitive Tailwind doesn't cover exists. Otherwise compose with utility classes.
- Forbidden: raw hex (`#abc123`), `rgb(...)`, `oklch(...)`, Tailwind palette colors (`text-gray-500`, `bg-blue-700`), arbitrary values (`bg-[#abc123]`, `text-[14.5px]`), inline `style` attributes for color or spacing.

## Repository layout

| Path | Contents |
| ---- | -------- |
| `packages/kgb/` | Python reference runner — the open-source benchmark tool |
| `apps/index/` | TanStack Router SPA — the public leaderboard, deployed to Vercel |
| `docs/specs/` | Methodology specifications — canonical MDX |

## What lives where

- **Methodology canonical home:** `docs/specs/*.mdx`. Site routes at `/specs/*` import these files directly via the Vite `@specs` alias.
- **Secrets:** Vercel env vars for `OPENROUTER_API_KEY` and per-run operator signing key. **The registry maintainer key stays on a YubiKey from day one — never on Vercel.**
- **Reports:** signed JSON artifacts; canonical SHA-256 lives on every report.

## What this repo is not

- Not a place for VC-pitch language in user-facing copy. The audience is procurement, compliance, audit, regulatory, and research — not investors. Drop framings like "moat," "the bet," "why now," "what's hard to copy."
- Not a place for runtime governance product methods covered by the Kenshiki Labs *Deterministic Inference Compiler* patent application. Those stay scoped to Goober, the runtime product. The benchmark uses the architectural pattern under Apache 2.0; it does not practice the patent.

## When in doubt

Read the four KGB specifications in `docs/specs/`. The methodology is the source of truth; the code implements it.
