"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type ServicePageAction = "book";

export interface ServicePageQueryAction {
  initialPackageId: number | null;
  shouldAutoBook: boolean;
  action: ServicePageAction | null;
  clearAction: () => void;
}

const VALID_ACTIONS: ReadonlySet<ServicePageAction> = new Set(["book"]);

export function useServicePageQueryAction(): ServicePageQueryAction {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const packageIdRaw = searchParams.get("packageId");
  const actionRaw = searchParams.get("action");

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

  const shouldAutoBook = action === "book" && initialPackageId !== null;

  const clearAction = useCallback(() => {
    if (!pathname) return;
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    initialPackageId,
    shouldAutoBook,
    action,
    clearAction,
  };
}
