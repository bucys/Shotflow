import SessionCard from '../components/SessionCard'
import type { ShootSession } from '../types/session'

interface HomeScreenProps {
  sessions: ShootSession[]
  onOpenSession: (id: string) => void
}

export default function HomeScreen({ sessions, onOpenSession }: HomeScreenProps) {
  return (
    <div className="app">
      <header className="header">
        <h1 className="title">ShotFlow</h1>
        <p className="subtitle">Saved Shoots</p>
      </header>

      <main>
        <ul className="session-list">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onOpen={() => onOpenSession(session.id)}
            />
          ))}
        </ul>
      </main>
    </div>
  )
}
