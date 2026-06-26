import ProgressBar from './ProgressBar'
import type { ShootSession } from '../types/session'

interface SessionCardProps {
  session: ShootSession
  onOpen: () => void
}

function formatDate(date: string): string {
  if (!date) return 'No date set'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function SessionCard({ session, onOpen }: SessionCardProps) {
  const total = session.shots.length
  const completed = session.shots.reduce(
    (n, s) => (s.completed ? n + 1 : n),
    0,
  )

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
            <h2 className="session-card-title">{session.name}</h2>
            <span className="session-card-date">{formatDate(session.date)}</span>
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

        <ProgressBar completed={completed} total={total} />
      </button>
    </li>
  )
}
