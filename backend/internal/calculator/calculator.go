// Package calculator implements the arithmetic rules independently of HTTP.
package calculator

import (
	"errors"
	"math"
)

var (
	ErrInvalidOperandCount  = errors.New("exactly two operands are required")
	ErrUnsupportedOperation = errors.New("unsupported operation")
	ErrNonFiniteOperand     = errors.New("operands must be finite")
	ErrDivisionByZero       = errors.New("cannot divide by zero")
	ErrNonFiniteResult      = errors.New("result must be finite")
)

// Calculate applies operation to two ordered operands.
func Calculate(operation string, operands []float64) (float64, error) {
	if len(operands) != 2 {
		return 0, ErrInvalidOperandCount
	}

	for _, operand := range operands {
		if math.IsNaN(operand) || math.IsInf(operand, 0) {
			return 0, ErrNonFiniteOperand
		}
	}

	left, right := operands[0], operands[1]
	var result float64

	switch operation {
	case "add":
		result = left + right
	case "subtract":
		result = left - right
	case "multiply":
		result = left * right
	case "divide":
		if right == 0 {
			return 0, ErrDivisionByZero
		}
		result = left / right
	default:
		return 0, ErrUnsupportedOperation
	}

	if math.IsNaN(result) || math.IsInf(result, 0) {
		return 0, ErrNonFiniteResult
	}

	return result, nil
}
