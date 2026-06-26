import type { ShootSession } from '../types/session'

interface SessionCardProps {
  session: ShootSession
  onOpen: () => void
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

export default function SessionCard({ session, onOpen }: SessionCardProps) {
  const total = session.shots.length
  const completed = session.shots.reduce(
    (n, s) => (s.completed ? n + 1 : n),
    0,
  )
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <li className="session-card">
      <button
        type="button"
        className="session-card-button"
        onClick={onOpen}
        aria-label={`Open ${session.name}`}
      >
        <div className="session-card-head">
          <div className="session-card-meta">
            <h2 className="session-card-title">📍 {session.name}</h2>
            <span className="session-card-date">
              {total} {total === 1 ? 'shot' : 'shots'} • {formatDate(session.date)}
            </span>
          </div>
          <span className="session-card-chevron" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="m9 6 6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        <div className="project-progress" aria-label={`${completed} of ${total} shots completed`}>
          <div className="project-progress-bar" aria-hidden="true">
            <div
              className="project-progress-fill"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="project-progress-text">
            {completed} / {total} completed
          </p>
        </div>
      </button>
    </li>
  )
}
