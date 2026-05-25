"use client";

import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SendIcon from "@mui/icons-material/Send";
import type { AiRecommendedPackage } from "@/types/care-service.types";
import { hoverLiftStyle } from "@/lib/styles/buttonStyles";
import { formatCurrency } from "@/lib/utils/formatUtil";

type Props = {
  recommendation: AiRecommendedPackage;
  isSending: boolean;
  isViewing: boolean;
  disabled: boolean;
  onSendBookingLink: (recommendation: AiRecommendedPackage) => void;
  onViewDetail: (recommendation: AiRecommendedPackage) => void;
};

export function RecommendationCard({
  recommendation,
  isSending,
  isViewing,
  disabled,
  onSendBookingLink,
  onViewDetail,
}: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.25,
        borderRadius: 2,
        border: "1px solid rgba(15,23,42,0.08)",
        bgcolor: "#ffffff",
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 13,
              color: "#0f172a",
              lineHeight: 1.35,
            }}
          >
            {recommendation.packageName}
          </Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#15803d", mt: 0.25 }}>
            {formatCurrency(recommendation.unitPrice, "vi-VN")}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={`Score ${recommendation.score}`}
          sx={{
            fontSize: 11,
            height: 22,
            bgcolor: "rgba(34,197,94,0.12)",
            color: "#15803d",
            fontWeight: 700,
            flexShrink: 0,
          }}
        />
      </Stack>

      {recommendation.reason ? (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 11.5,
            color: "#475569",
            lineHeight: 1.4,
            fontStyle: "italic",
          }}
        >
          {recommendation.reason}
        </Typography>
      ) : null}

      <Stack direction="row" spacing={1.5} sx={{ mt: 0.75 }}>
        <Typography sx={{ fontSize: 11, color: "#64748b" }}>
          Coverage:{" "}
          <Box component="span" sx={{ fontWeight: 700, color: "#0f172a" }}>
            {recommendation.coveragePercentage}%
          </Box>
        </Typography>
        <Typography sx={{ fontSize: 11, color: "#64748b" }}>
          Ecosystem:{" "}
          <Box component="span" sx={{ fontWeight: 700, color: "#0f172a" }}>
            {recommendation.ecosystemMatchPercentage}%
          </Box>
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button
          size="small"
          fullWidth
          variant="outlined"
          startIcon={<VisibilityIcon />}
          disabled={isViewing}
          onClick={() => onViewDetail(recommendation)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            ...hoverLiftStyle,
          }}
        >
          {isViewing ? "Loading..." : "Detail"}
        </Button>
        <Button
          size="small"
          fullWidth
          variant="contained"
          startIcon={<SendIcon />}
          disabled={disabled || isSending}
          onClick={() => onSendBookingLink(recommendation)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            backgroundColor: "var(--primary)",
            ...hoverLiftStyle,
          }}
        >
          {isSending ? "Sending..." : "Send"}
        </Button>
      </Stack>
    </Paper>
  );
}
