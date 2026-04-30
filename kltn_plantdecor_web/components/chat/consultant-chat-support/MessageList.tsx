"use client";

import type { RefObject } from "react";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import { CustomLoading } from "@/components/CustomLoading";
import type { ChatMessageView, ChatSession } from "./types";

type Props = {
  activeSession: ChatSession;
  messages: ChatMessageView[];
  chatScrollRef: RefObject<HTMLDivElement | null>;
  isInitialLoading: boolean;
  isLoadingOlder: boolean;
  hasOlderMessages: boolean;
  error: string | null;
  isOtherUserTyping: boolean;
};

export function MessageList({
  activeSession,
  messages,
  chatScrollRef,
  isInitialLoading,
  isLoadingOlder,
  hasOlderMessages,
  error,
  isOtherUserTyping,
}: Props) {
  return (
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
        <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
          <CustomLoading size={18} color1="#94a3b8" />
        </Box>
      ) : hasOlderMessages ? (
        <Box sx={{ textAlign: "center", py: 0.5, fontSize: 11, color: "#94a3b8" }}>
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
        {messages.map((entry) => {
          const isMine = entry.isMine;
          const isLast = entry.isLast;

          return (
            <Box
              key={entry.id}
              sx={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: isMine ? "flex-end" : "flex-start",
                gap: 1,
              }}
            >
              {!isMine ? (
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
              ) : null}

              <Box sx={{ maxWidth: { xs: "86%", md: "68%" } }}>
                <Box
                  sx={{
                    px: 1.5,
                    py: 1.05,
                    borderRadius: 3,
                    bgcolor: isMine ? "#dbeafe" : "#ffffff",
                    color: "#0f172a",
                    boxShadow: isMine ? "none" : "0 6px 18px rgba(15,23,42,0.08)",
                    border: isMine ? "none" : "1px solid rgba(15,23,42,0.08)",
                    borderTopLeftRadius: isMine ? 3 : 1,
                    borderTopRightRadius: isMine ? 1 : 3,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 14,
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {entry.text}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    mt: 0.45,
                    fontSize: 11,
                    color: "#64748b",
                    textAlign: isMine ? "right" : "left",
                  }}
                >
                  {entry.time}
                  {isMine && isLast ? " • Đã gửi" : ""}
                </Typography>
              </Box>

              {isMine ? (
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
              ) : null}
            </Box>
          );
        })}
      </Stack>

      {isOtherUserTyping ? (
        <Typography sx={{ mt: 1.5, fontSize: 12, color: "#64748b" }}>
          Customer is typing...
        </Typography>
      ) : null}
    </Box>
  );
}

