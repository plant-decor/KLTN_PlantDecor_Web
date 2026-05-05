"use client";

import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import type { AIChatSuggestedPlant } from "@/types/ai-chatbot.types";
import { hoverLiftStyle } from "@/lib/styles/buttonStyles";

type Props = {
  aiDraft: string;
  careTips: string[];
  suggestedPlants: AIChatSuggestedPlant[];
  isAiLoading: boolean;
  aiError: string | null;
  disabled: boolean;
  isSending: boolean;
  onRefresh: () => void;
  onInsertDraft: (value: string) => void;
  onSendMessage: (value: string) => void;
};

const formatCareTipsMessage = (tips: string[]) => {
  const cleaned = tips.map((t) => t.trim()).filter(Boolean);
  if (!cleaned.length) return "";
  return cleaned
    .map((t) => {
      if (t.startsWith("•")) return t;
      if (t.startsWith("-")) return `• ${t.replace(/^-+\s*/, "")}`;
      return `• ${t}`;
    })
    .join("\n");
};

const formatSuggestedPlantsMessage = (plants: AIChatSuggestedPlant[]) => {
  const cleaned = plants.filter((p) => Boolean(p?.name?.trim()));
  if (!cleaned.length) return "";
  const lines = cleaned.slice(0, 5).map((p, index) => {
    const price =
      typeof p.price === "number" && Number.isFinite(p.price)
        ? ` • Price: ${p.price.toLocaleString("en-US")} VND`
        : "";
    return `${index + 1}. ${p.name}${price}`;
  });
  return ["Here are a few suggested options:", ...lines].join("\n");
};

export function AiCopilotPanel({
  aiDraft,
  careTips,
  suggestedPlants,
  isAiLoading,
  aiError,
  disabled,
  isSending,
  onRefresh,
  onInsertDraft,
  onSendMessage,
}: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        mx: { xs: 1.2, md: 2.4 },
        mt: 1.4,
        mb: 0.8,
        p: 1.25,
        borderRadius: 2.5,
        border: "1px solid rgba(15,23,42,0.08)",
        bgcolor: "#ffffff",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography sx={{ fontWeight: 800, fontSize: 13 }}>AI reply suggestions</Typography>
        {isAiLoading ? (
          <Typography sx={{ fontSize: 12, color: "#64748b" }}>
            Generating suggestion...
          </Typography>
        ) : null}
        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          variant="outlined"
          onClick={onRefresh}
          disabled={disabled || isAiLoading}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          Refresh
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={() => onInsertDraft(aiDraft)}
          disabled={!aiDraft.trim() || isAiLoading}
          sx={{ textTransform: "none", fontWeight: 700, backgroundColor:'var(--primary)', ...hoverLiftStyle }}
        >
          Insert
        </Button>
      </Stack>

      {aiError ? (
        <Typography sx={{ mt: 0.75, fontSize: 12, color: "#b91c1c" }}>{aiError}</Typography>
      ) : null}

      <Typography
        sx={{
          mt: 0.8,
          fontSize: 13,
          color: "#0f172a",
          whiteSpace: "pre-wrap",
          lineHeight: 1.5,
        }}
      >
        {aiDraft ||
          "No suggestion yet. When the customer sends a message, AI will generate one automatically."}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button
          size="small"
          variant="outlined"
          disabled={!careTips.length || isAiLoading || isSending}
          onClick={() => {
            const content = formatCareTipsMessage(careTips);
            if (!content) return;
            onSendMessage(content);
          }}
          sx={{ textTransform: "none", fontWeight: 700, backgroundColor:'var(--primary)', ...hoverLiftStyle }}
        >
          Send care tips
        </Button>
        <Button
          size="small"
          variant="outlined"
          disabled={!suggestedPlants.length || isAiLoading || isSending}
          onClick={() => {
            const content = formatSuggestedPlantsMessage(suggestedPlants);
            if (!content) return;
            onSendMessage(content);
          }}
          sx={{ textTransform: "none", fontWeight: 700, backgroundColor:'var(--primary)', ...hoverLiftStyle }}
        >
          Send suggested plants
        </Button>
      </Stack>

      {careTips.length ? (
        <Typography
          sx={{
            mt: 0.9,
            fontSize: 12,
            color: "#64748b",
            whiteSpace: "pre-wrap",
            lineHeight: 1.45,
          }}
        >
          {careTips.slice(0, 3).map((t) => `• ${t}`).join("\n")}
          {careTips.length > 3 ? "\n• ..." : ""}
        </Typography>
      ) : null}
    </Paper>
  );
}

