# AI-Assisted Development — Prompt Log

## Purpose

Sezzle explicitly permits AI-assisted development and requests the prompts used. This document preserves the **complete prompts actually executed**, their invocation messages, what AI contributed, and the checks performed. It is maintained in English. No outcome is recorded as verified until the corresponding test or review occurs.

## Workflow

- **One source for prompts:** this `PROMPTS.md` file. There are no separate per-phase prompt documents.
- Each phase has a **verbatim prompt**, its **verbatim invocation**, and a **results log**.
- The candidate sends only the short invocation to the coding agent; the agent reads the full prompt from this file.
- The agent must **never edit the verbatim prompt or invocation**, and may update only the results log for the executed phase.
- Future prompts will be added as new phases, **only when ready to execute them**.
- Implementation is not claimed to be human-written when AI generated it. Agent-run tests and candidate-run tests are distinguished.

> Historical disclosure: An earlier local prototype was started and abandoned before this fresh implementation. Its original prompt log is retained in the archived local project. Before final submission, assess which earlier prompts materially informed this assessment and include their original text in an explicitly labeled archival appendix as applicable; do not silently rewrite or misrepresent the earlier history.

## Development status

| Phase | Scope | Status |
| --- | --- | --- |
| 01 | Requirements and architecture | Approved — 2026-10-08 |
| 02 | Go backend and tests | Not started |
| 03 | React frontend and tests | Not started |
| 04 | Integration, review, docs and submission | Not started |

---

## Phase 01 — Requirements and Architecture

**Tool:** OpenAI Codex (record the specific model only if reliably known)

**Purpose:** Review the actual Sezzle assignment and propose the smallest defensible full-stack solution before any code is written.

### Original prompt (verbatim)

```text
You are helping me complete Sezzle's full-stack calculator take-home assessment. Treat this as a real, time-boxed 2–4 hour evaluation. Correctness, clarity, maintainability, tests, and explainability matter more than optional features.

FIRST: Read ASSIGNMENT.md in full and verify it is not empty. Treat it as the only authoritative requirements source. If it is missing or empty, STOP and tell me; do not make up requirements.

This is a NEW repository and NEW implementation. Do not copy any code from earlier local attempts. Assume no application code exists.

Preferred stack:
- React, TypeScript, Vite, plain CSS
- Go using the standard library for HTTP and arithmetic
- REST/JSON
- Vitest + React Testing Library, Go testing + httptest
- Local React state only; avoid Redux and unnecessary dependencies

TASK: PLAN ONLY. DO NOT scaffold, install dependencies, create application code, run servers, implement tests, modify Git history, or publish anything.

Produce a concise, practical review with these sections:

1. REQUIREMENTS MATRIX: Distinguish mandatory from optional features; map each requirement to a concrete implementation and test. Confirm that the four mandatory arithmetic operations are add, subtract, multiply, and divide. Confirm advanced arithmetic is optional.

2. MINIMAL REPOSITORY STRUCTURE: Propose only the files justified for a small independent Go API, React frontend, tests, README, and this prompt log. Avoid extra layers, generic interfaces, frameworks, databases, queues, auth, or Docker unless clearly justified.

3. API CONTRACT: Propose POST /api/v1/calculate and GET /health. Define JSON examples, operation names, binary operand requirements, consistent error format and status codes. Specify handling of invalid JSON, missing/extra operands, unsupported operations, division by zero, invalid numbers, floating-point overflow, and non-finite results. Avoid unnecessary validation complexity.

4. FRONTEND BEHAVIOR: Describe a clean, responsive calculator UI with decimal entry, negative numbers, clear/backspace, meaningful errors, loading state, and keyboard support. Ensure arithmetic is performed by the Go API, not duplicated in React. Choose and justify a simple rule for repeated/chained calculations; do not silently evaluate expressions locally.

5. TEST PLAN: List the most valuable Go domain and HTTP handler tests, frontend API client tests, React interaction tests, and a short manual integration checklist. Tests must exercise success and error cases, not just mocks for the sake of coverage. A coverage report is mandatory.

6. ENGINEERING TRADEOFFS: Explain why the proposed solution fits 2–4 hours. Note that float64 is not suitable for exact monetary arithmetic, even though this assessment is not a financial ledger. Prioritize mandatory features and clear documentation over advanced operations and Docker.

7. IMPLEMENTATION CHECKPOINTS: Give a realistic order for backend, frontend, integration, documentation, and GitHub submission, with explicit verification gates.

Do not overproduce: keep the architecture review focused enough to approve quickly. Do not pretend any tests have already been run. If you identify a genuine ambiguity, state one recommended assumption instead of inventing requirements.

PROMPT-LOG RULES:
- You may update only the Phase 01 Results Log and Phase 01 status in PROMPTS.md.
- Preserve the exact text of this Original prompt and its Invocation message.
- Record actual outcomes and tool/model only when known; do not fabricate verification.
- Do not add future phase prompts on your own.

STOP after presenting the plan. Wait for my approval before any implementation.
```

