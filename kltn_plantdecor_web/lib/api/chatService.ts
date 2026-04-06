"use client";

import * as apiClient from "@/lib/api/apiService.client";
import type {
  ClaimSupportConversationResponse,
  CloseSupportConversationResponse,
  GetClaimedSupportConversationsResponse,
  GetConversationsResponse,
  GetConversationMessagesParams,
  GetConversationMessagesResponse,
  GetLatestActiveConversationResponse,
  GetWaitingSupportConversationsResponse,
  StartSupportConversationRequest,
  StartSupportConversationResponse,
} from "@/types/chat.types";

/**
 * POST /api/support-conversations/start
 * Starts a new support conversation with the first message from customer.
 */
export const startSupportConversation = async (
  data: StartSupportConversationRequest,
  loading = true,
): Promise<StartSupportConversationResponse> => {
  return apiClient.post("/support-conversations/start", data, loading);
};

/**
 * GET /api/support-conversations
 * Get all conversations of current user.
 */
export const getConversations = async (
  loading = true,
): Promise<GetConversationsResponse> => {
  return apiClient.get("/support-conversations", undefined, loading);
};

/**
 * GET /api/support-conversations/waiting
 * Get waiting conversations for consultant to receive.
 */
export const getWaitingSupportConversations = async (
  loading = true,
): Promise<GetWaitingSupportConversationsResponse> => {
  return apiClient.get("/support-conversations/waiting", undefined, loading);
};

/**
 * GET /api/support-conversations/my-claimed
 * Get conversations already claimed by current consultant.
 */
export const getMyClaimedSupportConversations = async (
  loading = true,
): Promise<GetClaimedSupportConversationsResponse> => {
  return apiClient.get("/support-conversations/my-claimed", undefined, loading);
};

/**
 * POST /api/support-conversations/{conversationId}/claim
 * Consultant claims a waiting conversation.
 */
export const claimSupportConversation = async (
  conversationId: number,
  loading = true,
): Promise<ClaimSupportConversationResponse> => {
  return apiClient.post(
    `/support-conversations/${conversationId}/claim`,
    undefined,
    loading,
  );
};

/**
 * POST /api/support-conversations/{conversationId}/close
 * Close a conversation after consultant finishes support.
 */
export const closeSupportConversation = async (
  conversationId: number,
  loading = true,
): Promise<CloseSupportConversationResponse> => {
  return apiClient.post(
    `/support-conversations/${conversationId}/close`,
    undefined,
    loading,
  );
};

/**
 * GET /api/support-conversations/latest-active
 * Get the latest active conversation of current customer.
 */
export const getLatestActiveConversation = async (
  loading = true,
): Promise<GetLatestActiveConversationResponse> => {
  return apiClient.get(
    "/support-conversations/latest-active",
    undefined,
    loading,
  );
};

/**
 * GET /api/support-conversations/{conversationId}/messages?pageNumber=1&pageSize=50
 * Get messages history of a conversation with pagination.
 */
export const getConversationMessages = async (
  conversationId: number,
  params: GetConversationMessagesParams = { pageNumber: 1, pageSize: 50 },
  loading = true,
): Promise<GetConversationMessagesResponse> => {
  return apiClient.get(
    `/support-conversations/${conversationId}/messages`,
    params,
    loading,
  );
};
