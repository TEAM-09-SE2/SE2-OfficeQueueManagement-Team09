// Calls the backend API. In development the Vite server forwards /api to the
// backend (see vite.config.js), so paths are relative.

const UNREACHABLE_MESSAGE = "Cannot reach the server. Check that the backend is running.";

// Error returned by the API ({ error: { code, message } }), or a network error
// (status 0) when the backend cannot be reached.
export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Returns the JSON body, or null for an empty response (204).
export async function apiRequest(path, { method = "GET", signal } = {}) {
  let response;
  try {
    response = await fetch(path, { method, signal });
  } catch (err) {
    if (err.name === "AbortError") {
      throw err;
    }
    throw new ApiError(0, "NETWORK_ERROR", UNREACHABLE_MESSAGE);
  }

  if (response.status === 204) {
    return null;
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    // The API always answers errors with { error: { code, message } }. A server
    // error without it comes from something in between, e.g. the development
    // proxy when the backend is not running.
    if (!body?.error && response.status >= 500) {
      throw new ApiError(0, "NETWORK_ERROR", UNREACHABLE_MESSAGE);
    }
    throw new ApiError(
      response.status,
      body?.error?.code ?? "UNKNOWN_ERROR",
      body?.error?.message ?? `The server answered with error ${response.status}.`,
    );
  }
  return body;
}
