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
      const message = getErrorMessage(error, "Cannot load the list of care service packages");
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
      toast.error(getErrorMessage(error, "Cannot load the list of available packages"));
    }
  };

  const handleAddPackage = async () => {
    if (!selectedPackageId) {
      toast.error("Please select a care service package to add");
      return;
    }

    try {
      setSubmitting(true);
      await addManagerPackageToNursery(selectedPackageId, false);
      toast.success("Added package to inventory successfully");
      setAddDialogOpen(false);
      await loadInitialData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Cannot add package to inventory"));
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
      toast.success(targetToggleItem.isActive ? "Package deactivated successfully" : "Package activated successfully");
      setTargetToggleItem(null);
      await loadItems();
    } catch (error) {
      toast.error(getErrorMessage(error, "Cannot change package status"));
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
      toast.success("Package deleted from inventory successfully");
      setTargetDeleteItem(null);
      await loadInitialData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Cannot delete package from inventory"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "var(--background)", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <ManagementHeader
        title="Care Service Packages Management"
        description="Manage the care service packages currently being offered: add new ones from the system, enable/disable, and delete when there are no existing subscriptions."
        entityLabel="care service package"
        count={items.length}
        actionLabel="Add Package to Inventory"
        onAction={() => void openAddDialog()}
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Chip label={`Active: ${activeCount}`} color="success" variant="outlined" />
        <Chip label={`Inactive: ${items.length - activeCount}`} variant="outlined" />
        <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => void loadInitialData()}
          disabled={loading}
        >
          Reload
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
                  <TableCell sx={{ fontWeight: 700 }}>Package Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Visits/Week
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Duration (Days)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Unit Price
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      Inventory is currently empty.
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
                          label={item.isActive ? "Active" : "Inactive"}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={item.isActive ? "Deactivate Package" : "Activate Package"}>
                          <IconButton
                            size="small"
                            color={item.isActive ? "success" : "default"}
                            onClick={() => setTargetToggleItem(item)}
                          >
                            {item.isActive ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete from Inventory">
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
        <DialogTitle>Add Service Package</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth>
            <InputLabel id="care-package-select">Service Package not offered</InputLabel>
            <Select
              labelId="care-package-select"
              label="Service Package not offered"
              value={selectedPackageId}
              onChange={(event) => setSelectedPackageId(Number(event.target.value))}
              disabled={submitting}
            >
              <MenuItem value={0} disabled>
                Select a service package
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
              Currently, there are no active service packages available to add to the inventory.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => void handleAddPackage()}
            disabled={submitting || notOfferedPackages.length === 0}
            sx={{backgroundColor: 'var(--primary)'}}
          > 
            {submitting ? "Adding..." : "Add Package"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(targetToggleItem)} onClose={() => (submitting ? null : setTargetToggleItem(null))}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent dividers>
          Are you sure you want to {targetToggleItem?.isActive ? "disable" : "enable"} the package
          <strong> {targetToggleItem?.careServicePackage.name}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTargetToggleItem(null)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void handleConfirmToggle()} disabled={submitting}>
            {submitting ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(targetDeleteItem)} onClose={() => (submitting ? null : setTargetDeleteItem(null))}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent dividers>
          This action will only succeed if the package has no existing subscriptions. Are you sure you want to delete
          <strong> {targetDeleteItem?.careServicePackage.name}</strong> from the inventory?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTargetDeleteItem(null)} disabled={submitting}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={() => void handleConfirmDelete()} disabled={submitting}>
            {submitting ? "Deleting..." : "Delete from Inventory"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
