import type { ResponseModel } from "@/types/api.types";

export enum SupportConversationStatus {
  Waiting = 0,
  Claimed = 1,
  Closed = 2,
}

export interface StartSupportConversationRequest {
  firstMessage: string;
}

export interface SupportConversationParticipant {
  userId: number;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  joinedAt: string;
}

export interface SupportConversationMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string | null;
  content: string;
  createdAt: string;
}

export interface SupportConversationPayload {
  id: number;
  status: SupportConversationStatus;
  startedAt: string;
  endedAt: string | null;
  participants: SupportConversationParticipant[];
  latestMessage: SupportConversationMessage | null;
}

export interface GetConversationMessagesParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface ConversationMessagesPayload {
  conversationId: number;
  messages: SupportConversationMessage[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export type StartSupportConversationResponse =
  ResponseModel<SupportConversationPayload>;

export type GetConversationsResponse = ResponseModel<
  SupportConversationPayload[]
>;

export type GetWaitingSupportConversationsResponse = ResponseModel<
  SupportConversationPayload[]
>;

export type GetClaimedSupportConversationsResponse = ResponseModel<
  SupportConversationPayload[]
>;

export type ClaimSupportConversationResponse = ResponseModel<null>;

export type CloseSupportConversationResponse = ResponseModel<null>;

export type GetConversationMessagesResponse =
  ResponseModel<ConversationMessagesPayload>;
