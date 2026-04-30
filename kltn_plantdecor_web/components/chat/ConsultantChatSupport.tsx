"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Divider, Paper } from "@mui/material";
import { useAutoScrollToBottom } from "@/hooks/chat/useAutoScrollToBottom";
import { useSupportChat } from "@/hooks/chat/useSupportChat";
import { useSupportChatInput } from "@/hooks/chat/useSupportChatInput";
import { useClaimedSupportConversations } from "@/hooks/chat/useClaimedSupportConversations";
import { useAuthStore } from "@/lib/store/authStore";
import { createAiChatSession, sendAiChatMessage } from "@/lib/api/aiChatbotService";
import { supportMessagesToAiConversationHistory } from "@/lib/mappers/supportChatAiHistory";
import type { AIChatSuggestedPlant } from "@/types/ai-chatbot.types";
import { chatHubService, type MessageReceivedPayload } from "@/lib/signalr/chatHubService";
import { AiCopilotPanel } from "./consultant-chat-support/AiCopilotPanel";
import { ChatComposer } from "./consultant-chat-support/ChatComposer";
import { ChatHeader } from "./consultant-chat-support/ChatHeader";
import { ConversationListPanel } from "./consultant-chat-support/ConversationListPanel";
import { MessageList } from "./consultant-chat-support/MessageList";
import { RecommendationSidebar } from "./consultant-chat-support/recommendation-sidebar/RecommendationSidebar";
import {
  mapConversationToSession,
  mapRealtimeMessages,
  mergeChatSessionOverrides,
  type ChatSession,
} from "./consultant-chat-support/types";

