"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  chatHubService,
  type NewMessageNotificationPayload,
} from "@/lib/signalr/chatHubService";
import {
  CHAT_MESSAGE_NOTIFICATION_EVENT,
  OPEN_SUPPORT_CHAT_EVENT,
} from "@/lib/constants/chat";
import { useAuthStore } from "@/lib/store/authStore";

const MAX_PREVIEW_LENGTH = 90;

const normalizeRole = (role?: string | null) =>
  String(role ?? "")
    .trim()
    .toLowerCase();

const buildMessagePreview = (content: string) => {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return "";
  }

  return normalized.length > MAX_PREVIEW_LENGTH
    ? `${normalized.slice(0, MAX_PREVIEW_LENGTH).trim()}...`
    : normalized;
};

const openSupportChat = () => {
  window.dispatchEvent(new Event(OPEN_SUPPORT_CHAT_EVENT));
};

const notifySupportChatWidget = (payload: NewMessageNotificationPayload) => {
  window.dispatchEvent(
    new CustomEvent(CHAT_MESSAGE_NOTIFICATION_EVENT, { detail: payload }),
  );
};

export function ChatNotificationProvider() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthBootstrapCompleted = useAuthStore(
    (state) => state.isAuthBootstrapCompleted,
  );

  useEffect(() => {
    if (
      !isAuthBootstrapCompleted ||
      !isAuthenticated ||
      !user ||
      normalizeRole(user.role) !== "customer"
    ) {
      return;
    }

    let isActive = true;

    const handleNewMessageNotification = (
      payload: NewMessageNotificationPayload,
    ) => {
      if (!isActive) {
        return;
      }

      const preview = buildMessagePreview(payload.content);
      const message = preview
        ? `Bạn có tin nhắn mới từ tư vấn viên: ${preview}`
        : "Bạn có tin nhắn mới từ tư vấn viên";

      notifySupportChatWidget(payload);

      toast.info(message, {
        toastId: `chat-message-${payload.messageId}`,
        onClick: openSupportChat,
      });
    };

    const unsubscribe = chatHubService.on(
      "newMessageNotification",
      handleNewMessageNotification,
    );

    void chatHubService.connect().catch((error) => {
      if (isActive) {
        console.error("Cannot connect to chat notifications:", error);
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [isAuthBootstrapCompleted, isAuthenticated, user]);

  return null;
}
