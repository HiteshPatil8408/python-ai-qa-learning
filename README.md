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
  advanced-lessons.js - intermediate/advanced lessons, behavior checks and labs
  interviews.js - interview questions, answer rubrics and follow-ups
  tests/       - curriculum checks and offline browser smoke test
  README.md    - this file
```

The course has 49 lessons. The original 33 cover Variables and Data Types through CI/CD -
covering core Python, pytest, HTTP/API handling, and AI-specific topics like
LLM APIs, AI agents, DeepEval, agent evaluation and evaluation datasets.

Lessons 34–40 form the **Intermediate** section: dependency injection and mocks,
structured output contracts, bounded retries, property/metamorphic testing,
dataset leakage, retrieval precision/recall, and grounding/abstention.

Lessons 41–49 form the **Advanced** section: judge calibration, repeated trials and
Wilson intervals, tool authorization, prompt injection, privacy-safe artifacts,
tail latency, trace diagnosis, multi-metric release gates, and an audit-ready capstone.

Each new lesson includes a worked example, runnable standard-library exercise,
assertion-based behavior checks, hints, a common mistake, a deeper local lab and
links to official documentation. The browser simulations do not run real DeepEval,
Ragas, pytest, Hypothesis or provider APIs. The local labs explain how to practice
with real tools; provider-backed evaluation may require credentials and incur costs.

Use the **Interviews** button for a separate bank of 32 questions. Filter by topic,
level or practice status, search, choose a random question, reveal an answer rubric
and practice a follow-up. Review status is saved locally and separate from course
completion. A 30-minute mock interview guide is included.

Existing lesson IDs and saved code are preserved. Course progress is now measured
against 49 lessons, so an existing completion percentage may decrease.

On phones, use **Lessons** to open the course menu. Coding shortcuts insert spaces
and common Python symbols. The reading and interview sections remain available
while Python downloads or when the runtime cannot load.

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
  "interviewReviewed": [],
  "code": { "3": "..." }
}
```

Use the **Reset Progress** button in the sidebar to clear it (confirmation required).

## Checking the curriculum

```bash
python -m unittest discover -s tests -v
node --check app.js
node --check advanced-lessons.js
node --check interviews.js
```

The tests execute every new example and solution in a fresh namespace, verify
behavior assertions and reject answers that only print the expected text.
`tests/browser-smoke.html` runs a browser UI smoke test using a simulated unavailable
Python runtime. Open it through your static server in a fresh browser profile; it
prints PASS or FAIL at the bottom. It exercises navigation, mobile menu state,
editor shortcuts, search/filters and saved interview progress. It does not test
the Pyodide download or execute WebAssembly.

Curriculum references checked on October 3, 2026: Python, pytest, Hypothesis, Ragas,
DeepEval and OWASP official documentation. Follow each lesson's source links when
implementing local labs, since package APIs can change.
