import type { Shot } from './shot'

export interface ShootSession {
  id: string
  name: string
  date: string
  shots: Shot[]
}
