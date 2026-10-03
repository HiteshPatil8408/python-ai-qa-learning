// Original curriculum extensions. Browser exercises use Python standard library only.
const ADVANCED_LESSONS = [
  {
    "id": 34,
    "title": "Dependency Injection and API Test Doubles",
    "track": "Intermediate",
    "content": {
      "why": "Isolate model clients so a unit test can reproduce success and failure without network calls.",
      "explanation": "Dependency injection passes the client into the function. A fake implements only the behavior needed by a test; a mock can also verify interactions. unittest.mock side_effect can produce responses or exceptions. In pytest, monkeypatch restores changes after a test. Patch where the dependency is looked up. Keep separate contract tests against an authorized service because a fake can drift from its real API.",
      "pythonExample": "def classify(client, text):\n    response = client(text)\n    label = response.get(\"label\")\n    if label not in {\"positive\", \"negative\", \"neutral\"}:\n        raise ValueError(\"Invalid label\")\n    return label\n\nprint(classify(lambda text: {\"label\": \"positive\"}, \"Great\"))",
      "goals": [
        "Isolate model clients so a unit test can reproduce success and failure without network calls.",
        "Implement the function and verify edge cases with assertions."
      ],
      "pitfall": "A mock passing does not prove that the provider API still matches your fake.",
      "lab": "Locally, write parametrized pytest cases with Mock(side_effect=[...]) for valid output, invalid output, and provider failure. Verify the text argument and preserve the original exception. Deliver tests and a short explanation of which checks still require a live contract test.",
      "sources": [
        {
          "title": "Python unittest.mock",
          "url": "https://docs.python.org/3/library/unittest.mock.html"
        },
        {
          "title": "pytest monkeypatch",
          "url": "https://docs.pytest.org/en/stable/how-to/monkeypatch.html"
        }
      ],
      "exercise": {
        "instructions": "Implement classify(client, text). Read the client response and return a label only if it is positive, negative or neutral; otherwise raise ValueError. Keep the sample print call. Check Answer verifies the output and additional behavior.",
        "starterCode": "def classify(client, text):\n    # Implement your solution\n    pass\n\nprint(classify(lambda text: {\"label\": \"positive\"}, \"Great\"))",
        "solution": "def classify(client, text):\n    response = client(text)\n    label = response.get(\"label\")\n    if label not in {\"positive\", \"negative\", \"neutral\"}:\n        raise ValueError(\"Invalid label\")\n    return label\n\nprint(classify(lambda text: {\"label\": \"positive\"}, \"Great\"))",
        "expectedOutput": "positive",
        "validationCode": "assert classify(lambda _: {\"label\": \"negative\"}, \"Bad\") == \"negative\", \"Do not hardcode the positive label\"\ntry:\n    classify(lambda _: {\"label\": \"unknown\"}, \"?\")\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError(\"Reject invalid labels\")",
        "hints": [
          "Read the client response and return a label only if it is positive, negative or neutral; otherwise raise ValueError.",
          "Call client(text), then use response.get(\"label\")."
        ]
      }
    }
  },
  {
    "id": 35,
    "title": "Structured Output Contracts",
    "track": "Intermediate",
    "content": {
      "why": "Reject syntactically valid JSON that violates your application contract.",
      "explanation": "JSON parsing proves syntax, not meaning. A contract should specify required keys, types, allowed values and extra-field policy. Python bool is a subclass of int, so a strict numeric field must explicitly reject booleans. Production schemas can use JSON Schema or a validation library; this exercise implements a small explicit contract.",
      "pythonExample": "def valid_result(data):\n    return (isinstance(data, dict)\n            and set(data) == {\"label\", \"confidence\"}\n            and isinstance(data[\"label\"], str)\n            and data[\"label\"] in {\"pass\", \"fail\"}\n            and type(data[\"confidence\"]) in (int, float)\n            and 0 <= data[\"confidence\"] <= 1)\n\nprint(valid_result({\"label\": \"pass\", \"confidence\": 0.9}))",
      "goals": [
        "Reject syntactically valid JSON that violates your application contract.",
        "Implement the function and verify edge cases with assertions."
      ],
      "pitfall": "An output can pass its schema and still be factually incorrect.",
      "lab": "Build schema tests for missing fields, nulls, extra fields, boundary values and valid JSON with wrong types. Capture malformed provider responses as fixtures. Deliver a documented contract and negative tests.",
      "sources": [
        {
          "title": "Python standard library",
          "url": "https://docs.python.org/3/library/"
        }
      ],
      "exercise": {
        "instructions": "Implement valid_result(data). Accept exactly label and confidence, labels pass/fail, and numeric confidence between 0 and 1. Reject booleans. Keep the sample print call. Check Answer verifies the output and additional behavior.",
        "starterCode": "def valid_result(data):\n    # Implement your solution\n    pass\n\nprint(valid_result({\"label\": \"pass\", \"confidence\": 0.9}))",
        "solution": "def valid_result(data):\n    return (isinstance(data, dict)\n            and set(data) == {\"label\", \"confidence\"}\n            and isinstance(data[\"label\"], str)\n            and data[\"label\"] in {\"pass\", \"fail\"}\n            and type(data[\"confidence\"]) in (int, float)\n            and 0 <= data[\"confidence\"] <= 1)\n\nprint(valid_result({\"label\": \"pass\", \"confidence\": 0.9}))",
        "expectedOutput": "True",
        "validationCode": "assert valid_result({\"label\": \"fail\", \"confidence\": 0})\nassert not valid_result({\"label\": \"pass\", \"confidence\": True}), \"Booleans are not confidence scores\"\nassert not valid_result({\"label\": \"pass\", \"confidence\": 1.1})\nassert not valid_result({\"label\": \"pass\"})\nassert not valid_result({\"label\": [], \"confidence\": 0.5})\nassert not valid_result({\"label\": \"pass\", \"confidence\": 0.5, \"extra\": 1})",
        "hints": [
          "Accept exactly label and confidence, labels pass/fail, and numeric confidence between 0 and 1. Reject booleans.",
          "Use type(value) in (int, float) for this strict numeric contract."
        ]
      }
    }
  },
  {
    "id": 36,
    "title": "Bounded Retries and Failure Classification",
    "track": "Intermediate",
    "content": {
      "why": "Retry transient failures without amplifying load or repeating unauthorized side effects.",
      "explanation": "Timeouts, throttling and server errors may be transient. Authentication and validation failures usually need a fix. A production retry policy needs a total deadline, bounded attempts, exponential backoff with jitter and server delay handling. A timeout may follow a successful write: use an idempotency mechanism before retrying side effects. This exercise tests the retry decision only and does not sleep.",
      "pythonExample": "def should_retry(status, attempt, max_attempts):\n    return attempt < max_attempts and status in {429, 500, 502, 503, 504}\n\nprint(should_retry(429, 1, 3))",
      "goals": [
        "Retry transient failures without amplifying load or repeating unauthorized side effects.",
        "Implement the function and verify edge cases with assertions."
      ],
      "pitfall": "Retrying every failure can hide authentication bugs and multiply cost.",
      "lab": "Inject a fake clock and response sequence into a retry wrapper. Test exhaustion, immediate success, Retry-After handling, cancellation and duplicate side-effect prevention. Assert total calls and elapsed budget without real sleeps.",
      "sources": [
        {
          "title": "Python standard library",
          "url": "https://docs.python.org/3/library/"
        },
        {
          "title": "Python unittest.mock",
          "url": "https://docs.python.org/3/library/unittest.mock.html"
        }
      ],
      "exercise": {
        "instructions": "Implement should_retry(status, attempt, max_attempts). Return True only for 429, 500, 502, 503 or 504 and a 1-based attempt strictly below max_attempts. Keep the sample print call. Check Answer verifies the output and additional behavior.",
        "starterCode": "def should_retry(status, attempt, max_attempts):\n    # Implement your solution\n    pass\n\nprint(should_retry(429, 1, 3))",
        "solution": "def should_retry(status, attempt, max_attempts):\n    return attempt < max_attempts and status in {429, 500, 502, 503, 504}\n\nprint(should_retry(429, 1, 3))",
        "expectedOutput": "True",
        "validationCode": "assert not should_retry(401, 1, 3)\nassert not should_retry(400, 1, 3)\nassert not should_retry(503, 3, 3), \"Attempts must be bounded\"\nassert should_retry(502, 2, 3)",
        "hints": [
          "Return True only for 429, 500, 502, 503 or 504 and a 1-based attempt strictly below max_attempts.",
          "Use a set of retryable statuses and combine it with the attempt condition."
        ]
      }
    }
  },
  {
    "id": 37,
    "title": "Property and Metamorphic Testing",
    "track": "Intermediate",
    "content": {
      "why": "Test invariants when a language model has many acceptable answers.",
      "explanation": "An invariant should hold across inputs: normalized scores stay in range and normalization is idempotent. Metamorphic tests compare related inputs, such as whitespace variants with the same intended label. These relations need domain justification; paraphrasing can change meaning. Hypothesis generates examples and shrinks failures, while this browser exercise checks a small fixed set of properties.",
      "pythonExample": "def clamp_score(score):\n    return max(0.0, min(1.0, score))\n\nprint(clamp_score(1.4))",
      "goals": [
        "Test invariants when a language model has many acceptable answers.",
        "Implement the function and verify edge cases with assertions."
      ],
      "pitfall": "Generated tests are only as useful as the properties you assert.",
      "lab": "Locally write Hypothesis tests for finite floats and add an explicit NaN/infinity policy. Design three meaning-preserving transformations for a classifier and explain why each relation should hold.",
      "sources": [
        {
          "title": "Hypothesis quickstart",
          "url": "https://hypothesis.readthedocs.io/en/latest/quickstart.html"
        }
      ],
      "exercise": {
        "instructions": "Implement clamp_score(score). Clamp finite numeric inputs to the inclusive range 0.0 to 1.0. Preserve values already in range. Keep the sample print call. Check Answer verifies the output and additional behavior.",
        "starterCode": "def clamp_score(score):\n    # Implement your solution\n    pass\n\nprint(clamp_score(1.4))",
        "solution": "def clamp_score(score):\n    return max(0.0, min(1.0, score))\n\nprint(clamp_score(1.4))",
        "expectedOutput": "1.0",
        "validationCode": "for value in [-100, -0.1, 0, 0.3, 1, 1.1, 100]:\n    result = clamp_score(value)\n    assert 0 <= result <= 1, \"Result must stay in range\"\n    assert clamp_score(result) == result, \"Clamping must be idempotent\"\nassert clamp_score(0.3) == 0.3",
        "hints": [
          "Clamp finite numeric inputs to the inclusive range 0.0 to 1.0. Preserve values already in range.",
          "Combine min and max."
        ]
      }
    }
  },
  {
    "id": 38,
    "title": "Dataset Splits and Evaluation Slices",
    "track": "Intermediate",
    "content": {
      "why": "Keep evaluation cases separate from tuning and expose weak user segments.",
      "explanation": "Duplicate or near-duplicate cases across train and evaluation sets inflate apparent quality. Split by user, document or conversation where related examples would leak. Evaluate slices such as language and difficulty as well as the overall rate. Version each dataset with source, consent, labels and split policy. This exercise checks exact ID overlap; it does not detect semantic duplicates.",
      "pythonExample": "def overlap_ids(train, evaluation):\n    return sorted(set(train) & set(evaluation))\n\nprint(overlap_ids([\"a\", \"b\"], [\"b\", \"c\"]))",
      "goals": [
        "Keep evaluation cases separate from tuning and expose weak user segments.",
        "Implement the function and verify edge cases with assertions."
      ],
      "pitfall": "A high overall pass rate can hide a failing minority-language slice.",
      "lab": "Create a versioned JSONL dataset with case_id, input, reference, language, risk and split. Report per-slice sample counts and quality, audit related-document leakage, and keep a held-out set untouched by prompt tuning.",
      "sources": [
        {
          "title": "Python standard library",
          "url": "https://docs.python.org/3/library/"
        },
        {
          "title": "Ragas evaluation metrics",
          "url": "https://docs.ragas.io/en/latest/concepts/metrics/available_metrics/"
        }
      ],
      "exercise": {
        "instructions": "Implement overlap_ids(train, evaluation). Return a sorted list of unique IDs shared by both splits. Keep the sample print call. Check Answer verifies the output and additional behavior.",
        "starterCode": "def overlap_ids(train, evaluation):\n    # Implement your solution\n    pass\n\nprint(overlap_ids([\"a\", \"b\"], [\"b\", \"c\"]))",
        "solution": "def overlap_ids(train, evaluation):\n    return sorted(set(train) & set(evaluation))\n\nprint(overlap_ids([\"a\", \"b\"], [\"b\", \"c\"]))",
        "expectedOutput": "['b']",
        "validationCode": "assert overlap_ids([], [\"a\"]) == []\nassert overlap_ids([\"b\", \"a\", \"a\"], [\"a\", \"b\"]) == [\"a\", \"b\"]\nassert overlap_ids([\"x\"], [\"y\"]) == []",
        "hints": [
          "Return a sorted list of unique IDs shared by both splits.",
          "Set intersection removes duplicate IDs."
        ]
      }
    }
  },
  {
    "id": 39,
    "title": "Retrieval Metrics: Precision and Recall",
    "track": "Intermediate",
    "content": {
      "why": "Separate retrieval failures from generation failures in a RAG pipeline.",
      "explanation": "For labeled relevant document IDs, precision is retrieved relevant IDs divided by retrieved IDs; recall is retrieved relevant IDs divided by all relevant IDs. This exercise uses unranked unique-ID metrics. It is not the same as every Ragas context metric, which may include ranking or judged relevance. Missing evidence suggests retrieval work; irrelevant extra context suggests filtering or ranking work.",
      "pythonExample": "def retrieval_scores(retrieved, relevant):\n    found, gold = set(retrieved), set(relevant)\n    hits = len(found & gold)\n    precision = hits / len(found) if found else 0.0\n    recall = hits / len(gold) if gold else 0.0\n    return precision, recall\n\nprint(retrieval_scores([\"a\", \"b\", \"c\"], [\"a\", \"c\", \"d\", \"e\"]))",
      "goals": [
        "Separate retrieval failures from generation failures in a RAG pipeline.",
        "Implement the function and verify edge cases with assertions."
      ],
      "pitfall": "Changing top-k can improve recall while adding distracting context.",
      "lab": "Label relevant documents for 20 queries. Compare two top-k settings and report precision, recall, query slices and retrieval latency. Explain the tradeoff and distinguish these ID metrics from framework-specific context metrics.",
      "sources": [
        {
          "title": "Ragas evaluation metrics",
          "url": "https://docs.ragas.io/en/latest/concepts/metrics/available_metrics/"
        }
      ],
      "exercise": {
        "instructions": "Implement retrieval_scores(retrieved, relevant). Return (precision, recall) using unique document IDs; use 0.0 when the denominator is empty. Keep the sample print call. Check Answer verifies the output and additional behavior.",
        "starterCode": "def retrieval_scores(retrieved, relevant):\n    # Implement your solution\n    pass\n\nprint(retrieval_scores([\"a\", \"b\", \"c\"], [\"a\", \"c\", \"d\", \"e\"]))",
        "solution": "def retrieval_scores(retrieved, relevant):\n    found, gold = set(retrieved), set(relevant)\n    hits = len(found & gold)\n    precision = hits / len(found) if found else 0.0\n    recall = hits / len(gold) if gold else 0.0\n    return precision, recall\n\nprint(retrieval_scores([\"a\", \"b\", \"c\"], [\"a\", \"c\", \"d\", \"e\"]))",
        "expectedOutput": "(0.6666666666666666, 0.5)",
        "validationCode": "assert retrieval_scores([], [\"a\"]) == (0.0, 0.0)\nassert retrieval_scores([\"a\", \"a\"], [\"a\"]) == (1.0, 1.0)\nassert retrieval_scores([\"a\"], []) == (0.0, 0.0)",
        "hints": [
          "Return (precision, recall) using unique document IDs; use 0.0 when the denominator is empty.",
          "Compute the intersection size and divide by each set size."
        ]
      }
    }
  },
  {
    "id": 40,
    "title": "Grounding, Correctness and Abstention",
    "track": "Intermediate",
    "content": {
      "why": "Evaluate whether claims are supported and whether the system should decline to answer.",
      "explanation": "Grounding asks whether claims are supported by supplied context; correctness asks whether the answer matches a trusted reference. A grounded answer can still use an outdated document. The exercise uses manually labeled claim IDs; it is a deterministic proxy, not a semantic faithfulness evaluator. An empty answer receives 0 here so silence does not appear perfect; production systems should also track answer coverage and abstention separately.",
      "pythonExample": "def supported_fraction(claims, supported):\n    unique = set(claims)\n    return len(unique & set(supported)) / len(unique) if unique else 0.0\n\nprint(supported_fraction([\"c1\", \"c2\", \"c3\"], [\"c1\", \"c3\"]))",
      "goals": [
        "Evaluate whether claims are supported and whether the system should decline to answer.",
        "Implement the function and verify edge cases with assertions."
      ],
      "pitfall": "Keyword overlap does not establish factual support.",
      "lab": "Build supported, unsupported, contradictory and no-evidence cases. Have humans label claim support. Compare a semantic evaluator with those labels, track coverage, and document when the system must abstain.",
      "sources": [
        {
          "title": "Ragas evaluation metrics",
          "url": "https://docs.ragas.io/en/latest/concepts/metrics/available_metrics/"
        }
      ],
      "exercise": {
        "instructions": "Implement supported_fraction(claims, supported). Return the fraction of unique claims present in the supported list; return 0.0 for no claims. Keep the sample print call. Check Answer verifies the output and additional behavior.",
        "starterCode": "def supported_fraction(claims, supported):\n    # Implement your solution\n    pass\n\nprint(supported_fraction([\"c1\", \"c2\", \"c3\"], [\"c1\", \"c3\"]))",
        "solution": "def supported_fraction(claims, supported):\n    unique = set(claims)\n    return len(unique & set(supported)) / len(unique) if unique else 0.0\n\nprint(supported_fraction([\"c1\", \"c2\", \"c3\"], [\"c1\", \"c3\"]))",
        "expectedOutput": "0.6666666666666666",
        "validationCode": "assert supported_fraction([], []) == 0.0\nassert supported_fraction([\"a\", \"a\"], [\"a\"]) == 1.0\nassert supported_fraction([\"a\"], [\"b\"]) == 0.0",
        "hints": [
          "Return the fraction of unique claims present in the supported list; return 0.0 for no claims.",
          "Use sets and guard the empty denominator."
        ]
      }
    }
  },
  {
    "id": 41,
    "title": "Calibrating an LLM Judge",
    "track": "Advanced",
    "content": {
      "why": "Measure evaluator mistakes before trusting automated release scores.",
      "explanation": "A judge is another fallible model. Define anchored criteria and examples, collect independent human labels and audit disagreements. Agreement alone can hide imbalance, so inspect false accepts and false rejects by slice. Vary answer ordering, verbosity and judge configuration to check bias. This exercise computes exact binary agreement; it does not claim chance correction or judge reliability by itself.",
      "pythonExample": "def agreement(human, judge):\n    if len(human) != len(judge) or not human:\n        raise ValueError(\"Need equal nonempty label lists\")\n    return sum(a == b for a, b in zip(human, judge)) / len(human)\n\nprint(agreement([True, False, True, False], [True, True, True, False]))",
      "goals": [
        "Measure evaluator mistakes before trusting automated release scores.",
        "Implement the function and verify edge cases with assertions."
      ],
      "pitfall": "Using the same model for generation and judging can introduce shared blind spots.",
      "lab": "Create a rubric with 0/1/2 anchors and 30 independently labeled answers. Produce a confusion matrix and disagreement review. Test answer-order and verbosity bias. Version rubric, judge model and sampling settings.",
      "sources": [
        {
          "title": "Ragas evaluation metrics",
          "url": "https://docs.ragas.io/en/latest/concepts/metrics/available_metrics/"
        }
      ],
      "exercise": {
        "instructions": "Implement agreement(human, judge). Return matching labels divided by total labels. Raise ValueError for empty or unequal-length lists. Keep the sample print call. Check Answer verifies the output and additional behavior.",
        "starterCode": "def agreement(human, judge):\n    # Implement your solution\n    pass\n\nprint(agreement([True, False, True, False], [True, True, True, False]))",
        "solution": "def agreement(human, judge):\n    if len(human) != len(judge) or not human:\n        raise ValueError(\"Need equal nonempty label lists\")\n    return sum(a == b for a, b in zip(human, judge)) / len(human)\n\nprint(agreement([True, False, True, False], [True, True, True, False]))",
        "expectedOutput": "0.75",
        "validationCode": "assert agreement([True], [False]) == 0.0\nassert agreement([False], [False]) == 1.0\nfor human, judge in [([], []), ([True], [])]:\n    try:\n        agreement(human, judge)\n    except ValueError:\n        pass\n    else:\n        raise AssertionError(\"Reject empty or mismatched labels\")",
        "hints": [
          "Return matching labels divided by total labels. Raise ValueError for empty or unequal-length lists.",
          "Validate lengths before zip to avoid silently ignoring labels."
        ]
      }
    }
  },
  {
    "id": 42,
    "title": "Repeated Trials and Confidence Intervals",
    "track": "Advanced",
    "content": {
      "why": "Express uncertainty rather than treating one stochastic run as conclusive.",
      "explanation": "A pass proportion is an estimate. The Wilson interval gives an approximate binomial uncertainty range that behaves better than a naive normal interval near 0 and 1. The default z=1.96 corresponds to an approximate 95% interval. Independent trials are an assumption: correlated runs and heterogeneous cases require more careful analysis, such as case-level resampling. A fixed seed is metadata, not a universal determinism guarantee.",
      "pythonExample": "import math\n\ndef wilson_interval(passed, total):\n    if total <= 0 or not 0 <= passed <= total:\n        raise ValueError(\"Invalid counts\")\n    z = 1.96\n    p = passed / total\n    denominator = 1 + z*z/total\n    center = (p + z*z/(2*total)) / denominator\n    margin = z * math.sqrt(p*(1-p)/total + z*z/(4*total*total)) / denominator\n    return center - margin, center + margin\n\nlow, high = wilson_interval(8, 10)\nprint(f\"{low:.3f} {high:.3f}\")",
      "goals": [
        "Express uncertainty rather than treating one stochastic run as conclusive.",
        "Implement the function and verify edge cases with assertions."
      ],
      "pitfall": "A narrow interval from repeated copies of one prompt does not establish broad coverage.",
      "lab": "Run paired baseline/candidate evaluations on the same held-out cases with repeated trials. Report raw counts, uncertainty, per-case disagreements and correlation assumptions. Explain why an overlapping interval alone is not a complete significance test.",
      "sources": [
        {
          "title": "Python standard library",
          "url": "https://docs.python.org/3/library/"
        }
      ],
      "exercise": {
        "instructions": "Implement wilson_interval(passed, total). Implement the Wilson interval using the formula in the example and reject invalid counts. Return (lower, upper). Keep the sample print call. Check Answer verifies the output and additional behavior.",
        "starterCode": "def wilson_interval(passed, total):\n    # Implement your solution\n    pass\n\nlow, high = wilson_interval(8, 10)\nprint(f\"{low:.3f} {high:.3f}\")",
        "solution": "import math\n\ndef wilson_interval(passed, total):\n    if total <= 0 or not 0 <= passed <= total:\n        raise ValueError(\"Invalid counts\")\n    z = 1.96\n    p = passed / total\n    denominator = 1 + z*z/total\n    center = (p + z*z/(2*total)) / denominator\n    margin = z * math.sqrt(p*(1-p)/total + z*z/(4*total*total)) / denominator\n    return center - margin, center + margin\n\nlow, high = wilson_interval(8, 10)\nprint(f\"{low:.3f} {high:.3f}\")",
        "expectedOutput": "0.490 0.943",
        "validationCode": "low, high = wilson_interval(0, 10)\nassert abs(low) < 1e-10 and 0 < high < 1\nlow, high = wilson_interval(10, 10)\nassert 0 < low < 1 and abs(high - 1) < 1e-10\ntry:\n    wilson_interval(1, 0)\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError(\"Reject invalid totals\")",
        "hints": [
          "Implement the Wilson interval using the formula in the example and reject invalid counts. Return (lower, upper).",
          "Import math, compute p, denominator, center and margin."
        ]
      }
    }
  },
  {
    "id": 43,
    "title": "Agent Tool Authorization and Arguments",
    "track": "Advanced",
    "content": {
      "why": "Evaluate tool calls as actions with permissions, not only as generated text.",
      "explanation": "Check tool names, arguments, authorization, ordering and resulting state separately. A correct final answer can conceal an unauthorized tool call. DeepEval offers tool-correctness metrics with configurable matching behavior; an evaluator is not an authorization boundary. Enforce permissions in the executor. The toy exercise uses one refund tool with a 100-unit limit and explicit approval.",
      "pythonExample": "def authorized(call):\n    amount = call.get(\"amount\")\n    return (call.get(\"tool\") == \"refund\"\n            and call.get(\"approved\") is True\n            and type(amount) in (int, float)\n            and 0 < amount <= 100)\n\nprint(authorized({\"tool\": \"refund\", \"amount\": 50, \"approved\": True}))",
      "goals": [
        "Evaluate tool calls as actions with permissions, not only as generated text.",
        "Implement the function and verify edge cases with assertions."
      ],
      "pitfall": "A tool-selection score cannot replace server-side permission checks.",
      "lab": "Use a sandbox refund tool and build traces for wrong tool, wrong recipient, missing approval, duplicate writes and valid recovery. Assert the executor blocks unauthorized calls and compare final state with the intended business outcome.",
      "sources": [
        {
          "title": "DeepEval tool correctness",
          "url": "https://deepeval.com/docs/metrics-tool-correctness"
        },
        {
          "title": "OWASP LLM application risks",
          "url": "https://genai.owasp.org/llm-top-10/"
        }
      ],
      "exercise": {
        "instructions": "Implement authorized(call). Accept only refund calls with approved exactly True and numeric amount greater than 0 and at most 100; reject booleans as amounts. Keep the sample print call. Check Answer verifies the output and additional behavior.",
        "starterCode": "def authorized(call):\n    # Implement your solution\n    pass\n\nprint(authorized({\"tool\": \"refund\", \"amount\": 50, \"approved\": True}))",
        "solution": "def authorized(call):\n    amount = call.get(\"amount\")\n    return (call.get(\"tool\") == \"refund\"\n            and call.get(\"approved\") is True\n            and type(amount) in (int, float)\n            and 0 < amount <= 100)\n\nprint(authorized({\"tool\": \"refund\", \"amount\": 50, \"approved\": True}))",
        "expectedOutput": "True",
        "validationCode": "assert not authorized({\"tool\": \"delete\", \"amount\": 50, \"approved\": True})\nassert not authorized({\"tool\": \"refund\", \"amount\": 50, \"approved\": False})\nassert not authorized({\"tool\": \"refund\", \"amount\": True, \"approved\": True})\nassert not authorized({\"tool\": \"refund\", \"amount\": 101, \"approved\": True})",
        "hints": [
          "Accept only refund calls with approved exactly True and numeric amount greater than 0 and at most 100; reject booleans as amounts.",
          "Validate each field independently and combine conditions."
        ]
      }
    }
  },
  {
    "id": 44,
    "title": "Prompt Injection and Data Boundary Tests",
    "track": "Advanced",
    "content": {
      "why": "Test whether untrusted retrieved content can trigger forbidden actions or data disclosure.",
      "explanation": "Treat web pages, documents and tool responses as untrusted input. Put authorization checks outside the model and restrict tool/data access. Test direct and indirect instruction attempts against observable outcomes: unauthorized action, secret disclosure or policy violation. This exercise validates a tool-boundary allowlist; it does not detect prompt injection by scanning text.",
      "pythonExample": "def allowed_tools(requested, permitted):\n    return all(tool in set(permitted) for tool in requested)\n\nprint(allowed_tools([\"search\", \"read\"], [\"search\", \"read\"]))",
      "goals": [
        "Test whether untrusted retrieved content can trigger forbidden actions or data disclosure.",
        "Implement the function and verify edge cases with assertions."
      ],
      "pitfall": "Blocking phrases such as ignore instructions is not a complete security control.",
      "lab": "In an authorized sandbox, place instruction-like text inside a retrieved document. Use synthetic canary secrets. Assert no unauthorized tool executes and no canary appears in the final response or unredacted logs. Record attack surface, expected behavior, actual behavior and remediation.",
      "sources": [
        {
          "title": "OWASP LLM application risks",
          "url": "https://genai.owasp.org/llm-top-10/"
        }
      ],
      "exercise": {
        "instructions": "Implement allowed_tools(requested, permitted). Return True only if every requested tool is in the permitted allowlist; an empty request is allowed. Keep the sample print call. Check Answer verifies the output and additional behavior.",
        "starterCode": "def allowed_tools(requested, permitted):\n    # Implement your solution\n    pass\n\nprint(allowed_tools([\"search\", \"read\"], [\"search\", \"read\"]))",
        "solution": "def allowed_tools(requested, permitted):\n    return all(tool in set(permitted) for tool in requested)\n\nprint(allowed_tools([\"search\", \"read\"], [\"search\", \"read\"]))",
        "expectedOutput": "True",
        "validationCode": "assert not allowed_tools([\"search\", \"export_secrets\"], [\"search\", \"read\"])\nassert allowed_tools([], [\"read\"])\nassert not allowed_tools([\"write\"], [])",
        "hints": [
          "Return True only if every requested tool is in the permitted allowlist; an empty request is allowed.",
          "Use all with membership checks."
        ]
      }
    }
  },
  {
    "id": 45,
    "title": "Privacy-Safe Evaluation Artifacts",
    "track": "Advanced",
    "content": {
      "why": "Prevent debugging and evaluation reports from exposing sensitive customer fields.",
      "explanation": "Prefer minimal structured artifacts over full conversation dumps. Define an allowlist and replace sensitive fields before persistence. Regex redaction is incomplete across languages and formats; metadata, nested fields and traces also need review. The exercise deliberately tests a simple exact-key filter. Production handling needs a data inventory, retention policy and realistic redaction tests.",
      "pythonExample": "def safe_artifact(record):\n    return {key: record[key] for key in (\"case_id\", \"score\", \"latency_ms\") if key in record}\n\nprint(safe_artifact({\"case_id\": \"t1\", \"score\": 0.8, \"email\": \"fake@example.test\"}))",
      "goals": [
        "Prevent debugging and evaluation reports from exposing sensitive customer fields.",
        "Implement the function and verify edge cases with assertions."
      ],
      "pitfall": "A clean final response does not imply clean traces or logs.",
      "lab": "Create synthetic nested traces with canary emails, access tokens and tenant IDs. Build tests for logging, exports and error paths. Document which fields are retained, redacted or discarded, and verify raw data is not written before redaction.",
      "sources": [
        {
          "title": "OWASP LLM application risks",
          "url": "https://genai.owasp.org/llm-top-10/"
        }
      ],
      "exercise": {
        "instructions": "Implement safe_artifact(record). Return a new dictionary containing only case_id, score and latency_ms when present. Keep the sample print call. Check Answer verifies the output and additional behavior.",
        "starterCode": "def safe_artifact(record):\n    # Implement your solution\n    pass\n\nprint(safe_artifact({\"case_id\": \"t1\", \"score\": 0.8, \"email\": \"fake@example.test\"}))",
        "solution": "def safe_artifact(record):\n    return {key: record[key] for key in (\"case_id\", \"score\", \"latency_ms\") if key in record}\n\nprint(safe_artifact({\"case_id\": \"t1\", \"score\": 0.8, \"email\": \"fake@example.test\"}))",
        "expectedOutput": "{'case_id': 't1', 'score': 0.8}",
        "validationCode": "assert safe_artifact({\"secret\": \"canary\"}) == {}\nassert safe_artifact({\"latency_ms\": 40, \"prompt\": \"private\"}) == {\"latency_ms\": 40}\nassert safe_artifact({}) == {}",
        "hints": [
          "Return a new dictionary containing only case_id, score and latency_ms when present.",
          "Iterate over permitted keys, not over all record values."
        ]
      }
    }
  },
  {
    "id": 46,
    "title": "Latency Percentiles and Cost Budgets",
    "track": "Advanced",
    "content": {
      "why": "Measure tail latency and resource use alongside answer quality.",
      "explanation": "Averages hide slow users. This exercise implements the nearest-rank percentile: sort n values and select ceil(q*n), using the first value for q=0. Other libraries may interpolate, so report the method. Separate cold starts, time to first token and total completion time. Provider cost accounting also needs input/output tokens, cache behavior and a dated price source.",
      "pythonExample": "import math\n\ndef percentile(values, q):\n    if not values or not 0 <= q <= 1:\n        raise ValueError(\"Invalid percentile\")\n    ordered = sorted(values)\n    index = max(0, math.ceil(q * len(ordered)) - 1)\n    return ordered[index]\n\nprint(percentile([100, 200, 300, 400, 900], 0.95))",
      "goals": [
        "Measure tail latency and resource use alongside answer quality.",
        "Implement the function and verify edge cases with assertions."
      ],
      "pitfall": "A p99 from a tiny sample is unstable and can be misleading.",
      "lab": "Produce a benchmark report with sample size, concurrency, cold/warm settings, p50/p95/p99, error rate, quality and cost per successful task. Add timeout and load-saturation tests. Record the percentile method and provider pricing date.",
      "sources": [
        {
          "title": "Python standard library",
          "url": "https://docs.python.org/3/library/"
        }
      ],
      "exercise": {
        "instructions": "Implement percentile(values, q). Implement the nearest-rank percentile for nonempty numeric samples and q between 0 and 1. Raise ValueError otherwise. Keep the sample print call. Check Answer verifies the output and additional behavior.",
        "starterCode": "def percentile(values, q):\n    # Implement your solution\n    pass\n\nprint(percentile([100, 200, 300, 400, 900], 0.95))",
        "solution": "import math\n\ndef percentile(values, q):\n    if not values or not 0 <= q <= 1:\n        raise ValueError(\"Invalid percentile\")\n    ordered = sorted(values)\n    index = max(0, math.ceil(q * len(ordered)) - 1)\n    return ordered[index]\n\nprint(percentile([100, 200, 300, 400, 900], 0.95))",
        "expectedOutput": "900",
        "validationCode": "assert percentile([3, 1, 2], 0) == 1\nassert percentile([3, 1, 2], 1) == 3\nassert percentile([10], 0.95) == 10\ntry:\n    percentile([], 0.95)\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError(\"Reject empty samples\")",
        "hints": [
          "Implement the nearest-rank percentile for nonempty numeric samples and q between 0 and 1. Raise ValueError otherwise.",
          "Import math and clamp the 0-based index to at least zero."
        ]
      }
    }
  },
  {
    "id": 47,
    "title": "Trace-Based Failure Diagnosis",
    "track": "Advanced",
    "content": {
      "why": "Locate the first failing pipeline stage and distinguish model errors from infrastructure errors.",
      "explanation": "A trace connects retrieval, model calls and tool execution using a case ID and ordered spans. Store stage status, duration and sanitized metadata. An error in a tool can surface as an incorrect final answer; blaming the generator alone misses the cause. This exercise finds the earliest explicitly failed span in recorded order, not the true causal root of every failure.",
      "pythonExample": "def first_failure(spans):\n    for span in spans:\n        if span.get(\"status\") == \"error\":\n            return span[\"stage\"]\n    return None\n\nprint(first_failure([{\"stage\": \"retrieve\", \"status\": \"ok\"}, {\"stage\": \"tool\", \"status\": \"error\"}]))",
      "goals": [
        "Locate the first failing pipeline stage and distinguish model errors from infrastructure errors.",
        "Implement the function and verify edge cases with assertions."
      ],
      "pitfall": "The earliest logged error is evidence, not automatic proof of root cause.",
      "lab": "Instrument a local RAG-plus-tool workflow with case IDs and sanitized spans. Inject retrieval timeout, malformed model output and tool denial. Produce a report linking symptoms, first failing span, likely cause and a regression test.",
      "sources": [
        {
          "title": "DeepEval tool correctness",
          "url": "https://deepeval.com/docs/metrics-tool-correctness"
        },
        {
          "title": "Python standard library",
          "url": "https://docs.python.org/3/library/"
        }
      ],
      "exercise": {
        "instructions": "Implement first_failure(spans). Return the stage of the first span with status error, or None if no stage failed. Keep the sample print call. Check Answer verifies the output and additional behavior.",
        "starterCode": "def first_failure(spans):\n    # Implement your solution\n    pass\n\nprint(first_failure([{\"stage\": \"retrieve\", \"status\": \"ok\"}, {\"stage\": \"tool\", \"status\": \"error\"}]))",
        "solution": "def first_failure(spans):\n    for span in spans:\n        if span.get(\"status\") == \"error\":\n            return span[\"stage\"]\n    return None\n\nprint(first_failure([{\"stage\": \"retrieve\", \"status\": \"ok\"}, {\"stage\": \"tool\", \"status\": \"error\"}]))",
        "expectedOutput": "tool",
        "validationCode": "assert first_failure([]) is None\nassert first_failure([{\"stage\": \"llm\", \"status\": \"ok\"}]) is None\nassert first_failure([{\"stage\": \"retrieve\", \"status\": \"error\"}, {\"stage\": \"llm\", \"status\": \"error\"}]) == \"retrieve\"",
        "hints": [
          "Return the stage of the first span with status error, or None if no stage failed.",
          "Use a loop and return immediately on the first match."
        ]
      }
    }
  },
  {
    "id": 48,
    "title": "Multi-Metric Regression Release Gates",
    "track": "Advanced",
    "content": {
      "why": "Block regressions using explicit quality, security and performance criteria.",
      "explanation": "Release decisions should not rely on one average score. Define quality floors by slice, security hard failures and latency/cost budgets before evaluating a candidate. Compare matched cases and inspect newly failing cases. The simplified gate below uses point estimates with fixed demonstration thresholds; real release gates also need minimum sample sizes, uncertainty and override audit trails.",
      "pythonExample": "def release_gate(report):\n    return (report[\"quality\"] >= 0.9\n            and report[\"security_failures\"] == 0\n            and report[\"p95_ms\"] <= 2000\n            and report[\"cost\"] <= 1.0)\n\nprint(release_gate({\"quality\": 0.93, \"security_failures\": 0, \"p95_ms\": 1800, \"cost\": 0.8}))",
      "goals": [
        "Block regressions using explicit quality, security and performance criteria.",
        "Implement the function and verify edge cases with assertions."
      ],
      "pitfall": "A flaky evaluator can turn a release gate into random blocking.",
      "lab": "Create a CI evaluation job that emits versioned JSON results and returns nonzero when a gate fails. Separate fast deterministic tests from scheduled live evaluations. Deliver baseline/candidate comparisons, slice gates and explicit handling of provider outages.",
      "sources": [
        {
          "title": "Python standard library",
          "url": "https://docs.python.org/3/library/"
        },
        {
          "title": "pytest monkeypatch",
          "url": "https://docs.pytest.org/en/stable/how-to/monkeypatch.html"
        }
      ],
      "exercise": {
        "instructions": "Implement release_gate(report). Accept quality at least 0.9, zero security failures, p95_ms at most 2000 and cost at most 1.0. All conditions must pass. Keep the sample print call. Check Answer verifies the output and additional behavior.",
        "starterCode": "def release_gate(report):\n    # Implement your solution\n    pass\n\nprint(release_gate({\"quality\": 0.93, \"security_failures\": 0, \"p95_ms\": 1800, \"cost\": 0.8}))",
        "solution": "def release_gate(report):\n    return (report[\"quality\"] >= 0.9\n            and report[\"security_failures\"] == 0\n            and report[\"p95_ms\"] <= 2000\n            and report[\"cost\"] <= 1.0)\n\nprint(release_gate({\"quality\": 0.93, \"security_failures\": 0, \"p95_ms\": 1800, \"cost\": 0.8}))",
        "expectedOutput": "True",
        "validationCode": "base = {\"quality\": 0.9, \"security_failures\": 0, \"p95_ms\": 2000, \"cost\": 1.0}\nassert release_gate(base)\nfor key, value in [(\"quality\", 0.89), (\"security_failures\", 1), (\"p95_ms\", 2001), (\"cost\", 1.01)]:\n    assert not release_gate(dict(base, **{key: value})), f\"Enforce {key}\"",
        "hints": [
          "Accept quality at least 0.9, zero security failures, p95_ms at most 2000 and cost at most 1.0. All conditions must pass.",
          "Use and rather than or to combine release requirements."
        ]
      }
    }
  },
  {
    "id": 49,
    "title": "Capstone: Audit-Ready AI QA Report",
    "track": "Advanced",
    "content": {
      "why": "Combine quality, uncertainty, safety and reproducibility into a reviewable test report.",
      "explanation": "An evaluation report needs traceable identities: model version, prompt version, dataset version and evaluator version. Include failed case IDs, slice results, latency/cost measurements and known limits. The browser capstone is an offline report builder using already labeled outcomes; the real-world lab integrates a local pipeline, provider adapter and CI. No API key belongs in this public browser app.",
      "pythonExample": "def build_report(cases, versions):\n    if not cases:\n        raise ValueError(\"No cases\")\n    required = {\"model\", \"prompt\", \"dataset\", \"evaluator\"}\n    if not required <= versions.keys():\n        raise ValueError(\"Missing versions\")\n    failed = sorted(case[\"id\"] for case in cases if not case[\"passed\"])\n    return {\"total\": len(cases), \"pass_rate\": (len(cases) - len(failed)) / len(cases),\n            \"failed_ids\": failed, \"versions\": dict(versions)}\n\nversions = {\"model\": \"m1\", \"prompt\": \"p1\", \"dataset\": \"d1\", \"evaluator\": \"e1\"}\nreport = build_report([{\"id\": \"b\", \"passed\": False}, {\"id\": \"a\", \"passed\": True}], versions)\nprint(report[\"pass_rate\"], report[\"failed_ids\"])",
      "goals": [
        "Combine quality, uncertainty, safety and reproducibility into a reviewable test report.",
        "Implement the function and verify edge cases with assertions."
      ],
      "pitfall": "Passing this offline capstone is practice; it does not certify production readiness.",
      "lab": "Deliver a repository with a provider adapter, held-out JSONL dataset, deterministic unit tests, authorized live integration tests, RAG and tool evaluations, judge calibration, security cases, slice/uncertainty analysis and CI gates. Include a README with setup, reproducibility metadata, sanitized sample report, failure triage and known limitations. Review criteria: reproducible execution, meaningful negative tests, traceability and justified release decisions.",
      "sources": [
        {
          "title": "Python standard library",
          "url": "https://docs.python.org/3/library/"
        },
        {
          "title": "Ragas evaluation metrics",
          "url": "https://docs.ragas.io/en/latest/concepts/metrics/available_metrics/"
        },
        {
          "title": "DeepEval tool correctness",
          "url": "https://deepeval.com/docs/metrics-tool-correctness"
        },
        {
          "title": "OWASP LLM application risks",
          "url": "https://genai.owasp.org/llm-top-10/"
        }
      ],
      "exercise": {
        "instructions": "Implement build_report(cases, versions). Return total, pass_rate, sorted failed_ids and a copy of versions. Require nonempty cases and model/prompt/dataset/evaluator version keys; raise ValueError if missing. Keep the sample print call. Check Answer verifies the output and additional behavior.",
        "starterCode": "def build_report(cases, versions):\n    # Implement your solution\n    pass\n\nversions = {\"model\": \"m1\", \"prompt\": \"p1\", \"dataset\": \"d1\", \"evaluator\": \"e1\"}\nreport = build_report([{\"id\": \"b\", \"passed\": False}, {\"id\": \"a\", \"passed\": True}], versions)\nprint(report[\"pass_rate\"], report[\"failed_ids\"])",
        "solution": "def build_report(cases, versions):\n    if not cases:\n        raise ValueError(\"No cases\")\n    required = {\"model\", \"prompt\", \"dataset\", \"evaluator\"}\n    if not required <= versions.keys():\n        raise ValueError(\"Missing versions\")\n    failed = sorted(case[\"id\"] for case in cases if not case[\"passed\"])\n    return {\"total\": len(cases), \"pass_rate\": (len(cases) - len(failed)) / len(cases),\n            \"failed_ids\": failed, \"versions\": dict(versions)}\n\nversions = {\"model\": \"m1\", \"prompt\": \"p1\", \"dataset\": \"d1\", \"evaluator\": \"e1\"}\nreport = build_report([{\"id\": \"b\", \"passed\": False}, {\"id\": \"a\", \"passed\": True}], versions)\nprint(report[\"pass_rate\"], report[\"failed_ids\"])",
        "expectedOutput": "0.5 ['b']",
        "validationCode": "assert build_report([{\"id\": \"x\", \"passed\": True}], versions)[\"pass_rate\"] == 1.0\nassert build_report([{\"id\": \"z\", \"passed\": False}, {\"id\": \"a\", \"passed\": False}], versions)[\"failed_ids\"] == [\"a\", \"z\"]\nfor cases, metadata in [([], versions), ([{\"id\": \"x\", \"passed\": True}], {})]:\n    try:\n        build_report(cases, metadata)\n    except ValueError:\n        pass\n    else:\n        raise AssertionError(\"Require cases and all version fields\")",
        "hints": [
          "Return total, pass_rate, sorted failed_ids and a copy of versions. Require nonempty cases and model/prompt/dataset/evaluator version keys; raise ValueError if missing.",
          "Count failed cases and derive pass rate from total minus failures."
        ]
      }
    }
  }
];
LESSONS.push(...ADVANCED_LESSONS);
