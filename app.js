// App state, persistence, Pyodide integration and rendering.

const STORAGE_KEY = "pythonAIQAProgress";
const TOTAL_LESSONS = LESSONS.length;

let pyodide = null;
let pyodideReady = false;

let progress = loadProgress();

function defaultProgress() {
  return {
    currentLesson: 1,
    completed: [],
    skipped: [],
    solutionsRevealed: [],
    code: {}
  };
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultProgress(), parsed);
  } catch (e) {
    return defaultProgress();
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// ---------- Pyodide ----------

async function initPyodide() {
  pyodide = await loadPyodide();
  pyodideReady = true;
  document.getElementById("pyodide-loading").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
}

async function runPython(code) {
  if (!pyodideReady) {
    return { success: false, output: "", error: "Python is still loading. Please wait." };
  }
  try {
    await pyodide.runPythonAsync(
      "import sys, io\nsys.stdout = io.StringIO()\nsys.stderr = sys.stdout\n"
    );
    await pyodide.runPythonAsync(code);
    const output = await pyodide.runPythonAsync("sys.stdout.getvalue()");
    return { success: true, output };
  } catch (e) {
    return { success: false, output: "", error: formatPyError(e) };
  } finally {
    await pyodide.runPythonAsync(
      "sys.stdout = sys.__stdout__\nsys.stderr = sys.__stderr__\n"
    );
  }
}

function formatPyError(e) {
  const msg = e && e.message ? e.message : String(e);
  const lines = msg.trim().split("\n");
  // Pyodide errors are full Python tracebacks; the last non-empty line has the useful part.
  const last = lines.filter(Boolean).pop() || msg;
  return last;
}

function friendlyHint(code) {
  if (/console\.log/.test(code)) {
    return "Python uses print() instead of console.log()";
  }
  if (/\bconst\b|\blet\b/.test(code)) {
    return "Python doesn't use const/let - just write: name = value";
  }
  return null;
}

// ---------- Helpers ----------

function normalizeOutput(text) {
  return text
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .trim();
}

function canProceed(lesson) {
  const id = lesson.id;
  if (!lesson.content) return true;
  if (!lesson.content.exercise) return true;
  return (
    progress.completed.includes(id) ||
    progress.skipped.includes(id) ||
    progress.solutionsRevealed.includes(id)
  );
}

function computeProgressPercent() {
  const done = new Set([...progress.completed, ...progress.skipped]);
  return Math.round((done.size / TOTAL_LESSONS) * 100);
}

// ---------- Sidebar rendering ----------

function renderSidebar() {
  const list = document.getElementById("lesson-list");
  list.innerHTML = "";

  LESSONS.forEach((lesson) => {
    const li = document.createElement("li");
    li.className = "lesson-item" + (lesson.id === progress.currentLesson ? " current" : "");
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    if (lesson.id === progress.currentLesson) li.setAttribute("aria-current", "step");
    li.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goToLesson(lesson.id);
      }
    });

    let mark = "";
    if (progress.completed.includes(lesson.id)) mark = "\u2713";
    else if (lesson.id === progress.currentLesson) mark = "\u2192";

    const markSpan = document.createElement("span");
    markSpan.className = "mark";
    markSpan.textContent = mark;

    const titleSpan = document.createElement("span");
    titleSpan.textContent = lesson.title;

    li.appendChild(markSpan);
    li.appendChild(titleSpan);

    if (progress.skipped.includes(lesson.id) && !progress.completed.includes(lesson.id)) {
      const skipSpan = document.createElement("span");
      skipSpan.className = "skip-tag";
      skipSpan.textContent = "Skipped";
      li.appendChild(skipSpan);
    }

    li.addEventListener("click", () => goToLesson(lesson.id));
    list.appendChild(li);
  });

  const percent = computeProgressPercent();
  document.getElementById("progress-percent").textContent = percent + "%";
  document.getElementById("progress-bar-fill").style.width = percent + "%";
  document.getElementById("mobile-lesson-status").textContent =
    `Lesson ${progress.currentLesson} of ${TOTAL_LESSONS} · ${percent}% complete`;
}

