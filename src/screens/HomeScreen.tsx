import SessionCard from '../components/SessionCard'
import type { ShootSession } from '../types/session'

interface HomeScreenProps {
  sessions: ShootSession[]
  onOpenSession: (id: string) => void
  onCreateProject: () => void
}

export default function HomeScreen({
  sessions,
  onOpenSession,
  onCreateProject,
}: HomeScreenProps) {
  const hasProjects = sessions.length > 0

  return (
    <div className={`app${hasProjects ? '' : ' app--empty-home'}`}>
      <header className="header">
        <h1 className="title">ShotFlow</h1>
        <p className="subtitle">Projects</p>
      </header>

      <main className={hasProjects ? undefined : 'empty-state'}>
        {hasProjects ? (
          <ul className="session-list">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onOpen={() => onOpenSession(session.id)}
              />
            ))}
          </ul>
        ) : (
          <div className="empty-state-content">
            <h2>No projects yet</h2>
            <p>Create your first project to start planning your next shoot.</p>
          </div>
        )}
      </main>

      <button
        type="button"
        className="fab"
        onClick={onCreateProject}
        aria-label="Create project"
      >
        +
      </button>
    </div>
  )
}
