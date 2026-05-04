"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type ServicePageAction = "book";
export type ServicePageTab = "care" | "design";

export interface ServicePageQueryAction {
  initialPackageId: number | null;
  shouldAutoBook: boolean;
  action: ServicePageAction | null;
  tab: ServicePageTab;
  clearAction: () => void;
}

const VALID_ACTIONS: ReadonlySet<ServicePageAction> = new Set(["book"]);

export function useServicePageQueryAction(): ServicePageQueryAction {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const packageIdRaw = searchParams.get("packageId");
  const actionRaw = searchParams.get("action");
  const tabRaw = searchParams.get("tab");

  const initialPackageId = useMemo(() => {
    if (!packageIdRaw) return null;
    const parsed = Number(packageIdRaw);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
  }, [packageIdRaw]);

  const action = useMemo<ServicePageAction | null>(() => {
    if (!actionRaw) return null;
    return VALID_ACTIONS.has(actionRaw as ServicePageAction)
      ? (actionRaw as ServicePageAction)
      : null;
  }, [actionRaw]);

  const tab = tabRaw === "design" ? "design" : "care";
  const shouldAutoBook = tab === "care" && action === "book" && initialPackageId !== null;

  const clearAction = useCallback(() => {
    if (!pathname) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("packageId");
    params.delete("action");
    if (!params.has("tab")) {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, tab]);

  return {
    initialPackageId,
    shouldAutoBook,
    action,
    tab,
    clearAction,
  };
}
