/**
 * SignalR Types - Định nghĩa các types cho SignalR connection
 */

export type ConnectionState = 
  | 'Disconnected' 
  | 'Connecting' 
  | 'Connected' 
  | 'Reconnecting' 
  | 'Disconnecting';

export interface NotificationMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  isRead: boolean;
  userId?: string;
  role?: string;
  link?: string;
  data?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId?: string;
  roomId?: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: string[];
  messageType?: 'text' | 'image' | 'file';
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  roomId: string;
  isTyping: boolean;
}

export interface OnlineStatus {
  userId: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface SignalRContextValue {
  // Connection state
  connectionState: ConnectionState;
  isConnected: boolean;
  connectionId: string | null;

  // Connection methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;

  // Chat methods
  sendChatMessage: (message: ChatMessage) => Promise<void>;
  joinChatRoom: (roomId: string) => Promise<void>;
  leaveChatRoom: (roomId: string) => Promise<void>;
  sendTypingIndicator: (roomId: string, isTyping: boolean) => Promise<void>;

  // Notification methods
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;

  // Event listeners
  onChatMessage: (callback: (message: ChatMessage) => void) => () => void;
  onNotification: (callback: (notification: NotificationMessage) => void) => () => void;
  onTypingIndicator: (callback: (indicator: TypingIndicator) => void) => () => void;
  onUserOnlineStatus: (callback: (status: OnlineStatus) => void) => () => void;
}
