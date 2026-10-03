# Prompt: Build a native Android app — "Python for AI QA" interactive learning app
---

## What to build

A complete, installable, **offline, interactive Android app** (Kotlin) that teaches Python to a
learner who already knows TypeScript/JavaScript, specifically for AI Quality Engineering (QA
testing of LLMs and AI agents, using tools like DeepEval). The learner should be able to install
it on their phone and learn entirely from the phone — read a lesson, run real Python code on the
device, get it checked automatically, see hints, and move to the next lesson.

It must contain **33 fully-built, interactive lessons** (full content is embedded below — do not
invent, shorten, or placeholder any of it; use it verbatim). Each lesson teaches one Python
concept framed for AI QA work, compares it to the TypeScript equivalent, lets the learner run real
Python code on-device, and ends with a graded coding exercise.

No backend. No network calls. No accounts. No ads. Everything runs and persists locally on the
phone.

## Required Python execution engine

Use **Chaquopy** (the standard Gradle plugin for embedding a real CPython interpreter inside an
Android app) so the learner's code actually executes as real Python, fully offline (must work in
airplane mode). Do not call any remote API and do not require network access/permissions.

Execution contract:
- Run the given Python source string and capture everything written to stdout.
- If the code raises an exception, capture a short, readable error message (it's fine to just
  show the last non-empty line of the traceback, not the full stack).
