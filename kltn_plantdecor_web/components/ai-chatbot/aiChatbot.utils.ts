import type {
  AIChatConversationTurn,
  AIChatHistoryMessage,
  AIChatMessageRole,
} from "@/types/ai-chatbot.types";
import type { ChatMessageView } from "@/components/ai-chatbot/aiChatbot.ui-types";

export const toSafeNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
};

export const toConversationHistory = (
  messages: ChatMessageView[],
): AIChatConversationTurn[] => {
  return messages
    .filter(
      (m) =>
        m.role === "user" || m.role === "assistant" || m.role === "system",
    )
    .map((m) => ({
      role: m.role,
      content: m.content,
    }));
};

export const mapHistoryMessages = (
  messages: AIChatHistoryMessage[] | undefined | null,
): ChatMessageView[] => {
  if (!Array.isArray(messages)) return [];
  return messages.map((m) => {
    const suggestedPlants = Array.isArray(m.suggestedPlants)
      ? m.suggestedPlants
      : null;
    const careTips = Array.isArray(m.careTips) ? m.careTips : null;
    const followUpQuestions = Array.isArray(m.followUpQuestions)
      ? m.followUpQuestions
      : null;

    return {
      id: m.messageId,
      role:
        m.role === "assistant" || m.role === "system" || m.role === "user"
          ? (m.role as AIChatMessageRole)
          : "assistant",
      content: m.content,
      createdAt: m.createdAt,
      suggestedPlants,
      careTips,
      followUpQuestions,
    };
  });
};

export const mergeHistoryWithLocal = (
  historyMessages: ChatMessageView[],
  localMessages: ChatMessageView[],
): ChatMessageView[] => {
  if (!historyMessages.length) {
    return localMessages;
  }

  const historyIdSet = new Set(historyMessages.map((m) => String(m.id)));
  const localOnly = localMessages.filter(
    (m) => !historyIdSet.has(String(m.id)),
  );

  return [...historyMessages, ...localOnly];
};

export const formatTime = (value?: string | null) => {
  if (!value) return "";

  const normalized =
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(value)
      ? `${value}Z`
      : value;

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
};

