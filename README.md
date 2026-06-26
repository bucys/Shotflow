# ShotFlow

A mobile-first shot checklist app built with Vite + React + TypeScript.

**Stage 1** ships a single hardcoded shoot — _Trakai Drone Shot List_ — with 12 drone shots. Tap a shot's status circle to mark it complete, tap the chevron to read its description, and track your progress with a live counter and progress bar. Completed states are saved to `localStorage` so they survive a page refresh.

## Features

- One hardcoded shoot with exactly 12 shots (title, description, completed)
- Polished mobile-first cards
- Tap the status circle to mark / unmark a shot complete — completed cards turn green and stay in place
- Tap the chevron to expand / collapse a shot's description in a consistent rounded box
- Progress display: `completed / total` plus a progress bar and percentage
- Completed states persisted in `localStorage`
- **Reset Progress** button with a browser confirmation prompt
- Semantic buttons with accessible labels (`aria-pressed`, `aria-expanded`, `role="progressbar"`)

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

## Project structure

```
shotflow/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx       # React entry point
    ├── App.tsx        # App UI, state, and localStorage persistence
    ├── shots.ts       # Shoot title + 12 hardcoded shots
    └── index.css      # Mobile-first styles
```

## Notes

This stage intentionally has no routing, backend, login, editing, deleting, or drag-and-drop — it's a focused, self-contained checklist.
