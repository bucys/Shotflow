import availableSessions from '../data/sessions'
import type { Section, ShootSession } from '../types/session'
import type { Shot } from '../types/shot'

/**
 * Multi-session-ready storage. Full sessions are saved so the Home screen can
 * render projects from localStorage. The default session seeds storage on
 * first run, and old Stage 2A/flat-shot projects are migrated forward.
 */
const SESSIONS_KEY = 'shotflow:sessions:v1'
const LEGACY_COMPLETED_KEY = 'shotflow:trakai:completed'
const STAGE_2B_COMPLETED_KEY = 'shotflow:sessions:completed:v2'

type CompletedMap = Record<string, boolean>
type SessionCompletedStore = Record<string, CompletedMap>
type LegacySession = Omit<ShootSession, 'sections'> & { sections?: Section[]; shots?: Shot[] }

function isShot(value: unknown): value is Shot {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Shot
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.completed === 'boolean'
  )
}

/**
 * Copy a shot, normalizing the optional `priority` flag. Sessions saved with the
 * field keep their boolean; legacy projects (no field) default to false without
 * breaking.
 */
function normalizeShot(shot: Shot): Shot {
  return { ...shot, priority: shot.priority === true }
}

function normalizeSession(value: unknown): ShootSession | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as LegacySession

  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.name !== 'string' ||
    typeof candidate.date !== 'string'
  ) {
    return null
  }

  if (Array.isArray(candidate.sections)) {
    const sections = candidate.sections
      .filter(
        (section) =>
          section &&
          typeof section.id === 'string' &&
          typeof section.name === 'string' &&
          Array.isArray(section.shots),
      )
      .map((section) => ({
        id: section.id,
        name: section.name,
        shots: section.shots.filter(isShot).map(normalizeShot),
      }))

    return { id: candidate.id, name: candidate.name, date: candidate.date, sections }
  }

  if (Array.isArray(candidate.shots)) {
    return {
      id: candidate.id,
      name: candidate.name,
      date: candidate.date,
      sections: [
        {
          id: `${candidate.id}-section-shots`,
          name: 'Shots',
          shots: candidate.shots.filter(isShot).map(normalizeShot),
        },
      ],
    }
  }

  return null
}

function cloneSession(session: ShootSession): ShootSession {
  return {
    ...session,
    sections: session.sections.map((section) => ({
      ...section,
      shots: section.shots.map((shot) => ({ ...shot })),
    })),
  }
}

function applyCompletedMap(
  session: ShootSession,
  completedMap: CompletedMap = {},
): ShootSession {
  return {
    ...session,
    sections: session.sections.map((section) => ({
      ...section,
      shots: section.shots.map((shot) => ({
        ...shot,
        completed: !!completedMap[shot.id],
      })),
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

    if (sessionId === 'trakai') {
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
        const sessions = parsed
          .map(normalizeSession)
          .filter((session): session is ShootSession => session !== null)
        writeSessions(sessions)
        return sessions.map(cloneSession)
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
