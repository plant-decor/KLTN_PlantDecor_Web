"use client";

import { SendRounded as SendRoundedIcon } from "@mui/icons-material";
import { Box, IconButton, InputBase, Stack, Typography } from "@mui/material";

export type ChatComposerProps = {
  input: string;
  canSend: boolean;
  canUseRealtime: boolean;
  isSending: boolean;
  isHubReady: boolean;
  showConnectingBanner: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function ChatComposer({
  input,
  canSend,
  canUseRealtime,
  isSending,
  isHubReady,
  showConnectingBanner,
  onChange,
  onSubmit,
}: ChatComposerProps) {
  return (
    <Box sx={{ px: 0.5, py: 1, bgcolor: "#ffffff" }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 5,
            py: 1.2,
            borderRadius: 999,
            bgcolor: "#f1f5f9",
            border: "1px solid rgba(15,23,42,0.08)",
          }}
        >
          <InputBase
            value={input}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSubmit();
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
            onClick={onSubmit}
            disabled={!canSend || !canUseRealtime || isSending}
            sx={{ color: "#2563eb" }}
          >
            <SendRoundedIcon />
          </IconButton>
        </Box>
      </Stack>

      {!canUseRealtime ? (
        <Typography sx={{ mt: 0.75, fontSize: 11.5, color: "#64748b" }}>
          Need to login to use realtime chat.
        </Typography>
      ) : null}
      {showConnectingBanner && !isHubReady && canUseRealtime ? (
        <Typography sx={{ mt: 0.75, fontSize: 11.5, color: "#64748b" }}>
          Connecting to realtime chat...
        </Typography>
      ) : null}
    </Box>
  );
}

