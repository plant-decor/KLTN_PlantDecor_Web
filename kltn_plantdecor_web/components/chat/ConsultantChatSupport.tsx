"use client";

import { useMemo, useRef, useState } from "react";
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
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  InfoOutlined as InfoOutlinedIcon,
  MoreHoriz as MoreHorizIcon,
  PhoneRounded as PhoneRoundedIcon,
  Search as SearchIcon,
  SendRounded as SendRoundedIcon,
  VideocamRounded as VideocamRoundedIcon,
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

type ChatSession = {
  id: string;
  conversationId: number;
  customerName: string;
  summary: string;
  waitingMinutes: number;
  preview: string;
  lastMessage: string;
  status: "waiting" | "active" | "closed";
  unread: number;
  online: boolean;
};

const mapConversationToSession = (
  conv: SupportConversationPayload,
): ChatSession => {
  const customer = conv.participants.find((p) => p.userId !== undefined);
  const customerName =
    customer?.fullName ?? customer?.email ?? `Khách #${conv.id}`;

  const startedAt = new Date(conv.startedAt);
  const waitingMinutes = Math.floor((Date.now() - startedAt.getTime()) / 60000);

  let status: "waiting" | "active" | "closed" = "waiting";
  if (conv.status === SupportConversationStatus.Claimed) status = "active";
  else if (conv.status === SupportConversationStatus.Closed) status = "closed";

  return {
    id: String(conv.id),
    conversationId: conv.id,
    customerName,
    summary: conv.latestMessage?.content ?? "Chưa có tin nhắn",
    waitingMinutes,
    preview: customerName,
    lastMessage: conv.latestMessage?.content ?? "",
    status,
    unread: 0,
    online: conv.status === SupportConversationStatus.Waiting,
  };
};

const FALLBACK_CHAT_LOG = [
  {
    id: 1,
    sender: "consultant" as const,
    text: "Mình đã kiểm tra, bạn có thể đổi lịch chăm cây sang hôm sau được.",
    time: "09:12",
  },
  {
    id: 2,
    sender: "customer" as const,
    text: "Vậy lịch mới là lúc nào ạ?",
    time: "09:13",
  },
  {
    id: 3,
    sender: "consultant" as const,
    text: "Khung còn trống là 14:00 - 16:00. Bạn chọn giúp mình một slot nhé.",
    time: "09:14",
  },
  {
    id: 4,
    sender: "customer" as const,
    text: "Chốt 15:00 nha.",
    time: "09:15",
  },
];

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

const mapFallbackMessages = (): ChatMessageView[] => {
  return FALLBACK_CHAT_LOG.map((message, index) => ({
    id: message.id,
    isMine: message.sender === "customer",
    text: message.text,
    time: message.time,
    isLast: index === FALLBACK_CHAT_LOG.length - 1,
  }));
};

