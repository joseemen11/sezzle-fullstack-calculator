package httpapi_test

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"sezzle-calculator/backend/internal/httpapi"
)

func TestHealth(t *testing.T) {
	t.Parallel()

	response := serve(t, http.MethodGet, "/health", "", "")
	assertResponse(t, response, http.StatusOK, `{"status":"ok"}`+"\n")
}

func TestCalculateSuccess(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		body string
		want string
	}{
		{name: "add", body: `{"operation":"add","operands":[10,5]}`, want: `{"result":15}` + "\n"},
		{name: "subtract", body: `{"operation":"subtract","operands":[10,4]}`, want: `{"result":6}` + "\n"},
		{name: "multiply", body: `{"operation":"multiply","operands":[-2.5,4]}`, want: `{"result":-10}` + "\n"},
		{name: "divide", body: `{"operation":"divide","operands":[7.5,2.5]}`, want: `{"result":3}` + "\n"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			response := serve(t, http.MethodPost, "/api/v1/calculate", tt.body, "application/json; charset=utf-8")
			assertResponse(t, response, http.StatusOK, tt.want)
		})
	}
}

func TestCalculateRequestErrors(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		body        string
		contentType string
		wantStatus  int
		wantCode    string
		wantMessage string
	}{
		{name: "missing content type", body: `{}`, wantStatus: http.StatusUnsupportedMediaType, wantCode: "unsupported_media_type", wantMessage: "Content-Type must be application/json"},
		{name: "wrong content type", body: `{}`, contentType: "text/plain", wantStatus: http.StatusUnsupportedMediaType, wantCode: "unsupported_media_type", wantMessage: "Content-Type must be application/json"},
		{name: "malformed content type", body: `{}`, contentType: `application/json; charset="`, wantStatus: http.StatusUnsupportedMediaType, wantCode: "unsupported_media_type", wantMessage: "Content-Type must be application/json"},
		{name: "empty body", body: "", contentType: "application/json", wantStatus: http.StatusBadRequest, wantCode: "invalid_request", wantMessage: "Invalid request"},
		{name: "malformed JSON", body: `{"operation":`, contentType: "application/json", wantStatus: http.StatusBadRequest, wantCode: "invalid_request", wantMessage: "Invalid request"},
		{name: "unknown field", body: `{"operation":"add","operands":[1,2],"extra":true}`, contentType: "application/json", wantStatus: http.StatusBadRequest, wantCode: "invalid_request", wantMessage: "Invalid request"},
		{name: "trailing JSON", body: `{"operation":"add","operands":[1,2]} {}`, contentType: "application/json", wantStatus: http.StatusBadRequest, wantCode: "invalid_request", wantMessage: "Invalid request"},
		{name: "missing operation", body: `{"operands":[1,2]}`, contentType: "application/json", wantStatus: http.StatusBadRequest, wantCode: "invalid_request", wantMessage: "Invalid request"},
		{name: "null operation", body: `{"operation":null,"operands":[1,2]}`, contentType: "application/json", wantStatus: http.StatusBadRequest, wantCode: "invalid_request", wantMessage: "Invalid request"},
		{name: "missing operands", body: `{"operation":"add"}`, contentType: "application/json", wantStatus: http.StatusBadRequest, wantCode: "invalid_request", wantMessage: "Invalid request"},
		{name: "null operands", body: `{"operation":"add","operands":null}`, contentType: "application/json", wantStatus: http.StatusBadRequest, wantCode: "invalid_request", wantMessage: "Invalid request"},
		{name: "null operand entry", body: `{"operation":"add","operands":[1,null]}`, contentType: "application/json", wantStatus: http.StatusBadRequest, wantCode: "invalid_request", wantMessage: "Invalid request"},
		{name: "string operand", body: `{"operation":"add","operands":[1,"2"]}`, contentType: "application/json", wantStatus: http.StatusBadRequest, wantCode: "invalid_request", wantMessage: "Invalid request"},
		{name: "boolean operand", body: `{"operation":"add","operands":[1,true]}`, contentType: "application/json", wantStatus: http.StatusBadRequest, wantCode: "invalid_request", wantMessage: "Invalid request"},
		{name: "too few operands", body: `{"operation":"add","operands":[1]}`, contentType: "application/json", wantStatus: http.StatusBadRequest, wantCode: "invalid_request", wantMessage: "Invalid request"},
		{name: "too many operands", body: `{"operation":"add","operands":[1,2,3]}`, contentType: "application/json", wantStatus: http.StatusBadRequest, wantCode: "invalid_request", wantMessage: "Invalid request"},
		{name: "out of range number", body: `{"operation":"add","operands":[1e400,2]}`, contentType: "application/json", wantStatus: http.StatusBadRequest, wantCode: "invalid_request", wantMessage: "Invalid request"},
		{name: "unsupported operation", body: `{"operation":"power","operands":[2,3]}`, contentType: "application/json", wantStatus: http.StatusUnprocessableEntity, wantCode: "unsupported_operation", wantMessage: "Unsupported operation"},
		{name: "positive zero divisor", body: `{"operation":"divide","operands":[10,0]}`, contentType: "application/json", wantStatus: http.StatusUnprocessableEntity, wantCode: "division_by_zero", wantMessage: "Cannot divide by zero"},
		{name: "negative zero divisor", body: `{"operation":"divide","operands":[10,-0]}`, contentType: "application/json", wantStatus: http.StatusUnprocessableEntity, wantCode: "division_by_zero", wantMessage: "Cannot divide by zero"},
		{name: "overflow", body: `{"operation":"multiply","operands":[1.7976931348623157e308,2]}`, contentType: "application/json", wantStatus: http.StatusUnprocessableEntity, wantCode: "non_finite_result", wantMessage: "Result must be finite"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			response := serve(t, http.MethodPost, "/api/v1/calculate", tt.body, tt.contentType)
			assertAPIError(t, response, tt.wantStatus, tt.wantCode, tt.wantMessage)
		})
	}
}

