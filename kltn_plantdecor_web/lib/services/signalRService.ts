/**
 * SignalR Service - Quản lý kết nối SignalR với backend
 *
 * 🔒 Bảo mật:
 * - Sử dụng cookie-based authentication (withCredentials: true)
 * - Token được gửi tự động qua HTTP-only cookies
 * - Tự động reconnect khi mất kết nối
 *
 * 🎯 Chức năng:
 * - Quản lý multiple hubs (chat, notification, dashboard)
 * - Event-driven architecture
 * - Auto-reconnection với exponential backoff
 */

import * as signalR from "@microsoft/signalr";
import {
  SIGNALR_CONFIG,
  SERVER_EVENTS,
  CLIENT_METHODS,
} from "@/lib/constants/signalr";
import type {
  ChatMessage,
  NotificationMessage,
  TypingIndicator,
  ConnectionState,
} from "@/types/signalr.types";

type EventCallback<T = unknown> = (data: T) => void;

class SignalRService {
  private chatHub: signalR.HubConnection | null = null;
  private notificationHub: signalR.HubConnection | null = null;
  private dashboardHub: signalR.HubConnection | null = null;

  private eventHandlers: Map<string, Set<EventCallback<unknown>>> = new Map();
  private reconnectAttempts = 0;

  /**
   * Khởi tạo chat hub connection
   */
  async connectChatHub(): Promise<signalR.HubConnection> {
    if (this.chatHub?.state === signalR.HubConnectionState.Connected) {
      return this.chatHub;
    }

    this.chatHub = this.createConnection(SIGNALR_CONFIG.HUBS.CHAT);
    await this.startConnection(this.chatHub, "Chat Hub");
    this.setupChatEventHandlers();

    return this.chatHub;
  }

  /**
   * Khởi tạo notification hub connection
   */
  async connectNotificationHub(): Promise<signalR.HubConnection> {
    if (this.notificationHub?.state === signalR.HubConnectionState.Connected) {
      return this.notificationHub;
    }

    this.notificationHub = this.createConnection(
      SIGNALR_CONFIG.HUBS.NOTIFICATION,
    );
    await this.startConnection(this.notificationHub, "Notification Hub");
    this.setupNotificationEventHandlers();

    return this.notificationHub;
  }

  /**
   * Khởi tạo dashboard hub connection (for admin/manager)
   */
  async connectDashboardHub(): Promise<signalR.HubConnection> {
    if (this.dashboardHub?.state === signalR.HubConnectionState.Connected) {
      return this.dashboardHub;
    }

    this.dashboardHub = this.createConnection(SIGNALR_CONFIG.HUBS.DASHBOARD);
    await this.startConnection(this.dashboardHub, "Dashboard Hub");
    this.setupDashboardEventHandlers();

    return this.dashboardHub;
  }

