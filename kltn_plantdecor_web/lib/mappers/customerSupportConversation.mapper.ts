import type { SupportConversationPayload } from "@/types/chat.types";

export type CustomerConversationItem = {
  conversationId: number;
  name: string;
  lastMessage: string;
  lastTime: string;
  avatar: string;
  unread?: number;
  isOnline?: boolean;
};

export const formatConversationTime = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
};

export const mapConversationToCustomerConversationItem = (
  conversation: SupportConversationPayload,
): CustomerConversationItem => ({
  conversationId: conversation.id,
  name: "Plant Decor Support",
  lastMessage:
    conversation.latestMessage?.content ?? "Bắt đầu cuộc trò chuyện mới",
  lastTime: formatConversationTime(
    conversation.latestMessage?.createdAt ?? conversation.startedAt,
  ),
  avatar: "/logo/logo.png",
  unread: 0,
  isOnline: true,
});
