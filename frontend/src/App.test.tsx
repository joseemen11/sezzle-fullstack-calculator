import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import {
  calculate,
  CalculatorApiError,
  type Operation,
} from "./api/calculator";

vi.mock("./api/calculator", async () => {
  const actual = await vi.importActual<typeof import("./api/calculator")>(
    "./api/calculator",
  );
  return { ...actual, calculate: vi.fn() };
});

const calculateMock = vi.mocked(calculate);

describe("App", () => {
  beforeEach(() => {
    calculateMock.mockReset();
  });

  it("renders an accessible initial calculator", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Calculator" })).toBeVisible();
    expect(display()).toHaveTextContent("0");
    expect(display()).toHaveAttribute("aria-live", "polite");
    expect(screen.getByLabelText("Calculator keypad")).toBeVisible();
    expect(screen.getByRole("button", { name: "Clear" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Toggle sign" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Backspace" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Equals" })).toBeEnabled();
  });

  it("supports digit and decimal entry without duplicate decimal points", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "1" }));
    await user.click(screen.getByRole("button", { name: "Decimal point" }));
    await user.click(screen.getByRole("button", { name: "Decimal point" }));
    await user.click(screen.getByRole("button", { name: "5" }));

    expect(display()).toHaveTextContent("1.5");
  });

  it("supports negative operands through the sign toggle", async () => {
    const user = userEvent.setup();
    calculateMock.mockResolvedValue(-16);
    render(<App />);

    await enterNumber(user, "8");
    await user.click(screen.getByRole("button", { name: "Multiply" }));
    await user.click(screen.getByRole("button", { name: "Toggle sign" }));
    await enterNumber(user, "2");
    await user.click(screen.getByRole("button", { name: "Equals" }));

    await waitFor(() =>
      expect(calculateMock).toHaveBeenCalledWith(
        "multiply",
        [8, -2],
        expect.any(AbortSignal),
      ),
    );
    expect(display()).toHaveTextContent("-16");
  });

  it.each<[string, Operation, string, number]>([
    ["addition", "add", "Add", 1101],
    ["subtraction", "subtract", "Subtract", 2202],
    ["multiplication", "multiply", "Multiply", 3303],
    ["division", "divide", "Divide", 4404],
  ])("submits %s to the API and displays its returned result", async (_name, operation, buttonName, serverResult) => {
    const user = userEvent.setup();
    calculateMock.mockResolvedValue(serverResult);
    render(<App />);

    await enterNumber(user, "8");
    await user.click(screen.getByRole("button", { name: buttonName }));
    await enterNumber(user, "2");
    await user.click(screen.getByRole("button", { name: "Equals" }));

    await waitFor(() =>
      expect(calculateMock).toHaveBeenCalledWith(
        operation,
        [8, 2],
        expect.any(AbortSignal),
      ),
    );
    expect(display()).toHaveTextContent(String(serverResult));
  });

  it("replaces an operator while waiting for the second operand", async () => {
    const user = userEvent.setup();
    calculateMock.mockResolvedValue(8);
    render(<App />);

    await enterNumber(user, "9");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Subtract" }));
    expect(screen.getByRole("button", { name: "Subtract" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await enterNumber(user, "1");
    await user.click(screen.getByRole("button", { name: "Equals" }));

    await waitFor(() =>
      expect(calculateMock).toHaveBeenCalledWith(
        "subtract",
        [9, 1],
        expect.any(AbortSignal),
      ),
    );
  });

  it("supports backspace and resets all expression state with Clear", async () => {
    const user = userEvent.setup();
    render(<App />);

    await enterNumber(user, "123");
    await user.click(screen.getByRole("button", { name: "Backspace" }));
    expect(display()).toHaveTextContent("12");

    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(display()).toHaveTextContent("0");
    expect(screen.getByLabelText("Current expression")).toHaveTextContent("Ready");
    expect(screen.getByRole("button", { name: "Add" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("does not send incomplete input to the API", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Decimal point" }));
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please enter a valid number.",
    );
    expect(calculateMock).not.toHaveBeenCalled();
  });

  it("shows a backend error and remains recoverable", async () => {
    const user = userEvent.setup();
    calculateMock
      .mockRejectedValueOnce(
        new CalculatorApiError("Cannot divide by zero.", "division_by_zero", 422),
      )
      .mockResolvedValueOnce(5);
    render(<App />);

    await enterNumber(user, "10");
    await user.click(screen.getByRole("button", { name: "Divide" }));
    await enterNumber(user, "0");
    await user.click(screen.getByRole("button", { name: "Equals" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Cannot divide by zero.",
    );

    await user.click(screen.getByRole("button", { name: "2" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Equals" }));
    await waitFor(() => expect(display()).toHaveTextContent("5"));
  });

  it("shows a helpful disconnected-backend error and clears it on reset", async () => {
    const user = userEvent.setup();
    calculateMock.mockRejectedValue(
      new CalculatorApiError(
        "Calculation service unavailable. Please try again.",
        "service_unavailable",
      ),
    );
    render(<App />);

    await enterNumber(user, "1");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await enterNumber(user, "2");
    await user.click(screen.getByRole("button", { name: "Equals" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Calculation service unavailable. Please try again.",
    );
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("preserves the expression and retries after a service failure", async () => {
    const user = userEvent.setup();
    calculateMock
      .mockRejectedValueOnce(
        new CalculatorApiError(
          "Calculation service unavailable. Please try again.",
          "service_unavailable",
          503,
        ),
      )
      .mockResolvedValueOnce(3);
    render(<App />);

    await enterNumber(user, "1");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await enterNumber(user, "2");
    await user.click(screen.getByRole("button", { name: "Equals" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Calculation service unavailable. Please try again.",
    );
    expect(display()).toHaveTextContent("2");
    expect(screen.getByLabelText("Current expression")).toHaveTextContent("1 +");
    expect(screen.getByRole("button", { name: "Equals" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Equals" }));
    await waitFor(() => expect(display()).toHaveTextContent("3"));
    expect(calculateMock).toHaveBeenCalledTimes(2);
    expect(calculateMock).toHaveBeenLastCalledWith(
      "add",
      [1, 2],
      expect.any(AbortSignal),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows pending state and prevents duplicate submissions", async () => {
    const user = userEvent.setup();
    const request = deferred<number>();
    calculateMock.mockReturnValue(request.promise);
    render(<App />);

    await enterNumber(user, "4");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await enterNumber(user, "5");
    const equals = screen.getByRole("button", { name: "Equals" });
    await user.click(equals);

    expect(screen.getByText("Calculating…")).toBeVisible();
    expect(equals).toBeDisabled();
    fireEvent.click(equals);
    expect(calculateMock).toHaveBeenCalledTimes(1);

    await act(async () => request.resolve(9009));
    expect(display()).toHaveTextContent("9009");
  });

  it("aborts and ignores a stale response after Clear", async () => {
    const user = userEvent.setup();
    const request = deferred<number>();
    calculateMock.mockReturnValue(request.promise);
    render(<App />);

    await enterNumber(user, "4");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await enterNumber(user, "5");
    await user.click(screen.getByRole("button", { name: "Equals" }));

    const signal = calculateMock.mock.calls[0][2];
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(signal?.aborted).toBe(true);
    expect(display()).toHaveTextContent("0");

    await act(async () => request.resolve(999));
    expect(display()).toHaveTextContent("0");
    expect(screen.queryByText("Calculating…")).not.toBeInTheDocument();
  });

  it("reuses a server result and starts fresh when a digit follows a result", async () => {
    const user = userEvent.setup();
    calculateMock.mockResolvedValueOnce(12).mockResolvedValueOnce(36);
    render(<App />);

    await enterNumber(user, "7");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await enterNumber(user, "5");
    await user.click(screen.getByRole("button", { name: "Equals" }));
    await waitFor(() => expect(display()).toHaveTextContent("12"));

    await user.click(screen.getByRole("button", { name: "Multiply" }));
    await enterNumber(user, "3");
    await user.click(screen.getByRole("button", { name: "Equals" }));
    await waitFor(() =>
      expect(calculateMock).toHaveBeenLastCalledWith(
        "multiply",
        [12, 3],
        expect.any(AbortSignal),
      ),
    );
    expect(display()).toHaveTextContent("36");

    await user.click(screen.getByRole("button", { name: "8" }));
    expect(display()).toHaveTextContent("8");
    expect(screen.getByLabelText("Current expression")).toHaveTextContent("Ready");
  });

  it("supports keyboard entry, calculation, backspace, and clear", async () => {
    calculateMock.mockResolvedValue(77);
    render(<App />);

    fireEvent.keyDown(window, { key: "4" });
    fireEvent.keyDown(window, { key: "2" });
    fireEvent.keyDown(window, { key: "Backspace" });
    expect(display()).toHaveTextContent("4");
    fireEvent.keyDown(window, { key: "+" });
    fireEvent.keyDown(window, { key: "3" });
    fireEvent.keyDown(window, { key: "Enter" });

    await waitFor(() =>
      expect(calculateMock).toHaveBeenCalledWith(
        "add",
        [4, 3],
        expect.any(AbortSignal),
      ),
    );
    expect(display()).toHaveTextContent("77");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(display()).toHaveTextContent("0");
  });
});

function display(): HTMLElement {
  return screen.getByLabelText("Calculator display");
}

async function enterNumber(
  user: ReturnType<typeof userEvent.setup>,
  value: string,
): Promise<void> {
  for (const character of value) {
    await user.click(screen.getByRole("button", { name: character }));
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}
