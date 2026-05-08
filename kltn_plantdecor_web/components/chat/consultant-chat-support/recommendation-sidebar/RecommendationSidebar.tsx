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
  getOrdersByEmail,
  getRecommendedPackagesByPlant,
} from "@/lib/api/orderService";
import { getConsultantOrderById } from "@/lib/api/consultantOrdersService";
import { getCareServicePackageDetail } from "@/lib/api/careServiceService";
import { buildServiceBookingUrl } from "@/lib/utils/serviceBookingLink";
import type {
  OrderByEmail,
  RecommendedPackage,
} from "@/types/order.types";
import type { CareServicePackage } from "@/types/care-service.types";
import type { ConsultantOrder } from "@/types/consultant-order.types";
import type { ChatSession } from "../types";
import { OrderHistoryList } from "./OrderHistoryList";
import { RecommendedPackageList } from "./RecommendedPackageList";
import { CareServicePackageDetailDialog } from "./CareServicePackageDetailDialog";
import { ConsultantOrderDetailDialog } from "./ConsultantOrderDetailDialogView";

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
  const [orders, setOrders] = useState<OrderByEmail[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const [recommendations, setRecommendations] = useState<RecommendedPackage[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);

  const [sendingPackageId, setSendingPackageId] = useState<number | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detail, setDetail] = useState<CareServicePackage | null>(null);
  const [viewingPackageId, setViewingPackageId] = useState<number | null>(null);

  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [orderDetailError, setOrderDetailError] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<ConsultantOrder | null>(null);
  const [viewingOrderId, setViewingOrderId] = useState<number | null>(null);

  const customerEmail = activeSession?.customerEmail ?? "";
  const customerId = activeSession?.customerId ?? null;

  const loadOrders = useCallback(
    async (email: string) => {
      if (!email) {
        setOrders([]);
        setSelectedOrderId(null);
        return;
      }

      try {
        setOrdersLoading(true);
        setOrdersError(null);
        const data = await getOrdersByEmail(email);
        setOrders(data);
        setSelectedOrderId(data[0]?.id ?? null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load order history";
        setOrdersError(message);
        setOrders([]);
        setSelectedOrderId(null);
      } finally {
        setOrdersLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadOrders(customerEmail);
  }, [customerEmail, loadOrders]);

  const loadRecommendations = useCallback(async (orderId: number | null) => {
    if (!orderId) {
      setRecommendations([]);
      return;
    }

    try {
      setRecLoading(true);
      setRecError(null);
      const payload = await getRecommendedPackagesByPlant(orderId);
      setRecommendations(payload.recommendations ?? []);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to load recommended packages";
      setRecError(message);
      setRecommendations([]);
    } finally {
      setRecLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecommendations(selectedOrderId);
  }, [selectedOrderId, loadRecommendations]);

  const handleSendBookingLink = useCallback(
    async (recommendation: RecommendedPackage) => {
      if (!customerId) {
        toast.error("Cannot resolve customer user id for this conversation.");
        return;
      }

      const origin =
        typeof window !== "undefined" ? window.location.origin : undefined;
      const url = buildServiceBookingUrl({
        origin,
        locale,
        userId: customerId,
        packageId: recommendation.packageId,
        action: "book",
      });

      try {
        setSendingPackageId(recommendation.packageId);
        await onSendBookingLink(url);
        toast.success("Booking link sent");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to send booking link";
        toast.error(message);
      } finally {
        setSendingPackageId(null);
      }
    },
    [customerId, locale, onSendBookingLink],
  );

  const handleViewDetail = useCallback(async (recommendation: RecommendedPackage) => {
    const id = recommendation.packageId;
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setDetailError(null);
      setDetail(null);
      setViewingPackageId(id);

      const payload = await getCareServicePackageDetail(id, true);
      if (!payload) {
        throw new Error("Không thể tải chi tiết gói dịch vụ");
      }
      setDetail(payload);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể tải chi tiết gói dịch vụ";
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

  const handleViewOrderDetail = useCallback(async (orderId: number) => {
    try {
      setOrderDetailOpen(true);
      setOrderDetailLoading(true);
      setOrderDetailError(null);
      setOrderDetail(null);
      setViewingOrderId(orderId);

      const payload = await getConsultantOrderById(orderId, true);
      if (!payload) {
        throw new Error("Không thể tải chi tiết đơn hàng");
      }
      setOrderDetail(payload);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể tải chi tiết đơn hàng";
      setOrderDetailError(message);
      toast.error(message);
    } finally {
      setOrderDetailLoading(false);
      setViewingOrderId(null);
    }
  }, []);

  const handleCloseOrderDetail = useCallback(() => {
    setOrderDetailOpen(false);
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
        Select a conversation to see customer orders and package recommendations.
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
      <Box sx={{ p: 1.4 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontWeight: 800, fontSize: 13 }}>
            Customer orders
          </Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton
            size="small"
            disabled={ordersLoading || !customerEmail}
            onClick={() => void loadOrders(customerEmail)}
            aria-label="Refresh orders"
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Typography sx={{ fontSize: 11.5, color: "#64748b" }}>
          {customerEmail || "No email available"}
        </Typography>
      </Box>

      <Box sx={{ px: 1.4, pb: 1, maxHeight: 220, overflowY: "auto" }}>
        {ordersLoading ? (
          <Stack alignItems="center" sx={{ py: 2 }}>
            <CustomLoading size={18} />
          </Stack>
        ) : ordersError ? (
          <Stack spacing={1} sx={{ px: 1 }}>
            <Typography sx={{ fontSize: 12, color: "#b91c1c" }}>
              {ordersError}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => void loadOrders(customerEmail)}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Retry
            </Button>
          </Stack>
        ) : (
          <OrderHistoryList
            orders={orders}
            selectedOrderId={selectedOrderId}
            onSelectOrder={setSelectedOrderId}
            onViewDetail={(orderId) => void handleViewOrderDetail(orderId)}
          />
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(15,23,42,0.08)" }} />

      <Box sx={{ p: 1.4 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontWeight: 800, fontSize: 13 }}>
            Recommended packages
          </Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton
            size="small"
            disabled={recLoading || !selectedOrderId}
            onClick={() => void loadRecommendations(selectedOrderId)}
            aria-label="Refresh recommendations"
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Typography sx={{ fontSize: 11.5, color: "#64748b" }}>
          {selectedOrderId
            ? `Suggestions based on order #${selectedOrderId}`
            : "Select an order to view suggestions"}
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
        <RecommendedPackageList
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

      <ConsultantOrderDetailDialog
        open={orderDetailOpen}
        loading={orderDetailLoading}
        error={orderDetailError}
        detail={orderDetail}
        viewingOrderId={viewingOrderId}
        onClose={handleCloseOrderDetail}
      />
    </Box>
  );
}
