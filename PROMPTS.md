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
| 02 | Go backend and tests | Approved — 2026-10-08 |
| 03 | React frontend and tests | Approved — 2026-10-08 |
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

---

## Phase 02 — Go Backend and Tests

**Date:** 2026-10-08
**Tool:** OpenAI Codex
**Status:** APPROVED — 2026-10-08
**Scope:** Backend implementation and automated verification only

### Objective

Implement a small, clean, idiomatic Go REST calculator service using the approved Phase 01 design.

### Original prompt (verbatim)

```text
You are a senior Go engineer implementing Phase 02 of the Sezzle full-stack calculator take-home assessment.

Read ASSIGNMENT.md, the Phase 01 architecture proposal, the Candidate Review and Approval, and this Phase 02 prompt in PROMPTS.md before modifying application code.

The previous phase has been approved with clarifications. Follow those decisions. If a genuine contradiction or implementation blocker is found, report it and stop instead of silently changing the approved design.

This is a time-boxed 2–4 hour assessment. Prioritize correctness, readable idiomatic Go, maintainability, and meaningful tests. Avoid overengineering.

1. IMPLEMENTATION SCOPE

Implement ONLY the Go backend.

Mandatory operations:
- add
- subtract
- multiply
- divide

Each operation accepts exactly two finite numeric operands.

Do not implement optional arithmetic operations in this phase.

Use Go standard-library packages unless a dependency has a compelling justification.

Do not create any React frontend, Docker configuration, database, authentication, queues, or unnecessary infrastructure.

2. PROJECT STRUCTURE

Use this minimal organization:

backend/
  go.mod
  cmd/server/main.go
  internal/calculator/calculator.go
  internal/calculator/calculator_test.go
  internal/httpapi/handler.go
  internal/httpapi/handler_test.go

Introduce additional files only for genuine maintainability reasons.

The calculator package must not depend on net/http or the HTTP transport layer.

3. DOMAIN IMPLEMENTATION

Implement deterministic calculator operations.

Validate:
- supported operation
- exactly two operands
- finite input numbers
- division by positive or negative zero
- non-finite results caused by overflow or invalid arithmetic

Use clear, idiomatic Go error values or equivalent simple error handling.

Do not use a large interface hierarchy, dependency injection framework, or speculative abstraction.

The calculation function must be independently testable.

4. HTTP CONTRACT

Expose:

POST /api/v1/calculate

Request:
{"operation":"add","operands":[10,5]}

Success, HTTP 200:
{"result":15}

GET /health

Success, HTTP 200:
{"status":"ok"}

Use consistent JSON error responses:

{"error":{"code":"division_by_zero","message":"Cannot divide by zero"}}

Follow these approved HTTP rules:

- 400 invalid_request: malformed JSON, missing required fields, incorrect data types, invalid operand count, or non-representable input numbers.
- 415 unsupported_media_type: Content-Type is not application/json.
- 413 request_too_large: request exceeds the configured size limit, if a size limit is implemented.
- 422 unsupported_operation: unknown calculator operation.
- 422 division_by_zero: denominator is positive or negative zero.
- 422 non_finite_result: arithmetic result is not finite.
- 405 method_not_allowed: unsupported method, including a suitable Allow header.
- 500 internal_error: unexpected server errors.

Use these documented error codes consistently in the API and tests. Do not invent alternative code naming conventions.

For validation:
- Reject malformed or empty JSON.
- Reject trailing JSON values.
- Reject unknown fields.
- Reject absent or null required fields.
- Reject null array elements: do not silently decode null operands as numeric zero.
- Reject strings or booleans used instead of numeric operands.
- Reject arrays with too few or too many operands.
- Reject numbers outside float64 representation.

Do not introduce unnecessarily complex validation libraries.

Use encoding/json and net/http appropriately.

Do not expose internal error details in generic HTTP 500 responses.

Keep the server port configurable using PORT, defaulting to 8080.

Use reasonable server timeouts without adding production infrastructure beyond this exercise.

5. TEST-DRIVEN VERIFICATION

Implement meaningful automated tests as the domain and handlers are completed, rather than writing all tests at the end.

Domain tests should cover:
- each mandatory operation
- negative numbers
- decimal operands
- positive and negative zero
- division by zero
- invalid operand counts
- unsupported operation
- non-finite input operands
- overflow and non-finite results

Use Go table-driven tests where appropriate.

HTTP handler tests should cover:
- health endpoint
- successful arithmetic responses
- exact JSON result contract
- structured error responses
- expected HTTP status codes
- malformed JSON
- unknown fields
- extra JSON values
- missing fields
- null operands, including null array entries
- incorrect JSON types
- unsupported operation
- division by zero
- arithmetic overflow
- wrong HTTP method
- unsupported media type
- oversized requests, if a request size limit exists

Use net/http/httptest and the standard Go testing package.

Prefer meaningful assertions over superficial coverage inflation.

6. EXECUTE QUALITY CHECKS

After implementation, actually execute the following from backend/:

go fmt ./...
go vet ./...
go test ./... -cover
go build ./...

If a command fails, identify and fix the underlying defect and rerun it.

Do not claim a test or build passed without seeing the actual command output.

If Go cannot be executed in the agent environment, report the limitation accurately and provide the exact commands for the candidate to execute in Windows PowerShell.

Report coverage separately for the calculator, HTTP handlers, and main package.

Do not invent coverage percentages.

7. MANUAL HTTP VERIFICATION

If the environment allows it, start the actual HTTP server and exercise:
- GET /health
- POST add with [15,25] producing 40
- POST divide with [10,0] producing an HTTP 422 JSON error

If real server execution is unavailable, mark these manual integration tests NOT VERIFIED.

The candidate will independently verify the server afterward.

8. PROMPT RECORDING

PROMPTS.md is the authoritative AI assistance record.

Do not overwrite or reformat the entire file.

Preserve all existing Phase 01 content, original prompts, invocation messages, and candidate approval.

Preserve this Phase 02 original prompt and invocation exactly.

Modify only the Phase 02 status and Results log, and the Phase 02 status cell in the development timeline.

Record:
- what files were created
- relevant engineering decisions
- actual commands executed
- real test and coverage results
- verification limitations
- any substantive additional AI prompts used

Do not claim the candidate performed manual verification that has not been reported.

Do not fabricate prompts, test results, or human decisions.

9. STOP CONDITION

Stop after Go backend implementation and automated verification.

Do not implement React.
Do not create the final README.
Do not create Docker configuration.
Do not commit, push, or publish the repository.
Do not proceed to Phase 03 without the candidate's approval.

FINAL RESPONSE

Provide:
A. Requirements compliance summary
B. Files created
C. API and validation behavior
D. Test results and actual command outputs
E. Coverage by package
F. Known limitations
G. Commands for independent Windows verification
H. PROMPTS.md changes and Git status

Then STOP.
```

