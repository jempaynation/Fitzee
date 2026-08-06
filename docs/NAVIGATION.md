# Navigation — Fitzee

Canonical screen names below must match code (widget/route names) exactly — do not paraphrase.

## Screen inventory

| Screen ID | Name | Reachable from | Notes |
|---|---|---|---|
| `onboarding_age_select` | Age/Tier Select | First launch only | Icon-based, no reading required; parent can also pick tier here |
| `home` | Home | App launch (after onboarding), back from anywhere via home icon | Horizontally scrollable recommended-puzzle carousel personalized to current tier |
| `categories` | Categories | Home | Grid of picture icons, no text required |
| `category_detail` | Category Detail | Categories | Puzzle list within one category, filtered to current tier |
| `puzzle_play` | Puzzle Play | Category Detail, Home carousel | The puzzle engine screen itself |
| `puzzle_complete` | Completion Celebration | Auto-transition from Puzzle Play on completion | Sticker/star reward reveal |
| `my_puzzles` | My Puzzles | Home (tab/icon) | Gallery of completed puzzles, replayable |
| `rewards` | Rewards | Home (tab/icon) | Sticker book / star jar view |
| `settings` | Settings | Home (icon, child-safe subset only) | Sound on/off, music on/off, narration on/off, language, larger touch targets — no purchases, no tier override here |
| `parent_gate` | Parent Gate | Any entry point into Parent Zone | Math-check or hold-gesture; see `docs/COMPLIANCE.md#parent-gate` |
| `parent_zone_home` | Parent Zone Home | Behind `parent_gate` | Hub for all parent-only settings |
| `parent_tier_override` | Tier Override | Parent Zone Home | Force a specific tier regardless of age given at onboarding |
| `parent_screen_time` | Screen Time Reminder | Parent Zone Home | Optional session-length reminder |
| `parent_privacy` | Privacy & Data | Parent Zone Home | Data collected, delete data option |
| `parent_subscription` | Subscription Management | Parent Zone Home | Purchase, restore, cancel — see Phase 4 in `ROADMAP.md` |

## Navigation rules (hard constraints)
1. **Max depth from Home to playing a puzzle: 3 taps.** `home → categories → category_detail → puzzle_play` is the max chain; the Home carousel should also allow `home → puzzle_play` directly (2 taps) for "continue" or "recommended" puzzles.
2. **Back button/gesture is always available and always in the same screen position** across every child-facing screen except the completion celebration while its required first-completion reveal is running. The completion screen supplies its own replay/gallery exits as soon as the reveal is dismissible.
3. **No screen a child can reach may link to:** external URLs, app store pages, purchase flows, or any Parent Zone screen — those are only reachable via `parent_gate`.
4. **`parent_gate` must be re-triggered every time** Parent Zone is entered — do not cache a "parent verified" session state that persists across app restarts or after backgrounding for >60 seconds.
5. **Settings vs Parent Zone split:** `settings` (child-reachable) only ever contains sound/music/narration/language controls and the non-difficulty “larger touch targets” accessibility toggle. Anything affecting difficulty, spending, or data goes in `parent_zone_home` and descendants — never mix these.

## Bottom navigation (child-facing, persistent)
Recommended 4-icon bottom nav, all icon-only with optional labels for older tiers:
```
[ Home ]   [ Categories ]   [ My Puzzles ]   [ Rewards ]
```
`settings` and `parent_gate` are accessed via a small icon in a corner (e.g., top-right gear), not in the main bottom nav — keep the primary nav purely play-focused.

## Phase 0 route contract

Fitzee uses hash-based routing so direct visits and refreshes work on GitHub Pages
without server rewrite rules. The canonical route paths mirror the screen IDs:

| Screen ID | Route |
|---|---|
| `onboarding_age_select` | `/onboarding_age_select` |
| `home` | `/home` |
| `categories` | `/categories` |
| `category_detail` | `/category_detail/:categoryId` |
| `puzzle_play` | `/puzzle_play/:puzzleId` |
| `puzzle_complete` | `/puzzle_complete/:puzzleId` |
| `my_puzzles` | `/my_puzzles` |
| `rewards` | `/rewards` |
| `settings` | `/settings` |
| `parent_gate` | `/parent_gate` |
| `parent_zone_home` | `/parent_zone_home` |
| `parent_tier_override` | `/parent_tier_override` |
| `parent_screen_time` | `/parent_screen_time` |
| `parent_privacy` | `/parent_privacy` |
| `parent_subscription` | `/parent_subscription` |

Phase 0 renders placeholders for future feature screens. Parent-only routes are
defined but guarded: until the Phase 2 gate exists, direct navigation redirects to
`parent_gate` and there is no child-facing link past that screen.

## Transition/feedback requirements
- Every navigation tap gets an immediate visual + audio response (even before the screen finishes loading) — young kids need instant feedback that a tap registered.
- `puzzle_complete` is not skippable on first completion of a given puzzle, but should be quick-skippable (single tap) on replays.

The v1 Home carousel shows the first four active puzzles in canonical content
order for the selected tier. It scrolls horizontally on narrow screens and every
card opens Puzzle Play directly, keeping the recommended path one tap from Home.
