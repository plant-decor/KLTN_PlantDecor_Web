"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import { toast } from "react-toastify";
import ManagementHeader from "@/components/layout/ManagementHeader";
import {
  addManagerPackageToNursery,
  deleteManagerNurseryCareService,
  getManagerNotOfferedPackages,
  getManagerNurseryCareServices,
  toggleManagerNurseryCareService,
} from "@/lib/api/careServiceService";
import type { CareServicePackage, NurseryCareService } from "@/types/care-service.types";

const SERVICE_TYPE_LABELS: Record<number, string> = {
  1: "Một lần",
  2: "Định kỳ",
};

const formatCurrency = (value: number) => {
  return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const candidate = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return candidate.response?.data?.message || candidate.message || fallback;
};

export default function ManagerCareServiceManagementPageClient() {
  const [items, setItems] = useState<NurseryCareService[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [notOfferedPackages, setNotOfferedPackages] = useState<CareServicePackage[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<number>(0);
  const [targetToggleItem, setTargetToggleItem] = useState<NurseryCareService | null>(null);
  const [targetDeleteItem, setTargetDeleteItem] = useState<NurseryCareService | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const activeCount = useMemo(() => items.filter((item) => item.isActive).length, [items]);

  const loadItems = useCallback(async () => {
    const response = await getManagerNurseryCareServices(false);
    setItems(response);
  }, []);

  const loadNotOfferedPackages = useCallback(async () => {
    const response = await getManagerNotOfferedPackages(false);
    setNotOfferedPackages(response.filter((item) => item.isActive));
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setPageError(null);
      const [myServices, availablePackages] = await Promise.all([
        getManagerNurseryCareServices(false),
        getManagerNotOfferedPackages(false),
      ]);

      setItems(myServices);
      setNotOfferedPackages(availablePackages.filter((item) => item.isActive));
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải danh sách gói dịch vụ của vựa");
      setPageError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const openAddDialog = async () => {
    try {
      await loadNotOfferedPackages();
      setSelectedPackageId(0);
      setAddDialogOpen(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải danh sách gói chưa kinh doanh"));
    }
  };

  const handleAddPackage = async () => {
    if (!selectedPackageId) {
      toast.error("Vui lòng chọn gói dịch vụ để thêm");
      return;
    }

    try {
      setSubmitting(true);
      await addManagerPackageToNursery(selectedPackageId, false);
      toast.success("Đã thêm gói dịch vụ vào vựa");
      setAddDialogOpen(false);
      await loadInitialData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể thêm gói dịch vụ"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmToggle = async () => {
    if (!targetToggleItem) {
      return;
    }

    try {
      setSubmitting(true);
      await toggleManagerNurseryCareService(targetToggleItem.id, false);
      toast.success(targetToggleItem.isActive ? "Đã tắt gói dịch vụ" : "Đã bật gói dịch vụ");
      setTargetToggleItem(null);
      await loadItems();
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể thay đổi trạng thái gói dịch vụ"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!targetDeleteItem) {
      return;
    }

    try {
      setSubmitting(true);
      await deleteManagerNurseryCareService(targetDeleteItem.id, false);
      toast.success("Đã xóa gói dịch vụ khỏi vựa");
      setTargetDeleteItem(null);
      await loadInitialData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xóa gói dịch vụ khỏi vựa"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "var(--background)", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <ManagementHeader
        title="Quản lý dịch vụ chăm sóc"
        description="Quản lý các gói dịch vụ vựa đang kinh doanh: thêm mới từ hệ thống, bật/tắt và xóa khi chưa có đăng ký."
        entityLabel="gói dịch vụ"
        count={items.length}
        actionLabel="Thêm gói vào vựa"
        onAction={() => void openAddDialog()}
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Chip label={`Đang hoạt động: ${activeCount}`} color="success" variant="outlined" />
        <Chip label={`Ngừng kinh doanh: ${items.length - activeCount}`} variant="outlined" />
        <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => void loadInitialData()}
          disabled={loading}
        >
          Tải lại
        </Button>
      </Stack>

      {pageError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPageError(null)}>
          {pageError}
        </Alert>
      )}

      <Paper sx={{ border: "1px solid var(--card-border)", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "var(--primary)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID NCS</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tên gói</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Loại</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Số lần/tuần
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Thời lượng (ngày)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Đơn giá
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Trạng thái
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Hành động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      Vựa chưa có gói dịch vụ chăm sóc nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} hover sx={{ opacity: item.isActive ? 1 : 0.65 }}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {item.careServicePackage.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.careServicePackage.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {SERVICE_TYPE_LABELS[item.careServicePackage.serviceType] ||
                          `Loại ${item.careServicePackage.serviceType}`}
                      </TableCell>
                      <TableCell align="right">{item.careServicePackage.visitPerWeek}</TableCell>
                      <TableCell align="right">{item.careServicePackage.durationDays}</TableCell>
                      <TableCell align="right">{formatCurrency(item.careServicePackage.unitPrice)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          color={item.isActive ? "success" : "default"}
                          label={item.isActive ? "Đang kinh doanh" : "Ngừng kinh doanh"}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={item.isActive ? "Tắt gói" : "Bật gói"}>
                          <IconButton
                            size="small"
                            color={item.isActive ? "success" : "default"}
                            onClick={() => setTargetToggleItem(item)}
                          >
                            {item.isActive ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa khỏi vựa">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setTargetDeleteItem(item)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={addDialogOpen} onClose={() => (submitting ? null : setAddDialogOpen(false))} fullWidth maxWidth="sm">
        <DialogTitle>Thêm gói dịch vụ vào vựa</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth>
            <InputLabel id="care-package-select">Gói chưa kinh doanh</InputLabel>
            <Select
              labelId="care-package-select"
              label="Gói chưa kinh doanh"
              value={selectedPackageId}
              onChange={(event) => setSelectedPackageId(Number(event.target.value))}
              disabled={submitting}
            >
              <MenuItem value={0} disabled>
                Chọn một gói dịch vụ
              </MenuItem>
              {notOfferedPackages.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name} - {formatCurrency(item.unitPrice)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {notOfferedPackages.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Hiện không còn gói active nào để thêm vào vựa.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => void handleAddPackage()}
            disabled={submitting || notOfferedPackages.length === 0}
            sx={{backgroundColor: 'var(--primary)'}}
          > 
            {submitting ? "Đang thêm..." : "Thêm gói"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(targetToggleItem)} onClose={() => (submitting ? null : setTargetToggleItem(null))}>
        <DialogTitle>Xác nhận thay đổi trạng thái</DialogTitle>
        <DialogContent dividers>
          Bạn có chắc muốn {targetToggleItem?.isActive ? "tắt" : "bật"} gói
          <strong> {targetToggleItem?.careServicePackage.name}</strong> không?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTargetToggleItem(null)} disabled={submitting}>
            Hủy
          </Button>
          <Button variant="contained" onClick={() => void handleConfirmToggle()} disabled={submitting}>
            {submitting ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(targetDeleteItem)} onClose={() => (submitting ? null : setTargetDeleteItem(null))}>
        <DialogTitle>Xác nhận xóa khỏi vựa</DialogTitle>
        <DialogContent dividers>
          Hành động này chỉ thành công khi gói chưa có đăng ký nào. Bạn có chắc muốn xóa
          <strong> {targetDeleteItem?.careServicePackage.name}</strong> khỏi vựa không?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTargetDeleteItem(null)} disabled={submitting}>
            Hủy
          </Button>
          <Button color="error" variant="contained" onClick={() => void handleConfirmDelete()} disabled={submitting}>
            {submitting ? "Đang xóa..." : "Xóa khỏi vựa"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
