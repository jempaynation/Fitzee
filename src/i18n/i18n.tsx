/* oxlint-disable react/only-export-components */
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import type { CategoryId } from '../core/constants/categories'
import type { TierId } from '../core/constants/tiers'
import type { UserSettings } from '../data/models'

export type Language = UserSettings['language']

const english = {
  'nav.home': 'Home',
  'nav.categories': 'Categories',
  'nav.myPuzzles': 'My Puzzles',
  'nav.rewards': 'Rewards',
  'nav.back': 'Go back',
  'nav.settings': 'Settings',
  'nav.parentGate': 'Parent Gate',
  'storage.notice': 'Progress stays for this visit, but this browser cannot save it yet.',
  'home.eyebrow': 'Let’s play',
  'home.title': 'Ready to puzzle?',
  'home.pick': 'Pick a place to start.',
  'home.start': 'Start here',
  'home.recommended': 'Recommended puzzles',
  'categories.title': 'Categories',
  'categories.choose': 'Choose a picture world.',
  'category.choose': 'Choose one',
  'category.notFoundTitle': 'Puzzles not found',
  'category.notFoundText': 'Choose another picture world.',
  'card.pieces': '{count} pieces',
  'card.finished': '✓ Finished',
  'card.finishedTimes': '✓ Finished {count} times',
  'puzzle.selected': 'Now tap its matching place, or drag it there.',
  'puzzle.instruction': 'Tap a piece, then its matching place — or drag it.',
  'puzzle.of': 'of {count}',
  'puzzle.hint': 'Hold for picture hint',
  'puzzle.rotate': 'Rotate selected piece',
  'puzzle.showTimer': 'Show timer',
  'puzzle.loading': 'Cutting out the pieces…',
  'puzzle.allBoard': 'All pieces are on the board!',
  'puzzle.pieceLabel': 'Puzzle piece {index} of {count}',
  'puzzle.targetLabel': 'Place selected piece in position {index}',
  'puzzle.notFoundTitle': 'Puzzle not found',
  'puzzle.notFoundText': 'Choose another puzzle to play.',
  'puzzle.errorTitle': 'Let’s try again',
  'puzzle.errorText': 'The puzzle picture needs another moment to open.',
  'puzzle.tryAgain': 'Try again',
  'puzzle.boardLabel': 'Puzzle board',
  'puzzle.trayLabel': 'Puzzle pieces',
  'puzzle.timerLabel': 'Puzzle time: {time}',
  'complete.eyebrow': 'Puzzle complete!',
  'complete.title': 'You did it!',
  'complete.saved': 'Your finished picture is now in My Puzzles.',
  'complete.star': 'Star added!',
  'complete.sticker': 'New picture sticker unlocked',
  'complete.gallery': 'See My Puzzles',
  'complete.celebrating': 'Celebrating…',
  'complete.replay': 'Play again',
  'complete.loading': 'Checking your finished puzzle…',
  'complete.unavailableTitle': 'Finish the puzzle first',
  'complete.unavailableText': 'Choose a puzzle and place every piece to earn its reward.',
  'complete.sessionOnly': 'Your finished picture is ready for this visit, but this browser could not save it.',
  'complete.firstRewardLabel': 'One star and a new picture sticker earned',
  'complete.replayRewardLabel': 'One star earned',
  'gallery.eyebrow': 'Your gallery',
  'gallery.title': 'My Puzzles',
  'gallery.opening': 'Opening your gallery…',
  'gallery.emptyTitle': 'Your first picture belongs here!',
  'gallery.emptyText': 'Finish a puzzle and it will appear in this gallery.',
  'gallery.choose': 'Choose a puzzle',
  'rewards.eyebrow': 'Every puzzle counts',
  'rewards.title': 'Rewards',
  'rewards.stars': 'stars earned',
  'rewards.stickers': 'Sticker book',
  'rewards.opening': 'Opening your rewards…',
  'rewards.empty': 'Finish a puzzle to earn its picture sticker and a star.',
  'rewards.starCountLabel': '{count} stars earned',
  'settings.eyebrow': 'Make Fitzee yours',
  'settings.title': 'Settings',
  'settings.sound': 'Sound effects',
  'settings.music': 'Music',
  'settings.narration': 'Narration',
  'settings.language': 'Language',
  'settings.bigButtons': 'Bigger buttons',
  'settings.english': 'English',
  'settings.filipino': 'Filipino',
  'reminder.eyebrow': 'Gentle reminder',
  'reminder.title': 'Time for a little break',
  'reminder.text': 'Stretch, look around, or get a drink. Your puzzle will be right here.',
  'reminder.continue': 'Continue when ready',
} as const

type TranslationKey = keyof typeof english