### Invocation message (verbatim)

```text
Read ASSIGNMENT.md and PROMPTS.md. Exec<ute only Phase 01 — Requirements and Architecture. Preserve its prompt and invocation verbatim. Update only its results log and status. Do not implement anything. Stop for my approval.
```

### Results log

- **Status:** Phase 01 analysis complete; awaiting candidate approval before implementation.
- **AI contribution:** Reviewed the authoritative assignment and produced the following requirements and architecture proposal. No application code, scaffolding, dependencies, tests, servers, Git history, or publication were created or changed.
- **Decisions approved by candidate:** None yet; the proposal below is awaiting approval.
- **Agent-run verification:** Confirmed `ASSIGNMENT.md` is present and non-empty; read `ASSIGNMENT.md` and `PROMPTS.md`; inspected the repository file list and found no application code. No tests were run because this phase is plan-only.
- **Candidate-run verification:** Not performed.
- **Unresolved issues:** The exact submission deadline, time zone, and private submission URL must be checked in the original email or portal before submission. This repository currently contains uncommitted files; Git history and submission handling are deferred to Phase 04.

#### 1. Requirements matrix

| Requirement | Priority | Proposed implementation | Verification |
| --- | --- | --- | --- |
| Add, subtract, multiply, divide | Mandatory | Go `float64` calculator supporting exactly `add`, `subtract`, `multiply`, and `divide` | Go table tests for every operation; handler tests; React interaction tests that assert API requests and rendered results |
| React input and result UI | Mandatory | TypeScript React calculator with a display, digit/decimal controls, four operators, equals, clear, backspace, and sign toggle | React Testing Library interaction tests plus manual desktop/mobile checks |
| Validation and errors | Mandatory | Validate the request shape at the HTTP boundary and arithmetic constraints in the Go calculator; show API/network errors near the display | Domain, handler, API-client, and UI error tests |
| Responsive design | Mandatory | Small-screen-first plain CSS with a constrained desktop width and touch-friendly button grid | Manual narrow- and wide-viewport checklist |
| REST API and JSON results | Mandatory | `POST /api/v1/calculate`; `GET /health` for integration checks | `httptest` request/response tests and manual `curl` checks |
| Clean, idiomatic, maintainable code | Mandatory | Separate arithmetic rules, HTTP transport, frontend API client, and UI without generic abstractions | Focused review after both layers are complete |
| Unit tests for both layers | Mandatory | Go `testing`/`httptest`; Vitest/React Testing Library | Run both suites from a clean checkout |
| Coverage report | Mandatory | Generate Go and frontend coverage; record commands and measured summaries in the README (generated artifacts may remain ignored) | Re-run coverage commands and compare the documented figures |
| Setup, API, and design documentation | Mandatory | Root README with prerequisites, commands, API examples, assumptions, decisions, and coverage | Follow the README from a clean checkout |
| Exponentiation, square root, percentage | Optional | Omit from the initial implementation | Document as deliberately out of scope |
| Dockerfile | Optional | Omit unless mandatory work finishes with time remaining | Document local run instructions instead |

The required arithmetic operations are **add, subtract, multiply, and divide**. Advanced arithmetic is optional and is not proposed for the initial implementation.

#### 2. Minimal repository structure

```text
.
├── ASSIGNMENT.md
├── PROMPTS.md
├── README.md
├── .gitignore
├── backend/
│   ├── go.mod
│   ├── cmd/server/main.go
│   └── internal/
│       ├── calculator/
│       │   ├── calculator.go
│       │   └── calculator_test.go
│       └── httpapi/
│           ├── handler.go
│           └── handler_test.go
└── frontend/
    ├── package.json
    ├── package-lock.json
    ├── index.html
    ├── tsconfig.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── App.test.tsx
        ├── api.ts
        ├── api.test.ts
        ├── styles.css
        └── test/setup.ts
```

