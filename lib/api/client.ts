import axios, { AxiosError } from "axios";

/**
 * Browser-side HTTP client.
 *
 * It talks to this app's BFF routes, never to Laravel directly. There is no
 * Authorization header here by design — the token lives in an httpOnly cookie
 * that the browser attaches automatically and JS cannot read.
 */
export const api = axios.create({
  baseURL: "/api/bff",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

/** Auth endpoints sit outside the proxy because they mint the session cookie. */
export const authApi = axios.create({
  baseURL: "/api/auth",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

/** A normalised error the UI can render without knowing about axios. */
export class ApiError extends Error {
  readonly status: number;
  /** Laravel validation errors, keyed by field name. */
  readonly errors: Record<string, string[]>;

  constructor(message: string, status: number, errors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** 402/403 is how the API signals "locked, needs an ad or Premium". */
  get isPaymentRequired(): boolean {
    return this.status === 402 || this.status === 403;
  }

  /** First message for a field, if upstream validation rejected it. */
  fieldError(field: string): string | undefined {
    return this.errors[field]?.[0];
  }
}

interface LaravelErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

function toApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;
    const body = error.response?.data as LaravelErrorBody | undefined;

    if (status === 0) {
      return new ApiError("Network error — is the API running?", 0);
    }
    return new ApiError(
      body?.message ?? error.message ?? "Something went wrong.",
      status,
      body?.errors ?? {},
    );
  }
  if (error instanceof Error) return new ApiError(error.message, 0);
  return new ApiError("Something went wrong.", 0);
}

// Normalise every failure at the boundary so callers only handle ApiError.
for (const instance of [api, authApi]) {
  instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(toApiError(error)),
  );
}
