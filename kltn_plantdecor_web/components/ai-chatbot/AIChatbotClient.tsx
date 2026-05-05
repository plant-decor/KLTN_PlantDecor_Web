"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
} from "@mui/material";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "@/i18n/navigation";
import {
  createAiChatSession,
  getAiChatEnums,
  getAiChatHistory,
  getAiChatSessions,
  sendAiChatMessage,
} from "@/lib/api/aiChatbotService";
import type { AIChatEnumDefinition, AIChatSession } from "@/types/ai-chatbot.types";
import {
  DEFAULT_ADVANCED_FILTERS,
  type AdvancedFilters,
  type ChatMessageView,
} from "@/components/ai-chatbot/aiChatbot.ui-types";
import {
  formatTime,
  mapHistoryMessages,
  mergeHistoryWithLocal,
  toConversationHistory,
  toSafeNumber,
} from "@/components/ai-chatbot/aiChatbot.utils";
import { SessionsPanel } from "@/components/ai-chatbot/components/SessionsPanel";
import { ChatPanel } from "@/components/ai-chatbot/components/ChatPanel";
import { AdvancedFilterDrawer } from "@/components/ai-chatbot/components/AdvancedFilterDrawer";
import { hoverLiftStyle } from "@/lib/styles/buttonStyles";
import { CustomLoading } from "../CustomLoading";

