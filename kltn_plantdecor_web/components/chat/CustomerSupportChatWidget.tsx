"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Fab,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  SendRounded as SendRoundedIcon,
} from "@mui/icons-material";
import Image from "next/image";
import { useAutoScrollToBottom } from "@/hooks/chat/useAutoScrollToBottom";
import { useSupportChat } from "@/hooks/chat/useSupportChat";
import { useSupportChatInput } from "@/hooks/chat/useSupportChatInput";
import { useLatestActiveConversation } from "@/hooks/chat/useCustomerActiveConversations";
import { startSupportConversation } from "@/lib/api/chatService";
import { useAuthStore } from "@/lib/store/authStore";
import { OPEN_SUPPORT_CHAT_EVENT } from "@/lib/constants/chat";
import type { SupportConversationMessage } from "@/types/chat.types";
import { CustomLoading } from "../CustomLoading";
import { SupportRichMessage } from "./customer-chat-widget/SupportRichMessage";

type ChatMessageView = {
  id: number;
  isMine: boolean;
  text: string;
  time: string;
  isLast: boolean;
};

const formatMessageTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const mapRealtimeMessages = (
  messages: SupportConversationMessage[],
  currentUserId?: number,
): ChatMessageView[] =>
  messages.map((message, index) => ({
    id: message.id,
    isMine: Boolean(currentUserId && message.senderId === currentUserId),
    text: message.content,
    time: formatMessageTime(message.createdAt),
    isLast: index === messages.length - 1,
  }));

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const widgetRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const user = useAuthStore((state) => state.user);

  const {
    conversation,
    isLoading: isConversationLoading,
    reload: reloadConversation,
  } = useLatestActiveConversation();

  const conversationId = conversation?.id ?? null;

  const consultantParticipant = useMemo(() => {
    if (!conversation?.participants || !user) return null;
    return conversation.participants.find((p) => p.userId !== user.id) ?? null;
  }, [conversation, user]);

  const consultantName =
    consultantParticipant?.fullName ??
    consultantParticipant?.email?.split("@")[0] ??
    "Consultant";
  const consultantAvatar = consultantParticipant?.avatarUrl ?? undefined;

  const canUseRealtime = Boolean(user && conversationId);

  const {
    messages,
    isInitialLoading,
    isSending,
    hasConnectedOnce,
    showConnectingBanner,
    isOtherUserTyping,
    error: chatError,
    sendMessage,
    handleInputTyping,
  } = useSupportChat({
    conversationId,
    enabled: canUseRealtime,
  });

  const { input, handleChange, submit, reset } = useSupportChatInput({
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
    dependency: `${conversationId}:${isOpen ? 1 : 0}:${displayedMessages.length}:${isOtherUserTyping ? 1 : 0}`,
  });

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !user) return;

    if (!conversationId) {
      setIsStarting(true);
      try {
        await startSupportConversation({ firstMessage: trimmed }, false);

        reset();
        await reloadConversation();
      } catch (err) {
        console.error(err);
      } finally {
        setIsStarting(false);
      }
      return;
    }

    if (!canUseRealtime) return;
    await submit();
  };

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      // MUI Dialog is rendered in a portal (outside widgetRef).
      // Clicking inside the modal content should NOT close the widget.
      if (
        target instanceof Element &&
        (target.closest(".MuiDialog-root") || target.closest(".MuiModal-root"))
      ) {
        return;
      }

      if (!widgetRef.current?.contains(target)) setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
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

  useEffect(() => {
    const handleOpenSupportChat = () => {
      setIsOpen(true);
    };

    window.addEventListener(OPEN_SUPPORT_CHAT_EVENT, handleOpenSupportChat);

    return () => {
      window.removeEventListener(OPEN_SUPPORT_CHAT_EVENT, handleOpenSupportChat);
    };
  }, []);

  return (
    <Box
      ref={widgetRef}
      className="fixed right-4 bottom-4 z-1200 sm:right-6 sm:bottom-6"
    >
      {isOpen ? (
        <Paper
          elevation={10}
          sx={{
            width: { xs: "calc(100vw - 16px)", md: 420 },
            height: { xs: "calc(100vh - 20px)", md: 640 },
            maxWidth: "calc(100vw - 16px)",
            overflow: "hidden",
            borderRadius: { xs: 2, md: 4 },
            border: "1px solid rgba(15, 23, 42, 0.08)",
            display: "flex",
            flexDirection: "column",
            bgcolor: "#f7f9fc",
          }}
        >
          {/* Header */}
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
              <Image
                src="/img/consultantChat.png"
                alt="Plant Decor consultant"
                width={40}
                height={40}
                style={{ borderRadius: 9999, objectFit: "cover" }}
              />

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  noWrap
                  sx={{
                    fontWeight: 800,
                    fontSize: 16,
                    color: "#0f172a",
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  Chat support
                </Typography>
              </Box>
            </Stack>

            <IconButton
              size="small"
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
              sx={{ color: "#475569" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Messages */}
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
            {(isConversationLoading ||
              (Boolean(conversationId) && isInitialLoading)) && (
              <Box
                sx={{
                  minHeight: 220,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CustomLoading size={24} />
              </Box>
            )}

            {chatError && (
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
                {chatError}
              </Box>
            )}

            {!conversationId &&
              !isConversationLoading &&
              !displayedMessages.length && (
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
                  Please enter your first message to start a conversation with
                  Plant Decor.
                </Box>
              )}

            <Stack spacing={1.1}>
              {displayedMessages.map((entry) => (
                <Box
                  key={entry.id}
                  sx={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: entry.isMine ? "flex-end" : "flex-start",
                    gap: 1,
                  }}
                >
                  {!entry.isMine && (
                    <Avatar
                      src={consultantAvatar}
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: "#bfdbfe",
                        color: "#1d4ed8",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {consultantName.charAt(0).toUpperCase()}
                    </Avatar>
                  )}

                  <Box sx={{ maxWidth: { xs: "86%", md: "70%" } }}>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1.05,
                        borderRadius: 3,
                        bgcolor: entry.isMine ? "#dbeafe" : "#ffffff",
                        color: "#0f172a",
                        boxShadow: entry.isMine
                          ? "none"
                          : "0 6px 18px rgba(15,23,42,0.08)",
                        border: entry.isMine
                          ? "none"
                          : "1px solid rgba(15,23,42,0.08)",
                        // borderTopLeftRadius: entry.isMine ? 3 : 1,
                        // borderTopRightRadius: entry.isMine ? 1 : 3,
                      }}
                    >
                      <SupportRichMessage text={entry.text} isMine={entry.isMine} />
                    </Box>

                    <Typography
                      sx={{
                        mt: 0.45,
                        fontSize: 11,
                        color: "#64748b",
                        textAlign: entry.isMine ? "right" : "left",
                      }}
                    >
                      {entry.time}
                      {entry.isMine && entry.isLast ? " • Sent" : ""}
                    </Typography>
                  </Box>

                  {entry.isMine && (
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
                      {user?.email?.charAt(0).toUpperCase() ?? "C"}
                    </Avatar>
                  )}
                </Box>
              ))}

              {isOtherUserTyping && (
                <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                  Consultant is typing...
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Input */}
          <Box sx={{ px: 1.5, py: 1.2, bgcolor: "#ffffff" }}>
            <Stack direction="row" alignItems="center">
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
                  multiline
                  minRows={1}
                  maxRows={4}
                  placeholder="Aa"
                  sx={{
                    color: "#0f172a",
                    width: "100%",
                    fontSize: 14,
                    "& .MuiInputBase-input": { whiteSpace: "pre-wrap" },
                  }}
                />

                <IconButton
                  onClick={() => void handleSend()}
                  disabled={
                    !input.trim() ||
                    !user ||
                    isSending ||
                    isStarting
                  }
                  sx={{ color: "#2563eb" }}
                >
                  {isStarting ? (
                    <CustomLoading size={18} />
                  ) : (
                    <SendRoundedIcon />
                  )}
                </IconButton>
              </Box>
            </Stack>

            {!user && (
              <Typography sx={{ mt: 0.75, fontSize: 11.5, color: "#64748b" }}>
                Please log in to use chat support.
              </Typography>
            )}

            {conversationId &&
              canUseRealtime &&
              !hasConnectedOnce &&
              showConnectingBanner &&
              !chatError && (
              <Typography sx={{ mt: 0.75, fontSize: 11.5, color: "#64748b" }}>
                Connecting to realtime chat...
              </Typography>
            )}
          </Box>
        </Paper>
      ) : (
        <Fab
          onClick={() => setIsOpen(true)}
          aria-label="Open chat support"
          sx={{
            width: 74,
            height: 74,
            borderRadius: 9999,
            bgcolor: "#ffffff",
            color: "white",
            p: 0.5,
            overflow: "hidden",
            border: "2px solid #22c55e",
            boxShadow: "0 10px 30px rgba(34,197,94,0.3)",
            "&:hover": {
              bgcolor: "#ffffff",
              transform: "translateY(-2px)",
              boxShadow: "0 14px 34px rgba(34,197,94,0.36)",
            },
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
        >
          <Image
            src="/img/consultantChat.png"
            alt="Open chat support"
            width={68}
            height={68}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "9999px",
              objectFit: "cover",
            }}
          />
        </Fab>
      )}
    </Box>
  );
}
