import { useState, useCallback } from 'react';

const FAILED_ATTEMPTS_KEY = 'login_failed_attempts';
const FAILED_ATTEMPTS_TIMESTAMP_KEY = 'login_failed_attempts_timestamp';
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const MAX_ATTEMPTS = 5;

interface FailedAttemptInfo {
  count: number;
  firstAttemptTime: number;
}

export function useFailedLoginAttempts() {
  const [failedAttempts, setFailedAttempts] = useState<number>(0);

  const getFailedAttempts = useCallback(() => {
    if (typeof window === 'undefined') return 0;
    
    const stored = localStorage.getItem(FAILED_ATTEMPTS_KEY);
    const timestamp = localStorage.getItem(FAILED_ATTEMPTS_TIMESTAMP_KEY);
    
    if (!stored || !timestamp) return 0;
    
    const attemptInfo: FailedAttemptInfo = JSON.parse(stored);
    const firstAttemptTime = parseInt(timestamp, 10);
    const now = Date.now();

    // Reset if lockout period has expired
    if (now - firstAttemptTime > LOCKOUT_DURATION) {
      localStorage.removeItem(FAILED_ATTEMPTS_KEY);
      localStorage.removeItem(FAILED_ATTEMPTS_TIMESTAMP_KEY);
      return 0;
    }

    return attemptInfo.count || 0;
  }, []);

  const incrementFailedAttempts = useCallback(() => {
    if (typeof window === 'undefined') return;

    const current = getFailedAttempts();
    const newCount = current + 1;

    const attemptInfo: FailedAttemptInfo = {
      count: newCount,
      firstAttemptTime: current === 0 ? Date.now() : JSON.parse(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '{}').firstAttemptTime || Date.now(),
    };

    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(attemptInfo));
    
    if (current === 0) {
      localStorage.setItem(FAILED_ATTEMPTS_TIMESTAMP_KEY, Date.now().toString());
    }

    setFailedAttempts(newCount);
  }, [getFailedAttempts]);

  const resetFailedAttempts = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(FAILED_ATTEMPTS_KEY);
    localStorage.removeItem(FAILED_ATTEMPTS_TIMESTAMP_KEY);
    setFailedAttempts(0);
  }, []);

  const requiresRecaptcha = useCallback(() => {
    return getFailedAttempts() >= MAX_ATTEMPTS;
  }, [getFailedAttempts]);

  const getRemainingAttempts = useCallback(() => {
    const current = getFailedAttempts();
    return Math.max(0, MAX_ATTEMPTS - current);
  }, [getFailedAttempts]);

  const getRemainingLockoutTime = useCallback(() => {
    if (typeof window === 'undefined') return 0;
    
    const timestamp = localStorage.getItem(FAILED_ATTEMPTS_TIMESTAMP_KEY);
    if (!timestamp) return 0;

    const firstAttemptTime = parseInt(timestamp, 10);
    const now = Date.now();
    const elapsed = now - firstAttemptTime;
    const remaining = Math.max(0, LOCKOUT_DURATION - elapsed);

    return remaining;
  }, []);

  return {
    failedAttempts: getFailedAttempts(),
    incrementFailedAttempts,
    resetFailedAttempts,
    requiresRecaptcha,
    getRemainingAttempts,
    getRemainingLockoutTime,
    MAX_ATTEMPTS,
  };
}
