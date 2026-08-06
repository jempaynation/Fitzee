# Data Model — Fitzee

All data below is **local-only** for v1 (see `docs/ARCHITECTURE.md` — no backend, no accounts for children). Stored in the browser via **IndexedDB** (through `data/db/`), accessed only through `data/repositories/`. Nothing here should ever use `localStorage`/`sessionStorage` directly for these records — IndexedDB is required for structured data and larger storage limits.

Phase 0 uses database name `fitzee`, schema version `1`, and four object stores:
`user_settings` (singleton key `device`), `puzzle_progress` (keyed by
`puzzle_id`), `rewards` (keyed by `reward_id`), and `parent_zone_state`
(singleton key `device`). Repository calls fall back to in-memory values if the
browser blocks IndexedDB; this keeps the current session usable without claiming
that restricted storage will persist after a refresh.

Note on browser storage: private/incognito windows and some browser settings can clear or restrict IndexedDB. Progress/rewards can legitimately be lost in these cases — the app should degrade gracefully (no crashes, just an empty-state "start fresh"), and this is an acceptable v1 limitation, not a bug to over-engineer around. A "how to keep your progress" tip in Parent Zone (e.g., don't use private browsing, or install as PWA) is a reasonable low-cost mitigation.

## UserSettings
Single record per device (no multi-profile in v1 unless flagged as a later addition).

```json
{
  "active_tier_id": "big_kids",
  "tier_source": "parent_override" | "onboarding_selection",
  "sound_enabled": true,
  "music_enabled": true,
  "narration_enabled": true,
  "language": "en",
  "large_touch_targets_enabled": false,
  "big_kids_rotation_enabled": false,
  "big_kids_timer_enabled": false,
  "screen_time_reminder_minutes": null,
  "onboarding_completed": true
}
```

- `active_tier_id`: one of the four canonical tier IDs (`docs/PRD.md`).
- `tier_source`: tracks whether current tier came from onboarding or a parent override, for support/debugging — not shown to the child.
- `sound_enabled`, `music_enabled`, and `narration_enabled` are separate because
  `docs/UI_UX_GUIDELINES.md` requires each audio channel to be independently
  toggleable.
- `language` is `en` (English) or `fil` (Filipino) for the v1 child-facing UI
  and narration prompts. Parent Zone legal/privacy copy remains English until a
  professionally reviewed translation is available.
- `large_touch_targets_enabled` is a child-safe accessibility preference that
  enlarges interactive controls without changing puzzle difficulty.
- `big_kids_rotation_enabled` and `big_kids_timer_enabled` are Parent Zone
  challenge preferences. They default off and affect only the `big_kids` tier;
  the youngest tiers can never inherit them, while Puzzle Masters keeps its
  required rotation and default timer regardless of these values.

## PuzzleProgress
One record per puzzle the child has interacted with.

```json
{
  "puzzle_id": "animals_farm_cow_01",
  "status": "not_started" | "in_progress" | "completed",
  "pieces_placed": 3,
  "piece_count": 4,
  "first_completed_at": "2026-08-01T10:15:00Z",
  "times_completed": 2,
  "best_time_seconds": null
}
```

- `best_time_seconds` only populated for tiers where timer is enabled (`big_kids` optional, `puzzle_masters` default) — must stay `null` for `tiny_tots`/`little_explorers` always.
- `times_completed` powers the "My Puzzles" replay gallery.

## Reward
Represents unlockable stickers/stars — deterministic, not random (see `AGENTS.md` hard constraints).

```json
{
  "reward_id": "sticker_cow_01",
  "type": "sticker" | "star",
  "unlocked_at": "2026-08-01T10:15:05Z",
  "triggered_by_puzzle_id": "animals_farm_cow_01"
}
```

- Every reward's unlock condition must be traceable to a specific, predictable trigger (e.g., "completing this puzzle always gives this sticker") — no randomization layer permitted.

### v1 deterministic reward rules

- First completion of a puzzle unlocks its permanent sticker:
  `sticker:{puzzle_id}`.
- Every completion, including a replay, adds one star:
  `star:{puzzle_id}:{times_completed}`.
- Completing each third distinct puzzle in a tier adds one progress-streak star:
  `streak_star:{tier_id}:{distinct_completed_count}`. In v1, “streak” therefore
  means a deterministic three-new-puzzle collection milestone, not a daily timer
  or chance mechanic.

## ParentZoneState
Governs the parent gate session (see `docs/NAVIGATION.md` navigation rule #4).

```json
{
  "gate_verified_at": "2026-08-01T10:00:00Z",
  "gate_valid": false
}
```

- `gate_valid` must be recomputed as `false` on every app foreground/resume event and after 60 seconds of inactivity — never persisted as `true` across sessions.

## Data principles (hard constraints, mirror `AGENTS.md`)
- No field in this document may store personally identifiable information about the child (no name, no photo, no birthdate more precise than an age tier) unless a parent explicitly enters it inside Parent Zone for a feature that requires it — and even then, minimize collection.
- Nothing in `PuzzleProgress`, `Reward`, or `UserSettings` should ever be transmitted off-device in v1 (no backend exists to send it to — flag immediately if a task seems to require this, since it would contradict `docs/PRD.md` non-goals).
- All timestamps stored in UTC ISO 8601.