  /**
   * Tạo SignalR connection với cấu hình
   */
  private createConnection(hubPath: string): signalR.HubConnection {
    const url = `${SIGNALR_CONFIG.BASE_URL}${hubPath}`;

    return new signalR.HubConnectionBuilder()
      .withUrl(url, {
        withCredentials: SIGNALR_CONFIG.OPTIONS.withCredentials,
        skipNegotiation: SIGNALR_CONFIG.OPTIONS.skipNegotiation,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect([...SIGNALR_CONFIG.RECONNECT.RETRY_DELAYS])
      .configureLogging(signalR.LogLevel.Information)
      .build();
  }

  /**
   * Bắt đầu connection với error handling
   */
  private async startConnection(
    connection: signalR.HubConnection,
    hubName: string,
  ): Promise<void> {
    try {
      await connection.start();
      console.log(`✅ ${hubName} connected successfully`);
      this.reconnectAttempts = 0;

      // Setup lifecycle events
      connection.onclose((error) => {
        console.log(`❌ ${hubName} connection closed`, error);
        this.emit("connectionClosed", { hubName, error });
        this.handleReconnect(connection, hubName);
      });

      connection.onreconnecting((error) => {
        console.log(`🔄 ${hubName} reconnecting...`, error);
        this.emit("reconnecting", { hubName, error });
      });

      connection.onreconnected((connectionId) => {
        console.log(`✅ ${hubName} reconnected`, connectionId);
        this.emit("reconnected", { hubName, connectionId });
        this.reconnectAttempts = 0;
      });
    } catch (error) {
      console.error(`❌ Failed to connect to ${hubName}:`, error);
      throw error;
    }
  }

  /**
   * Xử lý reconnect với exponential backoff
   */
  private async handleReconnect(
    connection: signalR.HubConnection,
    hubName: string,
  ): Promise<void> {
    if (this.reconnectAttempts >= SIGNALR_CONFIG.RECONNECT.MAX_RETRIES) {
      console.error(`❌ Max reconnect attempts reached for ${hubName}`);
      this.emit("maxReconnectAttemptsReached", { hubName });
      return;
    }

    const delay =
      SIGNALR_CONFIG.RECONNECT.RETRY_DELAYS[
        Math.min(
          this.reconnectAttempts,
          SIGNALR_CONFIG.RECONNECT.RETRY_DELAYS.length - 1,
        )
      ];

    this.reconnectAttempts++;
    console.log(
      `⏳ Reconnecting to ${hubName} in ${delay}ms (attempt ${this.reconnectAttempts})`,
    );

    setTimeout(async () => {
      try {
        await this.startConnection(connection, hubName);
      } catch (error) {
        console.error(`❌ Reconnect failed for ${hubName}:`, error);
        this.handleReconnect(connection, hubName);
      }
    }, delay);
  }

  /**
   * Setup Chat Hub event handlers
   */
  private setupChatEventHandlers(): void {
    if (!this.chatHub) return;

    this.chatHub.on(
      SERVER_EVENTS.MESSAGE_RECEIVED,
      (payload: {
        messageId: number;
        conversationId: number;
        senderId: number;
        content: string;
        sendAt: string;
      }) => {
        const message: ChatMessage = {
          id: payload.messageId,
          conversationId: payload.conversationId,
          senderId: payload.senderId,
          senderName: "",
          content: payload.content,
          message: payload.content,
          sendAt: payload.sendAt,
          timestamp: new Date(payload.sendAt),
          isRead: false,
          messageType: "text",
        };
        this.emit("chatMessage", message);
      },
    );

    this.chatHub.on(
      SERVER_EVENTS.USER_TYPING,
      (payload: { conversationId: number; userId: number }) => {
        const indicator: TypingIndicator = {
          conversationId: payload.conversationId,
          userId: payload.userId,
          isTyping: true,
        };
        this.emit("typingIndicator", indicator);
      },
    );

    this.chatHub.on(
      SERVER_EVENTS.USER_STOPPED_TYPING,
      (payload: { conversationId: number; userId: number }) => {
        const indicator: TypingIndicator = {
          conversationId: payload.conversationId,
          userId: payload.userId,
          isTyping: false,
        };
        this.emit("typingIndicator", indicator);
      },
    );

    this.chatHub.on(SERVER_EVENTS.MESSAGE_DELIVERED, (messageId: string) => {
      this.emit("messageDelivered", messageId);
    });

    this.chatHub.on(SERVER_EVENTS.MESSAGE_READ, (messageId: string) => {
      this.emit("messageRead", messageId);
    });
  }

  /**
   * Setup Notification Hub event handlers
   */
  private setupNotificationEventHandlers(): void {
    if (!this.notificationHub) return;

    this.notificationHub.on(
      SERVER_EVENTS.RECEIVE_NOTIFICATION,
      (notification: NotificationMessage) => {
        this.emit("notification", notification);
      },
    );

    this.notificationHub.on(
      SERVER_EVENTS.BULK_NOTIFICATION,
      (notifications: NotificationMessage[]) => {
        this.emit("bulkNotification", notifications);
      },
    );

    this.notificationHub.on(
      SERVER_EVENTS.NOTIFICATION_READ,
      (notificationId: string) => {
        this.emit("notificationRead", notificationId);
      },
    );
  }

  /**
   * Setup Dashboard Hub event handlers
   */
  private setupDashboardEventHandlers(): void {
    if (!this.dashboardHub) return;

    this.dashboardHub.on(SERVER_EVENTS.DASHBOARD_UPDATE, (data: unknown) => {
      this.emit("dashboardUpdate", data);
    });

    this.dashboardHub.on(SERVER_EVENTS.NEW_ORDER, (order: unknown) => {
      this.emit("newOrder", order);
    });

    this.dashboardHub.on(
      SERVER_EVENTS.ORDER_STATUS_CHANGED,
      (data: unknown) => {
        this.emit("orderStatusChanged", data);
      },
    );

    this.dashboardHub.on(SERVER_EVENTS.INVENTORY_ALERT, (alert: unknown) => {
      this.emit("inventoryAlert", alert);
    });

    this.dashboardHub.on(SERVER_EVENTS.TASK_ASSIGNED, (task: unknown) => {
      this.emit("taskAssigned", task);
    });

    this.dashboardHub.on(SERVER_EVENTS.TASK_COMPLETED, (task: unknown) => {
      this.emit("taskCompleted", task);
    });
  }

  // ===== Client Methods (Call server methods) =====

  /**
   * Gửi chat message
   */
  async sendChatMessage(message: ChatMessage): Promise<void> {
    if (
      !this.chatHub ||
      this.chatHub.state !== signalR.HubConnectionState.Connected
    ) {
      throw new Error("Chat hub is not connected");
    }
    const conversationId = message.conversationId;
    const content = message.content || message.message;

    if (!conversationId || !content?.trim()) {
      throw new Error("conversationId and content are required");
    }

    await this.chatHub.invoke(
      CLIENT_METHODS.SEND_MESSAGE,
      conversationId,
      content,
    );
  }

  /**
   * Join chat room
   */
  async joinChatRoom(conversationId: number): Promise<void> {
    if (
      !this.chatHub ||
      this.chatHub.state !== signalR.HubConnectionState.Connected
    ) {
      throw new Error("Chat hub is not connected");
    }
    await this.chatHub.invoke(CLIENT_METHODS.JOIN_CONVERSATION, conversationId);
  }

  /**
   * Leave chat room
   */
  async leaveChatRoom(conversationId: number): Promise<void> {
    if (
      !this.chatHub ||
      this.chatHub.state !== signalR.HubConnectionState.Connected
    ) {
      throw new Error("Chat hub is not connected");
    }
    await this.chatHub.invoke(
      CLIENT_METHODS.LEAVE_CONVERSATION,
      conversationId,
    );
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(
    conversationId: number,
    isTyping: boolean,
  ): Promise<void> {
    if (
      !this.chatHub ||
      this.chatHub.state !== signalR.HubConnectionState.Connected
    ) {
      return; // Silent fail for typing indicator
    }
    await this.chatHub.invoke(
      isTyping
        ? CLIENT_METHODS.USER_TYPING
        : CLIENT_METHODS.USER_STOPPED_TYPING,
      conversationId,
    );
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    if (
      !this.notificationHub ||
      this.notificationHub.state !== signalR.HubConnectionState.Connected
    ) {
      throw new Error("Notification hub is not connected");
    }
    await this.notificationHub.invoke(
      CLIENT_METHODS.MARK_NOTIFICATION_READ,
      notificationId,
    );
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<void> {
    if (
      !this.notificationHub ||
      this.notificationHub.state !== signalR.HubConnectionState.Connected
    ) {
      throw new Error("Notification hub is not connected");
    }
    await this.notificationHub.invoke(CLIENT_METHODS.MARK_ALL_READ);
  }

  /**
   * Subscribe to dashboard updates (admin/manager only)
   */
  async subscribeDashboard(dashboardType: string): Promise<void> {
    if (
      !this.dashboardHub ||
      this.dashboardHub.state !== signalR.HubConnectionState.Connected
    ) {
      throw new Error("Dashboard hub is not connected");
    }
    await this.dashboardHub.invoke(
      CLIENT_METHODS.SUBSCRIBE_DASHBOARD,
      dashboardType,
    );
  }

  // ===== Event Emitter Pattern =====

  /**
   * Subscribe to events
   */
  on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(callback as EventCallback<unknown>);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(event)?.delete(callback as EventCallback<unknown>);
    };
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((callback) => callback(data));
    }
  }

  /**
   * Remove all event listeners
   */
  off(event?: string): void {
    if (event) {
      this.eventHandlers.delete(event);
    } else {
      this.eventHandlers.clear();
    }
  }

  // ===== Connection Management =====

  /**
   * Get connection state
   */
  getConnectionState(
    hub: "chat" | "notification" | "dashboard",
  ): ConnectionState {
    const connection = this[`${hub}Hub`];
    if (!connection) return "Disconnected" as ConnectionState;

    const stateMap: Record<signalR.HubConnectionState, ConnectionState> = {
      [signalR.HubConnectionState.Disconnected]:
        "Disconnected" as ConnectionState,
      [signalR.HubConnectionState.Connecting]: "Connecting" as ConnectionState,
      [signalR.HubConnectionState.Connected]: "Connected" as ConnectionState,
      [signalR.HubConnectionState.Reconnecting]:
        "Reconnecting" as ConnectionState,
      [signalR.HubConnectionState.Disconnecting]:
        "Disconnecting" as ConnectionState,
    };

    return stateMap[connection.state];
  }

  /**
   * Get connection ID
   */
  getConnectionId(hub: "chat" | "notification" | "dashboard"): string | null {
    const connection = this[`${hub}Hub`];
    return connection?.connectionId || null;
  }

  /**
   * Disconnect specific hub
   */
  async disconnect(hub: "chat" | "notification" | "dashboard"): Promise<void> {
    const connection = this[`${hub}Hub`];
    if (
      connection &&
      connection.state !== signalR.HubConnectionState.Disconnected
    ) {
      await connection.stop();
      this[`${hub}Hub`] = null;
    }
  }

  /**
   * Disconnect all hubs
   */
  async disconnectAll(): Promise<void> {
    await Promise.all([
      this.disconnect("chat"),
      this.disconnect("notification"),
      this.disconnect("dashboard"),
    ]);
    this.eventHandlers.clear();
  }

  /**
   * Check if hub is connected
   */
  isConnected(hub: "chat" | "notification" | "dashboard"): boolean {
    const connection = this[`${hub}Hub`];
    return connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Export singleton instance
export const signalRService = new SignalRService();
