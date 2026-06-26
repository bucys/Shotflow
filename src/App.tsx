import { useEffect, useMemo, useState } from 'react'
import ProgressBar from './components/ProgressBar'
import ShotCard from './components/ShotCard'
import { loadSession, saveSession } from './storage/storage'
import type { ShootSession } from './types/session'

export default function App() {
  const [session, setSession] = useState<ShootSession>(loadSession)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    saveSession(session)
  }, [session])

  const total = session.shots.length
  const doneCount = useMemo(
    () => session.shots.reduce((n, s) => (s.completed ? n + 1 : n), 0),
    [session],
  )

  const toggleComplete = (id: string) =>
    setSession((prev) => ({
      ...prev,
      shots: prev.shots.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s,
      ),
    }))

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleReset = () => {
    const ok = window.confirm(
      'Reset progress? This will mark all shots as not completed.',
    )
    if (ok)
      setSession((prev) => ({
        ...prev,
        shots: prev.shots.map((s) => ({ ...s, completed: false })),
      }))
  }

  return (
    <div className="app">
      <header className="header">
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
