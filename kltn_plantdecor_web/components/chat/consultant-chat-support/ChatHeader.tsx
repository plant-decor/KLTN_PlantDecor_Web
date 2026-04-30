"use client";

import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { Avatar, Badge, Box, IconButton, Stack, Typography } from "@mui/material";
import type { ChatSession } from "./types";

type Props = {
  activeSession: ChatSession;
  onBack?: () => void;
};

export function ChatHeader({ activeSession, onBack }: Props) {
  return (
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
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
        <IconButton
          size="small"
          onClick={onBack}
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
          <Typography noWrap sx={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>
            {activeSession.customerName}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