export default function ConsultantChatSupport() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [searchValue, setSearchValue] = useState("");
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const user = useAuthStore((state) => state.user);

  const [aiDraft, setAiDraft] = useState<string>("");
  const [aiCareTips, setAiCareTips] = useState<string[]>([]);
  const [aiSuggestedPlants, setAiSuggestedPlants] = useState<AIChatSuggestedPlant[]>(
    [],
  );
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSessionByConversationId, setAiSessionByConversationId] = useState<
    Record<number, number>
  >({});
  const lastSuggestedCustomerMessageIdRef = useRef<number | null>(null);
  const joinedConversationsRef = useRef<Set<number>>(new Set());

  const [unreadByConversationId, setUnreadByConversationId] = useState<Record<number, number>>(
    {},
  );
  const [livePreviewByConversationId, setLivePreviewByConversationId] = useState<
    Record<number, { text: string; at: string }>
  >({});

  const {
    conversations: claimedConversations,
    isLoading: isLoadingConversations,
    isClosing,
    closeConversation,
  } = useClaimedSupportConversations();

  const chatSessions = useMemo(() => {
    return claimedConversations.map((c) => {
      const base = mapConversationToSession(c, user?.id);
      const unreadCount = unreadByConversationId[c.id] ?? 0;
      const live = livePreviewByConversationId[c.id];

      const mergedBase: ChatSession = mergeChatSessionOverrides(base, {
        unreadCount,
      });

      if (!live) return mergedBase;

      return mergeChatSessionOverrides(mergedBase, {
        previewText: live.text,
        previewAt: live.at,
      });
    });
  }, [claimedConversations, livePreviewByConversationId, unreadByConversationId, user?.id]);

  const activeSession = useMemo(() => {
    if (!activeSessionId) return null;
    return chatSessions.find((session) => session.id === activeSessionId) ?? null;
  }, [activeSessionId, chatSessions]);

  const canUseRealtime = Boolean(user && activeSession);

  useEffect(() => {
    if (!user) return;

    const setupHubForConsultantInbox = async () => {
      try {
        await chatHubService.connect();

        const ids = claimedConversations.map((c) => c.id);
        for (const conversationId of ids) {
          await chatHubService.joinConversation(conversationId);
          joinedConversationsRef.current.add(conversationId);
        }

        const idSet = new Set(ids);
        for (const previouslyJoined of [...joinedConversationsRef.current]) {
          if (idSet.has(previouslyJoined)) continue;
          joinedConversationsRef.current.delete(previouslyJoined);
          try {
            await chatHubService.leaveConversation(previouslyJoined);
          } catch {
            // ignore
          }
        }
      } catch (error) {
        console.error("Consultant inbox hub setup failed:", error);
      }
    };

    void setupHubForConsultantInbox();
  }, [claimedConversations, user]);

  useEffect(() => {
    if (!user?.id) return;

    const off = chatHubService.on("messageReceived", (payload: MessageReceivedPayload) => {
      const consultantId = user.id;

      setLivePreviewByConversationId((prev) => ({
        ...prev,
        [payload.conversationId]: {
          text: payload.content,
          at: payload.sendAt,
        },
      }));

      const isCustomerMessage = payload.senderId !== consultantId;
      const activeConversationId = activeSession?.conversationId ?? null;
      const isActiveConversation =
        activeConversationId !== null && activeConversationId === payload.conversationId;

      if (!isCustomerMessage) return;
      if (isActiveConversation) return;

      setUnreadByConversationId((prev) => {
        const current = prev[payload.conversationId] ?? 0;
        return { ...prev, [payload.conversationId]: current + 1 };
      });
    });

    return () => off();
  }, [activeSession?.conversationId, user?.id]);

  const {
    messages,
    isInitialLoading,
    isLoadingOlder,
    hasOlderMessages,
    isSending,
    isHubReady,
    showConnectingBanner,
    isOtherUserTyping,
    error,
    loadOlderMessages,
    sendMessage,
    handleInputTyping,
  } = useSupportChat({
    conversationId: canUseRealtime ? activeSession!.conversationId : null,
    enabled: canUseRealtime,
  });

  const { input, handleChange, submit, canSend } = useSupportChatInput({
    onSend: async (content) => {
      await sendMessage(content);
    },
    onTyping: handleInputTyping,
  });

  const displayedMessages = useMemo(
    () => mapRealtimeMessages(messages, user?.id),
    [messages, user?.id],
  );

  const ensureAiSessionId = useCallback(
    async (conversationId: number) => {
      const existing = aiSessionByConversationId[conversationId];
      if (existing) return existing;

      const created = await createAiChatSession(
        { title: `Support #${conversationId}` },
        false,
      );
      const payload = created.payload ?? created.data;
      const newId = payload?.sessionId ?? null;
      if (!newId) {
        throw new Error("Create AI session failed");
      }

      setAiSessionByConversationId((prev) => ({ ...prev, [conversationId]: newId }));
      return newId;
    },
    [aiSessionByConversationId],
  );

  const generateAiDraft = useCallback(
    async (reason: "customerMessage" | "manual") => {
      const conversationId = activeSession?.conversationId ?? null;
      const currentUserId = user?.id ?? null;
      if (!conversationId || !currentUserId) return;

      const lastMessage = messages[messages.length - 1] ?? null;
      const lastIsCustomer = Boolean(lastMessage && lastMessage.senderId !== currentUserId);

      if (reason === "customerMessage" && (!lastMessage || !lastIsCustomer)) {
        return;
      }

      if (
        reason === "customerMessage" &&
        lastMessage &&
        lastSuggestedCustomerMessageIdRef.current === lastMessage.id
      ) {
        return;
      }

      try {
        setAiError(null);
        setIsAiLoading(true);

        const sessionId = await ensureAiSessionId(conversationId);
        const history = supportMessagesToAiConversationHistory(messages, {
          currentUserId,
          maxTurns: 20,
        });

        const customerText = lastMessage?.content?.trim() || "";
        const prompt =
          customerText ||
          "Suggest a short, polite reply for the customer based on the conversation history.";

        const res = await sendAiChatMessage(
          {
            sessionId,
            message: prompt,
            conversationHistory: history,
          },
          false,
        );

        const payload = res.payload ?? res.data;
        const reply = payload?.reply?.trim() || "";
        setAiDraft(reply);
        setAiCareTips(Array.isArray(payload?.careTips) ? payload.careTips : []);
        setAiSuggestedPlants(
          Array.isArray(payload?.suggestedPlants) ? payload.suggestedPlants : [],
        );

        if (lastMessage && lastIsCustomer) {
          lastSuggestedCustomerMessageIdRef.current = lastMessage.id;
        }
      } catch (err) {
        console.error(err);
        setAiError("Unable to generate AI suggestion. Please try again.");
      } finally {
        setIsAiLoading(false);
      }
    },
    [activeSession?.conversationId, user?.id, messages, ensureAiSessionId],
  );

  useAutoScrollToBottom(chatScrollRef, {
    dependency: `${displayedMessages.length}:${isOtherUserTyping ? 1 : 0}`,
  });

  useEffect(() => {
    // Auto-generate when customer sends a new message in the active conversation.
    void generateAiDraft("customerMessage");
  }, [generateAiDraft, displayedMessages.length]);

  // Scroll up to load older messages
  const handleScroll = useCallback(() => {
    const el = chatScrollRef.current;
    if (!el || !hasOlderMessages || isLoadingOlder) return;
    if (el.scrollTop < 80) {
      void loadOlderMessages();
    }
  }, [hasOlderMessages, isLoadingOlder, loadOlderMessages]);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const filteredSessions = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) {
      return chatSessions;
    }

    return chatSessions.filter((session) => {
      const preview = (session.previewText || session.summary).toLowerCase();
      return (
        session.customerName.toLowerCase().includes(keyword) ||
        session.summary.toLowerCase().includes(keyword) ||
        preview.includes(keyword) ||
        session.lastMessage.toLowerCase().includes(keyword)
      );
    });
  }, [searchValue, chatSessions]);

  const openSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setMobileView("chat");

    const conversationId = Number(sessionId);
    if (!Number.isFinite(conversationId)) return;

    setUnreadByConversationId((prev) => ({
      ...prev,
      [conversationId]: 0,
    }));
  };

  const handleClose = (conversationId: number) => closeConversation(conversationId);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          minHeight: 0,
          borderRadius: { xs: 2, md: 4 },
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "320px minmax(0, 1fr) 340px",
            xl: "360px minmax(0, 1fr) 380px",
          },
          border: "1px solid rgba(15, 23, 42, 0.08)",
          bgcolor: "#ffffff",
        }}
      >
        <Box
          sx={{
            display: {
              xs: mobileView === "list" ? "flex" : "none",
              lg: "flex",
            },
          }}
        >
          <ConversationListPanel
            sessions={filteredSessions}
            activeSessionId={activeSession?.id ?? null}
            isLoading={isLoadingConversations}
            isClosing={isClosing}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onSelectSession={openSession}
            onCloseConversation={(conversationId) => void handleClose(conversationId)}
          />
        </Box>

        <Box
          sx={{
            display: {
              xs: mobileView === "chat" ? "flex" : "none",
              lg: "flex",
            },
            flexDirection: "column",
            minHeight: 0,
            overflow: "hidden",
            bgcolor: "#f7f9fc",
            color: "#0f172a",
            position: "relative",
          }}
        >
          {!activeSession ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                fontSize: 14,
              }}
            >
              Select a conversation to start
            </Box>
          ) : (
            <>
              <ChatHeader
                activeSession={activeSession}
                onBack={() => setMobileView("list")}
              />

              <AiCopilotPanel
                aiDraft={aiDraft}
                careTips={aiCareTips}
                suggestedPlants={aiSuggestedPlants}
                isAiLoading={isAiLoading}
                aiError={aiError}
                disabled={!canUseRealtime}
                isSending={isSending}
                onRefresh={() => void generateAiDraft("manual")}
                onInsertDraft={(value) => void handleChange(value)}
                onSendMessage={(value) => void sendMessage(value)}
              />

              <MessageList
                activeSession={activeSession}
                messages={displayedMessages}
                chatScrollRef={chatScrollRef}
                isInitialLoading={isInitialLoading}
                isLoadingOlder={isLoadingOlder}
                hasOlderMessages={hasOlderMessages}
                error={error}
                isOtherUserTyping={isOtherUserTyping}
              />

              <Divider sx={{ borderColor: "rgba(15,23,42,0.08)" }} />

              <ChatComposer
                input={input}
                canSend={canSend}
                canUseRealtime={canUseRealtime}
                isSending={isSending}
                isHubReady={isHubReady}
                showConnectingBanner={showConnectingBanner}
                onChange={(value) => void handleChange(value)}
                onSubmit={() => void submit()}
              />
            </>
          )}
        </Box>

        <Box
          sx={{
            display: { xs: "none", lg: "flex" },
            flexDirection: "column",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <RecommendationSidebar
            activeSession={activeSession}
            isSending={isSending}
            disabled={!canUseRealtime}
            onSendBookingLink={(content) => sendMessage(content)}
          />
        </Box>
      </Paper>
    </Box>
  );
}
