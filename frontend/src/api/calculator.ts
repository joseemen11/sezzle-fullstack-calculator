export type Operation = "add" | "subtract" | "multiply" | "divide";

interface CalculateSuccess {
  result: number;
}

interface ErrorPayload {
  error: {
    code: string;
    message: string;
  };
}

const messages = {
  serviceUnavailable: "Calculation service unavailable. Please try again.",
  divisionByZero: "Cannot divide by zero.",
  invalidNumber: "Please enter a valid number.",
  nonFiniteResult: "The result is outside the supported range.",
  unexpectedResponse: "Unable to process the calculation. Please try again.",
} as const;

export class CalculatorApiError extends Error {
  readonly code: string;
  readonly status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = "CalculatorApiError";
    this.code = code;
    this.status = status;
  }
}

export async function calculate(
  operation: Operation,
  operands: [number, number],
  signal?: AbortSignal,
): Promise<number> {
  let response: Response;

  try {
    response = await fetch("/api/v1/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation, operands }),
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    throw new CalculatorApiError(
      messages.serviceUnavailable,
      "service_unavailable",
    );
  }

  const payload = await readJSON(response);

  if (!response.ok) {
    if (response.status >= 500 && response.status <= 599) {
      throw new CalculatorApiError(
        messages.serviceUnavailable,
        "service_unavailable",
        response.status,
      );
    }

    if (isErrorPayload(payload)) {
      throw structuredError(payload, response.status);
    }

    throw new CalculatorApiError(
      messages.unexpectedResponse,
      "unexpected_response",
      response.status,
    );
  }

  if (!isCalculateSuccess(payload)) {
    throw new CalculatorApiError(
      messages.unexpectedResponse,
      "invalid_response",
      response.status,
    );
  }

  return payload.result;
}

function structuredError(payload: ErrorPayload, status: number): CalculatorApiError {
  switch (payload.error.code) {
    case "division_by_zero":
      return new CalculatorApiError(
        messages.divisionByZero,
        payload.error.code,
        status,
      );
    case "invalid_request":
      return new CalculatorApiError(
        messages.invalidNumber,
        payload.error.code,
        status,
      );
    case "non_finite_result":
      return new CalculatorApiError(
        messages.nonFiniteResult,
        payload.error.code,
        status,
      );
    default:
      return new CalculatorApiError(
        messages.unexpectedResponse,
        payload.error.code,
        status,
      );
  }
}

async function readJSON(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function isCalculateSuccess(payload: unknown): payload is CalculateSuccess {
  if (!isRecord(payload)) {
    return false;
  }

  return typeof payload.result === "number" && Number.isFinite(payload.result);
}

function isErrorPayload(payload: unknown): payload is ErrorPayload {
  if (!isRecord(payload) || !isRecord(payload.error)) {
    return false;
  }

  return (
    typeof payload.error.code === "string" &&
    typeof payload.error.message === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (isRecord(error) && error.name === "AbortError")
  );
}
