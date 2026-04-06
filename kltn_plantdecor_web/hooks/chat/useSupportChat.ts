"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  chatHubService,
  type MessageReceivedPayload,
} from "@/lib/signalr/chatHubService";
import { mapRealtimeMessageToConversationMessage } from "@/lib/mappers/chat.mapper";
import { useConversationMessages } from "@/hooks/chat/useConversationMessages";

type UseSupportChatOptions = {
  conversationId?: number | null;
  enabled?: boolean;
  pageSize?: number;
};

export function useSupportChat(options: UseSupportChatOptions) {
  const { conversationId, enabled = true, pageSize = 50 } = options;

  const {
    messages,
    isLoading: isInitialLoading,
    error: messagesError,
    loadMessages,
    appendMessage,
  } = useConversationMessages({ pageSize });

  const [isSending, setIsSending] = useState(false);
  const [isHubReady, setIsHubReady] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [hubError, setHubError] = useState<string | null>(null);

  const error = messagesError ?? hubError;

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinedConversationRef = useRef<number | null>(null);

  const resetTypingIndicator = useCallback(() => {
    setIsOtherUserTyping(false);
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!conversationId || !enabled) return;
    await loadMessages(conversationId);
  }, [conversationId, enabled, loadMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId) return;
      if (!content.trim()) return;

      try {
        setIsSending(true);
        setHubError(null);
        await chatHubService.sendMessage(conversationId, content);
      } catch (err) {
        console.error("Send message failed:", err);
        setHubError("Không thể gửi tin nhắn");
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
        setHubError(null);

        await fetchMessages();
        await chatHubService.connect();
        await chatHubService.joinConversation(conversationId);

        if (!isMounted) return;

        joinedConversationRef.current = conversationId;
        setIsHubReady(true);
      } catch (err) {
        console.error("Chat setup failed:", err);
        if (!isMounted) return;
        setHubError("Không thể kết nối chat realtime");
        setIsHubReady(false);
      }
    };

    void setup();

    return () => {
      isMounted = false;
    };
  }, [conversationId, enabled, fetchMessages]);

  useEffect(() => {
    if (!conversationId || !enabled) return;

    const offMessageReceived = chatHubService.on(
      "messageReceived",
      (payload: MessageReceivedPayload) => {
        if (payload.conversationId !== conversationId) return;

        const mapped = mapRealtimeMessageToConversationMessage(payload);
        appendMessage(mapped);
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
  }, [conversationId, enabled, resetTypingIndicator, appendMessage]);

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
    reloadMessages: fetchMessages,
    sendMessage,
    sendTyping,
    sendStopTyping,
    handleInputTyping,
  };
}