### Planned invocation message

The following exact message will be sent to Codex. It becomes historical evidence only after execution.

```text
Read ASSIGNMENT.md and PROMPTS.md. Execute only Phase 02 — Go Backend and Tests according to its complete original prompt. Preserve all previous phases and prompts. Update only the Phase 02 status and results log. Stop before frontend implementation, Git commits, or publication.
```

### Results log

**Status:** Backend implementation complete; automated and manual runtime verification remain pending because no executable Go toolchain is available in the agent environment.

**AI contribution:**

- Created only the approved Go backend structure: `backend/go.mod`, `backend/cmd/server/main.go`, `backend/internal/calculator/calculator.go`, `backend/internal/calculator/calculator_test.go`, `backend/internal/httpapi/handler.go`, and `backend/internal/httpapi/handler_test.go`.
- Implemented independently testable `add`, `subtract`, `multiply`, and `divide` domain logic with validation for exactly two operands, non-finite operands, positive/negative zero division, unsupported operations, and non-finite results.
- Implemented `POST /api/v1/calculate` and `GET /health` with standard-library HTTP/JSON packages, the approved error codes and status mappings, `Allow` headers, a configurable `PORT` defaulting to `8080`, and server read/header/write/idle timeouts.
- Added strict request validation for `application/json`, a 1 MiB body limit, malformed/empty/trailing JSON, unknown fields, absent/null fields, null array entries, incorrect types, invalid operand counts, and numbers outside `float64` representation.
- Added table-driven domain tests and `httptest` handler tests covering the required success and error behavior, including HTTP 413 and 415.
- Did not create frontend, README, Docker, database, authentication, queues, commits, or publication artifacts. No substantive additional AI prompts were used beyond the recorded Phase 02 invocation.

**Engineering decisions:**

- Kept calculation rules in a transport-independent package and used simple sentinel errors rather than interfaces or dependency-injection layers.
- Represented decoded required fields and operand entries with pointers so absent/null values cannot silently become empty strings or numeric zero.
- Used `json.Decoder.DisallowUnknownFields`, a second decode requiring `io.EOF`, and `http.MaxBytesReader` to keep validation strict without a validation dependency.
- Chose a 1 MiB request limit, sufficient for a two-number request while giving the approved `request_too_large` behavior.
- Kept error messages safe and stable; unexpected internal errors map to `500 internal_error` without exposing details.

**Agent-run verification:**

- Confirmed by source inspection that only the six planned backend files were created and no frontend or deployment directories exist.
- Checked backend files for trailing whitespace; none was reported.
- Located Windows Go at `C:\\Program Files\\Go\\bin\\go.exe`, but this Linux execution environment cannot run Windows binaries; direct execution failed with `Exec format error`.
- Attempted every required command from `backend/`. Each exited with code `127` and `/bin/bash: line 1: go: command not found`:
  - `go fmt ./...`
  - `go vet ./...`
  - `go test ./... -cover`
  - `go build ./...`
- Automated tests, compilation, vet, gofmt verification, and real-server HTTP checks are therefore **NOT VERIFIED** by the agent.

**Coverage by package:**

- `sezzle-calculator/backend/internal/calculator`: Not measured; Go could not execute.
- `sezzle-calculator/backend/internal/httpapi`: Not measured; Go could not execute.
- `sezzle-calculator/backend/cmd/server`: Not measured; Go could not execute.

No coverage percentage is claimed.

**Candidate-run verification:** Not performed or reported. From Windows PowerShell at the repository root, run:

```powershell
Set-Location .\backend
go version
go fmt ./...
go vet ./...
go test ./... -cover
go build ./...

# Produce and inspect a coverage profile, then show each package separately.
go test ./... -coverprofile=coverage.out
go tool cover -func=coverage.out
go test ./internal/calculator -cover
go test ./internal/httpapi -cover
go test ./cmd/server -cover
```

For independent HTTP verification, keep the following server running in one PowerShell window:

```powershell
Set-Location .\backend
$env:PORT = "8080"
go run ./cmd/server
```

Then run in another PowerShell window from the repository root:

```powershell
curl.exe -i http://localhost:8080/health
curl.exe -i -H "Content-Type: application/json" --data-raw '{"operation":"add","operands":[15,25]}' http://localhost:8080/api/v1/calculate
curl.exe -i -H "Content-Type: application/json" --data-raw '{"operation":"divide","operands":[10,0]}' http://localhost:8080/api/v1/calculate
```

