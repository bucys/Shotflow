import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SHOT_PLANNER_PROMPT = readFileSync(
  join(__dirname, '..', 'prompts', 'shotPlanner.md'),
  'utf8',
).trim()

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return {}
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanAnswers(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value)
      .map(([question, answer]) => [cleanText(question), cleanText(answer)])
      .filter(([question, answer]) => question && answer),
  )
}

function stripCodeFences(text) {
  return text
    .replace(/^```(?:json|text|markdown)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function looksLikeShotFlowFormat(text) {
  return /^#\s+.+/m.test(text) && /^##\s+.+/m.test(text)
}

function parsePlannerResponse(content) {
  const cleaned = stripCodeFences(content)
  try {
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

function normalizeQuestions(questions) {
  if (!Array.isArray(questions)) return []

  return questions
    .map(cleanText)
    .filter(Boolean)
    .slice(0, 3)
}

function buildUserPrompt(brief, answers) {
  const answerEntries = Object.entries(answers)
  const answerText = answerEntries.length
    ? `\n\nFollow-up answers:\n${answerEntries
        .map(([question, answer]) => `Q: ${question}\nA: ${answer}`)
        .join('\n\n')}`
    : ''

  return `Shoot brief:\n\n${brief}${answerText}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    sendJson(res, 500, { error: 'OPENAI_API_KEY is not configured.' })
    return
  }

  const body = readBody(req)
  const brief = cleanText(body.brief)
  const answers = cleanAnswers(body.answers)

  if (!brief) {
    sendJson(res, 400, { error: 'Describe your shoot first.' })
    return
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.5',
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SHOT_PLANNER_PROMPT },
          { role: 'user', content: buildUserPrompt(brief, answers) },
        ],
      }),
    })

    if (!response.ok) {
      sendJson(res, response.status, {
        error: 'Shoot planning failed. Please try again.',
      })
      return
    }

    const data = await response.json()
    const plannerResponse = parsePlannerResponse(
      data?.choices?.[0]?.message?.content || '',
    )

    if (!plannerResponse || typeof plannerResponse !== 'object') {
      sendJson(res, 502, {
        error: 'The planner response was not valid. Please try again.',
      })
      return
    }

    if (plannerResponse.type === 'questions') {
      const questions = normalizeQuestions(plannerResponse.questions)
      if (!questions.length) {
        sendJson(res, 502, {
          error: 'The planner did not return usable questions. Please try again.',
        })
        return
      }

      sendJson(res, 200, { type: 'questions', questions })
      return
    }

    if (plannerResponse.type === 'project') {
      const text = cleanText(plannerResponse.text)

      if (!text) {
        sendJson(res, 502, {
          error: 'The shoot plan was empty. Please try again.',
        })
        return
      }

      if (!looksLikeShotFlowFormat(text)) {
        sendJson(res, 502, {
          error: 'The shoot plan was not in ShotFlow format. Please try again.',
        })
        return
      }

      sendJson(res, 200, { type: 'project', text })
      return
    }

    sendJson(res, 502, {
      error: 'The planner returned an unsupported response type. Please try again.',
    })
  } catch {
    sendJson(res, 500, {
      error: 'Shoot planning failed. Please try again.',
    })
  }
}
