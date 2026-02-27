/**
 * Root fallback page.
 * The next-intl middleware intercepts requests before this renders and
 * routes them to app/[locale]/page.tsx based on the detected locale.
 * This file should never actually be reached in normal usage.
 */
export default function RootPage() {
  return null;
}

