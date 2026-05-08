"use client";

import { Box, Chip, Stack, Typography } from "@mui/material";
import type { OrderByEmail } from "@/types/order.types";
import { formatDate } from "@/lib/utils/dateUtils";
import { formatCurrency } from "@/lib/utils/formatUtil";

type Props = {
  orders: OrderByEmail[];
  selectedOrderId: number | null;
  onSelectOrder: (orderId: number) => void;
};

export function OrderHistoryList({
  orders,
  selectedOrderId,
  onSelectOrder,
}: Props) {
  if (!orders.length) {
    return (
      <Typography sx={{ fontSize: 12, color: "#94a3b8", px: 1 }}>
        No orders yet for this customer.
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {orders.map((order) => {
        const isActive = selectedOrderId === order.id;
        const itemSummary = order.items.length
          ? order.items
              .slice(0, 2)
              .map((item) => `${item.itemName} x${item.quantity}`)
              .join(", ")
          : "No items";

        return (
          <Box
            key={order.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectOrder(order.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelectOrder(order.id);
              }
            }}
            sx={{
              cursor: "pointer",
              p: 1.1,
              borderRadius: 2,
              border: isActive
                ? "1.5px solid #15803d"
                : "1px solid rgba(15,23,42,0.08)",
              bgcolor: isActive ? "rgba(34,197,94,0.06)" : "#ffffff",
              transition: "background-color 120ms ease, border-color 120ms ease",
              "&:hover": {
                bgcolor: isActive
                  ? "rgba(34,197,94,0.10)"
                  : "rgba(15,23,42,0.04)",
              },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                #{order.id}
              </Typography>
              <Chip
                size="small"
                label={order.statusName}
                sx={{ fontSize: 11, height: 20 }}
              />
            </Stack>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 12,
                color: "#475569",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {itemSummary}
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mt: 0.5 }}
            >
              <Typography sx={{ fontSize: 11, color: "#64748b" }}>
                {formatDate(order.createdAt)}
              </Typography>
              <Typography
                sx={{ fontSize: 12, fontWeight: 700, color: "#15803d" }}
              >
                {formatCurrency(order.totalAmount, 'vi-VN')}
              </Typography>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}
