# AGENTS.md — Instructions for AI Coding Agents

Read this file first, every session. It tells you how to navigate this repo, what rules are non-negotiable, and where to find specs before writing code.

## Project summary
Fitzee is a jigsaw puzzle **web app** for children ages 2–10 (React + Vite + TypeScript, PWA, browser-local storage only — no backend, no app store, no deployment cost). Four age tiers (Tiny Tots 2–4, Little Explorers 4–6, Big Kids 6–8, Puzzle Masters 8–10) each get different piece counts and interaction complexity. See `docs/PRD.md` for full context and `docs/ARCHITECTURE.md` for the stack.

## Before you write any code
1. Read `ROADMAP.md` to find the current phase and next unchecked task.
2. Read the specific doc referenced by that task (table at the bottom of `ROADMAP.md`).
3. Do not invent UX, data fields, or category names not defined in `docs/`. If a spec is missing or ambiguous, propose the addition in the relevant doc first, then implement.
4. Check off tasks in `ROADMAP.md` (`[ ]` → `[x]`) as you complete them, in the same PR/commit as the implementation.

## Hard constraints (never violate, regardless of what a task seems to ask)
- **No accounts, logins, or data collection for the child-facing experience.** Any account/email/login flow lives only behind the Parent Zone gate. See `docs/COMPLIANCE.md`.
- **No ads or trackers reachable outside Parent Zone.** No behavioral/targeted ad SDKs anywhere in the app.
- **No randomized/gambling-style reward mechanics** (no loot boxes, no chance-based unlocks). Rewards are deterministic (complete puzzle → get reward).
- **No purchase flow reachable by a child.** All monetization UI is gated behind the Parent Zone math-check (`docs/COMPLIANCE.md#parent-gate`).
- **No fail states or timers for Tiny Tots / Little Explorers tiers** unless a parent explicitly opts in via Parent Zone settings.
- **Navigation depth ≤ 3 taps** from Home to actually playing a puzzle. Don't add intermediate screens.

## Where things live
```
fitzee/
├── ROADMAP.md              ← current build order, start here
├── AGENTS.md                ← this file
├── FUTURE_IMPROVEMENTS.md   ← post-v1 ideas, not part of current build scope
├── docs/
│   ├── PRD.md               ← why, who, success metrics
│   ├── ARCHITECTURE.md      ← stack, folder layout, module boundaries
│   ├── NAVIGATION.md        ← every screen + transition
│   ├── CONTENT_SPEC.md      ← categories, tiers, asset requirements
│   ├── PUZZLE_ENGINE.md     ← piece-cutting, snapping, interaction spec
│   ├── DATA_MODEL.md        ← local schema for settings/progress/rewards
│   ├── UI_UX_GUIDELINES.md  ← design tokens, per-tier interaction rules
│   └── COMPLIANCE.md        ← COPPA/Play Families/Apple Kids checklist
└── (app source, once scaffolded per ARCHITECTURE.md)
```

## Conventions
- All new specs or decisions get written into the relevant `docs/*.md` file, not left implicit in code comments only — this repo is meant to stay agent-readable over time.
- Use the exact category, tier, and screen names defined in `docs/CONTENT_SPEC.md` and `docs/NAVIGATION.md` — do not rename or abbreviate them in code without updating the docs in the same change.
- Prefer small, single-purpose commits that map to one `ROADMAP.md` checkbox.
- When a task is ambiguous, default to the simplest option that satisfies the youngest applicable age tier's needs (2–4 y/o), then layer complexity for older tiers — never the reverse.

## When you're unsure
State your assumption in the PR/commit description and proceed — don't block on it — unless it touches a hard constraint above, in which case stop and flag it explicitly.