export default function AIChatbotClient() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const [sessions, setSessions] = useState<AIChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const [messages, setMessages] = useState<ChatMessageView[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");

  const [enumDefs, setEnumDefs] = useState<AIChatEnumDefinition[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilters>(DEFAULT_ADVANCED_FILTERS);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const roomTypeOptions = useMemo(() => {
    const def = enumDefs.find((d) => d.enumName === "RoomType");
    return def?.values?.map((v) => v.name) ?? [];
  }, [enumDefs]);

  const fengShuiOptions = useMemo(() => {
    const def = enumDefs.find((d) => d.enumName === "FengShuiElement");
    return def?.values?.map((v) => v.name) ?? [];
  }, [enumDefs]);

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.sessionId === selectedSessionId) ?? null;
  }, [sessions, selectedSessionId]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setError(null);
      setIsLoadingSessions(true);
      try {
        const [enumsRes, sessionsRes] = await Promise.all([
          getAiChatEnums(false).catch(() => null),
          getAiChatSessions({ pageNumber: 1, pageSize: 20 }, false),
        ]);

        if (!mounted) return;

        const enumPayload = enumsRes?.payload ?? enumsRes?.data ?? null;
        if (Array.isArray(enumPayload)) setEnumDefs(enumPayload);

        const sessionsPayload = sessionsRes.payload ?? sessionsRes.data;
        setSessions(sessionsPayload?.items ?? []);

        const first = sessionsPayload?.items?.[0]?.sessionId ?? null;
        setSelectedSessionId(first);
      } catch {
        if (mounted) setError("Unable to load AI chat sessions.");
      } finally {
        if (mounted) setIsLoadingSessions(false);
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!selectedSessionId) {
        setMessages([]);
        return;
      }

      setError(null);
      setIsLoadingHistory(true);
      try {
        const res = await getAiChatHistory(selectedSessionId, { pageNumber: 1, pageSize: 50 }, false);
        if (!mounted) return;
        const payload = res.payload ?? res.data;
        const history = mapHistoryMessages(payload?.messages);
        setMessages((prev) => {
          // When a new session is created, the history endpoint may return empty
          // before the first message is persisted. Keep optimistic messages visible.
          if (!history.length && prev.length) {
            return prev;
          }

          return mergeHistoryWithLocal(history, prev);
        });
      } catch {
        if (mounted) setError("Unable to load conversation history for this session.");
      } finally {
        if (mounted) setIsLoadingHistory(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [selectedSessionId]);

  const createSessionIfNeeded = async (firstMessage: string) => {
    if (selectedSessionId) return selectedSessionId;

    const title = firstMessage.trim().slice(0, 40) || "New chat";
    const created = await createAiChatSession({ title }, false);
    const payload = created.payload ?? created.data;
    const newSessionId = payload?.sessionId ?? null;
    if (!newSessionId) {
      throw new Error("Create session failed");
    }

    const sessionsRes = await getAiChatSessions({ pageNumber: 1, pageSize: 20 }, false);
    const sessionsPayload = sessionsRes.payload ?? sessionsRes.data;
    setSessions(sessionsPayload?.items ?? []);

    setSelectedSessionId(newSessionId);
    return newSessionId;
  };

  const sendText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setError(null);
    setIsSending(true);

    const optimisticId = `local-${Date.now()}`;
    const nextUserMessage: ChatMessageView = {
      id: optimisticId,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const previousMessages = messages;
    setMessages((prev) => [...prev, nextUserMessage]);
    setDraft((prev) => (prev === text ? "" : prev));

    try {
      const sessionId = await createSessionIfNeeded(trimmed);

      const convHistory = toConversationHistory([...previousMessages, nextUserMessage]);
      const res = await sendAiChatMessage(
        {
          sessionId,
          message: trimmed,
          roomDescription: filters.roomDescription?.trim() || null,
          fengShuiElement: filters.fengShuiElement || null,
          maxBudget: toSafeNumber(filters.maxBudget),
          limit: toSafeNumber(filters.limit),
          preferredRooms: filters.preferredRooms?.length ? filters.preferredRooms : null,
          petSafe: filters.petSafe,
          childSafe: filters.childSafe,
          onlyPurchasable: filters.onlyPurchasable,
          conversationHistory: convHistory,
        },
        false,
      );

      const payload = res.payload ?? res.data;
      const replyText = payload?.reply?.trim() || "";
      const careTips = Array.isArray(payload?.careTips) ? payload?.careTips : null;
      const followUpQuestions = Array.isArray(payload?.followUpQuestions)
        ? payload?.followUpQuestions
        : null;
      const suggestedPlants = Array.isArray(payload?.suggestedPlants) ? payload?.suggestedPlants : null;

      if (replyText || careTips?.length || followUpQuestions?.length || suggestedPlants?.length) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: replyText || " ",
            createdAt: new Date().toISOString(),
            careTips,
            followUpQuestions,
            suggestedPlants,
          },
        ]);
      }
    } catch {
      setMessages(previousMessages);
      setDraft(text);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = async () => {
    await sendText(draft);
  };

  const openPlantDetails = (plantId: number) => {
    router.push(`/products/${plantId}`);
  };

  const handleOpenNewChat = () => {
    setError(null);
    setNewChatTitle("");
    setIsNewChatDialogOpen(true);
  };

  const handleCreateNewChat = async () => {
    const title = newChatTitle.trim();
    if (!title) return;

    setError(null);
    setIsCreatingSession(true);
    try {
      const created = await createAiChatSession({ title }, false);
      const payload = created.payload ?? created.data;
      const newSessionId = payload?.sessionId ?? null;
      if (!newSessionId) {
        throw new Error("Create session failed");
      }

      // Refresh sessions list and switch to the new session.
      const sessionsRes = await getAiChatSessions({ pageNumber: 1, pageSize: 20 }, false);
      const sessionsPayload = sessionsRes.payload ?? sessionsRes.data;
      setSessions(sessionsPayload?.items ?? []);
      setSelectedSessionId(newSessionId);
      setMessages([]);
      setDraft("");
      setIsNewChatDialogOpen(false);
    } catch {
      setError("Unable to create a new chat session. Please try again.");
    } finally {
      setIsCreatingSession(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ px: { xs: 1, md: 3 }, py: 3 }}>
        <Alert severity="info">Please log in to use AI Chat Support.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 0.75, md: 2 }, py: 2 }}>
      <Paper
        elevation={0}
        sx={{
          height: { xs: "calc(100vh - 140px)", md: "calc(100vh - 160px)" },
          minHeight: 520,
          overflow: "hidden",
          borderRadius: { xs: 2, md: 4 },
          border: "1px solid rgba(15, 23, 42, 0.08)",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "360px minmax(0, 1fr)" },
          bgcolor: "#ffffff",
        }}
      >
        <SessionsPanel
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          isLoading={isLoadingSessions}
          isSending={isSending}
          isCreatingSession={isCreatingSession}
          onNewChat={handleOpenNewChat}
          onSelectSession={(sessionId) => setSelectedSessionId(sessionId)}
          formatTime={formatTime}
        />

        <ChatPanel
          activeTitle={activeSession?.title?.trim() || "AI Chat Support"}
          selectedSessionId={selectedSessionId}
          error={error}
          isLoadingHistory={isLoadingHistory}
          isSending={isSending}
          messages={messages}
          draft={draft}
          onDraftChange={setDraft}
          onSend={() => void handleSend()}
          onOpenFilter={() => setIsFilterOpen(true)}
          onSendFollowUp={(text) => void sendText(text)}
          onOpenPlantDetails={openPlantDetails}
          formatTime={formatTime}
          userInitial={user.email?.charAt(0).toUpperCase() ?? "U"}
        />
      </Paper>

      <AdvancedFilterDrawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        fengShuiOptions={fengShuiOptions}
        roomTypeOptions={roomTypeOptions}
        onReset={() => setFilters(DEFAULT_ADVANCED_FILTERS)}
      />

      <Dialog
        open={isNewChatDialogOpen}
        onClose={() => (isCreatingSession ? null : setIsNewChatDialogOpen(false))}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Create new chat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Chat name"
            value={newChatTitle}
            onChange={(e) => setNewChatTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleCreateNewChat();
              }
            }}
            inputProps={{ maxLength: 80 }}
            helperText="Maximum 80 characters"
            disabled={isCreatingSession}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setIsNewChatDialogOpen(false)}
            disabled={isCreatingSession}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleCreateNewChat()}
            disabled={isCreatingSession || !newChatTitle.trim()}
            sx={{ textTransform: "none", fontWeight: 800, backgroundColor: 'var(--primary)', ...hoverLiftStyle }}

          >
            {isCreatingSession ? <CustomLoading size={18} /> : "Create new"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

