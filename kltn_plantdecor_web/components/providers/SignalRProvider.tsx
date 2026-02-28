'use client';

/**
 * SignalR Provider - Quản lý SignalR connection cho toàn bộ app
 * 
 * 🎯 Chức năng:
 * - Tự động connect/disconnect theo user authentication
 * - Cung cấp context cho các components
 * - Quản lý connection state theo user role
 * - Tự động reconnect khi mất kết nối
 * 
 * 📍 Sử dụng:
 * - Wrap app layout với <SignalRProvider>
 * - Access trong components bằng useSignalR() hook
 */

import React, { createContext, useEffect, useState, useCallback, useRef } from 'react';
import { signalRService } from '@/lib/services/signalRService';
import { useAuthStore } from '@/store/authStore';
import { ROLE_HUB_ACCESS, type UserRole } from '@/lib/constants/signalr';
import type { 
  SignalRContextValue, 
  ConnectionState,
  ChatMessage,
  NotificationMessage,
  TypingIndicator,
  OnlineStatus,
} from '@/types/signalr.types';

export const SignalRContext = createContext<SignalRContextValue | null>(null);

interface SignalRProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean; // Auto connect khi user login
}

export function SignalRProvider({ children, autoConnect = true }: SignalRProviderProps) {
  const { user, isAuthenticated } = useAuthStore();
  
  const [chatConnectionState, setChatConnectionState] = useState<ConnectionState>('Disconnected');
  const [notificationConnectionState, setNotificationConnectionState] = useState<ConnectionState>('Disconnected');
  const [dashboardConnectionState, setDashboardConnectionState] = useState<ConnectionState>('Disconnected');
  
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const isConnectingRef = useRef(false);

  // Determine which hubs user can access based on role
  const getUserHubAccess = useCallback((): string[] => {
    if (!user || !user.role) return [];
    const role = user.role.toUpperCase() as UserRole;
    return [...(ROLE_HUB_ACCESS[role] || [])];
  }, [user]);

  // Connect to appropriate hubs based on user role
  const connect = useCallback(async () => {
    if (!isAuthenticated || !user || isConnectingRef.current) return;
    
    isConnectingRef.current = true;
    const hubAccess = getUserHubAccess();
    
    try {
      // Connect to chat hub (for users with chat access)
      if (hubAccess.includes('chat')) {
        setChatConnectionState('Connecting');
        await signalRService.connectChatHub();
        setChatConnectionState('Connected');
        const chatConnId = signalRService.getConnectionId('chat');
        if (chatConnId) setConnectionId(chatConnId);
        console.log('✅ Chat Hub connected');
      }

      // Connect to notification hub (for staff, manager, admin)
      if (hubAccess.includes('notification')) {
        setNotificationConnectionState('Connecting');
        await signalRService.connectNotificationHub();
        setNotificationConnectionState('Connected');
        console.log('✅ Notification Hub connected');
      }

      // Connect to dashboard hub (for manager, admin)
      if (hubAccess.includes('dashboard')) {
        setDashboardConnectionState('Connecting');
        await signalRService.connectDashboardHub();
        setDashboardConnectionState('Connected');
        console.log('✅ Dashboard Hub connected');
      }
    } catch (error) {
      console.error('❌ Failed to connect SignalR:', error);
      setChatConnectionState('Disconnected');
      setNotificationConnectionState('Disconnected');
      setDashboardConnectionState('Disconnected');
    } finally {
      isConnectingRef.current = false;
    }
  }, [isAuthenticated, user, getUserHubAccess]);

  // Disconnect from all hubs
  const disconnect = useCallback(async () => {
    await signalRService.disconnectAll();
    setChatConnectionState('Disconnected');
    setNotificationConnectionState('Disconnected');
    setDashboardConnectionState('Disconnected');
    setConnectionId(null);
    console.log('🔌 All SignalR hubs disconnected');
  }, []);

  // Auto connect/disconnect based on authentication
  useEffect(() => {
    if (autoConnect && isAuthenticated && user) {
      connect();
    } else if (!isAuthenticated) {
      disconnect();
    }

    return () => {
      if (!isAuthenticated) {
        disconnect();
      }
    };
  }, [isAuthenticated, user, autoConnect, connect, disconnect]);

  // Setup lifecycle event listeners
  useEffect(() => {
    const unsubscribeReconnecting = signalRService.on('reconnecting', ({ hubName }) => {
      console.log(`🔄 ${hubName} reconnecting...`);
      if (hubName.includes('Chat')) setChatConnectionState('Reconnecting');
      if (hubName.includes('Notification')) setNotificationConnectionState('Reconnecting');
      if (hubName.includes('Dashboard')) setDashboardConnectionState('Reconnecting');
    });

    const unsubscribeReconnected = signalRService.on('reconnected', ({ hubName, connectionId }) => {
      console.log(`✅ ${hubName} reconnected:`, connectionId);
      if (hubName.includes('Chat')) {
        setChatConnectionState('Connected');
        setConnectionId(connectionId);
      }
      if (hubName.includes('Notification')) setNotificationConnectionState('Connected');
      if (hubName.includes('Dashboard')) setDashboardConnectionState('Connected');
    });

    const unsubscribeConnectionClosed = signalRService.on('connectionClosed', ({ hubName }) => {
      console.log(`❌ ${hubName} connection closed`);
      if (hubName.includes('Chat')) setChatConnectionState('Disconnected');
      if (hubName.includes('Notification')) setNotificationConnectionState('Disconnected');
      if (hubName.includes('Dashboard')) setDashboardConnectionState('Disconnected');
    });

    return () => {
      unsubscribeReconnecting();
      unsubscribeReconnected();
      unsubscribeConnectionClosed();
    };
  }, []);

  // ===== Chat Methods =====

  const sendChatMessage = useCallback(async (message: ChatMessage) => {
    await signalRService.sendChatMessage(message);
  }, []);

  const joinChatRoom = useCallback(async (roomId: string) => {
    await signalRService.joinChatRoom(roomId);
  }, []);

  const leaveChatRoom = useCallback(async (roomId: string) => {
    await signalRService.leaveChatRoom(roomId);
  }, []);

  const sendTypingIndicator = useCallback(async (roomId: string, isTyping: boolean) => {
    await signalRService.sendTypingIndicator(roomId, isTyping);
  }, []);

  // ===== Notification Methods =====

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    await signalRService.markNotificationAsRead(notificationId);
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    await signalRService.markAllNotificationsAsRead();
  }, []);

  // ===== Event Listeners =====

  const onChatMessage = useCallback((callback: (message: ChatMessage) => void) => {
    return signalRService.on('chatMessage', callback);
  }, []);

  const onNotification = useCallback((callback: (notification: NotificationMessage) => void) => {
    return signalRService.on('notification', callback);
  }, []);

  const onTypingIndicator = useCallback((callback: (indicator: TypingIndicator) => void) => {
    return signalRService.on('typingIndicator', callback);
  }, []);

  const onUserOnlineStatus = useCallback((callback: (status: OnlineStatus) => void) => {
    const unsubscribeOnline = signalRService.on('userOnline', callback);
    const unsubscribeOffline = signalRService.on('userOffline', callback);
    
    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
    };
  }, []);

  // Context value
  const value: SignalRContextValue = {
    // Connection state
    connectionState: chatConnectionState, // Primary connection state
    isConnected: chatConnectionState === 'Connected' || 
                 notificationConnectionState === 'Connected' || 
                 dashboardConnectionState === 'Connected',
    connectionId,

    // Connection methods
    connect,
    disconnect,

    // Chat methods
    sendChatMessage,
    joinChatRoom,
    leaveChatRoom,
    sendTypingIndicator,

    // Notification methods
    markNotificationAsRead,
    markAllNotificationsAsRead,

    // Event listeners
    onChatMessage,
    onNotification,
    onTypingIndicator,
    onUserOnlineStatus,
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
}
