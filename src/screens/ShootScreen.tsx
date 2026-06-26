import { useMemo, useState } from 'react'
import ProgressBar from '../components/ProgressBar'
import ShotCard from '../components/ShotCard'
import type { ShootSession } from '../types/session'

interface ShootScreenProps {
  session: ShootSession
  onBack: () => void
  onChange: (session: ShootSession) => void
}

export default function ShootScreen({
  session,
  onBack,
  onChange,
}: ShootScreenProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const total = session.shots.length
  const doneCount = useMemo(
    () => session.shots.reduce((n, s) => (s.completed ? n + 1 : n), 0),
    [session],
  )

  const toggleComplete = (id: string) =>
    onChange({
      ...session,
      shots: session.shots.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s,
      ),
    })

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleReset = () => {
    const ok = window.confirm(
      'Reset progress? This will mark all shots as not completed.',
    )
    if (ok)
      onChange({
        ...session,
        shots: session.shots.map((s) => ({ ...s, completed: false })),
      })
  }

  return (
    <div className="app">
      <header className="header">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
          aria-label="Back to projects"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="m15 6-6 6 6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>

        <p className="eyebrow">Shoot</p>
        <h1 className="title">{session.name}</h1>

        <ProgressBar completed={doneCount} total={total} />

        <button
          type="button"
          className="reset-button"
          onClick={handleReset}
          disabled={doneCount === 0}
        >
          Reset Progress
        </button>
      </header>

      <main>
        <ul className="shot-list">
          {session.shots.map((shot) => (
            <ShotCard
              key={shot.id}
              shot={shot}
              expanded={!!expanded[shot.id]}
              onToggleCompleted={() => toggleComplete(shot.id)}
              onToggleExpanded={() => toggleExpand(shot.id)}
            />
          ))}
        </ul>
      </main>

      <footer className="footer">
        <p>ShotFlow · {doneCount === total ? 'All shots captured 🎬' : 'Tap a circle to mark a shot complete'}</p>
      </footer>
    </div>
  )
}
