'use client';

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { signalRService } from '@/lib/services/signalRService';
import { ROLE_HUB_ACCESS, type UserRole } from '@/lib/constants/signalr';
import { useAuthStore } from '@/lib/store/authStore';
import type {
  ChatMessage,
  ConnectionState,
  NotificationMessage,
  OnlineStatus,
  SignalRContextValue,
  TypingIndicator,
} from '@/types/signalr.types';

export const SignalRContext = createContext<SignalRContextValue | null>(null);

interface SignalRProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
}

export function SignalRProvider({ children, autoConnect = true }: SignalRProviderProps) {
  const { user, isAuthenticated } = useAuthStore();

  const [chatConnectionState, setChatConnectionState] = useState<ConnectionState>('Disconnected');
  const [notificationConnectionState, setNotificationConnectionState] = useState<ConnectionState>('Disconnected');
  const [dashboardConnectionState, setDashboardConnectionState] = useState<ConnectionState>('Disconnected');
  const [connectionId, setConnectionId] = useState<string | null>(null);

  const isConnectingRef = useRef(false);

  const getUserHubAccess = useCallback((): string[] => {
    const role = String(user?.role ?? '').trim().toUpperCase() as UserRole;
    return [...(ROLE_HUB_ACCESS[role] ?? [])];
  }, [user?.role]);

  const connect = useCallback(async () => {
    if (!isAuthenticated || !user || isConnectingRef.current) {
      return;
    }

    isConnectingRef.current = true;
    const hubAccess = getUserHubAccess();

    try {
      if (hubAccess.includes('chat')) {
        setChatConnectionState('Connecting');
        await signalRService.connectChatHub();
        setChatConnectionState('Connected');
        setConnectionId(signalRService.getConnectionId('chat'));
      }

      if (hubAccess.includes('notification')) {
        setNotificationConnectionState('Connecting');
        await signalRService.connectNotificationHub();
        setNotificationConnectionState('Connected');
      }

      if (hubAccess.includes('dashboard')) {
        setDashboardConnectionState('Connecting');
        await signalRService.connectDashboardHub();
        setDashboardConnectionState('Connected');
      }
    } catch (error) {
      console.error('Failed to connect SignalR', error);
      setChatConnectionState('Disconnected');
      setNotificationConnectionState('Disconnected');
      setDashboardConnectionState('Disconnected');
      setConnectionId(null);
    } finally {
      isConnectingRef.current = false;
    }
  }, [getUserHubAccess, isAuthenticated, user]);

  const disconnect = useCallback(async () => {
    await signalRService.disconnectAll();
    setChatConnectionState('Disconnected');
    setNotificationConnectionState('Disconnected');
    setDashboardConnectionState('Disconnected');
    setConnectionId(null);
  }, []);

  useEffect(() => {
    if (autoConnect && isAuthenticated && user) {
      void connect();
    } else if (!isAuthenticated) {
      void disconnect();
    }
  }, [autoConnect, connect, disconnect, isAuthenticated, user]);

  useEffect(() => {
    const unsubscribeReconnecting = signalRService.on<{ hubName: string }>('reconnecting', ({ hubName }) => {
      if (hubName.includes('Chat')) {
        setChatConnectionState('Reconnecting');
      }
      if (hubName.includes('Notification')) {
        setNotificationConnectionState('Reconnecting');
      }
      if (hubName.includes('Dashboard')) {
        setDashboardConnectionState('Reconnecting');
      }
    });

    const unsubscribeReconnected = signalRService.on<{ hubName: string; connectionId?: string | null }>('reconnected', ({ hubName, connectionId: nextConnectionId }) => {
      if (hubName.includes('Chat')) {
        setChatConnectionState('Connected');
        setConnectionId(nextConnectionId ?? null);
      }
      if (hubName.includes('Notification')) {
        setNotificationConnectionState('Connected');
      }
      if (hubName.includes('Dashboard')) {
        setDashboardConnectionState('Connected');
      }
    });

    const unsubscribeConnectionClosed = signalRService.on<{ hubName: string }>('connectionClosed', ({ hubName }) => {
      if (hubName.includes('Chat')) {
        setChatConnectionState('Disconnected');
      }
      if (hubName.includes('Notification')) {
        setNotificationConnectionState('Disconnected');
      }
      if (hubName.includes('Dashboard')) {
        setDashboardConnectionState('Disconnected');
      }
    });

    return () => {
      unsubscribeReconnecting();
      unsubscribeReconnected();
      unsubscribeConnectionClosed();
    };
  }, []);

  const sendChatMessage = useCallback(async (message: ChatMessage) => {
    await signalRService.sendChatMessage(message);
  }, []);

  const joinChatRoom = useCallback(async (conversationId: number) => {
    await signalRService.joinChatRoom(conversationId);
  }, []);

  const leaveChatRoom = useCallback(async (conversationId: number) => {
    await signalRService.leaveChatRoom(conversationId);
  }, []);

  const sendTypingIndicator = useCallback(async (conversationId: number, isTyping: boolean) => {
    await signalRService.sendTypingIndicator(conversationId, isTyping);
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    await signalRService.markNotificationAsRead(notificationId);
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    await signalRService.markAllNotificationsAsRead();
  }, []);

  const onChatMessage = useCallback((callback: (message: ChatMessage) => void) => signalRService.on('chatMessage', callback), []);
  const onNotification = useCallback(
    (callback: (notification: NotificationMessage) => void) => signalRService.on('notification', callback),
    []
  );
  const onTypingIndicator = useCallback(
    (callback: (indicator: TypingIndicator) => void) => signalRService.on('typingIndicator', callback),
    []
  );
  const onUserOnlineStatus = useCallback((callback: (status: OnlineStatus) => void) => {
    const unsubscribeOnline = signalRService.on('userOnline', callback);
    const unsubscribeOffline = signalRService.on('userOffline', callback);

    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
    };
  }, []);

  const value = useMemo<SignalRContextValue>(
    () => ({
      connectionState: chatConnectionState,
      isConnected:
        chatConnectionState === 'Connected' ||
        notificationConnectionState === 'Connected' ||
        dashboardConnectionState === 'Connected',
      connectionId,
      connect,
      disconnect,
      sendChatMessage,
      joinChatRoom,
      leaveChatRoom,
      sendTypingIndicator,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      onChatMessage,
      onNotification,
      onTypingIndicator,
      onUserOnlineStatus,
    }),
    [
      chatConnectionState,
      connectionId,
      connect,
      dashboardConnectionState,
      disconnect,
      joinChatRoom,
      leaveChatRoom,
      markAllNotificationsAsRead,
      markNotificationAsRead,
      notificationConnectionState,
      onChatMessage,
      onNotification,
      onTypingIndicator,
      onUserOnlineStatus,
      sendChatMessage,
      sendTypingIndicator,
    ]
  );

  return <SignalRContext.Provider value={value}>{children}</SignalRContext.Provider>;
}
