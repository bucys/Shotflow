import { useState } from 'react'
import HomeScreen from './screens/HomeScreen'
import ShootScreen from './screens/ShootScreen'
import CreateProjectScreen from './screens/CreateProjectScreen'
import { loadSessions, saveSession } from './storage/storage'
import type { ShootSession } from './types/session'

export default function App() {
  const [sessions, setSessions] = useState<ShootSession[]>(loadSessions)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const activeSession = activeId
    ? sessions.find((s) => s.id === activeId) ?? null
    : null

  const updateSession = (updated: ShootSession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s)),
    )
    saveSession(updated)
  }

  const createSession = (session: ShootSession) => {
    setSessions((prev) => [...prev, session])
    saveSession(session)
    setCreating(false)
  }

  if (creating) {
    return (
      <CreateProjectScreen
        onCancel={() => setCreating(false)}
        onCreate={createSession}
      />
    )
  }

  if (activeSession) {
    return (
      <ShootScreen
        session={activeSession}
        onBack={() => setActiveId(null)}
        onChange={updateSession}
      />
    )
  }

  return (
    <HomeScreen
      sessions={sessions}
      onOpenSession={setActiveId}
      onCreateProject={() => setCreating(true)}
    />
  )
}
