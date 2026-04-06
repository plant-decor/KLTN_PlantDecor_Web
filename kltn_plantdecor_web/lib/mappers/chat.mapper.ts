import { MessageReceivedPayload } from "@/lib/signalr/chatHubService";
import { SupportConversationMessage } from "@/types/chat.types";

export const mapRealtimeMessageToConversationMessage = (
  payload: MessageReceivedPayload,
): SupportConversationMessage => ({
  id: payload.messageId,
  chatSessionId: payload.conversationId,
  senderId: payload.senderId,
  senderName: null,
  content: payload.content,
  createdAt: payload.sendAt,
});
