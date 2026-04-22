export type FengShuiElementKey = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho' | 'unknown';
export type FengShuiElementId = 1 | 2 | 3 | 4 | 5;
export type FengShuiElementInput = number | string | null | undefined;

export interface FengShuiColorSet {
  bg: string;
  text: string;
  border: string;
}

const FENG_SHUI_COLORS: Record<FengShuiElementKey, FengShuiColorSet> = {
  kim: { bg: '#f3f4f6', text: '#6b7280', border: '#9ca3af' },
  moc: { bg: '#ecfdf5', text: '#047857', border: '#34d399' },
  thuy: { bg: '#eff6ff', text: '#1d4ed8', border: '#60a5fa' },
  hoa: { bg: '#fef2f2', text: '#dc2626', border: '#f87171' },
  tho: { bg: '#fffbeb', text: '#b45309', border: '#fbbf24' },
  unknown: { bg: '#f8fafc', text: '#475569', border: '#cbd5e1' },
};

const FENG_SHUI_LABELS: Record<FengShuiElementKey, string> = {
  kim: 'Metal',
  moc: 'Wood',
  thuy: 'Water',
  hoa: 'Fire',
  tho: 'Earth',
  unknown: 'Unknown',
};

const FENG_SHUI_ID_TO_KEY: Record<FengShuiElementId, FengShuiElementKey> = {
  1: 'kim',
  2: 'moc',
  3: 'thuy',
  4: 'hoa',
  5: 'tho',
};

const FENG_SHUI_KEY_TO_ID: Record<Exclude<FengShuiElementKey, 'unknown'>, FengShuiElementId> = {
  kim: 1,
  moc: 2,
  thuy: 3,
  hoa: 4,
  tho: 5,
};

export const FENG_SHUI_ELEMENT_OPTIONS: { value: FengShuiElementId; label: string }[] = [
  { value: 1, label: 'Metal' },
  { value: 2, label: 'Wood' },
  { value: 3, label: 'Water' },
  { value: 4, label: 'Fire' },
  { value: 5, label: 'Earth' },
];

const normalizeText = (value?: string | null): string =>
  (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const getFengShuiElementKey = (element?: FengShuiElementInput): FengShuiElementKey => {
  if (typeof element === 'number') {
    return FENG_SHUI_ID_TO_KEY[element as FengShuiElementId] ?? 'unknown';
  }

  const raw = (element || '').trim();
  if (!raw) {
    return 'unknown';
  }

  const numericValue = Number(raw);
  if (Number.isFinite(numericValue)) {
    return FENG_SHUI_ID_TO_KEY[numericValue as FengShuiElementId] ?? 'unknown';
  }

  const normalized = normalizeText(raw);

  if (normalized === 'metal') return 'kim';
  if (normalized === 'wood') return 'moc';
  if (normalized === 'water') return 'thuy';
  if (normalized === 'fire') return 'hoa';
  if (normalized === 'earth') return 'tho';

  return 'unknown';
};

export const getFengShuiColors = (element?: FengShuiElementInput): FengShuiColorSet =>
  FENG_SHUI_COLORS[getFengShuiElementKey(element)];

export const getFengShuiElementLabel = (element?: FengShuiElementInput): string =>
  FENG_SHUI_LABELS[getFengShuiElementKey(element)];

export const getFengShuiElementId = (element?: FengShuiElementInput): FengShuiElementId | null => {
  const key = getFengShuiElementKey(element);
  if (key === 'unknown') {
    return null;
  }

  return FENG_SHUI_KEY_TO_ID[key];
};
