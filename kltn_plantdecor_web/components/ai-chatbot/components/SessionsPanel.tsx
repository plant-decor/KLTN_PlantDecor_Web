"use client";

import { Avatar, Badge, Box, Button, Stack, Typography } from "@mui/material";
import { ChatBubbleOutline as ChatIcon } from "@mui/icons-material";
import { CustomLoading } from "@/components/CustomLoading";
import type { AIChatSession } from "@/types/ai-chatbot.types";
import { hoverLiftStyle } from "@/lib/styles/buttonStyles";

interface SessionsPanelProps {
  sessions: AIChatSession[];
  selectedSessionId: number | null;
  isLoading: boolean;
  isSending: boolean;
  isCreatingSession: boolean;
  onNewChat: () => void;
  onSelectSession: (sessionId: number) => void;
  formatTime: (value?: string | null) => string;
}

export function SessionsPanel({
  sessions,
  selectedSessionId,
  isLoading,
  isSending,
  isCreatingSession,
  onNewChat,
  onSelectSession,
  formatTime,
}: SessionsPanelProps) {
  const sortedSessions = [...sessions].sort(
    (a, b) => (b.sessionId ?? 0) - (a.sessionId ?? 0),
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRight: { lg: "1px solid rgba(15, 23, 42, 0.08)" },
        minHeight: 0,
      }}
    >
      <Box sx={{ px: 2, pt: 1.5, pb: 1.25 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
            <ChatIcon sx={{ color: "#2563eb" }} />
            <Typography sx={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>
              AI Chatbot
            </Typography>
          </Stack>

          <Button
            size="small"
            variant="contained"
            onClick={onNewChat}
            disabled={isCreatingSession || isSending || isLoading}
            sx={{
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 999,
              bgcolor: "var(--primary)",
              "&:hover": { ...hoverLiftStyle },
            }}
          >
            {isCreatingSession ? <CustomLoading size={16} /> : "New chat"}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ px: 1.2, pb: 1.5, overflowY: "auto", flex: 1 }}>
        {isLoading ? (
          <Box sx={{ px: 1.5, py: 2, color: "#64748b" }}>
            <CustomLoading size={20} />
          </Box>
        ) : null}

        {!isLoading && sortedSessions.length === 0 ? (
          <Typography sx={{ px: 1.5, py: 2, fontSize: 13, color: "#64748b" }}>
            You don&apos;t have any AI chat sessions yet. Send your first message to get started.
          </Typography>
        ) : null}

        <Stack spacing={0.6}>
          {sortedSessions.map((s) => {
            const isActive = s.sessionId === selectedSessionId;
            const label = s.title?.trim() || `Session #${s.sessionId}`;

            return (
              <Box
                key={s.sessionId}
                onClick={() => onSelectSession(s.sessionId)}
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
                  invisible={false}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                  <Avatar
                    sx={{
                      width: 42,
                      height: 42,
                      bgcolor: "#bfdbfe",
                      color: "#1d4ed8",
                      fontWeight: 800,
                    }}
                  >
                    AI
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
                      sx={{ fontWeight: 800, fontSize: 14.5, color: "#0f172a" }}
                    >
                      {label}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#64748b" }}>
                      {formatTime(s.updatedAt || s.startedAt)}
                    </Typography>
                  </Stack>
                  <Typography
                    noWrap
                    sx={{ fontSize: 12.5, color: "#475569", mt: 0.15 }}
                  >
                    {s.status ? `Status: ${String(s.status)}` : " "}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}

