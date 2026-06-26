# ShotFlow

A mobile-first shoot-planning and shot checklist app built with Vite + React + TypeScript.

ShotFlow lets you plan a shoot from a natural-language brief with the **AI Shoot Planner**, then organize the result into Projects, Sections, and a tappable Checklist. Everything you create is saved to `localStorage`, so your projects and progress survive a page refresh. The AI Shoot Planner is powered by an OpenAI model through a Vercel serverless API route — your API key stays on the server.

## Features

- **AI Shoot Planner** — describe a shoot in plain language and get an import-ready project; the planner may ask a few follow-up questions first to sharpen the plan
- **Projects** — create and switch between multiple shoots
- **Sections** — shots are grouped into named sections within a project
- **Checklist** — tap a shot's status circle to mark it complete, tap the chevron to read its description, and track progress with a live counter and progress bar
- **localStorage persistence** — projects, sections, and completed states are stored locally and survive a refresh
- Polished mobile-first cards and accessible controls (`aria-pressed`, `aria-expanded`, `role="progressbar"`)

## Getting started

Requires Node.js 18+.

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev

# type-check and build for production (outputs to dist/)
npm run build

# preview the production build locally
npm run preview
```

## AI Shoot Planner

The planner runs through a Vercel serverless route at `/api/generate-shot-list`. The frontend sends the original natural-language `brief` and, only when needed, follow-up `answers`. The server loads the planner prompt from `prompts/shotPlanner.md` and keeps the OpenAI key server-side — it is never exposed to the browser.

The route returns either `{ "type": "questions", "questions": [...] }` (follow-up questions to answer) or `{ "type": "project", "text": "# Project Name..." }`. Only `project` text is sent to the parser and Preview, where you can import it as a new project.

`vercel.json` declares `includeFiles: "prompts/**"` for the function so the prompt files are bundled into the deployed serverless function.

### Environment variables

Set these in Vercel (or your local serverless environment):

```bash
OPENAI_API_KEY=***
# optional:
OPENAI_MODEL=gpt-5.5
```

- `OPENAI_API_KEY` — **required**. Your OpenAI API key.
- `OPENAI_MODEL` — **optional**. Set `OPENAI_MODEL=gpt-5.5` if that model is available on your account. When unset, the route falls back to `gpt-4o`. The selected model is logged server-side and is never shown in the frontend UI.

Do not commit `.env` files. `.env` is already ignored by git.

## Project structure

```
shotflow/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json                 # bundles prompts/** into the serverless function
├── api/
│   └── generate-shot-list.js   # Vercel serverless route for the AI Shoot Planner
├── prompts/
│   └── shotPlanner.md          # system prompt loaded by the API route
└── src/                        # Vite + React + TypeScript frontend
```
