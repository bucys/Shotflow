import { useMemo, useState } from 'react'
import { parseShotList } from '../parser/parseShotList'
import type { ShootSession } from '../types/session'

interface CreateProjectScreenProps {
  onCancel: () => void
  onCreate: (session: ShootSession) => void
}

const PLACEHOLDER = `Example:

# Trakai Castle

Hero Reveal
Start low behind trees and slowly ascend.

---
Castle Orbit
Fly a slow circle around the castle.

---
Top Down
Point the camera straight down.`

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function buildSession(
  name: string,
  date: string,
  shots: { title: string; description: string }[],
): ShootSession {
  return {
    id: `project-${Date.now()}`,
    name,
    date,
    shots: shots.map((shot, i) => ({
      id: `shot-${String(i + 1).padStart(2, '0')}`,
      title: shot.title,
      description: shot.description,
      completed: false,
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
  const shotCount = parsed.shots.length
  const canPreview = shotCount > 0

  const handleCreate = () => {
    onCreate(buildSession(projectName, date, parsed.shots))
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
            {parsed.shots.map((shot, i) => (
              <li key={i} className="preview-item">
                {shot.title}
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
          <label className="field-label" htmlFor="project-name">
            Project Name
          </label>
          <input
            id="project-name"
            type="text"
            className="text-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project Name"
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="project-date">
            Date
          </label>
          <input
            id="project-date"
            type="date"
            className="text-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
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
