# Content Spec — Fitzee

Canonical category and tier IDs. Code, assets, and data must use these exact IDs.

## Categories (canonical list)

| Category ID | Display Name | MVP? | Example puzzle themes |
|---|---|---|---|
| `animals` | Animals | Yes (Phase 1) | farm, zoo, ocean, dinosaurs, pets, bugs |
| `shapes_colors` | Shapes & Colors | Yes (Phase 1) | basic shapes, color matching, patterns |
| `vehicles` | Vehicles | Yes (Phase 1) | cars, trains, planes, construction, boats |
| `nature_seasons` | Nature & Seasons | Phase 3 | weather, plants, day/night, four seasons |
| `numbers_letters` | Numbers & Letters | Phase 3 | ABCs, counting 1–10, simple words |
| `fairy_tales` | Fairy Tales & Fantasy | Phase 3 | dragons, castles, unicorns, space, disney & public-domain classic characters |
| `everyday_life` | Everyday Life | Phase 3 | family, food, community helpers |
| `holidays` | Holidays & Seasonal | Phase 5 | rotating content, refreshed per calendar |

## Tier IDs (mirror `docs/PRD.md` — do not redefine elsewhere)
`tiny_tots`, `little_explorers`, `big_kids`, `puzzle_masters`

## Puzzle count targets

| Phase | Categories active | Puzzles per category per tier | Total puzzles |
|---|---|---|---|
| Phase 1 (MVP) | 3 | 2 (tiny_tots, big_kids only) | 12 |
| Phase 3 (full tiers) | 3 | 4 (all 4 tiers) | 48 |
| Phase 3 (full categories) | 7 (excl. holidays) | 4–8 (all 4 tiers) | 144 |
| Phase 5 (+ holidays) | 8 | varies, seasonal | ongoing |

## v1 launch puzzle themes

The catalog uses stable scenes per launch category, each
published at all four tiers. Reusing a scene across tier variants is intentional;
piece count and tier interaction rules provide the age-appropriate challenge.

| Category | Launch scenes |
|---|---|
| Animals | Cow on the Farm; Turtle in the Reef; Friendly Dinosaur; Butterfly Garden |
| Shapes & Colors | Shape Garden; Block Town; Rainbow Pattern; Shape Rocket |
| Vehicles | Countryside Train; Busy Excavator; Sailboat Harbor; Friendly Airplane |
| Nature & Seasons | Four Seasons Tree; Rainy Garden; Sun and Moon; Flower Life Cycle |
| Numbers & Letters | Counting Ducks; Apple Letter A; Number Three Fish; Alphabet Blocks |
| Fairy Tales & Fantasy | Friendly Dragon; Hilltop Castle; Rainbow Unicorn; Friendly Space Adventure; Steamboat Willie Mickey; Cinderella's Carriage; Little Mermaid Reef; Snow White Forest |
| Everyday Life | Family Picnic; Colorful Healthy Lunch; Friendly Firefighter; Cozy Bedtime Room |

### Seasonal rotation calendar

The Holidays & Seasonal category is local and deterministic; it does not fetch
remote content or use a child's location. Each scene is available in its listed
calendar months at all four tiers:

| Scene | Active months |
|---|---|
| Spring Kite Festival | March–May |
| Sunny Beach Day | June–August |
| Autumn Harvest | September–November |
| Winter Lights | December–February |

Seasonal metadata adds an optional `active_months` array of device-local calendar
month numbers (`1`–`12`). Non-seasonal puzzles omit the field and remain available
year-round. Inactive seasonal puzzles stay hidden from catalogs and direct routes;
their locally stored progress and rewards are preserved for the next rotation.

All scenes use original, flat, rounded, high-contrast illustration. Educational
letters/numbers may appear as the learning object itself; no other labels or
sentences are embedded in the art.

## Puzzle metadata schema
Each puzzle is defined by a metadata file alongside its source image:

```json
{
  "puzzle_id": "animals_farm_cow_01",
  "category_id": "animals",
  "tier_id": "tiny_tots",
  "display_name": "Cow on the Farm",
  "source_image": "cow.png",
  "piece_count": 4,
  "narration_key": "animals.farm.cow_01",
  "alt_text": "A brown and white cow standing in a green field",
  "tags": ["farm", "cow", "animal"]
}
```

Field notes:
- `puzzle_id` is unique across the whole catalog, including tier. The v1 filename
  convention is `{category}_{theme}_{tier-short}_{sequence}` (for example,
  `animals_farm_cow_tiny_01` and `animals_farm_cow_big_01`) so two tier variants
  never overwrite one another's `PuzzleProgress` record.
- `piece_count` must fall within the range defined for `tier_id` in `docs/PRD.md`'s tier table.
- `narration_key` maps to localized audio prompts (e.g., "Let's find the piece with the cow's head!") — see `l10n/` in `docs/ARCHITECTURE.md`.
- `alt_text` is required for every puzzle (accessibility + narration fallback).
- One `source_image` may be reused across multiple `puzzle_id` entries at different `piece_count`/`tier_id` to serve multiple tiers efficiently — this is preferred over sourcing separate images per tier where the same image works.

## Image asset requirements
- Flat, high-contrast, rounded-shape illustration style (not photorealistic) — reads better once cut into pieces, especially at low piece counts.
- Minimum source resolution: 2048×2048px (allows clean cutting up to 100-piece tier without blur).
- No text embedded in puzzle images (breaks language-agnostic/no-read design principle) — text-teaching content (letters/numbers) should be the puzzle piece itself (a big "3" shape), not a background label.
- No real children's faces, no real-world brand logos. Proprietary modern copyrighted characters are strictly prohibited, but public-domain classic animation characters (such as 1928 Steamboat Willie Mickey Mouse and classic fairy tales like Cinderella, The Little Mermaid, and Snow White) are permitted using original non-infringing artwork.

## Adding new content (process for agents)
1. Add source image to `src/assets/puzzles/{category_id}/{tier_id}/{puzzle_id}/`.
2. Add metadata JSON per schema above in the same folder.
3. No code changes should be required to add a new puzzle — if they are, that's an architecture bug per `docs/ARCHITECTURE.md`'s "content injected, not hardcoded" rule; flag it.
