const AUTH_SESSION_INVALIDATED_EVENT = 'auth:session-invalidated';

let hasDispatchedInCurrentPage = false;

export type SessionInvalidatedReason = 'unauthorized' | 'revoked' | 'expired';

export function dispatchSessionInvalidated(reason: SessionInvalidatedReason = 'unauthorized') {
  if (typeof window === 'undefined') return;
  if (hasDispatchedInCurrentPage) return;

  hasDispatchedInCurrentPage = true;
  window.dispatchEvent(
    new CustomEvent(AUTH_SESSION_INVALIDATED_EVENT, {
      detail: { reason, timestamp: Date.now() },
    })
  );
}

export function getSessionInvalidatedEventName() {
  return AUTH_SESSION_INVALIDATED_EVENT;
}

export function resetSessionInvalidatedFlag() {
  hasDispatchedInCurrentPage = false;
}
