import * as signalR from "@microsoft/signalr";
import { getClientAccessToken } from "@/lib/axios/tokenStorage";

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

  private readonly hubUrl = `${(process.env.NEXT_PUBLIC_SIGNALR_BASE_URL ?? "https://localhost:7180/api").replace("/api", "")}/hubs/chat`;

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
    const token = getClientAccessToken();
    if (!token) {
      throw new Error("Không tìm thấy access token để kết nối chat hub");
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => getClientAccessToken() || "",
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
      this.emit("reconnected", connectionId);

      // rejoin tất cả room đã join trước đó
      const roomIds = [...this.joinedConversationIds];
      for (const conversationId of roomIds) {
        try {
          await connection.invoke("JoinConversation", conversationId);
        } catch (error) {
          console.error(
            `Rejoin conversation ${conversationId} thất bại sau reconnect`,
            error,
          );
        }
      }
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

    this.startPromise = this.connection
      .start()
      .then(() => {
        return this.connection!;
      })
      .finally(() => {
        this.startPromise = null;
      });

    return this.startPromise;
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
      throw new Error("Chat hub chưa được khởi tạo");
    }

    return this.connection;
  }

  async joinConversation(conversationId: number) {
    const connection = await this.ensureConnected();

    await connection.invoke("JoinConversation", conversationId);
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

    await this.connection.invoke("LeaveConversation", conversationId);
    this.joinedConversationIds.delete(conversationId);
  }

  async sendMessage(conversationId: number, content: string) {
    const trimmed = content.trim();
    if (!trimmed) {
      throw new Error("Nội dung tin nhắn không được để trống");
    }

    const connection = await this.ensureConnected();
    await connection.invoke("SendMessage", conversationId, trimmed);
  }

  async sendTyping(conversationId: number) {
    if (
      !this.connection ||
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      return;
    }

    await this.connection.invoke("UserTyping", conversationId);
  }

  async sendStopTyping(conversationId: number) {
    if (
      !this.connection ||
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      return;
    }

    await this.connection.invoke("UserStoppedTyping", conversationId);
  }

  clearAllListeners() {
    (Object.keys(this.listeners) as EventKey[]).forEach((key) => {
      this.listeners[key]?.clear();
    });
  }
}

export const chatHubService = new ChatHubService();