- Produce a result with: `success: Boolean`, `output: String`, `error: String?`.
- All 33 lessons below only use the Python **standard library** (`os`, `json`, `statistics`,
  `dataclasses`, `asyncio`, `sys`, etc.) — no third-party packages need to be installed. A few
  lessons (pip, HTTP Requests, API Error Handling, LLM APIs, DeepEval, Pytest, Fixtures,
  Parametrize, CI/CD, Virtual Environments) intentionally use **hand-written mock
  classes/functions inside the lesson's own code** to simulate a real library's shape (e.g. a
  `MockResponse` class standing in for the `requests` library, or a keyword-overlap heuristic
  standing in for DeepEval's real LLM-judged metrics) — this is intentional, keep it exactly as
  written, do not try to install the real packages.
- One lesson (Async/Await) uses a top-level `await main()` call with `asyncio`. Make sure whatever
  execution approach you use (a background thread running the interpreter, or similar) can
  execute this; if Chaquopy's `Python.getInstance().getModule(...)` approach can't run top-level
  `await` directly, wrap the submitted code so it runs inside an event loop appropriately (e.g.
  detect `async def main()` + `await main()` pattern and execute via `asyncio.get_event_loop().
  run_until_complete(...)` under the hood) — the important thing is the *learner's visible code*
  must stay exactly as shown in `pythonExample`/`starterCode`/`solution` below; any wrapping must
  happen transparently without changing what's displayed or require the user to write different
  code.

## Output comparison / grading logic (must match exactly)

Before comparing a run's output to a lesson's `expectedOutput`, normalize **both** strings the same
way:
1. Split into lines.
2. Right-trim trailing whitespace from each line (strip only trailing spaces/tabs at line end).
3. Rejoin the lines with `\n`.
4. Trim leading/trailing whitespace from the whole string.

A submission is "correct" only if the normalized actual output equals the normalized
`expectedOutput` exactly (case-sensitive, exact string equality — no partial credit, no fuzzy
matching).

## Data model

Model each lesson as a Kotlin data class matching this shape, and bundle all 33 lessons as a JSON
asset file in the app (the full JSON array is provided verbatim near the bottom of this prompt —
save it as `app/src/main/assets/lessons.json` and parse it at runtime, don't hand-transcribe it):

```kotlin
data class Lesson(
    val id: Int,
    val title: String,
    val content: LessonContent
)

data class LessonContent(
    val why: String,
    val typescriptExample: String,
    val pythonExample: String,
    val explanation: String,
    val prediction: Prediction?,   // null on lessons without one
    val exercise: Exercise
)

data class Prediction(
    val code: String,
    val answer: String
)

data class Exercise(
    val instructions: String,
    val starterCode: String,
    val expectedOutput: String,
    val hints: List<String>,
    val solution: String
)
```

## Screens and exact behavior

**1. Lesson list screen** — lists all 33 lesson titles in order, showing:
- A checkmark for completed lessons
- A highlighted/arrow indicator for the current lesson
- A "Skipped" tag for lessons skipped without passing
- An overall progress indicator: `(completed ∪ skipped).size / 33` as a percentage/progress bar
- Tapping a lesson title navigates to its detail screen and sets it as "current"
- A "Reset Progress" action (with a confirmation dialog) that wipes all persisted progress and
  returns to lesson 1 with a blank slate

**2. Lesson detail screen**, in this exact order:
1. Lesson title
2. "Why You Need This" — the `why` text
3. "TypeScript vs Python" — two code blocks shown side-by-side (or stacked on narrow screens),
   labeled "TypeScript" and "Python", showing `typescriptExample` and `pythonExample` (monospace
   font, read-only, preserve exact whitespace/newlines)
4. The `explanation` text
5. "Try It" — a read-only display of `pythonExample` with a **Run Example** button. Tapping it
   executes that exact code and displays the raw output (or error) below it. This is not graded.
6. If `prediction` is present (not all lessons have one): "What Do You Think This Prints?" —
   show `prediction.code`, plus a **Show Answer** button that reveals `prediction.answer` only
   after being tapped (hidden by default).
7. "Task" section (the exercise — present on every lesson):
   - The `instructions` text
   - A multi-line, monospace, editable code field pre-filled with `starterCode`, OR the learner's
     previously saved code for this lesson if they've typed something before (see persistence)
   - Six actions, each behaving exactly as follows:
     - **Run Code** — executes the editor's current content, shows raw stdout/error below. Does
       not grade or mark progress.
     - **Check Answer** — executes the editor's current content.
       - If it raises an error: show "Not quite - your code raised an error. Fix it and try
         again."
       - Else: normalize the output (see grading logic above) and compare to the normalized
         `expectedOutput`.
         - On match: mark the lesson as completed (persist it), show a success message like
           "✓ Correct! Nice work. You can continue.", and unlock the Next button.
         - On mismatch: show a failure message that includes both the expected output and the
           actual output so the learner can see the difference.
     - **Show Hint** — reveals one additional hint from the `hints` list each time it's tapped, in
       order, up to the length of the list (track how many hints have been shown for the lesson
       currently being viewed).
     - **Show Solution** — show a confirmation dialog ("Reveal solution?") first. On confirm, mark
       the lesson's solution as revealed (persist it) and display the `solution` code. Revealing
       the solution also counts as satisfying the "can proceed to next lesson" requirement (below),
       even if the exercise itself was never passed.
     - **Reset Code** — resets the editor back to `starterCode` for this lesson and clears any
       shown run/check output.
     - **Skip Assignment** — marks the lesson as skipped (persist it) and shows a message like
       "Skipped. You can move on whenever you're ready." Skipping also satisfies "can proceed".

**3. Bottom navigation** on the detail screen: **Previous** and **Next** buttons.
- Previous: disabled on lesson 1; otherwise navigates to `currentLesson - 1`.
- Next: disabled on lesson 33. On any other lesson, disabled unless that lesson's exercise has
  been completed, skipped, or had its solution revealed ("can proceed" rule). Enabled otherwise.
  Tapping it navigates to `currentLesson + 1` and persists the new current lesson.

## Persistence

Persist progress locally on-device (Room, DataStore, or SharedPreferences — your choice) so it
survives app restarts, with this shape:

```
currentLesson: Int                 // default 1
completedLessonIds: Set<Int>
skippedLessonIds: Set<Int>
solutionsRevealedLessonIds: Set<Int>
savedCodeByLessonId: Map<Int, String>   // learner's last-edited code per lesson
```

- Auto-save the editor's content per lesson as the learner types (debounce ~300-500ms is fine).
- On startup, if nothing is stored or stored data is corrupt/unparseable, default to the blank
  slate above (`currentLesson = 1`, everything else empty) — never crash on load.

## Non-functional requirements

- Fully offline: no `INTERNET` permission, no network calls anywhere in the app.
- Minimum SDK: a reasonable modern default (e.g. API 26+), or whatever Chaquopy requires at
  minimum if higher.
- Single-module Jetpack Compose app, Material 3 components, idiomatic Kotlin.
- Organize code into clear layers: a `data` layer (lesson loading from the bundled JSON asset +
  progress persistence), a `python` layer (a small wrapper around Chaquopy execution + the output
  normalization/grading logic), and a `ui` layer (the two Compose screens above).
- **App icon / logo**: design is entirely up to you — create a simple, clean launcher icon/logo
  appropriate for a "Python learning for AI QA" app (e.g. a Python-ish motif combined with a
  checkmark/test-tube/magnifying-glass motif). Make sure adaptive icon variants (foreground/
  background layers) are included for modern Android launchers.
- App name: "Python for AI QA" (or similar, your call).

## Deliverables expected from you

1. A complete, buildable Gradle/Android Studio project (Kotlin + Jetpack Compose + Chaquopy).
2. `app/src/main/assets/lessons.json` populated with the exact 33-lesson JSON array provided below
   — verify it parses and that you have exactly 33 entries with ids 1-33, no content loss or
   corruption.
3. A working **debug APK** I can install directly, plus the exact command to rebuand it from
   source (e.g. `./gradlew assembleDebug`, with the output path, e.g.
   `app/build/outputs/apk/debug/app-debug.apk`). If you can run the build yourself, do so and
   hand me the resulting APK file directly. If you cannot run a build in your environment, give me
   the complete project plus those exact build instructions so I (or another machine) can produce
   the APK.
4. Do not attempt to produce a signed release APK (that needs a keystore I haven't provided) —
   a debug APK is sufficient; don't ask me for signing credentials unless I explicitly request a
   release build later.
5. A short note on anything you could not port 1:1 from this spec, and why.

## Full lesson content (embed verbatim as `lessons.json`)

Below is the complete, verified JSON array of all 33 lessons. Use it exactly as-is — do not
paraphrase, shorten, or regenerate the code samples; they have all been tested to run correctly
and their `solution` fields have been verified to produce exactly their `expectedOutput`.

```json
[
  {
    "id": 1,
    "title": "Variables and Data Types",
    "content": {
      "why": "Every QA script, API test and LLM evaluation starts by storing values: a test name, a status, a response time, an expected answer. Variables are how you hold onto that data. DeepEval and agent frameworks pass results around as plain variables and dictionaries, so this is the foundation for everything else.",
      "typescriptExample": "const testName = \"Checkout Test\";\nconst status = \"failed\";\nconst executionTime = 2.5;\nconst isFlaky = false;\nconst retryCount = null;\n\nconsole.log(`${testName}: ${status} (${executionTime}s)`);",
      "pythonExample": "test_name = \"Checkout Test\"\nstatus = \"failed\"\nexecution_time = 2.5\nis_flaky = False\nretry_count = None\n\nprint(f\"{test_name}: {status} ({execution_time}s)\")",
      "explanation": "Python has the same basic types as TypeScript: str (string), int, float (number), bool (True/False), and None (null/undefined). f-strings (f\"...\") work like template literals but use { } instead of ${ }.",
      "prediction": {
        "code": "name = \"Login Test\"\npassed = True\nscore = 0.95\n\nprint(f\"{name}: {passed} ({score})\")",
        "answer": "Login Test: True (0.95)"
      },
      "exercise": {
        "instructions": "Create three variables: test_name = \"Checkout Test\", status = \"failed\", error = \"HTTP 500\". Print:\nCheckout Test -> failed -> HTTP 500",
        "starterCode": "# Create your variables below\n",
        "expectedOutput": "Checkout Test -> failed -> HTTP 500",
        "hints": [
          "Create three variables first: test_name, status, error.",
          "Use an f-string like f\"{a} -> {b} -> {c}\".",
          "print(f\"{test_name} -> {status} -> {error}\")"
        ],
        "solution": "test_name = \"Checkout Test\"\nstatus = \"failed\"\nerror = \"HTTP 500\"\n\nprint(f\"{test_name} -> {status} -> {error}\")"
      }
    }
  },
  {
    "id": 2,
    "title": "Lists",
    "content": {
      "why": "Test suites, API responses and batches of LLM outputs almost always come back as lists. Looping over a list of test results to find failures, or over a list of agent steps, is one of the most common things you'll do in AI QA tooling.",
      "typescriptExample": "const tests = [\"Login Test\", \"Checkout Test\", \"Payment Test\"];\ntests.push(\"Refund Test\");\nconsole.log(tests.length);\n\nfor (const t of tests) {\n  console.log(t);\n}",
      "pythonExample": "tests = [\"Login Test\", \"Checkout Test\", \"Payment Test\"]\ntests.append(\"Refund Test\")\nprint(len(tests))\n\nfor t in tests:\n    print(t)",
      "explanation": "Python lists are like JS arrays: [] to create, .append() instead of .push(), len() instead of .length, and index access with tests[0]. A plain 'for x in list' loop replaces 'for (const x of list)'.",
      "exercise": {
        "instructions": "Create a list containing: \"Login Test\", \"Checkout Test\", \"Payment Test\". Print each one on its own line.",
        "starterCode": "# Create your list and loop over it below\n",
        "expectedOutput": "Login Test\nCheckout Test\nPayment Test",
        "hints": [
          "Create a list with square brackets: tests = [...].",
          "Loop with: for t in tests:",
          "print(t) inside the loop body (indented with 4 spaces)."
        ],
        "solution": "tests = [\"Login Test\", \"Checkout Test\", \"Payment Test\"]\n\nfor t in tests:\n    print(t)"
      }
    }
  },
  {
    "id": 3,
    "title": "Dictionaries",
    "content": {
      "why": "API responses, LLM JSON output and DeepEval metric results are all dictionaries (key/value data) in Python. Reading a nested field like result[\"failure\"][\"message\"] is something you'll do constantly when parsing test or agent output.",
      "typescriptExample": "const result = {\n  test: \"Checkout Test\",\n  status: \"failed\",\n  failure: {\n    type: \"api\",\n    message: \"HTTP 500\"\n  }\n};\n\nconsole.log(`${result.test} -> ${result.failure.message}`);",
      "pythonExample": "result = {\n    \"test\": \"Checkout Test\",\n    \"status\": \"failed\",\n    \"failure\": {\n        \"type\": \"api\",\n        \"message\": \"HTTP 500\"\n    }\n}\n\nprint(f\"{result['test']} -> {result['failure']['message']}\")",
      "explanation": "Python dictionaries are like JS objects, but you always use square brackets with string keys: result[\"test\"] instead of result.test. Nested dicts work just like nested objects. You can add or change a key with result[\"status\"] = \"passed\".",
      "prediction": {
        "code": "metric = {\n    \"name\": \"answer_relevancy\",\n    \"score\": 0.8,\n    \"passed\": True\n}\n\nprint(f\"{metric['name']}: {metric['score']}\")",
        "answer": "answer_relevancy: 0.8"
      },
      "exercise": {
        "instructions": "Using the result dictionary below, print:\nCheckout Test -> HTTP 500",
        "starterCode": "result = {\n    \"test\": \"Checkout Test\",\n    \"status\": \"failed\",\n    \"failure\": {\n        \"type\": \"api\",\n        \"message\": \"HTTP 500\"\n    }\n}\n\n# Print using the dictionary above\n",
        "expectedOutput": "Checkout Test -> HTTP 500",
        "hints": [
          "Access nested values with result['failure']['message'].",
          "Combine both fields in one f-string.",
          "print(f\"{result['test']} -> {result['failure']['message']}\")"
        ],
        "solution": "result = {\n    \"test\": \"Checkout Test\",\n    \"status\": \"failed\",\n    \"failure\": {\n        \"type\": \"api\",\n        \"message\": \"HTTP 500\"\n    }\n}\n\nprint(f\"{result['test']} -> {result['failure']['message']}\")"
      }
    }
  },
  {
    "id": 4,
    "title": "Lists of Dictionaries",
    "content": {
      "why": "A pytest run, a CI pipeline or a batch of agent evaluations all hand you back a list of dictionaries - one per test or one per case. Looping over that list is exactly how real test-failure triage tools and DeepEval result summaries work.",
      "typescriptExample": "const failures = [\n  { test: \"Login\", error: \"Element not found\" },\n  { test: \"Checkout\", error: \"HTTP 500\" }\n];\n\nfor (const f of failures) {\n  console.log(`${f.test} -> ${f.error}`);\n}",
      "pythonExample": "failures = [\n    {\"test\": \"Login\", \"error\": \"Element not found\"},\n    {\"test\": \"Checkout\", \"error\": \"HTTP 500\"}\n]\n\nfor f in failures:\n    print(f\"{f['test']} -> {f['error']}\")",
      "explanation": "This combines the last two lessons: a list that contains dictionaries. You loop over the list, and on each iteration you get one dictionary to read from.",
      "exercise": {
        "instructions": "Using the failures list below, print each failure as:\nLogin -> Element not found\nCheckout -> HTTP 500",
        "starterCode": "failures = [\n    {\"test\": \"Login\", \"error\": \"Element not found\"},\n    {\"test\": \"Checkout\", \"error\": \"HTTP 500\"}\n]\n\n# Loop and print below\n",
        "expectedOutput": "Login -> Element not found\nCheckout -> HTTP 500",
        "hints": [
          "Loop with: for f in failures:",
          "Each f is a dictionary - access f['test'] and f['error'].",
          "print(f\"{f['test']} -> {f['error']}\") inside the loop."
        ],
        "solution": "failures = [\n    {\"test\": \"Login\", \"error\": \"Element not found\"},\n    {\"test\": \"Checkout\", \"error\": \"HTTP 500\"}\n]\n\nfor f in failures:\n    print(f\"{f['test']} -> {f['error']}\")"
      }
    }
  },
  {
    "id": 5,
    "title": "Conditions",
    "content": {
      "why": "Classifying failures (backend vs automation vs unknown), deciding whether an LLM response passed a check, or routing an agent to the next step - all of this is conditions. AI test triage tools are mostly if/elif/else logic wrapped around smarter data.",
      "typescriptExample": "const error = \"HTTP 500 Internal Server Error\";\n\nif (error.includes(\"500\") && !error.includes(\"element\")) {\n  console.log(\"backend\");\n} else if (error.toLowerCase().includes(\"element\")) {\n  console.log(\"automation\");\n} else {\n  console.log(\"unknown\");\n}",
      "pythonExample": "error = \"HTTP 500 Internal Server Error\"\n\nif \"500\" in error and \"element\" not in error:\n    print(\"backend\")\nelif \"element\" in error.lower():\n    print(\"automation\")\nelse:\n    print(\"unknown\")",
      "explanation": "Python spells boolean operators out as words: 'and', 'or', 'not' instead of &&, ||, !. The 'in' keyword checks if a substring/item exists, replacing .includes(). There's no switch statement in basic Python - if/elif/else covers it.",
      "prediction": {
        "code": "a = True\nb = False\n\nif a and not b:\n    print(\"yes\")\nelse:\n    print(\"no\")",
        "answer": "yes"
      },
      "exercise": {
        "instructions": "Given error = \"HTTP 500 Internal Server Error\": print \"backend\" if error contains \"500\", print \"automation\" if it contains \"element\" (case-insensitive), otherwise print \"unknown\".",
        "starterCode": "error = \"HTTP 500 Internal Server Error\"\n\n# Write your if / elif / else below\n",
        "expectedOutput": "backend",
        "hints": [
          "Use if / elif / else, same shape as TypeScript's if/else if/else.",
          "Check substrings with the `in` operator: \"500\" in error",
          "print(\"backend\") inside the matching branch."
        ],
        "solution": "error = \"HTTP 500 Internal Server Error\"\n\nif \"500\" in error:\n    print(\"backend\")\nelif \"element\" in error.lower():\n    print(\"automation\")\nelse:\n    print(\"unknown\")"
      }
    }
  },
  {
    "id": 6,
    "title": "Functions",
    "content": {
      "why": "Functions are how you turn one-off classification logic into something reusable across a whole test suite - like a classify_failure() helper used by every test, or a tool function called by an AI agent.",
      "typescriptExample": "function classifyFailure(error: string) {\n  if (error.includes(\"500\")) {\n    return \"backend\";\n  }\n  return \"unknown\";\n}\n\nconsole.log(classifyFailure(\"POST /orders returned HTTP 500\"));",
      "pythonExample": "def classify_failure(error):\n    if \"500\" in error:\n        return \"backend\"\n    return \"unknown\"\n\nprint(classify_failure(\"POST /orders returned HTTP 500\"))",
      "explanation": "Python uses 'def' instead of 'function'. There are no curly braces - indentation defines the function body. 'return' works the same way. Default arguments look like def f(x, retries=3): just like TS default parameters.",
      "exercise": {
        "instructions": "Create a function classify_failure(error) that returns \"backend\" if error contains \"500\", otherwise \"unknown\". Call it with \"POST /orders returned HTTP 500\" and print the result.",
        "starterCode": "# Define classify_failure below\n\n",
        "expectedOutput": "backend",
        "hints": [
          "Define with: def classify_failure(error):",
          "Use the same if/return pattern as the conditions lesson.",
          "print(classify_failure(\"POST /orders returned HTTP 500\"))"
        ],
        "solution": "def classify_failure(error):\n    if \"500\" in error:\n        return \"backend\"\n    return \"unknown\"\n\nprint(classify_failure(\"POST /orders returned HTTP 500\"))"
      }
    }
  },
  {
    "id": 7,
    "title": "Type Hints",
    "content": {
      "why": "Type hints make Python functions self-documenting, closer to TypeScript, and much easier to maintain in larger QA frameworks, DeepEval custom metrics, or agent tool definitions where the function signature needs to be clear at a glance.",
      "typescriptExample": "function classifyFailure(error: string): string {\n  if (error.includes(\"500\")) {\n    return \"backend\";\n  }\n  return \"unknown\";\n}",
      "pythonExample": "def classify_failure(error: str) -> str:\n    if \"500\" in error:\n        return \"backend\"\n    return \"unknown\"",
      "explanation": "Parameter hints go after a colon: error: str. The return type hint goes after '->' before the final colon. Python does not enforce these at runtime (unlike TS at compile time) - they're documentation and editor/tooling support, but still very useful.",
      "exercise": {
        "instructions": "Rewrite classify_failure(error) with type hints: the parameter should be typed str and the return type should be str. Keep the same behavior, call it with \"POST /orders returned HTTP 500\" and print the result.",
        "starterCode": "# Define classify_failure with type hints below\n\n",
        "expectedOutput": "backend",
        "hints": [
          "Add `: str` after the parameter name.",
          "Add `-> str` before the final colon of the def line.",
          "def classify_failure(error: str) -> str:"
        ],
        "solution": "def classify_failure(error: str) -> str:\n    if \"500\" in error:\n        return \"backend\"\n    return \"unknown\"\n\nprint(classify_failure(\"POST /orders returned HTTP 500\"))"
      }
    }
  },
  {
    "id": 8,
    "title": "Loops",
    "content": {
      "why": "Retrying a flaky request, polling an agent until it finishes, or checking every item in a test run all come down to looping. It's one of the most-used constructs in any QA script.",
      "typescriptExample": "const scores = [0.9, 0.4, 0.75, 0.2];\n\nfor (const s of scores) {\n  console.log(s >= 0.5 ? \"pass\" : \"fail\");\n}\n\nlet i = 0;\nwhile (i < 3) {\n  console.log(i);\n  i++;\n}",
      "pythonExample": "scores = [0.9, 0.4, 0.75, 0.2]\n\nfor s in scores:\n    print(\"pass\" if s >= 0.5 else \"fail\")\n\ni = 0\nwhile i < 3:\n    print(i)\n    i += 1",
      "explanation": "Python's for loop walks directly over items - no index needed. while loops look the same as TS but use i += 1 instead of i++ (which doesn't exist in Python). Use range(n) when you need a counting loop: for i in range(3):.",
      "prediction": {
        "code": "total = 0\nfor n in [1, 2, 3, 4]:\n    total += n\n\nprint(total)",
        "answer": "10"
      },
      "exercise": {
        "instructions": "Given scores = [0.9, 0.4, 0.75, 0.2, 0.6], loop over them and print \"pass\" if a score is >= 0.5, otherwise print \"fail\", one per line.",
        "starterCode": "scores = [0.9, 0.4, 0.75, 0.2, 0.6]\n\n# Loop and print pass/fail below\n",
        "expectedOutput": "pass\nfail\npass\nfail\npass",
        "hints": [
          "Loop with: for s in scores:",
          "Use a conditional expression: \"pass\" if s >= 0.5 else \"fail\"",
          "print(\"pass\" if s >= 0.5 else \"fail\")"
        ],
        "solution": "scores = [0.9, 0.4, 0.75, 0.2, 0.6]\n\nfor s in scores:\n    print(\"pass\" if s >= 0.5 else \"fail\")"
      }
    }
  },
  {
    "id": 9,
    "title": "Strings",
    "content": {
      "why": "Parsing LLM output, log lines and error messages is mostly string manipulation. Building a readable test report or extracting a field from a raw log line both start with string methods.",
      "typescriptExample": "const line = \"test=Login status=failed\";\nconst parts = line.split(\" \");\nconsole.log(parts[0].split(\"=\")[1]);\nconsole.log(line.toUpperCase());\nconsole.log(line.includes(\"failed\"));",
      "pythonExample": "line = \"test=Login status=failed\"\nparts = line.split(\" \")\nprint(parts[0].split(\"=\")[1])\nprint(line.upper())\nprint(\"failed\" in line)",
      "explanation": "Python strings use .split(), .upper()/.lower(), .strip() (like .trim()), and the in operator instead of .includes(). f-strings handle most formatting needs; string methods return new strings since strings are immutable, just like in TS.",
      "exercise": {
        "instructions": "Given line = \"test=Checkout status=passed\", split it into two parts on the space, then split each part on \"=\" to get the test name and status. Print:\nCheckout -> passed",
        "starterCode": "line = \"test=Checkout status=passed\"\n\n# Parse and print below\n",
        "expectedOutput": "Checkout -> passed",
        "hints": [
          "Split on space first: parts = line.split(\" \")",
          "Each part has the shape key=value - split again on \"=\".",
          "print(f\"{parts[0].split('=')[1]} -> {parts[1].split('=')[1]}\")"
        ],
        "solution": "line = \"test=Checkout status=passed\"\nparts = line.split(\" \")\ntest_name = parts[0].split(\"=\")[1]\nstatus = parts[1].split(\"=\")[1]\n\nprint(f\"{test_name} -> {status}\")"
      }
    }
  },
  {
    "id": 10,
    "title": "JSON",
    "content": {
      "why": "API responses and LLM outputs almost always arrive as JSON text. DeepEval test cases, agent tool results and REST APIs all speak JSON, so parsing and producing it is a daily task.",
      "typescriptExample": "const raw = '{\"test\": \"Login\", \"passed\": false, \"score\": 0.42}';\nconst data = JSON.parse(raw);\nconsole.log(`${data.test}: ${data.passed} (${data.score})`);\nconsole.log(JSON.stringify(data));",
      "pythonExample": "import json\n\nraw = '{\"test\": \"Login\", \"passed\": false, \"score\": 0.42}'\ndata = json.loads(raw)\nprint(f\"{data['test']}: {data['passed']} ({data['score']})\")\nprint(json.dumps(data))",
      "explanation": "import json gives you json.loads() (parse a string into a dict/list) and json.dumps() (turn a dict/list back into a string) - the direct equivalents of JSON.parse and JSON.stringify. JSON's true/false/null become Python's True/False/None once parsed.",
      "prediction": {
        "code": "import json\n\nraw = '{\"name\": \"answer_relevancy\", \"passed\": true}'\ndata = json.loads(raw)\nprint(data[\"passed\"])",
        "answer": "True"
      },
      "exercise": {
        "instructions": "Parse the JSON string raw below and print:\nanswer_relevancy: 0.82",
        "starterCode": "import json\n\nraw = '{\"metric\": \"answer_relevancy\", \"score\": 0.82}'\n\n# Parse and print below\n",
        "expectedOutput": "answer_relevancy: 0.82",
        "hints": [
          "Use json.loads(raw) to turn the string into a dictionary.",
          "Access fields with data['metric'] and data['score'].",
          "print(f\"{data['metric']}: {data['score']}\")"
        ],
        "solution": "import json\n\nraw = '{\"metric\": \"answer_relevancy\", \"score\": 0.82}'\ndata = json.loads(raw)\n\nprint(f\"{data['metric']}: {data['score']}\")"
      }
    }
  },
  {
    "id": 11,
    "title": "Files",
    "content": {
      "why": "Writing a test report, reading a fixture file or saving evaluation results to disk are all file operations. Pyodide gives this sandbox a real in-browser filesystem, so the code here behaves exactly like it would on a real machine.",
      "typescriptExample": "const fs = require(\"fs\");\n\nfs.writeFileSync(\"report.txt\", \"Login: passed\\nCheckout: failed\\n\");\nconst content = fs.readFileSync(\"report.txt\", \"utf8\");\nconsole.log(content.trim());",
      "pythonExample": "with open(\"report.txt\", \"w\") as f:\n    f.write(\"Login: passed\\n\")\n    f.write(\"Checkout: failed\\n\")\n\nwith open(\"report.txt\", \"r\") as f:\n    content = f.read()\n\nprint(content.strip())",
      "explanation": "Python's with open(path, mode) as f: is the standard way to work with files - it automatically closes the file when the block ends, similar to try/finally. \"w\" writes (overwriting), \"a\" appends, \"r\" reads.",
      "exercise": {
        "instructions": "Write the lines \"Login: passed\" and \"Checkout: failed\" to a file named results.txt (one per line), then read the file back and print its contents (trimmed).",
        "starterCode": "# Write to results.txt, then read it back and print\n",
        "expectedOutput": "Login: passed\nCheckout: failed",
        "hints": [
          "Open for writing with: with open(\"results.txt\", \"w\") as f:",
          "Write each line with f.write(\"...\\\\n\").",
          "Reopen with \"r\", call f.read(), then print(content.strip())."
        ],
        "solution": "with open(\"results.txt\", \"w\") as f:\n    f.write(\"Login: passed\\n\")\n    f.write(\"Checkout: failed\\n\")\n\nwith open(\"results.txt\", \"r\") as f:\n    content = f.read()\n\nprint(content.strip())"
      }
    }
  },
  {
    "id": 12,
    "title": "Exceptions",
    "content": {
      "why": "LLM calls, HTTP requests and flaky environments all fail sometimes. Handling errors gracefully instead of letting the whole test runner crash is a core QA engineering skill.",
      "typescriptExample": "function getScore(result) {\n  try {\n    if (!(\"score\" in result)) {\n      throw new Error(\"missing score\");\n    }\n    return result.score;\n  } catch (e) {\n    console.log(`error: ${e.message}`);\n    return null;\n  } finally {\n    console.log(\"done checking\");\n  }\n}\n\nconsole.log(getScore({}));",
      "pythonExample": "def get_score(result):\n    try:\n        if \"score\" not in result:\n            raise ValueError(\"missing score\")\n        return result[\"score\"]\n    except ValueError as e:\n        print(f\"error: {e}\")\n        return None\n    finally:\n        print(\"done checking\")\n\nprint(get_score({}))",
      "explanation": "Python uses try/except instead of try/catch, and raise instead of throw. You can catch specific exception types (like ValueError or ZeroDivisionError) rather than catching everything, which makes error handling more precise. finally still runs no matter what, exactly like TS.",
      "exercise": {
        "instructions": "Write a function safe_divide(a, b) that returns a / b, but catches ZeroDivisionError and returns None while printing \"error: division by zero\" in that case. Call safe_divide(10, 0) and print the result.",
        "starterCode": "# Define safe_divide below\n\n",
        "expectedOutput": "error: division by zero\nNone",
        "hints": [
          "Wrap the division in try/except ZeroDivisionError:",
          "Print the error message inside the except block before returning None.",
          "def safe_divide(a, b):\\n    try: return a / b\\n    except ZeroDivisionError: ..."
        ],
        "solution": "def safe_divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        print(\"error: division by zero\")\n        return None\n\nprint(safe_divide(10, 0))"
      }
    }
  },
  {
    "id": 13,
    "title": "Modules",
    "content": {
      "why": "Organizing test helpers, utilities and DeepEval custom metrics into reusable modules keeps a growing QA codebase manageable instead of one giant script.",
      "typescriptExample": "// mathUtils.ts\nexport function average(nums: number[]): number {\n  return nums.reduce((a, b) => a + b, 0) / nums.length;\n}\n\n// main.ts\nimport { average } from \"./mathUtils\";\nconsole.log(average([1, 2, 3]));",
      "pythonExample": "import statistics\n\nscores = [0.9, 0.7, 0.8]\nprint(statistics.mean(scores))",
      "explanation": "Python's import module_name brings in a whole module (like import * as x), and from module_name import thing brings in just one name (like a named TS import). The standard library ships many ready-made modules - statistics, math, random, datetime - so you often don't need a third-party package at all.",
      "exercise": {
        "instructions": "Import the statistics module and use statistics.mean() to compute the average of scores = [0.9, 0.7, 0.8, 0.6]. Print the result.",
        "starterCode": "import statistics\n\nscores = [0.9, 0.7, 0.8, 0.6]\n\n# Compute and print the mean below\n",
        "expectedOutput": "0.75",
        "hints": [
          "statistics.mean(scores) returns the average of a list of numbers.",
          "Pass the whole list directly: statistics.mean(scores)",
          "print(statistics.mean(scores))"
        ],
        "solution": "import statistics\n\nscores = [0.9, 0.7, 0.8, 0.6]\nprint(statistics.mean(scores))"
      }
    }
  },
  {
    "id": 14,
    "title": "Virtual Environments",
    "content": {
      "why": "Different QA projects often need different, conflicting versions of the same package. A virtual environment isolates one project's installed packages from another's, the same role a per-project node_modules plays in JS.",
      "typescriptExample": "// package.json pins versions per project - each project gets its own\n// node_modules, so version conflicts between projects can't happen.\nconst projectA = { pytest: \"7.4.0\" };\nconst projectB = { pytest: \"8.0.0\" };\n\nconsole.log(projectA.pytest !== projectB.pytest ? \"conflict\" : \"compatible\");",
      "pythonExample": "# A virtual environment keeps one project's installed package versions\n# from leaking into another project - created with:\n#   python3 -m venv .venv\n#   source .venv/bin/activate\n\nproject_a = {\"pytest\": \"7.4.0\"}\nproject_b = {\"pytest\": \"8.0.0\"}\n\nprint(\"conflict\" if project_a[\"pytest\"] != project_b[\"pytest\"] else \"compatible\")",
      "explanation": "A virtual environment is a private, isolated copy of Python plus installed packages for one project. Without one, installing one project's dependencies can silently break another project's - exactly the problem per-project node_modules folders solve in JS.",
      "exercise": {
        "instructions": "Given project_a = {\"pytest\": \"7.4.0\"} and project_b = {\"pytest\": \"7.4.0\"}, print \"conflict\" if the pytest versions differ, otherwise print \"compatible\".",
        "starterCode": "project_a = {\"pytest\": \"7.4.0\"}\nproject_b = {\"pytest\": \"7.4.0\"}\n\n# Compare versions and print below\n",
        "expectedOutput": "compatible",
        "hints": [
          "Compare the two version strings with !=.",
          "Use a conditional expression, same shape as the Loops lesson.",
          "print(\"conflict\" if project_a['pytest'] != project_b['pytest'] else \"compatible\")"
        ],
        "solution": "project_a = {\"pytest\": \"7.4.0\"}\nproject_b = {\"pytest\": \"7.4.0\"}\n\nprint(\"conflict\" if project_a[\"pytest\"] != project_b[\"pytest\"] else \"compatible\")"
      }
    }
  },
  {
    "id": 15,
    "title": "pip",
    "content": {
      "why": "Installing DeepEval, requests or pytest into a project all go through pip, Python's package installer. Knowing how dependencies are declared and installed is essential before you can use any third-party library.",
      "typescriptExample": "// package.json\n{\n  \"dependencies\": {\n    \"jest\": \"^29.0.0\",\n    \"axios\": \"^1.6.0\"\n  }\n}\n// npm install",
      "pythonExample": "# requirements.txt\n#   deepeval==1.0.0\n#   requests==2.31.0\n#   pytest==7.4.0\n#\n# pip install -r requirements.txt\n\nrequirements = \"deepeval==1.0.0\\nrequests==2.31.0\\npytest==7.4.0\"\n\nfor line in requirements.splitlines():\n    name, version = line.split(\"==\")\n    print(f\"{name} -> {version}\")",
      "explanation": "pip is Python's package installer (pip install <name> is the equivalent of npm install <name>). Projects list their dependencies in a requirements.txt file, often pinned with ==version, and pip install -r requirements.txt installs everything at once - similar to npm install reading package.json.",
      "exercise": {
        "instructions": "Given requirements = \"deepeval==1.0.0\\nrequests==2.31.0\", split it into lines, then split each line on \"==\" to print:\ndeepeval needs 1.0.0\nrequests needs 2.31.0",
        "starterCode": "requirements = \"deepeval==1.0.0\\nrequests==2.31.0\"\n\n# Parse and print below\n",
        "expectedOutput": "deepeval needs 1.0.0\nrequests needs 2.31.0",
        "hints": [
          "Split into lines with requirements.splitlines().",
          "Split each line on \"==\" to get the name and version.",
          "print(f\"{name} needs {version}\") inside the loop."
        ],
        "solution": "requirements = \"deepeval==1.0.0\\nrequests==2.31.0\"\n\nfor line in requirements.splitlines():\n    name, version = line.split(\"==\")\n    print(f\"{name} needs {version}\")"
      }
    }
  },
  {
    "id": 16,
    "title": "Environment Variables",
    "content": {
      "why": "API keys for LLM providers, and settings that change between staging and production, should never be hard-coded into test scripts. Environment variables are the standard, secure way to configure QA tooling.",
      "typescriptExample": "// .env (never commit this file)\n// OPENAI_API_KEY=sk-...\n\nconst apiKey = process.env.OPENAI_API_KEY ?? \"not set\";\nconsole.log(apiKey);",
      "pythonExample": "import os\n\nos.environ[\"OPENAI_API_KEY\"] = \"sk-demo-123\"  # normally set outside your code\n\napi_key = os.environ.get(\"OPENAI_API_KEY\", \"not set\")\nprint(api_key)\n\nmissing = os.environ.get(\"MISSING_KEY\", \"not set\")\nprint(missing)",
      "explanation": "os.environ.get(\"NAME\", default) reads an environment variable, exactly like process.env.NAME in Node, but with a built-in default instead of needing ??. Real secrets (API keys, tokens) should live in environment variables or a .env file - never hard-coded in your test scripts or committed to git.",
      "prediction": {
        "code": "import os\n\nos.environ[\"STAGE\"] = \"staging\"\nprint(os.environ.get(\"STAGE\", \"production\"))\nprint(os.environ.get(\"REGION\", \"us-east-1\"))",
        "answer": "staging\nus-east-1"
      },
      "exercise": {
        "instructions": "Set an environment variable DEEPEVAL_API_KEY to \"demo-key\", then read it back with os.environ.get using a default of \"not set\" and print it. Also read a MODEL_NAME variable that was never set, with a default of \"gpt-4\", and print that too.",
        "starterCode": "import os\n\n# Set and read environment variables below\n",
        "expectedOutput": "demo-key\ngpt-4",
        "hints": [
          "Set a variable with: os.environ[\"NAME\"] = \"value\"",
          "Read it with: os.environ.get(\"NAME\", \"default\")",
          "os.environ[\"DEEPEVAL_API_KEY\"] = \"demo-key\"; then print(os.environ.get(\"DEEPEVAL_API_KEY\", \"not set\"))"
        ],
        "solution": "import os\n\nos.environ[\"DEEPEVAL_API_KEY\"] = \"demo-key\"\nprint(os.environ.get(\"DEEPEVAL_API_KEY\", \"not set\"))\nprint(os.environ.get(\"MODEL_NAME\", \"gpt-4\"))"
      }
    }
  },
  {
    "id": 17,
    "title": "Classes",
    "content": {
      "why": "Representing a test case, an agent's state, or a piece of QA data as a class instead of a raw dictionary gives you methods and structure - useful once your tooling grows beyond a few scripts.",
      "typescriptExample": "class TestCase {\n  name: string;\n  passed: boolean;\n\n  constructor(name: string, passed: boolean) {\n    this.name = name;\n    this.passed = passed;\n  }\n\n  summary(): string {\n    return `${this.name}: ${this.passed ? \"PASS\" : \"FAIL\"}`;\n  }\n}\n\nconst t = new TestCase(\"Login\", true);\nconsole.log(t.summary());",
      "pythonExample": "class TestCase:\n    def __init__(self, name, passed):\n        self.name = name\n        self.passed = passed\n\n    def summary(self):\n        status = \"PASS\" if self.passed else \"FAIL\"\n        return f\"{self.name}: {status}\"\n\nt = TestCase(\"Login\", True)\nprint(t.summary())",
      "explanation": "Python classes use __init__ instead of a constructor, and every method's first parameter is explicitly self (the equivalent of this, but you have to write it yourself). There's no new keyword - you just call the class like a function: TestCase(\"Login\", True).",
      "exercise": {
        "instructions": "Define a class TestCase with __init__(self, name, passed) and a method summary(self) that returns \"<name>: PASS\" or \"<name>: FAIL\". Create TestCase(\"Checkout\", False) and print its summary.",
        "starterCode": "# Define the TestCase class below\n\n",
        "expectedOutput": "Checkout: FAIL",
        "hints": [
          "Store name and passed on self inside __init__.",
          "summary() should build a string using an if/else on self.passed.",
          "status = \"PASS\" if self.passed else \"FAIL\"; return f\"{self.name}: {status}\""
        ],
        "solution": "class TestCase:\n    def __init__(self, name, passed):\n        self.name = name\n        self.passed = passed\n\n    def summary(self):\n        status = \"PASS\" if self.passed else \"FAIL\"\n        return f\"{self.name}: {status}\"\n\nt = TestCase(\"Checkout\", False)\nprint(t.summary())"
      }
    }
  },
  {
    "id": 18,
    "title": "Dataclasses",
    "content": {
      "why": "Dataclasses cut the boilerplate of writing __init__ by hand, making them the standard way to represent structured QA data - test results, metrics, configs - the same role a TS interface or type plays.",
      "typescriptExample": "interface TestResult {\n  name: string;\n  passed: boolean;\n  duration: number;\n}\n\nconst r: TestResult = { name: \"Login\", passed: true, duration: 1.2 };\nconsole.log(`${r.name}: ${r.passed} (${r.duration}s)`);",
      "pythonExample": "from dataclasses import dataclass\n\n@dataclass\nclass TestResult:\n    name: str\n    passed: bool\n    duration: float\n\nr = TestResult(name=\"Login\", passed=True, duration=1.2)\nprint(f\"{r.name}: {r.passed} ({r.duration}s)\")",
      "explanation": "@dataclass generates __init__, __repr__ and __eq__ for you from just the field list - the closest thing Python has to a TS interface/type, but with real objects you can instantiate. It's the recommended way to represent structured QA data without writing boilerplate classes by hand.",
      "exercise": {
        "instructions": "Define a dataclass TestResult with fields name: str, passed: bool, duration: float. Create TestResult(name=\"Checkout\", passed=False, duration=2.5) and print:\nCheckout: False (2.5s)",
        "starterCode": "from dataclasses import dataclass\n\n# Define TestResult below\n\n",
        "expectedOutput": "Checkout: False (2.5s)",
        "hints": [
          "Decorate the class with @dataclass.",
          "List fields as name: str, passed: bool, duration: float - no __init__ needed.",
          "print(f\"{r.name}: {r.passed} ({r.duration}s)\")"
        ],
        "solution": "from dataclasses import dataclass\n\n@dataclass\nclass TestResult:\n    name: str\n    passed: bool\n    duration: float\n\nr = TestResult(name=\"Checkout\", passed=False, duration=2.5)\nprint(f\"{r.name}: {r.passed} ({r.duration}s)\")"
      }
    }
  },
  {
    "id": 19,
    "title": "Pytest",
    "content": {
      "why": "Pytest is the standard Python test framework - DeepEval itself runs on top of it (deepeval test run uses pytest internally). Knowing how pytest discovers and runs tests is essential before writing any real test suite.",
      "typescriptExample": "// login.test.ts\ndescribe(\"classifyFailure\", () => {\n  it(\"detects backend errors\", () => {\n    expect(classifyFailure(\"HTTP 500\")).toBe(\"backend\");\n  });\n});",
      "pythonExample": "# test_failures.py - pytest discovers files/functions starting with test_\ndef classify_failure(error):\n    return \"backend\" if \"500\" in error else \"unknown\"\n\ndef test_detects_backend_errors():\n    assert classify_failure(\"HTTP 500\") == \"backend\"\n\n# In a real project you'd just run `pytest` from the terminal and it would\n# find and run test_detects_backend_errors automatically. This sandbox can't\n# launch the real CLI, so here we call it directly.\ntest_detects_backend_errors()\nprint(\"test_detects_backend_errors: PASS\")",
      "explanation": "Real pytest finds any file named test_*.py or *_test.py, runs every function starting with test_, and treats a plain assert failing as a failed test - no expect()/toBe() needed. In a real project you'd just run pytest from the terminal; this sandbox simulates that by calling the test function directly since it can't launch the actual CLI.",
      "exercise": {
        "instructions": "Write a function classify_failure(error) (backend if \"500\" in error, else \"unknown\"), then a test_ function test_classifies_backend() that asserts classify_failure(\"HTTP 500\") == \"backend\". Call test_classifies_backend() and print \"test_classifies_backend: PASS\".",
        "starterCode": "def classify_failure(error):\n    return \"backend\" if \"500\" in error else \"unknown\"\n\n# Define test_classifies_backend below, then call it and print PASS\n",
        "expectedOutput": "test_classifies_backend: PASS",
        "hints": [
          "Define test_classifies_backend() using assert, just like the example.",
          "Call the function directly: test_classifies_backend()",
          "If the assert doesn't raise, print \"test_classifies_backend: PASS\"."
        ],
        "solution": "def classify_failure(error):\n    return \"backend\" if \"500\" in error else \"unknown\"\n\ndef test_classifies_backend():\n    assert classify_failure(\"HTTP 500\") == \"backend\"\n\ntest_classifies_backend()\nprint(\"test_classifies_backend: PASS\")"
      }
    }
  },
  {
    "id": 20,
    "title": "Assertions",
    "content": {
      "why": "Comparing an expected value to an actual one is the heart of every test, and it's exactly how pytest (and DeepEval's score >= threshold checks) decide pass or fail.",
      "typescriptExample": "function expectEqual(actual, expected) {\n  if (actual !== expected) {\n    throw new Error(`expected ${expected}, got ${actual}`);\n  }\n}\n\nexpectEqual(2 + 2, 4);\nconsole.log(\"assertion passed\");",
      "pythonExample": "score = 0.82\nthreshold = 0.7\n\nassert score >= threshold, f\"score {score} did not meet threshold {threshold}\"\nprint(\"assertion passed\")",
      "explanation": "assert condition, \"message\" is Python's built-in way to check something is true - if the condition is false, it raises an AssertionError with your message, which is exactly how pytest decides a test failed. There's no need for a separate expect()/toBe() library; assert is a language keyword.",
      "exercise": {
        "instructions": "Given score = 0.42 and threshold = 0.5, write an assert that checks score >= threshold with the message f\"score {score} below threshold {threshold}\". Wrap it in a try/except AssertionError that prints the exception message when it fails.",
        "starterCode": "score = 0.42\nthreshold = 0.5\n\n# Write your try/except with an assert below\n",
        "expectedOutput": "score 0.42 below threshold 0.5",
        "hints": [
          "Put the assert inside a try block.",
          "assert score >= threshold, f\"score {score} below threshold {threshold}\"",
          "except AssertionError as e: print(e)"
        ],
        "solution": "score = 0.42\nthreshold = 0.5\n\ntry:\n    assert score >= threshold, f\"score {score} below threshold {threshold}\"\nexcept AssertionError as e:\n    print(e)"
      }
    }
  },
  {
    "id": 21,
    "title": "Parametrize",
    "content": {
      "why": "Running the same check across many LLM prompts or test inputs without copy-pasting the test body is exactly what pytest's parametrize (and jest's test.each) are built for.",
      "typescriptExample": "test.each([\n  [\"2+2\", \"4\"],\n  [\"capital of France\", \"Paris\"]\n])(\"evaluates %s\", (prompt, expected) => {\n  expect(askLlm(prompt)).toBe(expected);\n});",
      "pythonExample": "# Real pytest:\n# import pytest\n#\n# @pytest.mark.parametrize(\"prompt,expected\", [\n#     (\"2+2\", \"4\"),\n#     (\"capital of France\", \"Paris\"),\n# ])\n# def test_llm_answer(prompt, expected):\n#     assert ask_llm(prompt) == expected\n\ndef ask_llm(prompt):\n    answers = {\"2+2\": \"4\", \"capital of France\": \"Paris\"}\n    return answers.get(prompt, \"unknown\")\n\ncases = [\n    (\"2+2\", \"4\"),\n    (\"capital of France\", \"Paris\"),\n]\n\nfor prompt, expected in cases:\n    result = ask_llm(prompt)\n    print(f\"{prompt}: {'PASS' if result == expected else 'FAIL'}\")",
      "explanation": "pytest.mark.parametrize runs the same test function once per row of data you give it, instead of copy-pasting the test body for every input - very similar to jest's test.each. This sandbox can't load the real decorator, so the loop above simulates exactly what it does under the hood: call the same check once per case.",
      "exercise": {
        "instructions": "Given cases = [(\"hello\", \"HELLO\"), (\"test\", \"TEST\")], loop over the cases and for each (text, expected) pair print \"PASS\" if text.upper() == expected else \"FAIL\".",
        "starterCode": "cases = [(\"hello\", \"HELLO\"), (\"test\", \"TEST\")]\n\n# Loop over cases and print PASS/FAIL below\n",
        "expectedOutput": "PASS\nPASS",
        "hints": [
          "Unpack each tuple in the loop: for text, expected in cases:",
          "Compare text.upper() to expected.",
          "print(\"PASS\" if text.upper() == expected else \"FAIL\")"
        ],
        "solution": "cases = [(\"hello\", \"HELLO\"), (\"test\", \"TEST\")]\n\nfor text, expected in cases:\n    print(\"PASS\" if text.upper() == expected else \"FAIL\")"
      }
    }
  },
  {
    "id": 22,
    "title": "Fixtures",
    "content": {
      "why": "A pytest fixture is reusable setup code shared across many tests - like a fake API client or agent instance - so each test doesn't repeat the same setup. Keeping suites DRY matters as they grow.",
      "typescriptExample": "let apiClient;\n\nbeforeEach(() => {\n  apiClient = createFakeApiClient();\n});\n\nit(\"fetches a result\", () => {\n  expect(apiClient.get(\"/health\")).toBe(\"ok\");\n});",
      "pythonExample": "# Real pytest:\n# import pytest\n#\n# @pytest.fixture\n# def api_client():\n#     return FakeApiClient()\n#\n# def test_health(api_client):\n#     assert api_client.get(\"/health\") == \"ok\"\n\nclass FakeApiClient:\n    def get(self, path):\n        return \"ok\" if path == \"/health\" else \"not found\"\n\ndef api_client():\n    \"\"\"Stands in for a pytest fixture - called by hand here instead.\"\"\"\n    return FakeApiClient()\n\ndef test_health():\n    client = api_client()\n    assert client.get(\"/health\") == \"ok\"\n\ntest_health()\nprint(\"test_health: PASS\")",
      "explanation": "A pytest fixture is just a reusable setup function - you declare a parameter with the same name as the fixture, and pytest calls it for you and hands you the result. Multiple tests can share one api_client() fixture instead of each test repeating the setup code.",
      "exercise": {
        "instructions": "Define a function make_agent() that returns the dict {\"name\": \"triage-bot\", \"ready\": True} (standing in for a fixture). Write test_agent_ready() that calls make_agent() and asserts result[\"ready\"] is True. Call it and print \"test_agent_ready: PASS\".",
        "starterCode": "# Define make_agent and test_agent_ready below\n\n",
        "expectedOutput": "test_agent_ready: PASS",
        "hints": [
          "make_agent() just returns a dict literal - no arguments needed.",
          "Inside test_agent_ready(), call agent = make_agent() then assert agent['ready'] is True.",
          "test_agent_ready(); print(\"test_agent_ready: PASS\")"
        ],
        "solution": "def make_agent():\n    return {\"name\": \"triage-bot\", \"ready\": True}\n\ndef test_agent_ready():\n    agent = make_agent()\n    assert agent[\"ready\"] is True\n\ntest_agent_ready()\nprint(\"test_agent_ready: PASS\")"
      }
    }
  },
  {
    "id": 23,
    "title": "HTTP Requests",
    "content": {
      "why": "Calling the application-under-test's REST API or an LLM provider's API is a daily task in AI QA. Knowing the request/response shape matters even before you touch a real network.",
      "typescriptExample": "const response = await fetch(\"https://api.example.com/health\");\nconst data = await response.json();\nconsole.log(response.status, data.status);",
      "pythonExample": "# Real code: import requests; requests.get(\"https://api.example.com/health\")\n# This sandbox has no network access, so we use a tiny mock in its place\n# with the same shape as the requests library's response object.\n\nclass MockResponse:\n    def __init__(self, status_code, data):\n        self.status_code = status_code\n        self._data = data\n\n    def json(self):\n        return self._data\n\ndef mock_get(url):\n    return MockResponse(200, {\"status\": \"ok\"})\n\nresponse = mock_get(\"https://api.example.com/health\")\nprint(response.status_code, response.json()[\"status\"])",
      "explanation": "The real requests library's requests.get(url) returns a response object with .status_code and .json() - the mock above mirrors that exact interface. Since this sandbox is offline, every HTTP example here uses a mock instead of a real network call, but the pattern (check status_code, read .json()) is identical to real code.",
      "exercise": {
        "instructions": "Using the MockResponse class and mock_get function below, call mock_get(\"/users/1\") and print:\n200 ok",
        "starterCode": "class MockResponse:\n    def __init__(self, status_code, data):\n        self.status_code = status_code\n        self._data = data\n\n    def json(self):\n        return self._data\n\ndef mock_get(url):\n    return MockResponse(200, {\"status\": \"ok\"})\n\n# Call mock_get and print below\n",
        "expectedOutput": "200 ok",
        "hints": [
          "Call response = mock_get(\"/users/1\").",
          "response.status_code is a number, response.json() returns a dict.",
          "print(response.status_code, response.json()['status'])"
        ],
        "solution": "class MockResponse:\n    def __init__(self, status_code, data):\n        self.status_code = status_code\n        self._data = data\n\n    def json(self):\n        return self._data\n\ndef mock_get(url):\n    return MockResponse(200, {\"status\": \"ok\"})\n\nresponse = mock_get(\"/users/1\")\nprint(response.status_code, response.json()[\"status\"])"
      }
    }
  },
  {
    "id": 24,
    "title": "API Error Handling",
    "content": {
      "why": "Real APIs time out, return 500s, and fail in all sorts of ways. Handling each failure mode distinctly - instead of one generic catch-all - is what makes QA tooling resilient instead of fragile.",
      "typescriptExample": "try {\n  const response = await fetch(url);\n  if (!response.ok) {\n    throw new Error(`HTTP ${response.status}`);\n  }\n} catch (e) {\n  console.log(`request failed: ${e.message}`);\n}",
      "pythonExample": "class ApiError(Exception):\n    pass\n\ndef mock_get(url):\n    if \"timeout\" in url:\n        raise TimeoutError(\"request timed out\")\n    return {\"status_code\": 500}\n\ndef fetch_health(url):\n    try:\n        response = mock_get(url)\n        if response[\"status_code\"] >= 500:\n            raise ApiError(f\"server error {response['status_code']}\")\n        return \"ok\"\n    except TimeoutError as e:\n        return f\"timeout: {e}\"\n    except ApiError as e:\n        return f\"api error: {e}\"\n\nprint(fetch_health(\"https://api.example.com/health\"))",
      "explanation": "Defining your own exception class (class ApiError(Exception): pass) lets you raise and catch errors specific to your QA tooling, instead of only generic ones - similar to extending Error in TS. Catching TimeoutError and ApiError separately means you can respond differently to each failure mode.",
      "exercise": {
        "instructions": "Using fetch_health, mock_get and ApiError below, call fetch_health(\"https://api.example.com/timeout\") and print the result.",
        "starterCode": "class ApiError(Exception):\n    pass\n\ndef mock_get(url):\n    if \"timeout\" in url:\n        raise TimeoutError(\"request timed out\")\n    return {\"status_code\": 500}\n\ndef fetch_health(url):\n    try:\n        response = mock_get(url)\n        if response[\"status_code\"] >= 500:\n            raise ApiError(f\"server error {response['status_code']}\")\n        return \"ok\"\n    except TimeoutError as e:\n        return f\"timeout: {e}\"\n    except ApiError as e:\n        return f\"api error: {e}\"\n\n# Call fetch_health and print below\n",
        "expectedOutput": "timeout: request timed out",
        "hints": [
          "Call fetch_health(\"https://api.example.com/timeout\").",
          "The url contains \"timeout\", so mock_get raises TimeoutError.",
          "print(fetch_health(\"https://api.example.com/timeout\"))"
        ],
        "solution": "class ApiError(Exception):\n    pass\n\ndef mock_get(url):\n    if \"timeout\" in url:\n        raise TimeoutError(\"request timed out\")\n    return {\"status_code\": 500}\n\ndef fetch_health(url):\n    try:\n        response = mock_get(url)\n        if response[\"status_code\"] >= 500:\n            raise ApiError(f\"server error {response['status_code']}\")\n        return \"ok\"\n    except TimeoutError as e:\n        return f\"timeout: {e}\"\n    except ApiError as e:\n        return f\"api error: {e}\"\n\nprint(fetch_health(\"https://api.example.com/timeout\"))"
      }
    }
  },
  {
    "id": 25,
    "title": "List Comprehensions",
    "content": {
      "why": "Filtering down to just the failed tests, or transforming a list of raw results into display-ready strings, is something you'll do constantly when summarizing test runs or LLM evaluation batches.",
      "typescriptExample": "const results = [\n  { test: \"Login\", passed: true },\n  { test: \"Checkout\", passed: false },\n  { test: \"Payment\", passed: false }\n];\n\nconst failedNames = results.filter(r => !r.passed).map(r => r.test);\nconsole.log(failedNames);",
      "pythonExample": "results = [\n    {\"test\": \"Login\", \"passed\": True},\n    {\"test\": \"Checkout\", \"passed\": False},\n    {\"test\": \"Payment\", \"passed\": False}\n]\n\nfailed_names = [r[\"test\"] for r in results if not r[\"passed\"]]\nprint(failed_names)",
      "explanation": "[expr for item in iterable if condition] combines filter + map into one line - expr plays the role of .map()'s callback, and if condition plays the role of .filter()'s callback. It's idiomatic Python for building a new list from an existing one.",
      "prediction": {
        "code": "nums = [1, 2, 3, 4, 5, 6]\nevens = [n * n for n in nums if n % 2 == 0]\nprint(evens)",
        "answer": "[4, 16, 36]"
      },
      "exercise": {
        "instructions": "Given results below, use a list comprehension to build a list of test names where passed is False, and print it.",
        "starterCode": "results = [\n    {\"test\": \"Login\", \"passed\": True},\n    {\"test\": \"Checkout\", \"passed\": False},\n    {\"test\": \"Payment\", \"passed\": False}\n]\n\n# Build failed_names with a list comprehension and print it\n",
        "expectedOutput": "['Checkout', 'Payment']",
        "hints": [
          "The shape is [expr for item in list if condition].",
          "Your condition is `not r[\"passed\"]`.",
          "failed_names = [r['test'] for r in results if not r['passed']]"
        ],
        "solution": "results = [\n    {\"test\": \"Login\", \"passed\": True},\n    {\"test\": \"Checkout\", \"passed\": False},\n    {\"test\": \"Payment\", \"passed\": False}\n]\n\nfailed_names = [r[\"test\"] for r in results if not r[\"passed\"]]\nprint(failed_names)"
      }
    }
  },
  {
    "id": 26,
    "title": "Async/Await",
    "content": {
      "why": "Calling several LLM endpoints or agent tool calls at once, instead of waiting for each one in sequence, is exactly what async/await with concurrent gathering gives you.",
      "typescriptExample": "async function fetchResult(name) {\n  await new Promise((r) => setTimeout(r, 100));\n  return `${name}: done`;\n}\n\nasync function main() {\n  const results = await Promise.all([\n    fetchResult(\"Login\"),\n    fetchResult(\"Checkout\")\n  ]);\n  results.forEach((r) => console.log(r));\n}\n\nmain();",
      "pythonExample": "import asyncio\n\nasync def fetch_result(name):\n    await asyncio.sleep(0.1)\n    return f\"{name}: done\"\n\nasync def main():\n    results = await asyncio.gather(\n        fetch_result(\"Login\"),\n        fetch_result(\"Checkout\")\n    )\n    for r in results:\n        print(r)\n\nawait main()",
      "explanation": "async def and await work exactly like their TS counterparts. asyncio.gather(...) is Python's Promise.all() - it runs multiple coroutines concurrently and waits for all of them. This is how you'd call several LLM endpoints or agent tool calls at once instead of one at a time.",
      "exercise": {
        "instructions": "Write an async function check_endpoint(name) that awaits asyncio.sleep(0.1) then returns f\"{name}: ok\". Using asyncio.gather, run it concurrently for \"auth\" and \"payments\", then print each result on its own line.",
        "starterCode": "import asyncio\n\n# Define check_endpoint below\n\nasync def main():\n    results = await asyncio.gather(\n        check_endpoint(\"auth\"),\n        check_endpoint(\"payments\")\n    )\n    for r in results:\n        print(r)\n\nawait main()\n",
        "expectedOutput": "auth: ok\npayments: ok",
        "hints": [
          "Define it with: async def check_endpoint(name):",
          "Inside, await asyncio.sleep(0.1) before returning.",
          "return f\"{name}: ok\""
        ],
        "solution": "import asyncio\n\nasync def check_endpoint(name):\n    await asyncio.sleep(0.1)\n    return f\"{name}: ok\"\n\nasync def main():\n    results = await asyncio.gather(\n        check_endpoint(\"auth\"),\n        check_endpoint(\"payments\")\n    )\n    for r in results:\n        print(r)\n\nawait main()"
      }
    }
  },
  {
    "id": 27,
    "title": "AI Test Failure Analyzer",
    "content": {
      "why": "This brings together functions, dicts, conditions and loops into one small but realistic tool: a failure triage script that takes a batch of test failures and summarizes how many fall into each category.",
      "typescriptExample": "function classify(error) {\n  if (error.includes(\"500\")) return \"backend\";\n  if (error.toLowerCase().includes(\"element\")) return \"automation\";\n  return \"unknown\";\n}\n\nfunction analyze(failures) {\n  const counts = {};\n  for (const f of failures) {\n    const category = classify(f.error);\n    counts[category] = (counts[category] ?? 0) + 1;\n  }\n  return counts;\n}",
      "pythonExample": "def classify(error):\n    if \"500\" in error:\n        return \"backend\"\n    if \"element\" in error.lower():\n        return \"automation\"\n    return \"unknown\"\n\ndef analyze_failures(failures):\n    counts = {}\n    for f in failures:\n        category = classify(f[\"error\"])\n        counts[category] = counts.get(category, 0) + 1\n    return counts\n\nfailures = [\n    {\"test\": \"Checkout\", \"error\": \"HTTP 500\"},\n    {\"test\": \"Login\", \"error\": \"Element not found\"},\n    {\"test\": \"Payment\", \"error\": \"HTTP 500\"}\n]\n\nprint(analyze_failures(failures))",
      "explanation": "counts.get(category, 0) is the Python idiom for \"read this key, or 0 if it's missing\" - useful for building up tallies without checking for existence first. This is the same shape as every failure-triage or metrics-summary tool you'd write for a real AI QA pipeline.",
      "exercise": {
        "instructions": "Using classify and analyze_failures below, run analyze_failures on the failures list and print the resulting counts dictionary.",
        "starterCode": "def classify(error):\n    if \"500\" in error:\n        return \"backend\"\n    if \"element\" in error.lower():\n        return \"automation\"\n    return \"unknown\"\n\ndef analyze_failures(failures):\n    counts = {}\n    for f in failures:\n        category = classify(f[\"error\"])\n        counts[category] = counts.get(category, 0) + 1\n    return counts\n\nfailures = [\n    {\"test\": \"Checkout\", \"error\": \"HTTP 500\"},\n    {\"test\": \"Login\", \"error\": \"Element not found\"},\n    {\"test\": \"Payment\", \"error\": \"HTTP 500\"}\n]\n\n# Call analyze_failures and print the result\n",
        "expectedOutput": "{'backend': 2, 'automation': 1}",
        "hints": [
          "Call summary = analyze_failures(failures).",
          "Then print(summary).",
          "print(analyze_failures(failures))"
        ],
        "solution": "def classify(error):\n    if \"500\" in error:\n        return \"backend\"\n    if \"element\" in error.lower():\n        return \"automation\"\n    return \"unknown\"\n\ndef analyze_failures(failures):\n    counts = {}\n    for f in failures:\n        category = classify(f[\"error\"])\n        counts[category] = counts.get(category, 0) + 1\n    return counts\n\nfailures = [\n    {\"test\": \"Checkout\", \"error\": \"HTTP 500\"},\n    {\"test\": \"Login\", \"error\": \"Element not found\"},\n    {\"test\": \"Payment\", \"error\": \"HTTP 500\"}\n]\n\nprint(analyze_failures(failures))"
      }
    }
  },
  {
    "id": 28,
    "title": "LLM APIs",
    "content": {
      "why": "Every major LLM provider (OpenAI, Anthropic, etc.) returns a similarly-shaped nested response. Once you can reliably pull the generated text out of that structure, you can feed it into DeepEval metrics or your own assertions.",
      "typescriptExample": "const response = await openai.chat.completions.create({\n  model: \"gpt-4\",\n  messages: [{ role: \"user\", content: \"Say hello\" }]\n});\n\nconsole.log(response.choices[0].message.content);",
      "pythonExample": "# Real code: client.chat.completions.create(model=..., messages=[...])\n# This sandbox is offline, so mock_chat_completion mimics the exact\n# response shape an LLM API returns.\n\ndef mock_chat_completion(prompt):\n    return {\n        \"model\": \"gpt-4\",\n        \"choices\": [\n            {\"message\": {\"role\": \"assistant\", \"content\": f\"Echo: {prompt}\"}}\n        ]\n    }\n\nresponse = mock_chat_completion(\"Say hello\")\nprint(response[\"choices\"][0][\"message\"][\"content\"])",
      "explanation": "Every major LLM API returns a nested structure like this: a list of choices, each with a message containing the actual text in .content. Once you can reliably pull response['choices'][0]['message']['content'] out of that structure, you can feed it into DeepEval metrics or your own assertions.",
      "prediction": {
        "code": "def mock_chat_completion(prompt):\n    return {\"choices\": [{\"message\": {\"content\": prompt.upper()}}]}\n\nresponse = mock_chat_completion(\"hello\")\nprint(response[\"choices\"][0][\"message\"][\"content\"])",
        "answer": "HELLO"
      },
      "exercise": {
        "instructions": "Using mock_chat_completion below, call it with \"What is 2+2?\" and print just the message content.",
        "starterCode": "def mock_chat_completion(prompt):\n    return {\n        \"model\": \"gpt-4\",\n        \"choices\": [\n            {\"message\": {\"role\": \"assistant\", \"content\": f\"Echo: {prompt}\"}}\n        ]\n    }\n\n# Call mock_chat_completion and print the content below\n",
        "expectedOutput": "Echo: What is 2+2?",
        "hints": [
          "response = mock_chat_completion(\"What is 2+2?\")",
          "The text is nested: response['choices'][0]['message']['content']",
          "print(response['choices'][0]['message']['content'])"
        ],
        "solution": "def mock_chat_completion(prompt):\n    return {\n        \"model\": \"gpt-4\",\n        \"choices\": [\n            {\"message\": {\"role\": \"assistant\", \"content\": f\"Echo: {prompt}\"}}\n        ]\n    }\n\nresponse = mock_chat_completion(\"What is 2+2?\")\nprint(response[\"choices\"][0][\"message\"][\"content\"])"
      }
    }
  },
  {
    "id": 29,
    "title": "AI Agents",
    "content": {
      "why": "An AI agent's core loop is: look at the input, decide which tool fits, call it. Storing tools as a dict of name -> function is exactly how real agent frameworks register and dispatch tools.",
      "typescriptExample": "const tools = {\n  search: (q) => `search results for ${q}`,\n  calculator: (q) => `calculated: ${q}`\n};\n\nfunction routeToTool(input) {\n  if (input.includes(\"calculate\")) return \"calculator\";\n  return \"search\";\n}\n\nconst toolName = routeToTool(\"calculate 2+2\");\nconsole.log(tools[toolName](\"2+2\"));",
      "pythonExample": "def search_tool(query):\n    return f\"search results for {query}\"\n\ndef calculator_tool(query):\n    return f\"calculated: {query}\"\n\ntools = {\n    \"search\": search_tool,\n    \"calculator\": calculator_tool\n}\n\ndef route_to_tool(user_input):\n    if \"calculate\" in user_input:\n        return \"calculator\"\n    return \"search\"\n\ntool_name = route_to_tool(\"calculate 2+2\")\nprint(tools[tool_name](\"2+2\"))",
      "explanation": "Functions are values in Python, so they can be stored in a dict and looked up by name just like any other data - tools[\"calculator\"] retrieves the function itself, which you then call. This dict-of-functions pattern is exactly how real agent frameworks register and dispatch tools.",
      "exercise": {
        "instructions": "Using tools and route_to_tool below, call route_to_tool(\"search for python tutorials\") to get a tool name, then call that tool with \"python tutorials\" and print the result.",
        "starterCode": "def search_tool(query):\n    return f\"search results for {query}\"\n\ndef calculator_tool(query):\n    return f\"calculated: {query}\"\n\ntools = {\n    \"search\": search_tool,\n    \"calculator\": calculator_tool\n}\n\ndef route_to_tool(user_input):\n    if \"calculate\" in user_input:\n        return \"calculator\"\n    return \"search\"\n\n# Route and call the tool below\n",
        "expectedOutput": "search results for python tutorials",
        "hints": [
          "tool_name = route_to_tool(\"search for python tutorials\")",
          "Look up the function in the dict: tools[tool_name]",
          "print(tools[tool_name](\"python tutorials\"))"
        ],
        "solution": "def search_tool(query):\n    return f\"search results for {query}\"\n\ndef calculator_tool(query):\n    return f\"calculated: {query}\"\n\ntools = {\n    \"search\": search_tool,\n    \"calculator\": calculator_tool\n}\n\ndef route_to_tool(user_input):\n    if \"calculate\" in user_input:\n        return \"calculator\"\n    return \"search\"\n\ntool_name = route_to_tool(\"search for python tutorials\")\nprint(tools[tool_name](\"python tutorials\"))"
      }
    }
  },
  {
    "id": 30,
    "title": "DeepEval",
    "content": {
      "why": "DeepEval is the standard framework for evaluating LLM outputs - metrics like answer relevancy, faithfulness and hallucination all follow the same shape: compute a score, compare it to a threshold, decide pass or fail.",
      "typescriptExample": "// DeepEval is Python-only; the closest TS equivalent is a hand-rolled check:\nfunction answerRelevancy(answer, question) {\n  const keywords = question.toLowerCase().split(\" \");\n  const hits = keywords.filter(k => answer.toLowerCase().includes(k));\n  return hits.length / keywords.length;\n}",
      "pythonExample": "# Real code:\n# from deepeval.metrics import AnswerRelevancyMetric\n# from deepeval.test_case import LLMTestCase\n#\n# metric = AnswerRelevancyMetric(threshold=0.7)\n# test_case = LLMTestCase(input=question, actual_output=answer)\n# metric.measure(test_case)\n\n# This sandbox can't install the real deepeval package (it needs network\n# access to call a judge LLM), so here's a simplified stand-in metric.\n\ndef answer_relevancy_score(answer, question):\n    keywords = question.lower().split()\n    hits = [k for k in keywords if k in answer.lower()]\n    return len(hits) / len(keywords)\n\nquestion = \"What is the capital of France?\"\nanswer = \"The capital of France is Paris.\"\n\nscore = answer_relevancy_score(answer, question)\npassed = score >= 0.7\nprint(f\"score={score:.2f} passed={passed}\")",
      "explanation": "DeepEval's real metrics (AnswerRelevancyMetric, FaithfulnessMetric, etc.) use an LLM to judge the answer and return a score plus a pass/fail against a threshold - the pattern above (compute a score, compare to a threshold, decide passed) is exactly that, just with a simplified keyword-overlap heuristic standing in for the real judge model.",
      "prediction": {
        "code": "def answer_relevancy_score(answer, question):\n    keywords = question.lower().split()\n    hits = [k for k in keywords if k in answer.lower()]\n    return len(hits) / len(keywords)\n\nscore = answer_relevancy_score(\"Paris is lovely in spring.\", \"What is the capital?\")\nprint(round(score, 2))",
        "answer": "0.25"
      },
      "exercise": {
        "instructions": "Using answer_relevancy_score below, compute the score for question = \"What is DeepEval?\" and answer = \"DeepEval is a framework for evaluating LLM outputs.\", then print whether it passed a 0.5 threshold as \"score=<2 decimals> passed=<bool>\".",
        "starterCode": "def answer_relevancy_score(answer, question):\n    keywords = question.lower().split()\n    hits = [k for k in keywords if k in answer.lower()]\n    return len(hits) / len(keywords)\n\nquestion = \"What is DeepEval?\"\nanswer = \"DeepEval is a framework for evaluating LLM outputs.\"\n\n# Compute the score, compare to 0.5, and print below\n",
        "expectedOutput": "score=0.33 passed=False",
        "hints": [
          "score = answer_relevancy_score(answer, question)",
          "passed = score >= 0.5",
          "print(f\"score={score:.2f} passed={passed}\")"
        ],
        "solution": "def answer_relevancy_score(answer, question):\n    keywords = question.lower().split()\n    hits = [k for k in keywords if k in answer.lower()]\n    return len(hits) / len(keywords)\n\nquestion = \"What is DeepEval?\"\nanswer = \"DeepEval is a framework for evaluating LLM outputs.\"\n\nscore = answer_relevancy_score(answer, question)\npassed = score >= 0.5\nprint(f\"score={score:.2f} passed={passed}\")"
      }
    }
  },
  {
    "id": 31,
    "title": "Agent Evaluation",
    "content": {
      "why": "Evaluating an agent isn't just checking the final answer - it's checking whether it took the right sequence of steps along the way (did it call the right tool at each point?).",
      "typescriptExample": "function scoreTrajectory(actualSteps, expectedSteps) {\n  let matches = 0;\n  for (let i = 0; i < expectedSteps.length; i++) {\n    if (actualSteps[i] && actualSteps[i].tool === expectedSteps[i].tool) {\n      matches++;\n    }\n  }\n  return matches / expectedSteps.length;\n}",
      "pythonExample": "def score_trajectory(actual_steps, expected_steps):\n    matches = 0\n    for actual, expected in zip(actual_steps, expected_steps):\n        if actual[\"tool\"] == expected[\"tool\"]:\n            matches += 1\n    return matches / len(expected_steps)\n\nexpected_steps = [{\"tool\": \"search\"}, {\"tool\": \"calculator\"}, {\"tool\": \"respond\"}]\nactual_steps = [{\"tool\": \"search\"}, {\"tool\": \"search\"}, {\"tool\": \"respond\"}]\n\nscore = score_trajectory(actual_steps, expected_steps)\nprint(f\"{score:.2f}\")",
      "explanation": "zip(actual_steps, expected_steps) pairs the two lists up position-by-position so you can compare step-by-step - the same idea as comparing two arrays index-by-index in TS, but without manually tracking an index.",
      "exercise": {
        "instructions": "Using score_trajectory below, compute the score for expected_steps = [{\"tool\": \"search\"}, {\"tool\": \"calculator\"}] vs actual_steps = [{\"tool\": \"search\"}, {\"tool\": \"search\"}] and print it formatted to 2 decimal places.",
        "starterCode": "def score_trajectory(actual_steps, expected_steps):\n    matches = 0\n    for actual, expected in zip(actual_steps, expected_steps):\n        if actual[\"tool\"] == expected[\"tool\"]:\n            matches += 1\n    return matches / len(expected_steps)\n\nexpected_steps = [{\"tool\": \"search\"}, {\"tool\": \"calculator\"}]\nactual_steps = [{\"tool\": \"search\"}, {\"tool\": \"search\"}]\n\n# Compute and print the score below\n",
        "expectedOutput": "0.50",
        "hints": [
          "score = score_trajectory(actual_steps, expected_steps)",
          "Use an f-string with :.2f to format to 2 decimal places.",
          "print(f\"{score:.2f}\")"
        ],
        "solution": "def score_trajectory(actual_steps, expected_steps):\n    matches = 0\n    for actual, expected in zip(actual_steps, expected_steps):\n        if actual[\"tool\"] == expected[\"tool\"]:\n            matches += 1\n    return matches / len(expected_steps)\n\nexpected_steps = [{\"tool\": \"search\"}, {\"tool\": \"calculator\"}]\nactual_steps = [{\"tool\": \"search\"}, {\"tool\": \"search\"}]\n\nscore = score_trajectory(actual_steps, expected_steps)\nprint(f\"{score:.2f}\")"
      }
    }
  },
  {
    "id": 32,
    "title": "Evaluation Datasets",
    "content": {
      "why": "An evaluation dataset is a fixed list of question/expected-answer pairs - a \"golden set\" - that you run your LLM or agent against every time you make a change, the same role a table of test fixtures plays for traditional QA.",
      "typescriptExample": "const dataset = [\n  { question: \"2+2\", expected: \"4\", actual: \"4\" },\n  { question: \"capital of France\", expected: \"Paris\", actual: \"Paris\" },\n  { question: \"3+3\", expected: \"6\", actual: \"5\" }\n];\n\nconst passRate = dataset.filter(d => d.actual === d.expected).length / dataset.length;\nconsole.log(passRate);",
      "pythonExample": "dataset = [\n    {\"question\": \"2+2\", \"expected\": \"4\", \"actual\": \"4\"},\n    {\"question\": \"capital of France\", \"expected\": \"Paris\", \"actual\": \"Paris\"},\n    {\"question\": \"3+3\", \"expected\": \"6\", \"actual\": \"5\"}\n]\n\npassed = [d for d in dataset if d[\"actual\"] == d[\"expected\"]]\npass_rate = len(passed) / len(dataset)\nprint(f\"{pass_rate:.2f}\")",
      "explanation": "Combining a list comprehension with len() is the standard way to compute a pass rate across a whole evaluation dataset - the same \"golden set\" idea as a table of test fixtures, just applied to LLM or agent outputs instead of UI test steps.",
      "exercise": {
        "instructions": "Using dataset below, compute and print the pass rate (passed count / total count) formatted to 2 decimal places.",
        "starterCode": "dataset = [\n    {\"question\": \"2+2\", \"expected\": \"4\", \"actual\": \"4\"},\n    {\"question\": \"capital of France\", \"expected\": \"Paris\", \"actual\": \"Paris\"},\n    {\"question\": \"3+3\", \"expected\": \"6\", \"actual\": \"5\"},\n    {\"question\": \"5-2\", \"expected\": \"3\", \"actual\": \"3\"}\n]\n\n# Compute and print the pass rate below\n",
        "expectedOutput": "0.75",
        "hints": [
          "Build a list of items where actual == expected, e.g. with a list comprehension.",
          "pass_rate = len(passed) / len(dataset)",
          "print(f\"{pass_rate:.2f}\")"
        ],
        "solution": "dataset = [\n    {\"question\": \"2+2\", \"expected\": \"4\", \"actual\": \"4\"},\n    {\"question\": \"capital of France\", \"expected\": \"Paris\", \"actual\": \"Paris\"},\n    {\"question\": \"3+3\", \"expected\": \"6\", \"actual\": \"5\"},\n    {\"question\": \"5-2\", \"expected\": \"3\", \"actual\": \"3\"}\n]\n\npassed = [d for d in dataset if d[\"actual\"] == d[\"expected\"]]\npass_rate = len(passed) / len(dataset)\nprint(f\"{pass_rate:.2f}\")"
      }
    }
  },
  {
    "id": 33,
    "title": "CI/CD",
    "content": {
      "why": "Running your AI QA test suite automatically on every push or pull request, instead of relying on someone remembering to run it locally, is what turns a test suite into a real safety net.",
      "typescriptExample": "// .github/workflows/test.yml\n// name: CI\n// on: [push]\n// jobs:\n//   test:\n//     steps:\n//       - run: npm install\n//       - run: npm test",
      "pythonExample": "# .github/workflows/test.yml\n# name: CI\n# on: [push]\n# jobs:\n#   test:\n#     steps:\n#       - run: pip install -r requirements.txt\n#       - run: pytest\n#       - run: deepeval test run test_llm_outputs.py\n\nrequired_steps = [\"install\", \"test\"]\n\ndef validate_pipeline(steps):\n    missing = [s for s in required_steps if s not in steps]\n    return \"valid\" if not missing else f\"missing: {', '.join(missing)}\"\n\npipeline_steps = [\"install\", \"lint\", \"test\", \"deploy\"]\nprint(validate_pipeline(pipeline_steps))",
      "explanation": "A CI/CD pipeline (GitHub Actions, GitLab CI, etc.) is just a config file describing steps to run on every push - install dependencies, then run pytest (and deepeval test run for LLM evaluations). validate_pipeline above mirrors how a real CI config gets checked: making sure required steps are present before anything runs.",
      "exercise": {
        "instructions": "Using validate_pipeline and required_steps below, call validate_pipeline with pipeline_steps = [\"lint\", \"test\"] (missing \"install\") and print the result.",
        "starterCode": "required_steps = [\"install\", \"test\"]\n\ndef validate_pipeline(steps):\n    missing = [s for s in required_steps if s not in steps]\n    return \"valid\" if not missing else f\"missing: {', '.join(missing)}\"\n\n# Call validate_pipeline and print below\n",
        "expectedOutput": "missing: install",
        "hints": [
          "pipeline_steps = [\"lint\", \"test\"]",
          "result = validate_pipeline(pipeline_steps)",
          "print(validate_pipeline([\"lint\", \"test\"]))"
        ],
        "solution": "required_steps = [\"install\", \"test\"]\n\ndef validate_pipeline(steps):\n    missing = [s for s in required_steps if s not in steps]\n    return \"valid\" if not missing else f\"missing: {', '.join(missing)}\"\n\npipeline_steps = [\"lint\", \"test\"]\nprint(validate_pipeline(pipeline_steps))"
      }
    }
  }
]
```

End of lesson JSON. Remember: produce the full Android project, the bundled `lessons.json` asset
derived verbatim from the array above, and a debug APK (or complete, exact build instructions if
you cannot build it yourself in your environment).
