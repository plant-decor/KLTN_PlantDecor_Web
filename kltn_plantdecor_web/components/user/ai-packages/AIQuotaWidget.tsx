"use client";

import React from "react";
import { Box, Card, CardContent, Chip, Divider, LinearProgress, Stack, Typography } from "@mui/material";
import type { UserQuotaStatus } from "@/types/tier-package.types";
import type { SubscriptionTier } from "@/types/auth.types";
import SubscriptionBadge from "@/components/profile/SubscriptionBadge";

interface AIQuotaWidgetProps {
  quotaStatus: UserQuotaStatus;
}

export default function AIQuotaWidget({ quotaStatus }: AIQuotaWidgetProps) {
  const tier = quotaStatus.tierName as SubscriptionTier | null;

  return (
    <Card sx={{ borderRadius: 3, border: "1px solid var(--card-border, #E2E8F0)" }}>
      <CardContent>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Membership Tier
            </Typography>
            <SubscriptionBadge tier={tier} variant="chip" />
          </Box>

          <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Remaining AI Quota
            </Typography>
            <Typography variant="h5" fontWeight={800} color="primary">
              {quotaStatus.totalRemainingQuota.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">requests</Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Free Quota / Month
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {quotaStatus.tierMonthlyFreeQuota.toLocaleString()} requests
            </Typography>
          </Box>
        </Stack>

        {quotaStatus.activeSubscriptions.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Active Subscriptions
            </Typography>
            <Stack spacing={1.5}>
              {quotaStatus.activeSubscriptions.map((sub) => (
                <Box key={sub.subscriptionId}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{sub.packageName}</Typography>
                      {sub.isMonthlyFree && <Chip label="Monthly Free" size="small" color="success" />}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {sub.remainingQuota.toLocaleString()} / {sub.totalQuota.toLocaleString()} requests
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={sub.totalQuota > 0 ? (sub.usedQuota / sub.totalQuota) * 100 : 0}
                    sx={{ height: 6, borderRadius: 3, backgroundColor: "#E2E8F0" }}
                  />
                </Box>
              ))}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