The two small Go packages keep arithmetic independent of HTTP while avoiding interfaces or service/repository layers. The frontend keeps the API boundary separate from UI state. Vite can proxy `/api` to the Go server during development, avoiding application-level CORS configuration. No database, auth, queue, state library, component framework, or deployment layer is justified.

#### 3. API contract

`POST /api/v1/calculate`

```json
{
  "operation": "add",
  "operands": [1.5, 2]
}
```

Successful response (`200 OK`):

```json
{
  "result": 3.5
}
```

Supported operation names are `add`, `subtract`, `multiply`, and `divide`. Every operation requires exactly two finite numeric operands, in left-to-right order. JSON is decoded strictly enough to reject unknown fields and trailing values.

All errors use one shape:

```json
{
  "error": {
    "code": "division_by_zero",
    "message": "cannot divide by zero"
  }
}
```

| Condition | Status | Error code |
| --- | --- | --- |
| Malformed JSON, unknown field, trailing JSON, missing field, non-number, number outside `float64`, or operand count other than two | `400 Bad Request` | `invalid_request` |
| Unknown operation | `422 Unprocessable Entity` | `unsupported_operation` |
| Division by positive or negative zero | `422 Unprocessable Entity` | `division_by_zero` |
| Arithmetic result is `NaN` or positive/negative infinity, including overflow | `422 Unprocessable Entity` | `non_finite_result` |
| Wrong HTTP method | `405 Method Not Allowed` | `method_not_allowed` |
| Unexpected server failure | `500 Internal Server Error` | `internal_error` |

Standard JSON cannot represent `NaN` or infinity; invalid/non-representable numeric request values therefore fail as `invalid_request`. The domain calculation still checks that operands and results are finite so direct calls and overflow are safe. Error messages remain human-readable, while stable codes drive frontend behavior.

`GET /health` returns `200 OK` with `{"status":"ok"}`. Other methods return the same error envelope with `405 Method Not Allowed`. Responses use `application/json`.

#### 4. Frontend behavior

- Show a familiar four-column calculator with a prominent display, digits, decimal point, sign toggle, clear, backspace, the four mandatory operators, and equals. Use semantic buttons, visible focus, sufficient contrast, and a live region for results/errors.
- Build one decimal operand at a time as display text so entry such as `0.`, `-0.5`, and correction with backspace behaves predictably. Prevent a second decimal point. The sign control toggles the current operand, including zero.
- Selecting an operator stores the displayed first operand and waits for the second. Selecting a different operator before entering the second replaces the pending operator. Pressing equals with two operands sends one API request; React never computes arithmetic.
- After a successful result, selecting an operator uses that server result as the first operand of a new calculation. Entering a digit starts a fresh calculation. Repeated equals is intentionally unsupported, avoiding a hidden retained-operand rule. This is sequential chaining, not expression parsing or precedence evaluation.
- While a request is pending, show a loading indication and disable calculation-changing controls to prevent duplicate or out-of-order requests. A successful response replaces the display. Validation, API, or network failure leaves the calculator recoverable and shows a meaningful message; clear resets all state.
- Support digits, decimal point, `+`, `-`, `*`, `/`, Enter or `=`, Backspace, and Escape. Keyboard input uses the same state transitions as clicks. Unary negative is provided reliably through the sign-toggle button; the keyboard minus key selects subtraction.
- Use responsive plain CSS: full-width layout on narrow screens, bounded card width on larger screens, comfortable tap targets, and no horizontal overflow.

#### 5. Test plan

**Go domain tests**

- Table-test successful add, subtract, multiply, and divide, including negative and decimal operands.
- Test division by `0` and `-0`.
- Test rejection of non-finite operands when the domain function is called directly.
- Test overflow/non-finite results, for example multiplication beyond `float64` range.

**Go HTTP tests**

- Verify the success body, status, and content type for every operation.
- Verify malformed and trailing JSON, unknown/missing fields, wrong types, missing/extra operands, unsupported operation, division by zero, an out-of-range JSON number, and result overflow.
- Verify `GET /health`, wrong methods, and their JSON error/status contracts.

