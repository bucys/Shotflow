export interface ParsedShot {
  title: string
  description: string
}

export interface ParsedShotList {
  /** Project name derived from a leading '#' line, or null if none present. */
  projectName: string | null
  shots: ParsedShot[]
}

/**
 * Parse a pasted shot list into a project name and a list of shots.
 *
 * Supported format:
 *   # Project Name (optional)
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
 *  - Lines beginning with '#' provide the project name.
 *  - A line of '---' separates shots.
 *  - The first non-empty line of a block is the title.
 *  - Remaining non-empty lines form the description.
 *  - Empty lines are ignored.
 */
export function parseShotList(input: string): ParsedShotList {
  const lines = input.replace(/\r\n?/g, '\n').split('\n')

  let projectName: string | null = null
  const contentLines: string[] = []

  for (const line of lines) {
    if (line.trimStart().startsWith('#')) {
      // First '#' line wins as the project name.
      if (projectName === null) {
        const name = line.trimStart().replace(/^#+/, '').trim()
        if (name) projectName = name
      }
      continue
    }
    contentLines.push(line)
  }

  const shots: ParsedShot[] = []
  let block: string[] = []

  const flush = () => {
    const nonEmpty = block.map((l) => l.trim()).filter((l) => l.length > 0)
    block = []
    if (nonEmpty.length === 0) return
    const [title, ...rest] = nonEmpty
    shots.push({ title, description: rest.join('\n') })
  }

  for (const line of contentLines) {
    if (line.trim() === '---') {
      flush()
    } else {
      block.push(line)
    }
  }
  flush()

  return { projectName, shots }
}
