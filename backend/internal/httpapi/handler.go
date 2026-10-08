// Package httpapi exposes the calculator domain over HTTP.
package httpapi

import (
	"encoding/json"
	"errors"
	"io"
	"mime"
	"net/http"

	"sezzle-calculator/backend/internal/calculator"
)

const maxRequestBodyBytes int64 = 1 << 20

type calculateRequest struct {
	Operation *string     `json:"operation"`
	Operands  *[]*float64 `json:"operands"`
}

type calculateResponse struct {
	Result float64 `json:"result"`
}

type healthResponse struct {
	Status string `json:"status"`
}

type errorResponse struct {
	Error apiError `json:"error"`
}

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// NewHandler returns the complete HTTP handler for the service.
func NewHandler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/calculate", handleCalculate)
	mux.HandleFunc("/health", handleHealth)
	return mux
}

func handleCalculate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		methodNotAllowed(w, http.MethodPost)
		return
	}

	if !isJSON(r.Header.Get("Content-Type")) {
		writeError(w, http.StatusUnsupportedMediaType, "unsupported_media_type", "Content-Type must be application/json")
		return
	}

	if r.ContentLength > maxRequestBodyBytes {
		writeError(w, http.StatusRequestEntityTooLarge, "request_too_large", "Request body is too large")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxRequestBodyBytes)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	var request calculateRequest
	if err := decoder.Decode(&request); err != nil {
		writeDecodeError(w, err)
		return
	}
	if err := ensureJSONEnds(decoder); err != nil {
		writeDecodeError(w, err)
		return
	}

	if request.Operation == nil || request.Operands == nil || len(*request.Operands) != 2 {
		writeError(w, http.StatusBadRequest, "invalid_request", "Invalid request")
		return
	}

	operands := make([]float64, 2)
	for i, operand := range *request.Operands {
		if operand == nil {
			writeError(w, http.StatusBadRequest, "invalid_request", "Invalid request")
			return
		}
		operands[i] = *operand
	}

	result, err := calculator.Calculate(*request.Operation, operands)
	if err != nil {
		writeCalculationError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, calculateResponse{Result: result})
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w, http.MethodGet)
		return
	}

	writeJSON(w, http.StatusOK, healthResponse{Status: "ok"})
}

func isJSON(contentType string) bool {
	mediaType, _, err := mime.ParseMediaType(contentType)
	return err == nil && mediaType == "application/json"
}

func ensureJSONEnds(decoder *json.Decoder) error {
	var extra any
	if err := decoder.Decode(&extra); err == nil {
		return errors.New("request body must contain exactly one JSON value")
	} else if err != io.EOF {
		return err
	}
	return nil
}

func writeDecodeError(w http.ResponseWriter, err error) {
	var maxBytesError *http.MaxBytesError
	if errors.As(err, &maxBytesError) {
		writeError(w, http.StatusRequestEntityTooLarge, "request_too_large", "Request body is too large")
		return
	}
	writeError(w, http.StatusBadRequest, "invalid_request", "Invalid request")
}

func writeCalculationError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, calculator.ErrInvalidOperandCount), errors.Is(err, calculator.ErrNonFiniteOperand):
		writeError(w, http.StatusBadRequest, "invalid_request", "Invalid request")
	case errors.Is(err, calculator.ErrUnsupportedOperation):
		writeError(w, http.StatusUnprocessableEntity, "unsupported_operation", "Unsupported operation")
	case errors.Is(err, calculator.ErrDivisionByZero):
		writeError(w, http.StatusUnprocessableEntity, "division_by_zero", "Cannot divide by zero")
	case errors.Is(err, calculator.ErrNonFiniteResult):
		writeError(w, http.StatusUnprocessableEntity, "non_finite_result", "Result must be finite")
	default:
		writeError(w, http.StatusInternalServerError, "internal_error", "Internal server error")
	}
}

func methodNotAllowed(w http.ResponseWriter, allowedMethod string) {
	w.Header().Set("Allow", allowedMethod)
	writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "Method not allowed")
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, errorResponse{Error: apiError{Code: code, Message: message}})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
