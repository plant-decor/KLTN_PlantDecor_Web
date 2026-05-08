"use client";

import { useState, type MouseEvent } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import {
  ChatBubbleOutline as ChatIcon,
  CloseRounded as CloseIcon,
  EditOutlined as EditIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { CustomLoading } from "@/components/CustomLoading";
import type { AIChatSession } from "@/types/ai-chatbot.types";
import { hoverLiftStyle } from "@/lib/styles/buttonStyles";
import chatbotAvatar from "@/public/logo/chatbot.png"

interface SessionsPanelProps {
  sessions: AIChatSession[];
  selectedSessionId: number | null;
  isLoading: boolean;
  isLoadingHistory: boolean;
  isSending: boolean;
  isCreatingSession: boolean;
  mutatingSessionId: number | null;
  onNewChat: () => void;
  onSelectSession: (sessionId: number) => void;
  onRenameSession: (session: AIChatSession) => void;
  onCloseSession: (session: AIChatSession) => void;
  formatTime: (value?: string | null) => string;
}

export function SessionsPanel({
  sessions,
  selectedSessionId,
  isLoading,
  isLoadingHistory,
  isSending,
  isCreatingSession,
  mutatingSessionId,
  onNewChat,
  onSelectSession,
  onRenameSession,
  onCloseSession,
  formatTime,
}: SessionsPanelProps) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [menuSession, setMenuSession] = useState<AIChatSession | null>(null);

  const sortedSessions = [...sessions].sort(
    (a, b) => (b.sessionId ?? 0) - (a.sessionId ?? 0),
  );
  const actionsDisabled =
    isLoading || isLoadingHistory || isSending || isCreatingSession || mutatingSessionId !== null;

  const handleOpenMenu = (event: MouseEvent<HTMLElement>, session: AIChatSession) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuSession(session);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuSession(null);
  };

  const handleRename = () => {
    if (!menuSession) return;
    const session = menuSession;
    handleCloseMenu();
    onRenameSession(session);
  };

  const handleCloseSession = () => {
    if (!menuSession) return;
    const session = menuSession;
    handleCloseMenu();
    onCloseSession(session);
  };

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
            disabled={actionsDisabled}
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
                    src={chatbotAvatar.src}
                  />
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

                <IconButton
                  size="small"
                  onClick={(event) => handleOpenMenu(event, s)}
                  disabled={actionsDisabled}
                  aria-label={`Open actions for ${label}`}
                  sx={{
                    color: "#64748b",
                    "&:hover": { bgcolor: "rgba(15,23,42,0.08)" },
                  }}
                >
                  {mutatingSessionId === s.sessionId ? (
                    <CustomLoading size={16} />
                  ) : (
                    <MoreVertIcon fontSize="small" />
                  )}
                </IconButton>
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleRename} disabled={actionsDisabled}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCloseSession} disabled={actionsDisabled} sx={{ color: "#dc2626" }}>
          <ListItemIcon sx={{ color: "inherit" }}>
            <CloseIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Close</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

