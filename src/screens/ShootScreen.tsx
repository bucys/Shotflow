import { useMemo, useState } from 'react'
import ShotCard from '../components/ShotCard'
import type { ShootSession } from '../types/session'

interface ShootScreenProps {
  session: ShootSession
  onBack: () => void
  onChange: (session: ShootSession) => void
}

function formatDate(date: string): string {
  if (!date) return 'No date set'
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ShootScreen({
  session,
  onBack,
  onChange,
}: ShootScreenProps) {
  const [expandedShots, setExpandedShots] = useState<Record<string, boolean>>({})
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  const allShots = useMemo(
    () => session.sections.flatMap((section) => section.shots),
    [session],
  )
  const total = allShots.length
  const doneCount = useMemo(
    () => allShots.reduce((n, s) => (s.completed ? n + 1 : n), 0),
    [allShots],
  )
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100)

  const toggleComplete = (id: string) =>
    onChange({
      ...session,
      sections: session.sections.map((section) => ({
        ...section,
        shots: section.shots.map((shot) =>
          shot.id === id ? { ...shot, completed: !shot.completed } : shot,
        ),
      })),
    })

  const toggleShotExpanded = (id: string) =>
    setExpandedShots((prev) => ({ ...prev, [id]: !prev[id] }))

  const toggleSectionCollapsed = (id: string) =>
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleReset = () => {
    const ok = window.confirm(
      'Reset progress? This will mark all shots as not completed.',
    )
    if (ok)
      onChange({
        ...session,
        sections: session.sections.map((section) => ({
          ...section,
          shots: section.shots.map((shot) => ({ ...shot, completed: false })),
        })),
      })
  }

  return (
    <div className="app">
      <header className="header shoot-header">
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

        <h1 className="title shoot-title">{session.name}</h1>
        <p className="shoot-date">{formatDate(session.date)}</p>

        <section className="progress progress--shoot" aria-label="Shoot progress">
          <div className="progress-label">Progress</div>
          <div className="progress-row">
            <span className="progress-completed">
              {doneCount} / {total} completed
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
        </section>

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
        <div className="section-list">
          {session.sections.map((section) => {
            const sectionTotal = section.shots.length
            const sectionCompleted = section.shots.reduce(
              (count, shot) => (shot.completed ? count + 1 : count),
              0,
            )
            const isCollapsed = !!collapsedSections[section.id]

            return (
              <section key={section.id} className="shoot-section">
                <button
                  type="button"
                  className="section-header"
                  onClick={() => toggleSectionCollapsed(section.id)}
                  aria-expanded={!isCollapsed}
                >
                  <span className={`section-chevron${isCollapsed ? '' : ' section-chevron--open'}`}>
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <path
                        d="m6 9 6 6 6-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="section-title">{section.name}</span>
                  <span className="section-progress">
                    {sectionCompleted} / {sectionTotal}
                  </span>
                </button>

                {!isCollapsed && (
                  <ul className="shot-list shot-list--section">
                    {section.shots.map((shot) => (
                      <ShotCard
                        key={shot.id}
                        shot={shot}
                        expanded={!!expandedShots[shot.id]}
                        onToggleCompleted={() => toggleComplete(shot.id)}
                        onToggleExpanded={() => toggleShotExpanded(shot.id)}
                      />
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      </main>

      <footer className="footer">
        <p>ShotFlow · {doneCount === total ? 'All shots captured 🎬' : 'Tap a circle to mark a shot complete'}</p>
      </footer>
    </div>
  )
}
