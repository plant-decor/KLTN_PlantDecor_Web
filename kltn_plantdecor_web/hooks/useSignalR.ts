'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { SignalRContext } from '@/components/providers/SignalRProvider';
import { signalRService } from '@/lib/services/signalRService';
import { useAuthStore } from '@/lib/store/authStore';
import type { ChatMessage, NotificationMessage, OnlineStatus, TypingIndicator } from '@/types/signalr.types';

export function useSignalR() {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error('useSignalR must be used within SignalRProvider');
  }
  return context;
}

export function useNotifications() {
  const { isConnected, markNotificationAsRead, markAllNotificationsAsRead } = useSignalR();
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    const unsubscribe = signalRService.on('notification', (notification: NotificationMessage) => {
      setNotifications((prev) => [notification, ...prev]);
      if (!notification.isRead) {
        setUnreadCount((count) => count + 1);
      }
    });

    return unsubscribe;
  }, [isConnected]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) => prev.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)));
      setUnreadCount((count) => Math.max(0, count - 1));
    },
    [markNotificationAsRead]
  );

  const markAllAsRead = useCallback(async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  }, [markAllNotificationsAsRead]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}

export function useTypingIndicator(conversationId: number | null) {
  const { isConnected, sendTypingIndicator } = useSignalR();
  const { user } = useAuthStore();
  const [typingUserIds, setTypingUserIds] = useState<Array<number | string>>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isConnected || !conversationId) {
      return;
    }

    const unsubscribe = signalRService.on('typingIndicator', (indicator: TypingIndicator) => {
      if (indicator.conversationId !== conversationId) {
        return;
      }

      if (String(indicator.userId) === String(user?.id)) {
        return;
      }

      setTypingUserIds((prev) => {
        const exists = prev.some((item) => String(item) === String(indicator.userId));
        if (indicator.isTyping && !exists) {
          return [...prev, indicator.userId];
        }

        if (!indicator.isTyping) {
          return prev.filter((item) => String(item) !== String(indicator.userId));
        }

        return prev;
      });
    });

    return unsubscribe;
  }, [conversationId, isConnected, user?.id]);

  const startTyping = useCallback(() => {
    if (!conversationId) {
      return;
    }

    void sendTypingIndicator(conversationId, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      void sendTypingIndicator(conversationId, false);
    }, 2000);
  }, [conversationId, sendTypingIndicator]);

  const stopTyping = useCallback(() => {
    if (!conversationId) {
      return;
    }

    void sendTypingIndicator(conversationId, false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [conversationId, sendTypingIndicator]);

  return {
    typingUserIds,
    startTyping,
    stopTyping,
  };
}

export function useChatRoom(conversationId: number | null) {
  const { isConnected, joinChatRoom, leaveChatRoom, sendChatMessage } = useSignalR();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!isConnected || !conversationId || hasJoinedRef.current) {
      return;
    }

    const join = async () => {
      try {
        await joinChatRoom(conversationId);
        hasJoinedRef.current = true;
      } catch (error) {
        console.error('Failed to join conversation', error);
      }
    };

    void join();

    return () => {
      if (hasJoinedRef.current) {
        void leaveChatRoom(conversationId);
        hasJoinedRef.current = false;
      }
    };
  }, [conversationId, isConnected, joinChatRoom, leaveChatRoom]);

  useEffect(() => {
    if (!isConnected || !conversationId) {
      return;
    }

    const unsubscribe = signalRService.on('chatMessage', (message: ChatMessage) => {
      if (message.conversationId !== conversationId) {
        return;
      }

      setMessages((prev) => {
        if (prev.some((item) => String(item.id) === String(message.id))) {
          return prev;
        }
        return [...prev, message];
      });
    });

    return unsubscribe;
  }, [conversationId, isConnected]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!conversationId || !trimmed) {
        return;
      }

      const pendingId = crypto.randomUUID();
      const pendingMessage: ChatMessage = {
        id: pendingId,
        conversationId,
        senderId: user?.id ?? 'me',
        senderName: user?.name ?? '',
        content: trimmed,
        message: trimmed,
        timestamp: new Date(),
        isRead: false,
        messageType: 'text',
      };

      setMessages((prev) => [...prev, pendingMessage]);

      try {
        await sendChatMessage(pendingMessage);
      } catch (error) {
        setMessages((prev) => prev.filter((item) => item.id !== pendingId));
        throw error;
      }
    },
    [conversationId, sendChatMessage, user?.id, user?.name]
  );

  return {
    messages,
    setMessages,
    sendMessage,
  };
}

export function useOnlineStatus() {
  const [onlineUsers] = useState<Map<string, OnlineStatus>>(new Map());

  const isUserOnline = useCallback(
    (userId: string): boolean => {
      return onlineUsers.get(userId)?.isOnline ?? false;
    },
    [onlineUsers]
  );

  const getUserLastSeen = useCallback(
    (userId: string): Date | undefined => {
      return onlineUsers.get(userId)?.lastSeen;
    },
    [onlineUsers]
  );

  return {
    onlineUsers,
    isUserOnline,
    getUserLastSeen,
  };
}
