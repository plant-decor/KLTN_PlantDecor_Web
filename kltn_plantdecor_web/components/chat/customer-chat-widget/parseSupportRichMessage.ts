import { extractServiceBookingUrl } from "@/lib/utils/serviceBookingLink";

export type SupportRichMessageKind =
  | "plain"
  | "careTips"
  | "suggestedPlants"
  | "serviceBooking";

export type SupportRichMessage = {
  kind: SupportRichMessageKind;
  summaryText: string;
  fullText: string;
  serviceBooking?: {
    url: string;
    pathname: string;
    locale: string | null;
    userId: number;
    packageId: number;
  };
};

const splitLines = (text: string) =>
  text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trimEnd());

const isBulletLine = (line: string) => {
  const trimmed = line.trimStart();
  return trimmed.startsWith("•") || trimmed.startsWith("- ");
};

const startsSuggestedPlants = (lines: string[]) => {
  const firstNonEmpty = lines.find((l) => l.trim().length) ?? "";
  if (/^Here are a few suggested options:/i.test(firstNonEmpty)) return true;
  return lines.some((l) => /^\s*\d+\.\s+/.test(l));
};

const countBulletLines = (lines: string[]) => lines.filter((l) => isBulletLine(l)).length;

const takeFirstNonEmptyLines = (lines: string[], maxLines: number) => {
  const out: string[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    out.push(line);
    if (out.length >= maxLines) break;
  }
  return out;
};

export function parseSupportRichMessage(text: string): SupportRichMessage {
  const fullText = text ?? "";
  const lines = splitLines(fullText);

  const bookingUrl = extractServiceBookingUrl(fullText);
  if (bookingUrl) {
    return {
      kind: "serviceBooking",
      summaryText: "Service recommendation",
      fullText,
      serviceBooking: {
        url: bookingUrl.rawUrl,
        pathname: bookingUrl.pathname,
        locale: bookingUrl.locale,
        userId: bookingUrl.userId,
        packageId: bookingUrl.packageId,
      },
    };
  }

  const bulletCount = countBulletLines(lines);
  const looksLikeCareTips = bulletCount >= 2;
  const looksLikeSuggestedPlants = startsSuggestedPlants(lines);

  if (looksLikeSuggestedPlants) {
    const summaryLines = takeFirstNonEmptyLines(lines, 2);
    return {
      kind: "suggestedPlants",
      summaryText: summaryLines.join("\n"),
      fullText,
    };
  }

  if (looksLikeCareTips) {
    // Take first 2 bullet lines as summary.
    const bullets = lines
      .map((l) => l.trim())
      .filter((l) => l.length)
      .filter((l) => isBulletLine(l));
    const summary = bullets.slice(0, 2).join("\n");
    return {
      kind: "careTips",
      summaryText: summary || takeFirstNonEmptyLines(lines, 2).join("\n"),
      fullText,
    };
  }

  return { kind: "plain", summaryText: fullText, fullText };
}