Expected results are HTTP 200 with `{"status":"ok"}`, HTTP 200 with `{"result":40}`, and HTTP 422 with `{"error":{"code":"division_by_zero","message":"Cannot divide by zero"}}`, respectively. These expectations have not yet been independently observed.

**Known issues and limitations:**

- The backend has not been compiled, formatted by `go fmt`, vetted, tested, measured for coverage, or exercised through a real server in the agent environment. Candidate verification is required before Phase 02 approval.
- Arithmetic uses `float64`; it can exhibit binary floating-point rounding and is not suitable for exact monetary calculations.
- Optional operations, frontend integration, final documentation, Docker, graceful shutdown, and deployment are outside this phase.

**PROMPTS.md and Git status:** Updated only the Phase 02 timeline status, Phase 02 status, and this Results log. All previous-phase content and both Phase 02 prompt/invocation text were preserved. At completion, `PROMPTS.md` is modified and `backend/` is untracked; no commit, push, or publication was performed.

**Verification clarification:** The limitation above
applies only to the Codex execution environment.

The candidate subsequently compiled, tested, and ran
the Go backend independently using Windows PowerShell.

All Go formatting, vet, test, and build checks passed.
Live HTTP verification also passed, including 11/11
additional arithmetic cases.

See the Candidate Verification and Approval section
below for the actual results.

### Candidate Verification and Approval — 2026-10-08

**Decision:** APPROVED for frontend integration.

The candidate independently verified the backend on Windows using Go 1.24.1 and PowerShell.

#### Automated verification

| Check | Actual result |
| --- | --- |
| go fmt ./... | PASS |
| go vet ./... | PASS |
| go test ./... -count=1 -cover | PASS |
| go build ./... | PASS |
| Coverage profile generation | PASS |
| Calculator domain coverage | 100.0% |
| HTTP handler coverage | 92.4% |
| Server entrypoint coverage | 0.0% (not directly tested) |

The initial function-level coverage display command returned "too many arguments". The coverage profile itself was generated successfully.

#### Live HTTP verification

| Test | Observed result |
| --- | --- |
| GET /health | PASS — status ok |
| Addition [15,25] | PASS — 40 |
| Division by zero [10,0] | PASS — HTTP 422, division_by_zero |
| Null operand [10,null] | PASS — HTTP 400, invalid_request |

#### Additional arithmetic verification

The candidate executed 11 real HTTP arithmetic tests covering addition, subtraction, multiplication, division, negative operands, decimals, and zero.

**Result: 11/11 PASS.**

#### Source review

The candidate supplied the calculator domain, HTTP handler, and server entrypoint for an AI-assisted source-code review. No obvious blocking defects were identified in the inspected files.

#### Decision

The backend is approved for frontend integration based on successful automated tests, build checks, live HTTP verification, and source review.

Optional arithmetic and deployment infrastructure remain outside the approved scope.

All original prompts and invocation messages remain unchanged.


---

## Phase 03 — React Frontend and Tests

**Date:** 2026-10-08  
**Tool:** OpenAI Codex  
**Status:** IMPLEMENTED — Awaiting candidate verification  
**Scope:** React frontend, Go API integration, and automated frontend tests.

### Objective

Build a professional, maintainable React calculator that uses the existing Go API for all arithmetic, with responsive design, accessible interactions, robust error handling, and meaningful automated tests.

### Original prompt (verbatim)

