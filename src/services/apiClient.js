// ===== RIDE COMPANION API CLIENT =====
// Central client for backend/API calls.
// Pages/components should use service functions instead of calling external APIs directly.

const DEFAULT_TIMEOUT_MS = 12000;

export class ApiError extends Error {
  constructor(message, { status = 0, payload = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function buildApiUrl(path) {
  const normalizedPath = String(path || "").startsWith("/")
    ? String(path)
    : `/${path}`;

  return normalizedPath.startsWith("/api/")
    ? normalizedPath
    : `/api${normalizedPath}`;
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildApiUrl(path), {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new ApiError(
        payload?.error || payload?.message || `API request failed: ${response.status}`,
        {
          status: response.status,
          payload,
        }
      );
    }

    return payload;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new ApiError("API request timed out.");
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error?.message || "API request failed.");
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function apiGet(path, options = {}) {
  return apiRequest(path, {
    ...options,
    method: "GET",
  });
}

export function apiPost(path, body, options = {}) {
  return apiRequest(path, {
    ...options,
    method: "POST",
    body,
  });
}
