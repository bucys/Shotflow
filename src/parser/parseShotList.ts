export interface ParsedShot {
  title: string
  description: string
}

export interface ParsedSection {
  name: string
  shots: ParsedShot[]
}

export interface ParsedShotList {
  /** Project name derived from a leading '#' line, or null if none present. */
  projectName: string | null
  sections: ParsedSection[]
}

/**
 * Parse a pasted shot list into a project name, sections, and shots.
 *
 * Supported format:
 *   # Project Name (optional)
 *   ## Section Name (optional; defaults to "Shots" when omitted)
 *
 *   Shot Title
 *   Description
 *
 *   ---
 *
 *   Shot Title
 *   Description
 *
 * Rules:
 *  - A single '#' line provides the project name.
 *  - A '##' line starts a new section.
 *  - A line of '---' separates shots.
 *  - The first non-empty line of a shot block is the title.
 *  - Remaining non-empty lines form the description.
 *  - Empty lines are ignored.
 */
export function parseShotList(input: string): ParsedShotList {
  const lines = input.replace(/\r\n?/g, '\n').split('\n')

  let projectName: string | null = null
  let currentSectionName = 'Shots'
  let sawExplicitSection = false
  let block: string[] = []
  const sections: ParsedSection[] = []

  const currentShots = () => {
    let section = sections[sections.length - 1]
    if (!section || section.name !== currentSectionName) {
      section = { name: currentSectionName, shots: [] }
      sections.push(section)
    }
    return section.shots
  }

  const flushShot = () => {
    const nonEmpty = block.map((line) => line.trim()).filter(Boolean)
    block = []
    if (nonEmpty.length === 0) return

    const [title, ...rest] = nonEmpty
    currentShots().push({ title, description: rest.join('\n') })
  }

  const startSection = (name: string) => {
    flushShot()
    sawExplicitSection = true
    currentSectionName = name || 'Untitled Section'
    sections.push({ name: currentSectionName, shots: [] })
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('##')) {
      startSection(trimmed.replace(/^##+/, '').trim())
      continue
    }

    if (trimmed.startsWith('#')) {
      if (projectName === null) {
        const name = trimmed.replace(/^#+/, '').trim()
        if (name) projectName = name
      }
      continue
    }

    if (trimmed === '---') {
      flushShot()
      continue
    }

    block.push(line)
  }

  flushShot()

  return {
    projectName,
    sections: sections.filter((section) =>
      sawExplicitSection ? section.shots.length > 0 : section.shots.length > 0,
    ),
  }
}
