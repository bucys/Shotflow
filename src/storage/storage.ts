import defaultSession from '../data/defaultSession'
import availableSessions from '../data/sessions'
import type { ShootSession } from '../types/session'

/**
 * Multi-session-ready storage. Full sessions are saved so the Home screen can
 * render projects from localStorage. The default session seeds storage on
 * first run, and old Stage 2A completion-only progress is migrated forward.
 */
const SESSIONS_KEY = 'shotflow:sessions:v1'
const LEGACY_COMPLETED_KEY = 'shotflow:trakai:completed'
const STAGE_2B_COMPLETED_KEY = 'shotflow:sessions:completed:v2'

type CompletedMap = Record<string, boolean>
type SessionCompletedStore = Record<string, CompletedMap>

function isSession(value: unknown): value is ShootSession {
  if (!value || typeof value !== 'object') return false
  const candidate = value as ShootSession
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.date === 'string' &&
    Array.isArray(candidate.shots)
  )
}

function cloneSession(session: ShootSession): ShootSession {
  return {
    ...session,
    shots: session.shots.map((shot) => ({ ...shot })),
  }
}

function applyCompletedMap(
  session: ShootSession,
  completedMap: CompletedMap = {},
): ShootSession {
  return {
    ...session,
    shots: session.shots.map((shot) => ({
      ...shot,
      completed: !!completedMap[shot.id],
    })),
  }
}

function getLegacyCompletedMap(sessionId: string): CompletedMap {
  try {
    const multiSessionRaw = localStorage.getItem(STAGE_2B_COMPLETED_KEY)
    if (multiSessionRaw) {
      const parsed = JSON.parse(multiSessionRaw) as SessionCompletedStore
      if (parsed && typeof parsed === 'object' && parsed[sessionId]) {
        return parsed[sessionId]
      }
    }

    if (sessionId === defaultSession.id) {
      const legacyRaw = localStorage.getItem(LEGACY_COMPLETED_KEY)
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw)
        if (parsed && typeof parsed === 'object') return parsed as CompletedMap
      }
    }
  } catch {
    /* ignore migration errors */
  }

  return {}
}

function seedSessions(): ShootSession[] {
  return availableSessions.map((session) =>
    applyCompletedMap(cloneSession(session), getLegacyCompletedMap(session.id)),
  )
}

function writeSessions(sessions: ShootSession[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  } catch {
    /* ignore persistence errors */
  }
}

/** Load saved sessions, seeding storage from defaults when none exist. */
export function loadSessions(): ShootSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.filter(isSession).map(cloneSession)
      }
    }
  } catch {
    /* fall through to seed */
  }

  const sessions = seedSessions()
  writeSessions(sessions)
  return sessions
}

/** Persist one updated session while preserving the rest of the projects. */
export function saveSession(session: ShootSession): void {
  const sessions = loadSessions()
  const updated = cloneSession(session)
  const index = sessions.findIndex((saved) => saved.id === updated.id)

  if (index >= 0) {
    sessions[index] = updated
  } else {
    sessions.push(updated)
  }

  writeSessions(sessions)
}
