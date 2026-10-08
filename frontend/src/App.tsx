import { useCallback, useEffect, useRef, useState } from "react";
import {
  calculate,
  CalculatorApiError,
  type Operation,
} from "./api/calculator";

type DisplayMode = "editing" | "result";

const operationSymbols: Record<Operation, string> = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷",
};

function App() {
  const [currentOperand, setCurrentOperand] = useState("0");
  const [firstOperand, setFirstOperand] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation | null>(null);
  const [waitingForSecond, setWaitingForSecond] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("editing");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const startFreshOperand = useCallback((value: string) => {
    setCurrentOperand(value);
    setFirstOperand(null);
    setOperation(null);
    setWaitingForSecond(false);
    setDisplayMode("editing");
    setError(null);
  }, []);

  const enterDigit = useCallback(
    (digit: string) => {
      if (isLoading) return;

      if (displayMode === "result") {
        startFreshOperand(digit);
        return;
      }

      setError(null);
      if (waitingForSecond) {
        setCurrentOperand(digit);
        setWaitingForSecond(false);
        return;
      }

      setCurrentOperand((current) => appendDigit(current, digit));
    },
    [displayMode, isLoading, startFreshOperand, waitingForSecond],
  );

  const enterDecimal = useCallback(() => {
    if (isLoading) return;

    if (displayMode === "result") {
      startFreshOperand("0.");
      return;
    }

    setError(null);
    if (waitingForSecond) {
      setCurrentOperand("0.");
      setWaitingForSecond(false);
      return;
    }

    setCurrentOperand((current) =>
      current.includes(".") ? current : `${current}.`,
    );
  }, [displayMode, isLoading, startFreshOperand, waitingForSecond]);

  const toggleSign = useCallback(() => {
    if (isLoading) return;

    setError(null);
    if (waitingForSecond) {
      setCurrentOperand("-0");
      setWaitingForSecond(false);
      return;
    }

    if (displayMode === "result") {
      setFirstOperand(null);
      setOperation(null);
      setDisplayMode("editing");
    }

    setCurrentOperand((current) =>
      current.startsWith("-") ? current.slice(1) : `-${current}`,
    );
  }, [displayMode, isLoading, waitingForSecond]);

  const backspace = useCallback(() => {
    if (isLoading || waitingForSecond) return;

    setError(null);
    if (displayMode === "result") {
      setFirstOperand(null);
      setOperation(null);
      setDisplayMode("editing");
    }

    setCurrentOperand(removeLastCharacter);
  }, [displayMode, isLoading, waitingForSecond]);

  const selectOperation = useCallback(
    (nextOperation: Operation) => {
      if (isLoading) return;

      setError(null);
      if (operation && waitingForSecond) {
        setOperation(nextOperation);
        return;
      }

      if (operation && !waitingForSecond) {
        setError("Press equals to complete the current calculation.");
        return;
      }

      if (parseOperand(currentOperand) === null) {
        setError("Please enter a valid number.");
        return;
      }

      setFirstOperand(currentOperand);
      setOperation(nextOperation);
      setWaitingForSecond(true);
      setDisplayMode("editing");
    },
    [currentOperand, isLoading, operation, waitingForSecond],
  );

  const clear = useCallback(() => {
    requestIdRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setCurrentOperand("0");
    setFirstOperand(null);
    setOperation(null);
    setWaitingForSecond(false);
    setDisplayMode("editing");
    setError(null);
    setIsLoading(false);
  }, []);

  const submit = useCallback(async () => {
    if (isLoading) return;
    if (displayMode === "result" && operation === null) return;

    if (!operation || firstOperand === null || waitingForSecond) {
      setError("Enter two numbers and choose an operator first.");
      return;
    }

    const left = parseOperand(firstOperand);
    const right = parseOperand(currentOperand);
    if (left === null || right === null) {
      setError("Please enter a valid number.");
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setError(null);
    setIsLoading(true);

    try {
      const result = await calculate(operation, [left, right], controller.signal);
      if (requestId !== requestIdRef.current || controller.signal.aborted) return;

      setCurrentOperand(String(result));
      setFirstOperand(null);
      setOperation(null);
      setWaitingForSecond(false);
      setDisplayMode("result");
    } catch (caught) {
      if (requestId !== requestIdRef.current || isAbortError(caught)) return;

      setError(
        caught instanceof CalculatorApiError
          ? caught.message
          : "Unable to process the calculation. Please try again.",
      );
    } finally {
      if (requestId === requestIdRef.current) {
        abortControllerRef.current = null;
        setIsLoading(false);
      }
    }
  }, [
    currentOperand,
    displayMode,
    firstOperand,
    isLoading,
    operation,
    waitingForSecond,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (isEditableTarget(target)) return;
      if (
        target instanceof HTMLButtonElement &&
        (event.key === "Enter" || event.key === " ")
      ) {
        return;
      }

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        enterDigit(event.key);
        return;
      }

      const operationByKey: Partial<Record<string, Operation>> = {
        "+": "add",
        "-": "subtract",
        "*": "multiply",
        "/": "divide",
      };
      const keyboardOperation = operationByKey[event.key];
      if (keyboardOperation) {
        event.preventDefault();
        selectOperation(keyboardOperation);
        return;
      }

      switch (event.key) {
        case ".":
          event.preventDefault();
          enterDecimal();
          break;
        case "Enter":
        case "=":
          event.preventDefault();
          void submit();
          break;
        case "Backspace":
          event.preventDefault();
          backspace();
          break;
        case "Escape":
          event.preventDefault();
          clear();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [backspace, clear, enterDecimal, enterDigit, selectOperation, submit]);

  useEffect(
    () => () => {
      requestIdRef.current += 1;
      abortControllerRef.current?.abort();
    },
    [],
  );

  const expression = firstOperand
    ? `${firstOperand} ${operation ? operationSymbols[operation] : ""}`
    : "Ready";

  return (
    <main className="app-shell">
      <section className="calculator" aria-labelledby="calculator-title" aria-busy={isLoading}>
        <header className="calculator__header">
          <p className="eyebrow">API-powered arithmetic</p>
          <h1 id="calculator-title">Calculator</h1>
        </header>

        <div className="display-panel">
          <span className="expression" aria-label="Current expression">
            {expression}
          </span>
          <output className="display" aria-label="Calculator display" aria-live="polite">
            {currentOperand}
          </output>
        </div>

        <div className="feedback" aria-live="polite">
          {error ? <p role="alert">{error}</p> : null}
          {isLoading ? <p role="status">Calculating…</p> : null}
        </div>

        <div className="keypad" aria-label="Calculator keypad">
          <CalculatorButton className="utility" label="Clear" onClick={clear}>
            C
          </CalculatorButton>
          <CalculatorButton
            className="utility"
            label="Toggle sign"
            disabled={isLoading}
            onClick={toggleSign}
          >
            +/−
          </CalculatorButton>
          <CalculatorButton
            className="utility"
            label="Backspace"
            disabled={isLoading}
            onClick={backspace}
          >
            ⌫
          </CalculatorButton>
          <OperatorButton operation="divide" selected={operation === "divide"} onClick={selectOperation} disabled={isLoading}>
            ÷
          </OperatorButton>

          {["7", "8", "9"].map((digit) => (
            <DigitButton key={digit} digit={digit} onClick={enterDigit} disabled={isLoading} />
          ))}
          <OperatorButton operation="multiply" selected={operation === "multiply"} onClick={selectOperation} disabled={isLoading}>
            ×
          </OperatorButton>

          {["4", "5", "6"].map((digit) => (
            <DigitButton key={digit} digit={digit} onClick={enterDigit} disabled={isLoading} />
          ))}
          <OperatorButton operation="subtract" selected={operation === "subtract"} onClick={selectOperation} disabled={isLoading}>
            −
          </OperatorButton>

          {["1", "2", "3"].map((digit) => (
            <DigitButton key={digit} digit={digit} onClick={enterDigit} disabled={isLoading} />
          ))}
          <OperatorButton operation="add" selected={operation === "add"} onClick={selectOperation} disabled={isLoading}>
            +
          </OperatorButton>

          <DigitButton digit="0" className="zero" onClick={enterDigit} disabled={isLoading} />
          <CalculatorButton label="Decimal point" disabled={isLoading} onClick={enterDecimal}>
            .
          </CalculatorButton>
          <CalculatorButton className="equals" label="Equals" disabled={isLoading} onClick={() => void submit()}>
            =
          </CalculatorButton>
        </div>
      </section>

      <p className="service-note">Calculations are performed by the Go service.</p>
    </main>
  );
}

interface CalculatorButtonProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  pressed?: boolean;
}

function CalculatorButton({
  children,
  className = "",
  disabled = false,
  label,
  onClick,
  pressed,
}: CalculatorButtonProps) {
  return (
    <button
      type="button"
      className={`key ${className}`.trim()}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface DigitButtonProps {
  className?: string;
  digit: string;
  disabled: boolean;
  onClick: (digit: string) => void;
}

function DigitButton({ className, digit, disabled, onClick }: DigitButtonProps) {
  return (
    <CalculatorButton
      className={className}
      label={digit}
      disabled={disabled}
      onClick={() => onClick(digit)}
    >
      {digit}
    </CalculatorButton>
  );
}

interface OperatorButtonProps {
  children: React.ReactNode;
  disabled: boolean;
  operation: Operation;
  onClick: (operation: Operation) => void;
  selected: boolean;
}

function OperatorButton({
  children,
  disabled,
  operation,
  onClick,
  selected,
}: OperatorButtonProps) {
  const labels: Record<Operation, string> = {
    add: "Add",
    subtract: "Subtract",
    multiply: "Multiply",
    divide: "Divide",
  };

  return (
    <CalculatorButton
      className="operator"
      label={labels[operation]}
      disabled={disabled}
      onClick={() => onClick(operation)}
      pressed={selected}
    >
      {children}
    </CalculatorButton>
  );
}

function appendDigit(current: string, digit: string): string {
  if (current === "0") return digit;
  if (current === "-0") return digit === "0" ? current : `-${digit}`;
  return `${current}${digit}`;
}

function removeLastCharacter(current: string): string {
  const next = current.slice(0, -1);
  return next === "" || next === "-" ? "0" : next;
}

function parseOperand(value: string): number | null {
  if (value.endsWith(".")) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException && error.name === "AbortError"
  );
}

export default App;
