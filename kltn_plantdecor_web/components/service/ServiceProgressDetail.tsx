import React, { useState } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  IconButton,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import ReceiptIcon from "@mui/icons-material/Receipt";
import {
  ServiceRegistration,
  AddOnService,
  ServiceProgress,
} from "@/types/service.types";

interface ServiceProgressDetailProps {
  registration: ServiceRegistration | null;
  progressLogs: ServiceProgress[];
  addOns: AddOnService[];
  loading?: boolean;
  onApproveAddOn: (addOnId: number) => Promise<void>;
  onRejectAddOn: (addOnId: number, reason: string) => Promise<void>;
  onGenerateInvoice: () => Promise<void>;
  onBack: () => void;
}

export const ServiceProgressDetail: React.FC<ServiceProgressDetailProps> = ({
  registration,
  progressLogs,
  addOns,
  loading = false,
  onApproveAddOn,
  onRejectAddOn,
  onGenerateInvoice,
  onBack,
}) => {
  const [rejectingAddOnId, setRejectingAddOnId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  if (!registration) {
    return (
      <Container maxWidth="md" sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Không tìm thấy dịch vụ
        </Typography>
        <Button variant="outlined" onClick={onBack} sx={{ mt: 2 }}>
          Quay Lại
        </Button>
      </Container>
    );
  }

  const handleApprove = async (addOnId: number) => {
    setActionLoading(true);
    try {
      await onApproveAddOn(addOnId);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingAddOnId) return;
    
    setActionLoading(true);
    try {
      await onRejectAddOn(rejectingAddOnId, rejectReason);
      setRejectingAddOnId(null);
      setRejectReason("");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setActionLoading(true);
    try {
      await onGenerateInvoice();
    } finally {
      setActionLoading(false);
    }
  };

  const pendingAddOns = addOns.filter((a) => a.status === "PROPOSED");
  const approvedAddOns = addOns.filter((a) => a.status === "APPROVED");

  const totalBaseAmount = registration.servicePackage?.unitPrice || 0;
  const totalAddOnAmount = approvedAddOns.reduce((sum, a) => sum + a.price * a.quantity, 0);
  const totalAmount = totalBaseAmount + totalAddOnAmount;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button variant="text" onClick={onBack} sx={{ mb: 3 }}>
        ← Quay Lại
      </Button>

      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Chi Tiết Tiến Độ Dịch Vụ #{registration.id}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {registration.customer?.name} - {registration.servicePackage?.name}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Progress Logs Section */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          📋 Nhật Ký Tiến Độ
        </Typography>

        {progressLogs.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            Chưa có cập nhật tiến độ
          </Alert>
        ) : (
          <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
            {progressLogs.map((log, idx) => (
              <Box key={log.id} sx={{ mb: idx < progressLogs.length - 1 ? 2 : 0 }}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {log.action.replace(/_/g, " ")}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {log.description}
                </Typography>
                {idx < progressLogs.length - 1 && (
                  <Divider sx={{ my: 1 }} />
                )}
              </Box>
            ))}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Add-ons Section */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          ➕ Dịch Vụ Phát Sinh ({pendingAddOns.length} chờ duyệt)
        </Typography>

        {addOns.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            Không có dịch vụ phát sinh
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Tên Dịch Vụ</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    Số Lượng
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    Giá (₫)
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    Tổng (₫)
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    Trạng Thái
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    Hành Động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {addOns.map((addon) => (
                  <TableRow key={addon.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {addon.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {addon.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">{addon.quantity}</TableCell>
                    <TableCell align="right">
                      {addon.price.toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {(addon.price * addon.quantity).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={
                          addon.status === "PROPOSED"
                            ? "Chờ Duyệt"
                            : addon.status === "APPROVED"
                            ? "Đã Duyệt"
                            : "Từ Chối"
                        }
                        color={
                          addon.status === "PROPOSED"
                            ? "warning"
                            : addon.status === "APPROVED"
                            ? "success"
                            : "error"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {addon.status === "PROPOSED" && (
                        <Box display="flex" gap={1} justifyContent="center">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApprove(addon.id)}
                            disabled={actionLoading}
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setRejectingAddOnId(addon.id)}
                            disabled={actionLoading}
                          >
                            <ClearIcon />
                          </IconButton>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Invoice Summary */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          💵 Tóm Tắt Hóa Đơn
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Giá Cơ Bản (Gói Dịch Vụ)
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {totalBaseAmount.toLocaleString("vi-VN")} ₫
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 2, bgcolor: "#e8f5e9", borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Dịch Vụ Phát Sinh (Đã Duyệt)
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "success.main" }}>
                {totalAddOnAmount.toLocaleString("vi-VN")} ₫
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ p: 2, bgcolor: "primary.lighter", borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Tổng Cộng
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "primary.main" }}>
                {totalAmount.toLocaleString("vi-VN")} ₫
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Generate Invoice Button */}
        <Button
          fullWidth
          variant="contained"
          color="success"
          size="large"
          startIcon={<ReceiptIcon />}
          onClick={handleGenerateInvoice}
          disabled={actionLoading}
        >
          {actionLoading ? "Đang Tạo..." : "Xuất Hóa Đơn"}
        </Button>
      </Paper>

      {/* Reject Add-on Dialog */}
      <Dialog
        open={rejectingAddOnId !== null}
        onClose={() => {
          setRejectingAddOnId(null);
          setRejectReason("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Từ Chối Dịch Vụ Phát Sinh
            </Typography>
            <IconButton
              onClick={() => {
                setRejectingAddOnId(null);
                setRejectReason("");
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Vui lòng nhập lý do từ chối để thông báo cho khách hàng.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Ví dụ: Không phù hợp với nhu cầu hiện tại, giá quá cao..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box display="flex" gap={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setRejectingAddOnId(null);
                setRejectReason("");
              }}
              disabled={actionLoading}
            >
              Huỷ
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={handleRejectSubmit}
              disabled={actionLoading || !rejectReason.trim()}
            >
              {actionLoading ? "Đang Xử Lý..." : "Xác Nhận"}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Container>
  );
};

export default ServiceProgressDetail;
