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
  chatSessionId: number;
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

export interface GetConversationDetailsParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface ConversationDetailPayload extends SupportConversationPayload {
  messages: SupportConversationMessage[];
  totalMessages: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
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

export type GetConversationDetailsResponse =
  ResponseModel<ConversationDetailPayload>;

export type GetLatestActiveConversationResponse =
  ResponseModel<SupportConversationPayload | null>;
