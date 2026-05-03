import type {
  ConsultantOrderFilterApplied,
  ConsultantOrderFilterDraft,
} from '@/types/consultant-order.types';
import { parseCurrencyInput } from '@/lib/utils/formatUtil';

/** Giá trị `YYYY-MM-DD` từ `input type="date"` → ISO bắt đầu ngày (00:00:00.000) theo giờ local */
export function localDateOnlyStartToIso(dateStr: string): string | undefined {
  const t = dateStr.trim();
  if (!t) {
    return undefined;
  }
  const parts = t.split('-').map((p) => Number.parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
    return undefined;
  }
  const [y, m, d] = parts;
  const date = new Date(y, m - 1, d, 0, 0, 0, 0);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
}

/** `YYYY-MM-DD` → ISO cuối ngày (23:59:59.999) theo giờ local — inclusive filter "to" */
export function localDateOnlyEndToIso(dateStr: string): string | undefined {
  const t = dateStr.trim();
  if (!t) {
    return undefined;
  }
  const parts = t.split('-').map((p) => Number.parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
    return undefined;
  }
  const [y, m, d] = parts;
  const date = new Date(y, m - 1, d, 23, 59, 59, 999);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
}

export function consultantFilterDraftToApplied(
  draft: ConsultantOrderFilterDraft
): ConsultantOrderFilterApplied {
  return {
    email: draft.email.trim(),
    status: draft.status,
    orderType: draft.orderType,
    payment: draft.payment,
    createdFrom: draft.createdFrom,
    createdTo: draft.createdTo,
    minTotal: parseCurrencyInput(draft.minAmount),
    maxTotal: parseCurrencyInput(draft.maxAmount),
  };
}
