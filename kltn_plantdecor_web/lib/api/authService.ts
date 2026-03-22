import { del, get, post } from '@/lib/api/apiService';

interface SessionItem {
  id: number;
  deviceId?: string;
  deviceName: string;
  createDate: string;
  expiryDate: string;
}

interface ApiWrapper<T> {
  payload?: T;
  data?: T;
}

const normalizeSessionsResponse = (raw: unknown): SessionItem[] => {
  if (Array.isArray(raw)) {
    return raw as SessionItem[];
  }

  if (!raw || typeof raw !== 'object') {
    return [];
  }

  const wrapped = raw as ApiWrapper<unknown>;
  if (Array.isArray(wrapped.payload)) {
    return wrapped.payload as SessionItem[];
  }

  if (Array.isArray(wrapped.data)) {
    return wrapped.data as SessionItem[];
  }

  return [];
};

export const authService = {
  async getActiveSessions(): Promise<SessionItem[]> {
    const raw = await get<unknown>('/Authentication/sessions', undefined, false);
    return normalizeSessionsResponse(raw);
  },

  async revokeSession(sessionId: number): Promise<void> {
    try {
      await del<unknown>(`/Authentication/sessions/${sessionId}`, false);
    } catch {
      // Some backends expose revoke as POST instead of DELETE.
      await post<unknown>(`/Authentication/revoke-session/${sessionId}`, undefined, false);
    }
  },
};