```text
You are a senior React and TypeScript engineer implementing Phase 03 of the Sezzle full-stack calculator assessment.

CONTEXT

Read ASSIGNMENT.md, PROMPTS.md, and the actual Go backend source before making changes.

Phase 01 was approved.
Phase 02 was implemented, independently verified, and committed.

The candidate verified:
- Go formatting, vet, tests, and build: PASS
- 11/11 live arithmetic HTTP tests: PASS
- Calculator domain coverage: 100.0%
- HTTP handler coverage: 92.4%
- The backend responds on localhost:8080

This is a time-boxed 2–4 hour assessment. Prioritize correctness, clarity, maintainability, testability, and user experience over extra features.

Your task is to implement ONLY the React frontend and its tests.

PHASE A — VERIFY THE ACTUAL BACKEND CONTRACT

Inspect backend/internal/httpapi/handler.go and the calculator domain.

Confirm the exact API contract before implementation.

POST /api/v1/calculate

Example request:
{"operation":"add","operands":[10,5]}

Success:
HTTP 200
{"result":15}

Example error:
HTTP 422
{"error":{"code":"division_by_zero","message":"Cannot divide by zero"}}

Supported operations:
- add
- subtract
- multiply
- divide

The backend uses lowercase error codes and JSON responses.

Do not invent alternative operation names or API response formats.

Do not modify the backend unless a genuine integration defect makes it necessary. If a backend change is required, explain the problem and stop for approval.

PHASE B — PROJECT INITIALIZATION

Initialize a small React + TypeScript application using Vite.

Use:
- React
- TypeScript with strict type checking
- Vite
- Vitest
- React Testing Library
- jsdom for component tests
- Compatible Vitest coverage tooling
- Plain CSS

Keep dependencies minimal.

Use React hooks and local component state.

Do NOT introduce:
- Redux
- Zustand
- React Query
- Heavy component libraries
- Tailwind unless demonstrably justified
- State-management frameworks
- Authentication
- Databases
- Unnecessary architectural layers

Suggested structure:

frontend/
  package.json
  package-lock.json
  index.html
  tsconfig.json
  vite.config.ts
  src/
    main.tsx
    App.tsx
    App.test.tsx
    api/
      calculator.ts
      calculator.test.ts
    styles.css
    test/
      setup.ts

You may use a focused Calculator component if it improves readability. Avoid splitting a small UI into excessive files.

PHASE C — USER EXPERIENCE

Create a visually polished, compact calculator.

The interface must feel intentional and professional without unnecessary complexity.

Include:
- Clear, readable calculator display
- Numeric keypad (0–9)
- Decimal point
- Addition, subtraction, multiplication, division
- Equals button
- Clear/reset button
- Backspace
- Sign toggle (+/-)
- Clear visual distinction between digits and operations
- Useful error and loading feedback
- Responsive layout on mobile and desktop
- Accessible button names
- Keyboard focus indicators
- Suitable text contrast and comfortable touch targets

Use simple, restrained styling.

Do not add unnecessary animation or complex visual effects.

PHASE D — CALCULATOR BEHAVIOR

Define and implement predictable calculator state transitions.

Rules:

1. Store the currently edited operand as text until submission so incomplete decimal input such as "0." remains possible.

2. Only convert operands to numbers at the API boundary after validating input.

3. The Go backend must perform ALL arithmetic operations.

4. Do not independently calculate addition, subtraction, multiplication, or division in React.

5. Selecting an arithmetic operator stores the first operand and prepares the second operand.

6. Selecting another operator before entering the second operand replaces the pending operator.

7. Pressing equals with a complete expression sends exactly one calculation request.

8. After successful calculation, display the result returned by Go.

9. Selecting an operator after a successful result reuses that server result as the first operand in the next calculation.

10. Entering a digit after a completed calculation starts a new expression.

11. Repeated equals is not required.

12. Do not implement full mathematical expression parsing or precedence rules.

13. Prevent duplicate decimal points within one operand.

14. Support negative operands through a sign-toggle control.

15. Ensure zero, negative zero, decimals, and backspace behave predictably.

16. Clear resets the calculator display, operands, operator, result status, and error.

17. Do not send incomplete or invalid operands to the API.

18. Show backend validation errors without making the calculator unusable.

19. Handle a disconnected backend with a helpful error message.

20. Prevent duplicate requests while a calculation is pending.

21. If Clear is pressed during an active request, ensure that a late response cannot overwrite the reset calculator state. Use AbortController and/or a simple request identity mechanism.

22. Button clicks and keyboard interactions must share the same state-transition logic.

Keyboard support:
- 0–9
- decimal point
- +
- -
- *
- /
- Enter
- =
- Backspace
- Escape

Ensure keyboard listeners are cleaned up properly and do not unnecessarily intercept typing in unrelated editable controls.

Keep the state model understandable and testable. Avoid unnecessary abstractions or a complex state machine.

PHASE E — API CLIENT

Create a small, typed HTTP client using fetch.

Configure Vite's development proxy:

/api -> http://localhost:8080

Use relative /api/v1/calculate requests in development.

Keep API communication outside presentation logic.

Handle:
- Successful HTTP responses
- Valid JSON results
- Structured Go API errors
- Unexpected HTTP error bodies
- Invalid response payloads
- Network failures
- Request cancellation
- Stale responses when the user resets the calculator

Use a small typed error representation when useful, without creating an elaborate hierarchy.

Do not silently treat failed HTTP requests as successful calculations.

Do not introduce CORS changes into Go merely to support the Vite development server.

Important: The Vite development proxy does not automatically configure production hosting. Leave any production routing requirements clearly identifiable for the final README.

PHASE F — TESTING

Write meaningful tests using Vitest and React Testing Library.

Prefer behavioral testing over tests that inspect component internals.

API client tests:

1. Correct endpoint and HTTP method.
2. Correct JSON request payload.
3. Successful result parsing.
4. Structured backend error parsing.
5. Non-JSON or unexpected HTTP errors.
6. Network failures.
7. Invalid successful response payload.
8. Cancellation behavior if implemented.

React tests:

1. Initial display and controls.
2. Digit entry.
3. Decimal entry.
4. Prevention of repeated decimal points.
5. Negative operand entry.
6. Addition through the mocked API boundary.
7. Subtraction through the mocked API boundary.
8. Multiplication through the mocked API boundary.
9. Division through the mocked API boundary.
10. Display of results returned by the API.
11. Operator selection and replacement.
12. Clear/reset behavior.
13. Backspace behavior.
14. Incomplete-input prevention.
15. Division-by-zero error display and recovery.
16. Network failure display and recovery.
17. Loading/pending state.
18. Duplicate-submission prevention.
19. Stale response prevention after Clear.
20. Reusing a previous result.
21. Keyboard interactions.
22. Important accessibility behavior.

Do not hardcode expected arithmetic results by duplicating the backend's arithmetic implementation.

Mock the HTTP boundary while preserving real component behavior.

Tests must not merely assert that components render. Test actual user interactions and their resulting API calls.

Use coverage reporting, but do not add superficial tests only to maximize percentages.

PHASE G — QUALITY GATES

Implement incrementally and check the result.

1. Scaffold the frontend.
2. Implement and test the API client.
3. Implement calculator UI and state behavior.
4. Implement interaction tests.
5. Configure responsive styling.
6. Run the complete frontend verification.

Actually execute the applicable commands:

npm run build
npm run test -- --coverage
npm run lint (only if the script is configured)

Ensure the package.json scripts exist and reflect actual tooling.

If coverage requires additional packages, install the compatible version of the coverage provider.

Fix genuine TypeScript errors, failed tests, build problems, and lint issues.

Never claim success without actual command output.

If the coding environment cannot execute Node.js or npm, report NOT VERIFIED and provide the exact commands for Windows PowerShell.

Do not invent coverage percentages.

PHASE H — INTEGRATION VERIFICATION

If the environment permits it, verify one real frontend-to-Go calculation through the Vite development proxy.

If the local Go server is not accessible from your execution environment, mark real browser integration as NOT VERIFIED.

Mocked unit tests are not proof of real HTTP integration.

Provide specific manual verification steps for Windows:

- Start Go on port 8080.
- Start the Vite frontend.
- Open the calculator in the browser.
- Check the Network panel.
- Confirm POST /api/v1/calculate is called.
- Confirm the visible result matches the Go API response.
- Check mobile responsiveness and keyboard support.
- Test division by zero and backend disconnection.

PHASE I — AI ASSISTANCE LOG

PROMPTS.md is the authoritative AI prompt record.

DO NOT rewrite, summarize, remove, or reformat any previous phases.

Preserve all existing original prompts, invocation messages, approvals, and test results.

Update ONLY:
- Phase 03 status in the development timeline.
- Phase 03 status in its own section.
- Phase 03 Results log.

Do not modify the original Phase 03 prompt or its invocation message.

Record:
- Files created and modified.
- Technical decisions.
- Relevant implementation details.
- Actual commands executed.
- Actual test results.
- Actual coverage figures.
- Unverified checks.
- Known issues.

If further substantive AI instructions are required, preserve their actual text as follow-up prompts rather than silently rewriting the original prompt.

Do not attribute AI-generated code to manual authorship.

Do not fabricate test results or human verification.

PHASE J — STOP CONDITIONS

Stop after implementing the React frontend and running its automated checks.

Do NOT:
- Implement optional advanced operations.
- Add Docker.
- Rewrite the Go backend.
- Create the final README.
- Make Git commits.
- Push or publish anything.
- Submit the assessment.
- Start Phase 04.

Wait for the candidate's independent verification and approval.

FINAL REPORT

Provide:

A. Files created or modified.
B. Frontend architecture and interaction behavior.
C. API integration details.
D. Actual build, test, and lint outputs.
E. Frontend coverage results.
F. Known limitations.
G. Manual browser verification steps.
H. PROMPTS.md changes.
I. Git working-tree status.

Then STOP.
```

