"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Fab,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  ChatBubbleOutline as ChatIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  SendRounded as SendRoundedIcon,
} from "@mui/icons-material";
import { useAutoScrollToBottom } from "@/hooks/chat/useAutoScrollToBottom";
import { useSupportChat } from "@/hooks/chat/useSupportChat";
import { useSupportChatInput } from "@/hooks/chat/useSupportChatInput";
import { useCustomerSupportConversations } from "@/hooks/chat/useCustomerSupportConversations";
import { useAuthStore } from "@/lib/store/authStore";
import type { SupportConversationMessage } from "@/types/chat.types";
import {
  mapConversationToCustomerConversationItem,
  type CustomerConversationItem,
} from "@/lib/mappers/customerSupportConversation.mapper";

type ChatMessageView = {
  id: number;
  isMine: boolean;
  text: string;
  time: string;
  isLast: boolean;
};

const QUICK_REPLIES = ["Lịch chăm cây", "Đơn hàng", "Dịch vụ chăm sóc"];

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

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [searchValue, setSearchValue] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const widgetRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const user = useAuthStore((state) => state.user);

  const {
    conversations,
    isLoading: isConversationsLoading,
    isStarting,
    error: conversationsError,
    startNewConversation,
  } = useCustomerSupportConversations({
    enabled: Boolean(user),
  });

  const uiConversations = useMemo<CustomerConversationItem[]>(
    () => conversations.map(mapConversationToCustomerConversationItem),
    [conversations],
  );

  useEffect(() => {
    if (!uiConversations.length) {
      if (selectedConversationId !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedConversationId(null);
      }
      return;
    }

    const exists = uiConversations.some(
      (item) => item.conversationId === selectedConversationId,
    );

    if (selectedConversationId === null || !exists) {
      setSelectedConversationId(uiConversations[0].conversationId);
    }
  }, [uiConversations, selectedConversationId]);

  const activeConversation =
    uiConversations.find(
      (item) => item.conversationId === selectedConversationId,
    ) ?? null;

  const canUseRealtime = Boolean(user && selectedConversationId);

  const {
    messages,
    isInitialLoading,
    isSending,
    isHubReady,
    isOtherUserTyping,
    error: chatError,
    sendMessage,
    handleInputTyping,
  } = useSupportChat({
    conversationId: selectedConversationId,
    enabled: canUseRealtime,
  });

  const { input, handleChange, submit, setInput, canSend, reset } =
    useSupportChatInput({
      onSend: async (content) => {
        await sendMessage(content);
      },
      onTyping: handleInputTyping,
    });

  const displayedMessages = useMemo(() => {
    return mapRealtimeMessages(messages, user?.id);
  }, [messages, user?.id]);

  useAutoScrollToBottom(chatScrollRef, {
    dependency: `${displayedMessages.length}:${isOtherUserTyping ? 1 : 0}`,
  });

  const filteredConversations = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) {
      return uiConversations;
    }

    return uiConversations.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.lastMessage.toLowerCase().includes(keyword),
    );
  }, [uiConversations, searchValue]);

  const openConversation = (conversationId: number) => {
    setSelectedConversationId(conversationId);
    setMobileView("chat");
  };

  const handleCreateNewConversation = () => {
    setSelectedConversationId(null);
    setMobileView("chat");
    reset();
  };

  const handleSend = async () => {
    const trimmed = input.trim();

    if (!trimmed || !user) return;

    // Chưa có conversation nào được chọn => tạo mới bằng first message
    if (!selectedConversationId) {
      try {
        const created = await startNewConversation(trimmed);
        setSelectedConversationId(created.id);
        setMobileView("chat");
        reset();
      } catch (err) {
        console.error(err);
      }
      return;
    }

    if (!canUseRealtime || !canSend) {
      return;
    }

    await submit();
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (!widgetRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const combinedError = chatError ?? conversationsError;

  return (
    <Box
      ref={widgetRef}
      className="fixed right-4 bottom-4 z-1200 sm:right-6 sm:bottom-6"
    >
      {isOpen ? (
        <Paper
          elevation={10}
          sx={{
            width: { xs: "calc(100vw - 16px)", md: 940 },
            height: { xs: "calc(100vh - 20px)", md: 640 },
            maxWidth: "calc(100vw - 16px)",
            overflow: "hidden",
            borderRadius: { xs: 2, md: 4 },
            border: "1px solid rgba(15, 23, 42, 0.08)",
            display: "flex",
            bgcolor: "#ffffff",
          }}
        >
          {/* Sidebar */}
          <Box
            sx={{
              width: { xs: "100%", md: 360 },
              display: {
                xs: mobileView === "list" ? "flex" : "none",
                md: "flex",
              },
              flexDirection: "column",
              bgcolor: "#ffffff",
              borderRight: { md: "1px solid rgba(15, 23, 42, 0.08)" },
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
                    color: "#0f172a",
                  }}
                >
                  Đoạn chat
                </Typography>

                <IconButton
                  size="small"
                  onClick={handleCreateNewConversation}
                  sx={{ color: "#2563eb" }}
                  aria-label="Tạo cuộc trò chuyện mới"
                >
                  <AddIcon />
                </IconButton>
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
                  placeholder="Tìm cuộc trò chuyện"
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
              </Stack>
            </Box>

            <Box sx={{ overflowY: "auto", px: 1.2, pb: 1.5, flex: 1 }}>
              {!user ? (
                <Box
                  sx={{
                    px: 2,
                    py: 3,
                    color: "#64748b",
                    fontSize: 14,
                  }}
                >
                  Vui lòng đăng nhập để xem các cuộc trò chuyện của bạn.
                </Box>
              ) : isConversationsLoading ? (
                <Box
                  sx={{
                    minHeight: 180,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress size={24} />
                </Box>
              ) : filteredConversations.length === 0 ? (
                <Box
                  sx={{
                    px: 2,
                    py: 3,
                    color: "#64748b",
                    fontSize: 14,
                  }}
                >
                  Bạn chưa có cuộc trò chuyện nào. Hãy nhập tin nhắn để bắt đầu.
                </Box>
              ) : (
                <Stack spacing={0.6}>
                  {filteredConversations.map((item) => {
                    const isActive =
                      item.conversationId === selectedConversationId;

                    return (
                      <Box
                        key={item.conversationId}
                        role="button"
                        onClick={() => openConversation(item.conversationId)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.25,
                          px: 1.2,
                          py: 1.1,
                          borderRadius: 2,
                          cursor: "pointer",
                          bgcolor: isActive ? "#dbeafe" : "transparent",
                          "&:hover": {
                            bgcolor: isActive ? "#dbeafe" : "#f8fafc",
                          },
                        }}
                      >
                        <Badge
                          overlap="circular"
                          variant="dot"
                          color="success"
                          invisible={!item.isOnline}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                        >
                          <Avatar
                            src={item.avatar}
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor: "#bfdbfe",
                              color: "#1d4ed8",
                              fontWeight: 700,
                            }}
                          >
                            {item.name.charAt(0)}
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
                              {item.name}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: "#64748b" }}>
                              {item.lastTime}
                            </Typography>
                          </Stack>
                          <Typography
                            noWrap
                            sx={{
                              fontSize: 12.5,
                              color: "#475569",
                              mt: 0.15,
                            }}
                          >
                            {item.lastMessage}
                          </Typography>
                        </Box>

                        {!!item.unread && (
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
                            {item.unread}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Box>

          {/* Chat panel */}
          <Box
            sx={{
              flex: 1,
              display: {
                xs: mobileView === "chat" ? "flex" : "none",
                md: "flex",
              },
              flexDirection: "column",
              bgcolor: "#f7f9fc",
              color: "#0f172a",
              position: "relative",
            }}
          >
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
                    display: { xs: "inline-flex", md: "none" },
                    color: "#475569",
                  }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>

                <Badge
                  overlap="circular"
                  variant="dot"
                  color="success"
                  invisible={!activeConversation?.isOnline}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                  <Avatar
                    src={activeConversation?.avatar}
                    sx={{
                      width: 42,
                      height: 42,
                      bgcolor: "#bfdbfe",
                      color: "#1d4ed8",
                      fontWeight: 700,
                    }}
                  >
                    {(activeConversation?.name ?? "P").charAt(0)}
                  </Avatar>
                </Badge>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    noWrap
                    sx={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}
                  >
                    {activeConversation?.name ?? "Cuộc trò chuyện mới"}
                  </Typography>
                </Box>
              </Stack>

              <IconButton
                size="small"
                aria-label="Đóng chat"
                onClick={() => setIsOpen(false)}
                sx={{ color: "#475569" }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box
              ref={chatScrollRef}
              sx={{
                flex: 1,
                overflowY: "auto",
                px: { xs: 1.2, md: 2.4 },
                py: 2,
                background:
                  "radial-gradient(circle at center, rgba(59,130,246,0.08) 0, rgba(255,255,255,0.65) 23%, rgba(255,255,255,0) 60%), #f8fbff",
              }}
            >
              {selectedConversationId && isInitialLoading ? (
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

              {combinedError ? (
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
                  {combinedError}
                </Box>
              ) : null}

              {!selectedConversationId && !displayedMessages.length ? (
                <Box
                  sx={{
                    minHeight: 220,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                    fontSize: 14,
                    textAlign: "center",
                    px: 3,
                  }}
                >
                  Hãy nhập tin nhắn đầu tiên để bắt đầu cuộc trò chuyện mới với
                  Plant Decor.
                </Box>
              ) : null}

              <Stack spacing={1.1}>
                {displayedMessages.map((entry) => {
                  const isMe = entry.isMine;
                  const isLast = entry.isLast;

                  return (
                    <Box
                      key={entry.id}
                      sx={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: isMe ? "flex-end" : "flex-start",
                        gap: 1,
                      }}
                    >
                      {!isMe && (
                        <Avatar
                          src={activeConversation?.avatar}
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: "#bfdbfe",
                            color: "#1d4ed8",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {(activeConversation?.name ?? "P").charAt(0)}
                        </Avatar>
                      )}

                      <Box sx={{ maxWidth: { xs: "86%", md: "70%" } }}>
                        <Box
                          sx={{
                            px: 1.5,
                            py: 1.05,
                            borderRadius: 3,
                            bgcolor: isMe ? "#dbeafe" : "#ffffff",
                            color: "#0f172a",
                            boxShadow: isMe
                              ? "none"
                              : "0 6px 18px rgba(15,23,42,0.08)",
                            border: isMe
                              ? "none"
                              : "1px solid rgba(15,23,42,0.08)",
                            borderTopLeftRadius: isMe ? 3 : 1,
                            borderTopRightRadius: isMe ? 1 : 3,
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
                            textAlign: isMe ? "right" : "left",
                          }}
                        >
                          {entry.time}
                          {isMe && isLast ? " • Đã gửi" : ""}
                        </Typography>
                      </Box>

                      {isMe && (
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

                {isOtherUserTyping ? (
                  <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                    Tư vấn viên đang nhập...
                  </Typography>
                ) : null}
              </Stack>
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
                    onChange={(event) => void handleChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder="Aa"
                    sx={{ color: "#0f172a", width: "100%", fontSize: 14 }}
                  />

                  <IconButton
                    onClick={() => void handleSend()}
                    disabled={!input.trim() || !user || isSending || isStarting}
                    sx={{ color: "#2563eb" }}
                  >
                    {isStarting ? (
                      <CircularProgress size={18} />
                    ) : (
                      <SendRoundedIcon />
                    )}
                  </IconButton>
                </Box>
              </Stack>

              {!user ? (
                <Typography sx={{ mt: 0.75, fontSize: 11.5, color: "#64748b" }}>
                  Cần đăng nhập để dùng chat hỗ trợ.
                </Typography>
              ) : null}

              {selectedConversationId && !isHubReady ? (
                <Typography sx={{ mt: 0.75, fontSize: 11.5, color: "#64748b" }}>
                  Đang kết nối tới chat realtime...
                </Typography>
              ) : null}
            </Box>
          </Box>
        </Paper>
      ) : (
        <Fab
          onClick={() => {
            setIsOpen(true);
            setMobileView("list");
          }}
          aria-label="Mở chat hỗ trợ"
          sx={{
            width: 66,
            height: 66,
            borderRadius: 9999,
            bgcolor: "#0f67e6",
            color: "white",
            "&:hover": { bgcolor: "#0a54bd" },
          }}
        >
          <ChatIcon sx={{ fontSize: 34 }} />
        </Fab>
      )}
    </Box>
  );
}
