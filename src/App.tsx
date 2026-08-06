import { useCallback, useEffect, useRef, useState } from 'react'
import { ChildLayout } from './core/navigation/ChildLayout'
import {
  HashLink,
  HashNavigationProvider,
} from './core/navigation/hashNavigation'
import { useHashNavigation } from './core/navigation/useHashNavigation'
import type { TierId } from './core/constants/tiers'
import { playNavigationCue } from './core/utils/audio'
import {
  getPuzzleById,
  getPuzzlesForTier,
  isPuzzleAvailableOn,
} from './data/content/puzzleCatalog'
import {
  createOnboardingSettings,
  type UserSettings,
} from './data/models'
import {
  readUserSettings,
  writeUserSettings,
} from './data/repositories/userSettingsRepository'
import { AgeTierSelect } from './features/settings/AgeTierSelect'
import { ChildSettings } from './features/settings/ChildSettings'
import { CategoriesScreen } from './features/catalog/CategoriesScreen'
import { CategoryDetailScreen } from './features/catalog/CategoryDetailScreen'
import { PuzzleCard } from './features/catalog/PuzzleCard'
import { PuzzlePlayScreen } from './features/puzzle-engine/PuzzlePlayScreen'
import { PuzzleCompleteScreen } from './features/completion/PuzzleCompleteScreen'
import { MyPuzzlesScreen } from './features/gallery/MyPuzzlesScreen'
import { ParentGateScreen } from './features/parent-zone/ParentGateScreen'
import { ParentLayout } from './features/parent-zone/ParentLayout'
import { ParentPrivacy } from './features/parent-zone/ParentPrivacy'
import { ParentScreenTime } from './features/parent-zone/ParentScreenTime'
import { ParentTierOverride } from './features/parent-zone/ParentTierOverride'
import { ParentZoneHome } from './features/parent-zone/ParentZoneHome'
import { ScreenTimeReminder } from './features/parent-zone/ScreenTimeReminder'
import { shouldRevokeParentAccess } from './features/parent-zone/parentGate'
import { RewardsScreen } from './features/rewards/RewardsScreen'
import { I18nProvider, useI18n } from './i18n/i18n'
import './App.css'

interface AppState {
  loading: boolean
  settings: UserSettings | null
  persistenceAvailable: boolean
}

interface PlaceholderScreenProps {
  icon: string
  name: string
  sentence: string
}

const parentOnlyPaths = new Set([
  '/parent_zone_home',
  '/parent_tier_override',
  '/parent_screen_time',
  '/parent_privacy',
  '/parent_subscription',
])

function isKnownChildPath(path: string): boolean {
  return (
    path === '/' ||
    path === '/home' ||
    path === '/categories' ||
    path === '/my_puzzles' ||
    path === '/rewards' ||
    path === '/settings' ||
    path === '/parent_gate' ||
    path.startsWith('/category_detail/') ||
    path.startsWith('/puzzle_play/') ||
    path.startsWith('/puzzle_complete/')
  )
}