func TestCalculateRejectsOversizedRequest(t *testing.T) {
	t.Parallel()

	body := strings.Repeat(" ", (1<<20)+1)
	response := serve(t, http.MethodPost, "/api/v1/calculate", body, "application/json")
	assertAPIError(t, response, http.StatusRequestEntityTooLarge, "request_too_large", "Request body is too large")
}

func TestMethodNotAllowed(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name      string
		method    string
		path      string
		allow     string
		body      string
		mediaType string
	}{
		{name: "calculate", method: http.MethodGet, path: "/api/v1/calculate", allow: http.MethodPost},
		{name: "health", method: http.MethodPost, path: "/health", allow: http.MethodGet, body: `{}`, mediaType: "application/json"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			response := serve(t, tt.method, tt.path, tt.body, tt.mediaType)
			defer response.Body.Close()
			if got := response.Header.Get("Allow"); got != tt.allow {
				t.Errorf("Allow header = %q, want %q", got, tt.allow)
			}
			assertAPIErrorBody(t, response, http.StatusMethodNotAllowed, "method_not_allowed", "Method not allowed")
		})
	}
}

func serve(t *testing.T, method, path, body, contentType string) *http.Response {
	t.Helper()

	request := httptest.NewRequest(method, path, strings.NewReader(body))
	if contentType != "" {
		request.Header.Set("Content-Type", contentType)
	}
	recorder := httptest.NewRecorder()
	httpapi.NewHandler().ServeHTTP(recorder, request)
	return recorder.Result()
}

func assertResponse(t *testing.T, response *http.Response, wantStatus int, wantBody string) {
	t.Helper()
	defer response.Body.Close()

	if response.StatusCode != wantStatus {
		t.Errorf("status = %d, want %d", response.StatusCode, wantStatus)
	}
	if got := response.Header.Get("Content-Type"); got != "application/json" {
		t.Errorf("Content-Type = %q, want %q", got, "application/json")
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		t.Fatalf("read response body: %v", err)
	}
	if got := string(body); got != wantBody {
		t.Errorf("body = %q, want %q", got, wantBody)
	}
}

func assertAPIError(t *testing.T, response *http.Response, wantStatus int, wantCode, wantMessage string) {
	t.Helper()
	defer response.Body.Close()
	assertAPIErrorBody(t, response, wantStatus, wantCode, wantMessage)
}

func assertAPIErrorBody(t *testing.T, response *http.Response, wantStatus int, wantCode, wantMessage string) {
	t.Helper()

	if response.StatusCode != wantStatus {
		t.Errorf("status = %d, want %d", response.StatusCode, wantStatus)
	}
	if got := response.Header.Get("Content-Type"); got != "application/json" {
		t.Errorf("Content-Type = %q, want %q", got, "application/json")
	}

	var payload struct {
		Error struct {
			Code    string `json:"code"`
			Message string `json:"message"`
		} `json:"error"`
	}
	if err := json.NewDecoder(response.Body).Decode(&payload); err != nil {
		t.Fatalf("decode error response: %v", err)
	}
	if payload.Error.Code != wantCode {
		t.Errorf("error code = %q, want %q", payload.Error.Code, wantCode)
	}
	if payload.Error.Message != wantMessage {
		t.Errorf("error message = %q, want %q", payload.Error.Message, wantMessage)
	}
}
