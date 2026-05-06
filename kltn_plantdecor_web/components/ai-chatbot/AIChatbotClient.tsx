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
  Typography,
} from "@mui/material";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "@/i18n/navigation";
import {
  closeAiChatSession,
  createAiChatSession,
  getAiChatEnums,
  getAiChatHistory,
  getAiChatSessions,
  renameAiChatSession,
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
  const [mutatingSessionId, setMutatingSessionId] = useState<number | null>(null);

  const [messages, setMessages] = useState<ChatMessageView[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [renameTarget, setRenameTarget] = useState<AIChatSession | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [closeTarget, setCloseTarget] = useState<AIChatSession | null>(null);

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

  const renameTargetTitle = renameTarget
    ? renameTarget.title?.trim() || `Session #${renameTarget.sessionId}`
    : "";
  const trimmedRenameTitle = renameTitle.trim();
  const isRenamingSession = renameTarget
    ? mutatingSessionId === renameTarget.sessionId
    : false;
  const isClosingSession = closeTarget
    ? mutatingSessionId === closeTarget.sessionId
    : false;
  const canRenameSession =
    Boolean(trimmedRenameTitle) &&
    Boolean(renameTarget) &&
    trimmedRenameTitle !== renameTargetTitle &&
    !isRenamingSession;

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

  const handleOpenRenameSession = (session: AIChatSession) => {
    setError(null);
    setRenameTarget(session);
    setRenameTitle(session.title?.trim() || `Session #${session.sessionId}`);
  };

  const handleCloseRenameDialog = () => {
    if (isRenamingSession) return;
    setRenameTarget(null);
    setRenameTitle("");
  };

  const handleRenameSession = async () => {
    if (!renameTarget) return;

    const title = renameTitle.trim();
    const currentTitle = renameTarget.title?.trim() || `Session #${renameTarget.sessionId}`;
    if (!title || title === currentTitle) return;

    setError(null);
    setMutatingSessionId(renameTarget.sessionId);
    try {
      const res = await renameAiChatSession(renameTarget.sessionId, { title }, false);
      const payload = res.payload ?? res.data;
      const nextTitle = payload?.title?.trim() || title;
      const nextStatus = payload?.status == null ? undefined : String(payload.status);

      setSessions((prev) =>
        prev.map((session) =>
          session.sessionId === renameTarget.sessionId
            ? {
                ...session,
                title: nextTitle,
                startedAt: payload?.startedAt ?? session.startedAt,
                status: nextStatus ?? session.status,
              }
            : session,
        ),
      );
      setRenameTarget(null);
      setRenameTitle("");
    } catch {
      setError("Unable to rename this chat session. Please try again.");
    } finally {
      setMutatingSessionId(null);
    }
  };

  const handleOpenCloseSession = (session: AIChatSession) => {
    setError(null);
    setCloseTarget(session);
  };

  const handleCloseCloseDialog = () => {
    if (isClosingSession) return;
    setCloseTarget(null);
  };

  const handleConfirmCloseSession = async () => {
    if (!closeTarget) return;

    const targetId = closeTarget.sessionId;
    setError(null);
    setMutatingSessionId(targetId);
    try {
      await closeAiChatSession(targetId, false);

      const sortedSessions = [...sessions].sort(
        (a, b) => (b.sessionId ?? 0) - (a.sessionId ?? 0),
      );
      const closedIndex = sortedSessions.findIndex((session) => session.sessionId === targetId);
      const remainingSessions = sortedSessions.filter((session) => session.sessionId !== targetId);

      setSessions((prev) => prev.filter((session) => session.sessionId !== targetId));

      if (selectedSessionId === targetId) {
        const nextSessionId =
          remainingSessions[closedIndex]?.sessionId ??
          remainingSessions[closedIndex - 1]?.sessionId ??
          null;
        setSelectedSessionId(nextSessionId);
        setMessages([]);
        setDraft("");
      }

      setCloseTarget(null);
    } catch {
      setError("Unable to close this chat session. Please try again.");
    } finally {
      setMutatingSessionId(null);
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
          isLoadingHistory={isLoadingHistory}
          isSending={isSending}
          isCreatingSession={isCreatingSession}
          mutatingSessionId={mutatingSessionId}
          onNewChat={handleOpenNewChat}
          onSelectSession={(sessionId) => setSelectedSessionId(sessionId)}
          onRenameSession={handleOpenRenameSession}
          onCloseSession={handleOpenCloseSession}
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

      <Dialog
        open={Boolean(renameTarget)}
        onClose={handleCloseRenameDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Rename chat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Chat name"
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleRenameSession();
              }
            }}
            inputProps={{ maxLength: 80 }}
            helperText="Maximum 80 characters"
            disabled={isRenamingSession}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseRenameDialog}
            disabled={isRenamingSession}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleRenameSession()}
            disabled={!canRenameSession}
            sx={{ textTransform: "none", fontWeight: 800, backgroundColor: 'var(--primary)', ...hoverLiftStyle }}
          >
            {isRenamingSession ? <CustomLoading size={18} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(closeTarget)}
        onClose={handleCloseCloseDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Close chat session?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, color: "#475569" }}>
            This will close &quot;{closeTarget?.title?.trim() || (closeTarget ? `Session #${closeTarget.sessionId}` : "this chat")}&quot;
            and remove it from your chat list.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseCloseDialog}
            disabled={isClosingSession}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void handleConfirmCloseSession()}
            disabled={isClosingSession || !closeTarget}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            {isClosingSession ? <CustomLoading size={18} /> : "Close session"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

