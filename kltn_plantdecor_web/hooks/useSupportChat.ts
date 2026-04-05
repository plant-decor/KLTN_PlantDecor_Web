"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getConversationMessages } from "@/lib/api/chatService";
import {
  chatHubService,
  type MessageReceivedPayload,
} from "@/lib/signalr/chatHubService";
import { mapRealtimeMessageToConversationMessage } from "@/lib/mappers/chat.mapper";
import type {
  GetConversationMessagesParams,
  SupportConversationMessage,
} from "@/types/chat.types";

const DEFAULT_MESSAGE_PARAMS: GetConversationMessagesParams = {
  pageNumber: 1,
  pageSize: 50,
};

type UseSupportChatOptions = {
  conversationId?: number | null;
  enabled?: boolean;
  pageSize?: number;
};

export function useSupportChat(options: UseSupportChatOptions) {
  const { conversationId, enabled = true, pageSize = 50 } = options;

  const [messages, setMessages] = useState<SupportConversationMessage[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isHubReady, setIsHubReady] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinedConversationRef = useRef<number | null>(null);

  const resetTypingIndicator = useCallback(() => {
    setIsOtherUserTyping(false);
  }, []);

  const loadMessages = useCallback(async () => {
    if (!conversationId || !enabled) return;

    try {
      setIsInitialLoading(true);
      setError(null);

      const response = await getConversationMessages(
        conversationId,
        {
          ...DEFAULT_MESSAGE_PARAMS,
          pageSize,
        },
        false,
      );

      setMessages(response.data?.messages ?? []);
    } catch (err) {
      console.error("Load messages failed:", err);
      setError("Không thể tải lịch sử tin nhắn");
    } finally {
      setIsInitialLoading(false);
    }
  }, [conversationId, enabled, pageSize]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId) return;
      if (!content.trim()) return;

      try {
        setIsSending(true);
        setError(null);
        await chatHubService.sendMessage(conversationId, content);
      } catch (err) {
        console.error("Send message failed:", err);
        setError("Không thể gửi tin nhắn");
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [conversationId],
  );

  const sendTyping = useCallback(async () => {
    if (!conversationId) return;

    try {
      await chatHubService.sendTyping(conversationId);
    } catch (err) {
      console.error("Send typing failed:", err);
    }
  }, [conversationId]);

  const sendStopTyping = useCallback(async () => {
    if (!conversationId) return;

    try {
      await chatHubService.sendStopTyping(conversationId);
    } catch (err) {
      console.error("Send stop typing failed:", err);
    }
  }, [conversationId]);

  const handleInputTyping = useCallback(async () => {
    if (!conversationId) return;

    await sendTyping();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      void sendStopTyping();
    }, 1200);
  }, [conversationId, sendStopTyping, sendTyping]);

  useEffect(() => {
    if (!conversationId || !enabled) return;

    let isMounted = true;

    const setup = async () => {
      try {
        setError(null);

        await loadMessages();
        await chatHubService.connect();
        await chatHubService.joinConversation(conversationId);

        if (!isMounted) return;

        joinedConversationRef.current = conversationId;
        setIsHubReady(true);
      } catch (err) {
        console.error("Chat setup failed:", err);
        if (!isMounted) return;
        setError("Không thể kết nối chat realtime");
        setIsHubReady(false);
      }
    };

    void setup();

    return () => {
      isMounted = false;
    };
  }, [conversationId, enabled, loadMessages]);

  useEffect(() => {
    if (!conversationId || !enabled) return;

    const offMessageReceived = chatHubService.on(
      "messageReceived",
      (payload: MessageReceivedPayload) => {
        if (payload.conversationId !== conversationId) return;

        const mapped = mapRealtimeMessageToConversationMessage(payload);

        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === mapped.id);
          if (exists) return prev;
          return [...prev, mapped];
        });
      },
    );

    const offUserTyping = chatHubService.on("userTyping", (payload) => {
      if (payload.conversationId !== conversationId) return;
      setIsOtherUserTyping(true);
    });

    const offUserStoppedTyping = chatHubService.on(
      "userStoppedTyping",
      (payload) => {
        if (payload.conversationId !== conversationId) return;
        resetTypingIndicator();
      },
    );

    const offReconnecting = chatHubService.on("reconnecting", () => {
      setIsHubReady(false);
    });

    const offReconnected = chatHubService.on("reconnected", () => {
      setIsHubReady(true);
    });

    const offClosed = chatHubService.on("closed", () => {
      setIsHubReady(false);
    });

    return () => {
      offMessageReceived();
      offUserTyping();
      offUserStoppedTyping();
      offReconnecting();
      offReconnected();
      offClosed();
    };
  }, [conversationId, enabled, resetTypingIndicator]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      const joinedConversationId = joinedConversationRef.current;
      if (joinedConversationId) {
        void chatHubService.leaveConversation(joinedConversationId);
      }
    };
  }, []);

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [messages]);

  return {
    messages: sortedMessages,
    isInitialLoading,
    isSending,
    isHubReady,
    isOtherUserTyping,
    error,
    reloadMessages: loadMessages,
    sendMessage,
    sendTyping,
    sendStopTyping,
    handleInputTyping,
  };
}
