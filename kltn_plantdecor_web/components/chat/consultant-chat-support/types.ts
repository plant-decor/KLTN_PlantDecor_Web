import type {
  SupportConversationMessage,
  SupportConversationPayload,
} from "@/types/chat.types";
import { SupportConversationStatus } from "@/types/chat.types";

export type ChatSession = {
  id: string;
  conversationId: number;
  customerName: string;
  customerEmail: string;
  customerAvatarUrl: string | null;
  summary: string;
  waitingMinutes: number;
  lastMessageAt: string;
  lastMessageTimeLabel: string;
  lastMessage: string;
  status: "waiting" | "active" | "closed";
  online: boolean;
  previewText: string;
  previewAt: string;
  previewTimeLabel: string;
  unreadCount: number;
};

const formatConversationListTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThatDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfThatDay.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (diffDays === 0) {
    return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(date);
  }
  if (diffDays === 1) return "Yesterday";

  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(date);
};

export const mapConversationToSession = (
  conv: SupportConversationPayload,
  currentUserId?: number,
): ChatSession => {
  const customer =
    conv.participants.find((p) =>
      currentUserId ? p.userId !== currentUserId : true,
    ) ?? conv.participants[conv.participants.length - 1];

  const customerName =
    customer?.fullName ?? customer?.email ?? `Khách #${conv.id}`;
  const customerEmail = customer?.email ?? "";
  const customerAvatarUrl = customer?.avatarUrl ?? null;

  const startedAt = new Date(conv.startedAt);
  const waitingMinutes = Math.floor((Date.now() - startedAt.getTime()) / 60000);
  const lastMessageAt = conv.latestMessage?.createdAt ?? conv.startedAt;
  const lastMessageTimeLabel = formatConversationListTime(lastMessageAt);

  let status: "waiting" | "active" | "closed" = "waiting";
  if (conv.status === SupportConversationStatus.Claimed) status = "active";
  else if (conv.status === SupportConversationStatus.Closed) status = "closed";

  return {
    id: String(conv.id),
    conversationId: conv.id,
    customerName,
    customerEmail,
    customerAvatarUrl,
    summary: conv.latestMessage?.content ?? "Chưa có tin nhắn",
    waitingMinutes,
    lastMessageAt,
    lastMessageTimeLabel,
    lastMessage: conv.latestMessage?.content ?? "",
    status,
    online: conv.status === SupportConversationStatus.Waiting,
    previewText: conv.latestMessage?.content ?? "",
    previewAt: lastMessageAt,
    previewTimeLabel: lastMessageTimeLabel,
    unreadCount: 0,
  };
};

const compareIsoTime = (a: string, b: string) =>
  new Date(a).getTime() - new Date(b).getTime();

export type ConversationLiveOverride = {
  previewText?: string;
  previewAt?: string;
  unreadCount?: number;
};

export function mergeChatSessionOverrides(
  session: ChatSession,
  override?: ConversationLiveOverride,
): ChatSession {
  if (!override) return session;

  const hasPreviewOverride =
    typeof override.previewText === "string" || typeof override.previewAt === "string";

  const nextUnread =
    typeof override.unreadCount === "number" ? override.unreadCount : session.unreadCount;

  if (!hasPreviewOverride) {
    return {
      ...session,
      unreadCount: Math.max(0, nextUnread),
    };
  }

  const nextPreviewAt =
    override.previewAt && session.previewAt
      ? compareIsoTime(override.previewAt, session.previewAt) > 0
        ? override.previewAt
        : session.previewAt
      : override.previewAt ?? session.previewAt;

  const nextPreviewText =
    override.previewText && override.previewAt && session.previewAt
      ? compareIsoTime(override.previewAt, session.previewAt) > 0
        ? override.previewText
        : session.previewText
      : override.previewText ?? session.previewText;

  const previewTimeLabel = formatConversationListTime(nextPreviewAt);

  return {
    ...session,
    previewAt: nextPreviewAt,
    previewText: nextPreviewText,
    previewTimeLabel,
    unreadCount: Math.max(0, nextUnread),
    summary: nextPreviewText || session.summary,
    lastMessageAt: nextPreviewAt,
    lastMessageTimeLabel: previewTimeLabel,
  };
}

export type ChatMessageView = {
  id: number;
  isMine: boolean;
  text: string;
  time: string;
  isLast: boolean;
};

const formatMessageTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const mapRealtimeMessages = (
  messages: SupportConversationMessage[],
  currentUserId?: number,
): ChatMessageView[] => {
  return messages.map((message, index) => ({
    id: message.id,
    isMine: Boolean(currentUserId && message.senderId === currentUserId),
    text: message.content,
    time: formatMessageTime(message.createdAt),
    isLast: index === messages.length - 1,
  }));
};

