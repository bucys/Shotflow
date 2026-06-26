import type { Shot } from './shot'

export interface Section {
  id: string
  name: string
  shots: Shot[]
}

export interface ShootSession {
  id: string
  name: string
  date: string
  sections: Section[]
}
