# UI/UX Guidelines — Fitzee

## Design tokens (Phase 0 baseline)

The app uses self-hosted system fonts so opening Fitzee never contacts a font CDN.
All values below are exposed as CSS custom properties in `src/core/theme/tokens.css`.

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#9C2F5F` | Primary actions and active navigation |
| `--color-primary-strong` | `#722044` | Pressed primary actions |
| `--color-secondary` | `#176B74` | Supporting actions and accents |
| `--color-secondary-strong` | `#0E5158` | Pressed secondary actions |
| `--color-success` | `#26734D` | Positive feedback only |
| `--color-background` | `#FFF7E8` | Warm, low-saturation app background |
| `--color-surface` | `#FFFFFF` | Cards and navigation surfaces |
| `--color-text` | `#2C2330` | Main text and icons |
| `--color-text-muted` | `#625866` | Supporting text |
| `--color-focus` | `#4F46C8` | Keyboard focus ring |
| `--color-border` | `#D8CDD7` | Neutral outlines and separators |

- Child-facing type uses `ui-rounded`, system sans-serif fallbacks, and a minimum
  body size of `18px`; Parent Zone may use `16px`, but no text is smaller.
- Spacing follows an 8px rhythm: `4px`, `8px`, `16px`, `24px`, `32px`, `48px`.
- The base touch target is `48px`. `tiny_tots` and `little_explorers` controls
  use at least `64px` through tier-specific shell classes.
- Corners use `16px`, `24px`, or a fully rounded pill. Shadows stay soft and
  low-contrast so controls are distinguished by shape and outline as well as depth.
- Friendly motion uses `220ms cubic-bezier(0.2, 0.8, 0.2, 1.15)`. Respect
  `prefers-reduced-motion: reduce` by removing non-essential movement.
- Every navigable action has an icon. Text labels remain visible in Phase 0 for
  all tiers while audio narration assets are not yet available.

## v1 localization and accessibility baseline

- Child-facing navigation, catalog, puzzle, completion, gallery, rewards, and
  settings copy is available in English (`en`) and Filipino (`fil`). Automatic
  spoken voice instructions on puzzle selection have been removed so selecting
  puzzles enters play silently without speech synthesis overlay; narration controls
  and asset key mappings remain preserved as progressive enhancement.
- Parent Zone privacy/legal copy remains English pending professional legal
  translation. The language selector makes this scope explicit.
- A visible “Bigger buttons” setting applies 64px minimum child-facing targets.
- Semantic headings, landmarks, links, buttons, form labels, live progress, and
  dialog roles support VoiceOver/TalkBack and keyboard input. Forced-colors and
  increased-contrast media queries preserve boundaries without relying on color.

## Per-tier UI complexity

| Tier | UI density | Text usage | Feedback style |
|---|---|---|---|
| `tiny_tots` | Minimal — one clear action per screen | None required; audio narration carries everything | Big, slow, exaggerated animations; cheerful sound on every success |
| `little_explorers` | Low — simple grids, big icons | Optional short labels | Similar to tiny_tots, slightly faster pacing |
| `big_kids` | Moderate — can handle lists, optional stats | Labels expected, short sentences fine | Standard feedback, can include subtle progress indicators (stars, %) |
| `puzzle_masters` | Full — timers, leaderboards, settings toggles visible | Full text fine | Can include numeric scores, times, achievement badges |

## Motion & sound
- All animations should feel bouncy/organic (ease-out, slight overshoot) rather than sharp/linear — reads as "friendly" to young children.
- Every success action (piece snap, puzzle complete, reward unlock) has a matching short audio cue — audio and visual feedback must always fire together, never one without the other.
- No animation or sound should imply failure, loss, or negative judgment, at any tier. "Try again!" framing only — never "wrong" or error tones.
- All sound must be individually toggleable (music vs. sound effects vs. narration) in `settings` (see `docs/NAVIGATION.md`).

### v1 music decision

Fitzee's background music is a quiet, locally synthesized Web Audio melody. It
contains no downloaded media or remote request, starts only after a browser-approved
user gesture, and stops immediately when the separate Music toggle is disabled.
Sound effects and speech-synthesis narration remain independently controlled.

## Color & contrast rules
- Never rely on red/green alone to indicate success/failure (color-blind accessibility) — pair with shape/icon/motion.
- Background colors must maintain WCAG AA contrast with all text and icons layered on top.

## Content tone
- Warm, encouraging, curious — narration and any copy should sound like a friendly guide, not an instructor or evaluator.
- Never use scoring language that could feel like judgment for `tiny_tots`/`little_explorers` (no "you failed," no numeric grading visible to these tiers).

## Parent-facing screens (Parent Zone) — different rules apply
- Parent Zone screens (`docs/NAVIGATION.md`) can use denser, standard adult-app UI conventions (smaller text OK, more information density, standard iOS/Android patterns) since the audience shifts to adults.
- Still maintain overall brand visual language (colors, type) for consistency, but layout rules above (giant touch targets, no-read UI) do not apply here.
