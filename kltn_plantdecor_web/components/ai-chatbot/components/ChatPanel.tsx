"use client";

import {
  Alert,
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  InputBase,
  Stack,
  Typography,
} from "@mui/material";
import {
  FilterAltOutlined as FilterIcon,
  SendRounded as SendIcon,
} from "@mui/icons-material";
import { CustomLoading } from "@/components/CustomLoading";
import type { ChatMessageView } from "@/components/ai-chatbot/aiChatbot.ui-types";
import type { AIChatSuggestedPlant } from "@/types/ai-chatbot.types";

interface ChatPanelProps {
  activeTitle: string;
  selectedSessionId: number | null;
  error: string | null;
  isLoadingHistory: boolean;
  isSending: boolean;
  messages: ChatMessageView[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onOpenFilter: () => void;
  onSendFollowUp: (text: string) => void;
  onOpenPlantDetails: (plantId: number) => void;
  formatTime: (value?: string | null) => string;
  userInitial: string;
}

const AssistantExtras = ({
  messageId,
  careTips,
  suggestedPlants,
  followUpQuestions,
  onSendFollowUp,
  onOpenPlantDetails,
}: {
  messageId: string;
  careTips?: string[] | null;
  suggestedPlants?: AIChatSuggestedPlant[] | null;
  followUpQuestions?: string[] | null;
  onSendFollowUp: (text: string) => void;
  onOpenPlantDetails: (plantId: number) => void;
}) => {
  const hasCareTips = Array.isArray(careTips) && careTips.length > 0;
  const hasPlants = Array.isArray(suggestedPlants) && suggestedPlants.length > 0;
  const hasFollowUps =
    Array.isArray(followUpQuestions) && followUpQuestions.length > 0;

  if (!hasCareTips && !hasPlants && !hasFollowUps) return null;

  return (
    <Box sx={{ mt: 1 }}>
      {hasCareTips ? (
        <Box
          sx={{
            px: 1.25,
            py: 1,
            borderRadius: 2,
            bgcolor: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.18)",
          }}
        >
          <Typography
            sx={{ fontSize: 12.5, fontWeight: 900, color: "#166534", mb: 0.5 }}
          >
            Care tips
          </Typography>
          <Stack spacing={0.5}>
            {careTips!.slice(0, 30).map((tip, idx) => (
              <Typography
                key={`${messageId}-tip-${idx}`}
                sx={{ fontSize: 12.5, color: "#14532d" }}
              >
                - {tip}
              </Typography>
            ))}
          </Stack>
        </Box>
      ) : null}

      {hasPlants ? (
        <Box sx={{ mt: 1 }}>
          <Typography
            sx={{ fontSize: 12.5, fontWeight: 900, color: "#0f172a", mb: 0.75 }}
          >
            Suggested plants
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {suggestedPlants!.slice(0, 12).map((plant) => (
              <Chip
                key={`${plant.entityType}-${plant.entityId}`}
                label={plant.name}
                clickable
                onClick={() => onOpenPlantDetails(plant.entityId)}
                disabled={plant.isPurchasable === false}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: 999,
                  bgcolor: "#ffffff",
                  border: "1px solid rgba(15,23,42,0.12)",
                }}
              />
            ))}
          </Stack>
        </Box>
      ) : null}

      {hasFollowUps ? (
        <Box sx={{ mt: 1 }}>
          <Typography
            sx={{ fontSize: 12.5, fontWeight: 900, color: "#0f172a", mb: 0.75 }}
          >
            Follow-up questions
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {followUpQuestions!.slice(0, 12).map((q, idx) => (
              <Chip
                key={`${messageId}-fu-${idx}`}
                label={q}
                clickable
                onClick={() => onSendFollowUp(q)}
                sx={{
                  maxWidth: "100%",
                  fontWeight: 800,
                  bgcolor: "#eef2ff",
                  color: "#1d4ed8",
                  border: "1px solid rgba(37,99,235,0.18)",
                  "& .MuiChip-label": {
                    whiteSpace: "normal",
                    textOverflow: "clip",
                  },
                }}
              />
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};

export function ChatPanel({
  activeTitle,
  selectedSessionId,
  error,
  isLoadingHistory,
  isSending,
  messages,
  draft,
  onDraftChange,
  onSend,
  onOpenFilter,
  onSendFollowUp,
  onOpenPlantDetails,
  formatTime,
  userInitial,
}: ChatPanelProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
        bgcolor: "#f7f9fc",
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
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "#2563eb",
              color: "white",
              fontWeight: 900,
            }}
          >
            AI
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 900, fontSize: 16, color: "#0f172a" }}>
              {activeTitle}
            </Typography>
            <Typography noWrap sx={{ fontSize: 12, color: "#64748b" }}>
              {selectedSessionId ? `Session #${selectedSessionId}` : "No session yet"}
            </Typography>
          </Box>
        </Stack>

        <Chip
          icon={<FilterIcon />}
          label="Advanced filter"
          clickable
          onClick={onOpenFilter}
          sx={{
            fontWeight: 800,
            bgcolor: "#eef2ff",
            color: "#1d4ed8",
            border: "1px solid rgba(37,99,235,0.18)",
            "& .MuiChip-icon": { color: "#1d4ed8" },
          }}
        />
      </Box>

      {error ? (
        <Box sx={{ px: 2, pt: 1.5 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : null}

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
        {isLoadingHistory ? (
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
        ) : null}

        {!isLoadingHistory && messages.length === 0 ? (
          <Box
            sx={{
              minHeight: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                color: "#64748b",
                fontSize: 14,
                textAlign: "center",
                px: 3,
              }}
            >
              Send your first message to start the AI chat.
            </Typography>
          </Box>
        ) : null}

        <Stack spacing={1.1}>
          {messages.map((m) => {
            const isUser = m.role === "user";
            const messageId = String(m.id);

            return (
              <Box
                key={messageId}
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  gap: 1,
                }}
              >
                {!isUser ? (
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: "#bfdbfe",
                      color: "#1d4ed8",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    AI
                  </Avatar>
                ) : null}

                <Box sx={{ maxWidth: { xs: "88%", md: "70%" } }}>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1.05,
                      borderRadius: 3,
                      bgcolor: isUser ? "#dbeafe" : "#ffffff",
                      color: "#0f172a",
                      boxShadow: isUser ? "none" : "0 6px 18px rgba(15,23,42,0.08)",
                      border: isUser ? "none" : "1px solid rgba(15,23,42,0.08)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 14,
                        lineHeight: 1.55,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {m.content}
                    </Typography>
                  </Box>

                  {!isUser ? (
                    <AssistantExtras
                      messageId={messageId}
                      careTips={m.careTips}
                      suggestedPlants={m.suggestedPlants}
                      followUpQuestions={m.followUpQuestions}
                      onSendFollowUp={onSendFollowUp}
                      onOpenPlantDetails={onOpenPlantDetails}
                    />
                  ) : null}

                  <Typography
                    sx={{
                      mt: 0.45,
                      fontSize: 11,
                      color: "#64748b",
                      textAlign: isUser ? "right" : "left",
                    }}
                  >
                    {formatTime(m.createdAt)}
                  </Typography>
                </Box>

                {isUser ? (
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: "#e2e8f0",
                      color: "#334155",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {userInitial}
                  </Avatar>
                ) : null}
              </Box>
            );
          })}

          {isSending ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-start",
                gap: 1,
              }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: "#bfdbfe",
                  color: "#1d4ed8",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                AI
              </Avatar>
              <Box sx={{ maxWidth: { xs: "88%", md: "70%" } }}>
                <Box
                  sx={{
                    px: 1.5,
                    py: 1.05,
                    borderRadius: 3,
                    bgcolor: "#ffffff",
                    color: "#0f172a",
                    boxShadow: "0 6px 18px rgba(15,23,42,0.08)",
                    border: "1px solid rgba(15,23,42,0.08)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CustomLoading size={16} />
                  <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: "#334155" }}>
                    Thinking...
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : null}
        </Stack>
      </Box>

      <Divider sx={{ borderColor: "rgba(15,23,42,0.08)" }} />

      <Box sx={{ px: 1.5, py: 1.2, bgcolor: "#ffffff" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            onClick={onOpenFilter}
            sx={{
              bgcolor: "#f1f5f9",
              border: "1px solid rgba(15,23,42,0.08)",
              "&:hover": { bgcolor: "#e2e8f0" },
            }}
            aria-label="Open advanced filter"
          >
            <FilterIcon />
          </IconButton>

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
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void onSend();
                }
              }}
              placeholder="Type a message..."
              sx={{ color: "#0f172a", width: "100%", fontSize: 14 }}
            />
            <IconButton
              onClick={() => void onSend()}
              disabled={!draft.trim() || isSending}
              sx={{ color: "#2563eb" }}
              aria-label="Send"
            >
              {isSending ? <CustomLoading size={18} /> : <SendIcon />}
            </IconButton>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

