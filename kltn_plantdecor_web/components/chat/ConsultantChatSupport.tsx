"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Chip,
  Divider,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  SendRounded as SendRoundedIcon,
} from "@mui/icons-material";
import { useAutoScrollToBottom } from "@/hooks/chat/useAutoScrollToBottom";
import { useSupportChat } from "@/hooks/chat/useSupportChat";
import { useSupportChatInput } from "@/hooks/chat/useSupportChatInput";
import { useClaimedSupportConversations } from "@/hooks/chat/useClaimedSupportConversations";
import { useAuthStore } from "@/lib/store/authStore";
import type {
  SupportConversationMessage,
  SupportConversationPayload,
} from "@/types/chat.types";
import { SupportConversationStatus } from "@/types/chat.types";
import { CustomLoading } from "../CustomLoading";

type ChatSession = {
  id: string;
  conversationId: number;
  customerName: string;
  customerEmail: string;
  customerAvatarUrl: string | null;
  summary: string;
  waitingMinutes: number;
  lastMessage: string;
  status: "waiting" | "active" | "closed";
  online: boolean;
};

const mapConversationToSession = (
  conv: SupportConversationPayload,
  currentUserId?: number,
): ChatSession => {
  const customer =
    conv.participants.find((p) =>
      currentUserId ? p.userId !== currentUserId : true,
    ) ?? conv.participants[conv.participants.length - 1];

  const customerName =
    customer?.fullName ?? customer?.email ?? `Khách #${conv.id}`;
  const customerEmail = customer?.email ?? "";
  const customerAvatarUrl = customer?.avatarUrl ?? null;

  const startedAt = new Date(conv.startedAt);
  const waitingMinutes = Math.floor((Date.now() - startedAt.getTime()) / 60000);

  let status: "waiting" | "active" | "closed" = "waiting";
  if (conv.status === SupportConversationStatus.Claimed) status = "active";
  else if (conv.status === SupportConversationStatus.Closed) status = "closed";

  return {
    id: String(conv.id),
    conversationId: conv.id,
    customerName,
    customerEmail,
    customerAvatarUrl,
    summary: conv.latestMessage?.content ?? "Chưa có tin nhắn",
    waitingMinutes,
    lastMessage: conv.latestMessage?.content ?? "",
    status,
    online: conv.status === SupportConversationStatus.Waiting,
  };
};

type ChatMessageView = {
  id: number;
  isMine: boolean;
  text: string;
  time: string;
  isLast: boolean;
};

const formatMessageTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const mapRealtimeMessages = (
  messages: SupportConversationMessage[],
  currentUserId?: number,
): ChatMessageView[] => {
  return messages.map((message, index) => ({
    id: message.id,
    isMine: Boolean(currentUserId && message.senderId === currentUserId),
    text: message.content,
    time: formatMessageTime(message.createdAt),
    isLast: index === messages.length - 1,
  }));
};

