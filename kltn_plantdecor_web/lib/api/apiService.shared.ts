export function normalizeApiError(
  err: unknown,
  method: string,
  url: string,
  isServer: boolean,
): Error {
  const base = `[API ${method}] ${url}`;

  const extractResponseMessage = (data: unknown): string | undefined => {
    if (typeof data === "string") {
      return data;
    }

    if (typeof data === "object" && data !== null) {
      const responseData = data as {
        message?: unknown;
        error?: unknown;
        title?: unknown;
        errors?: unknown;
      };

      if (
        typeof responseData.message === "string" &&
        responseData.message.trim()
      ) {
        return responseData.message;
      }

      if (typeof responseData.error === "string" && responseData.error.trim()) {
        return responseData.error;
      }

      if (typeof responseData.title === "string" && responseData.title.trim()) {
        return responseData.title;
      }

      if (
        typeof responseData.errors === "object" &&
        responseData.errors !== null
      ) {
        const firstError = Object.values(
          responseData.errors as Record<string, unknown>,
        )
          .flatMap((value) => (Array.isArray(value) ? value : [value]))
          .find((value) => typeof value === "string" && value.trim());

        if (typeof firstError === "string") {
          return firstError;
        }
      }
    }

    return undefined;
  };

  if (typeof err === "object" && err !== null) {
    const errorLike = err as {
      message?: string;
      response?: { status?: number; data?: unknown };
    };
    const detail =
      extractResponseMessage(errorLike.response?.data) ||
      errorLike.message ||
      "Unknown request error";
    const message = detail.trim() ? detail : base;

    if (isServer) {
      console.error(message, errorLike.response?.data ?? err);
    }

    return Error(message);
  }

  return new Error(`${base} failed with a non-error exception`);
}
