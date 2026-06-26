interface ProgressBarProps {
  completed: number
  total: number
}

export default function ProgressBar({ completed, total }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className="progress">
      <div className="progress-row">
        <span className="progress-count">
          {completed} <span className="progress-of">/ {total}</span>
        </span>
        <span className="progress-percent">{percent}%</span>
      </div>
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Shots completed"
      >
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
