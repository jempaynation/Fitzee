import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const assetRoot = resolve(root, 'src/assets/puzzles')

const tiers = [
  { id: 'tiny_tots', short: 'tiny', counts: [4, 6, 4, 6] },
  { id: 'little_explorers', short: 'little', counts: [8, 12, 8, 12] },
  { id: 'big_kids', short: 'big', counts: [20, 30, 20, 30] },
  { id: 'puzzle_masters', short: 'master', counts: [48, 60, 48, 60] },
]

const scenes = [
  ['animals', 'farm_cow', 'Cow on the Farm', 'A cheerful brown and white cow standing in a sunny green farm meadow', ['farm', 'cow', 'animal']],
  ['animals', 'ocean_turtle', 'Turtle in the Reef', 'A cheerful green sea turtle swimming above a colorful coral reef', ['ocean', 'turtle', 'animal']],
  ['animals', 'dinosaur', 'Friendly Dinosaur', 'A gentle green dinosaur standing among bright prehistoric plants', ['dinosaur', 'meadow', 'animal']],
  ['animals', 'butterflies', 'Butterfly Garden', 'Colorful butterflies flying above a sunny flower garden', ['butterfly', 'garden', 'animal']],
  ['shapes_colors', 'garden', 'Shape Garden', 'A colorful garden made from circles, triangles, squares, rectangles, and diamonds', ['shapes', 'colors', 'garden']],
  ['shapes_colors', 'blocks', 'Block Town', 'A playful town built from large colorful geometric blocks', ['shapes', 'colors', 'blocks']],
  ['shapes_colors', 'rainbow', 'Rainbow Pattern', 'A bright rainbow landscape filled with repeating geometric patterns', ['shapes', 'colors', 'pattern']],
  ['shapes_colors', 'rocket', 'Shape Rocket', 'A friendly rocket built from colorful geometric shapes flying through space', ['shapes', 'colors', 'rocket']],
  ['vehicles', 'train', 'Countryside Train', 'A bright red passenger train crossing a bridge in the sunny countryside', ['train', 'countryside', 'vehicle']],
  ['vehicles', 'excavator', 'Busy Excavator', 'A friendly yellow excavator lifting earth at a tidy construction site', ['excavator', 'construction', 'vehicle']],
  ['vehicles', 'sailboat', 'Sailboat Harbor', 'A red and yellow sailboat gliding past a lighthouse in a calm harbor', ['sailboat', 'harbor', 'vehicle']],
  ['vehicles', 'airplane', 'Friendly Airplane', 'A cheerful blue and red airplane flying above patchwork countryside', ['airplane', 'sky', 'vehicle']],
  ['nature_seasons', 'tree', 'Four Seasons Tree', 'One large tree showing spring, summer, autumn, and winter', ['tree', 'seasons', 'nature']],
  ['nature_seasons', 'rainy_garden', 'Rainy Garden', 'Colorful umbrellas and a friendly frog in a flower garden during gentle rain', ['rain', 'garden', 'nature']],
  ['nature_seasons', 'sun_moon', 'Sun and Moon', 'A landscape changing from sunny daytime to a moonlit starry night', ['day', 'night', 'nature']],
  ['nature_seasons', 'flower_cycle', 'Flower Life Cycle', 'A seed, sprout, bud, and blooming flower growing across a garden', ['flower', 'growth', 'nature']],
  ['numbers_letters', 'ducks', 'Counting Ducks', 'Five yellow ducklings swimming separately in a sunny pond', ['counting', 'ducks', 'five']],
  ['numbers_letters', 'apple_a', 'Apple Letter A', 'A large uppercase letter A built from red apples and green leaves', ['letter', 'a', 'apple']],
  ['numbers_letters', 'fish_three', 'Number Three Fish', 'Three colorful fish curving together to form a large number three', ['number', 'three', 'fish']],
  ['numbers_letters', 'alphabet_blocks', 'Alphabet Blocks', 'Three colorful toy blocks showing the uppercase letters A, B, and C', ['letters', 'alphabet', 'blocks']],
  ['fairy_tales', 'dragon', 'Friendly Dragon', 'A gentle teal dragon sitting in a flower meadow near a storybook castle', ['dragon', 'castle', 'fantasy']],
  ['fairy_tales', 'castle', 'Hilltop Castle', 'A colorful welcoming fairy-tale castle on a green flowered hill', ['castle', 'rainbow', 'fantasy']],
  ['fairy_tales', 'unicorn', 'Rainbow Unicorn', 'A gentle white unicorn with a rainbow mane in a flower meadow', ['unicorn', 'rainbow', 'fantasy']],
  ['fairy_tales', 'space', 'Friendly Space Adventure', 'A friendly robot and colorful alien exploring a purple moon beside a rocket', ['space', 'robot', 'fantasy']],
  ['everyday_life', 'picnic', 'Family Picnic', 'A fictional family enjoying fruit and a kite at a sunny park picnic', ['family', 'picnic', 'park']],
  ['everyday_life', 'lunch', 'Colorful Healthy Lunch', 'A bright lunch box filled with fruit, vegetables, a sandwich, and water', ['food', 'lunch', 'everyday']],
  ['everyday_life', 'firefighter', 'Friendly Firefighter', 'A kind firefighter waving beside a red fire engine at the station', ['firefighter', 'helper', 'everyday']],
  ['everyday_life', 'bedtime', 'Cozy Bedtime Room', 'A tidy moonlit bedroom with a made bed, teddy bear, lamp, and slippers', ['bedtime', 'bedroom', 'everyday']],
  ['holidays', 'spring_kites', 'Spring Kite Festival', 'Colorful kites flying above a bright spring flower meadow', ['spring', 'kites', 'seasonal'], [3, 4, 5]],
  ['holidays', 'summer_beach', 'Sunny Beach Day', 'A sunny beach with a sandcastle, umbrella, ball, shells, and gentle waves', ['summer', 'beach', 'seasonal'], [6, 7, 8]],
  ['holidays', 'autumn_harvest', 'Autumn Harvest', 'A friendly autumn farm harvest with pumpkins, apples, leaves, and sunflowers', ['autumn', 'harvest', 'seasonal'], [9, 10, 11]],
  ['holidays', 'winter_lights', 'Winter Lights', 'A cozy snow-covered house and trees glowing with colorful winter lights', ['winter', 'lights', 'seasonal'], [12, 1, 2]],
]

let written = 0
for (const [category, slug, displayName, altText, tags, activeMonths] of scenes) {
  const categoryIndex = scenes.filter(([candidate]) => candidate === category)
    .findIndex(([, candidateSlug]) => candidateSlug === slug)
  const sequence = String(categoryIndex + 1).padStart(2, '0')

  for (const tier of tiers) {
    const puzzleId = `${category}_${slug}_${tier.short}_${sequence}`
    const directory = resolve(assetRoot, category, tier.id, puzzleId)
    await mkdir(directory, { recursive: true })
    await writeFile(
      resolve(directory, 'metadata.json'),
      `${JSON.stringify({
        puzzle_id: puzzleId,
        category_id: category,
        tier_id: tier.id,
        display_name: displayName,
        source_image: 'source.webp',
        piece_count: tier.counts[categoryIndex],
        narration_key: `${category}.${slug}.${tier.short}_${sequence}`,
        alt_text: altText,
        tags,
        ...(activeMonths ? { active_months: activeMonths } : {}),
      }, null, 2)}\n`,
    )
    written += 1
  }
}

if (written !== 128) throw new Error(`Expected 128 metadata files, wrote ${written}`)
console.log(`Wrote ${written} launch puzzle metadata files.`)