export default function ConsultantChatSupport() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [searchValue, setSearchValue] = useState("");
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const user = useAuthStore((state) => state.user);

  const {
    conversations: claimedConversations,
    isLoading: isLoadingConversations,
    isClosing,
    closeConversation,
  } = useClaimedSupportConversations();

  const chatSessions = useMemo(
    () =>
      claimedConversations.map((c) => mapConversationToSession(c, user?.id)),
    [claimedConversations, user?.id],
  );

  const activeSession = useMemo(
    () =>
      chatSessions.find((session) => session.id === activeSessionId) ??
      chatSessions[0] ??
      null,
    [activeSessionId, chatSessions],
  );

  const canUseRealtime = Boolean(user && activeSession?.conversationId);

  const {
    messages,
    isInitialLoading,
    isLoadingOlder,
    hasOlderMessages,
    isSending,
    isHubReady,
    isOtherUserTyping,
    error,
    loadOlderMessages,
    sendMessage,
    handleInputTyping,
  } = useSupportChat({
    conversationId: canUseRealtime ? activeSession.conversationId : null,
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

  useAutoScrollToBottom(chatScrollRef, {
    dependency: `${displayedMessages.length}:${isOtherUserTyping ? 1 : 0}`,
  });

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
      return (
        session.customerName.toLowerCase().includes(keyword) ||
        session.summary.toLowerCase().includes(keyword) ||
        session.lastMessage.toLowerCase().includes(keyword)
      );
    });
  }, [searchValue, chatSessions]);

  const openSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setMobileView("chat");
  };

  const handleClose = (conversationId: number) =>
    closeConversation(conversationId);

  return (
    <Box
      sx={{
        height: "calc(100vh - 120px)",
        py: 2,
        px: { xs: 0.5, md: 2 },

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
          gridTemplateColumns: { xs: "1fr", lg: "360px minmax(0, 1fr)" },
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
            flexDirection: "column",
            bgcolor: "#ffffff",
            color: "#0f172a",
            borderRight: { lg: "1px solid rgba(15, 23, 42, 0.08)" },
          }}
        >
          <Box sx={{ px: 2, pt: 1.5, pb: 1.25 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: -0.8,
                  fontFamily: "Arial, sans-serif",
                }}
              >
                Chat support
              </Typography>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                mt: 1.5,
                px: 1.5,
                py: 0.85,
                borderRadius: 999,
                bgcolor: "#f1f5f9",
                border: "1px solid rgba(15, 23, 42, 0.06)",
              }}
            >
              <SearchIcon sx={{ fontSize: 19, color: "#94a3b8" }} />
              <InputBase
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search here"
                sx={{ color: "#0f172a", fontSize: 14, width: "100%" }}
              />
            </Stack>
          </Box>

          <Box sx={{ px: 1.2, pb: 1.5, overflowY: "auto", flex: 1 }}>
            {isLoadingConversations ? (
              <Typography
                sx={{ px: 1.5, py: 2, fontSize: 13, color: "#64748b" }}
              >
                Loading list...
              </Typography>
            ) : null}
            {!isLoadingConversations && chatSessions.length === 0 ? (
              <Typography
                sx={{ px: 1.5, py: 2, fontSize: 13, color: "#64748b" }}
              >
                You haven&apos;t received any conversation yet.
              </Typography>
            ) : null}
            <Stack spacing={0.6}>
              {filteredSessions.map((session) => {
                const isActive = session.id === activeSession?.id;

                return (
                  <Box
                    key={session.id}
                    onClick={() => openSession(session.id)}
                    role="button"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.25,
                      px: 1.2,
                      py: 1.1,
                      borderRadius: 2,
                      cursor: "pointer",
                      bgcolor: isActive ? "#dbeafe" : "transparent",
                      "&:hover": { bgcolor: isActive ? "#dbeafe" : "#f8fafc" },
                    }}
                  >
                    <Badge
                      overlap="circular"
                      variant="dot"
                      color="success"
                      invisible={!session.online}
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    >
                      <Avatar
                        src={session.customerAvatarUrl ?? undefined}
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: "#bfdbfe",
                          color: "#1d4ed8",
                          fontWeight: 700,
                        }}
                      >
                        {session.customerName.charAt(0)}
                      </Avatar>
                    </Badge>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        gap={1}
                      >
                        <Typography
                          noWrap
                          sx={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: "#0f172a",
                            fontFamily: "Arial, sans-serif",
                          }}
                        >
                          {session.customerName}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "#64748b" }}>
                          {session.waitingMinutes
                            ? `${session.waitingMinutes} minutes`
                            : "Hôm qua"}
                        </Typography>
                      </Stack>
                      <Typography
                        noWrap
                        sx={{ fontSize: 12.5, color: "#475569", mt: 0.15 }}
                      >
                        {session.summary}
                      </Typography>
                    </Box>

                    {session.status === "active" ? (
                      <Chip
                        label="Close"
                        size="small"
                        clickable
                        disabled={isClosing}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleClose(session.conversationId);
                        }}
                        sx={{
                          bgcolor: "#fee2e2",
                          color: "#b91c1c",
                          fontWeight: 700,
                          fontSize: 11,
                          height: 22,
                          "&:hover": { bgcolor: "#fecaca" },
                        }}
                      />
                    ) : null}
                  </Box>
                );
              })}
            </Stack>
          </Box>
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
              <Box
                sx={{
                  px: 2,
                  py: 1.4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
                  bgcolor: "#ffffff",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.25}
                  sx={{ minWidth: 0 }}
                >
                  <IconButton
                    size="small"
                    onClick={() => setMobileView("list")}
                    sx={{
                      display: { xs: "inline-flex", lg: "none" },
                      color: "#475569",
                    }}
                  >
                    <ArrowBackIcon fontSize="small" />
                  </IconButton>
                  <Badge
                    overlap="circular"
                    variant="dot"
                    color="success"
                    invisible={!activeSession.online}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  >
                    <Avatar
                      src={activeSession.customerAvatarUrl ?? undefined}
                      sx={{
                        width: 42,
                        height: 42,
                        bgcolor: "#bfdbfe",
                        color: "#1d4ed8",
                        fontWeight: 700,
                      }}
                    >
                      {activeSession.customerName.charAt(0)}
                    </Avatar>
                  </Badge>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      noWrap
                      sx={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}
                    >
                      {activeSession.customerName}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  px: { xs: 1.2, md: 2.4 },
                  py: 2,
                  background:
                    "radial-gradient(circle at center, rgba(59,130,246,0.08) 0, rgba(255,255,255,0.65) 23%, rgba(255,255,255,0) 60%), #f8fbff",
                }}
                ref={chatScrollRef}
              >
                {isInitialLoading ? (
                  <Box
                    sx={{
                      minHeight: 220,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                      fontSize: 14,
                    }}
                  >
                    Loading chat history...
                  </Box>
                ) : null}
                {isLoadingOlder ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      py: 1,
                    }}
                  >
                    <CustomLoading size={18}  color1="#94a3b8" />
                  </Box>
                ) : hasOlderMessages ? (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 0.5,
                      fontSize: 11,
                      color: "#94a3b8",
                    }}
                  >
                    Scroll up to see older messages
                  </Box>
                ) : null}
                {error ? (
                  <Box
                    sx={{
                      mb: 1.5,
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: "rgba(239,68,68,0.08)",
                      color: "#b91c1c",
                      fontSize: 13,
                    }}
                  >
                    {error}
                  </Box>
                ) : null}
                <Stack spacing={1.1}>
                  {displayedMessages.map((entry) => {
                    const isCustomer = entry.isMine;
                    const isLast = entry.isLast;

                    return (
                      <Box
                        key={entry.id}
                        sx={{
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: isCustomer
                            ? "flex-end"
                            : "flex-start",
                          gap: 1,
                        }}
                      >
                        {!isCustomer && (
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: "#bfdbfe",
                              color: "#1d4ed8",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {activeSession.customerName.charAt(0)}
                          </Avatar>
                        )}

                        <Box sx={{ maxWidth: { xs: "86%", md: "68%" } }}>
                          <Box
                            sx={{
                              px: 1.5,
                              py: 1.05,
                              borderRadius: 3,
                              bgcolor: isCustomer ? "#dbeafe" : "#ffffff",
                              color: "#0f172a",
                              boxShadow: isCustomer
                                ? "none"
                                : "0 6px 18px rgba(15,23,42,0.08)",
                              border: isCustomer
                                ? "none"
                                : "1px solid rgba(15,23,42,0.08)",
                              borderTopLeftRadius: isCustomer ? 3 : 1,
                              borderTopRightRadius: isCustomer ? 1 : 3,
                            }}
                          >
                            <Typography sx={{ fontSize: 14, lineHeight: 1.5 }}>
                              {entry.text}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              mt: 0.45,
                              fontSize: 11,
                              color: "#64748b",
                              textAlign: isCustomer ? "right" : "left",
                            }}
                          >
                            {entry.time}
                            {isCustomer && isLast ? " • Đã gửi" : ""}
                          </Typography>
                        </Box>

                        {isCustomer && (
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: "#e2e8f0",
                              color: "#334155",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            C
                          </Avatar>
                        )}
                      </Box>
                    );
                  })}
                </Stack>

                {isOtherUserTyping ? (
                  <Typography sx={{ mt: 1.5, fontSize: 12, color: "#64748b" }}>
                    Khách đang nhập...
                  </Typography>
                ) : null}
              </Box>

              <Divider sx={{ borderColor: "rgba(15,23,42,0.08)" }} />

              <Box sx={{ px: 1.5, py: 1.2, bgcolor: "#ffffff" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.5,
                      py: 1.05,
                      borderRadius: 999,
                      bgcolor: "#f1f5f9",
                      border: "1px solid rgba(15,23,42,0.08)",
                    }}
                  >
                    <InputBase
                      value={input}
                      onChange={(event) =>
                        void handleChange(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void submit();
                        }
                      }}
                      placeholder="Aa"
                      sx={{ color: "#0f172a", width: "100%", fontSize: 14 }}
                    />
                    <IconButton
                      onClick={() => void submit()}
                      disabled={!canSend || !canUseRealtime || isSending}
                      sx={{ color: "#2563eb" }}
                    >
                      <SendRoundedIcon />
                    </IconButton>
                  </Box>
                </Stack>
                {!canUseRealtime ? (
                  <Typography
                    sx={{ mt: 0.75, fontSize: 11.5, color: "#64748b" }}
                  >
                    Need to login to use realtime chat.
                  </Typography>
                ) : null}
                {isHubReady ? null : canUseRealtime ? (
                  <Typography
                    sx={{ mt: 0.75, fontSize: 11.5, color: "#64748b" }}
                  >
                    Connecting to realtime chat...
                  </Typography>
                ) : null}
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
