import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useHashNavigation } from '../../core/navigation/useHashNavigation'
import {
  playNarration,
  playPieceSnapCue,
  vibrateSuccess,
} from '../../core/utils/audio'
import type { PuzzleCatalogEntry } from '../../data/content/puzzleCatalog'
import type { UserSettings } from '../../data/models'
import {
  readPuzzleProgress,
  writePuzzleProgress,
} from '../../data/repositories/puzzleProgressRepository'
import {
  getPuzzleTierConfig,
  isCorrectRotation,
  isWithinSnapTolerance,
  PUZZLE_TIER_CONFIG,
  rotateClockwise,
} from './engineMath'
import { awardPuzzleCompletion } from '../rewards/rewardService'
import { recordCompletionReceipt } from '../completion/completionReceipt'
import { useI18n } from '../../i18n/i18n'
import {
  LOGICAL_BOARD_SIZE,
  renderPuzzlePieces,
  type RenderedPuzzlePiece,
} from './renderPieces'

interface PuzzlePlayScreenProps {
  puzzle: PuzzleCatalogEntry
  settings: UserSettings
  paused?: boolean
  onPersistenceUnavailable: () => void
}

interface LoosePosition {
  left: number
  top: number
}

interface DragState {
  pieceId: string
  startX: number
  startY: number
  clientX: number
  clientY: number
  moved: boolean
}

function pieceStyle(piece: RenderedPuzzlePiece, position: LoosePosition): CSSProperties {
  return {
    left: `${(position.left / LOGICAL_BOARD_SIZE) * 100}%`,
    top: `${(position.top / LOGICAL_BOARD_SIZE) * 100}%`,
    width: `${(piece.logicalWidth / LOGICAL_BOARD_SIZE) * 100}%`,
    height: `${(piece.logicalHeight / LOGICAL_BOARD_SIZE) * 100}%`,
  }
}