function PlaceholderScreen({ icon, name, sentence }: PlaceholderScreenProps) {
  const titleId = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-title`
  return (
    <section className="screen-card" aria-labelledby={titleId}>
      <div className="screen-icon" aria-hidden="true">
        {icon}
      </div>
      <h1 id={titleId}>{name}</h1>
      <p>{sentence}</p>
    </section>
  )
}

function HomeScreen({ settings }: { settings: UserSettings }) {
  const { t } = useI18n()
  const cue = () => playNavigationCue(settings.sound_enabled)
  const recommended = getPuzzlesForTier(settings.active_tier_id)[0]
  return (
    <section className="screen-card home-card" aria-labelledby="home-title">
      <div className="screen-icon" aria-hidden="true">
        🧩
      </div>
      <p className="eyebrow">{t('home.eyebrow')}</p>
      <h1 id="home-title">{t('home.title')}</h1>
      <p>{t('home.pick')}</p>
      {recommended && (
        <div className="recommended-puzzle">
          <p className="eyebrow">{t('home.start')}</p>
          <PuzzleCard puzzle={recommended} soundEnabled={settings.sound_enabled} />
        </div>
      )}
      <div className="home-actions">
        <HashLink className="action-card" to="/categories" onPointerDown={cue}>
          <span aria-hidden="true">🖼️</span>
          <span>{t('nav.categories')}</span>
        </HashLink>
        <HashLink className="action-card" to="/my_puzzles" onPointerDown={cue}>
          <span aria-hidden="true">🧩</span>
          <span>{t('nav.myPuzzles')}</span>
        </HashLink>
        <HashLink className="action-card" to="/rewards" onPointerDown={cue}>
          <span aria-hidden="true">⭐</span>
          <span>{t('nav.rewards')}</span>
        </HashLink>
      </div>
    </section>
  )
}

function AppRoutes({
  state,
  onSelectTier,
  onSettingsChange,
  parentVerified,
  onParentVerified,
  onParentAccessRevoked,
  onDataDeleted,
}: {
  state: AppState
  onSelectTier: (tierId: TierId) => Promise<void>
  onSettingsChange: (change: Partial<UserSettings>) => Promise<void>
  parentVerified: boolean
  onParentVerified: () => void
  onParentAccessRevoked: () => void
  onDataDeleted: () => void
}) {
  const { path, navigate } = useHashNavigation()
  const wasInParentZone = useRef(false)
  const hiddenAt = useRef<number | null>(null)
  const [reminderVisible, setReminderVisible] = useState(false)
  const [reminderCycle, setReminderCycle] = useState(0)

  useEffect(() => {
    if (!state.settings && path !== '/onboarding_age_select') {
      navigate('/onboarding_age_select', { replace: true })
    } else if (state.settings && path === '/onboarding_age_select') {
      navigate('/home', { replace: true })
    }
  }, [navigate, path, state.settings])

  useEffect(() => {
    if (state.settings && parentOnlyPaths.has(path) && !parentVerified) {
      navigate('/parent_gate', { replace: true })
    }
  }, [navigate, parentVerified, path, state.settings])

  useEffect(() => {
    const inParentZone = parentOnlyPaths.has(path)
    if (wasInParentZone.current && !inParentZone && path !== '/parent_gate') {
      onParentAccessRevoked()
    }
    wasInParentZone.current = inParentZone
  }, [onParentAccessRevoked, path])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt.current = Date.now()
        return
      }
      if (shouldRevokeParentAccess(hiddenAt.current, Date.now())) {
        onParentAccessRevoked()
        if (parentOnlyPaths.has(path)) navigate('/parent_gate', { replace: true })
      }
      hiddenAt.current = null
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [navigate, onParentAccessRevoked, path])

  useEffect(() => {
    const minutes = state.settings?.screen_time_reminder_minutes
    if (!minutes) {
      setReminderVisible(false)
      return
    }
    const timer = window.setTimeout(
      () => setReminderVisible(true),
      minutes * 60_000,
    )
    return () => window.clearTimeout(timer)
  }, [reminderCycle, state.settings?.screen_time_reminder_minutes])

  useEffect(() => {
    if (
      state.settings &&
      path !== '/onboarding_age_select' &&
      !parentOnlyPaths.has(path) &&
      !isKnownChildPath(path)
    ) {
      navigate('/home', { replace: true })
    }
  }, [navigate, path, state.settings])

  if (!state.settings) {
    return path === '/onboarding_age_select' ? (
      <AgeTierSelect onSelect={onSelectTier} />
    ) : null
  }

  let screen = null
  if (path === '/home' || path === '/') {
    screen = <HomeScreen settings={state.settings} />
  } else if (path === '/categories') {
    screen = <CategoriesScreen settings={state.settings} />
  } else if (path.startsWith('/category_detail/')) {
    screen = (
      <CategoryDetailScreen
        categoryId={decodeURIComponent(path.slice('/category_detail/'.length))}
        settings={state.settings}
      />
    )
  } else if (path.startsWith('/puzzle_play/')) {
    const puzzle = getPuzzleById(decodeURIComponent(path.slice('/puzzle_play/'.length)))
    screen = puzzle &&
      puzzle.tier_id === state.settings.active_tier_id &&
      isPuzzleAvailableOn(puzzle) ? (
      <PuzzlePlayScreen
        puzzle={puzzle}
        settings={state.settings}
        onPersistenceUnavailable={() =>
          setState((prev) => ({ ...prev, persistenceAvailable: false }))
        }
      />
    ) : (
      <PlaceholderScreen icon="🧩" name="Puzzle not found" sentence="Choose another puzzle to play." />
    )
  } else if (path.startsWith('/puzzle_complete/')) {
    const puzzle = getPuzzleById(decodeURIComponent(path.slice('/puzzle_complete/'.length)))
    screen = puzzle &&
      puzzle.tier_id === state.settings.active_tier_id &&
      isPuzzleAvailableOn(puzzle) ? (
      <PuzzleCompleteScreen puzzle={puzzle} settings={state.settings} />
    ) : (
      <PlaceholderScreen icon="🎉" name="Puzzle not found" sentence="Choose another puzzle to play." />
    )
  } else if (path === '/my_puzzles') {
    screen = <MyPuzzlesScreen settings={state.settings} />
  } else if (path === '/rewards') {
    screen = <RewardsScreen settings={state.settings} />
  } else if (path === '/settings') {
    screen = (
      <ChildSettings settings={state.settings} onChange={onSettingsChange} />
    )
  } else if (path === '/parent_gate') {
    screen = <ParentGateScreen onGateOpened={onParentAccessRevoked} onVerified={onParentVerified} />
  } else if (path === '/parent_zone_home') {
    screen = <ParentZoneHome settings={state.settings} onChange={onSettingsChange} />
  } else if (path === '/parent_tier_override') {
    screen = <ParentTierOverride settings={state.settings} onChange={onSettingsChange} />
  } else if (path === '/parent_screen_time') {
    screen = <ParentScreenTime settings={state.settings} onChange={onSettingsChange} />
  } else if (path === '/parent_privacy') {
    screen = <ParentPrivacy onDataDeleted={onDataDeleted} />
  } else if (path === '/parent_subscription') {
    screen = <PlaceholderScreen icon="🔒" name="Subscription Management" sentence="Monetization is deferred until Phase 4 is explicitly chosen." />
  }

  if (!screen) return null

  if (parentOnlyPaths.has(path)) {
    return <ParentLayout>{screen}</ParentLayout>
  }

  return (
    <ChildLayout
      settings={state.settings}
      persistenceAvailable={state.persistenceAvailable}
    >
      {screen}
      {reminderVisible && (
        <ScreenTimeReminder
          onDismiss={() => {
            setReminderVisible(false)
            setReminderCycle((cycle) => cycle + 1)
          }}
        />
      )}
    </ChildLayout>
  )
}

function App() {
  const [state, setState] = useState<AppState>({
    loading: true,
    settings: null,
    persistenceAvailable: true,
  })
  const settingsRef = useRef<UserSettings | null>(null)
  const [parentVerified, setParentVerified] = useState(false)

  useEffect(() => {
    let active = true
    void readUserSettings().then((result) => {
      if (!active) return
      settingsRef.current = result.value
      setState({
        loading: false,
        settings: result.value,
        persistenceAvailable: result.persistenceAvailable,
      })
    })
    return () => {
      active = false
    }
  }, [])

  const selectTier = async (tierId: TierId) => {
    const settings = createOnboardingSettings(tierId)
    settingsRef.current = settings
    const persisted = await writeUserSettings(settings)
    setState({ loading: false, settings, persistenceAvailable: persisted })
  }

  const updateSettings = async (change: Partial<UserSettings>) => {
    const current = settingsRef.current
    if (!current) return
    const settings = { ...current, ...change }
    settingsRef.current = settings
    setState((previous) => ({ ...previous, settings }))
    const persisted = await writeUserSettings(settings)
    if (!persisted) {
      setState((previous) => ({ ...previous, persistenceAvailable: false }))
    }
  }

  const verifyParent = useCallback(() => setParentVerified(true), [])
  const revokeParentAccess = useCallback(() => setParentVerified(false), [])
  const handleDataDeleted = useCallback(() => {
    settingsRef.current = null
    setParentVerified(false)
    setState({ loading: false, settings: null, persistenceAvailable: true })
  }, [])

  if (state.loading) {
    return (
      <main className="loading-screen" aria-busy="true" aria-label="Opening Fitzee">
        <span aria-hidden="true">🧩</span>
        <strong>Fitzee</strong>
      </main>
    )
  }

  return (
    <I18nProvider language={state.settings?.language ?? 'en'}>
      <HashNavigationProvider>
        <AppRoutes
          state={state}
          onSelectTier={selectTier}
          onSettingsChange={updateSettings}
          parentVerified={parentVerified}
          onParentVerified={verifyParent}
          onParentAccessRevoked={revokeParentAccess}
          onDataDeleted={handleDataDeleted}
        />
      </HashNavigationProvider>
    </I18nProvider>
  )
}

export default App