const QUICK_REPLIES = [
  "Mình sẽ kiểm tra ngay",
  "Bạn chờ mình một chút",
  "Mình đã tiếp nhận yêu cầu",
];

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
    () => claimedConversations.map(mapConversationToSession),
    [claimedConversations],
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
    isSending,
    isHubReady,
    isOtherUserTyping,
    error,
    sendMessage,
    handleInputTyping,
  } = useSupportChat({
    conversationId: canUseRealtime ? activeSession.conversationId : null,
    enabled: canUseRealtime,
  });

  const { input, handleChange, submit, setInput, canSend } =
    useSupportChatInput({
      onSend: async (content) => {
        await sendMessage(content);
      },
      onTyping: handleInputTyping,
    });

  const displayedMessages = useMemo(() => {
    if (canUseRealtime) {
      return mapRealtimeMessages(messages, user?.id);
    }

    return mapFallbackMessages();
  }, [canUseRealtime, messages, user?.id]);

  useAutoScrollToBottom(chatScrollRef, {
    dependency: `${displayedMessages.length}:${isOtherUserTyping ? 1 : 0}`,
  });

  const filteredSessions = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) {
      return chatSessions;
    }

    return chatSessions.filter((session) => {
      return (
        session.customerName.toLowerCase().includes(keyword) ||
        session.summary.toLowerCase().includes(keyword) ||
        session.preview.toLowerCase().includes(keyword)
      );
    });
  }, [searchValue, chatSessions]);

  const openSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setMobileView("chat");
  };

  const handleClose = async (conversationId: number) => {
    await closeConversation(conversationId);
  };

  const waitingCount = chatSessions.filter(
    (s) => s.status === "waiting",
  ).length;
  const activeCount = chatSessions.filter((s) => s.status === "active").length;
  const closedCount = chatSessions.filter((s) => s.status === "closed").length;

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 48px)",
        py: 2,
        px: { xs: 0.5, md: 2 },
        bgcolor: "#eef3fb",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          height: { xs: "calc(100vh - 32px)", md: "calc(100vh - 64px)" },
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
                sx={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8 }}
              >
                Đoạn chat
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <IconButton size="small" sx={{ color: "#64748b" }}>
                  <MoreHorizIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ color: "#64748b" }}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </Stack>
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
                placeholder="Tìm kiếm trên Messenger"
                sx={{ color: "#0f172a", fontSize: 14, width: "100%" }}
              />
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              mt={1.5}
              flexWrap="wrap"
              useFlexGap
            >
              <Chip
                label="Tất cả"
                size="small"
                sx={{ bgcolor: "#dbeafe", color: "#1d4ed8" }}
              />
              <Chip
                label="Chưa đọc"
                size="small"
                variant="outlined"
                sx={{ color: "#475569", borderColor: "rgba(15, 23, 42, 0.14)" }}
              />
              <Chip
                label="Nhóm"
                size="small"
                variant="outlined"
                sx={{ color: "#475569", borderColor: "rgba(15, 23, 42, 0.14)" }}
              />
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 1,
                mt: 1.5,
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  border: "1px solid rgba(15,23,42,0.06)",
                }}
              >
                <Typography sx={{ fontSize: 11, color: "#64748b" }}>
                  Chờ
                </Typography>
                <Typography
                  sx={{ fontSize: 18, fontWeight: 800, color: "#ff9900" }}
                >
                  {waitingCount}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  border: "1px solid rgba(15,23,42,0.06)",
                }}
              >
                <Typography sx={{ fontSize: 11, color: "#64748b" }}>
                  Đang mở
                </Typography>
                <Typography
                  sx={{ fontSize: 18, fontWeight: 800, color: "#2563eb" }}
                >
                  {activeCount}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  border: "1px solid rgba(15,23,42,0.06)",
                }}
              >
                <Typography sx={{ fontSize: 11, color: "#64748b" }}>
                  Đã đóng
                </Typography>
                <Typography
                  sx={{ fontSize: 18, fontWeight: 800, color: "#16a34a" }}
                >
                  {closedCount}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ px: 1.2, pb: 1.5, overflowY: "auto", flex: 1 }}>
            {isLoadingConversations ? (
              <Typography
                sx={{ px: 1.5, py: 2, fontSize: 13, color: "#64748b" }}
              >
                Đang tải danh sách...
              </Typography>
            ) : null}
            {!isLoadingConversations && chatSessions.length === 0 ? (
              <Typography
                sx={{ px: 1.5, py: 2, fontSize: 13, color: "#64748b" }}
              >
                Bạn chưa nhận cuộc trò chuyện nào.
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
                          }}
                        >
                          {session.customerName}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "#64748b" }}>
                          {session.waitingMinutes
                            ? `${session.waitingMinutes} phút`
                            : "Hôm qua"}
                        </Typography>
                      </Stack>
                      <Typography
                        noWrap
                        sx={{ fontSize: 12.5, color: "#475569", mt: 0.15 }}
                      >
                        {session.summary}
                      </Typography>
                      <Typography
                        noWrap
                        sx={{ fontSize: 11.5, color: "#94a3b8", mt: 0.15 }}
                      >
                        {session.preview} • {session.lastMessage}
                      </Typography>
                    </Box>

                    {session.status === "active" ? (
                      <Chip
                        label="Đóng"
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
                    ) : session.unread ? (
                      <Box
                        sx={{
                          minWidth: 20,
                          height: 20,
                          borderRadius: 999,
                          px: 0.5,
                          bgcolor: "#2563eb",
                          color: "white",
                          fontSize: 11,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {session.unread}
                      </Box>
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
              Chọn một cuộc trò chuyện để bắt đầu
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
                    <Stack direction="row" alignItems="center" spacing={0.8}>
                      <Box
                        sx={{
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          bgcolor: "#22c55e",
                        }}
                      />
                      <Typography sx={{ fontSize: 12.5, color: "#64748b" }}>
                        Đang hoạt động
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" sx={{ color: "#475569" }}>
                    <PhoneRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" sx={{ color: "#475569" }}>
                    <VideocamRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" sx={{ color: "#475569" }}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
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
                    Đang tải lịch sử chat...
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

              <Box sx={{ px: 2, pb: 1.2 }}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {QUICK_REPLIES.map((item) => (
                    <Chip
                      key={item}
                      label={item}
                      clickable
                      onClick={() => setInput(item)}
                      sx={{
                        bgcolor: "#eff6ff",
                        color: "#1d4ed8",
                        border: "1px solid rgba(59,130,246,0.12)",
                        "&:hover": { bgcolor: "#dbeafe" },
                      }}
                    />
                  ))}
                </Stack>
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
                    Cần đăng nhập để dùng chat realtime.
                  </Typography>
                ) : null}
                {isHubReady ? null : canUseRealtime ? (
                  <Typography
                    sx={{ mt: 0.75, fontSize: 11.5, color: "#64748b" }}
                  >
                    Đang kết nối tới chat realtime...
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
