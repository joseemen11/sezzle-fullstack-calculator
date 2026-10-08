package calculator

import (
	"errors"
	"math"
	"testing"
)

func TestCalculateSuccess(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		operation  string
		operands   []float64
		wantResult float64
	}{
		{name: "add", operation: "add", operands: []float64{10, 5}, wantResult: 15},
		{name: "subtract", operation: "subtract", operands: []float64{10, 5}, wantResult: 5},
		{name: "multiply", operation: "multiply", operands: []float64{10, 5}, wantResult: 50},
		{name: "divide", operation: "divide", operands: []float64{10, 5}, wantResult: 2},
		{name: "negative numbers", operation: "add", operands: []float64{-8, -2}, wantResult: -10},
		{name: "decimal operands", operation: "subtract", operands: []float64{2.75, 1.25}, wantResult: 1.5},
		{name: "divide by negative number", operation: "divide", operands: []float64{9, -3}, wantResult: -3},
		{name: "positive zero operand", operation: "add", operands: []float64{7, 0}, wantResult: 7},
		{name: "negative zero operand", operation: "multiply", operands: []float64{7, math.Copysign(0, -1)}, wantResult: math.Copysign(0, -1)},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := Calculate(tt.operation, tt.operands)
			if err != nil {
				t.Fatalf("Calculate() error = %v", err)
			}
			if got != tt.wantResult || math.Signbit(got) != math.Signbit(tt.wantResult) {
				t.Errorf("Calculate() = %v, want %v", got, tt.wantResult)
			}
		})
	}
}

func TestCalculateErrors(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name      string
		operation string
		operands  []float64
		wantError error
	}{
		{name: "no operands", operation: "add", operands: nil, wantError: ErrInvalidOperandCount},
		{name: "one operand", operation: "add", operands: []float64{1}, wantError: ErrInvalidOperandCount},
		{name: "extra operand", operation: "add", operands: []float64{1, 2, 3}, wantError: ErrInvalidOperandCount},
		{name: "unsupported operation", operation: "power", operands: []float64{2, 3}, wantError: ErrUnsupportedOperation},
		{name: "positive zero divisor", operation: "divide", operands: []float64{1, 0}, wantError: ErrDivisionByZero},
		{name: "negative zero divisor", operation: "divide", operands: []float64{1, math.Copysign(0, -1)}, wantError: ErrDivisionByZero},
		{name: "positive infinity input", operation: "add", operands: []float64{math.Inf(1), 1}, wantError: ErrNonFiniteOperand},
		{name: "negative infinity input", operation: "add", operands: []float64{math.Inf(-1), 1}, wantError: ErrNonFiniteOperand},
		{name: "NaN input", operation: "add", operands: []float64{math.NaN(), 1}, wantError: ErrNonFiniteOperand},
		{name: "addition overflow", operation: "add", operands: []float64{math.MaxFloat64, math.MaxFloat64}, wantError: ErrNonFiniteResult},
		{name: "multiplication overflow", operation: "multiply", operands: []float64{math.MaxFloat64, 2}, wantError: ErrNonFiniteResult},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			_, err := Calculate(tt.operation, tt.operands)
			if !errors.Is(err, tt.wantError) {
				t.Errorf("Calculate() error = %v, want %v", err, tt.wantError)
			}
		})
	}
}
