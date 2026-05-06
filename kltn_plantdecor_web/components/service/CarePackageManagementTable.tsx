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
  Tooltip,
  Container,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  CareServicePackage,
  ServiceType,
  DifficultyLevel,
} from "@/types/service.types";
import { hoverGlowStyle } from "@/lib/styles/buttonStyles";
import { CustomLoading } from "../CustomLoading";

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
        <CustomLoading size={18} />
      </Box>
    );
  }

  if (packages.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="h6" color="textSecondary">
          No service packages found. Please create a new package to get started.
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
              <TableCell sx={{ fontWeight: "bold" }}>Package Name</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Type
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Difficulty Level
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                Price (₫)
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Status
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Actions
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
                  ...hoverGlowStyle
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
                      pkg.serviceType === ServiceType.ONETIME ? "1 Time" : "Recurring"
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
                    label={pkg.isActive ? "Active" : "Inactive"}
                    color={pkg.isActive ? "success" : "error"}
                    size="small"
                    onClick={() => handleStatusToggle(pkg)}
                    clickable
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => onEdit(pkg)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit(pkg)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
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
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this service package?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CarePackageManagementTable;
