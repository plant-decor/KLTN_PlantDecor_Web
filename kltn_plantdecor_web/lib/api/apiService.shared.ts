export function normalizeApiError(
  err: unknown,
  method: string,
  url: string,
  isServer: boolean
): Error {
  const base = `[API ${method}] ${url}`;

  if (typeof err === "object" && err !== null) {
    const errorLike = err as {
      message?: string;
      response?: { status?: number; data?: unknown };
    };
    const status = errorLike.response?.status;
    const detail =
      typeof errorLike.response?.data === "string"
        ? errorLike.response.data
        : errorLike.message || "Unknown request error";
    const message = status
      ? `${base} failed with status ${status}: ${detail}`
      : `${base} failed: ${detail}`;

    if (isServer) {
      console.error(message, errorLike.response?.data ?? err);
    }

    return new Error(message);
  }

  return new Error(`${base} failed with a non-error exception`);
}
