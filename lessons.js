// All lesson content lives here. app.js only renders what it finds in this array.
// All 33 lessons (Variables through CI/CD) are fully built.

const LESSON_TITLES = [
  "Variables and Data Types",
  "Lists",
  "Dictionaries",
  "Lists of Dictionaries",
  "Conditions",
  "Functions",
  "Type Hints",
  "Loops",
  "Strings",
  "JSON",
  "Files",
  "Exceptions",
  "Modules",
  "Virtual Environments",
  "pip",
  "Environment Variables",
  "Classes",
  "Dataclasses",
  "Pytest",
  "Assertions",
  "Parametrize",
  "Fixtures",
  "HTTP Requests",
  "API Error Handling",
  "List Comprehensions",
  "Async/Await",
  "AI Test Failure Analyzer",
  "LLM APIs",
  "AI Agents",
  "DeepEval",
  "Agent Evaluation",
  "Evaluation Datasets",
  "CI/CD"
];

const LESSON_CONTENT = {
  1: {
    why: "Every QA script, API test and LLM evaluation starts by storing values: a test name, a status, a response time, an expected answer. Variables are how you hold onto that data. DeepEval and agent frameworks pass results around as plain variables and dictionaries, so this is the foundation for everything else.",
    typescriptExample: `const testName = "Checkout Test";
const status = "failed";
const executionTime = 2.5;
const isFlaky = false;
const retryCount = null;

console.log(\`\${testName}: \${status} (\${executionTime}s)\`);`,
    pythonExample: `test_name = "Checkout Test"
status = "failed"
execution_time = 2.5
is_flaky = False
retry_count = None

print(f"{test_name}: {status} ({execution_time}s)")`,
    explanation: "Python has the same basic types as TypeScript: str (string), int, float (number), bool (True/False), and None (null/undefined). f-strings (f\"...\") work like template literals but use { } instead of ${ }.",
    prediction: {
      code: `name = "Login Test"
passed = True
score = 0.95

print(f"{name}: {passed} ({score})")`,
      answer: "Login Test: True (0.95)"
    },
    exercise: {
      instructions: "Create three variables: test_name = \"Checkout Test\", status = \"failed\", error = \"HTTP 500\". Print:\nCheckout Test -> failed -> HTTP 500",
      starterCode: `# Create your variables below
`,
      expectedOutput: "Checkout Test -> failed -> HTTP 500",
      hints: [
        "Create three variables first: test_name, status, error.",
        "Use an f-string like f\"{a} -> {b} -> {c}\".",
        "print(f\"{test_name} -> {status} -> {error}\")"
      ],
      solution: `test_name = "Checkout Test"
status = "failed"
error = "HTTP 500"

print(f"{test_name} -> {status} -> {error}")`
    }
  },

  2: {
    why: "Test suites, API responses and batches of LLM outputs almost always come back as lists. Looping over a list of test results to find failures, or over a list of agent steps, is one of the most common things you'll do in AI QA tooling.",
    typescriptExample: `const tests = ["Login Test", "Checkout Test", "Payment Test"];
tests.push("Refund Test");
console.log(tests.length);

for (const t of tests) {
  console.log(t);
}`,
    pythonExample: `tests = ["Login Test", "Checkout Test", "Payment Test"]
tests.append("Refund Test")
print(len(tests))

for t in tests:
    print(t)`,
    explanation: "Python lists are like JS arrays: [] to create, .append() instead of .push(), len() instead of .length, and index access with tests[0]. A plain 'for x in list' loop replaces 'for (const x of list)'.",
    exercise: {
      instructions: "Create a list containing: \"Login Test\", \"Checkout Test\", \"Payment Test\". Print each one on its own line.",
      starterCode: `# Create your list and loop over it below
`,
      expectedOutput: "Login Test\nCheckout Test\nPayment Test",
      hints: [
        "Create a list with square brackets: tests = [...].",
        "Loop with: for t in tests:",
        "print(t) inside the loop body (indented with 4 spaces)."
      ],
      solution: `tests = ["Login Test", "Checkout Test", "Payment Test"]

for t in tests:
    print(t)`
    }
  },

  3: {
    why: "API responses, LLM JSON output and DeepEval metric results are all dictionaries (key/value data) in Python. Reading a nested field like result[\"failure\"][\"message\"] is something you'll do constantly when parsing test or agent output.",
    typescriptExample: `const result = {
  test: "Checkout Test",
  status: "failed",
  failure: {
    type: "api",
    message: "HTTP 500"
  }
};

console.log(\`\${result.test} -> \${result.failure.message}\`);`,
    pythonExample: `result = {
    "test": "Checkout Test",
    "status": "failed",
    "failure": {
        "type": "api",
        "message": "HTTP 500"
    }
}

print(f"{result['test']} -> {result['failure']['message']}")`,
    explanation: "Python dictionaries are like JS objects, but you always use square brackets with string keys: result[\"test\"] instead of result.test. Nested dicts work just like nested objects. You can add or change a key with result[\"status\"] = \"passed\".",
    prediction: {
      code: `metric = {
    "name": "answer_relevancy",
    "score": 0.8,
    "passed": True
}

print(f"{metric['name']}: {metric['score']}")`,
      answer: "answer_relevancy: 0.8"
    },
    exercise: {
      instructions: "Using the result dictionary below, print:\nCheckout Test -> HTTP 500",
      starterCode: `result = {
    "test": "Checkout Test",
    "status": "failed",
    "failure": {
        "type": "api",
        "message": "HTTP 500"
    }
}

# Print using the dictionary above
`,
      expectedOutput: "Checkout Test -> HTTP 500",
      hints: [
        "Access nested values with result['failure']['message'].",
        "Combine both fields in one f-string.",
        "print(f\"{result['test']} -> {result['failure']['message']}\")"
      ],
      solution: `result = {
    "test": "Checkout Test",
    "status": "failed",
    "failure": {
        "type": "api",
        "message": "HTTP 500"
    }
}

print(f"{result['test']} -> {result['failure']['message']}")`
    }
  },

  4: {
    why: "A pytest run, a CI pipeline or a batch of agent evaluations all hand you back a list of dictionaries - one per test or one per case. Looping over that list is exactly how real test-failure triage tools and DeepEval result summaries work.",
    typescriptExample: `const failures = [
  { test: "Login", error: "Element not found" },
  { test: "Checkout", error: "HTTP 500" }
];

for (const f of failures) {
  console.log(\`\${f.test} -> \${f.error}\`);
}`,
    pythonExample: `failures = [
    {"test": "Login", "error": "Element not found"},
    {"test": "Checkout", "error": "HTTP 500"}
]

for f in failures:
    print(f"{f['test']} -> {f['error']}")`,
    explanation: "This combines the last two lessons: a list that contains dictionaries. You loop over the list, and on each iteration you get one dictionary to read from.",
    exercise: {
      instructions: "Using the failures list below, print each failure as:\nLogin -> Element not found\nCheckout -> HTTP 500",
      starterCode: `failures = [
    {"test": "Login", "error": "Element not found"},
    {"test": "Checkout", "error": "HTTP 500"}
]

# Loop and print below
`,
      expectedOutput: "Login -> Element not found\nCheckout -> HTTP 500",
      hints: [
        "Loop with: for f in failures:",
        "Each f is a dictionary - access f['test'] and f['error'].",
        "print(f\"{f['test']} -> {f['error']}\") inside the loop."
      ],
      solution: `failures = [
    {"test": "Login", "error": "Element not found"},
    {"test": "Checkout", "error": "HTTP 500"}
]

for f in failures:
    print(f"{f['test']} -> {f['error']}")`
    }
  },

  5: {
    why: "Classifying failures (backend vs automation vs unknown), deciding whether an LLM response passed a check, or routing an agent to the next step - all of this is conditions. AI test triage tools are mostly if/elif/else logic wrapped around smarter data.",
    typescriptExample: `const error = "HTTP 500 Internal Server Error";

if (error.includes("500") && !error.includes("element")) {
  console.log("backend");
} else if (error.toLowerCase().includes("element")) {
  console.log("automation");
} else {
  console.log("unknown");
}`,
    pythonExample: `error = "HTTP 500 Internal Server Error"

if "500" in error and "element" not in error:
    print("backend")
elif "element" in error.lower():
    print("automation")
else:
    print("unknown")`,
    explanation: "Python spells boolean operators out as words: 'and', 'or', 'not' instead of &&, ||, !. The 'in' keyword checks if a substring/item exists, replacing .includes(). There's no switch statement in basic Python - if/elif/else covers it.",
    prediction: {
      code: `a = True
b = False

if a and not b:
    print("yes")
else:
    print("no")`,
      answer: "yes"
    },
    exercise: {
      instructions: "Given error = \"HTTP 500 Internal Server Error\": print \"backend\" if error contains \"500\", print \"automation\" if it contains \"element\" (case-insensitive), otherwise print \"unknown\".",
      starterCode: `error = "HTTP 500 Internal Server Error"

# Write your if / elif / else below
`,
      expectedOutput: "backend",
      hints: [
        "Use if / elif / else, same shape as TypeScript's if/else if/else.",
        "Check substrings with the `in` operator: \"500\" in error",
        "print(\"backend\") inside the matching branch."
      ],
      solution: `error = "HTTP 500 Internal Server Error"

if "500" in error:
    print("backend")
elif "element" in error.lower():
    print("automation")
else:
    print("unknown")`
    }
  },

  6: {
    why: "Functions are how you turn one-off classification logic into something reusable across a whole test suite - like a classify_failure() helper used by every test, or a tool function called by an AI agent.",
    typescriptExample: `function classifyFailure(error: string) {
  if (error.includes("500")) {
    return "backend";
  }
  return "unknown";
}

console.log(classifyFailure("POST /orders returned HTTP 500"));`,
    pythonExample: `def classify_failure(error):
    if "500" in error:
        return "backend"
    return "unknown"

print(classify_failure("POST /orders returned HTTP 500"))`,
    explanation: "Python uses 'def' instead of 'function'. There are no curly braces - indentation defines the function body. 'return' works the same way. Default arguments look like def f(x, retries=3): just like TS default parameters.",
    exercise: {
      instructions: "Create a function classify_failure(error) that returns \"backend\" if error contains \"500\", otherwise \"unknown\". Call it with \"POST /orders returned HTTP 500\" and print the result.",
      starterCode: `# Define classify_failure below

`,
      expectedOutput: "backend",
      hints: [
        "Define with: def classify_failure(error):",
        "Use the same if/return pattern as the conditions lesson.",
        "print(classify_failure(\"POST /orders returned HTTP 500\"))"
      ],
      solution: `def classify_failure(error):
    if "500" in error:
        return "backend"
    return "unknown"

print(classify_failure("POST /orders returned HTTP 500"))`
    }
  },

  7: {
    why: "Type hints make Python functions self-documenting, closer to TypeScript, and much easier to maintain in larger QA frameworks, DeepEval custom metrics, or agent tool definitions where the function signature needs to be clear at a glance.",
    typescriptExample: `function classifyFailure(error: string): string {
  if (error.includes("500")) {
    return "backend";
  }
  return "unknown";
}`,
    pythonExample: `def classify_failure(error: str) -> str:
    if "500" in error:
        return "backend"
    return "unknown"`,
    explanation: "Parameter hints go after a colon: error: str. The return type hint goes after '->' before the final colon. Python does not enforce these at runtime (unlike TS at compile time) - they're documentation and editor/tooling support, but still very useful.",
    exercise: {
      instructions: "Rewrite classify_failure(error) with type hints: the parameter should be typed str and the return type should be str. Keep the same behavior, call it with \"POST /orders returned HTTP 500\" and print the result.",
      starterCode: `# Define classify_failure with type hints below

`,
      expectedOutput: "backend",
      hints: [
        "Add `: str` after the parameter name.",
        "Add `-> str` before the final colon of the def line.",
        "def classify_failure(error: str) -> str:"
      ],
      solution: `def classify_failure(error: str) -> str:
    if "500" in error:
        return "backend"
    return "unknown"

print(classify_failure("POST /orders returned HTTP 500"))`
    }
  },

  8: {
    why: "Retrying a flaky request, polling an agent until it finishes, or checking every item in a test run all come down to looping. It's one of the most-used constructs in any QA script.",
    typescriptExample: `const scores = [0.9, 0.4, 0.75, 0.2];

for (const s of scores) {
  console.log(s >= 0.5 ? "pass" : "fail");
}

let i = 0;
while (i < 3) {
  console.log(i);
  i++;
}`,
    pythonExample: `scores = [0.9, 0.4, 0.75, 0.2]

for s in scores:
    print("pass" if s >= 0.5 else "fail")

i = 0
while i < 3:
    print(i)
    i += 1`,
    explanation: "Python's for loop walks directly over items - no index needed. while loops look the same as TS but use i += 1 instead of i++ (which doesn't exist in Python). Use range(n) when you need a counting loop: for i in range(3):.",
    prediction: {
      code: `total = 0
for n in [1, 2, 3, 4]:
    total += n

print(total)`,
      answer: "10"
    },
    exercise: {
      instructions: "Given scores = [0.9, 0.4, 0.75, 0.2, 0.6], loop over them and print \"pass\" if a score is >= 0.5, otherwise print \"fail\", one per line.",
      starterCode: `scores = [0.9, 0.4, 0.75, 0.2, 0.6]

# Loop and print pass/fail below
`,
      expectedOutput: "pass\nfail\npass\nfail\npass",
      hints: [
        "Loop with: for s in scores:",
        "Use a conditional expression: \"pass\" if s >= 0.5 else \"fail\"",
        "print(\"pass\" if s >= 0.5 else \"fail\")"
      ],
      solution: `scores = [0.9, 0.4, 0.75, 0.2, 0.6]

for s in scores:
    print("pass" if s >= 0.5 else "fail")`
    }
  },

  9: {
    why: "Parsing LLM output, log lines and error messages is mostly string manipulation. Building a readable test report or extracting a field from a raw log line both start with string methods.",
    typescriptExample: `const line = "test=Login status=failed";
const parts = line.split(" ");
console.log(parts[0].split("=")[1]);
console.log(line.toUpperCase());
console.log(line.includes("failed"));`,
    pythonExample: `line = "test=Login status=failed"
parts = line.split(" ")
print(parts[0].split("=")[1])
print(line.upper())
print("failed" in line)`,
    explanation: "Python strings use .split(), .upper()/.lower(), .strip() (like .trim()), and the in operator instead of .includes(). f-strings handle most formatting needs; string methods return new strings since strings are immutable, just like in TS.",
    exercise: {
      instructions: "Given line = \"test=Checkout status=passed\", split it into two parts on the space, then split each part on \"=\" to get the test name and status. Print:\nCheckout -> passed",
      starterCode: `line = "test=Checkout status=passed"

# Parse and print below
`,
      expectedOutput: "Checkout -> passed",
      hints: [
        "Split on space first: parts = line.split(\" \")",
        "Each part has the shape key=value - split again on \"=\".",
        "print(f\"{parts[0].split('=')[1]} -> {parts[1].split('=')[1]}\")"
      ],
      solution: `line = "test=Checkout status=passed"
parts = line.split(" ")
test_name = parts[0].split("=")[1]
status = parts[1].split("=")[1]

print(f"{test_name} -> {status}")`
    }
  },

  10: {
    why: "API responses and LLM outputs almost always arrive as JSON text. DeepEval test cases, agent tool results and REST APIs all speak JSON, so parsing and producing it is a daily task.",
    typescriptExample: `const raw = '{"test": "Login", "passed": false, "score": 0.42}';
const data = JSON.parse(raw);
console.log(\`\${data.test}: \${data.passed} (\${data.score})\`);
console.log(JSON.stringify(data));`,
    pythonExample: `import json

raw = '{"test": "Login", "passed": false, "score": 0.42}'
data = json.loads(raw)
print(f"{data['test']}: {data['passed']} ({data['score']})")
print(json.dumps(data))`,
    explanation: "import json gives you json.loads() (parse a string into a dict/list) and json.dumps() (turn a dict/list back into a string) - the direct equivalents of JSON.parse and JSON.stringify. JSON's true/false/null become Python's True/False/None once parsed.",
    prediction: {
      code: `import json

raw = '{"name": "answer_relevancy", "passed": true}'
data = json.loads(raw)
print(data["passed"])`,
      answer: "True"
    },
    exercise: {
      instructions: "Parse the JSON string raw below and print:\nanswer_relevancy: 0.82",
      starterCode: `import json

raw = '{"metric": "answer_relevancy", "score": 0.82}'

# Parse and print below
`,
      expectedOutput: "answer_relevancy: 0.82",
      hints: [
        "Use json.loads(raw) to turn the string into a dictionary.",
        "Access fields with data['metric'] and data['score'].",
        "print(f\"{data['metric']}: {data['score']}\")"
      ],
      solution: `import json

raw = '{"metric": "answer_relevancy", "score": 0.82}'
data = json.loads(raw)

print(f"{data['metric']}: {data['score']}")`
    }
  },

  11: {
    why: "Writing a test report, reading a fixture file or saving evaluation results to disk are all file operations. Pyodide gives this sandbox a real in-browser filesystem, so the code here behaves exactly like it would on a real machine.",
    typescriptExample: `const fs = require("fs");

fs.writeFileSync("report.txt", "Login: passed\\nCheckout: failed\\n");
const content = fs.readFileSync("report.txt", "utf8");
console.log(content.trim());`,
    pythonExample: `with open("report.txt", "w") as f:
    f.write("Login: passed\\n")
    f.write("Checkout: failed\\n")

with open("report.txt", "r") as f:
    content = f.read()

print(content.strip())`,
    explanation: "Python's with open(path, mode) as f: is the standard way to work with files - it automatically closes the file when the block ends, similar to try/finally. \"w\" writes (overwriting), \"a\" appends, \"r\" reads.",
    exercise: {
      instructions: "Write the lines \"Login: passed\" and \"Checkout: failed\" to a file named results.txt (one per line), then read the file back and print its contents (trimmed).",
      starterCode: `# Write to results.txt, then read it back and print
`,
      expectedOutput: "Login: passed\nCheckout: failed",
      hints: [
        "Open for writing with: with open(\"results.txt\", \"w\") as f:",
        "Write each line with f.write(\"...\\\\n\").",
        "Reopen with \"r\", call f.read(), then print(content.strip())."
      ],
      solution: `with open("results.txt", "w") as f:
    f.write("Login: passed\\n")
    f.write("Checkout: failed\\n")

with open("results.txt", "r") as f:
    content = f.read()

print(content.strip())`
    }
  },

  12: {
    why: "LLM calls, HTTP requests and flaky environments all fail sometimes. Handling errors gracefully instead of letting the whole test runner crash is a core QA engineering skill.",
    typescriptExample: `function getScore(result) {
  try {
    if (!("score" in result)) {
      throw new Error("missing score");
    }
    return result.score;
  } catch (e) {
    console.log(\`error: \${e.message}\`);
    return null;
  } finally {
    console.log("done checking");
  }
}

console.log(getScore({}));`,
    pythonExample: `def get_score(result):
    try:
        if "score" not in result:
            raise ValueError("missing score")
        return result["score"]
    except ValueError as e:
        print(f"error: {e}")
        return None
    finally:
        print("done checking")

print(get_score({}))`,
    explanation: "Python uses try/except instead of try/catch, and raise instead of throw. You can catch specific exception types (like ValueError or ZeroDivisionError) rather than catching everything, which makes error handling more precise. finally still runs no matter what, exactly like TS.",
    exercise: {
      instructions: "Write a function safe_divide(a, b) that returns a / b, but catches ZeroDivisionError and returns None while printing \"error: division by zero\" in that case. Call safe_divide(10, 0) and print the result.",
      starterCode: `# Define safe_divide below

`,
      expectedOutput: "error: division by zero\nNone",
      hints: [
        "Wrap the division in try/except ZeroDivisionError:",
        "Print the error message inside the except block before returning None.",
        "def safe_divide(a, b):\\n    try: return a / b\\n    except ZeroDivisionError: ..."
      ],
      solution: `def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        print("error: division by zero")
        return None

print(safe_divide(10, 0))`
    }
  },

  13: {
    why: "Organizing test helpers, utilities and DeepEval custom metrics into reusable modules keeps a growing QA codebase manageable instead of one giant script.",
    typescriptExample: `// mathUtils.ts
export function average(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// main.ts
import { average } from "./mathUtils";
console.log(average([1, 2, 3]));`,
    pythonExample: `import statistics

scores = [0.9, 0.7, 0.8]
print(statistics.mean(scores))`,
    explanation: "Python's import module_name brings in a whole module (like import * as x), and from module_name import thing brings in just one name (like a named TS import). The standard library ships many ready-made modules - statistics, math, random, datetime - so you often don't need a third-party package at all.",
    exercise: {
      instructions: "Import the statistics module and use statistics.mean() to compute the average of scores = [0.9, 0.7, 0.8, 0.6]. Print the result.",
      starterCode: `import statistics

scores = [0.9, 0.7, 0.8, 0.6]

# Compute and print the mean below
`,
      expectedOutput: "0.75",
      hints: [
        "statistics.mean(scores) returns the average of a list of numbers.",
        "Pass the whole list directly: statistics.mean(scores)",
        "print(statistics.mean(scores))"
      ],
      solution: `import statistics

scores = [0.9, 0.7, 0.8, 0.6]
print(statistics.mean(scores))`
    }
  },

  14: {
    why: "Different QA projects often need different, conflicting versions of the same package. A virtual environment isolates one project's installed packages from another's, the same role a per-project node_modules plays in JS.",
    typescriptExample: `// package.json pins versions per project - each project gets its own
// node_modules, so version conflicts between projects can't happen.
const projectA = { pytest: "7.4.0" };
const projectB = { pytest: "8.0.0" };

console.log(projectA.pytest !== projectB.pytest ? "conflict" : "compatible");`,
    pythonExample: `# A virtual environment keeps one project's installed package versions
# from leaking into another project - created with:
#   python3 -m venv .venv
#   source .venv/bin/activate

project_a = {"pytest": "7.4.0"}
project_b = {"pytest": "8.0.0"}

print("conflict" if project_a["pytest"] != project_b["pytest"] else "compatible")`,
    explanation: "A virtual environment is a private, isolated copy of Python plus installed packages for one project. Without one, installing one project's dependencies can silently break another project's - exactly the problem per-project node_modules folders solve in JS.",
    exercise: {
      instructions: "Given project_a = {\"pytest\": \"7.4.0\"} and project_b = {\"pytest\": \"7.4.0\"}, print \"conflict\" if the pytest versions differ, otherwise print \"compatible\".",
      starterCode: `project_a = {"pytest": "7.4.0"}
project_b = {"pytest": "7.4.0"}

# Compare versions and print below
`,
      expectedOutput: "compatible",
      hints: [
        "Compare the two version strings with !=.",
        "Use a conditional expression, same shape as the Loops lesson.",
        "print(\"conflict\" if project_a['pytest'] != project_b['pytest'] else \"compatible\")"
      ],
      solution: `project_a = {"pytest": "7.4.0"}
project_b = {"pytest": "7.4.0"}

print("conflict" if project_a["pytest"] != project_b["pytest"] else "compatible")`
    }
  },

  15: {
    why: "Installing DeepEval, requests or pytest into a project all go through pip, Python's package installer. Knowing how dependencies are declared and installed is essential before you can use any third-party library.",
    typescriptExample: `// package.json
{
  "dependencies": {
    "jest": "^29.0.0",
    "axios": "^1.6.0"
  }
}
// npm install`,
    pythonExample: `# requirements.txt
#   deepeval==1.0.0
#   requests==2.31.0
#   pytest==7.4.0
#
# pip install -r requirements.txt

requirements = "deepeval==1.0.0\\nrequests==2.31.0\\npytest==7.4.0"

for line in requirements.splitlines():
    name, version = line.split("==")
    print(f"{name} -> {version}")`,
    explanation: "pip is Python's package installer (pip install <name> is the equivalent of npm install <name>). Projects list their dependencies in a requirements.txt file, often pinned with ==version, and pip install -r requirements.txt installs everything at once - similar to npm install reading package.json.",
    exercise: {
      instructions: "Given requirements = \"deepeval==1.0.0\\nrequests==2.31.0\", split it into lines, then split each line on \"==\" to print:\ndeepeval needs 1.0.0\nrequests needs 2.31.0",
      starterCode: `requirements = "deepeval==1.0.0\\nrequests==2.31.0"

# Parse and print below
`,
      expectedOutput: "deepeval needs 1.0.0\nrequests needs 2.31.0",
      hints: [
        "Split into lines with requirements.splitlines().",
        "Split each line on \"==\" to get the name and version.",
        "print(f\"{name} needs {version}\") inside the loop."
      ],
      solution: `requirements = "deepeval==1.0.0\\nrequests==2.31.0"

for line in requirements.splitlines():
    name, version = line.split("==")
    print(f"{name} needs {version}")`
    }
  },

  16: {
    why: "API keys for LLM providers, and settings that change between staging and production, should never be hard-coded into test scripts. Environment variables are the standard, secure way to configure QA tooling.",
    typescriptExample: `// .env (never commit this file)
// OPENAI_API_KEY=sk-...

const apiKey = process.env.OPENAI_API_KEY ?? "not set";
console.log(apiKey);`,
    pythonExample: `import os

os.environ["OPENAI_API_KEY"] = "sk-demo-123"  # normally set outside your code

api_key = os.environ.get("OPENAI_API_KEY", "not set")
print(api_key)

missing = os.environ.get("MISSING_KEY", "not set")
print(missing)`,
    explanation: "os.environ.get(\"NAME\", default) reads an environment variable, exactly like process.env.NAME in Node, but with a built-in default instead of needing ??. Real secrets (API keys, tokens) should live in environment variables or a .env file - never hard-coded in your test scripts or committed to git.",
    prediction: {
      code: `import os

os.environ["STAGE"] = "staging"
print(os.environ.get("STAGE", "production"))
print(os.environ.get("REGION", "us-east-1"))`,
      answer: "staging\nus-east-1"
    },
    exercise: {
      instructions: "Set an environment variable DEEPEVAL_API_KEY to \"demo-key\", then read it back with os.environ.get using a default of \"not set\" and print it. Also read a MODEL_NAME variable that was never set, with a default of \"gpt-4\", and print that too.",
      starterCode: `import os

# Set and read environment variables below
`,
      expectedOutput: "demo-key\ngpt-4",
      hints: [
        "Set a variable with: os.environ[\"NAME\"] = \"value\"",
        "Read it with: os.environ.get(\"NAME\", \"default\")",
        "os.environ[\"DEEPEVAL_API_KEY\"] = \"demo-key\"; then print(os.environ.get(\"DEEPEVAL_API_KEY\", \"not set\"))"
      ],
      solution: `import os

os.environ["DEEPEVAL_API_KEY"] = "demo-key"
print(os.environ.get("DEEPEVAL_API_KEY", "not set"))
print(os.environ.get("MODEL_NAME", "gpt-4"))`
    }
  },

  17: {
    why: "Representing a test case, an agent's state, or a piece of QA data as a class instead of a raw dictionary gives you methods and structure - useful once your tooling grows beyond a few scripts.",
    typescriptExample: `class TestCase {
  name: string;
  passed: boolean;

  constructor(name: string, passed: boolean) {
    this.name = name;
    this.passed = passed;
  }

  summary(): string {
    return \`\${this.name}: \${this.passed ? "PASS" : "FAIL"}\`;
  }
}

const t = new TestCase("Login", true);
console.log(t.summary());`,
    pythonExample: `class TestCase:
    def __init__(self, name, passed):
        self.name = name
        self.passed = passed

    def summary(self):
        status = "PASS" if self.passed else "FAIL"
        return f"{self.name}: {status}"

t = TestCase("Login", True)
print(t.summary())`,
    explanation: "Python classes use __init__ instead of a constructor, and every method's first parameter is explicitly self (the equivalent of this, but you have to write it yourself). There's no new keyword - you just call the class like a function: TestCase(\"Login\", True).",
    exercise: {
      instructions: "Define a class TestCase with __init__(self, name, passed) and a method summary(self) that returns \"<name>: PASS\" or \"<name>: FAIL\". Create TestCase(\"Checkout\", False) and print its summary.",
      starterCode: `# Define the TestCase class below

`,
      expectedOutput: "Checkout: FAIL",
      hints: [
        "Store name and passed on self inside __init__.",
        "summary() should build a string using an if/else on self.passed.",
        "status = \"PASS\" if self.passed else \"FAIL\"; return f\"{self.name}: {status}\""
      ],
      solution: `class TestCase:
    def __init__(self, name, passed):
        self.name = name
        self.passed = passed

    def summary(self):
        status = "PASS" if self.passed else "FAIL"
        return f"{self.name}: {status}"

t = TestCase("Checkout", False)
print(t.summary())`
    }
  },

  18: {
    why: "Dataclasses cut the boilerplate of writing __init__ by hand, making them the standard way to represent structured QA data - test results, metrics, configs - the same role a TS interface or type plays.",
    typescriptExample: `interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
}

const r: TestResult = { name: "Login", passed: true, duration: 1.2 };
console.log(\`\${r.name}: \${r.passed} (\${r.duration}s)\`);`,
    pythonExample: `from dataclasses import dataclass

@dataclass
class TestResult:
    name: str
    passed: bool
    duration: float

r = TestResult(name="Login", passed=True, duration=1.2)
print(f"{r.name}: {r.passed} ({r.duration}s)")`,
    explanation: "@dataclass generates __init__, __repr__ and __eq__ for you from just the field list - the closest thing Python has to a TS interface/type, but with real objects you can instantiate. It's the recommended way to represent structured QA data without writing boilerplate classes by hand.",
    exercise: {
      instructions: "Define a dataclass TestResult with fields name: str, passed: bool, duration: float. Create TestResult(name=\"Checkout\", passed=False, duration=2.5) and print:\nCheckout: False (2.5s)",
      starterCode: `from dataclasses import dataclass

# Define TestResult below

`,
      expectedOutput: "Checkout: False (2.5s)",
      hints: [
        "Decorate the class with @dataclass.",
        "List fields as name: str, passed: bool, duration: float - no __init__ needed.",
        "print(f\"{r.name}: {r.passed} ({r.duration}s)\")"
      ],
      solution: `from dataclasses import dataclass

@dataclass
class TestResult:
    name: str
    passed: bool
    duration: float

r = TestResult(name="Checkout", passed=False, duration=2.5)
print(f"{r.name}: {r.passed} ({r.duration}s)")`
    }
  },

  19: {
    why: "Pytest is the standard Python test framework - DeepEval itself runs on top of it (deepeval test run uses pytest internally). Knowing how pytest discovers and runs tests is essential before writing any real test suite.",
    typescriptExample: `// login.test.ts
describe("classifyFailure", () => {
  it("detects backend errors", () => {
    expect(classifyFailure("HTTP 500")).toBe("backend");
  });
});`,
    pythonExample: `# test_failures.py - pytest discovers files/functions starting with test_
def classify_failure(error):
    return "backend" if "500" in error else "unknown"

def test_detects_backend_errors():
    assert classify_failure("HTTP 500") == "backend"

# In a real project you'd just run \`pytest\` from the terminal and it would
# find and run test_detects_backend_errors automatically. This sandbox can't
# launch the real CLI, so here we call it directly.
test_detects_backend_errors()
print("test_detects_backend_errors: PASS")`,
    explanation: "Real pytest finds any file named test_*.py or *_test.py, runs every function starting with test_, and treats a plain assert failing as a failed test - no expect()/toBe() needed. In a real project you'd just run pytest from the terminal; this sandbox simulates that by calling the test function directly since it can't launch the actual CLI.",
    exercise: {
      instructions: "Write a function classify_failure(error) (backend if \"500\" in error, else \"unknown\"), then a test_ function test_classifies_backend() that asserts classify_failure(\"HTTP 500\") == \"backend\". Call test_classifies_backend() and print \"test_classifies_backend: PASS\".",
      starterCode: `def classify_failure(error):
    return "backend" if "500" in error else "unknown"

# Define test_classifies_backend below, then call it and print PASS
`,
      expectedOutput: "test_classifies_backend: PASS",
      hints: [
        "Define test_classifies_backend() using assert, just like the example.",
        "Call the function directly: test_classifies_backend()",
        "If the assert doesn't raise, print \"test_classifies_backend: PASS\"."
      ],
      solution: `def classify_failure(error):
    return "backend" if "500" in error else "unknown"

def test_classifies_backend():
    assert classify_failure("HTTP 500") == "backend"

test_classifies_backend()
print("test_classifies_backend: PASS")`
    }
  },

  20: {
    why: "Comparing an expected value to an actual one is the heart of every test, and it's exactly how pytest (and DeepEval's score >= threshold checks) decide pass or fail.",
    typescriptExample: `function expectEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error(\`expected \${expected}, got \${actual}\`);
  }
}

expectEqual(2 + 2, 4);
console.log("assertion passed");`,
    pythonExample: `score = 0.82
threshold = 0.7

assert score >= threshold, f"score {score} did not meet threshold {threshold}"
print("assertion passed")`,
    explanation: "assert condition, \"message\" is Python's built-in way to check something is true - if the condition is false, it raises an AssertionError with your message, which is exactly how pytest decides a test failed. There's no need for a separate expect()/toBe() library; assert is a language keyword.",
    exercise: {
      instructions: "Given score = 0.42 and threshold = 0.5, write an assert that checks score >= threshold with the message f\"score {score} below threshold {threshold}\". Wrap it in a try/except AssertionError that prints the exception message when it fails.",
      starterCode: `score = 0.42
threshold = 0.5

# Write your try/except with an assert below
`,
      expectedOutput: "score 0.42 below threshold 0.5",
      hints: [
        "Put the assert inside a try block.",
        "assert score >= threshold, f\"score {score} below threshold {threshold}\"",
        "except AssertionError as e: print(e)"
      ],
      solution: `score = 0.42
threshold = 0.5

try:
    assert score >= threshold, f"score {score} below threshold {threshold}"
except AssertionError as e:
    print(e)`
    }
  },

  21: {
    why: "Running the same check across many LLM prompts or test inputs without copy-pasting the test body is exactly what pytest's parametrize (and jest's test.each) are built for.",
    typescriptExample: `test.each([
  ["2+2", "4"],
  ["capital of France", "Paris"]
])("evaluates %s", (prompt, expected) => {
  expect(askLlm(prompt)).toBe(expected);
});`,
    pythonExample: `# Real pytest:
# import pytest
#
# @pytest.mark.parametrize("prompt,expected", [
#     ("2+2", "4"),
#     ("capital of France", "Paris"),
# ])
# def test_llm_answer(prompt, expected):
#     assert ask_llm(prompt) == expected

def ask_llm(prompt):
    answers = {"2+2": "4", "capital of France": "Paris"}
    return answers.get(prompt, "unknown")

cases = [
    ("2+2", "4"),
    ("capital of France", "Paris"),
]

for prompt, expected in cases:
    result = ask_llm(prompt)
    print(f"{prompt}: {'PASS' if result == expected else 'FAIL'}")`,
    explanation: "pytest.mark.parametrize runs the same test function once per row of data you give it, instead of copy-pasting the test body for every input - very similar to jest's test.each. This sandbox can't load the real decorator, so the loop above simulates exactly what it does under the hood: call the same check once per case.",
    exercise: {
      instructions: "Given cases = [(\"hello\", \"HELLO\"), (\"test\", \"TEST\")], loop over the cases and for each (text, expected) pair print \"PASS\" if text.upper() == expected else \"FAIL\".",
      starterCode: `cases = [("hello", "HELLO"), ("test", "TEST")]

# Loop over cases and print PASS/FAIL below
`,
      expectedOutput: "PASS\nPASS",
      hints: [
        "Unpack each tuple in the loop: for text, expected in cases:",
        "Compare text.upper() to expected.",
        "print(\"PASS\" if text.upper() == expected else \"FAIL\")"
      ],
      solution: `cases = [("hello", "HELLO"), ("test", "TEST")]

for text, expected in cases:
    print("PASS" if text.upper() == expected else "FAIL")`
    }
  },

  22: {
    why: "A pytest fixture is reusable setup code shared across many tests - like a fake API client or agent instance - so each test doesn't repeat the same setup. Keeping suites DRY matters as they grow.",
    typescriptExample: `let apiClient;

beforeEach(() => {
  apiClient = createFakeApiClient();
});

it("fetches a result", () => {
  expect(apiClient.get("/health")).toBe("ok");
});`,
    pythonExample: `# Real pytest:
# import pytest
#
# @pytest.fixture
# def api_client():
#     return FakeApiClient()
#
# def test_health(api_client):
#     assert api_client.get("/health") == "ok"

class FakeApiClient:
    def get(self, path):
        return "ok" if path == "/health" else "not found"

def api_client():
    """Stands in for a pytest fixture - called by hand here instead."""
    return FakeApiClient()

def test_health():
    client = api_client()
    assert client.get("/health") == "ok"

test_health()
print("test_health: PASS")`,
    explanation: "A pytest fixture is just a reusable setup function - you declare a parameter with the same name as the fixture, and pytest calls it for you and hands you the result. Multiple tests can share one api_client() fixture instead of each test repeating the setup code.",
    exercise: {
      instructions: "Define a function make_agent() that returns the dict {\"name\": \"triage-bot\", \"ready\": True} (standing in for a fixture). Write test_agent_ready() that calls make_agent() and asserts result[\"ready\"] is True. Call it and print \"test_agent_ready: PASS\".",
      starterCode: `# Define make_agent and test_agent_ready below

`,
      expectedOutput: "test_agent_ready: PASS",
      hints: [
        "make_agent() just returns a dict literal - no arguments needed.",
        "Inside test_agent_ready(), call agent = make_agent() then assert agent['ready'] is True.",
        "test_agent_ready(); print(\"test_agent_ready: PASS\")"
      ],
      solution: `def make_agent():
    return {"name": "triage-bot", "ready": True}

def test_agent_ready():
    agent = make_agent()
    assert agent["ready"] is True

test_agent_ready()
print("test_agent_ready: PASS")`
    }
  },

  23: {
    why: "Calling the application-under-test's REST API or an LLM provider's API is a daily task in AI QA. Knowing the request/response shape matters even before you touch a real network.",
    typescriptExample: `const response = await fetch("https://api.example.com/health");
const data = await response.json();
console.log(response.status, data.status);`,
    pythonExample: `# Real code: import requests; requests.get("https://api.example.com/health")
# This sandbox has no network access, so we use a tiny mock in its place
# with the same shape as the requests library's response object.

class MockResponse:
    def __init__(self, status_code, data):
        self.status_code = status_code
        self._data = data

    def json(self):
        return self._data

def mock_get(url):
    return MockResponse(200, {"status": "ok"})

response = mock_get("https://api.example.com/health")
print(response.status_code, response.json()["status"])`,
    explanation: "The real requests library's requests.get(url) returns a response object with .status_code and .json() - the mock above mirrors that exact interface. Since this sandbox is offline, every HTTP example here uses a mock instead of a real network call, but the pattern (check status_code, read .json()) is identical to real code.",
    exercise: {
      instructions: "Using the MockResponse class and mock_get function below, call mock_get(\"/users/1\") and print:\n200 ok",
      starterCode: `class MockResponse:
    def __init__(self, status_code, data):
        self.status_code = status_code
        self._data = data

    def json(self):
        return self._data

def mock_get(url):
    return MockResponse(200, {"status": "ok"})

# Call mock_get and print below
`,
      expectedOutput: "200 ok",
      hints: [
        "Call response = mock_get(\"/users/1\").",
        "response.status_code is a number, response.json() returns a dict.",
        "print(response.status_code, response.json()['status'])"
      ],
      solution: `class MockResponse:
    def __init__(self, status_code, data):
        self.status_code = status_code
        self._data = data

    def json(self):
        return self._data

def mock_get(url):
    return MockResponse(200, {"status": "ok"})

response = mock_get("/users/1")
print(response.status_code, response.json()["status"])`
    }
  },

  24: {
    why: "Real APIs time out, return 500s, and fail in all sorts of ways. Handling each failure mode distinctly - instead of one generic catch-all - is what makes QA tooling resilient instead of fragile.",
    typescriptExample: `try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}\`);
  }
} catch (e) {
  console.log(\`request failed: \${e.message}\`);
}`,
    pythonExample: `class ApiError(Exception):
    pass

def mock_get(url):
    if "timeout" in url:
        raise TimeoutError("request timed out")
    return {"status_code": 500}

def fetch_health(url):
    try:
        response = mock_get(url)
        if response["status_code"] >= 500:
            raise ApiError(f"server error {response['status_code']}")
        return "ok"
    except TimeoutError as e:
        return f"timeout: {e}"
    except ApiError as e:
        return f"api error: {e}"

print(fetch_health("https://api.example.com/health"))`,
    explanation: "Defining your own exception class (class ApiError(Exception): pass) lets you raise and catch errors specific to your QA tooling, instead of only generic ones - similar to extending Error in TS. Catching TimeoutError and ApiError separately means you can respond differently to each failure mode.",
    exercise: {
      instructions: "Using fetch_health, mock_get and ApiError below, call fetch_health(\"https://api.example.com/timeout\") and print the result.",
      starterCode: `class ApiError(Exception):
    pass

def mock_get(url):
    if "timeout" in url:
        raise TimeoutError("request timed out")
    return {"status_code": 500}

def fetch_health(url):
    try:
        response = mock_get(url)
        if response["status_code"] >= 500:
            raise ApiError(f"server error {response['status_code']}")
        return "ok"
    except TimeoutError as e:
        return f"timeout: {e}"
    except ApiError as e:
        return f"api error: {e}"

# Call fetch_health and print below
`,
      expectedOutput: "timeout: request timed out",
      hints: [
        "Call fetch_health(\"https://api.example.com/timeout\").",
        "The url contains \"timeout\", so mock_get raises TimeoutError.",
        "print(fetch_health(\"https://api.example.com/timeout\"))"
      ],
      solution: `class ApiError(Exception):
    pass

def mock_get(url):
    if "timeout" in url:
        raise TimeoutError("request timed out")
    return {"status_code": 500}

def fetch_health(url):
    try:
        response = mock_get(url)
        if response["status_code"] >= 500:
            raise ApiError(f"server error {response['status_code']}")
        return "ok"
    except TimeoutError as e:
        return f"timeout: {e}"
    except ApiError as e:
        return f"api error: {e}"

print(fetch_health("https://api.example.com/timeout"))`
    }
  },

  25: {
    why: "Filtering down to just the failed tests, or transforming a list of raw results into display-ready strings, is something you'll do constantly when summarizing test runs or LLM evaluation batches.",
    typescriptExample: `const results = [
  { test: "Login", passed: true },
  { test: "Checkout", passed: false },
  { test: "Payment", passed: false }
];

const failedNames = results.filter(r => !r.passed).map(r => r.test);
console.log(failedNames);`,
    pythonExample: `results = [
    {"test": "Login", "passed": True},
    {"test": "Checkout", "passed": False},
    {"test": "Payment", "passed": False}
]

failed_names = [r["test"] for r in results if not r["passed"]]
print(failed_names)`,
    explanation: "[expr for item in iterable if condition] combines filter + map into one line - expr plays the role of .map()'s callback, and if condition plays the role of .filter()'s callback. It's idiomatic Python for building a new list from an existing one.",
    prediction: {
      code: `nums = [1, 2, 3, 4, 5, 6]
evens = [n * n for n in nums if n % 2 == 0]
print(evens)`,
      answer: "[4, 16, 36]"
    },
    exercise: {
      instructions: "Given results below, use a list comprehension to build a list of test names where passed is False, and print it.",
      starterCode: `results = [
    {"test": "Login", "passed": True},
    {"test": "Checkout", "passed": False},
    {"test": "Payment", "passed": False}
]

# Build failed_names with a list comprehension and print it
`,
      expectedOutput: "['Checkout', 'Payment']",
      hints: [
        "The shape is [expr for item in list if condition].",
        "Your condition is `not r[\"passed\"]`.",
        "failed_names = [r['test'] for r in results if not r['passed']]"
      ],
      solution: `results = [
    {"test": "Login", "passed": True},
    {"test": "Checkout", "passed": False},
    {"test": "Payment", "passed": False}
]

failed_names = [r["test"] for r in results if not r["passed"]]
print(failed_names)`
    }
  },

  26: {
    why: "Calling several LLM endpoints or agent tool calls at once, instead of waiting for each one in sequence, is exactly what async/await with concurrent gathering gives you.",
    typescriptExample: `async function fetchResult(name) {
  await new Promise((r) => setTimeout(r, 100));
  return \`\${name}: done\`;
}

async function main() {
  const results = await Promise.all([
    fetchResult("Login"),
    fetchResult("Checkout")
  ]);
  results.forEach((r) => console.log(r));
}

main();`,
    pythonExample: `import asyncio

async def fetch_result(name):
    await asyncio.sleep(0.1)
    return f"{name}: done"

async def main():
    results = await asyncio.gather(
        fetch_result("Login"),
        fetch_result("Checkout")
    )
    for r in results:
        print(r)

await main()`,
    explanation: "async def and await work exactly like their TS counterparts. asyncio.gather(...) is Python's Promise.all() - it runs multiple coroutines concurrently and waits for all of them. This is how you'd call several LLM endpoints or agent tool calls at once instead of one at a time.",
    exercise: {
      instructions: "Write an async function check_endpoint(name) that awaits asyncio.sleep(0.1) then returns f\"{name}: ok\". Using asyncio.gather, run it concurrently for \"auth\" and \"payments\", then print each result on its own line.",
      starterCode: `import asyncio

# Define check_endpoint below

async def main():
    results = await asyncio.gather(
        check_endpoint("auth"),
        check_endpoint("payments")
    )
    for r in results:
        print(r)

await main()
`,
      expectedOutput: "auth: ok\npayments: ok",
      hints: [
        "Define it with: async def check_endpoint(name):",
        "Inside, await asyncio.sleep(0.1) before returning.",
        "return f\"{name}: ok\""
      ],
      solution: `import asyncio

async def check_endpoint(name):
    await asyncio.sleep(0.1)
    return f"{name}: ok"

async def main():
    results = await asyncio.gather(
        check_endpoint("auth"),
        check_endpoint("payments")
    )
    for r in results:
        print(r)

await main()`
    }
  },

  27: {
    why: "This brings together functions, dicts, conditions and loops into one small but realistic tool: a failure triage script that takes a batch of test failures and summarizes how many fall into each category.",
    typescriptExample: `function classify(error) {
  if (error.includes("500")) return "backend";
  if (error.toLowerCase().includes("element")) return "automation";
  return "unknown";
}

function analyze(failures) {
  const counts = {};
  for (const f of failures) {
    const category = classify(f.error);
    counts[category] = (counts[category] ?? 0) + 1;
  }
  return counts;
}`,
    pythonExample: `def classify(error):
    if "500" in error:
        return "backend"
    if "element" in error.lower():
        return "automation"
    return "unknown"

def analyze_failures(failures):
    counts = {}
    for f in failures:
        category = classify(f["error"])
        counts[category] = counts.get(category, 0) + 1
    return counts

failures = [
    {"test": "Checkout", "error": "HTTP 500"},
    {"test": "Login", "error": "Element not found"},
    {"test": "Payment", "error": "HTTP 500"}
]

print(analyze_failures(failures))`,
    explanation: "counts.get(category, 0) is the Python idiom for \"read this key, or 0 if it's missing\" - useful for building up tallies without checking for existence first. This is the same shape as every failure-triage or metrics-summary tool you'd write for a real AI QA pipeline.",
    exercise: {
      instructions: "Using classify and analyze_failures below, run analyze_failures on the failures list and print the resulting counts dictionary.",
      starterCode: `def classify(error):
    if "500" in error:
        return "backend"
    if "element" in error.lower():
        return "automation"
    return "unknown"

def analyze_failures(failures):
    counts = {}
    for f in failures:
        category = classify(f["error"])
        counts[category] = counts.get(category, 0) + 1
    return counts

failures = [
    {"test": "Checkout", "error": "HTTP 500"},
    {"test": "Login", "error": "Element not found"},
    {"test": "Payment", "error": "HTTP 500"}
]

# Call analyze_failures and print the result
`,
      expectedOutput: "{'backend': 2, 'automation': 1}",
      hints: [
        "Call summary = analyze_failures(failures).",
        "Then print(summary).",
        "print(analyze_failures(failures))"
      ],
      solution: `def classify(error):
    if "500" in error:
        return "backend"
    if "element" in error.lower():
        return "automation"
    return "unknown"

def analyze_failures(failures):
    counts = {}
    for f in failures:
        category = classify(f["error"])
        counts[category] = counts.get(category, 0) + 1
    return counts

failures = [
    {"test": "Checkout", "error": "HTTP 500"},
    {"test": "Login", "error": "Element not found"},
    {"test": "Payment", "error": "HTTP 500"}
]

print(analyze_failures(failures))`
    }
  },

  28: {
    why: "Every major LLM provider (OpenAI, Anthropic, etc.) returns a similarly-shaped nested response. Once you can reliably pull the generated text out of that structure, you can feed it into DeepEval metrics or your own assertions.",
    typescriptExample: `const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Say hello" }]
});

console.log(response.choices[0].message.content);`,
    pythonExample: `# Real code: client.chat.completions.create(model=..., messages=[...])
# This sandbox is offline, so mock_chat_completion mimics the exact
# response shape an LLM API returns.

def mock_chat_completion(prompt):
    return {
        "model": "gpt-4",
        "choices": [
            {"message": {"role": "assistant", "content": f"Echo: {prompt}"}}
        ]
    }

response = mock_chat_completion("Say hello")
print(response["choices"][0]["message"]["content"])`,
    explanation: "Every major LLM API returns a nested structure like this: a list of choices, each with a message containing the actual text in .content. Once you can reliably pull response['choices'][0]['message']['content'] out of that structure, you can feed it into DeepEval metrics or your own assertions.",
    prediction: {
      code: `def mock_chat_completion(prompt):
    return {"choices": [{"message": {"content": prompt.upper()}}]}

response = mock_chat_completion("hello")
print(response["choices"][0]["message"]["content"])`,
      answer: "HELLO"
    },
    exercise: {
      instructions: "Using mock_chat_completion below, call it with \"What is 2+2?\" and print just the message content.",
      starterCode: `def mock_chat_completion(prompt):
    return {
        "model": "gpt-4",
        "choices": [
            {"message": {"role": "assistant", "content": f"Echo: {prompt}"}}
        ]
    }

# Call mock_chat_completion and print the content below
`,
      expectedOutput: "Echo: What is 2+2?",
      hints: [
        "response = mock_chat_completion(\"What is 2+2?\")",
        "The text is nested: response['choices'][0]['message']['content']",
        "print(response['choices'][0]['message']['content'])"
      ],
      solution: `def mock_chat_completion(prompt):
    return {
        "model": "gpt-4",
        "choices": [
            {"message": {"role": "assistant", "content": f"Echo: {prompt}"}}
        ]
    }

response = mock_chat_completion("What is 2+2?")
print(response["choices"][0]["message"]["content"])`
    }
  },

  29: {
    why: "An AI agent's core loop is: look at the input, decide which tool fits, call it. Storing tools as a dict of name -> function is exactly how real agent frameworks register and dispatch tools.",
    typescriptExample: `const tools = {
  search: (q) => \`search results for \${q}\`,
  calculator: (q) => \`calculated: \${q}\`
};

function routeToTool(input) {
  if (input.includes("calculate")) return "calculator";
  return "search";
}

const toolName = routeToTool("calculate 2+2");
console.log(tools[toolName]("2+2"));`,
    pythonExample: `def search_tool(query):
    return f"search results for {query}"

def calculator_tool(query):
    return f"calculated: {query}"

tools = {
    "search": search_tool,
    "calculator": calculator_tool
}

def route_to_tool(user_input):
    if "calculate" in user_input:
        return "calculator"
    return "search"

tool_name = route_to_tool("calculate 2+2")
print(tools[tool_name]("2+2"))`,
    explanation: "Functions are values in Python, so they can be stored in a dict and looked up by name just like any other data - tools[\"calculator\"] retrieves the function itself, which you then call. This dict-of-functions pattern is exactly how real agent frameworks register and dispatch tools.",
    exercise: {
      instructions: "Using tools and route_to_tool below, call route_to_tool(\"search for python tutorials\") to get a tool name, then call that tool with \"python tutorials\" and print the result.",
      starterCode: `def search_tool(query):
    return f"search results for {query}"

def calculator_tool(query):
    return f"calculated: {query}"

tools = {
    "search": search_tool,
    "calculator": calculator_tool
}

def route_to_tool(user_input):
    if "calculate" in user_input:
        return "calculator"
    return "search"

# Route and call the tool below
`,
      expectedOutput: "search results for python tutorials",
      hints: [
        "tool_name = route_to_tool(\"search for python tutorials\")",
        "Look up the function in the dict: tools[tool_name]",
        "print(tools[tool_name](\"python tutorials\"))"
      ],
      solution: `def search_tool(query):
    return f"search results for {query}"

def calculator_tool(query):
    return f"calculated: {query}"

tools = {
    "search": search_tool,
    "calculator": calculator_tool
}

def route_to_tool(user_input):
    if "calculate" in user_input:
        return "calculator"
    return "search"

tool_name = route_to_tool("search for python tutorials")
print(tools[tool_name]("python tutorials"))`
    }
  },

  30: {
    why: "DeepEval is the standard framework for evaluating LLM outputs - metrics like answer relevancy, faithfulness and hallucination all follow the same shape: compute a score, compare it to a threshold, decide pass or fail.",
    typescriptExample: `// DeepEval is Python-only; the closest TS equivalent is a hand-rolled check:
function answerRelevancy(answer, question) {
  const keywords = question.toLowerCase().split(" ");
  const hits = keywords.filter(k => answer.toLowerCase().includes(k));
  return hits.length / keywords.length;
}`,
    pythonExample: `# Real code:
# from deepeval.metrics import AnswerRelevancyMetric
# from deepeval.test_case import LLMTestCase
#
# metric = AnswerRelevancyMetric(threshold=0.7)
# test_case = LLMTestCase(input=question, actual_output=answer)
# metric.measure(test_case)

# This sandbox can't install the real deepeval package (it needs network
# access to call a judge LLM), so here's a simplified stand-in metric.

def answer_relevancy_score(answer, question):
    keywords = question.lower().split()
    hits = [k for k in keywords if k in answer.lower()]
    return len(hits) / len(keywords)

question = "What is the capital of France?"
answer = "The capital of France is Paris."

score = answer_relevancy_score(answer, question)
passed = score >= 0.7
print(f"score={score:.2f} passed={passed}")`,
    explanation: "DeepEval's real metrics (AnswerRelevancyMetric, FaithfulnessMetric, etc.) use an LLM to judge the answer and return a score plus a pass/fail against a threshold - the pattern above (compute a score, compare to a threshold, decide passed) is exactly that, just with a simplified keyword-overlap heuristic standing in for the real judge model.",
    prediction: {
      code: `def answer_relevancy_score(answer, question):
    keywords = question.lower().split()
    hits = [k for k in keywords if k in answer.lower()]
    return len(hits) / len(keywords)

score = answer_relevancy_score("Paris is lovely in spring.", "What is the capital?")
print(round(score, 2))`,
      answer: "0.25"
    },
    exercise: {
      instructions: "Using answer_relevancy_score below, compute the score for question = \"What is DeepEval?\" and answer = \"DeepEval is a framework for evaluating LLM outputs.\", then print whether it passed a 0.5 threshold as \"score=<2 decimals> passed=<bool>\".",
      starterCode: `def answer_relevancy_score(answer, question):
    keywords = question.lower().split()
    hits = [k for k in keywords if k in answer.lower()]
    return len(hits) / len(keywords)

question = "What is DeepEval?"
answer = "DeepEval is a framework for evaluating LLM outputs."

# Compute the score, compare to 0.5, and print below
`,
      expectedOutput: "score=0.33 passed=False",
      hints: [
        "score = answer_relevancy_score(answer, question)",
        "passed = score >= 0.5",
        "print(f\"score={score:.2f} passed={passed}\")"
      ],
      solution: `def answer_relevancy_score(answer, question):
    keywords = question.lower().split()
    hits = [k for k in keywords if k in answer.lower()]
    return len(hits) / len(keywords)

question = "What is DeepEval?"
answer = "DeepEval is a framework for evaluating LLM outputs."

score = answer_relevancy_score(answer, question)
passed = score >= 0.5
print(f"score={score:.2f} passed={passed}")`
    }
  },

  31: {
    why: "Evaluating an agent isn't just checking the final answer - it's checking whether it took the right sequence of steps along the way (did it call the right tool at each point?).",
    typescriptExample: `function scoreTrajectory(actualSteps, expectedSteps) {
  let matches = 0;
  for (let i = 0; i < expectedSteps.length; i++) {
    if (actualSteps[i] && actualSteps[i].tool === expectedSteps[i].tool) {
      matches++;
    }
  }
  return matches / expectedSteps.length;
}`,
    pythonExample: `def score_trajectory(actual_steps, expected_steps):
    matches = 0
    for actual, expected in zip(actual_steps, expected_steps):
        if actual["tool"] == expected["tool"]:
            matches += 1
    return matches / len(expected_steps)

expected_steps = [{"tool": "search"}, {"tool": "calculator"}, {"tool": "respond"}]
actual_steps = [{"tool": "search"}, {"tool": "search"}, {"tool": "respond"}]

score = score_trajectory(actual_steps, expected_steps)
print(f"{score:.2f}")`,
    explanation: "zip(actual_steps, expected_steps) pairs the two lists up position-by-position so you can compare step-by-step - the same idea as comparing two arrays index-by-index in TS, but without manually tracking an index.",
    exercise: {
      instructions: "Using score_trajectory below, compute the score for expected_steps = [{\"tool\": \"search\"}, {\"tool\": \"calculator\"}] vs actual_steps = [{\"tool\": \"search\"}, {\"tool\": \"search\"}] and print it formatted to 2 decimal places.",
      starterCode: `def score_trajectory(actual_steps, expected_steps):
    matches = 0
    for actual, expected in zip(actual_steps, expected_steps):
        if actual["tool"] == expected["tool"]:
            matches += 1
    return matches / len(expected_steps)

expected_steps = [{"tool": "search"}, {"tool": "calculator"}]
actual_steps = [{"tool": "search"}, {"tool": "search"}]

# Compute and print the score below
`,
      expectedOutput: "0.50",
      hints: [
        "score = score_trajectory(actual_steps, expected_steps)",
        "Use an f-string with :.2f to format to 2 decimal places.",
        "print(f\"{score:.2f}\")"
      ],
      solution: `def score_trajectory(actual_steps, expected_steps):
    matches = 0
    for actual, expected in zip(actual_steps, expected_steps):
        if actual["tool"] == expected["tool"]:
            matches += 1
    return matches / len(expected_steps)

expected_steps = [{"tool": "search"}, {"tool": "calculator"}]
actual_steps = [{"tool": "search"}, {"tool": "search"}]

score = score_trajectory(actual_steps, expected_steps)
print(f"{score:.2f}")`
    }
  },

  32: {
    why: "An evaluation dataset is a fixed list of question/expected-answer pairs - a \"golden set\" - that you run your LLM or agent against every time you make a change, the same role a table of test fixtures plays for traditional QA.",
    typescriptExample: `const dataset = [
  { question: "2+2", expected: "4", actual: "4" },
  { question: "capital of France", expected: "Paris", actual: "Paris" },
  { question: "3+3", expected: "6", actual: "5" }
];

const passRate = dataset.filter(d => d.actual === d.expected).length / dataset.length;
console.log(passRate);`,
    pythonExample: `dataset = [
    {"question": "2+2", "expected": "4", "actual": "4"},
    {"question": "capital of France", "expected": "Paris", "actual": "Paris"},
    {"question": "3+3", "expected": "6", "actual": "5"}
]

passed = [d for d in dataset if d["actual"] == d["expected"]]
pass_rate = len(passed) / len(dataset)
print(f"{pass_rate:.2f}")`,
    explanation: "Combining a list comprehension with len() is the standard way to compute a pass rate across a whole evaluation dataset - the same \"golden set\" idea as a table of test fixtures, just applied to LLM or agent outputs instead of UI test steps.",
    exercise: {
      instructions: "Using dataset below, compute and print the pass rate (passed count / total count) formatted to 2 decimal places.",
      starterCode: `dataset = [
    {"question": "2+2", "expected": "4", "actual": "4"},
    {"question": "capital of France", "expected": "Paris", "actual": "Paris"},
    {"question": "3+3", "expected": "6", "actual": "5"},
    {"question": "5-2", "expected": "3", "actual": "3"}
]

# Compute and print the pass rate below
`,
      expectedOutput: "0.75",
      hints: [
        "Build a list of items where actual == expected, e.g. with a list comprehension.",
        "pass_rate = len(passed) / len(dataset)",
        "print(f\"{pass_rate:.2f}\")"
      ],
      solution: `dataset = [
    {"question": "2+2", "expected": "4", "actual": "4"},
    {"question": "capital of France", "expected": "Paris", "actual": "Paris"},
    {"question": "3+3", "expected": "6", "actual": "5"},
    {"question": "5-2", "expected": "3", "actual": "3"}
]

passed = [d for d in dataset if d["actual"] == d["expected"]]
pass_rate = len(passed) / len(dataset)
print(f"{pass_rate:.2f}")`
    }
  },

  33: {
    why: "Running your AI QA test suite automatically on every push or pull request, instead of relying on someone remembering to run it locally, is what turns a test suite into a real safety net.",
    typescriptExample: `// .github/workflows/test.yml
// name: CI
// on: [push]
// jobs:
//   test:
//     steps:
//       - run: npm install
//       - run: npm test`,
    pythonExample: `# .github/workflows/test.yml
# name: CI
# on: [push]
# jobs:
#   test:
#     steps:
#       - run: pip install -r requirements.txt
#       - run: pytest
#       - run: deepeval test run test_llm_outputs.py

required_steps = ["install", "test"]

def validate_pipeline(steps):
    missing = [s for s in required_steps if s not in steps]
    return "valid" if not missing else f"missing: {', '.join(missing)}"

pipeline_steps = ["install", "lint", "test", "deploy"]
print(validate_pipeline(pipeline_steps))`,
    explanation: "A CI/CD pipeline (GitHub Actions, GitLab CI, etc.) is just a config file describing steps to run on every push - install dependencies, then run pytest (and deepeval test run for LLM evaluations). validate_pipeline above mirrors how a real CI config gets checked: making sure required steps are present before anything runs.",
    exercise: {
      instructions: "Using validate_pipeline and required_steps below, call validate_pipeline with pipeline_steps = [\"lint\", \"test\"] (missing \"install\") and print the result.",
      starterCode: `required_steps = ["install", "test"]

def validate_pipeline(steps):
    missing = [s for s in required_steps if s not in steps]
    return "valid" if not missing else f"missing: {', '.join(missing)}"

# Call validate_pipeline and print below
`,
      expectedOutput: "missing: install",
      hints: [
        "pipeline_steps = [\"lint\", \"test\"]",
        "result = validate_pipeline(pipeline_steps)",
        "print(validate_pipeline([\"lint\", \"test\"]))"
      ],
      solution: `required_steps = ["install", "test"]

def validate_pipeline(steps):
    missing = [s for s in required_steps if s not in steps]
    return "valid" if not missing else f"missing: {', '.join(missing)}"

pipeline_steps = ["lint", "test"]
print(validate_pipeline(pipeline_steps))`
    }
  }
};

const LESSONS = LESSON_TITLES.map((title, index) => {
  const id = index + 1;
  return {
    id,
    title,
    content: LESSON_CONTENT[id] || null
  };
});
