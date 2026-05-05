"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type {
  AIChatbotRequest,
  AIChatbotResponse,
  CreateAIChatSessionRequest,
  CreateAIChatSessionResponse,
  GetAIChatEnumsResponse,
  GetAIChatHistoryResponse,
  GetAIChatSessionsResponse,
} from "@/types/ai-chatbot.types";

const silentConfig = {
  showToast: false,
  showErrorToast: false,
} as const;

export type PaginatedQuery = {
  pageNumber?: number;
  pageSize?: number;
  skip?: number;
  take?: number;
};

export const createAiChatSession = async (
  data: CreateAIChatSessionRequest,
  loading = true,
): Promise<CreateAIChatSessionResponse> => {
  return apiClient.post(
    "/ai-search/chatbot/sessions",
    data,
    loading,
    silentConfig,
  );
};

export const getAiChatSessions = async (
  params: PaginatedQuery = { pageNumber: 1, pageSize: 20 },
  loading = true,
): Promise<GetAIChatSessionsResponse> => {
  return apiClient.get(
    "/ai-search/chatbot/sessions",
    params,
    loading,
    silentConfig,
  );
};

export const getAiChatHistory = async (
  sessionId: number,
  params: PaginatedQuery = { pageNumber: 1, pageSize: 50 },
  loading = true,
): Promise<GetAIChatHistoryResponse> => {
  return apiClient.get(
    `/ai-search/chatbot/sessions/${sessionId}/history`,
    params,
    loading,
    silentConfig,
  );
};

export const sendAiChatMessage = async (
  data: AIChatbotRequest,
  loading = true,
): Promise<AIChatbotResponse> => {
  return apiClient.post("/ai-search/chatbot", data, loading, silentConfig);
};

export const getAiChatEnums = async (
  loading = true,
): Promise<GetAIChatEnumsResponse> => {
  return apiClient.get("/system/enums/AI-chat", undefined, loading, silentConfig);
};

