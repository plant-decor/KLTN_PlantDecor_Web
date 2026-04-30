import type { AIChatConversationTurn } from "@/types/ai-chatbot.types";
import type { SupportConversationMessage } from "@/types/chat.types";

type Options = {
  /**
   * In consultant UI, pass the consultant userId so we can map:
   * - customer messages -> role "user"
   * - consultant messages -> role "assistant"
   */
  currentUserId?: number | null;
  /**
   * Limit number of turns to reduce token usage.
   */
  maxTurns?: number;
};

export function supportMessagesToAiConversationHistory(
  messages: SupportConversationMessage[] | null | undefined,
  options: Options = {},
): AIChatConversationTurn[] {
  if (!Array.isArray(messages) || !messages.length) return [];

  const { currentUserId = null, maxTurns = 20 } = options;

  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const sliced = sorted.slice(Math.max(0, sorted.length - maxTurns));

  return sliced
    .filter((m) => Boolean(m.content?.trim()))
    .map((m) => {
      const isMine = Boolean(currentUserId && m.senderId === currentUserId);
      return {
        role: isMine ? "assistant" : "user",
        content: m.content,
      };
    });
}

