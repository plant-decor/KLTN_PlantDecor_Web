import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tooltip,
  Container,
  Typography,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  CareServicePackage,
  ServiceType,
  DifficultyLevel,
} from "@/types/service.types";

interface CarePackageManagementTableProps {
  packages: CareServicePackage[];
  loading?: boolean;
  onEdit: (pkg: CareServicePackage) => void;
  onDelete: (packageId: number) => Promise<void>;
  onStatusToggle: (packageId: number, isActive: boolean) => Promise<void>;
}

const difficultyColors: Record<DifficultyLevel, "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success"> = {
  [DifficultyLevel.EASY]: "success",
  [DifficultyLevel.MEDIUM]: "info",
  [DifficultyLevel.HARD]: "warning",
  [DifficultyLevel.EXPERT]: "error",
};

export const CarePackageManagementTable: React.FC<CarePackageManagementTableProps> = ({
  packages,
  loading = false,
  onEdit,
  onDelete,
  onStatusToggle,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (packageId: number) => {
    setSelectedPackageId(packageId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPackageId) return;
    
    setDeleting(true);
    try {
      await onDelete(selectedPackageId);
      setDeleteConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusToggle = async (pkg: CareServicePackage) => {
    try {
      await onStatusToggle(pkg.id, !pkg.isActive);
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (packages.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="h6" color="textSecondary">
          Không có gói dịch vụ nào
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 750 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Tên Gói</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Loại
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Mức Độ
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                Giá (₫)
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
            {packages.map((pkg) => (
              <TableRow
                key={pkg.id}
                hover
                sx={{
                  opacity: pkg.isActive ? 1 : 0.6,
                }}
              >
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {pkg.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {pkg.description.substring(0, 50)}...
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={
                      pkg.serviceType === ServiceType.ONETIME ? "1 Lần" : "Định Kỳ"
                    }
                    size="small"
                    color={
                      pkg.serviceType === ServiceType.ONETIME
                        ? "primary"
                        : "secondary"
                    }
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={pkg.difficultyLevel}
                    size="small"
                    color={difficultyColors[pkg.difficultyLevel]}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {pkg.unitPrice.toLocaleString('vi-VN')}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={pkg.isActive ? "Hoạt Động" : "Không Hoạt Động"}
                    color={pkg.isActive ? "success" : "error"}
                    size="small"
                    onClick={() => handleStatusToggle(pkg)}
                    clickable
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Xem Chi Tiết">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => onEdit(pkg)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Chỉnh Sửa">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit(pkg)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xoá">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(pkg.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Xác Nhận Xoá</DialogTitle>
        <DialogContent>
          <Typography>Bạn chắc chắn muốn xoá gói dịch vụ này?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={deleting}
          >
            Huỷ
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Đang Xoá..." : "Xoá"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CarePackageManagementTable;