// ---------- Lesson rendering ----------

function goToLesson(id) {
  progress.currentLesson = id;
  saveProgress();
  renderAll();
  setLessonMenu(false);
  window.scrollTo({ top: 0, behavior: "instant" });
}

function renderAll() {
  renderSidebar();
  renderLesson(progress.currentLesson);
  updateNavButtons();
}

function renderLesson(id) {
  const lesson = LESSONS.find((l) => l.id === id);
  const container = document.getElementById("lesson-container");
  container.innerHTML = "";

  if (!lesson.content) {
    container.innerHTML = `
      <h2>${lesson.title}</h2>
      <p class="coming-soon">Coming Soon - this lesson isn't built yet.</p>
    `;
    return;
  }

  const c = lesson.content;
  const savedCode = progress.code[id] !== undefined ? progress.code[id] : (c.exercise ? c.exercise.starterCode : "");

  container.innerHTML = `
    <h2>${lesson.title}</h2>

    <h3>Why You Need This</h3>
    <div class="card">${escapeHtml(c.why)}</div>

    <h3>TypeScript vs Python</h3>
    <div class="compare-grid">
      <div class="compare-col">
        <h4>TypeScript</h4>
        <pre>${escapeHtml(c.typescriptExample)}</pre>
      </div>
      <div class="compare-col">
        <h4>Python</h4>
        <pre>${escapeHtml(c.pythonExample)}</pre>
      </div>
    </div>
    <div class="card section" style="margin-top:12px;">${escapeHtml(c.explanation)}</div>

    <h3>Try It</h3>
    <div class="card">
      <pre id="example-code">${escapeHtml(c.pythonExample)}</pre>
      <div class="btn-row">
        <button id="run-example-btn" class="btn btn-primary">Run Example</button>
      </div>
      <div class="output-label">Output</div>
      <div id="example-output" class="output-box"></div>
    </div>

    ${c.prediction ? `
    <h3>What Do You Think This Prints?</h3>
    <div class="card">
      <pre>${escapeHtml(c.prediction.code)}</pre>
      <div class="btn-row">
        <button id="show-answer-btn" class="btn">Show Answer</button>
      </div>
      <div id="prediction-answer" class="output-box hidden"></div>
    </div>
    ` : ""}

    ${c.exercise ? `
    <h3>Task</h3>
    <div class="card">
      <div class="section">${escapeHtml(c.exercise.instructions)}</div>
      <label class="editor-label" for="code-editor">Your Python code</label>
      <textarea id="code-editor" class="code-editor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off">${escapeHtml(savedCode)}</textarea>
      <div id="editor-tools" class="editor-tools" role="group" aria-label="Code editing shortcuts">
        <button type="button" class="btn" data-insert="    " aria-label="Insert four spaces">Indent</button>
        <button type="button" class="btn" data-insert="(" aria-label="Insert opening parenthesis">(</button>
        <button type="button" class="btn" data-insert=")" aria-label="Insert closing parenthesis">)</button>
        <button type="button" class="btn" data-insert=":" aria-label="Insert colon">:</button>
        <button type="button" class="btn" data-insert="&quot;" aria-label="Insert double quote">&quot;</button>
        <button type="button" class="btn" data-insert="=" aria-label="Insert equals sign">=</button>
      </div>
      <div class="btn-row">
        <button id="run-code-btn" class="btn btn-primary">Run Code</button>
        <button id="check-answer-btn" class="btn">Check Answer</button>
        <button id="show-hint-btn" class="btn">Show Hint</button>
        <button id="show-solution-btn" class="btn">Show Solution</button>
        <button id="reset-code-btn" class="btn">Reset Code</button>
        <button id="skip-exercise-btn" class="btn btn-danger">Skip Assignment</button>
      </div>
      <div class="output-label">Output</div>
      <div id="exercise-output" class="output-box"></div>
      <div id="result-banner"></div>
      <div id="hint-box" class="hint-box"></div>
      <pre id="solution-box" class="hidden" style="margin-top:10px;"></pre>
    </div>
    ` : `
    <div class="btn-row">
      <button id="mark-complete-btn" class="btn btn-primary">Mark Lesson Complete</button>
    </div>
    `}
  `;

  wireLessonEvents(lesson);
}

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---------- Event wiring per lesson ----------

