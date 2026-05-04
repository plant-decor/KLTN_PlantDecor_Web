/** Preview: blob/data/https work as-is; relative API paths join NEXT_PUBLIC_API_URL (Next/Image does not support blob:). */
export function resolveDesignSampleImageSrc(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const path = trimmed.replace(/^\/+/, "");
  return base ? `${base}/${path}` : `/${path}`;
}
