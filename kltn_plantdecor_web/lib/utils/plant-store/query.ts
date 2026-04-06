import type { PlantStorePageQuery } from '@/lib/utils/plant-store/constants';

export const toSingle = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

export const parseIntOrUndefined = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = parseIntOrUndefined(value);
  return parsed && parsed > 0 ? Math.floor(parsed) : fallback;
};

export const parseBooleanOrUndefined = (value: string | undefined): boolean | undefined => {
  if (!value) return undefined;

  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return undefined;
};

export const parseNumberArray = (value: string | string[] | undefined): number[] => {
  if (!value) return [];

  const values = Array.isArray(value) ? value : [value];
  const deduped = new Set<number>();

  values
    .flatMap((item) => item.split(','))
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0)
    .forEach((item) => deduped.add(item));

  return [...deduped];
};

export const parseCsvStringArray = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export const cloneQuery = (query: PlantStorePageQuery) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
      return;
    }
    if (value !== '') {
      params.set(key, value);
    }
  });
  return params;
};