let hintState = { lessonId: null, shown: 0 };

function wireLessonEvents(lesson) {
  const c = lesson.content;

  const runExampleBtn = document.getElementById("run-example-btn");
  if (runExampleBtn) {
    runExampleBtn.addEventListener("click", async () => {
      const outEl = document.getElementById("example-output");
      outEl.textContent = "Running...";
      outEl.classList.remove("error");
      const result = await runPython(c.pythonExample);
      renderOutput(outEl, result);
    });
  }

  const showAnswerBtn = document.getElementById("show-answer-btn");
  if (showAnswerBtn) {
    showAnswerBtn.addEventListener("click", () => {
      const el = document.getElementById("prediction-answer");
      el.textContent = c.prediction.answer;
      el.classList.remove("hidden");
    });
  }

  if (c.exercise) {
    const editor = document.getElementById("code-editor");
    function insertCode(text) {
      editor.setRangeText(text, editor.selectionStart, editor.selectionEnd, "end");
      editor.focus({ preventScroll: true });
      editor.dispatchEvent(new Event("input", { bubbles: true }));
    }
    document.getElementById("editor-tools").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-insert]");
      if (button) insertCode(button.dataset.insert);
    });
    editor.addEventListener("keydown", (event) => {
      if (event.key === "Tab" && !event.shiftKey) {
        event.preventDefault();
        insertCode("    ");
      }
    });
    editor.addEventListener("input", () => {
      progress.code[lesson.id] = editor.value;
      saveProgress();
    });

    if (hintState.lessonId !== lesson.id) {
      hintState = { lessonId: lesson.id, shown: 0 };
    }

    document.getElementById("run-code-btn").addEventListener("click", async () => {
      const outEl = document.getElementById("exercise-output");
      outEl.textContent = "Running...";
      outEl.classList.remove("error");
      const result = await runPython(editor.value);
      renderOutput(outEl, result, editor.value);
    });

    document.getElementById("check-answer-btn").addEventListener("click", async () => {
      const outEl = document.getElementById("exercise-output");
      const bannerEl = document.getElementById("result-banner");
      outEl.textContent = "Running...";
      outEl.classList.remove("error");
      const result = await runPython(editor.value);
      renderOutput(outEl, result, editor.value);

      if (!result.success) {
        bannerEl.innerHTML = `<div class="result-banner incorrect">Not quite - your code raised an error. Fix it and try again.</div>`;
        return;
      }

      const got = normalizeOutput(result.output);
      const expected = normalizeOutput(c.exercise.expectedOutput);

      if (got === expected) {
        if (!progress.completed.includes(lesson.id)) {
          progress.completed.push(lesson.id);
        }
        saveProgress();
        bannerEl.innerHTML = `<div class="result-banner correct">&#10003; Correct! Nice work. You can continue.</div>`;
        renderSidebar();
        updateNavButtons();
      } else {
        bannerEl.innerHTML = `
          <div class="result-banner incorrect">
            Not quite.<br>
            Expected output:<br>${escapeHtml(c.exercise.expectedOutput)}<br><br>
            Your output:<br>${escapeHtml(result.output || "(nothing printed)")}
          </div>
        `;
      }
    });

    document.getElementById("show-hint-btn").addEventListener("click", () => {
      const hintBox = document.getElementById("hint-box");
      const hints = c.exercise.hints || [];
      if (hintState.shown < hints.length) {
        const div = document.createElement("div");
        div.textContent = `Hint ${hintState.shown + 1}: ${hints[hintState.shown]}`;
        hintBox.appendChild(div);
        hintState.shown += 1;
      }
    });

    document.getElementById("show-solution-btn").addEventListener("click", () => {
      const reveal = confirm("Reveal solution?");
      if (!reveal) return;
      if (!progress.solutionsRevealed.includes(lesson.id)) {
        progress.solutionsRevealed.push(lesson.id);
        saveProgress();
      }
      const box = document.getElementById("solution-box");
      box.textContent = c.exercise.solution;
      box.classList.remove("hidden");
      updateNavButtons();
      renderSidebar();
    });

    document.getElementById("reset-code-btn").addEventListener("click", () => {
      editor.value = c.exercise.starterCode;
      progress.code[lesson.id] = editor.value;
      saveProgress();
      document.getElementById("exercise-output").textContent = "";
      document.getElementById("result-banner").innerHTML = "";
    });

    document.getElementById("skip-exercise-btn").addEventListener("click", () => {
      if (!progress.skipped.includes(lesson.id)) {
        progress.skipped.push(lesson.id);
        saveProgress();
      }
      renderSidebar();
      updateNavButtons();
      document.getElementById("result-banner").innerHTML =
        `<div class="result-banner incorrect">Skipped. You can move on whenever you're ready.</div>`;
    });
  } else {
    const markBtn = document.getElementById("mark-complete-btn");
    if (markBtn) {
      markBtn.addEventListener("click", () => {
        if (!progress.completed.includes(lesson.id)) {
          progress.completed.push(lesson.id);
        }
        saveProgress();
        renderSidebar();
        updateNavButtons();
      });
    }
  }
}