const filipino: Record<TranslationKey, string> = {
  'nav.home': 'Tahanan',
  'nav.categories': 'Mga Kategorya',
  'nav.myPuzzles': 'Aking Puzzle',
  'nav.rewards': 'Mga Gantimpala',
  'nav.back': 'Bumalik',
  'nav.settings': 'Mga Setting',
  'nav.parentGate': 'Para sa Magulang',
  'storage.notice': 'Mananatili ang progreso sa pagbisitang ito, pero hindi pa ito maiimbak ng browser.',
  'home.eyebrow': 'Maglaro tayo',
  'home.title': 'Handa ka na bang mag-puzzle?',
  'home.pick': 'Pumili kung saan magsisimula.',
  'home.start': 'Magsimula rito',
  'home.recommended': 'Mga inirerekomendang puzzle',
  'categories.title': 'Mga Kategorya',
  'categories.choose': 'Pumili ng mundong larawan.',
  'category.choose': 'Pumili ng isa',
  'category.notFoundTitle': 'Walang nakitang puzzle',
  'category.notFoundText': 'Pumili ng ibang mundong larawan.',
  'card.pieces': '{count} piraso',
  'card.finished': '✓ Tapos na',
  'card.finishedTimes': '✓ Natapos nang {count} beses',
  'puzzle.selected': 'I-tap ang katugmang puwesto, o i-drag ito roon.',
  'puzzle.instruction': 'I-tap ang piraso at ang katugmang puwesto, o i-drag ito.',
  'puzzle.of': 'sa {count}',
  'puzzle.hint': 'Hawakan para makita ang larawan',
  'puzzle.rotate': 'Ikutin ang napiling piraso',
  'puzzle.showTimer': 'Ipakita ang oras',
  'puzzle.loading': 'Ginagawa ang mga piraso…',
  'puzzle.allBoard': 'Nasa board na ang lahat ng piraso!',
  'puzzle.pieceLabel': 'Piraso {index} sa {count}',
  'puzzle.targetLabel': 'Ilagay ang napiling piraso sa puwesto {index}',
  'puzzle.notFoundTitle': 'Walang nakitang puzzle',
  'puzzle.notFoundText': 'Pumili ng ibang puzzle na lalaruin.',
  'puzzle.errorTitle': 'Subukan nating muli',
  'puzzle.errorText': 'Kailangan pa ng sandali para mabuksan ang larawan.',
  'puzzle.tryAgain': 'Subukan muli',
  'puzzle.boardLabel': 'Board ng puzzle',
  'puzzle.trayLabel': 'Mga piraso ng puzzle',
  'puzzle.timerLabel': 'Oras ng puzzle: {time}',
  'complete.eyebrow': 'Kumpleto ang puzzle!',
  'complete.title': 'Nagawa mo!',
  'complete.saved': 'Nasa Aking Puzzle na ang natapos mong larawan.',
  'complete.star': 'Nadagdag ang bituin!',
  'complete.sticker': 'May bago kang sticker ng larawan',
  'complete.gallery': 'Tingnan ang Aking Puzzle',
  'complete.celebrating': 'Nagdiwang…',
  'complete.replay': 'Maglaro ulit',
  'complete.loading': 'Tinitingnan ang natapos mong puzzle…',
  'complete.unavailableTitle': 'Tapusin muna ang puzzle',
  'complete.unavailableText': 'Pumili ng puzzle at ilagay ang lahat ng piraso para makuha ang gantimpala.',
  'complete.sessionOnly': 'Handa ang natapos mong larawan sa pagbisitang ito, pero hindi ito naimbak ng browser.',
  'complete.firstRewardLabel': 'Isang bituin at bagong sticker ang nakuha',
  'complete.replayRewardLabel': 'Isang bituin ang nakuha',
  'gallery.eyebrow': 'Iyong galerya',
  'gallery.title': 'Aking Puzzle',
  'gallery.opening': 'Binubuksan ang galerya…',
  'gallery.emptyTitle': 'Dito mapupunta ang una mong larawan!',
  'gallery.emptyText': 'Tapusin ang puzzle at lalabas ito rito.',
  'gallery.choose': 'Pumili ng puzzle',
  'rewards.eyebrow': 'Mahalaga ang bawat puzzle',
  'rewards.title': 'Mga Gantimpala',
  'rewards.stars': 'bituing nakuha',
  'rewards.stickers': 'Aklat ng sticker',
  'rewards.opening': 'Binubuksan ang mga gantimpala…',
  'rewards.empty': 'Tapusin ang puzzle para makakuha ng sticker at bituin.',
  'rewards.starCountLabel': '{count} bituin ang nakuha',
  'settings.eyebrow': 'Ayusin ang Fitzee',
  'settings.title': 'Mga Setting',
  'settings.sound': 'Tunog',
  'settings.music': 'Musika',
  'settings.narration': 'Pagsasalaysay',
  'settings.language': 'Wika',
  'settings.bigButtons': 'Mas malalaking button',
  'settings.english': 'English',
  'settings.filipino': 'Filipino',
  'reminder.eyebrow': 'Magiliw na paalala',
  'reminder.title': 'Oras muna para magpahinga',
  'reminder.text': 'Mag-unat, tumingin sa paligid, o uminom. Nandito lang ang puzzle mo.',
  'reminder.continue': 'Magpatuloy kapag handa na',
}

