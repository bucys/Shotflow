import { useMemo, useState } from 'react'
import { parseShotList, type ParsedShotList } from '../parser/parseShotList'
import {
  PRIORITY_SECTION_NAME,
  isPrioritySectionName,
  orderSections,
} from '../priority'
import type { Section, ShootSession } from '../types/session'

interface CreateProjectScreenProps {
  onCancel: () => void
  onCreate: (session: ShootSession) => void
}

type PlannerStep = 'describe' | 'questions'

const BRIEF_PLACEHOLDER = 'Describe your shoot...'

interface PlanShot {
  title: string
  description: string
  priority: boolean
}

interface PlanSection {
  name: string
  shots: PlanShot[]
}

interface Plan {
  /** Only the real, stored sections (priority shortlist excluded). */
  sections: PlanSection[]
  /** Derived ⭐ Svarbiausi kadrai references into the real shots above. */
  priorityShots: PlanShot[]
}

/**
 * Turn parsed AI text into the real sections plus a derived priority shortlist.
 *
 * The AI may emit a "⭐ Svarbiausi kadrai" section. It is NOT a real section:
 * its titles are references that flag matching real shots as priority. We drop
 * the section itself, mark matching shots by exact title, and ignore any title
 * that does not exist. The priority shortlist is then derived from those flags,
 * so a referenced shot is never duplicated in storage or the shot count.
 */
function buildPlan(parsed: ParsedShotList): Plan {
  const prioritySection = parsed.sections.find((section) =>
    isPrioritySectionName(section.name),
  )
  const priorityTitles = new Set(
    (prioritySection?.shots ?? []).map((shot) => shot.title.trim()),
  )

  const sections = orderSections(
    parsed.sections
      .filter((section) => !isPrioritySectionName(section.name))
      .map(
        (section): PlanSection => ({
          name: section.name,
          shots: section.shots.map((shot) => ({
            title: shot.title,
            description: shot.description,
            priority: priorityTitles.has(shot.title.trim()),
          })),
        }),
      ),
  )

  const priorityShots = sections
    .flatMap((section) => section.shots)
    .filter((shot) => shot.priority)

  return { sections, priorityShots }
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function buildSession(name: string, date: string, sections: PlanSection[]): ShootSession {
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
        priority: shot.priority,
      })),
    })),
  }
}

