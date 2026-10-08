import { afterEach, describe, expect, it, vi } from "vitest";
import { calculate, CalculatorApiError } from "./calculator";

describe("calculate", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the expected request and returns a valid result", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      responseWith({ result: 42 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(calculate("add", [17, 25])).resolves.toBe(42);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "add", operands: [17, 25] }),
      signal: undefined,
    });
  });

  it("preserves a structured backend error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        responseWith(
          {
            error: {
              code: "division_by_zero",
              message: "Cannot divide by zero",
            },
          },
          422,
        ),
      ),
    );

    const error = await calculate("divide", [10, 0]).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(CalculatorApiError);
    expect(error).toMatchObject({
      message: "Cannot divide by zero.",
      code: "division_by_zero",
      status: 422,
    });
  });

  it.each([500, 502, 503, 504])(
    "classifies a non-JSON HTTP %i response as service unavailability",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response("Gateway unavailable", { status }),
        ),
      );

      await expect(calculate("add", [1, 2])).rejects.toMatchObject({
        message: "Calculation service unavailable. Please try again.",
        code: "service_unavailable",
        status,
      });
    },
  );

  it("does not expose an unexpected non-JSON 4xx response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Internal details", { status: 418 })),
    );

    await expect(calculate("add", [1, 2])).rejects.toMatchObject({
      message: "Unable to process the calculation. Please try again.",
      code: "unexpected_response",
      status: 418,
    });
  });

  it("reports network failures with a helpful message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    await expect(calculate("add", [1, 2])).rejects.toMatchObject({
      message: "Calculation service unavailable. Please try again.",
      code: "service_unavailable",
    });
  });

  it.each([
    ["invalid_request", "Please enter a valid number."],
    ["non_finite_result", "The result is outside the supported range."],
  ])("maps structured %s errors to safe user-facing text", async (code, message) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        responseWith({ error: { code, message: "Internal backend wording" } }, 422),
      ),
    );

    await expect(calculate("add", [1, 2])).rejects.toMatchObject({
      message,
      code,
      status: 422,
    });
  });

  it("treats malformed JSON in an HTTP 200 response as a contract failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("{not-json", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(calculate("add", [1, 2])).rejects.toMatchObject({
      message: "Unable to process the calculation. Please try again.",
      code: "invalid_response",
      status: 200,
    });
  });

  it.each([
    ["missing result", {}],
    ["string result", { result: "3" }],
    ["non-finite result", { result: Number.POSITIVE_INFINITY }],
  ])("rejects an invalid successful payload: %s", async (_name, payload) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(responseWith(payload)));

    await expect(calculate("add", [1, 2])).rejects.toMatchObject({
      message: "Unable to process the calculation. Please try again.",
      code: "invalid_response",
      status: 200,
    });
  });

  it("passes through request cancellation", async () => {
    const abortError = new DOMException("The operation was aborted", "AbortError");
    const fetchMock = vi.fn().mockRejectedValue(abortError);
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();

    await expect(
      calculate("subtract", [5, 3], controller.signal),
    ).rejects.toBe(abortError);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/calculate",
      expect.objectContaining({ signal: controller.signal }),
    );
  });
});

function responseWith(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
