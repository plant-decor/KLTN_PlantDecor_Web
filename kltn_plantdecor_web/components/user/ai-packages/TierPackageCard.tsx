"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { AutoAwesome, AccessTime, QueryStats } from "@mui/icons-material";
import type { TierPackage } from "@/types/tier-package.types";
import { formatCurrency } from "@/lib/utils/formatUtil";

interface TierPackageCardProps {
  pkg: TierPackage;
  onPurchase: (tierPackageId: number) => Promise<void>;
  globalPurchasing: boolean;
}

export default function TierPackageCard({ pkg, onPurchase, globalPurchasing }: TierPackageCardProps) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    await onPurchase(pkg.id);
    setLoading(false);
  };

  const isPurchasing = loading || globalPurchasing;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        border: "2px solid transparent",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "var(--primary)",
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(19, 236, 91, 0.2)",
        },
      }}
    >
      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {pkg.name}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center", py: 1 }}>
            <Typography variant="h4" fontWeight={800} color="primary">
              {formatCurrency(pkg.price, 'vi-VN')}
            </Typography>
            {pkg.durationMonths != null && (
              <Typography variant="caption" color="text.secondary">
                / {pkg.durationMonths} month(s)
              </Typography>
            )}
          </Box>

          <Divider />

          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <QueryStats fontSize="small" color="primary" />
              <Typography variant="body2">
                <strong>{pkg.quotaRequests.toLocaleString()}</strong> AI requests
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTime fontSize="small" color="action" />
              <Typography variant="body2">
                {pkg.durationMonths != null ? `Valid for ${pkg.durationMonths} month(s)` : "Lifetime"}
              </Typography>
            </Box>
            {pkg.description && (
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <AutoAwesome fontSize="small" color="action" sx={{ mt: 0.3 }} />
                <Typography variant="body2" color="text.secondary">
                  {pkg.description}
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          className="bg-primary!"
          disabled={isPurchasing}
          onClick={handlePurchase}
          sx={{
            py: 1.2,
            fontWeight: 700,
            fontSize: "1rem",
            borderRadius: 2,
          }}
        >
          {loading ? "Processing..." : "Buy Now"}
        </Button>
      </CardActions>
    </Card>
  );
}