### Planned invocation message

The exact message below will be sent to Codex. It becomes historical evidence only after it has actually been sent.

```text
Read ASSIGNMENT.md and PROMPTS.md. Execute only Phase 03 — React Frontend and Tests. Follow the complete Phase 03 original prompt. Preserve all previous phases and verification records. Update only Phase 03 status and results. Do not commit, push, or proceed to Phase 04.
```

### Results log

**Status:** Frontend implementation and agent-run automated verification complete; awaiting candidate browser and integration verification before approval.

**Files created:**

- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/index.html`
- `frontend/tsconfig.json`
- `frontend/vite.config.ts`
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/App.test.tsx`
- `frontend/src/styles.css`
- `frontend/src/api/calculator.ts`
- `frontend/src/api/calculator.test.ts`
- `frontend/src/test/setup.ts`

Generated and ignored verification directories include `frontend/node_modules/`, `frontend/dist/`, and `frontend/coverage/`. No backend file was modified.

**AI contribution and implementation details:**

- Created a strict TypeScript React application using Vite, local React state, plain CSS, Vitest, React Testing Library, jsdom, and V8 coverage. No state-management or component framework was added.
- Implemented a compact responsive calculator with accessible names, visible focus states, comfortable touch targets, distinct operation styling, a live display, expression context, loading feedback, and recoverable errors.
- Implemented digit and decimal text entry, duplicate-decimal prevention, sign toggle, clear, backspace, all four required operators, equals, operator replacement before the second operand, result chaining, fresh digit entry after a result, and no repeated-equals behavior.
- Implemented keyboard handling for digits, decimal point, `+`, `-`, `*`, `/`, Enter, `=`, Backspace, and Escape. Editable targets are not intercepted, listeners are cleaned up, and Enter/Space on focused buttons are left to native button behavior.
- Kept all arithmetic in the Go service. React converts complete operand text to finite numbers only before calling the API and never computes add, subtract, multiply, or divide results.
- Implemented a typed fetch client for relative `POST /api/v1/calculate` calls with the exact lowercase backend operation names and request/response shapes. It handles structured backend errors, unexpected/non-JSON HTTP errors, invalid successful payloads, network failures, and cancellation.
- Configured the Vite development proxy from `/api` to `http://localhost:8080`; no Go CORS change was made. Production routing remains a Phase 04 documentation/deployment concern.
- Prevented duplicate submissions while pending. Clear remains enabled, aborts the active request, increments a request identity, resets all state, and prevents a late response from overwriting the reset display even when a mocked request ignores cancellation.
- Added behavioral API-client and component tests. Component results are deliberately supplied by the mocked API boundary rather than calculated in test or UI code.
- No substantive follow-up AI prompt was used beyond the recorded Phase 03 invocation.

**Tooling setup:** The Linux environment initially had no `node` executable and could not run the visible Windows Node binary. An official Node.js `v22.23.3` Linux archive was downloaded to `/tmp` only; its SHA-256 (`df450af89261115ef9f9e3830c3eeb2cc9213b63c720b1af623cb5dcbe2e02de`) matched the official checksum list. It was not installed system-wide or copied into the repository. `npm install --no-audit --no-fund` completed and produced the committed lockfile dependency graph.

**Agent-run verification and actual results:**

