# Python for AI QA — Interactive Learning Website

A small, dependency-light, interactive website for learning Python specifically for
AI Quality Engineering, DeepEval, LLM testing, and AI agents.

No backend. No database. No API calls. No ongoing cost. Python runs entirely in your
browser via [Pyodide](https://pyodide.org/), and your progress is saved in `localStorage`.

## What's here

```
python-ai-qa-learning/
  index.html   - page structure
  styles.css   - all styling
  app.js       - state, Pyodide integration, rendering logic
  lessons.js   - all lesson content (titles, explanations, exercises)
  README.md    - this file
```

All 33 lessons are fully built, from Variables and Data Types through CI/CD -
covering core Python, pytest, HTTP/API handling, and AI-specific topics like
LLM APIs, AI agents, DeepEval, agent evaluation and evaluation datasets.

## Running locally

You need any plain static file server — Pyodide is loaded from its CDN, but the app
files themselves must be served over HTTP (not opened directly as `file://`, since
Pyodide's WebAssembly loading requires it).

**Option A — VS Code Live Server**

1. Install the "Live Server" extension.
2. Right-click `index.html` → "Open with Live Server".

**Option B — Python's built-in server**

```bash
cd python-ai-qa-learning
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

The first load will show "Loading Python..." while Pyodide downloads and
initializes (a few seconds). After that it's cached by the browser.

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository (it can be the repo root, or a subfolder
   if you configure Pages to serve from `/python-ai-qa-learning`).
2. In the repo: **Settings → Pages → Source**, pick the branch (e.g. `main`) and the
   folder containing `index.html`.
3. GitHub will publish it at `https://<username>.github.io/<repo>/`.

No build step is required — it's static HTML/CSS/JS plus a CDN script tag.

## How progress is saved

Everything is stored under the `pythonAIQAProgress` key in `localStorage`:

```json
{
  "currentLesson": 3,
  "completed": [1, 2],
  "skipped": [],
  "solutionsRevealed": [],
  "code": { "3": "..." }
}
```

Use the **Reset Progress** button in the sidebar to clear it (confirmation required).