export default function CreateProjectScreen({
  onCancel,
  onCreate,
}: CreateProjectScreenProps) {
  const [date] = useState(today)
  const [brief, setBrief] = useState('')
  const [text, setText] = useState('')
  const [plannerStep, setPlannerStep] = useState<PlannerStep>('describe')
  const [questions, setQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isPlanning, setIsPlanning] = useState(false)
  const [planError, setPlanError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const parsed = useMemo(() => parseShotList(text), [text])
  const plan = useMemo(() => buildPlan(parsed), [parsed])

  const projectName = parsed.projectName || 'Untitled Project'
  // Count unique real shots only — priority references are not double-counted.
  const shotCount = plan.sections.reduce(
    (total, section) => total + section.shots.length,
    0,
  )
  const canPlan = brief.trim().length > 0 && !isPlanning
  const canContinuePlanning =
    questions.length > 0 &&
    questions.every((question) => answers[question]?.trim()) &&
    !isPlanning

  const handleCreate = () => {
    onCreate(buildSession(projectName, date, plan.sections))
  }

  const requestPlan = async (nextAnswers?: Record<string, string>) => {
    setIsPlanning(true)
    setPlanError('')

    try {
      const payload: {
        brief: string
        answers?: Record<string, string>
      } = { brief }

      if (nextAnswers && Object.keys(nextAnswers).length > 0) {
        payload.answers = nextAnswers
      }

      const response = await fetch('/api/generate-shot-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          typeof data.error === 'string'
            ? data.error
            : 'Could not plan your shoot. Please try again.',
        )
      }

      if (data.type === 'questions') {
        const nextQuestions: string[] = Array.isArray(data.questions)
          ? data.questions.filter((question: unknown): question is string =>
              typeof question === 'string' && question.trim().length > 0,
            )
          : []

        if (!nextQuestions.length) {
          throw new Error('The planner did not return usable questions.')
        }

        setQuestions(nextQuestions)
        setAnswers(
          Object.fromEntries(
            nextQuestions.map((question) => [question, answers[question] || '']),
          ),
        )
        setPlannerStep('questions')
        return
      }

      if (data.type !== 'project') {
        throw new Error('The planner returned an unsupported response type.')
      }

      const generated = typeof data.text === 'string' ? data.text.trim() : ''
      if (!generated) {
        throw new Error('The shoot plan was empty. Please try again.')
      }

      setText(generated)
      setShowPreview(true)
    } catch (error) {
      setPlanError(
        error instanceof Error
          ? error.message
          : 'Could not plan your shoot. Please try again.',
      )
    } finally {
      setIsPlanning(false)
    }
  }

  const handlePlan = () => {
    if (!canPlan) return
    void requestPlan()
  }

  const handleContinuePlanning = () => {
    if (!canContinuePlanning) return
    void requestPlan(answers)
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
            {[
              ...(plan.priorityShots.length > 0
                ? [{ name: PRIORITY_SECTION_NAME, shots: plan.priorityShots }]
                : []),
              ...plan.sections,
            ].map((section) => {
              const visibleShots = section.shots.slice(0, 6)
              const hiddenShotCount = section.shots.length - visibleShots.length

              return (
                <li key={section.name} className="preview-section-card">
                  <div className="preview-section-header">
                    <span>{section.name}</span>
                    <span className="preview-item-count">
                      {section.shots.length}{' '}
                      {section.shots.length === 1 ? 'shot' : 'shots'}
                    </span>
                  </div>

                  <ol className="preview-shot-list">
                    {visibleShots.map((shot, shotIndex) => (
                      <li key={shot.title} className="preview-shot-title">
                        <span className="preview-shot-number">
                          {String(shotIndex + 1).padStart(2, '0')}
                        </span>
                        <span>{shot.title}</span>
                      </li>
                    ))}
                  </ol>

                  {hiddenShotCount > 0 && (
                    <p className="preview-more-shots">
                      + {hiddenShotCount} more{' '}
                      {hiddenShotCount === 1 ? 'shot' : 'shots'}
                    </p>
                  )}
                </li>
              )
            })}
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

  if (plannerStep === 'questions') {
    return (
      <div className="app app--planner">
        <header className="header planner-header">
          <h1 className="title planner-title">One more thing...</h1>
          <p className="subtitle planner-subtitle">
            I need a little more information before I can prepare your shooting
            plan.
          </p>
        </header>

        <main>
          <div className="question-list">
            {questions.map((question, index) => (
              <div className="field question-field" key={question}>
                <label className="field-label" htmlFor={`planner-answer-${index}`}>
                  {question}
                </label>
                <input
                  id={`planner-answer-${index}`}
                  name={`shotflow-planner-answer-${index}`}
                  type="text"
                  className="text-input"
                  value={answers[question] || ''}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question]: event.target.value,
                    }))
                  }
                  autoComplete="off"
                  autoCorrect="on"
                  autoCapitalize="sentences"
                  spellCheck={true}
                />
              </div>
            ))}
          </div>

          {planError && (
            <p className="form-error" role="alert">
              {planError}
            </p>
          )}
        </main>

        <footer className="form-actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setPlannerStep('describe')}
          >
            Back
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleContinuePlanning}
            disabled={!canContinuePlanning}
          >
            {isPlanning ? 'Planning…' : 'Continue Planning'}
          </button>
        </footer>
      </div>
    )
  }

  return (
    <div className="app app--planner">
      <header className="header planner-header">
        <h1 className="title planner-title">✨ AI Shoot Planner</h1>
        <p className="subtitle planner-subtitle">
          Describe your shoot in natural language.<br />
          I'll prepare a structured shooting plan.
        </p>
      </header>

      <main>
        <div className="field planner-field">
          <label className="field-label" htmlFor="shoot-brief">
            Shoot brief
          </label>
          <textarea
            id="shoot-brief"
            name="shotflow-shoot-brief"
            className="textarea planner-textarea"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder={BRIEF_PLACEHOLDER}
            rows={12}
            autoCorrect="on"
            autoCapitalize="sentences"
            spellCheck={true}
          />
          <div className="planner-examples" aria-label="Shoot brief examples">
            <p>Examples:</p>
            <ul>
              <li>Tomorrow I'm filming Trakai Castle at sunset with my DJI Air 2.</li>
              <li>Weekend trip to Nida. I want cinematic drone footage and photos.</li>
              <li>
                Shooting a BMW M3 for Instagram using Sony A7 IV and DJI Mini 4 Pro.
              </li>
            </ul>
          </div>
        </div>

        {planError && (
          <p className="form-error" role="alert">
            {planError}
          </p>
        )}
      </main>

      <footer className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handlePlan}
          disabled={!canPlan}
        >
          {isPlanning ? 'Planning…' : '✨ Plan My Shoot'}
        </button>
      </footer>
    </div>
  )
}
