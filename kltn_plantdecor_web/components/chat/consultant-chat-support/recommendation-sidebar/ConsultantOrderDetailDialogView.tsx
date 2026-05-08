"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import type { ConsultantOrder } from "@/types/consultant-order.types";
import { formatCurrency } from "@/lib/utils/formatUtil";
import { formatDateTime } from "@/lib/utils/dateUtils";

export type Props = {
  open: boolean;
  loading: boolean;
  error: string | null;
  detail: ConsultantOrder | null;
  viewingOrderId: number | null;
  onClose: () => void;
};

function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} sx={{ wordBreak: "break-word" }}>
        {value ?? "-"}
      </Typography>
    </Stack>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography variant="subtitle1" fontWeight={800}>
      {children}
    </Typography>
  );
}

export function ConsultantOrderDetailDialog({
  open,
  loading,
  error,
  detail,
  viewingOrderId,
  onClose,
}: Props) {
  const titleId = detail?.id ?? viewingOrderId ?? "-";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Order detail #{titleId}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <Typography>Loading order detail...</Typography>
          </Box>
        )}

        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && detail && (
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "center" }}
            >
              <Typography variant="h6" fontWeight={800} sx={{ flex: 1 }}>
                #{detail.id} • {detail.statusName}
              </Typography>
              <Typography variant="subtitle1" fontWeight={800} color="#15803d">
                {formatCurrency(detail.totalAmount, "vi-VN")}
              </Typography>
            </Stack>

            <Divider />

            <SectionTitle>General information</SectionTitle>
            <FieldRow label="Created at" value={formatDateTime(detail.createdAt ?? "")} />
            <FieldRow label="Updated at" value={formatDateTime(detail.updatedAt ?? "")} />
            <FieldRow label="Payment strategy" value={detail.paymentStrategyName} />
            <FieldRow label="Order type" value={detail.orderTypeName} />
            <FieldRow label="Note" value={detail.note || "-"} />

            <Divider />

            <SectionTitle>Customer</SectionTitle>
            <FieldRow label="Name" value={detail.customerName || "-"} />
            <FieldRow label="Email" value={detail.customerEmail || "-"} />
            <FieldRow label="Phone" value={detail.phone || "-"} />
            <FieldRow label="Address" value={detail.address || "-"} />

            <Divider />

            <SectionTitle>Payment</SectionTitle>
            <FieldRow label="Total" value={formatCurrency(detail.totalAmount, "vi-VN")} />
            <FieldRow
              label="Deposit"
              value={
                detail.depositAmount == null
                  ? "-"
                  : formatCurrency(detail.depositAmount, "vi-VN")
              }
            />
            <FieldRow
              label="Remaining"
              value={
                detail.remainingAmount == null
                  ? "-"
                  : formatCurrency(detail.remainingAmount, "vi-VN")
              }
            />

            <Divider />

            <SectionTitle>Products</SectionTitle>
            {detail.items?.length ? (
              <Stack spacing={1}>
                {detail.items.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      p: 1.1,
                      borderRadius: 2,
                      border: "1px solid rgba(15,23,42,0.08)",
                      bgcolor: "#ffffff",
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ fontWeight: 800, fontSize: 13, flex: 1 }}>
                        {item.itemName}
                      </Typography>
                      <Chip
                        size="small"
                        label={item.statusName}
                        sx={{ fontSize: 11, height: 20 }}
                      />
                    </Stack>
                    <Typography sx={{ mt: 0.5, fontSize: 12, color: "#475569" }}>
                      SL: {item.quantity} • Đơn giá: {formatCurrency(item.price, "vi-VN")}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                -
              </Typography>
            )}

            <Divider />

            <SectionTitle>Nursery order</SectionTitle>
            {detail.nurseryOrders?.length ? (
              <Stack spacing={1.2}>
                {detail.nurseryOrders.map((n) => (
                  <Box
                    key={n.id}
                    sx={{
                      p: 1.1,
                      borderRadius: 2,
                      border: "1px solid rgba(15,23,42,0.08)",
                      bgcolor: "#ffffff",
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ fontWeight: 800, fontSize: 13, flex: 1 }}>
                        #{n.id} • {n.nurseryName}
                      </Typography>
                      <Chip size="small" label={n.statusName} sx={{ fontSize: 11, height: 20 }} />
                    </Stack>
                    <Typography sx={{ mt: 0.5, fontSize: 12, color: "#475569" }}>
                      Subtotal: {formatCurrency(n.subTotalAmount, "vi-VN")}
                    </Typography>
                    <Typography sx={{ mt: 0.25, fontSize: 12, color: "#475569" }}>
                      Shipper: {n.shipperName || "-"}
                    </Typography>

                    {n.items?.length ? (
                      <Stack spacing={0.6} sx={{ mt: 1 }}>
                        {n.items.map((it) => (
                          <Stack key={it.id} direction="row" spacing={1} alignItems="center">
                            <Typography sx={{ fontSize: 12, color: "#0f172a", flex: 1 }}>
                              {it.itemName} x{it.quantity}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "#475569" }}>
                              {formatCurrency(it.price, "vi-VN")}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    ) : null}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                -
              </Typography>
            )}

            <Divider />

            <SectionTitle>Invoices</SectionTitle>
            {detail.invoices?.length ? (
              <Stack spacing={1.2}>
                {detail.invoices.map((inv) => (
                  <Box
                    key={inv.id}
                    sx={{
                      p: 1.1,
                      borderRadius: 2,
                      border: "1px solid rgba(15,23,42,0.08)",
                      bgcolor: "#ffffff",
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ fontWeight: 800, fontSize: 13, flex: 1 }}>
                        #{inv.id} • {inv.typeName}
                      </Typography>
                      <Chip
                        size="small"
                        label={inv.statusName}
                        sx={{ fontSize: 11, height: 20 }}
                      />
                    </Stack>
                    <Typography sx={{ mt: 0.5, fontSize: 12, color: "#475569" }}>
                      Issued at: {formatDateTime(inv.issuedDate ?? "")} • Total:{" "}
                      {formatCurrency(inv.totalAmount, "vi-VN")}
                    </Typography>

                    {inv.details?.length ? (
                      <Stack spacing={0.6} sx={{ mt: 1 }}>
                        {inv.details.map((d) => (
                          <Stack key={d.id} direction="row" spacing={1} alignItems="center">
                            <Typography sx={{ fontSize: 12, color: "#0f172a", flex: 1 }}>
                              {d.itemName} x{d.quantity}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "#475569" }}>
                              {formatCurrency(d.amount, "vi-VN")}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    ) : null}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                -
              </Typography>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

