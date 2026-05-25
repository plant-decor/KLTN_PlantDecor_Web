import * as signalR from "@microsoft/signalr";
import { getValidAccessToken } from "@/lib/auth/getValidAccessToken";

export type MessageReceivedPayload = {
  messageId: number;
  conversationId: number;
  senderId: number;
  content: string;
  sendAt: string;
};

export type TypingPayload = {
  conversationId: number;
  userId: number;
};

type ChatEventMap = {
  messageReceived: MessageReceivedPayload;
  userTyping: TypingPayload;
  userStoppedTyping: TypingPayload;
  reconnecting: Error | undefined;
  reconnected: string | undefined;
  closed: Error | undefined;
};

type EventKey = keyof ChatEventMap;
type EventCallback<K extends EventKey> = (payload: ChatEventMap[K]) => void;
type ListenerStore = Partial<{
  [K in EventKey]: Set<EventCallback<K>>;
}>;

class ChatHubService {
  private connection: signalR.HubConnection | null = null;
  private startPromise: Promise<signalR.HubConnection> | null = null;
  private joinedConversationIds = new Set<number>();
  private listeners: ListenerStore = {};

  private readonly hubUrl = `${process.env.NEXT_PUBLIC_SIGNALR_BASE_URL}/hubs/chat`;

  private isDebugEnabled() {
    return process.env.NEXT_PUBLIC_DEBUG_AUTH === "1";
  }

  private isUnauthorizedError(error: unknown): boolean {
    const message =
      typeof (error as { message?: unknown } | null)?.message === "string"
        ? String((error as { message: string }).message)
        : "";

    return (
      /unauthorized/i.test(message) ||
      /\b401\b/.test(message) ||
      /Unable to identify user from token/i.test(message)
    );
  }

  private emit<K extends EventKey>(event: K, payload: ChatEventMap[K]) {
    const listeners = this.listeners[event] as
      | Set<EventCallback<K>>
      | undefined;
    listeners?.forEach((cb) => cb(payload));
  }

  on<K extends EventKey>(event: K, callback: EventCallback<K>) {
    const listeners = this.getListeners(event);

    listeners.add(callback);

    return () => {
      listeners.delete(callback);
    };
  }

  private getListeners<K extends EventKey>(event: K) {
    const listeners = this.listeners[event] as
      | Set<EventCallback<K>>
      | undefined;

    if (listeners) {
      return listeners;
    }

    const createdListeners = new Set<EventCallback<K>>();
    this.listeners[event] = createdListeners as unknown as ListenerStore[K];

    return createdListeners;
  }

  private createConnection() {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: async () => (await getValidAccessToken()) || "",
        withCredentials: true,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.bindConnectionEvents(connection);

    return connection;
  }

  private bindConnectionEvents(connection: signalR.HubConnection) {
    // tránh bind trùng nếu recreate connection
    connection.off("messageReceived");
    connection.off("userTyping");
    connection.off("userStoppedTyping");

    connection.on("messageReceived", (payload: MessageReceivedPayload) => {
      this.emit("messageReceived", payload);
    });

    connection.on("userTyping", (payload: TypingPayload) => {
      this.emit("userTyping", payload);
    });

    connection.on("userStoppedTyping", (payload: TypingPayload) => {
      this.emit("userStoppedTyping", payload);
    });

    connection.onreconnecting((error) => {
      this.emit("reconnecting", error);
    });

    connection.onreconnected(async (connectionId) => {
      // Rejoin all rooms first so the server registers the participant before
      // the UI becomes active. Emitting "reconnected" before JoinConversation
      // completes causes a race where SendMessage arrives before the server
      // has accepted the join → "HubException: Not a participant".
      const roomIds = [...this.joinedConversationIds];
      for (const conversationId of roomIds) {
        try {
          await connection.invoke("JoinConversation", conversationId);
        } catch (error) {
          console.error(
            `Rejoin conversation ${conversationId} failed after reconnect`,
            error,
          );
        }
      }

      this.emit("reconnected", connectionId);
    });

    connection.onclose((error) => {
      this.emit("closed", error);
    });
  }

  async connect() {
    if (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Connected
    ) {
      return this.connection;
    }

    if (this.startPromise) {
      return this.startPromise;
    }

    if (!this.connection) {
      this.connection = this.createConnection();
    }

    if (this.isDebugEnabled()) {
      console.log("[signalr] connect(): starting hub connection");
    }

    this.startPromise = this.connection
      .start()
      .then(() => {
        if (this.isDebugEnabled()) {
          console.log("[signalr] connect(): connected", {
            connectionId: this.connection?.connectionId,
          });
        }
        return this.connection!;
      })
      .finally(() => {
        this.startPromise = null;
      });

    return this.startPromise;
  }