- Focused API-client run: `npm test -- src/api/calculator.test.ts` — **PASS**, 1 file and 8 tests.
- Initial component run: `npm test -- src/App.test.tsx` — **FAIL**, 1/16 passed because React Testing Library was not automatically cleaning up when Vitest globals were disabled. Added explicit shared cleanup.
- Second component run — **FAIL**, 14/16 passed because two tests queried the implicit `status` role shared by `<output>` instead of the visible loading text. Corrected the behavioral queries; application code was unchanged.
- Final focused component run: `npm test -- src/App.test.tsx` — **PASS**, 1 file and 16 tests.
- Initial `npm run build` — **FAIL** with TypeScript `TS2882` for the CSS side-effect import. Added `vite/client` to `tsconfig.json` types.
- Final `npm run build` — **PASS**. TypeScript strict checking and Vite production build completed; Vite transformed 17 modules and emitted approximately 0.55 kB HTML, 2.77 kB CSS, and 226.34 kB JavaScript before gzip.
- Required full command `npm run test -- --coverage` — **PASS**, 2 files and 24 tests.
- `npm ls --depth=0` — **PASS** with the declared top-level dependency versions and no missing/extraneous package reported.
- `npm run lint` was not run because no lint script or lint dependency was configured; the Phase 03 prompt makes lint conditional.
- `curl --max-time 3 http://localhost:8080/health` — **NOT VERIFIED**, exit code 7 because no Go server was listening in the agent environment. Real frontend-to-Go proxy integration and browser rendering were not claimed.

**Frontend coverage:**

| Scope | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| All frontend source | 84.09% (185/220) | 72.66% (101/139) | 97.29% (36/37) | 87.19% (177/203) |
| `src/App.tsx` | 82.29% | 67.82% | 96.66% | 85.71% |
| `src/api/calculator.ts` | 96.42% | 95.83% | 100% | 96.42% |

Coverage was generated by `@vitest/coverage-v8`; no percentage was inferred or invented.

**Candidate-run verification:** Not yet performed or reported. From Windows PowerShell at the repository root:

```powershell
# Window 1: backend
Set-Location .\backend
$env:PORT = "8080"
go run ./cmd/server

# Window 2: frontend
Set-Location .\frontend
npm ci
npm run build
npm run test -- --coverage
npm run dev
```

Then open the URL printed by Vite, normally `http://localhost:5173`, and verify:

1. Use the Network panel to confirm a calculation sends exactly one `POST /api/v1/calculate` request through the Vite proxy and that the displayed value matches the Go response.
2. Exercise add, subtract, multiply, divide, decimals, sign toggle, zero/negative zero, backspace, clear, operator replacement, result chaining, and fresh entry after a result.
3. Exercise digits, decimal, operators, Enter/equals, Backspace, and Escape from the keyboard; confirm visible focus and accessible button names.
4. Test division by zero and confirm the backend message is visible and recoverable.
5. Stop the Go server, attempt a calculation, and confirm the disconnected-backend message is helpful; restart the backend and recover without reloading.
6. While a request is pending, confirm controls prevent duplicate submission and Clear resets without a late result returning.
7. Inspect narrow mobile and desktop widths for readable display text, comfortable touch targets, no horizontal overflow, and suitable contrast.

**Known issues and limitations:**

- Real browser-to-Go integration, visual browser review, responsive-device inspection, and candidate accessibility checks are **NOT VERIFIED** in the agent environment.
- The Vite proxy is development-only; production hosting must route `/api` to the Go service and will be documented in Phase 04.
- Optional exponentiation, square root, percentage, Docker, and final README work remain intentionally outside Phase 03.
- Displayed numbers use JavaScript/Go `float64` semantics and may show binary floating-point precision characteristics; exact monetary arithmetic is not supported.

**PROMPTS.md and Git status:** Updated only the Phase 03 development-timeline status, Phase 03 section status, and this Results log. All previous phases, approvals, verification records, and original prompt/invocation text were preserved. At completion, `PROMPTS.md` is modified and `frontend/` is untracked; no commit, push, publication, backend rewrite, or Phase 04 work was performed.


---

### Phase 03 — Follow-up 01: Error Handling and Recovery

**Date:** 2026-10-08  
**Status:** IMPLEMENTED — Awaiting candidate verification  
**Tool:** OpenAI Codex

#### Reason for follow-up

During independent browser testing, the candidate confirmed that React successfully communicates with the Go backend.

However, after stopping the Go server and attempting another calculation, the frontend displayed:

"The calculator service returned an unexpected error."

The message does not clearly communicate service unavailability. The candidate requested a focused improvement to user-facing error handling and recovery.

The existing frontend build and 24 automated tests passed independently on Windows.

#### Original prompt (verbatim)

