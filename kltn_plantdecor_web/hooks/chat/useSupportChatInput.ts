"use client";

import { useCallback, useState } from "react";

type UseSupportChatInputOptions = {
  onSend: (content: string) => Promise<void>;
  onTyping?: () => Promise<void> | void;
};

export function useSupportChatInput(options: UseSupportChatInputOptions) {
  const { onSend, onTyping } = options;

  const [input, setInput] = useState("");

  const handleChange = useCallback(
    async (value: string) => {
      setInput(value);
      await onTyping?.();
    },
    [onTyping],
  );

  const submit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    await onSend(trimmed);
    setInput("");
  }, [input, onSend]);

  const reset = useCallback(() => {
    setInput("");
  }, []);

  return {
    input,
    setInput,
    handleChange,
    submit,
    reset,
    canSend: input.trim().length > 0,
  };
}