const categoryNames: Record<Language, Record<CategoryId, string>> = {
  en: {
    animals: 'Animals', shapes_colors: 'Shapes & Colors', vehicles: 'Vehicles',
    nature_seasons: 'Nature & Seasons', numbers_letters: 'Numbers & Letters',
    fairy_tales: 'Fairy Tales & Fantasy', everyday_life: 'Everyday Life',
    holidays: 'Holidays & Seasonal',
  },
  fil: {
    animals: 'Mga Hayop', shapes_colors: 'Hugis at Kulay', vehicles: 'Mga Sasakyan',
    nature_seasons: 'Kalikasan at Panahon', numbers_letters: 'Numero at Titik',
    fairy_tales: 'Kuwentong Engkantada', everyday_life: 'Araw-araw na Buhay',
    holidays: 'Pista at Panahon',
  },
}

const tierNames: Record<Language, Record<TierId, string>> = {
  en: { tiny_tots: 'Tiny Tots', little_explorers: 'Little Explorers', big_kids: 'Big Kids', puzzle_masters: 'Puzzle Masters' },
  fil: { tiny_tots: 'Maliliit', little_explorers: 'Munting Eksplorador', big_kids: 'Malalaking Bata', puzzle_masters: 'Dalubhasa sa Puzzle' },
}

const filipinoPuzzleNames: Record<string, string> = {
  'Cow on the Farm': 'Baka sa Bukid',
  'Turtle in the Reef': 'Pagong sa Bahura',
  'Friendly Dinosaur': 'Mabait na Dinosaur',
  'Butterfly Garden': 'Hardin ng Paruparo',
  'Shape Garden': 'Hardin ng mga Hugis',
  'Block Town': 'Bayan ng mga Bloke',
  'Rainbow Pattern': 'Makulay na Huwaran',
  'Shape Rocket': 'Rocket na Hugis',
  'Countryside Train': 'Tren sa Lalawigan',
  'Busy Excavator': 'Masipag na Excavator',
  'Sailboat Harbor': 'Bangka sa Daungan',
  'Friendly Airplane': 'Mabait na Eroplano',
  'Four Seasons Tree': 'Puno ng Apat na Panahon',
  'Rainy Garden': 'Maulang Hardin',
  'Sun and Moon': 'Araw at Buwan',
  'Flower Life Cycle': 'Paglaki ng Bulaklak',
  'Counting Ducks': 'Bilangin ang mga Bibe',
  'Apple Letter A': 'Titik A na Mansanas',
  'Number Three Fish': 'Tatlong Isda',
  'Alphabet Blocks': 'Mga Bloke ng Alpabeto',
  'Friendly Dragon': 'Mabait na Dragon',
  'Hilltop Castle': 'Kastilyo sa Burol',
  'Rainbow Unicorn': 'Unicorn na Bahaghari',
  'Friendly Space Adventure': 'Masayang Lakbay sa Kalawakan',
  'Steamboat Willie Mickey': 'Steamboat Willie Mickey',
  "Cinderella's Carriage": 'Kalesa ni Cinderella',
  'Little Mermaid Reef': 'Bahura ng Munting Sirena',
  'Snow White Forest': 'Gubat ni Snow White',
  'Family Picnic': 'Piknik ng Pamilya',
  'Colorful Healthy Lunch': 'Makulay na Masustansiyang Tanghalian',
  'Friendly Firefighter': 'Mabait na Bumbero',
  'Cozy Bedtime Room': 'Maaliwalas na Silid-Tulugan',
  'Spring Kite Festival': 'Pista ng Saranggola sa Tagsibol',
  'Sunny Beach Day': 'Maaraw na Araw sa Dalampasigan',
  'Autumn Harvest': 'Ani sa Taglagas',
  'Winter Lights': 'Mga Ilaw sa Taglamig',
}

interface I18nValue {
  language: Language
  t: (key: TranslationKey, values?: Record<string, string | number>) => string
  categoryName: (categoryId: CategoryId) => string
  tierName: (tierId: TierId) => string
  puzzleName: (displayName: string) => string
  puzzleAlt: (displayName: string, defaultAlt: string) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ language, children }: { language: Language; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])
  const value = useMemo<I18nValue>(() => {
    const dictionary = language === 'fil' ? filipino : english
    return {
      language,
      t: (key, values = {}) => Object.entries(values).reduce(
        (text, [name, replacement]) => text.replaceAll(`{${name}}`, String(replacement)),
        dictionary[key],
      ),
      categoryName: (categoryId) => categoryNames[language][categoryId],
      tierName: (tierId) => tierNames[language][tierId],
      puzzleName: (displayName) => language === 'fil'
        ? filipinoPuzzleNames[displayName] ?? displayName
        : displayName,
      puzzleAlt: (displayName, defaultAlt) => language === 'fil'
        ? `${filipinoPuzzleNames[displayName] ?? displayName}, larawang puzzle`
        : defaultAlt,
    }
  }, [language])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside I18nProvider')
  return value
}
