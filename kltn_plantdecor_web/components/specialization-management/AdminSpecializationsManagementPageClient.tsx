"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { toast } from "react-toastify";
import ManagementHeader from "@/components/layout/ManagementHeader";
import {
  createAdminSpecialization,
  deleteAdminSpecialization,
  getAdminSpecializationDetail,
  getAllAdminSpecializations,
  updateAdminSpecialization,
} from "@/lib/api/adminSpecializationsService";
import type {
  AdminSpecializationDetail,
  AdminSpecializationListItem,
  AdminSpecializationCreateRequest,
  AdminSpecializationUpdateRequest,
} from "@/types/admin-specialization.types";
import SpecializationModal from "./specializations-management/SpecializationModal";
import SpecializationTable from "./specializations-management/SpecializationTable";
import {
  emptySpecializationFormValue,
  getSpecializationErrorMessage,
  type SpecializationFormValue,
  type SpecializationModalMode,
} from "./specializations-management/types";

export default function AdminSpecializationsManagementPageClient() {
  const [specializations, setSpecializations] = useState<AdminSpecializationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<SpecializationModalMode>("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AdminSpecializationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminSpecializationListItem | null>(null);
  const [formValue, setFormValue] = useState<SpecializationFormValue>(emptySpecializationFormValue());

  const activeCount = useMemo(() => specializations.filter((item) => item.isActive).length, [specializations]);

  const loadSpecializations = useCallback(async () => {
    const response = await getAllAdminSpecializations(false);
    setSpecializations(response);
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setPageError(null);
      const listResult = await getAllAdminSpecializations(false);
      setSpecializations(listResult);
    } catch (error) {
      const message = getSpecializationErrorMessage(error, "Cannot load specialization list");
      setPageError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedId(null);
    setDetail(null);
    setDetailError(null);
    setFormValue(emptySpecializationFormValue());
    setModalOpen(true);
  };

  const openExistingModal = (mode: Exclude<SpecializationModalMode, "create">, id: number) => {
    setModalMode(mode);
    setSelectedId(id);
    setDetail(null);
    setDetailError(null);
    setFormValue(emptySpecializationFormValue());
    setModalOpen(true);
  };

  useEffect(() => {
    const shouldFetchDetail = modalOpen && selectedId !== null && (modalMode === "view" || modalMode === "edit");

    if (!shouldFetchDetail) {
      return;
    }

    const fetchDetail = async () => {
      try {
        setDetailLoading(true);
        setDetailError(null);
        const latestDetail = await getAdminSpecializationDetail(selectedId, false);
        setDetail(latestDetail);
        setFormValue({
          name: latestDetail.name,
          description: latestDetail.description,
          isActive: latestDetail.isActive,
        });
      } catch (error) {
        const message = getSpecializationErrorMessage(error, "Can not load specialization detail");
        setDetailError(message);
        toast.error(message);
      } finally {
        setDetailLoading(false);
      }
    };

    void fetchDetail();
  }, [modalOpen, modalMode, selectedId]);

  const closeModal = useCallback(() => {
    if (submitting) {
      return;
    }

    setModalOpen(false);
    setSelectedId(null);
    setDetail(null);
    setDetailError(null);
  }, [submitting]);

  const validateForm = useCallback((): string | null => {
    if (!formValue.name.trim()) return "Specialization name is required";
    if (!formValue.description.trim()) return "Description is required";
    return null;
  }, [formValue.description, formValue.name]);

  const handleSubmit = useCallback(async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSubmitting(true);

      if (modalMode === "create") {
        const payload: AdminSpecializationCreateRequest = {
          name: formValue.name.trim(),
          description: formValue.description.trim(),
        };

        await createAdminSpecialization(payload, false);
      } else if (modalMode === "edit" && selectedId !== null) {
        const payload: AdminSpecializationUpdateRequest = {
          name: formValue.name.trim(),
          description: formValue.description.trim(),
          isActive: formValue.isActive,
        };

        await updateAdminSpecialization(selectedId, payload, false);
        // toast.success("Cập nhật chuyên môn thành công");
      }

      await loadSpecializations();
      closeModal();
    } catch (error) {
      const message = getSpecializationErrorMessage(error, "Can not submit specialization data");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }, [closeModal, formValue, loadSpecializations, modalMode, selectedId, validateForm]);

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setSubmitting(true);
      await deleteAdminSpecialization(deleteTarget.id, false);
      toast.success("Successfully soft-deleted specialization");
      await loadSpecializations();
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      const message = getSpecializationErrorMessage(error, "Cannot soft-delete specialization");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "var(--background)", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <ManagementHeader
        title="Specializations Management"
        description="Manage the specializations that can be associated with care service packages."
        entityLabel="Specializations"
        count={specializations.length}
        actionLabel="Create Specialization"
        onAction={openCreateModal}
      />

      <Box className="mb-4 flex flex-wrap gap-3">
        <Box className="rounded-xl border border-(--card-border) bg-(--color-background) px-4 py-3 shadow-sm">
          <Typography variant="body2" color="text.secondary">
            Total Specializations
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary">
            {specializations.length}
          </Typography>
        </Box>
        <Box className="rounded-xl border border-(--card-border) bg-(--color-background) px-4 py-3 shadow-sm">
          <Typography variant="body2" color="text.secondary">
            Active Specializations
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary">
            {activeCount}
          </Typography>
        </Box>
      </Box>

      {pageError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPageError(null)}>
          {pageError}
        </Alert>
      )}

      <SpecializationTable
        specializations={specializations}
        loading={loading}
        onView={(id) => openExistingModal("view", id)}
        onEdit={(id) => openExistingModal("edit", id)}
        onDelete={(id) => {
          const target = specializations.find((item) => item.id === id) ?? null;
          setDeleteTarget(target);
          setDeleteDialogOpen(true);
        }}
      />

      <SpecializationModal
        open={modalOpen}
        mode={modalMode}
        specializationId={selectedId}
        detail={detail}
        detailLoading={detailLoading}
        detailError={detailError}
        formValue={formValue}
        submitting={submitting}
        onClose={closeModal}
        onFormChange={setFormValue}
        onSubmit={handleSubmit}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent dividers>
          Are you sure you want to delete the specialization <strong>{deleteTarget?.name ?? ""}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={() => void handleDelete()} color="error" variant="contained" disabled={submitting}>
            {submitting ? "Processing..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
