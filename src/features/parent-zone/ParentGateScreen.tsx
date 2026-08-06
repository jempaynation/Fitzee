import { useEffect, useState } from 'react'
import { useHashNavigation } from '../../core/navigation/useHashNavigation'
import {
  isParentGateAnswerCorrect,
  PARENT_GATE_QUESTION,
} from './parentGate'

export function ParentGateScreen({
  onGateOpened,
  onVerified,
}: {
  onGateOpened: () => void
  onVerified: () => void
}) {
  const { navigate } = useHashNavigation()
  const [answer, setAnswer] = useState('')
  const correct = isParentGateAnswerCorrect(answer)

  useEffect(() => onGateOpened(), [onGateOpened])

  return (
    <section className="screen-card parent-gate" aria-labelledby="parent-gate-title">
      <div className="screen-icon" aria-hidden="true">🔒</div>
      <p className="eyebrow">Grown-ups only</p>
      <h1 id="parent-gate-title">Parent check</h1>
      <p>Answer the math question to open Parent Zone.</p>
      <form
        className="parent-gate__form"
        onSubmit={(event) => {
          event.preventDefault()
          if (!correct) return
          onVerified()
          navigate('/parent_zone_home', { replace: true })
        }}
      >
        <label htmlFor="parent-answer">What is {PARENT_GATE_QUESTION}?</label>
        <input
          id="parent-answer"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={answer}
          onChange={(event) => setAnswer(event.target.value.replace(/\D/g, '').slice(0, 3))}
        />
        <button className="primary-button" type="submit" disabled={!correct}>
          Open Parent Zone
        </button>
      </form>
    </section>
  )
}
