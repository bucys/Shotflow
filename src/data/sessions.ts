import defaultSession from './defaultSession'
import type { ShootSession } from '../types/session'

/**
 * Registry of available shoot sessions. Shot content lives here and stays
 * authoritative; localStorage only layers completion state on top. Adding more
 * sessions later is just a matter of appending to this array.
 */
const availableSessions: ShootSession[] = [defaultSession]

export default availableSessions
