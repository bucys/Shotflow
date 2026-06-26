import { useMemo, useState } from 'react'
import { parseShotList } from '../parser/parseShotList'
import type { Section, ShootSession } from '../types/session'

interface CreateProjectScreenProps {
  onCancel: () => void
  onCreate: (session: ShootSession) => void
}

const PLACEHOLDER = `Example:

# Trakai Castle

## Drone Video
Hero Reveal
Start low behind trees and slowly ascend.

---
Castle Orbit
Fly a slow circle around the castle.

## Drone Photos
Reflection
Capture the reflection on the lake.

---
Top Down
Point the camera straight down.`

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function buildSession(
  name: string,
  date: string,
  sections: { name: string; shots: { title: string; description: string }[] }[],
): ShootSession {
  let shotIndex = 1

  return {
    id: `project-${Date.now()}`,
    name,
    date,
    sections: sections.map((section, sectionIndex): Section => ({
      id: `section-${String(sectionIndex + 1).padStart(2, '0')}`,
      name: section.name,
      shots: section.shots.map((shot) => ({
        id: `shot-${String(shotIndex++).padStart(2, '0')}`,
        title: shot.title,
        description: shot.description,
        completed: false,
      })),
    })),
  }
}

export default function CreateProjectScreen({
  onCancel,
  onCreate,
}: CreateProjectScreenProps) {
  const [name, setName] = useState('')
  const [date, setDate] = useState(today)
  const [text, setText] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const parsed = useMemo(() => parseShotList(text), [text])

  const projectName = name.trim() || parsed.projectName || 'Untitled Project'
  const shotCount = parsed.sections.reduce(
    (total, section) => total + section.shots.length,
    0,
  )
  const canPreview = shotCount > 0

  const handleCreate = () => {
    onCreate(buildSession(projectName, date, parsed.sections))
  }

  if (showPreview) {
    return (
      <div className="app">
        <header className="header">
          <button
            type="button"
            className="back-button"
            onClick={() => setShowPreview(false)}
          >
            Back
          </button>

          <p className="eyebrow">Project</p>
          <h1 className="title">{projectName}</h1>

          <p className="preview-count">
            {shotCount} {shotCount === 1 ? 'shot' : 'shots'} found
          </p>
        </header>

        <main>
          <ul className="preview-list">
            {parsed.sections.map((section) => (
              <li key={section.name} className="preview-item preview-item--section">
                <span>{section.name}</span>
                <span className="preview-item-count">
                  {section.shots.length}{' '}
                  {section.shots.length === 1 ? 'shot' : 'shots'}
                </span>
              </li>
            ))}
          </ul>
        </main>

        <footer className="form-actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setShowPreview(false)}
          >
            Back
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleCreate}
          >
            Create Project
          </button>
        </footer>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">New Project</h1>
      </header>

      <main>
        <div className="field">
          <label className="field-label" htmlFor="shotflow-project-title">
            Project Name
          </label>
          <input
            id="shotflow-project-title"
            name="shotflow-project-title"
            type="text"
            className="text-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project Name"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="words"
            spellCheck={false}
            inputMode="text"
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="project-date">
            Date
          </label>
          <input
            id="project-date"
            name="shotflow-project-date"
            type="date"
            className="text-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="shot-list">
            Paste Shot List
          </label>
          <textarea
            id="shot-list"
            className="textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={14}
          />
        </div>
      </main>

      <footer className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setShowPreview(true)}
          disabled={!canPreview}
        >
          Preview
        </button>
      </footer>
    </div>
  )
}