```text
You are performing a focused frontend quality improvement for the Sezzle calculator assessment.

Read ASSIGNMENT.md, the existing Phase 03 documentation in PROMPTS.md, frontend/src/api/calculator.ts, frontend/src/App.tsx, and the relevant tests.

IMPORTANT:
The React frontend is implemented and its build and 24 tests pass. Real frontend-to-Go communication has been verified in the browser.

This is a targeted bug fix and error-handling improvement, NOT a frontend rewrite.

PART 1 — INVESTIGATE THE OBSERVED FAILURE

When the Go backend was stopped, the calculator displayed:

"The calculator service returned an unexpected error."

Inspect the actual API client and the Vite proxy configuration.

Determine how the application handles:
- Network connection failures.
- HTTP 500, 502, 503 and 504 responses.
- Non-JSON error responses from the Vite development proxy.
- Valid structured error responses from Go.
- Malformed or invalid successful responses.
- Aborted requests.

Identify the actual cause of the observed generic message from the available code and evidence.

If the exact network response cannot be reproduced in your environment, explain the likely path and its uncertainty.

PART 2 — IMPROVE USER-FACING ERRORS

Implement a small, coherent error classification strategy.

Expected behavior:

1. Connection failure or unavailable calculation service:
   "Calculation service unavailable. Please try again."

2. Division by zero:
   "Cannot divide by zero."

3. Invalid numeric input:
   "Please enter a valid number."

4. Non-finite arithmetic result:
   "The result is outside the supported range."

5. Unexpected or invalid server response:
   "Unable to process the calculation. Please try again."

Treat HTTP 5xx server or proxy errors as service failures, including non-JSON error bodies.

Do not automatically classify every invalid JSON response as a network outage. A successful HTTP 200 response with invalid JSON is a response-contract failure.

Preserve meaningful structured errors from the Go backend where appropriate.

Do not expose HTML responses, stack traces, internal exception messages, or sensitive implementation details in the UI.

Do not add complex error frameworks or unnecessary dependencies.

PART 3 — RECOVERY AND STATE

The calculator must remain usable after an error.

Verify that:
- The pending state is cleared after a failed request.
- Users can retry when the backend becomes available.
- Clear resets errors and expression state.
- A failed request does not appear as a successful calculation.
- Previous and current operands remain consistent.
- An outdated response cannot overwrite a cleared calculator.
- Duplicate requests remain prevented.
- Aborted requests do not display misleading error messages.

Review whether the displayed expression and main value remain coherent after failures.

Change only behavior that is genuinely incorrect.

Never perform arithmetic locally as a fallback.

PART 4 — REGRESSION TESTS

Add or adjust focused tests for:

- Network failure.
- HTTP 500 with a non-JSON response.
- HTTP 502 or 503.
- Structured division-by-zero error.
- HTTP 200 with malformed JSON.
- Recovery and retry after failure.
- Clear after an error.
- Stale-response cancellation behavior.

Preserve the existing tests.

Do not chase coverage percentages with superficial assertions.

PART 5 — EXECUTION

Run:

npm run build
npm run test -- --coverage

Run lint only if configured.

Fix any regressions.

Report actual command results.

If the agent environment cannot connect to the Windows Go server, mark real integration NOT VERIFIED instead of assuming success.

PART 6 — SCOPE CONTROL

Do not:
- Rewrite the calculator.
- Redesign the interface.
- Add new arithmetic operations.
- Change the Go API.
- Add Redux or other state frameworks.
- Add Docker.
- Write the final README.
- Commit or push.
- Start Phase 04.

PART 7 — AI ASSISTANCE RECORD

Preserve all previous prompts, invocation messages, approvals and verification results in PROMPTS.md.

Update only this follow-up's status and results.

Record the actual files changed, tests executed, coverage, and limitations.

Do not invent human verification.

FINAL REPORT

Provide:
A. Root cause or best-supported explanation.
B. Files modified.
C. Before/after error behavior.
D. Tests added or changed.
E. Actual build and test results.
F. Remaining manual verification steps.
G. Git status.

STOP after completing and verifying this focused correction.
```

#### Planned invocation message

```text
Read PROMPTS.md and execute only Phase 03 — Follow-up 01: Error Handling and Recovery. Preserve all previous records. Make only the requested corrections, run the tests, update this follow-up's results, and stop before Phase 04.
```

#### Results log

**Status:** Focused error-classification and recovery correction implemented and verified by the agent; awaiting candidate browser verification.

**Root cause:** The stopped-backend behavior was reproduced against the actual Vite development proxy. With Vite running and no Go server on port 8080, `POST /api/v1/calculate` returned `HTTP 502 Bad Gateway` with `Content-Type: text/plain` and an empty body; Vite logged `ECONNREFUSED 127.0.0.1:8080`. The previous client attempted JSON parsing, received no structured Go error payload, and routed every such non-structured HTTP error to `unexpected_response`, producing "The calculator service returned an unexpected error." Direct fetch rejection followed a separate network-error branch, which is why the proxy-mediated failure did not show that earlier network wording.

**Files modified:**

- `frontend/src/api/calculator.ts`
- `frontend/src/api/calculator.test.ts`
- `frontend/src/App.tsx`
- `frontend/src/App.test.tsx`
- `PROMPTS.md` (only this follow-up status and Results log)

No backend, Vite proxy, interface styling, dependency, lockfile, earlier prompt, earlier result, or Phase 04 file was changed.

**AI contribution and technical decisions:**

- Classified fetch connection failures and all HTTP 5xx responses, including non-JSON proxy bodies, as `service_unavailable` with the fixed message: "Calculation service unavailable. Please try again."
- Preserved request aborts as aborts so cancellation does not display a misleading error.
- Mapped known structured Go errors to fixed safe UI text: `division_by_zero` to "Cannot divide by zero.", `invalid_request` to "Please enter a valid number.", and `non_finite_result` to "The result is outside the supported range."
- Mapped unexpected 4xx payloads, unknown structured error codes, malformed HTTP 200 JSON, and invalid successful payloads to "Unable to process the calculation. Please try again."
- Applied "Please enter a valid number." to locally detected incomplete numeric operands as well, keeping local and backend validation wording coherent.
- Avoided displaying HTML, proxy text, backend-internal wording, stack traces, or raw exception messages.
- Retained the existing expression and operands after failure. The pending flag is cleared in `finally`, Equals becomes available for retry, no failed request is treated as a result, Clear still resets and aborts, request identity still blocks stale responses, and duplicate submission prevention remains unchanged.
- Added no error framework, dependency, local arithmetic fallback, UI redesign, or additional operation.

**Before/after behavior:**

