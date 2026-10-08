# Sezzle Full-Stack Calculator

A small full-stack calculator built for Sezzle's take-home assessment. A React and TypeScript interface sends every calculation to a Go REST API; the browser does not duplicate the four arithmetic operations.

The implemented scope covers the mandatory operations:

- Addition
- Subtraction
- Multiplication
- Division

The UI also provides decimal and negative-number entry, clear and backspace controls, keyboard support, responsive styling, loading feedback, recoverable errors, and sequential result chaining.

## Technology stack

- **Backend:** Go 1.22+, `net/http`, `encoding/json`, `testing`, and `httptest`
- **Frontend:** React 19, TypeScript 7 in strict mode, Vite 8, and plain CSS
- **Frontend tests:** Vitest, React Testing Library, jsdom, and V8 coverage

## Architecture

```text
React calculator
    │  POST /api/v1/calculate
    ▼
Vite development proxy (/api → localhost:8080)
    │
    ▼
Go HTTP handlers
    │
    ▼
Transport-independent calculator package
```

The Go calculator package owns arithmetic and domain validation. HTTP handlers own request decoding, status codes, and JSON response formatting. The frontend API client owns network and response validation, while the React component owns only input and interaction state.

```text
backend/
  cmd/server/                  Server configuration and startup
  internal/calculator/         Arithmetic domain and unit tests
  internal/httpapi/            HTTP handlers and handler tests
frontend/
  src/api/                     Typed API client and tests
  src/App.tsx                  Calculator behavior and interface
  src/App.test.tsx             Behavioral interaction tests
  src/styles.css               Responsive presentation
```

## Prerequisites

- **Go 1.22 or newer.** The backend module declares Go 1.22 and was independently verified with Go 1.24.1.
- **A Node.js release allowed by the locked dependency graph:**
  - Node 22: `22.22.2` or newer within the 22.x line
  - Node 24: `24.15.0` or newer within the 24.x line
  - Node 26 or newer
- npm, supplied with Node.js
- `curl` for the API examples (optional)

Node 22.23.3 is a known-compatible choice. The minimum Node 22 patch comes from the strictest `engines.node` requirement in `package-lock.json`; Node 22.20.0 can emit unsupported-engine warnings even if a local build happens to pass.

## Run locally

### 1. Start the Go API

From the repository root:

```bash
cd backend
go run ./cmd/server
```

The API listens on `http://localhost:8080` by default. Set `PORT` to use another port:

```bash
PORT=9090 go run ./cmd/server
```

PowerShell equivalent:

```powershell
$env:PORT = "9090"
go run ./cmd/server
```

The checked-in Vite configuration proxies API requests to port 8080. If you run the backend on another port, update the proxy target in `frontend/vite.config.ts` to match before starting the frontend.

### 2. Start the React frontend

In a second terminal:

```bash
cd frontend
npm ci --include=optional
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

`npm ci --include=optional` installs exactly the versions in `package-lock.json`, including the platform-specific Vite/Rolldown binaries. The commands assume npm's normal platform script shell; the project does not require a personal or Windows-specific `script-shell` setting.

### How the frontend reaches Go

The browser calls the relative URL `/api/v1/calculate`. During local development, Vite proxies `/api` to `http://localhost:8080`, so no development CORS change is needed in Go.

This Vite proxy is development-only. A production host would need to serve the built frontend and route `/api` to the Go service, or otherwise supply an equivalent same-origin/reverse-proxy configuration.

## Calculator behavior

- Select an operator after entering the first operand, then enter the second operand and press Equals.
- Selecting another operator before entering the second operand replaces the pending operator.
- Selecting an operator after a successful result reuses that server result as the next first operand.
- Entering a digit after a successful result starts a new calculation.
- Repeated Equals and full expression parsing/precedence are intentionally not implemented.
- Clear aborts an active request and resets all state. Late responses cannot overwrite the reset display.

Keyboard shortcuts:

| Input | Action |
| --- | --- |
| `0`–`9`, `.` | Enter a number |
| `+`, `-`, `*`, `/` | Select an operation |
| `Enter`, `=` | Calculate |
| `Backspace` | Remove the last character |
| `Escape` | Clear |

Use the `+/−` button for unary negative input.

## API

All API responses are JSON. The calculation endpoint accepts exactly two finite numeric operands in left-to-right order.

### Health check

```http
GET /health
```

Success (`200 OK`):

```json
{"status":"ok"}
```

### Calculate

```http
POST /api/v1/calculate
Content-Type: application/json
```

Request:

```json
{"operation":"add","operands":[15,25]}
```

Success (`200 OK`):

```json
{"result":40}
```

Supported operation names are `add`, `subtract`, `multiply`, and `divide`.

Successful `curl` example:

```bash
curl -i \
  -H "Content-Type: application/json" \
  --data '{"operation":"add","operands":[15,25]}' \
  http://localhost:8080/api/v1/calculate
```

Windows PowerShell example:

```powershell
$body = '{"operation":"add","operands":[15,25]}'
$response = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:8080/api/v1/calculate" `
  -ContentType "application/json" `
  -Body $body
$response | ConvertTo-Json -Compress
```

Expected response:

```json
{"result":40}
```