**Frontend API-client tests**

- Verify URL, POST method, JSON headers/body, and successful result parsing.
- Verify structured API errors, network rejection, and an invalid success payload become useful client errors.

**React interaction tests**

- Enter integers, decimals, and negative values; select each operator; press equals; assert the exact API call and rendered server result.
- Test clear, backspace, duplicate-decimal prevention, operator replacement, fresh entry after a result, and server-result chaining.
- Test loading/duplicate-submit protection and recovery from API errors.
- Test the main keyboard paths and accessible names/status output.

**Manual integration checklist**

1. Start both applications using only README instructions.
2. Check `/health` and one successful and one failing `curl` example.
3. Exercise all four UI operations, decimals, negatives, divide-by-zero, chaining, clear/backspace, and keyboard input against the real Go API.
4. Check a narrow mobile viewport and a desktop viewport, including focus visibility and loading/error states.
5. Run both test suites and coverage commands; record actual results only after they pass.

#### 6. Engineering tradeoffs

This design fits the 2–4 hour limit by implementing one endpoint, one small arithmetic package, one calculator component, and targeted tests. Transport and arithmetic are separated where that directly improves testing, but broader layering and generic interfaces are omitted. Local component state is sufficient; expression parsers and client-side arithmetic would increase scope and risk violating the server-calculation requirement.

Go `float64` matches an ordinary calculator and JSON numbers but is not exact decimal arithmetic and is unsuitable for a financial ledger. This assessment is treated as a general calculator, not a money system; the limitation will be documented. Mandatory behavior, error handling, tests, coverage, and reproducible instructions take priority over advanced operations and Docker.

#### 7. Implementation checkpoints

1. **Backend domain:** initialize the Go module; implement the four operations and typed domain errors. Gate: focused domain tests and Go coverage pass.
2. **Backend HTTP:** implement strict request decoding, status/error mapping, routes, and server wiring. Gate: handler tests, full backend suite, formatting, and vet pass; manually check health and representative success/error requests.
3. **Frontend foundation:** initialize Vite React/TypeScript, configure the development proxy, and implement the typed API client. Gate: client tests and TypeScript checks pass.
4. **Frontend UI:** implement state transitions, controls, keyboard/accessibility behavior, styles, loading, and errors. Gate: interaction tests and frontend coverage pass.
5. **Integration:** run both layers together and complete the manual checklist, including responsive checks. Gate: the browser uses the real Go response and no arithmetic is duplicated in React.
6. **Documentation and review:** write setup/run instructions, API examples, decisions/assumptions, `float64` limitation, test commands, and actual coverage figures; review for unnecessary code and stale claims. Gate: reproduce instructions from a clean checkout and run all checks again.
7. **Submission:** verify the deadline/time zone/private URL, review the prompt history disclosure, inspect the diff for secrets or generated clutter, commit, push, and confirm the remote repository link. Gate: candidate explicitly approves publication and verifies the shared link.


---

## Candidate Review and Approval — 2026-10-08

**Phase:** 01 — Requirements and Architecture  
**Decision:** Approved with minor clarifications.

The candidate reviewed the proposed architecture, API contract, frontend interaction rules, and testing strategy before authorizing implementation.

### Approved decisions

- Use React, TypeScript, and Vite for the frontend.
- Use Go's standard library for the REST API.
- Keep arithmetic domain logic independent of HTTP handlers.
- Support the four mandatory arithmetic operations first.
- Keep frontend arithmetic delegated to the Go API.
- Use simple React state without unnecessary dependencies.
- Prioritize meaningful automated tests and reproducible coverage reports.

### Clarifications requested during review

- Return HTTP 415 when the request media type is unsupported.
- If request-size limits are implemented, return HTTP 413 for oversized bodies.
- Keep API error codes and status mappings consistent across implementation, tests, and documentation.
- Define a clear policy for invalid, missing, null, or non-finite operands.
- Keep exponentiation, square root, percentage, and Docker optional.
- Document the limitations of float64 arithmetic.
- Require successful tests and independent manual verification before approving the next phase.

### Approval scope

Phase 01 is approved for Go backend implementation only. This approval does not imply that the backend has been implemented or tested.

The original Phase 01 prompt, invocation message, and results log remain unchanged.
