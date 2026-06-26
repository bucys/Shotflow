import type { Section } from './types/session'
import type { Shot } from './types/shot'

/**
 * The ⭐ Svarbiausi kadrai shortlist is NOT a real, stored section. It is a
 * rendered reference list derived from the real shots whose `priority` flag is
 * true. This module centralizes the naming, detection, and ordering rules so
 * the create flow, shoot flow, and previews all agree on a single behavior.
 */
export const PRIORITY_SECTION_NAME = '⭐ Svarbiausi kadrai'

/**
 * Preferred section order. The priority shortlist always comes first, then the
 * canonical device sections, then everything else in its original order.
 * Matched loosely (lowercase substring) so plans still order correctly even if
 * the emoji prefix is missing or slightly different.
 */
const SECTION_ORDER_KEYS = [
  'svarbiausi kadrai',
  'drono video',
  'drono nuotraukos',
  'iphone video',
  'iphone nuotraukos',
]

/**
 * True when a section name refers to the priority shortlist. Tolerates the name
 * with or without the leading ⭐ (e.g. "⭐ Svarbiausi kadrai" or
 * "Svarbiausi kadrai").
 */
export function isPrioritySectionName(name: string): boolean {
  const normalized = name
    .replace(/^[⭐\s]+/u, '')
    .trim()
    .toLowerCase()
  return normalized === 'svarbiausi kadrai'
}

function sectionRank(name: string): number {
  const lower = name.toLowerCase()
  for (let i = 0; i < SECTION_ORDER_KEYS.length; i++) {
    if (lower.includes(SECTION_ORDER_KEYS[i])) return i
  }
  return SECTION_ORDER_KEYS.length
}

/**
 * Return the sections in the preferred order. Array.prototype.sort is stable in
 * modern engines, so "other" sections keep their original relative order.
 */
export function orderSections<T extends { name: string }>(sections: T[]): T[] {
  return [...sections].sort((a, b) => sectionRank(a.name) - sectionRank(b.name))
}

/** All real shots flagged priority=true, preserving section order. */
export function getPriorityShots(sections: Section[]): Shot[] {
  return sections.flatMap((section) => section.shots).filter((shot) => shot.priority)
}
