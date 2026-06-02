export type ServiceBookingAction = "book";

export interface BuildServiceBookingUrlInput {
  origin?: string;
  locale: string;
  userId: number;
  packageId: number;
  packageName?: string;
  action?: ServiceBookingAction;
}

export interface ParsedServiceBookingUrl {
  pathname: string;
  locale: string | null;
  userId: number;
  packageId: number;
  packageName: string | null;
  action: ServiceBookingAction;
  rawUrl: string;
}

const SERVICE_PATH_PATTERN = /^\/(?:([a-z]{2}(?:-[A-Z]{2})?)\/)?services\/(\d+)\/?$/;

export function buildServiceBookingPath({
  locale,
  userId,
  packageId,
  packageName,
  action = "book",
}: Omit<BuildServiceBookingUrlInput, "origin">): string {
  const safeLocale = encodeURIComponent(locale);
  const safeUserId = encodeURIComponent(String(userId));
  const params = new URLSearchParams();
  params.set("tab", "care");
  params.set("packageId", String(packageId));
  params.set("action", action);
  if (packageName) params.set("packageName", packageName);
  return `/${safeLocale}/services/${safeUserId}?${params.toString()}`;
}

export function buildServiceBookingUrl(
  input: BuildServiceBookingUrlInput,
): string {
  const path = buildServiceBookingPath(input);
  const origin = input.origin?.replace(/\/$/, "") ?? "";
  return origin ? `${origin}${path}` : path;
}

export function parseServiceBookingUrl(
  value: string,
): ParsedServiceBookingUrl | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  let pathname: string;
  let searchParams: URLSearchParams;
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const url = new URL(trimmed);
      pathname = url.pathname;
      searchParams = url.searchParams;
    } else if (trimmed.startsWith("/")) {
      const url = new URL(trimmed, "https://placeholder.local");
      pathname = url.pathname;
      searchParams = url.searchParams;
    } else {
      return null;
    }
  } catch {
    return null;
  }

  const match = SERVICE_PATH_PATTERN.exec(pathname);
  if (!match) return null;

  const locale = match[1] ?? null;
  const userId = Number(match[2]);
  if (!Number.isFinite(userId) || userId <= 0) return null;

  const packageIdRaw = searchParams.get("packageId");
  const actionRaw = searchParams.get("action");
  if (!packageIdRaw || !actionRaw) return null;

  const packageId = Number(packageIdRaw);
  if (!Number.isFinite(packageId) || packageId <= 0) return null;

  if (actionRaw !== "book") return null;

  const packageName = searchParams.get("packageName") ?? null;

  return {
    pathname,
    locale,
    userId,
    packageId,
    packageName,
    action: actionRaw,
    rawUrl: trimmed,
  };
}

export function extractServiceBookingUrl(
  text: string,
): ParsedServiceBookingUrl | null {
  if (!text) return null;
  const candidates = text.match(/(?:https?:\/\/\S+|\/\S+)/g);
  if (!candidates) return null;

  for (const candidate of candidates) {
    const cleaned = candidate.replace(/[).,!?]+$/g, "");
    const parsed = parseServiceBookingUrl(cleaned);
    if (parsed) return parsed;
  }

  return null;
}
