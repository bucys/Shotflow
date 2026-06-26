import { useEffect, useMemo, useState } from 'react'
import { SHOOT_TITLE, SHOTS } from './shots'

const STORAGE_KEY = 'shotflow:trakai:completed'

type CompletedMap = Record<string, boolean>

function loadCompleted(): CompletedMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed as CompletedMap
    return {}
  } catch {
    return {}
  }
}

export default function App() {
  const [completed, setCompleted] = useState<CompletedMap>(loadCompleted)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed))
    } catch {
      /* ignore persistence errors */
    }
  }, [completed])

  const total = SHOTS.length
  const doneCount = useMemo(
    () => SHOTS.reduce((n, s) => (completed[s.id] ? n + 1 : n), 0),
    [completed],
  )
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100)

  const toggleComplete = (id: string) =>
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }))

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleReset = () => {
    const ok = window.confirm(
      'Reset progress? This will mark all shots as not completed.',
    )
    if (ok) setCompleted({})
  }

  return (
    <div className="app">
      <header className="header">
        <p className="eyebrow">Shoot</p>
        <h1 className="title">{SHOOT_TITLE}</h1>

        <div className="progress">
          <div className="progress-row">
            <span className="progress-count">
              {doneCount} <span className="progress-of">/ {total}</span>
            </span>
            <span className="progress-percent">{percent}%</span>
          </div>
          <div
            className="progress-bar"
            role="progressbar"
            aria-valuenow={doneCount}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label="Shots completed"
          >
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>

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
          {SHOTS.map((shot, index) => {
            const isDone = !!completed[shot.id]
            const isOpen = !!expanded[shot.id]
            const descId = `${shot.id}-desc`
            return (
              <li
                key={shot.id}
                className={`card${isDone ? ' card--done' : ''}`}
              >
                <div className="card-main">
                  <button
                    type="button"
                    className={`status${isDone ? ' status--done' : ''}`}
                    aria-pressed={isDone}
                    aria-label={
                      isDone
                        ? `Mark "${shot.title}" as not completed`
                        : `Mark "${shot.title}" as completed`
                    }
                    onClick={() => toggleComplete(shot.id)}
                  >
                    {isDone && (
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        aria-hidden="true"
                      >
                        <path
                          d="M20 6 9 17l-5-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>

                  <div className="card-body">
                    <span className="card-index">
                      Shot {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2 className="card-title">{shot.title}</h2>
                  </div>

                  <button
                    type="button"
                    className={`chevron${isOpen ? ' chevron--open' : ''}`}
                    aria-expanded={isOpen}
                    aria-controls={descId}
                    aria-label={
                      isOpen
                        ? `Collapse description for "${shot.title}"`
                        : `Expand description for "${shot.title}"`
                    }
                    onClick={() => toggleExpand(shot.id)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      aria-hidden="true"
                    >
                      <path
                        d="m6 9 6 6 6-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                {isOpen && (
                  <div id={descId} className="card-description">
                    {shot.description}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </main>

      <footer className="footer">
        <p>ShotFlow · {doneCount === total ? 'All shots captured 🎬' : 'Tap a circle to mark a shot complete'}</p>
      </footer>
    </div>
  )
}