function renderOutput(outEl, result, sourceCode) {
  if (result.success) {
    outEl.classList.remove("error");
    outEl.textContent = result.output || "(no output)";
  } else {
    outEl.classList.add("error");
    let text = result.error;
    const hint = sourceCode ? friendlyHint(sourceCode) : null;
    if (hint) text += `\n\nHint: ${hint}`;
    outEl.textContent = text;
  }
}

// ---------- Navigation ----------

function updateNavButtons() {
  const lesson = LESSONS.find((l) => l.id === progress.currentLesson);
  document.getElementById("prev-lesson-btn").disabled = lesson.id <= 1;
  document.getElementById("next-lesson-btn").disabled =
    lesson.id >= TOTAL_LESSONS || !canProceed(lesson);
}

function goPrev() {
  if (progress.currentLesson > 1) {
    goToLesson(progress.currentLesson - 1);
  }
}

function goNext() {
  const lesson = LESSONS.find((l) => l.id === progress.currentLesson);
  if (lesson.id < TOTAL_LESSONS && canProceed(lesson)) {
    goToLesson(progress.currentLesson + 1);
  }
}

function resetProgressHandler() {
  const ok = confirm("Reset all learning progress? This cannot be undone.");
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  progress = defaultProgress();
  renderAll();
}

// ---------- Init ----------

function setLessonMenu(open) {
  document.getElementById("lesson-sidebar").classList.toggle("menu-open", open);
  const button = document.getElementById("lesson-menu-btn");
  button.setAttribute("aria-expanded", String(open));
  button.textContent = open ? "Close lessons" : "Lessons";
}

document.getElementById("lesson-menu-btn").addEventListener("click", () => {
  setLessonMenu(document.getElementById("lesson-menu-btn").getAttribute("aria-expanded") !== "true");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.getElementById("lesson-menu-btn").getAttribute("aria-expanded") === "true") {
    setLessonMenu(false);
    document.getElementById("lesson-menu-btn").focus();
  }
});

document.getElementById("prev-lesson-btn").addEventListener("click", goPrev);
document.getElementById("next-lesson-btn").addEventListener("click", goNext);
document.getElementById("reset-progress-btn").addEventListener("click", resetProgressHandler);

(async function start() {
  await initPyodide();
  renderAll();
})();
