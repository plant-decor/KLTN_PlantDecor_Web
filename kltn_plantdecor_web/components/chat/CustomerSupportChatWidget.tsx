"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Chip,
  Divider,
  Fab,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ChatBubbleOutline as ChatIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  SendRounded as SendRoundedIcon,
} from "@mui/icons-material";

interface ChatMessage {
  id: string;
  conversationId: string;
  sender: "me" | "support";
  text: string;
  sentAt: string;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  lastTime: string;
  isOnline?: boolean;
  unread?: number;
  avatar: string;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    name: "Plant Decor Support",
    lastMessage: "Bên mình đã nhận yêu cầu hỗ trợ chăm cây của bạn.",
    lastTime: "1 giờ",
    isOnline: true,
    unread: 2,
    avatar: "/logo/logo.png",
  },
  {
    id: "c2",
    name: "Tư vấn chậu cây",
    lastMessage: "Bạn muốn phong cách tối giản hay tropical?",
    lastTime: "3 giờ",
    avatar: "/logo/logo.png",
  },
  {
    id: "c3",
    name: "Theo dõi đơn hàng",
    lastMessage: "Đơn của bạn đang giao và sẽ đến trong hôm nay.",
    lastTime: "Hôm qua",
    avatar: "/logo/logo.png",
  },
];

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    conversationId: "c1",
    sender: "support",
    text: "Xin chào bạn, mình là consultant từ Plant Decor. Mình có thể hỗ trợ gì cho bạn hôm nay?",
    sentAt: "09:14",
  },
  {
    id: "m2",
    conversationId: "c1",
    sender: "me",
    text: "Mình muốn hỏi lịch chăm cây sau khi nhận cây mới.",
    sentAt: "09:15",
  },
  {
    id: "m3",
    conversationId: "c1",
    sender: "support",
    text: "Bạn vào Hồ sơ cây của tôi > tab Lịch chăm sóc. Mình gửi bạn hướng dẫn chi tiết nhé.",
    sentAt: "09:16",
  },
  {
    id: "m4",
    conversationId: "c2",
    sender: "support",
    text: "Bạn muốn chậu theo tông sáng hay tông đất?",
    sentAt: "Hôm qua",
  },
  {
    id: "m5",
    conversationId: "c3",
    sender: "support",
    text: "Mình đã gửi mã vận đơn cho bạn qua email.",
    sentAt: "Hôm qua",
  },
];

const QUICK_REPLIES = ["Lịch chăm cây", "Đơn hàng", "Dịch vụ chăm sóc"];

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState("c1");
  const [searchValue, setSearchValue] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const widgetRef = useRef<HTMLDivElement | null>(null);

  const conversations = useMemo(() => CONVERSATIONS, []);
  const activeConversation =
    conversations.find((item) => item.id === selectedConversationId) ||
    conversations[0];

  const messages = useMemo(
    () =>
      MOCK_MESSAGES.filter(
        (item) => item.conversationId === activeConversation.id,
      ),
    [activeConversation.id],
  );

  const filteredConversations = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) {
      return conversations;
    }

    return conversations.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.lastMessage.toLowerCase().includes(keyword),
    );
  }, [conversations, searchValue]);

  const openConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setMobileView("chat");
  };

  const handleSend = () => {
    if (!draftMessage.trim()) {
      return;
    }

    setDraftMessage("");
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }

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
                  sx={{
                    color: "#475569",
                    borderColor: "rgba(15, 23, 42, 0.14)",
                  }}
                />
                <Chip
                  label="Nhóm"
                  size="small"
                  variant="outlined"
                  sx={{
                    color: "#475569",
                    borderColor: "rgba(15, 23, 42, 0.14)",
                  }}
                />
              </Stack>
            </Box>

            <Box sx={{ overflowY: "auto", px: 1.2, pb: 1.5, flex: 1 }}>
              <Stack spacing={0.6}>
                {filteredConversations.map((item) => {
                  const isActive = item.id === activeConversation.id;

                  return (
                    <Box
                      key={item.id}
                      role="button"
                      onClick={() => openConversation(item.id)}
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
                          sx={{ fontSize: 12.5, color: "#475569", mt: 0.15 }}
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
                  invisible={!activeConversation.isOnline}
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
                    {activeConversation.name.charAt(0)}
                  </Avatar>
                </Badge>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    noWrap
                    sx={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}
                  >
                    {activeConversation.name}
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
              sx={{
                flex: 1,
                overflowY: "auto",
                px: { xs: 1.2, md: 2.4 },
                py: 2,
                background:
                  "radial-gradient(circle at center, rgba(59,130,246,0.08) 0, rgba(255,255,255,0.65) 23%, rgba(255,255,255,0) 60%), #f8fbff",
              }}
            >
              <Stack spacing={1.1}>
                {messages.map((entry, index) => {
                  const isMe = entry.sender === "me";
                  const isLast = index === messages.length - 1;

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
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: "#bfdbfe",
                            color: "#1d4ed8",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {activeConversation.name.charAt(0)}
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
                          {entry.sentAt}
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
              </Stack>
            </Box>

            <Box sx={{ px: 2, pb: 1.2 }}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {QUICK_REPLIES.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    clickable
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
                    value={draftMessage}
                    onChange={(event) => setDraftMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Aa"
                    sx={{ color: "#0f172a", width: "100%", fontSize: 14 }}
                  />
                  <IconButton
                    onClick={handleSend}
                    disabled={!draftMessage.trim()}
                    sx={{ color: "#2563eb" }}
                  >
                    <SendRoundedIcon />
                  </IconButton>
                </Box>
              </Stack>
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
