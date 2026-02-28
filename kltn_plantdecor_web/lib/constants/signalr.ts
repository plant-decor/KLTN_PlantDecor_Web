/**
 * SignalR Configuration Constants
 * Cấu hình các hub endpoints và event names
 */

// Hub URLs
export const SIGNALR_CONFIG = {
  // Base URL - lấy từ environment variable
  BASE_URL:
    process.env.NEXT_PUBLIC_SIGNALR_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
    'http://localhost:8080',
  
  // Hub endpoints (relative to base URL)
  HUBS: {
    CHAT: '/hubs/chat',
    NOTIFICATION: '/hubs/notification',
    DASHBOARD: '/hubs/dashboard',
  },
  
  // Reconnect configuration
  RECONNECT: {
    RETRY_DELAYS: [0, 2000, 5000, 10000, 30000], // milliseconds
    MAX_RETRIES: 5,
  },
  
  // Connection options
  OPTIONS: {
    skipNegotiation: false,
    withCredentials: true, // Gửi cookies (authentication)
  },
} as const;

// Server -> Client Event Names (Nhận từ server)
export const SERVER_EVENTS = {
  // Chat events
  RECEIVE_MESSAGE: 'ReceiveMessage',
  USER_JOINED: 'UserJoined',
  USER_LEFT: 'UserLeft',
  USER_TYPING: 'UserTyping',
  USER_ONLINE: 'UserOnline',
  USER_OFFLINE: 'UserOffline',
  MESSAGE_DELIVERED: 'MessageDelivered',
  MESSAGE_READ: 'MessageRead',
  
  // Notification events
  RECEIVE_NOTIFICATION: 'ReceiveNotification',
  NOTIFICATION_READ: 'NotificationRead',
  BULK_NOTIFICATION: 'BulkNotification',
  
  // Dashboard events (for real-time metrics)
  DASHBOARD_UPDATE: 'DashboardUpdate',
  ORDER_STATUS_CHANGED: 'OrderStatusChanged',
  NEW_ORDER: 'NewOrder',
  INVENTORY_ALERT: 'InventoryAlert',
  TASK_ASSIGNED: 'TaskAssigned',
  TASK_COMPLETED: 'TaskCompleted',
} as const;

// Client -> Server Method Names (Gọi từ client lên server)
export const CLIENT_METHODS = {
  // Chat methods
  SEND_MESSAGE: 'SendMessage',
  JOIN_ROOM: 'JoinRoom',
  LEAVE_ROOM: 'LeaveRoom',
  TYPING_INDICATOR: 'TypingIndicator',
  MARK_MESSAGE_READ: 'MarkMessageRead',
  
  // Notification methods
  MARK_NOTIFICATION_READ: 'MarkNotificationRead',
  MARK_ALL_READ: 'MarkAllNotificationsRead',
  GET_UNREAD_COUNT: 'GetUnreadCount',
  
  // Dashboard methods
  SUBSCRIBE_DASHBOARD: 'SubscribeDashboard',
  UNSUBSCRIBE_DASHBOARD: 'UnsubscribeDashboard',
} as const;

// Role-based hub access
export const ROLE_HUB_ACCESS = {
  ADMIN: ['chat', 'notification', 'dashboard'],
  MANAGER: ['chat', 'notification', 'dashboard'],
  STAFF: ['chat', 'notification'],
  SHIPPER: ['notification'],
  CARETAKER: ['notification'],
  USER: ['chat'],
} as const;

export type UserRole = keyof typeof ROLE_HUB_ACCESS;
