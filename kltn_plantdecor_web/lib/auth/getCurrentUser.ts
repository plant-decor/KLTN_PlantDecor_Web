import { cookies } from "next/headers";
import type { User } from "@/types/auth.types";

const parseJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = Buffer.from(base64 + padding, 'base64').toString('utf-8');

    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const claimString = (claims: Record<string, unknown> | null, keys: string[]): string => {
  if (!claims) {
    return '';
  }

  for (const key of keys) {
    const value = claims[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const claimNumber = (claims: Record<string, unknown> | null, key: string): number | null => {
  if (!claims) {
    return null;
  }

  const value = claims[key];

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

export const buildUserFromToken = (token: string, fallbackUser?: User): { user: User; expiresIn: number } => {
  const claims = parseJwtPayload(token);
  const exp = claimNumber(claims, 'exp');
  const iat = claimNumber(claims, 'iat');
  const sub = claimString(claims, ['sub']);
  const parsedId = Number(sub);
  const userId = Number.isFinite(parsedId) ? parsedId : 0;

  return {
    expiresIn: exp && iat ? Math.max(0, Math.floor(exp - iat)) : 3600,
    user: {
      id: userId,
      email: claimString(claims, ['email']) || fallbackUser?.email || '',
      name:
        claimString(claims, ['name', 'unique_name', 'given_name']) ||
        fallbackUser?.name ||
        'User',
      role: claimString(claims, ['Role', 'role']) || fallbackUser?.role,
      avatar:
        claimString(claims, ['avatarURL', 'avatarUrl', 'avatar']) ||
        fallbackUser?.avatar,
    },
  };
};
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  try {
    const { user } = buildUserFromToken(token);
    return user;
  } catch {
    return null;
  }
}