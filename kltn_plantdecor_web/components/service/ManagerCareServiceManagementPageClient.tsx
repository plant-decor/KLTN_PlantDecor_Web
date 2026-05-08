"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { toast } from "react-toastify";
import ManagementHeader from "@/components/layout/ManagementHeader";
import { CustomLoading } from "@/components/CustomLoading";
import ServicePackageModal from "@/components/service/service-management/ServicePackageModal";
import { buildFormFromDetail, emptyFormValue, type ServicePackageFormValue } from "@/components/service/service-management/types";
import { getAdminCareServicePackageDetail, getCareServiceTypeOptions } from "@/lib/api/adminCareServicePackagesService";
import {
  addManagerPackageToNursery,
  deleteManagerNurseryCareService,
  getManagerNotOfferedPackages,
  getManagerNurseryCareServices,
  toggleManagerNurseryCareService,
} from "@/lib/api/careServiceService";
import type { AdminCareServicePackageDetail, CareServiceTypeOption } from "@/types/admin-service-package.types";
import type { CareServicePackage, NurseryCareService } from "@/types/care-service.types";
import { formatCurrency } from "@/lib/utils/formatUtil";

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
  const [serviceTypeOptions, setServiceTypeOptions] = useState<CareServiceTypeOption[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<number>(0);
  const [targetToggleItem, setTargetToggleItem] = useState<NurseryCareService | null>(null);
  const [targetDeleteItem, setTargetDeleteItem] = useState<NurseryCareService | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailPackageId, setDetailPackageId] = useState<number | null>(null);
  const [packageDetail, setPackageDetail] = useState<AdminCareServicePackageDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailFormValue, setDetailFormValue] = useState<ServicePackageFormValue>(emptyFormValue);

  const closePackageDetailDialog = useCallback(() => {
    setDetailModalOpen(false);
    setDetailPackageId(null);
    setPackageDetail(null);
    setDetailError(null);
    setDetailLoading(false);
    setDetailFormValue(emptyFormValue);
  }, []);

  const handleViewPackageDetail = useCallback(async (item: NurseryCareService) => {
    const id = item.careServicePackage.id;
    setDetailModalOpen(true);
    setDetailPackageId(id);
    setPackageDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    setDetailFormValue(emptyFormValue);
    try {
      const detail = await getAdminCareServicePackageDetail(id, false);
      setPackageDetail(detail);
      setDetailFormValue(buildFormFromDetail(detail));
    } catch (error) {
      const message = getErrorMessage(error, "Cannot load service package details");
      setDetailError(message);
      toast.error(message);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const serviceTypeLabelMap = useMemo(() => {
    const map = new Map<number, string>();
    serviceTypeOptions.forEach((option) => map.set(option.value, option.label));
    return map;
  }, [serviceTypeOptions]);

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
      const [myServices, availablePackages, serviceTypeEnums] = await Promise.all([
        getManagerNurseryCareServices(false),
        getManagerNotOfferedPackages(false),
        getCareServiceTypeOptions(false),
      ]);

      setItems(myServices);
      setNotOfferedPackages(availablePackages.filter((item) => item.isActive));
      setServiceTypeOptions(serviceTypeEnums);
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
    <Box>
      <ManagementHeader
        title="Care Service Packages Management"
        description="Manage the care service packages currently being offered: add new ones from the system, enable/disable, and delete when there are no existing subscriptions."
        entityLabel="care service package"
        count={items.length}
        actionLabel="Add Package to Inventory"
        onAction={() => void openAddDialog()}
      />

      {pageError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPageError(null)}>
          {pageError}
        </Alert>
      )}

      <Paper sx={{ border: "1px solid var(--card-border)", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CustomLoading />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "var(--primary)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Package Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Visits/Week
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Duration (Days)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
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
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {item.careServicePackage.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.careServicePackage.description}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {serviceTypeLabelMap.get(item.careServicePackage.serviceType) ||
                          `Loại ${item.careServicePackage.serviceType}`}
                      </TableCell>
                      <TableCell align="center">{item.careServicePackage.visitPerWeek}</TableCell>
                      <TableCell align="center">{item.careServicePackage.durationDays}</TableCell>
                      <TableCell align="center">{formatCurrency(item.careServicePackage.unitPrice, 'vi-VN')}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          color={item.isActive ? "success" : "default"}
                          label={item.isActive ? "Active" : "Inactive"}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                          <Tooltip title="View package detail">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => void handleViewPackageDetail(item)}
                              aria-label="View care service package detail"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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
                        </Stack>
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
                  {item.name} - {formatCurrency(item.unitPrice, 'vi-VN')}
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
          <Button className="bg-primary!" variant="contained" onClick={() => void handleConfirmToggle()} disabled={submitting}>
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

      <ServicePackageModal
        open={detailModalOpen}
        mode="view"
        packageId={detailPackageId}
        detail={packageDetail}
        detailLoading={detailLoading}
        detailError={detailError}
        formValue={detailFormValue}
        serviceTypeOptions={serviceTypeOptions}
        specializationOptions={[]}
        categoryOptions={[]}
        careLevelOptions={[]}
        submitting={false}
        onClose={closePackageDetailDialog}
        onFormChange={(updater) => setDetailFormValue(updater)}
        onSubmit={async () => {}}
      />
    </Box>
  );
}
