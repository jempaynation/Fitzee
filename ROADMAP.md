# Fitzee — Roadmap

> Jigsaw puzzle app for kids ages 2–10.
> **v1 platform: web app** (React + Vite, PWA, IndexedDB — see `docs/ARCHITECTURE.md`). No app store, no deployment cost — hosted free on Vercel/Netlify/GitHub Pages/Cloudflare Pages. Native app store deployment is a later possibility, not part of this roadmap — see `FUTURE_IMPROVEMENTS.md`.
> This file is the single source of truth for build order. Read `AGENTS.md` first for how to work in this repo, then follow phases in order below.

## Status Legend
`[ ]` not started · `[~]` in progress · `[x]` done

---

## Phase 0 — Foundations (Week 1)
Goal: project scaffolding, no puzzle logic yet.

- [x] Init React + Vite web app shell (TypeScript) — see `docs/ARCHITECTURE.md`
- [x] Set up folder structure per `docs/ARCHITECTURE.md`
- [x] Set up CI (lint + build check on push) and connect a free host (Vercel/Netlify/Cloudflare Pages/GitHub Pages) for auto-deploy previews
- [x] Set up IndexedDB layer (Dexie.js or idb) per `docs/DATA_MODEL.md`
- [x] Implement app-wide theme/design tokens per `docs/UI_UX_GUIDELINES.md`
- [x] Implement navigation shell (empty routes) per `docs/NAVIGATION.md`
- [x] Implement age-tier selection screen + IndexedDB storage of selected tier (`docs/DATA_MODEL.md#usersettings`)
- [x] Add PWA manifest + basic service worker shell (offline caching comes later, but wire the plumbing now) per `docs/ARCHITECTURE.md#pwa--offline-behavior`

**Exit criteria:** app builds and deploys to a live free-tier URL, works in desktop + mobile browser, navigates between empty placeholder screens, age tier persists across page refresh.

---

## Phase 1 — MVP Puzzle Core (Weeks 2–4)
Goal: one playable puzzle end to end.

- [x] Implement puzzle rendering engine (image sliced into N pieces) — `docs/PUZZLE_ENGINE.md`
- [x] Implement drag-and-drop + snap logic for **Tiny Tots** and **Big Kids** tiers only
- [x] Implement completion state (celebration animation + sound)
- [x] Build "My Puzzles" gallery (locally stored completed puzzles)
- [x] Ship 3 categories only: **Animals, Shapes & Colors, Vehicles** (`docs/CONTENT_SPEC.md`)
- [x] Each category: 2 puzzles per tier (Tiny Tots, Big Kids) = 12 puzzles total for MVP

**Exit criteria:** a child can pick a category → pick a puzzle → complete it → see it saved in My Puzzles, on both age tiers.

---

## Phase 2 — Parent Zone & Compliance (Week 5)
Goal: legally safe to ship to a store's kids category.

- [x] Implement Parent Zone gate (math-check gesture, see `docs/COMPLIANCE.md#parent-gate`)
- [x] Implement Parent Zone settings: age/tier override, sound toggle, screen-time reminder
- [x] Implement privacy-safe local-only data storage (no accounts required for child use)
- [x] Add COPPA / Google Play Families / Apple Kids Category checklist pass (`docs/COMPLIANCE.md`)
- [x] Add no-ads / no-behavioral-tracking guarantee in code (verify no 3rd-party trackers fire outside Parent Zone)

**Exit criteria:** app passes the compliance checklist in `docs/COMPLIANCE.md` in full.

---

## Phase 3 — Full Difficulty Range + Rewards (Weeks 6–7)
Goal: all 4 age tiers, engagement loop complete.

- [x] Add **Little Explorers** and **Puzzle Masters** tiers to puzzle engine (rotation, timer, higher piece counts)
- [x] Implement Rewards system: sticker book + star jar (`docs/DATA_MODEL.md#rewards`)
- [x] Implement reward unlock triggers (on puzzle completion, streaks)
- [x] Add remaining launch categories: Nature & Seasons, Numbers & Letters, Everyday Life, Fairy Tales & Fantasy
- [x] Populate all categories across all 4 tiers per `docs/CONTENT_SPEC.md` puzzle-count targets

**Exit criteria:** full category × tier matrix playable; rewards visibly accumulate and persist.

---

## Phase 4 — Monetization (optional, once validated)
Goal: sustainable revenue model, still compliant, still zero/low-cost to run.

- [ ] Decide whether monetization is even needed yet — a free web app has no store fees to recoup, so this phase can be deferred indefinitely or skipped in favor of just growing usage first.
- [ ] If pursuing it: integrate a web payment provider (e.g., Stripe Checkout) for a one-time "supporter unlock" or subscription — avoids app-store cuts (15–30%) entirely since there's no store involved.
- [ ] Implement paywall gated behind Parent Zone only (`docs/COMPLIANCE.md#monetization`)
- [ ] Free tier: Phase 1 MVP categories permanently free
- [ ] Premium tier: unlocks remaining categories + Holidays seasonal packs
- [ ] No third-party payment integration that requires collecting child data — payment/email collection happens only inside Parent Zone

**Exit criteria:** purchase flow only reachable via Parent Zone; no dark patterns; works entirely within the web app with no store dependency.

---

## Phase 5 — Seasonal & Polish (Ongoing)
- [x] Holidays & Seasonal rotating category (content refresh calendar)
- [x] Localization pass (audio narration + UI, no-read UI already language-agnostic)
- [x] Accessibility pass (larger touch targets option, color-blind-safe palettes, VoiceOver/TalkBack)
- [x] Performance pass on low-end tablets

---

## Non-Goals (explicitly out of scope for v1)
- Multiplayer / social features
- User-generated content / photo-to-puzzle uploads
- Behavioral/targeted advertising
- Any real-money mechanics resembling loot boxes or randomized rewards
- Native app store deployment (iOS/Android) — see `FUTURE_IMPROVEMENTS.md` for this as a later option
- Any backend/server or cloud sync — v1 is entirely client-side and free to host

---

## Reference docs
| Doc | Purpose |
|---|---|
| `AGENTS.md` | How an AI coding agent should work in this repo |
| `docs/PRD.md` | Product requirements, audience, success metrics |
| `docs/ARCHITECTURE.md` | Tech stack, folder structure, module boundaries |
| `docs/NAVIGATION.md` | Full navigation map and screen inventory |
| `docs/CONTENT_SPEC.md` | Categories, tiers, puzzle count targets, asset specs |
| `docs/PUZZLE_ENGINE.md` | Puzzle-piece generation and interaction logic spec |
| `docs/DATA_MODEL.md` | Local data schema (settings, progress, rewards) |
| `docs/UI_UX_GUIDELINES.md` | Design tokens, interaction rules per age tier |
| `docs/COMPLIANCE.md` | COPPA / web privacy checklist (+ future app-store notes) |
| `FUTURE_IMPROVEMENTS.md` | Post-v1 feature ideas and platform expansion paths |
