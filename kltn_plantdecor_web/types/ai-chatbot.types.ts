import type { ResponseModel } from "@/types/api.types";

export type AIChatMessageRole = "user" | "assistant" | "system";

export type AIChatConversationTurn = {
  role: AIChatMessageRole;
  content: string;
};

export type AIChatbotRequest = {
  sessionId: number;
  message: string;
  roomDescription?: string | null;
  fengShuiElement?: string | null;
  maxBudget?: number | null;
  limit?: number | null;
  preferredRooms?: string[] | null;
  petSafe?: boolean | null;
  childSafe?: boolean | null;
  onlyPurchasable?: boolean | null;
  conversationHistory?: AIChatConversationTurn[] | null;
};

export type AIChatSuggestedPlant = {
  entityType: string;
  entityId: number;
  name: string;
  description?: string | null;
  price?: number | null;
  imageUrl?: string | null;
  isPurchasable?: boolean | null;
  relevanceScore?: number | null;
};

export type AIChatbotPayload = {
  intent?: string | null;
  reply?: string | null;
  roomEnvironmentSummary?: string | null;
  suggestedPlants?: AIChatSuggestedPlant[] | null;
  careTips?: string[] | null;
  followUpQuestions?: string[] | null;
  policySources?: string[] | null;
  disclaimer?: string | null;
  usedFallback?: boolean | null;
};

export type AIChatbotResponse = ResponseModel<AIChatbotPayload>;

export type CreateAIChatSessionRequest = {
  title: string;
};

export type AIChatSessionStatus = "active" | "closed" | string;

export type AIChatSession = {
  sessionId: number;
  title?: string | null;
  status?: AIChatSessionStatus | null;
  startedAt?: string | null;
  endedAt?: string | null;
  updatedAt?: string | null;
};

export type CreateAIChatSessionPayload = {
  sessionId: number;
  title?: string | null;
  startedAt?: string | null;
  status?: number | string | null;
};

export type CreateAIChatSessionResponse = ResponseModel<CreateAIChatSessionPayload>;

export type PaginatedSessionsPayload = {
  items: AIChatSession[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export type GetAIChatSessionsResponse = ResponseModel<PaginatedSessionsPayload>;

export type AIChatHistoryMessage = {
  messageId: number;
  role: "user" | "assistant" | "system" | string;
  content: string;
  intent?: string | null;
  isFallback?: boolean | null;
  isPolicyResponse?: boolean | null;
  createdAt: string;
};

export type AIChatHistoryPayload = {
  sessionId: number;
  title?: string | null;
  status?: AIChatSessionStatus | null;
  startedAt?: string | null;
  endedAt?: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  messages: AIChatHistoryMessage[];
};

export type GetAIChatHistoryResponse = ResponseModel<AIChatHistoryPayload>;

export type AIChatEnumValue = {
  value: number;
  name: string;
};

export type AIChatEnumDefinition = {
  enumName: string;
  values: AIChatEnumValue[];
};

export type GetAIChatEnumsResponse = ResponseModel<AIChatEnumDefinition[]>;

