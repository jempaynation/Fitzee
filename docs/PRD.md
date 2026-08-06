# PRD — Fitzee

## Problem
Parents want screen time for young kids (2–10) to feel constructive, not passive. Jigsaw puzzles are a trusted, low-stimulation, skill-building activity, but physical puzzles are hard to travel with and hard to size correctly across a wide age range (esp. siblings). No digital puzzle app cleanly spans toddler through pre-teen with age-appropriate difficulty in one place.

## Target users
- **Primary user (player):** children 2–10 years old, spanning pre-verbal/pre-reading to independent readers.
- **Primary buyer/gatekeeper:** parents/guardians, who install, configure, and pay.
- **Secondary use case:** sibling households where one app needs to serve multiple ages at once.

## Product principles
1. **Age-tier everything.** Difficulty, UI complexity, and even navigation patience level differ by tier — never ship a single one-size UX.
2. **No-read UI by default.** A 2-year-old can't read. Icons and audio cues carry the experience; text is supplementary.
3. **Parent has control, child has freedom.** Child-facing settings are limited to
   sound effects, music, narration, and language as defined in
   `docs/NAVIGATION.md`; difficulty, purchases, data controls, and external links
   stay behind the Parent Zone gate.
4. **No punishment mechanics.** No fail states, no shame animations, unlimited retries for younger tiers.
5. **Educational framing.** Categories double as learning themes (shapes, letters, numbers, animals) — this is both a differentiator and what parents look for.

## Age tiers (canonical — referenced by all other docs)
| Tier ID | Name | Ages | Pieces | Rotation | Timer |
|---|---|---|---|---|---|
| `tiny_tots` | Tiny Tots | 2–4 | 2–6 | No | Never |
| `little_explorers` | Little Explorers | 4–6 | 6–15 | No | Never |
| `big_kids` | Big Kids | 6–8 | 15–40 | Optional | Optional |
| `puzzle_masters` | Puzzle Masters | 8–10 | 40–100+ | Required | Default on |

## Success metrics (for MVP validation, Phase 1)
- **Session completion rate:** % of started puzzles that reach completion (target >80% for `tiny_tots`/`little_explorers` — low completion signals difficulty mismatch or bad UX).
- **Return rate:** % of sessions that are not the child's first (D1/D7 retention).
- **Time-to-first-puzzle:** seconds from app open to first piece placed (target <20s — measures navigation friction).
- **Parent Zone conversion:** % of installs that ever open Parent Zone (signals whether parents feel in control).

These are directional for MVP testing, not tied to a specific analytics vendor — see `docs/COMPLIANCE.md` for constraints on what may be measured and how.

## Explicit non-goals (v1)
- No multiplayer, chat, or any child-to-child interaction surface.
- No user-generated/uploaded photo content in v1 (revisit post-MVP with strict moderation plan).
- No behavioral advertising, ever, in any version.
- No social sharing that exposes a child's identity or activity externally.

## Open questions (flag if encountered, don't silently resolve)
- Exact subscription price point — deferred to Phase 4, business decision not engineering decision.
- Whether to support offline-only mode permanently vs. requiring first-launch download — affects `docs/ARCHITECTURE.md` asset strategy.
