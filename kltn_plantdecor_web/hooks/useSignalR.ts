'use client';

/**
 * SignalR Custom Hooks
 * Các hooks tiện ích để sử dụng SignalR trong React components
 */

import { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { SignalRContext } from '@/components/providers/SignalRProvider';
import { signalRService } from '@/lib/services/signalRService';
import type { 
  ChatMessage, 
  NotificationMessage, 
  TypingIndicator,
  OnlineStatus,
} from '@/types/signalr.types';

/**
 * Main hook to access SignalR context
 */
export function useSignalR() {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error('useSignalR must be used within SignalRProvider');
  }
  return context;
}

/**
 * Hook để lắng nghe chat messages
 * @param onMessage - Callback khi nhận được message mới
 */
export function useChatMessages(onMessage: (message: ChatMessage) => void) {
  const { isConnected } = useSignalR();

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = signalRService.on('chatMessage', onMessage);
    return unsubscribe;
  }, [isConnected, onMessage]);
}

/**
 * Hook để lắng nghe notifications với state management
 * @returns { notifications, unreadCount, markAsRead, markAllAsRead }
 */
export function useNotifications() {
  const { isConnected, markNotificationAsRead, markAllNotificationsAsRead } = useSignalR();
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Listen for new notifications
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = signalRService.on('notification', (notification: NotificationMessage) => {
      setNotifications((prev) => [notification, ...prev]);
      if (!notification.isRead) {
        setUnreadCount((count) => count + 1);
      }
    });

    return unsubscribe;
  }, [isConnected]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount((count) => Math.max(0, count - 1));
  }, [markNotificationAsRead]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, [markAllNotificationsAsRead]);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}

/**
 * Hook để quản lý typing indicators trong chat room
 * @param roomId - ID của chat room
 */
export function useTypingIndicator(roomId: string) {
  const { isConnected, sendTypingIndicator } = useSignalR();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for typing indicators
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = signalRService.on('typingIndicator', (indicator: TypingIndicator) => {
      if (indicator.roomId !== roomId) return;

      setTypingUsers((prev) => {
        if (indicator.isTyping) {
          return prev.includes(indicator.userName)
            ? prev
            : [...prev, indicator.userName];
        } else {
          return prev.filter((user) => user !== indicator.userName);
        }
      });
    });

    return unsubscribe;
  }, [isConnected, roomId]);

  // Send typing indicator
  const startTyping = useCallback(() => {
    sendTypingIndicator(roomId, true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(roomId, false);
    }, 3000);
  }, [roomId, sendTypingIndicator]);

  const stopTyping = useCallback(() => {
    sendTypingIndicator(roomId, false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [roomId, sendTypingIndicator]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
  };
}

/**
 * Hook để theo dõi online status của users
 */
export function useOnlineStatus() {
  const { isConnected } = useSignalR();
  const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineStatus>>(new Map());

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeOnline = signalRService.on('userOnline', (status: OnlineStatus) => {
      setOnlineUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(status.userId, { ...status, isOnline: true });
        return newMap;
      });
    });

    const unsubscribeOffline = signalRService.on('userOffline', (status: OnlineStatus) => {
      setOnlineUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(status.userId, { ...status, isOnline: false });
        return newMap;
      });
    });

    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
    };
  }, [isConnected]);

  const isUserOnline = useCallback((userId: string): boolean => {
    return onlineUsers.get(userId)?.isOnline ?? false;
  }, [onlineUsers]);

  const getUserLastSeen = useCallback((userId: string): Date | undefined => {
    return onlineUsers.get(userId)?.lastSeen;
  }, [onlineUsers]);

  return {
    onlineUsers,
    isUserOnline,
    getUserLastSeen,
  };
}

/**
 * Hook để quản lý chat room
 * @param roomId - ID của chat room
 */
export function useChatRoom(roomId: string | null) {
  const { isConnected, joinChatRoom, leaveChatRoom, sendChatMessage } = useSignalR();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const hasJoinedRef = useRef(false);

  // Auto join/leave room
  useEffect(() => {
    if (!isConnected || !roomId || hasJoinedRef.current) return;

    const joinRoom = async () => {
      try {
        await joinChatRoom(roomId);
        hasJoinedRef.current = true;
        console.log(`✅ Joined chat room: ${roomId}`);
      } catch (error) {
        console.error(`❌ Failed to join room ${roomId}:`, error);
      }
    };

    joinRoom();

    return () => {
      if (hasJoinedRef.current && roomId) {
        leaveChatRoom(roomId);
        hasJoinedRef.current = false;
        console.log(`👋 Left chat room: ${roomId}`);
      }
    };
  }, [isConnected, roomId, joinChatRoom, leaveChatRoom]);

  // Listen for messages in this room
  useEffect(() => {
    if (!isConnected || !roomId) return;

    const unsubscribe = signalRService.on('chatMessage', (message: ChatMessage) => {
      if (message.roomId === roomId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return unsubscribe;
  }, [isConnected, roomId]);

  // Send message
  const sendMessage = useCallback(async (messageText: string, attachments?: string[]) => {
    if (!roomId) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: '', // Will be set by server
      senderName: '', // Will be set by server
      roomId,
      message: messageText,
      timestamp: new Date(),
      isRead: false,
      attachments,
      messageType: 'text',
    };

    await sendChatMessage(message);
  }, [roomId, sendChatMessage]);

  return {
    messages,
    sendMessage,
    setMessages, // For clearing or initializing messages
  };
}

/**
 * Hook để lắng nghe dashboard real-time updates (for admin/manager)
 */
export function useDashboardUpdates() {
  const { isConnected } = useSignalR();
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeUpdate = signalRService.on('dashboardUpdate', (data: any) => {
      setUpdates((prev) => [data, ...prev].slice(0, 50)); // Keep last 50 updates
    });

    const unsubscribeNewOrder = signalRService.on('newOrder', (order: any) => {
      setUpdates((prev) => [{ type: 'newOrder', data: order, timestamp: new Date() }, ...prev].slice(0, 50));
    });

    const unsubscribeOrderStatus = signalRService.on('orderStatusChanged', (data: any) => {
      setUpdates((prev) => [{ type: 'orderStatus', data, timestamp: new Date() }, ...prev].slice(0, 50));
    });

    const unsubscribeInventory = signalRService.on('inventoryAlert', (alert: any) => {
      setUpdates((prev) => [{ type: 'inventory', data: alert, timestamp: new Date() }, ...prev].slice(0, 50));
    });

    const unsubscribeTaskAssigned = signalRService.on('taskAssigned', (task: any) => {
      setUpdates((prev) => [{ type: 'taskAssigned', data: task, timestamp: new Date() }, ...prev].slice(0, 50));
    });

    const unsubscribeTaskCompleted = signalRService.on('taskCompleted', (task: any) => {
      setUpdates((prev) => [{ type: 'taskCompleted', data: task, timestamp: new Date() }, ...prev].slice(0, 50));
    });

    return () => {
      unsubscribeUpdate();
      unsubscribeNewOrder();
      unsubscribeOrderStatus();
      unsubscribeInventory();
      unsubscribeTaskAssigned();
      unsubscribeTaskCompleted();
    };
  }, [isConnected]);

  return {
    updates,
    clearUpdates: () => setUpdates([]),
  };
}