Division-by-zero example:

```bash
curl -i \
  -H "Content-Type: application/json" \
  --data '{"operation":"divide","operands":[10,0]}' \
  http://localhost:8080/api/v1/calculate
```

Response (`422 Unprocessable Entity`):

```json
{"error":{"code":"division_by_zero","message":"Cannot divide by zero"}}
```

### Validation and errors

Errors use a consistent envelope:

```json
{"error":{"code":"invalid_request","message":"Invalid request"}}
```

| Status | Code | Conditions |
| ---: | --- | --- |
| 400 | `invalid_request` | Empty/malformed/trailing JSON; missing, null, or incorrectly typed fields; operand count other than two; null operands; numbers outside `float64` representation |
| 405 | `method_not_allowed` | Unsupported method; includes an `Allow` header |
| 413 | `request_too_large` | Request body exceeds 1 MiB |
| 415 | `unsupported_media_type` | Content type is not `application/json` |
| 422 | `unsupported_operation` | Operation is not one of the four supported names |
| 422 | `division_by_zero` | Denominator is positive or negative zero |
| 422 | `non_finite_result` | Arithmetic overflows to a non-finite result |
| 500 | `internal_error` | Unexpected server failure without exposed internal details |

Unknown JSON fields are rejected. The frontend converts backend and proxy failures into short user-facing messages and preserves the current expression so a failed request can be retried.

## Tests and coverage

### Backend

Run formatting, static analysis, tests, and a build:

```bash
cd backend
go fmt ./...
go vet ./...
go test ./... -count=1 -cover
go build ./...
```

Generate a reusable coverage profile:

```bash
go test ./... -count=1 -coverprofile=coverage.out
go tool cover -func=coverage.out
```

Latest recorded backend results, independently produced by the candidate on Windows:

| Package/scope | Statement coverage |
| --- | ---: |
| Calculator domain | 100.0% |
| HTTP handlers | 92.4% |
| Server entrypoint | 0.0% |
| Overall Go code | 87.8% |

The entrypoint contains only environment/server wiring and is exercised through build and manual startup rather than a direct unit test. Domain and handler tests cover arithmetic, signed zero, invalid counts/types/JSON, unsupported operations and methods, request limits, overflow, and structured responses.

### Frontend

```bash
cd frontend
npm ci --include=optional
npm run build
npm run test -- --coverage
```

Latest frontend results were reproduced by both the candidate on Windows and the coding agent from a clean locked installation:

| Scope | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| All frontend source | 84.64% | 74.14% | 97.36% | 87.67% |
| `src/App.tsx` | 82.29% | 67.82% | 96.66% | 85.71% |
| `src/api/calculator.ts` | 97.22% | 96.87% | 100% | 97.22% |

The frontend suite contains 32 behavioral tests across the component and API client. It covers API request/response handling, all four operation selections, input transitions, keyboard behavior, accessibility-critical labels/status, loading, retry, cancellation, stale-response protection, and safe error classification.

Generated profiles, HTML reports, dependency directories, and build output are intentionally ignored by Git. The backend profile includes the calculator, handlers, and thin untested server entrypoint; frontend coverage measures the component and API client. Generated bundles and CSS are excluded.

## Design decisions

- **Go standard library:** Go was preferred by the assignment, and its standard HTTP/JSON/testing packages are sufficient for this small service without a web framework.
- **Domain separated from HTTP:** Arithmetic rules can be tested directly, while transport validation and status mapping remain isolated in handler tests.
- **React with TypeScript:** React provides a compact interactive UI, and strict TypeScript makes the API and state transitions explicit.
- **Local React state:** One calculator has a small state surface; Redux, server-state libraries, or a general state machine would add complexity without value.
- **REST/JSON:** One stateless binary operation maps naturally to a small POST endpoint and is straightforward to test from both layers.
- **No database:** Calculations have no persisted state, accounts, or history.
- **Mandatory scope first:** Exponentiation, square root, percentage, and Docker are optional and were not prioritized over validation, tests, documentation, and usability.

## Assumptions and limitations

- Arithmetic uses IEEE-754 `float64`. Results can exhibit binary floating-point rounding, and very large results are rejected when they become non-finite.
- This is a general calculator, not a deployed financial product or ledger. Production monetary calculations should use a suitable decimal or fixed-point representation with explicit rounding rules.
- Each API calculation is binary and requires exactly two operands.
- Chaining is sequential and occurs only after an explicit server result; there is no expression parser or operator precedence.
- The development server relies on Vite's local proxy. Production routing, TLS, observability, rate limiting, and deployment infrastructure are outside this assessment's scope.
- No database, authentication, calculation history, advanced optional operations, or Docker configuration is included.

## AI usage disclosure

AI tooling assisted with architecture exploration, implementation, automated tests, error-handling improvements, code review, and documentation. The available prompt record, AI contributions, agent-run checks, candidate-run checks, and approvals are documented in [PROMPTS.md](PROMPTS.md). [ASSIGNMENT.md](ASSIGNMENT.md) contains the transcribed assessment requirements.

The prompt log also discloses an earlier abandoned local prototype. Its separate prompt content is not available in this workspace and has not been reconstructed or represented as part of the current prompt record.