| Condition | Previous behavior | Corrected behavior |
| --- | --- | --- |
| Fetch connection failure | Backend-running guidance | Calculation service unavailable. Please try again. |
| HTTP 500/502/503/504, including Vite text response | Unexpected error | Calculation service unavailable. Please try again. |
| Structured division by zero | Raw backend wording | Cannot divide by zero. |
| Structured invalid request or invalid local number | Mixed validation wording | Please enter a valid number. |
| Structured non-finite result | Raw backend wording | The result is outside the supported range. |
| HTTP 200 malformed/invalid payload | Invalid-result wording | Unable to process the calculation. Please try again. |
| Other unexpected responses | Unexpected-error wording | Unable to process the calculation. Please try again. |

**Tests added or adjusted:**

- Preserved the prior suite and updated expected user-facing messages.
- Added explicit API-client coverage for non-JSON HTTP 500, 502, 503, and 504 responses.
- Added a safe-message assertion for a non-JSON unexpected 4xx response.
- Added structured `invalid_request` and `non_finite_result` mapping tests while retaining structured division-by-zero coverage.
- Added an HTTP 200 malformed-JSON contract-failure test.
- Added a component recovery test proving a failed request preserves `1 + 2`, clears pending state, permits a second Equals attempt, sends the same operands, and displays the later successful API result.
- Retained Clear-after-error, duplicate-submission, request abort, and stale-response-after-Clear regression tests.

**Agent-run verification and actual results:**

- The first repository-local test attempt did not load tests because the ignored cross-platform `node_modules` tree lacked Rolldown's Linux native binding.
- Repository-local `npm ci --no-audit --no-fund` then failed with `EIO` while unlinking the Windows Rolldown native binding, consistent with the file being held by Windows. No force deletion was performed.
- Copied the exact frontend source/configuration and lockfile to an isolated `/tmp` directory, where `npm ci --no-audit --no-fund` succeeded with 116 packages. No tracked source was changed by this workaround.
- Focused command `npm test -- src/api/calculator.test.ts src/App.test.tsx` — **PASS**, 2 files and 32 tests.
- Required command `npm run build` — **PASS**. TypeScript checking and Vite production build completed; 17 modules transformed and the build finished in 147 ms.
- Required command `npm run test -- --coverage` — **PASS**, 2 files and 32 tests.
- Lint was not run because no lint script is configured.
- Live Vite proxy reproduction — **PASS as an investigation check**: with Go unavailable, the proxy returned HTTP 502 text/plain and logged connection refusal. This confirms the observed classification path.
- Real successful frontend-to-Go integration was not rerun by the agent because no Go server was available in this execution environment. The candidate's earlier successful browser integration record remains unchanged.

**Coverage after correction:**

| Scope | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| All frontend source | 84.64% (193/228) | 74.14% (109/147) | 97.36% (37/38) | 87.67% (185/211) |
| `src/App.tsx` | 82.29% | 67.82% | 96.66% | 85.71% |
| `src/api/calculator.ts` | 97.22% | 96.87% | 100% | 97.22% |

Coverage was measured with the existing V8 provider; no percentage is inferred.

**Candidate-run verification:** Not yet performed or reported for this follow-up. The candidate should run `npm ci`, `npm run build`, and `npm run test -- --coverage` in `frontend/`, then verify in the browser that:

1. Stopping Go and calculating shows exactly "Calculation service unavailable. Please try again."
2. Restarting Go and pressing Equals again succeeds without re-entering the expression.
3. Division by zero and invalid/non-finite responses show the fixed messages above.
4. Clear removes the error and resets the expression.
5. No HTML proxy response or internal connection detail appears in the UI.

**Known limitations:** Successful live frontend-to-Go recovery and browser-visible wording remain pending candidate verification. Production reverse-proxy behavior remains a Phase 04 deployment/documentation concern.

**Git status:** `PROMPTS.md` remains modified and `frontend/` remains untracked. No commit, push, backend change, final README, Docker configuration, publication, or Phase 04 work was performed.


### Candidate Verification and Approval — Phase 03

**Date:** 2026-10-08  
**Decision:** APPROVED for final integration review and documentation.

#### Independent Windows verification

The candidate independently executed the frontend build and automated tests using Windows PowerShell.

An initial attempt failed because npm was configured to use Git Bash and the expected local executable shims were unavailable. A clean installation was performed using:

`npm ci --include=optional`

The final checks were executed using `cmd.exe` as the npm script shell.

| Check | Result |
| --- | --- |
| npm --script-shell=cmd.exe run build | PASS |
| npm --script-shell=cmd.exe run test -- --coverage | PASS |
| Frontend API client tests | 15/15 PASS |
| React component tests | 17/17 PASS |
| Total tests | 32/32 PASS |
| Statement coverage | 84.64% |
| Branch coverage | 74.14% |
| Function coverage | 97.36% |
| Line coverage | 87.67% |

#### Browser and integration verification

The candidate tested the React calculator against the running Go REST API.

- Confirmed a real POST request to /api/v1/calculate.
- Observed an HTTP 200 response and the corresponding result.
- Checked calculator interactions, including negative operands, decimals, keyboard controls, and responsive layout.
- Identified unclear error messaging when the Go service was stopped.
- Requested an AI-assisted correction and verified the updated behavior.

#### Compatibility note

Some installed dependencies declare a Node.js engine requirement newer than the candidate's Node.js 22.20.0.

The build and tests passed on Windows, but the final documentation must specify a Node.js version satisfying dependency engine requirements.

#### Engineering decision

Phase 03 is approved based on successful build, automated tests, and candidate-reported browser verification.

The original prompts, follow-up instructions, and AI execution results remain preserved.