  private async stopConnectionPreserveRooms() {
    if (
      this.connection &&
      this.connection.state !== signalR.HubConnectionState.Disconnected
    ) {
      try {
        await this.connection.stop();
      } catch (error) {
        console.warn("Failed to stop chat hub connection:", error);
      }
    }
    this.connection = null;
    this.startPromise = null;
  }

  async restart() {
    const roomIds = [...this.joinedConversationIds];
    if (this.isDebugEnabled()) {
      console.log("[signalr] restart(): restarting hub, rooms:", roomIds);
    }
    await this.stopConnectionPreserveRooms();

    await this.connect();

    // Re-join rooms after a fresh connection is established.
    for (const conversationId of roomIds) {
      try {
        await this.connection?.invoke("JoinConversation", conversationId);
      } catch (error) {
        console.error(`Rejoin conversation ${conversationId} failed after restart`, error);
      }
    }
  }

  async disconnect() {
    this.joinedConversationIds.clear();

    if (
      this.connection &&
      this.connection.state !== signalR.HubConnectionState.Disconnected
    ) {
      await this.connection.stop();
    }

    this.connection = null;
    this.startPromise = null;
  }

  isConnected() {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  getConnectionState() {
    return this.connection?.state ?? signalR.HubConnectionState.Disconnected;
  }

  async ensureConnected() {
    if (!this.isConnected()) {
      await this.connect();
    }

    if (!this.connection) {
      throw new Error("Chat hub did not connect successfully");
    }

    return this.connection;
  }

  private async invokeWithAuthRetry<T = unknown>(
    method: string,
    args: unknown[],
    options: { retryOnce?: boolean } = {},
  ): Promise<T> {
    const { retryOnce = true } = options;
    const connection = await this.ensureConnected();

    try {
      return (await connection.invoke(method, ...args)) as T;
    } catch (error) {
      if (!retryOnce || !this.isUnauthorizedError(error)) {
        throw error;
      }

      if (this.isDebugEnabled()) {
        console.log("[signalr] invoke unauthorized -> refresh + restart + retry", {
          method,
        });
      }

      // Force refresh and restart hub, then retry once.
      const refreshed = await getValidAccessToken({ forceRefresh: true });
      if (!refreshed) {
        // getValidAccessToken() already redirected; fail fast.
        throw error;
      }

      await this.restart();

      try {
        const restarted = await this.ensureConnected();
        return (await restarted.invoke(method, ...args)) as T;
      } catch (retryError) {
        if (this.isUnauthorizedError(retryError)) {
          if (this.isDebugEnabled()) {
            console.log("[signalr] retry still unauthorized -> disconnect + redirect login", {
              method,
            });
          }
          await this.disconnect();
          // getValidAccessToken() redirected on refresh failure;
          // if we still got unauthorized after refresh, force login redirect.
          void getValidAccessToken({ forceRefresh: true, redirectOnFailure: true });
        }
        throw retryError;
      }
    }
  }

  async joinConversation(conversationId: number) {
    await this.invokeWithAuthRetry("JoinConversation", [conversationId]);
    this.joinedConversationIds.add(conversationId);
  }

  async leaveConversation(conversationId: number) {
    if (
      !this.connection ||
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      this.joinedConversationIds.delete(conversationId);
      return;
    }

    await this.invokeWithAuthRetry("LeaveConversation", [conversationId]);
    this.joinedConversationIds.delete(conversationId);
  }

  async sendMessage(conversationId: number, content: string) {
    const trimmed = content.trim();
    if (!trimmed) {
      throw new Error("Message content cannot be empty");
    }

    await this.invokeWithAuthRetry("SendMessage", [conversationId, trimmed]);
  }

  async sendTyping(conversationId: number) {
    if (
      !this.connection ||
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      return;
    }

    try {
      await this.invokeWithAuthRetry("UserTyping", [conversationId]);
    } catch (error) {
      if (this.isUnauthorizedError(error)) {
        // getValidAccessToken() already redirects on failure; keep typing non-blocking.
        return;
      }
      console.warn("UserTyping failed:", error);
    }
  }

  async sendStopTyping(conversationId: number) {
    if (
      !this.connection ||
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      return;
    }

    try {
      await this.invokeWithAuthRetry("UserStoppedTyping", [conversationId]);
    } catch (error) {
      if (this.isUnauthorizedError(error)) {
        return;
      }
      console.warn("UserStoppedTyping failed:", error);
    }
  }

  clearAllListeners() {
    (Object.keys(this.listeners) as EventKey[]).forEach((key) => {
      this.listeners[key]?.clear();
    });
  }
}

export const chatHubService = new ChatHubService();
