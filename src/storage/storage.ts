import defaultSession from '../data/defaultSession'
import type { ShootSession } from '../types/session'

const STORAGE_KEY = 'shotflow:trakai:completed'

type CompletedMap = Record<string, boolean>

/**
 * Load the shoot session. Shot content stays authoritative from
 * defaultSession; only completion state is read back from localStorage so
 * progress persists across reloads (identical to Stage 1 behaviour).
 */
export function loadSession(): ShootSession {
  let completedMap: CompletedMap = {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        completedMap = parsed as CompletedMap
      }
    }
  } catch {
    completedMap = {}
  }

  return {
    ...defaultSession,
    shots: defaultSession.shots.map((shot) => ({
      ...shot,
      completed: !!completedMap[shot.id],
    })),
  }
}

/** Persist the session's completion state to localStorage. */
export function saveSession(session: ShootSession): void {
  try {
    const completedMap: CompletedMap = {}
    for (const shot of session.shots) {
      completedMap[shot.id] = shot.completed
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedMap))
  } catch {
    /* ignore persistence errors */
  }
}