export function PuzzlePlayScreen({
  puzzle,
  settings,
  paused = false,
  onPersistenceUnavailable,
}: PuzzlePlayScreenProps) {
  const { t, language, puzzleName } = useI18n()
  const { navigate } = useHashNavigation()
  const boardRef = useRef<HTMLDivElement>(null)
  const [pieces, setPieces] = useState<RenderedPuzzlePiece[]>([])
  const [placed, setPlaced] = useState<Set<string>>(new Set())
  const [loose, setLoose] = useState<Record<string, LoosePosition>>({})
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [returningPieceId, setReturningPieceId] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [rotations, setRotations] = useState<Record<string, number>>({})
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [timerHidden, setTimerHidden] = useState(false)
  const [pageVisible, setPageVisible] = useState(
    () => document.visibilityState !== 'hidden',
  )
  const [loadingError, setLoadingError] = useState(false)
  const [resumeReady, setResumeReady] = useState(false)
  const startingCompletionCount = useRef(0)
  const startingFirstCompletion = useRef<string | null>(null)
  const startingBestTime = useRef<number | null>(null)
  const accumulatedElapsedSeconds = useRef(0)
  const activeTimerStartedAt = useRef<number | null>(null)
  const targetRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const rotateButtonRef = useRef<HTMLButtonElement>(null)
  const suppressClickPieceId = useRef<string | null>(null)
  const config = useMemo(
    () => getPuzzleTierConfig(puzzle.tier_id, {
      bigKidsRotationEnabled: settings.big_kids_rotation_enabled,
      bigKidsTimerEnabled: settings.big_kids_timer_enabled,
    }),
    [
      puzzle.tier_id,
      settings.big_kids_rotation_enabled,
      settings.big_kids_timer_enabled,
    ],
  )

  useEffect(() => {
    let active = true
    setPieces([])
    setPlaced(new Set())
    setLoose({})
    setLoadingError(false)
    setResumeReady(false)
    setElapsedSeconds(0)
    setTimerHidden(false)
    accumulatedElapsedSeconds.current = 0
    activeTimerStartedAt.current = null

    void Promise.all([
      renderPuzzlePieces(puzzle.sourceUrl, puzzle.piece_count, puzzle.tier_id),
      readPuzzleProgress(puzzle.puzzle_id),
    ])
      .then(([rendered, progressResult]) => {
        if (!active) return
        const progress = progressResult.value
        startingCompletionCount.current = progress?.times_completed ?? 0
        startingFirstCompletion.current = progress?.first_completed_at ?? null
        startingBestTime.current = progress?.best_time_seconds ?? null
        const resumeCount = progress?.status === 'in_progress'
          ? Math.min(progress.pieces_placed, rendered.length)
          : 0
        setPieces(rendered)
        setRotations(Object.fromEntries(rendered.map((piece) => [
          piece.id,
          config.rotationEnabled ? (piece.index % 4) * 90 : 0,
        ])))
        setPlaced(new Set(rendered.slice(0, resumeCount).map((piece) => piece.id)))
        setResumeReady(true)
      })
      .catch(() => {
        if (active) setLoadingError(true)
      })

    return () => {
      active = false
    }
  }, [config.rotationEnabled, puzzle])

  useEffect(() => {
    const handleVisibility = () => {
      setPageVisible(document.visibilityState !== 'hidden')
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const timerRunning =
    config.showTimer && resumeReady && pieces.length > 0 && pageVisible && !paused

  useEffect(() => {
    if (!timerRunning) return
    const segmentStartedAt = performance.now()
    activeTimerStartedAt.current = segmentStartedAt
    const updateElapsed = () => {
      setElapsedSeconds(Math.floor(
        accumulatedElapsedSeconds.current +
        (performance.now() - segmentStartedAt) / 1000,
      ))
    }
    updateElapsed()
    const timer = window.setInterval(updateElapsed, 250)
    return () => {
      window.clearInterval(timer)
      accumulatedElapsedSeconds.current +=
        (performance.now() - segmentStartedAt) / 1000
      activeTimerStartedAt.current = null
      setElapsedSeconds(Math.floor(accumulatedElapsedSeconds.current))
    }
  }, [puzzle.puzzle_id, timerRunning])

  useEffect(() => {
    if (!resumeReady || pieces.length === 0) return
    playNarration(
      settings.narration_enabled,
      language,
      `${puzzleName(puzzle.display_name)}. ${t('puzzle.instruction')}`,
    )
  }, [language, pieces.length, puzzle.display_name, puzzleName, resumeReady, settings.narration_enabled, t])

  const remainingPieces = useMemo(
    () => pieces.filter((piece) => !placed.has(piece.id)),
    [pieces, placed],
  )

  const currentElapsedSeconds = () =>
    accumulatedElapsedSeconds.current +
    (activeTimerStartedAt.current === null
      ? 0
      : (performance.now() - activeTimerStartedAt.current) / 1000)

  const createProgress = (nextPlaced: Set<string>) => {
    const completed = nextPlaced.size === pieces.length
    const completionTime = completed && config.showTimer
      ? Math.max(1, Math.ceil(currentElapsedSeconds()))
      : null
    return {
      puzzle_id: puzzle.puzzle_id,
      status: completed ? 'completed' as const : 'in_progress' as const,
      pieces_placed: nextPlaced.size,
      piece_count: pieces.length,
      first_completed_at: completed
        ? startingFirstCompletion.current ?? new Date().toISOString()
        : startingFirstCompletion.current,
      times_completed: completed
        ? startingCompletionCount.current + 1
        : startingCompletionCount.current,
      best_time_seconds: completionTime === null
        ? startingBestTime.current
        : Math.min(startingBestTime.current ?? completionTime, completionTime),
    }
  }

  const placePiece = (piece: RenderedPuzzlePiece) => {
    if (placed.has(piece.id)) return
    const nextPlaced = new Set(placed)
    nextPlaced.add(piece.id)
    setPlaced(nextPlaced)
    setSelectedPieceId(null)
    setLoose((current) => {
      const next = { ...current }
      delete next[piece.id]
      return next
    })
    playPieceSnapCue(settings.sound_enabled)
    vibrateSuccess()
    if (nextPlaced.size === pieces.length) {
      const progress = createProgress(nextPlaced)
      void awardPuzzleCompletion(progress, puzzle.tier_id).then((result) => {
        if (!result.persistenceAvailable) onPersistenceUnavailable()
        startingCompletionCount.current = result.progress.times_completed
        startingFirstCompletion.current = result.progress.first_completed_at
        startingBestTime.current = result.progress.best_time_seconds
        recordCompletionReceipt({
          puzzleId: puzzle.puzzle_id,
          completionNumber: result.progress.times_completed,
          unlockedRewards: result.unlockedRewards,
          persistenceAvailable: result.persistenceAvailable,
        })
        navigate(`/puzzle_complete/${encodeURIComponent(puzzle.puzzle_id)}`)
      })
    } else {
      void writePuzzleProgress(createProgress(nextPlaced)).then((persisted) => {
        if (!persisted) onPersistenceUnavailable()
      })
    }
  }

  const finishDrag = (
    event: ReactPointerEvent<HTMLButtonElement>,
    piece: RenderedPuzzlePiece,
  ) => {
    const dragState = drag
    if (dragState?.pieceId !== piece.id) return
    const board = boardRef.current?.getBoundingClientRect()
    setDrag(null)
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    if (!dragState.moved) return
    suppressClickPieceId.current = piece.id
    if (!board) return

    const logicalX = ((event.clientX - board.left) / board.width) * LOGICAL_BOARD_SIZE
    const logicalY = ((event.clientY - board.top) / board.height) * LOGICAL_BOARD_SIZE
    const cellSize = Math.min(piece.logicalWidth, piece.logicalHeight) *
      (puzzle.tier_id === 'tiny_tots' ? 0.96 : 0.68)
    if (
      isCorrectRotation(rotations[piece.id] ?? 0) &&
      isWithinSnapTolerance(
        logicalX,
        logicalY,
        piece.targetCenterX,
        piece.targetCenterY,
        cellSize,
        config.snapToleranceRatio,
      )
    ) {
      placePiece(piece)
      return
    }

    if (!config.returnToTrayOnMiss) {
      setLoose((current) => ({
        ...current,
        [piece.id]: {
          left: Math.max(
            -piece.logicalWidth * 0.25,
            Math.min(LOGICAL_BOARD_SIZE - piece.logicalWidth * 0.75, logicalX - piece.logicalWidth / 2),
          ),
          top: Math.max(
            -piece.logicalHeight * 0.25,
            Math.min(LOGICAL_BOARD_SIZE - piece.logicalHeight * 0.75, logicalY - piece.logicalHeight / 2),
          ),
        },
      }))
    } else {
      setReturningPieceId(piece.id)
      window.setTimeout(() => setReturningPieceId(null), 420)
    }
  }

  const beginDrag = (
    event: ReactPointerEvent<HTMLButtonElement>,
    piece: RenderedPuzzlePiece,
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setSelectedPieceId(piece.id)
    setDrag({
      pieceId: piece.id,
      startX: event.clientX,
      startY: event.clientY,
      clientX: event.clientX,
      clientY: event.clientY,
      moved: false,
    })
  }

  const moveDrag = (
    event: ReactPointerEvent<HTMLButtonElement>,
    piece: RenderedPuzzlePiece,
  ) => {
    if (drag?.pieceId !== piece.id) return
    setDrag({
      ...drag,
      clientX: event.clientX,
      clientY: event.clientY,
      moved:
        drag.moved ||
        Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) >= 8,
    })
  }

  const selectForAlternateInput = (piece: RenderedPuzzlePiece) => {
    setSelectedPieceId(piece.id)
    window.setTimeout(() => {
      if (config.rotationEnabled && !isCorrectRotation(rotations[piece.id] ?? 0)) {
        rotateButtonRef.current?.focus()
      } else {
        targetRefs.current[piece.id]?.focus()
      }
    })
  }

  const renderPieceButton = (
    piece: RenderedPuzzlePiece,
    className: string,
    style?: CSSProperties,
  ) => (
    <button
      className={`${className}${selectedPieceId === piece.id ? ' puzzle-piece--selected' : ''}${returningPieceId === piece.id ? ' puzzle-piece--returning' : ''}`}
      type="button"
      key={piece.id}
      aria-label={t('puzzle.pieceLabel', { index: piece.index + 1, count: pieces.length })}
      aria-pressed={selectedPieceId === piece.id}
      style={{
        ...style,
        '--piece-rotation': `${rotations[piece.id] ?? 0}deg`,
      } as CSSProperties}
      onPointerDown={(event) => beginDrag(event, piece)}
      onPointerMove={(event) => moveDrag(event, piece)}
      onPointerUp={(event) => finishDrag(event, piece)}
      onPointerCancel={() => setDrag(null)}
      onClick={() => {
        if (suppressClickPieceId.current === piece.id) {
          suppressClickPieceId.current = null
          return
        }
        selectForAlternateInput(piece)
      }}
    >
      <img src={piece.imageUrl} alt="" draggable={false} />
    </button>
  )

  if (loadingError) {
    return (
      <section className="screen-card" role="alert">
        <div className="screen-icon" aria-hidden="true">🧩</div>
        <h1>{t('puzzle.errorTitle')}</h1>
        <p>{t('puzzle.errorText')}</p>
        <button className="primary-button" type="button" onClick={() => window.location.reload()}>
          {t('puzzle.tryAgain')}
        </button>
      </section>
    )
  }

  return (
    <section className="puzzle-play" aria-labelledby="puzzle-play-title">
      <header className="puzzle-play__heading">
        <div>
          <p className="eyebrow">{t('card.pieces', { count: puzzle.piece_count })}</p>
          <h1 id="puzzle-play-title">{puzzleName(puzzle.display_name)}</h1>
        </div>
        <div className="piece-progress" aria-live="polite">
          <strong>{placed.size}</strong>
          <span>{t('puzzle.of', { count: puzzle.piece_count })}</span>
        </div>
        {config.showTimer && (
          <button
            className="puzzle-timer"
            type="button"
            aria-label={t('puzzle.timerLabel', {
              time: `${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, '0')}`,
            })}
            onClick={() => setTimerHidden((hidden) => !hidden)}
          >
            <span aria-hidden="true">⏱️</span>
            <span>{timerHidden ? t('puzzle.showTimer') : `${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, '0')}`}</span>
          </button>
        )}
      </header>

      <p className="puzzle-instruction">
        {selectedPieceId ? t('puzzle.selected') : t('puzzle.instruction')}
      </p>

      {config.hintMode === 'hold' && (
        <button
          className="hint-button"
          type="button"
          onPointerDown={() => setShowHint(true)}
          onPointerUp={() => setShowHint(false)}
          onPointerCancel={() => setShowHint(false)}
          onPointerLeave={() => setShowHint(false)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') setShowHint(true)
          }}
          onKeyUp={() => setShowHint(false)}
          onBlur={() => setShowHint(false)}
        >
          <span aria-hidden="true">👀</span> {t('puzzle.hint')}
        </button>
      )}

      {config.rotationEnabled && (
        <button
          className="rotate-button"
          type="button"
          ref={rotateButtonRef}
          disabled={!selectedPieceId}
          onClick={() => {
            if (!selectedPieceId) return
            setRotations((current) => ({
              ...current,
              [selectedPieceId]: rotateClockwise(current[selectedPieceId] ?? 0),
            }))
          }}
        >
          <span aria-hidden="true">↻</span> {t('puzzle.rotate')}
        </button>
      )}

      <div className="puzzle-workspace">
        <div
          className={`puzzle-board puzzle-board--${puzzle.tier_id}${showHint ? ' puzzle-board--hinting' : ''}`}
          ref={boardRef}
          aria-label={t('puzzle.boardLabel')}
          style={{ backgroundImage: config.hintMode === 'always' || (config.hintMode === 'fade' && placed.size === 0) || showHint ? `url(${puzzle.sourceUrl})` : undefined }}
        >
          {pieces.map((piece) => {
            const correct = { left: piece.correctLeft, top: piece.correctTop }
            if (placed.has(piece.id)) {
              return (
                <img
                  className="placed-piece"
                  src={piece.imageUrl}
                  alt=""
                  key={piece.id}
                  style={pieceStyle(piece, correct)}
                />
              )
            }
            const loosePosition = loose[piece.id]
            return (
              <div key={`slot-${piece.id}`}>
                <button
                  className="puzzle-target"
                  type="button"
                  ref={(node) => {
                    targetRefs.current[piece.id] = node
                  }}
                  aria-label={t('puzzle.targetLabel', { index: piece.index + 1 })}
                  tabIndex={selectedPieceId === piece.id ? 0 : -1}
                  style={pieceStyle(piece, correct)}
                  onClick={() => {
                    if (selectedPieceId === piece.id && isCorrectRotation(rotations[piece.id] ?? 0)) placePiece(piece)
                  }}
                />
                {loosePosition && renderPieceButton(piece, 'loose-piece', pieceStyle(piece, loosePosition))}
              </div>
            )
          })}
        </div>

        <aside className="piece-tray" aria-label={t('puzzle.trayLabel')}>
          {!resumeReady || pieces.length === 0 ? (
            <p className="puzzle-loading" role="status">{t('puzzle.loading')}</p>
          ) : remainingPieces.filter((piece) => !loose[piece.id]).length === 0 ? (
            <p className="tray-message">{t('puzzle.allBoard')}</p>
          ) : (
            remainingPieces
              .filter((piece) => !loose[piece.id])
              .map((piece) => renderPieceButton(piece, 'tray-piece'))
          )}
        </aside>
      </div>

      {drag?.moved && (() => {
        const piece = pieces.find((candidate) => candidate.id === drag.pieceId)
        if (!piece) return null
        const boardWidth = boardRef.current?.getBoundingClientRect().width ?? 500
        return (
          <img
            className="drag-preview"
            src={piece.imageUrl}
            alt=""
            style={{
              left: drag.clientX,
              top: drag.clientY,
              width: (piece.logicalWidth / LOGICAL_BOARD_SIZE) * boardWidth,
              transform: `translate(-50%, -50%) rotate(${rotations[piece.id] ?? 0}deg) scale(1.04)`,
            }}
          />
        )
      })()}
    </section>
  )
}
