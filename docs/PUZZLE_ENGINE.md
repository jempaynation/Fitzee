# Puzzle Engine Spec — Fitzee

Defines the interaction and rendering logic for the puzzle-play screen (`puzzle_play`, see `docs/NAVIGATION.md`). This module takes an image + tier config as input (per `docs/ARCHITECTURE.md` module boundaries) and is content-agnostic.

## Inputs
- `source_image`: the full puzzle image
- `piece_count`: integer, validated against the active `tier_id`'s allowed range (`docs/PRD.md`)
- `tier_config`: derived from `tier_id`, controls rotation/timer/snap-tolerance (see table below)

## Per-tier interaction rules

| Tier | Piece shape | Snap tolerance | Rotation | Timer | Hints | Fail state |
|---|---|---|---|---|---|---|
| `tiny_tots` | Large, simple rectangular/interlocking | Very high (large "close enough" radius) | Disabled — pieces always upright | Never shown | Piece silhouette shown as faint outline on board at all times | None — pieces can't be placed wrong, only unplaced |
| `little_explorers` | Standard interlocking | High | Disabled | Never shown | Faint outline shown, fades after first successful placements | None |
| `big_kids` | Standard interlocking | Medium | Optional (Parent Zone toggle) | Optional, off by default (Parent Zone toggle) | Outline hint available via tap-and-hold, not shown by default | Misplaced piece bounces back gently, no penalty |
| `puzzle_masters` | Standard interlocking, smaller pieces | Low (precise placement required) | Required | On by default, can be hidden | No outline; optional edge-piece highlight only | Misplaced piece bounces back, timer keeps running |

## Piece generation
- Cut `source_image` into `piece_count` pieces at runtime using a standard interlocking jigsaw tab/blank pattern (classic puzzle-piece silhouette), not plain rectangles, for `little_explorers` and above. `tiny_tots` may use simplified large rectangular/rounded pieces for easier tiny-hand manipulation.
- Piece count to grid mapping should stay as close to square as possible (e.g., 6 pieces → 3×2, not 6×1) for visual balance, unless the source image's aspect ratio strongly suggests otherwise.
- Pre-render pieces once per puzzle session and cache — do not re-cut on every frame.

### v1 rendering decision

The source image is scaled to a fixed logical 600×600 board. Canvas generates a
transparent bitmap per piece using deterministic tab/blank edges; adjacent pieces
always receive complementary edges. Tiny Tots receive rounded rectangular paths.
The cached bitmaps are displayed in semantic `<button>` elements so drag updates
only a CSS transform and the same piece remains keyboard/screen-reader operable.
The fixed logical coordinate system is scaled responsively by CSS, avoiding
re-cutting on viewport resize.

For 40+ piece puzzles, v1 caps generated piece bitmaps at 1× device density.
This materially reduces canvas memory and data-URL work on low-end tablets while
the small pieces remain visually sharp at their rendered size. Lower piece counts
may render up to 2× density for large toddler pieces.

Phase 1 saves only the count of placed pieces, as defined by `PuzzleProgress`.
When an in-progress puzzle resumes, the engine restores that count using the
catalog's stable, row-major piece order. This avoids adding undocumented piece-ID
state while still returning the child to the same amount of completed work.

## Interaction flow
1. Puzzle loads → board area shows empty tray/outline (per tier's hint rule above) → pieces scattered in a tray area, sized generously for touch (minimum 44×44px touch target, larger for `tiny_tots`).
2. Child drags a piece using a finger (touch), stylus, or mouse — implement via the **Pointer Events API** (`pointerdown`/`pointermove`/`pointerup`) so touch, mouse, and stylus all work through one code path rather than separate handlers.
3. On release, if within snap tolerance of correct position/rotation → piece snaps into place with a satisfying audio + visual cue (use the [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API) for haptic feedback where supported — Android Chrome supports it, iOS Safari currently does not, so treat it as a progressive enhancement, not a requirement).
4. If outside tolerance → piece stays where dropped (`tiny_tots`/`little_explorers`) or gently animates back to tray (`big_kids`/`puzzle_masters`) — never an error sound or negative feedback, at any tier.
5. On all pieces placed → trigger `puzzle_complete` screen (see `docs/NAVIGATION.md`).

## Accessibility & input
- Support both drag and a simple tap/click-to-select + tap/click-to-place alternate input for kids who struggle with sustained drag gestures, and for mouse-only desktop use.
- All interactive elements must be reachable via keyboard and screen readers (ARIA labels, focus order) even though the primary audience is pre-reading — this matters for kids with motor/visual differences, for parents navigating Parent Zone, and for the Phase 5 accessibility pass.
- Hold-to-reveal hints must also respond to Space/Enter while their button has
  keyboard focus; releasing the key or leaving focus hides the hint again.

## Performance
- Target 60fps drag interaction on mid-range tablets and Chromebooks (this age group is disproportionately on hand-me-down/budget devices, and web performance varies more than native).
- Pieces should use pre-computed hit-test regions, not full-image pixel checks, to keep drag responsive at high piece counts (`puzzle_masters` tier, up to 100+ pieces).
- If using Canvas rendering, avoid full-canvas redraws on every `pointermove` — only redraw the dragged piece's region plus any area it overlaps, or use a layered canvas approach (static board layer + dynamic dragged-piece layer).
- Debounce/throttle `pointermove` handling if frame drops are observed on low-end devices during testing.

## Testing checklist
- [ ] Piece count always matches `tier_config` allowed range
- [ ] No fail/error state ever fires for `tiny_tots`/`little_explorers`
- [ ] Snap tolerance measurably differs across tiers (unit test with fixed drop coordinates)
- [ ] Timer never renders for `tiny_tots`/`little_explorers` even if a stray flag is set
- [ ] Works with tap-to-place as well as drag
