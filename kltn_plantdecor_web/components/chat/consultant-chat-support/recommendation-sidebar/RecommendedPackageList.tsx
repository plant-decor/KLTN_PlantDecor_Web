"use client";

import { Stack, Typography } from "@mui/material";
import type { RecommendedPackage } from "@/types/order.types";
import { CustomLoading } from "@/components/CustomLoading";
import { RecommendationCard } from "./RecommendationCard";

type Props = {
  recommendations: RecommendedPackage[];
  loading: boolean;
  error: string | null;
  sendingPackageId: number | null;
  disabled: boolean;
  onSendBookingLink: (recommendation: RecommendedPackage) => void;
};

export function RecommendedPackageList({
  recommendations,
  loading,
  error,
  sendingPackageId,
  disabled,
  onSendBookingLink,
}: Props) {
  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 2 }}>
        <CustomLoading size={18} />
      </Stack>
    );
  }

  if (error) {
    return (
      <Typography sx={{ fontSize: 12, color: "#b91c1c", px: 1 }}>
        {error}
      </Typography>
    );
  }

  if (!recommendations.length) {
    return (
      <Typography sx={{ fontSize: 12, color: "#94a3b8", px: 1 }}>
        No matching care packages for this order.
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {recommendations.map((recommendation) => (
        <RecommendationCard
          key={recommendation.packageId}
          recommendation={recommendation}
          isSending={sendingPackageId === recommendation.packageId}
          disabled={disabled}
          onSendBookingLink={onSendBookingLink}
        />
      ))}
    </Stack>
  );
}
