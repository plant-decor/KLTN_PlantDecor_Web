import React, { useState } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Divider,
  Alert,
  Dialog,
  CircularProgress,
  Grid,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { ServiceRegistration } from "@/types/service.types";
import AssignCaretakerModal from "./AssignCaretakerModal";

interface ServiceRequestDetailProps {
  request: ServiceRegistration | null;
  loading?: boolean;
  onConfirm: (caretakerId: number, estimatedDuration: number) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onBack: () => void;
}

export const ServiceRequestDetail: React.FC<ServiceRequestDetailProps> = ({
  request,
  loading = false,
  onConfirm,
  onReject,
  onBack,
}) => {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleConfirmClick = () => {
    setAssignModalOpen(true);
  };

  const handleAssignment = async (caretakerId: number, estimatedDuration: number) => {
    setActionLoading(true);
    try {
      await onConfirm(caretakerId, estimatedDuration);
      setAssignModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }
    setActionLoading(true);
    try {
      await onReject(rejectReason);
    } finally {
      setActionLoading(false);
      setIsRejecting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!request) {
    return (
      <Container maxWidth="md" sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Không tìm thấy yêu cầu dịch vụ
        </Typography>
        <Button variant="outlined" onClick={onBack} sx={{ mt: 2 }}>
          Quay Lại
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button variant="text" onClick={onBack} sx={{ mb: 3 }}>
        ← Quay Lại Danh Sách
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Chi Tiết Yêu Cầu Dịch Vụ #{request.id}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Customer Information */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          👤 Thông Tin Khách Hàng
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <Typography variant="caption" color="textSecondary">
                Tên Khách Hàng
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {request.customer?.name}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <PhoneIcon color="primary" />
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Số Điện Thoại
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {request.phone}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box display="flex" alignItems="flex-start" gap={1}>
              <LocationOnIcon color="primary" sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Địa Chỉ Thực Hiện
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {request.address}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Service Package Information */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          📦 Thông Tin Gói Dịch Vụ
        </Typography>

        <Box
          sx={{
            p: 2,
            bgcolor: "info.lighter",
            borderRadius: 1,
            mb: 3,
          }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="textSecondary">
                Tên Gói
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {request.servicePackage?.name}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="textSecondary">
                Giá Cơ Bản
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: "bold", color: "success.main" }}>
                {request.servicePackage?.unitPrice.toLocaleString('vi-VN')} ₫
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="textSecondary">
                Mô Tả
              </Typography>
              <Typography variant="body2">
                {request.servicePackage?.description}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="textSecondary">
                Các Công Việc
              </Typography>
              <Typography variant="body2">
                {request.servicePackage?.features.join(", ")}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Service Date & Notes */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          ⏰ Lịch Hẹn & Ghi Chú
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTimeIcon color="primary" />
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Ngày & Giờ Mong Muốn
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {new Date(request.serviceDate).toLocaleString('vi-VN')}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {request.note && (
          <Box sx={{ p: 2, bgcolor: "#fff3e0", borderRadius: 1, mb: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
              📝 Ghi Chú Tình Trạng Cây:
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {request.note}
            </Typography>
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Action Buttons */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          ✅ Xác Nhận Đơn Hàng
        </Typography>

        <Box display="flex" gap={2} sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={handleConfirmClick}
            disabled={actionLoading}
            size="large"
            sx={{ flex: 1 }}
          >
            Xác Nhận & Phân Công
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => setIsRejecting(true)}
            disabled={actionLoading}
            size="large"
            sx={{ flex: 1 }}
          >
            Từ Chối
          </Button>
        </Box>

        {/* Reject Dialog */}
        <Dialog open={isRejecting} onClose={() => setIsRejecting(false)} maxWidth="sm" fullWidth>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Từ Chối Yêu Cầu Dịch Vụ
            </Typography>

            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Vui lòng nhập lý do từ chối để thông báo cho khách hàng.
            </Typography>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ví dụ: Quá tải công việc, không có caretaker khả dụng, v.v..."
              style={{
                width: "100%",
                minHeight: 120,
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
                fontFamily: "inherit",
              }}
            />

            <Box display="flex" gap={2} sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setIsRejecting(false)}
                disabled={actionLoading}
              >
                Huỷ
              </Button>
              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? "Đang Xử Lý..." : "Xác Nhận Từ Chối"}
              </Button>
            </Box>
          </Box>
        </Dialog>
      </Paper>

      {/* Assign Caretaker Modal */}
      <AssignCaretakerModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSubmit={handleAssignment}
        loading={actionLoading}
      />
    </Container>
  );
};

export default ServiceRequestDetail;
