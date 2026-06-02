"use client";

import { Avatar, Badge, Box, Chip, InputBase, Stack, Typography } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { extractServiceBookingUrl } from "@/lib/utils/serviceBookingLink";
import type { ChatSession } from "./types";

function getFriendlyPreview(text: string | null | undefined): string {
  if (!text) return "";
  const booking = extractServiceBookingUrl(text);
  if (booking) {
    return `${booking.packageName ?? "Gói dịch vụ chăm sóc cây"}`;
  }
  return text;
}

type Props = {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isLoading: boolean;
  isClosing: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSelectSession: (sessionId: string) => void;
  onCloseConversation: (conversationId: number) => void;
};

export function ConversationListPanel({
  sessions,
  activeSessionId,
  isLoading,
  isClosing,
  searchValue,
  onSearchChange,
  onSelectSession,
  onCloseConversation,
}: Props) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffff",
        color: "#0f172a",
        borderRight: { lg: "1px solid rgba(15, 23, 42, 0.08)" },
      }}
    >
      <Box sx={{ px: 2, pt: 1.5, pb: 1.25 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
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
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search here"
            sx={{ color: "#0f172a", fontSize: 14, width: "100%" }}
          />
        </Stack>
      </Box>

      <Box sx={{ px: 1.2, pb: 1.5, overflowY: "auto", flex: 1 }}>
        {isLoading ? (
          <Typography sx={{ px: 1.5, py: 2, fontSize: 13, color: "#64748b" }}>
            Loading list...
          </Typography>
        ) : null}
        {!isLoading && sessions.length === 0 ? (
          <Typography sx={{ px: 1.5, py: 2, fontSize: 13, color: "#64748b" }}>
            You haven&apos;t received any conversation yet.
          </Typography>
        ) : null}
        <Stack spacing={0.6}>
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;

            return (
              <Box
                key={session.id}
                onClick={() => onSelectSession(session.id)}
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
                      {session.previewTimeLabel || session.lastMessageTimeLabel}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.15 }}>
                    <Typography
                      noWrap
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: 12.5,
                        color: "#475569",
                        fontWeight: session.unreadCount > 0 ? 800 : 400,
                      }}
                    >
                      {getFriendlyPreview(session.previewText || session.summary)}
                    </Typography>
                    {session.unreadCount > 0 ? (
                      <Box
                        sx={{
                          flexShrink: 0,
                          minWidth: 20,
                          height: 20,
                          px: 0.65,
                          borderRadius: 999,
                          bgcolor: "#dc2626",
                          color: "#ffffff",
                          fontSize: 11,
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1,
                        }}
                      >
                        {session.unreadCount > 99 ? "99+" : session.unreadCount}
                      </Box>
                    ) : null}
                  </Stack>
                </Box>

                {session.status === "active" ? (
                  <Chip
                    label="Close"
                    size="small"
                    clickable
                    disabled={isClosing}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseConversation(session.conversationId);
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
  );
}

