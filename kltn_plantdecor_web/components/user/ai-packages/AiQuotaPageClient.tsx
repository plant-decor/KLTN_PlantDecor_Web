"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
import useAiQuota from "@/hooks/useAiQuota";
import type { SubscriptionTier } from "@/types/auth.types";
import SubscriptionBadge from "@/components/profile/SubscriptionBadge";

const formatDateTime = (value: string | null): string => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function AiQuotaPageClient() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;

  const { quotaStatus, subscriptions, loading, error, fetchQuota, fetchSubscriptions } = useAiQuota();

  useEffect(() => {
    fetchQuota();
    fetchSubscriptions();
  }, [fetchQuota, fetchSubscriptions]);

  if (loading && !quotaStatus) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const tier = quotaStatus?.tierName as SubscriptionTier | null;

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 3, md: 6 } }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Quota AI & Subscription
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your remaining quota and AI package subscription history.
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {quotaStatus && (
          <Card sx={{ borderRadius: 3, border: "2px solid var(--primary, #13EC5B)" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Current Status
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                divider={<Divider orientation="vertical" flexItem />}
              >
                <Box sx={{ minWidth: 140 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Membership Tier
                  </Typography>
                  <SubscriptionBadge tier={tier} variant="chip" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Total Remaining Quota
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="primary">
                    {quotaStatus.totalRemainingQuota.toLocaleString()} requests
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Free Quota / Month (by tier)
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {quotaStatus.tierMonthlyFreeQuota.toLocaleString()} requests
                  </Typography>
                </Box>
              </Stack>

              {quotaStatus.activeSubscriptions.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                    Active Packages
                  </Typography>
                  <Stack spacing={2}>
                    {quotaStatus.activeSubscriptions.map((sub) => (
                      <Box key={sub.subscriptionId}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {sub.packageName}
                            </Typography>
                            {sub.isMonthlyFree && (
                              <Chip label="Monthly Free" size="small" color="success" />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {sub.remainingQuota.toLocaleString()} /{" "}
                            {sub.totalQuota.toLocaleString()} requests
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            sub.totalQuota > 0 ? (sub.usedQuota / sub.totalQuota) * 100 : 0
                          }
                          sx={{ height: 8, borderRadius: 4, backgroundColor: "#E2E8F0" }}
                        />
                        {sub.endDate && (
                          <Typography variant="caption" color="text.secondary">
                            Expires: {formatDateTime(sub.endDate)}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Subscription History ({subscriptions.length})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ShoppingCart />}
              component={Link}
              href={`/${locale}/ai-packages`}
              size="small"
            >
              Buy More Quota
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "var(--primary)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Package</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total Quota</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Used</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Remaining</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No subscriptions found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((sub) => (
                    <TableRow key={sub.id} hover>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" fontWeight={600}>
                            {sub.packageName}
                          </Typography>
                          {sub.isMonthlyFree && (
                            <Chip label="Monthly Free" size="small" color="success" sx={{ width: "fit-content" }} />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>{sub.totalQuota.toLocaleString()}</TableCell>
                      <TableCell>{sub.usedQuota.toLocaleString()}</TableCell>
                      <TableCell>{sub.remainingQuota.toLocaleString()}</TableCell>
                      <TableCell>{formatDateTime(sub.startDate)}</TableCell>
                      <TableCell>{sub.endDate ? formatDateTime(sub.endDate) : "Lifetime"}</TableCell>
                      <TableCell>
                        <Chip
                          label={sub.isActive ? "Active" : "Expired"}
                          color={sub.isActive ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </Box>
  );
}
