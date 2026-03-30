export type FengShuiElementKey = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho' | 'unknown';

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
  kim: 'Kim',
  moc: 'Mộc',
  thuy: 'Thủy',
  hoa: 'Hỏa',
  tho: 'Thổ',
  unknown: 'Unknown',
};

const normalizeText = (value?: string | null): string =>
  (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const getFengShuiElementKey = (element?: string | null): FengShuiElementKey => {
  const normalized = normalizeText(element);

  if (normalized === 'kim') return 'kim';
  if (normalized === 'moc') return 'moc';
  if (normalized === 'thuy') return 'thuy';
  if (normalized === 'hoa') return 'hoa';
  if (normalized === 'tho') return 'tho';

  return 'unknown';
};

export const getFengShuiColors = (element?: string | null): FengShuiColorSet =>
  FENG_SHUI_COLORS[getFengShuiElementKey(element)];

export const getFengShuiElementLabel = (element?: string | null): string =>
  FENG_SHUI_LABELS[getFengShuiElementKey(element)];
