import { useEffect, useRef, type ReactNode } from 'react'
import { getTierDefinition } from '../constants/tiers'
import {
  playNavigationCue,
  startBackgroundMusic,
  stopBackgroundMusic,
} from '../utils/audio'
import type { UserSettings } from '../../data/models'
import { HashLink } from './hashNavigation'
import { useHashNavigation } from './useHashNavigation'
import { useI18n } from '../../i18n/i18n'

interface ChildLayoutProps {
  settings: UserSettings
  persistenceAvailable: boolean
  children: ReactNode
}

const bottomNavigation = [
  { to: '/home', icon: '🏠', labelKey: 'nav.home' },
  { to: '/categories', icon: '🖼️', labelKey: 'nav.categories' },
  { to: '/my_puzzles', icon: '🧩', labelKey: 'nav.myPuzzles' },
  { to: '/rewards', icon: '⭐', labelKey: 'nav.rewards' },
] as const

export function ChildLayout({
  settings,
  persistenceAvailable,
  children,
}: ChildLayoutProps) {
  const { path, goBack } = useHashNavigation()
  const { t, tierName } = useI18n()
  const tier = getTierDefinition(settings.active_tier_id)
  const isHome = path === '/home'
  const isYoungTier =
    settings.active_tier_id === 'tiny_tots' ||
    settings.active_tier_id === 'little_explorers'
  const cue = () => playNavigationCue(settings.sound_enabled)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true })
  }, [path])

  useEffect(() => {
    if (!settings.music_enabled) stopBackgroundMusic()
    return () => stopBackgroundMusic()
  }, [settings.music_enabled])

  const unlockMusic = () => {
    if (settings.music_enabled) startBackgroundMusic()
  }

  return (
    <div
      className={`app-frame tier-${settings.active_tier_id}${isYoungTier ? ' young-tier' : ''}${settings.large_touch_targets_enabled ? ' large-touch-targets' : ''}`}
      onPointerDownCapture={unlockMusic}
      onKeyDownCapture={unlockMusic}
    >
      <header className="top-bar">
        <div className="top-bar__side top-bar__side--start">
          {!isHome && (
            <button
              className="icon-button"
              type="button"
              aria-label={t('nav.back')}
              onPointerDown={cue}
              onClick={goBack}
            >
              <span aria-hidden="true">←</span>
            </button>
          )}
        </div>

        <div className="brand-lockup" aria-label={`Fitzee, ${tierName(tier.id)}`}>
          <span className="brand-lockup__name">Fitzee</span>
          <span className="brand-lockup__tier">{tierName(tier.id)}</span>
        </div>

        <div className="top-bar__side top-bar__side--end">
          <HashLink
            className="icon-button"
            to="/settings"
            aria-label={t('nav.settings')}
            onPointerDown={cue}
          >
            <span aria-hidden="true">⚙️</span>
          </HashLink>
          <HashLink
            className="icon-button"
            to="/parent_gate"
            aria-label={t('nav.parentGate')}
            onPointerDown={cue}
          >
            <span aria-hidden="true">🔒</span>
          </HashLink>
        </div>
      </header>

      {!persistenceAvailable && (
        <p className="storage-notice" role="status">
          {t('storage.notice')}
        </p>
      )}

      <main className="screen-content" id="main-content" ref={mainRef} tabIndex={-1}>
        {children}
      </main>

      <nav className="bottom-nav" aria-label="Play navigation">
        {bottomNavigation.map(({ to, icon, labelKey }) => {
          const label = t(labelKey)
          return (
          <HashLink
            key={to}
            className={`bottom-nav__item${path === to ? ' bottom-nav__item--active' : ''}`}
            to={to}
            onPointerDown={cue}
            aria-current={path === to ? 'page' : undefined}
          >
            <span className="bottom-nav__icon" aria-hidden="true">
              {icon}
            </span>
            <span>{label}</span>
          </HashLink>
          )
        })}
      </nav>
    </div>
  )
}
