import { refreshTokenAction } from "@/app/actions/authenticationActions";
import {
  clearClientAccessTokenState,
  getClientAccessToken,
  getClientRefreshToken,
  setClientAccessToken,
  setClientRefreshToken,
} from "@/lib/axios/tokenStorage";
import { useAuthStore } from "@/lib/store/authStore";

type Options = {
  forceRefresh?: boolean;
  minTtlMs?: number;
  redirectOnFailure?: boolean;
};

const DEFAULT_MIN_TTL_MS = 20_000;

let refreshPromise: Promise<string> | null = null;

const isDebugAuthEnabled = () => process.env.NEXT_PUBLIC_DEBUG_AUTH === "1";

const getLoginPath = () => {
  if (typeof window === "undefined") return "/login?forceLogout=1";

  const locale = window.location.pathname.split("/")[1];
  const supportedLocales = new Set(["vi", "en"]);
  const loginBase = supportedLocales.has(locale) ? `/${locale}/login` : "/login";
  return `${loginBase}?forceLogout=1`;
};

const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  window.location.replace(getLoginPath());
};

export async function getValidAccessToken(options: Options = {}): Promise<string> {
  const {
    forceRefresh = false,
    minTtlMs = DEFAULT_MIN_TTL_MS,
    redirectOnFailure = true,
  } = options;

  const token = getClientAccessToken();
  const expiresAt = useAuthStore.getState().accessTokenExpiresAt;
  const remainingMs = typeof expiresAt === "number" ? expiresAt - Date.now() : null;

  const hasUsableToken =
    !!token &&
    token.trim().length > 0 &&
    (remainingMs === null || !Number.isFinite(remainingMs) || remainingMs > minTtlMs);

  if (!forceRefresh && hasUsableToken) {
    return token!;
  }

  if (refreshPromise) {
    if (isDebugAuthEnabled()) {
      console.log("[auth] getValidAccessToken: waiting for in-flight refresh");
    }
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = getClientRefreshToken();
      const authState = useAuthStore.getState();
      const hasAuthContext = authState.isAuthenticated || !!authState.user;

      if (isDebugAuthEnabled()) {
        console.log("[auth] getValidAccessToken: refresh needed", {
          forceRefresh,
          remainingMs,
          minTtlMs,
          hasRefreshToken: Boolean(refreshToken),
          hasAuthContext,
        });
      }

      if (!refreshToken && !hasAuthContext) {
        clearClientAccessTokenState();
        if (redirectOnFailure) redirectToLogin();
        return "";
      }

      const refreshed = refreshToken
        ? await refreshTokenAction({ refreshToken })
        : await refreshTokenAction();

      if (!refreshed.success || !refreshed.token) {
        if (isDebugAuthEnabled()) {
          console.log("[auth] refreshTokenAction failed", refreshed);
        }
        clearClientAccessTokenState();
        if (redirectOnFailure) redirectToLogin();
        return "";
      }

      setClientAccessToken(refreshed.token, refreshed.expiresIn);
      if (refreshed.refreshToken) {
        setClientRefreshToken(refreshed.refreshToken);
      }

      if (isDebugAuthEnabled()) {
        console.log("[auth] refreshTokenAction success: access token updated", {
          expiresIn: refreshed.expiresIn,
          rotatedRefreshToken: Boolean(refreshed.refreshToken),
        });
      }

      return refreshed.token;
    } catch (error) {
      console.error("getValidAccessToken refresh failed:", error);
      clearClientAccessTokenState();
      if (redirectOnFailure) redirectToLogin();
      return "";
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

