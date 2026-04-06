"use client";

import { RefObject, useEffect } from "react";

type UseAutoScrollToBottomOptions = {
  dependency: unknown;
  behavior?: ScrollBehavior;
};

export function useAutoScrollToBottom<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: UseAutoScrollToBottomOptions,
) {
  const { dependency, behavior = "smooth" } = options;

  useEffect(() => {
    ref.current?.scrollTo({
      top: ref.current.scrollHeight,
      behavior,
    });
  }, [dependency, behavior, ref]);
}
