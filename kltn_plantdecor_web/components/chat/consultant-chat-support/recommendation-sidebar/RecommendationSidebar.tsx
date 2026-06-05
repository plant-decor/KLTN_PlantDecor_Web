"use client";

import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { toast } from "react-toastify";
import { CustomLoading } from "@/components/CustomLoading";
import {
  getAiRecommendedPackagesByConversation,
  getCareServicePackageDetail,
} from "@/lib/api/careServiceService";
import { getConversationSummary } from "@/lib/api/chatService";
import { buildServiceBookingUrl } from "@/lib/utils/serviceBookingLink";
import type { AiRecommendedPackage, CareServicePackage } from "@/types/care-service.types";
import type { ConversationSummary } from "@/types/chat.types";
import type { ChatSession } from "../types";
import { CareServicePackageDetailDialog } from "./CareServicePackageDetailDialog";
import { AiRecommendedPackageList } from "./RecommendedPackageList";

type Props = {
  activeSession: ChatSession | null;
  isSending: boolean;
  disabled: boolean;
  onSendBookingLink: (content: string) => Promise<void> | void;
};

export function RecommendationSidebar({
  activeSession,
  isSending,
  disabled,
  onSendBookingLink,
}: Props) {
  const locale = useLocale();
  const conversationId = activeSession?.conversationId ?? null;
  const customerId = activeSession?.customerId ?? null;

  const [summary, setSummary] = useState<ConversationSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [recommendations, setRecommendations] = useState<AiRecommendedPackage[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);

  const [sendingPackageId, setSendingPackageId] = useState<number | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detail, setDetail] = useState<CareServicePackage | null>(null);
  const [viewingPackageId, setViewingPackageId] = useState<number | null>(null);

  const loadSummary = useCallback(async (id: number) => {
    try {
      setSummaryLoading(true);
      setSummaryError(null);
      const data = await getConversationSummary(id);
      setSummary(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load conversation summary";
      setSummaryError(message);
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadRecommendations = useCallback(async (id: number) => {
    try {
      setRecLoading(true);
      setRecError(null);
      const data = await getAiRecommendedPackagesByConversation(id);
      setRecommendations(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load recommended packages";
      setRecError(message);
      setRecommendations([]);
    } finally {
      setRecLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!conversationId) {
      setSummary(null);
      setRecommendations([]);
      return;
    }
    void loadSummary(conversationId);
    void loadRecommendations(conversationId);
  }, [conversationId, loadSummary, loadRecommendations]);

  const handleSendBookingLink = useCallback(
    async (recommendation: AiRecommendedPackage) => {
      if (!customerId) {
        toast.error("Cannot resolve customer user id for this conversation.");
        return;
      }

      const origin = typeof window !== "undefined" ? window.location.origin : undefined;
      const url = buildServiceBookingUrl({
        origin,
        locale,
        userId: customerId,
        packageId: recommendation.packageId,
        packageName: recommendation.packageName,
        action: "book",
      });

      try {
        setSendingPackageId(recommendation.packageId);
        await onSendBookingLink(url);
        toast.success("Booking link sent");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send booking link";
        toast.error(message);
      } finally {
        setSendingPackageId(null);
      }
    },
    [customerId, locale, onSendBookingLink],
  );

  const handleViewDetail = useCallback(async (recommendation: AiRecommendedPackage) => {
    const id = recommendation.packageId;
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setDetailError(null);
      setDetail(null);
      setViewingPackageId(id);

      const payload = await getCareServicePackageDetail(id, true);
      if (!payload) throw new Error("Không thể tải chi tiết gói dịch vụ");
      setDetail(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tải chi tiết gói dịch vụ";
      setDetailError(message);
      toast.error(message);
    } finally {
      setDetailLoading(false);
      setViewingPackageId(null);
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
  }, []);

  const sendDisabled = useMemo(
    () => disabled || !customerId || isSending,
    [disabled, customerId, isSending],
  );

  if (!activeSession) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: 13,
          px: 2,
          textAlign: "center",
        }}
      >
        Select a conversation to see AI summary and package recommendations.
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f7f9fc",
        borderLeft: "1px solid rgba(15,23,42,0.08)",
      }}
    >
      {/* Conversation Summary */}
      <Box sx={{ p: 1.4 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontWeight: 800, fontSize: 13 }}>
            Conversation Summary
          </Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton
            size="small"
            disabled={summaryLoading || !conversationId}
            onClick={() => conversationId && void loadSummary(conversationId)}
            aria-label="Refresh summary"
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Box sx={{ px: 1.4, pb: 1.5, maxHeight: 260, overflowY: "auto" }}>
        {summaryLoading ? (
          <Stack alignItems="center" sx={{ py: 2 }}>
            <CustomLoading size={18} />
          </Stack>
        ) : summaryError ? (
          <Stack spacing={1}>
            <Typography sx={{ fontSize: 12, color: "#b91c1c" }}>
              {summaryError}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => conversationId && void loadSummary(conversationId)}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Retry
            </Button>
          </Stack>
        ) : summary ? (
          <Stack spacing={1}>
            <Typography sx={{ fontSize: 12, color: "#334155", lineHeight: 1.5 }}>
              {summary.summary}
            </Typography>

            {summary.keyPoints?.length ? (
              <Box>
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", mb: 0.25 }}>
                  Key Points
                </Typography>
                {summary.keyPoints.map((point, i) => (
                  <Typography key={i} sx={{ fontSize: 11.5, color: "#475569", lineHeight: 1.45 }}>
                    • {point}
                  </Typography>
                ))}
              </Box>
            ) : null}

            {summary.nextActions?.length ? (
              <Box>
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#2563eb", mb: 0.25 }}>
                  Next Actions
                </Typography>
                {summary.nextActions.map((action, i) => (
                  <Typography key={i} sx={{ fontSize: 11.5, color: "#1e40af", lineHeight: 1.45 }}>
                    → {action}
                  </Typography>
                ))}
              </Box>
            ) : null}
          </Stack>
        ) : (
          <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
            No summary available yet.
          </Typography>
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(15,23,42,0.08)" }} />

      {/* Recommended Packages */}
      <Box sx={{ p: 1.4 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontWeight: 800, fontSize: 13 }}>
            Recommended packages
          </Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton
            size="small"
            disabled={recLoading || !conversationId}
            onClick={() => conversationId && void loadRecommendations(conversationId)}
            aria-label="Refresh recommendations"
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Typography sx={{ fontSize: 11.5, color: "#64748b" }}>
          AI-ranked suggestions based on conversation
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: 1.4,
          pb: 2,
        }}
      >
        <AiRecommendedPackageList
          recommendations={recommendations}
          loading={recLoading}
          error={recError}
          sendingPackageId={sendingPackageId}
          viewingPackageId={viewingPackageId}
          disabled={sendDisabled}
          onSendBookingLink={handleSendBookingLink}
          onViewDetail={handleViewDetail}
        />
      </Box>

      <CareServicePackageDetailDialog
        open={detailOpen}
        loading={detailLoading}
        error={detailError}
        detail={detail}
        onClose={handleCloseDetail}
      />
    </Box>
  );
}
