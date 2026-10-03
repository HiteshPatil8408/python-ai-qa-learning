// Original interview prompts and answer rubrics.
const INTERVIEW_QUESTIONS = [
  {
    "id": 1,
    "category": "Python & Automation",
    "level": "Intermediate",
    "question": "How would you test an LLM API client without spending tokens?",
    "answer": "Inject a provider interface and use fakes or mocks for deterministic unit tests. Cover success, malformed output, timeout, throttling and authentication failures. Assert call arguments and retry counts. Keep a small separate live contract suite because mocks can drift.",
    "followUp": "Where would you patch a dependency, and why?"
  },
  {
    "id": 2,
    "category": "Python & Automation",
    "level": "Intermediate",
    "question": "What is the difference between a fixture and a mock?",
    "answer": "A fixture manages test setup and teardown; a mock substitutes a dependency and can record interactions. A fixture can provide a mock client. Choose narrow fixture scope for mutable state and ensure cleanup even when the test fails.",
    "followUp": "What failure could a session-scoped mutable fixture introduce?"
  },
  {
    "id": 3,
    "category": "Python & Automation",
    "level": "Intermediate",
    "question": "What should a parametrized AI API test cover?",
    "answer": "Use a table of valid requests, boundary values, missing fields, invalid types, malformed responses and failures. Give cases meaningful IDs and assert specific outcomes or exception types. Keep independent cases isolated rather than depending on execution order.",
    "followUp": "How do you distinguish test-data failure from application failure?"
  },
  {
    "id": 4,
    "category": "Python & Automation",
    "level": "Intermediate",
    "question": "Why is checking only printed output insufficient?",
    "answer": "A learner or implementation can hardcode the expected string. Verify returned values, input variations, exception behavior and observable side effects. For generated text, combine deterministic contract checks with task-specific semantic evaluation and human review.",
    "followUp": "What are two negative cases for a confidence-score validator?"
  },
  {
    "id": 5,
    "category": "Python & Automation",
    "level": "Advanced",
    "question": "How do you test retries without slow flaky sleeps?",
    "answer": "Inject the clock, sleep function and provider responses. Simulate transient then successful responses and exhaustion. Assert attempt count, requested delays, deadline handling and exception propagation. Verify non-retryable errors stop immediately and write retries use idempotency.",
    "followUp": "How can a timeout occur after a write succeeded?"
  },
  {
    "id": 6,
    "category": "Python & Automation",
    "level": "Advanced",
    "question": "How would you test concurrent model requests?",
    "answer": "Use a fake asynchronous client with controlled completion ordering. Check semaphore limits, result-to-case association, cancellation, timeout behavior and isolation. Assert concurrency rather than relying on wall-clock races. Load testing with the real provider is a separate concern.",
    "followUp": "How would you preserve case order with out-of-order responses?"
  },
  {
    "id": 7,
    "category": "Evaluation Design",
    "level": "Intermediate",
    "question": "How is AI testing different from traditional deterministic testing?",
    "answer": "Multiple answers can satisfy the task, and quality varies across prompts and runs. Keep deterministic tests for contracts and permissions, then use labeled datasets, semantic rubrics, repeated trials and human audits for output quality. Record model, prompt and evaluator versions.",
    "followUp": "Which checks should remain deterministic?"
  },
  {
    "id": 8,
    "category": "Evaluation Design",
    "level": "Intermediate",
    "question": "What belongs in a golden evaluation dataset?",
    "answer": "Representative real tasks, difficult boundaries, negative cases and important user slices, with stable IDs and trusted labels or rubrics. Include provenance and versioning. Separate tuning from held-out evaluation and avoid related-user or related-document leakage.",
    "followUp": "How would you handle ambiguous human labels?"
  },
  {
    "id": 9,
    "category": "Evaluation Design",
    "level": "Advanced",
    "question": "How do you choose an evaluation metric?",
    "answer": "Start from the user task and failure cost. Define acceptable behavior and choose checks that measure it: schema validity, factual correctness, retrieval quality, task success or authorized tool use. Validate semantic metrics against human labels and report slice performance.",
    "followUp": "Why might similarity be a poor metric for a support answer?"
  },
  {
    "id": 10,
    "category": "Evaluation Design",
    "level": "Advanced",
    "question": "How do you calibrate an LLM-as-a-judge evaluator?",
    "answer": "Write anchored rubric examples, obtain independent human labels and review disagreements. Measure false accepts and rejects, especially on high-risk slices. Test ordering and verbosity bias, and version judge settings. Recalibrate after changes rather than assuming one judge score is ground truth.",
    "followUp": "What would you do if the judge favors longer incorrect answers?"
  },
  {
    "id": 11,
    "category": "Evaluation Design",
    "level": "Advanced",
    "question": "What does an 80% pass rate from ten runs tell you?",
    "answer": "It is a noisy estimate based on a small sample. Report counts and an appropriate uncertainty interval, describe independence assumptions and diversify cases. Repeated trials on one prompt do not measure dataset coverage. Compare candidates on matched cases rather than relying on one aggregate.",
    "followUp": "What changes when trials are correlated?"
  },
  {
    "id": 12,
    "category": "Evaluation Design",
    "level": "Advanced",
    "question": "How can overall quality improve while a release gets worse?",
    "answer": "A large easy slice can dominate the mean while a smaller critical slice regresses. Track sample counts and results by language, risk, task and customer segment. Use minimum floors or hard gates for important slices and inspect newly failing cases.",
    "followUp": "How would you gate a slice with very few examples?"
  },
  {
    "id": 13,
    "category": "Evaluation Design",
    "level": "Advanced",
    "question": "What are property and metamorphic tests for AI systems?",
    "answer": "Property tests check invariants over generated inputs. Metamorphic tests compare related inputs when exact outputs are hard to specify, such as harmless whitespace changes preserving a classification. Justify each relation and avoid assuming every paraphrase preserves meaning.",
    "followUp": "Give a transformation that could accidentally change the task."
  },
  {
    "id": 14,
    "category": "RAG",
    "level": "Intermediate",
    "question": "What is the difference between retrieval precision and recall?",
    "answer": "For a labeled relevant-document set, precision measures how many retrieved documents are relevant; recall measures how many relevant documents were retrieved. Evaluate at a stated cutoff and explain ranking or deduplication policies. Framework context metrics may have different definitions.",
    "followUp": "How might increasing top-k affect both metrics?"
  },
  {
    "id": 15,
    "category": "RAG",
    "level": "Intermediate",
    "question": "How do faithfulness and answer correctness differ?",
    "answer": "Faithfulness checks support from supplied context; correctness checks the answer against trusted truth or a reference. An answer grounded in outdated evidence can be wrong, and an unsupported answer can coincidentally be correct. Test both and inspect the source quality.",
    "followUp": "What should happen when the context lacks an answer?"
  },
  {
    "id": 16,
    "category": "RAG",
    "level": "Advanced",
    "question": "A RAG answer is wrong. How would you isolate the failure?",
    "answer": "Inspect the query, relevant evidence, retrieved ranking, context assembly and generated claims. If evidence is absent, investigate retrieval; if present but ignored, investigate generation or context placement. Check corpus freshness, tenant filters and citation support before changing the prompt.",
    "followUp": "How would you test retrieval independently of generation?"
  },
  {
    "id": 17,
    "category": "RAG",
    "level": "Advanced",
    "question": "How would you test citations and abstention?",
    "answer": "Verify cited IDs exist and are accessible to the user, then check whether cited passages support specific claims. Add no-evidence and contradictory-evidence cases. Measure unsupported claims, answer coverage and correct abstention together so empty answers cannot game quality.",
    "followUp": "Can a valid citation ID still accompany a hallucination?"
  },
  {
    "id": 18,
    "category": "RAG",
    "level": "Advanced",
    "question": "How would you test tenant isolation in retrieval?",
    "answer": "Create synthetic documents for distinct tenants and users with different access rights. Query across overlapping content and assert retrieved documents, cached results, citations and tool responses never cross authorization boundaries. Enforce access in retrieval and storage, then test it directly.",
    "followUp": "What cache key would risk cross-tenant leakage?"
  },
  {
    "id": 19,
    "category": "Agents & Security",
    "level": "Intermediate",
    "question": "What should an agent evaluation inspect besides its final answer?",
    "answer": "Tool selection, argument validity, authorization, sequence, retries, termination and resulting state. A correct answer may conceal unsafe intermediate actions. Inspect traces and business outcomes, and keep executor-side permissions separate from evaluator judgments.",
    "followUp": "Can a different valid tool sequence still succeed?"
  },
  {
    "id": 20,
    "category": "Agents & Security",
    "level": "Advanced",
    "question": "How do you test an agent that can issue refunds?",
    "answer": "Use a sandbox tool with synthetic accounts. Cover approved refunds, wrong recipient, excessive amount, missing approval, duplicate execution and partial failures. Assert both authorized calls and final balances. Require server-side checks and idempotency rather than trusting model text.",
    "followUp": "What if the model says it refunded but no tool ran?"
  },
  {
    "id": 21,
    "category": "Agents & Security",
    "level": "Advanced",
    "question": "What is indirect prompt injection and how would you test it?",
    "answer": "An instruction attempt arrives through untrusted external content such as a document or tool response. In an authorized sandbox, place controlled instruction-like text in that surface and check for secret disclosure, unauthorized tools or task diversion. Record observable outcomes and enforce least privilege.",
    "followUp": "Why is a blocklist of suspicious words insufficient?"
  },
  {
    "id": 22,
    "category": "Agents & Security",
    "level": "Advanced",
    "question": "How do you test privacy in AI evaluation logs?",
    "answer": "Use synthetic canary sensitive values across prompts, nested traces, exceptions and exports. Verify minimization and redaction before persistence, including error paths and metadata. Check retention and access policy. A sanitized response is insufficient if raw traces still contain the canary.",
    "followUp": "How would you test logging when an exception interrupts the request?"
  },
  {
    "id": 23,
    "category": "Agents & Security",
    "level": "Advanced",
    "question": "How should you score a safe refusal?",
    "answer": "Compare it with the task and policy. A refusal can be correct for a disallowed task and a failure for an allowed one. Track both unsafe compliance and unnecessary refusal on labeled cases, including benign inputs that resemble attacks.",
    "followUp": "How would you detect over-refusal in a minority-language slice?"
  },
  {
    "id": 24,
    "category": "Production & CI",
    "level": "Intermediate",
    "question": "What belongs in an AI regression report?",
    "answer": "Case IDs, dataset and prompt versions, model configuration, evaluator version, raw outcomes, slice summaries and sanitized failure details. Add latency, cost and sample counts. Explain uncertainty and known limitations so another reviewer can reproduce and interpret the decision.",
    "followUp": "Which metadata would you capture for a hosted model alias?"
  },
  {
    "id": 25,
    "category": "Production & CI",
    "level": "Advanced",
    "question": "How would you design an AI evaluation pipeline in CI?",
    "answer": "Run fast deterministic unit and contract tests first. Run a curated live evaluation where credentials and budgets are controlled, with broader scheduled suites. Persist versioned artifacts, compare matched baselines and enforce predeclared gates. Distinguish provider outages from quality regressions.",
    "followUp": "Should an unavailable provider count as a model quality failure?"
  },
  {
    "id": 26,
    "category": "Production & CI",
    "level": "Advanced",
    "question": "How do you balance quality, latency and cost?",
    "answer": "Measure all three on representative tasks and realistic concurrency. Report tail latency, error rate and cost per successful task, not only averages. Choose explicit budgets and quality floors by task risk. Evaluate tradeoffs with matched cases and document the decision.",
    "followUp": "Why can cost per request reward a system that fails often?"
  },
  {
    "id": 27,
    "category": "Production & CI",
    "level": "Advanced",
    "question": "What causes flaky AI tests and how do you respond?",
    "answer": "Sources include stochastic outputs, judge variance, network failures, drifting models, changing corpora and test-state leakage. First classify the cause from artifacts. Stabilize deterministic boundaries, version inputs and use repeated evaluation for semantic checks. Do not hide failures with unlimited reruns.",
    "followUp": "When is quarantine justified, and what must accompany it?"
  },
  {
    "id": 28,
    "category": "Production & CI",
    "level": "Advanced",
    "question": "How would you monitor quality after deployment?",
    "answer": "Combine operational telemetry with reviewed sampled outcomes and privacy-safe feedback. Track task success and important slices, audit drift and maintain a shadow or canary evaluation set. Define alerts, ownership and rollback conditions while controlling collection of sensitive data.",
    "followUp": "How would you avoid treating user thumbs-up as perfect ground truth?"
  },
  {
    "id": 29,
    "category": "System Design",
    "level": "Advanced",
    "question": "Design an evaluation platform for a customer-support RAG agent.",
    "answer": "Separate versioned datasets, provider adapters, execution, deterministic checks, semantic judging and reporting. Capture sanitized traces and enforce access boundaries. Include human calibration, repeated trials, slice metrics, budget controls and CI gates. Explain held-out splits, failure triage and production monitoring.",
    "followUp": "What would you build first with one week and a limited budget?"
  },
  {
    "id": 30,
    "category": "System Design",
    "level": "Advanced",
    "question": "A candidate improves mean quality but leaks one synthetic secret. Would you ship?",
    "answer": "Apply the predeclared security gate and block the candidate. Reproduce the case, inspect the trace and access boundary, fix the cause and add a regression. Re-run affected tests and the relevant release suite. Quality gains do not cancel an unauthorized disclosure.",
    "followUp": "How would you document the incident and release decision?"
  },
  {
    "id": 31,
    "category": "System Design",
    "level": "Advanced",
    "question": "How would you investigate a judge disagreement with an expert?",
    "answer": "Review the rubric, evidence and answer independently before assuming either side is correct. Check ambiguity, missing context, evaluator bias and label consistency. Adjudicate with another reviewer, update documented examples if needed and recalibrate on held-out cases.",
    "followUp": "How do you keep rubric changes from overfitting known failures?"
  },
  {
    "id": 32,
    "category": "System Design",
    "level": "Advanced",
    "question": "Explain your capstone project in an interview.",
    "answer": "Describe the user task, highest-cost failure, architecture and evidence. Show your dataset split, deterministic tests, evaluation rubric, security cases and release report. Discuss one real failure you diagnosed, the regression test you added and remaining limits. Use measured results rather than claiming the model is universally accurate.",
    "followUp": "What did your project not test, and why?"
  }
];
