import type { Shot } from '../types/shot'

interface ShotCardProps {
  shot: Shot
  expanded: boolean
  onToggleCompleted: () => void
  onToggleExpanded: () => void
}

export default function ShotCard({
  shot,
  expanded,
  onToggleCompleted,
  onToggleExpanded,
}: ShotCardProps) {
  const isDone = shot.completed
  const isOpen = expanded
  const descId = `${shot.id}-desc`
  const indexMatch = shot.id.match(/(\d+)$/)
  const indexLabel = (indexMatch ? indexMatch[1] : '').padStart(2, '0')

  return (
    <li className={`card${isDone ? ' card--done' : ''}`}>
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
          onClick={onToggleCompleted}
        >
          {isDone && (
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
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
          <span className="card-index">Shot {indexLabel}</span>
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
          onClick={onToggleExpanded}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
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
}
