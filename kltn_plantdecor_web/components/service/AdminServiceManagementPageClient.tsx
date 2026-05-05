"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box } from "@mui/material";
import { toast } from "react-toastify";
import {
  createAdminCareServicePackage,
  deleteAdminCareServicePackage,
  getActiveSpecializations,
  getAdminCareServicePackageDetail,
  getAllAdminCareServicePackages,
  getCareServiceTypeOptions,
  updateAdminCareServicePackage,
  updateAdminCareServicePackageSpecializations,
  updateAdminCareServicePackageSuitabilityRules,
} from "@/lib/api/adminCareServicePackagesService";
import { getCategoriesByType, type CategoryResponse } from "@/lib/api/categoriesService";
import { getSystemEnumValues } from "@/lib/api/careServiceService";
import type { EnumOption } from "@/types/care-service.types";
import type {
  AdminCareServicePackageCreateRequest,
  AdminCareServicePackageDetail,
  AdminCareServicePackageListItem,
  AdminCareServicePackageUpdateRequest,
  AdminSpecializationOption,
  CareServiceTypeOption,
} from "@/types/admin-service-package.types";
import ManagementHeader from "@/components/layout/ManagementHeader";
import ServicePackageModal from "@/components/service/service-management/ServicePackageModal";
import ServicePackageTable from "@/components/service/service-management/ServicePackageTable";
import {
  buildFormFromDetail,
  emptyFormValue,
  getErrorMessage,
  MAX_VISITS_PER_WEEK,
  type ModalMode,
  type ServicePackageFormValue,
} from "@/components/service/service-management/types";

export default function AdminServiceManagementPageClient() {
  const [packages, setPackages] = useState<AdminCareServicePackageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [serviceTypeOptions, setServiceTypeOptions] = useState<CareServiceTypeOption[]>([]);
  const [specializationOptions, setSpecializationOptions] = useState<AdminSpecializationOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryResponse[]>([]);
  const [careLevelOptions, setCareLevelOptions] = useState<EnumOption[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AdminCareServicePackageDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formValue, setFormValue] = useState<ServicePackageFormValue>(emptyFormValue);

  const serviceTypeLabelMap = useMemo(() => {
    const map = new Map<number, string>();
    serviceTypeOptions.forEach((option) => map.set(option.value, option.label));
    return map;
  }, [serviceTypeOptions]);

  const loadPackages = useCallback(async () => {
    const response = await getAllAdminCareServicePackages(false);
    setPackages(response);
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setPageError(null);

      const [listResult, enumResult, specializationResult, categoryResult, careLevelResult] = await Promise.all([
        getAllAdminCareServicePackages(false),
        getCareServiceTypeOptions(false),
        getActiveSpecializations(false),
        getCategoriesByType({ categoryType: 1, activeOnly: true }, false),
        getSystemEnumValues("CareLevelType", false),
      ]);

      setPackages(listResult);
      setServiceTypeOptions(enumResult);
      setSpecializationOptions(specializationResult);
      const categoryPayload = categoryResult.payload ?? (categoryResult as unknown as { data?: CategoryResponse[] }).data ?? [];
      setCategoryOptions(Array.isArray(categoryPayload) ? categoryPayload : []);
      setCareLevelOptions(Array.isArray(careLevelResult) ? careLevelResult : []);
    } catch (error) {
      const message = getErrorMessage(error, "Failed to load service package management data");
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
    setFormValue({
      ...emptyFormValue,
      serviceType: serviceTypeOptions[0]?.value ?? 0,
      isActive: true,
      specializationIds: [],
    });
    setModalOpen(true);
  };

  const openExistingModal = (mode: "view" | "edit", id: number) => {
    setModalMode(mode);
    setSelectedId(id);
    setDetail(null);
    setDetailError(null);
    setFormValue(emptyFormValue);
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
        const latestDetail = await getAdminCareServicePackageDetail(selectedId, false);

        setDetail(latestDetail);
        setFormValue(buildFormFromDetail(latestDetail));
      } catch (error) {
        const message = getErrorMessage(error, "Failed to load service package details");
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
    if (!formValue.name.trim()) return "Package name is required";
    if (!formValue.description.trim()) return "Description is required";
    if (!formValue.features.trim()) return "Features are required";
    if (!Number.isFinite(formValue.serviceType) || formValue.serviceType <= 0) return "Invalid service type";
    if (
      formValue.visitPerWeek !== null &&
      (!Number.isFinite(formValue.visitPerWeek) || formValue.visitPerWeek < 0)
    ) {
      return "Visits per week is invalid";
    }

    if (
      formValue.visitPerWeek !== null &&
      Number.isFinite(formValue.visitPerWeek) &&
      formValue.visitPerWeek > MAX_VISITS_PER_WEEK
    ) {
      return `Visits per week cannot exceed ${MAX_VISITS_PER_WEEK}`;
    }

    if (formValue.serviceType === 2 && (!formValue.visitPerWeek || formValue.visitPerWeek <= 0)) {
      return "Recurring packages require visits per week greater than 0";
    }

    if (!Number.isFinite(formValue.durationDays) || formValue.durationDays <= 0) return "Duration must be greater than 0";
    if (!Number.isFinite(formValue.areaLimit) || formValue.areaLimit < 0) return "Area limit is invalid";
    if (!Number.isFinite(formValue.unitPrice) || formValue.unitPrice < 0) return "Unit price is invalid";
    if ((modalMode === "create" || modalMode === "edit") && formValue.specializationIds.length === 0) {
      return "Please select at least one specialization";
    }

    return null;
  }, [formValue, modalMode]);

  const handleSubmit = useCallback(async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSubmitting(true);

      if (modalMode === "create") {
        const suitabilityRules =
          formValue.categoryIds.length > 0
            ? formValue.categoryIds.map((categoryId) => ({ categoryId }))
            : formValue.careDifficultyLevels.length > 0
              ? formValue.careDifficultyLevels.map((careDifficultyLevel) => ({ careDifficultyLevel }))
              : [];

        const payload: AdminCareServicePackageCreateRequest = {
          name: formValue.name.trim(),
          description: formValue.description.trim(),
          features: formValue.features.trim(),
          serviceType: formValue.serviceType,
          visitPerWeek: formValue.serviceType === 1 ? 1 : (formValue.visitPerWeek ?? 0),
          durationDays: formValue.serviceType === 1 ? 1 : formValue.durationDays,
          areaLimit: formValue.areaLimit,
          unitPrice: formValue.unitPrice,
          specializationIds: formValue.specializationIds,
          suitabilityRules,
        };

        await createAdminCareServicePackage(payload, false);
        // toast.success("Service package created successfully");
      } else if (modalMode === "edit" && selectedId !== null) {
        const payload: AdminCareServicePackageUpdateRequest = {
          name: formValue.name.trim(),
          description: formValue.description.trim(),
          features: formValue.features.trim(),
          serviceType: formValue.serviceType,
          visitPerWeek: formValue.serviceType === 1 ? 1 : (formValue.visitPerWeek ?? 0),
          durationDays: formValue.serviceType === 1 ? 1 : formValue.durationDays,
          areaLimit: formValue.areaLimit,
          unitPrice: formValue.unitPrice,
          isActive: formValue.isActive,
        };

        const suitabilityRules =
          formValue.categoryIds.length > 0
            ? formValue.categoryIds.map((categoryId) => ({ categoryId }))
            : formValue.careDifficultyLevels.length > 0
              ? formValue.careDifficultyLevels.map((careDifficultyLevel) => ({ careDifficultyLevel }))
              : [];

        await updateAdminCareServicePackage(selectedId, payload, false);
        await updateAdminCareServicePackageSpecializations(selectedId, formValue.specializationIds, false);
        if (suitabilityRules.length > 0) {
          await updateAdminCareServicePackageSuitabilityRules(selectedId, suitabilityRules, false);
        }
        // toast.success("Service package updated successfully");
      }

      await loadPackages();
      closeModal();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save package");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }, [closeModal, formValue, loadPackages, modalMode, selectedId, validateForm]);

  const handleDelete = async (id: number) => {
    try {
      await deleteAdminCareServicePackage(id, false);
      toast.success("Package deactivated successfully");

      // Keep inactive rows visible by always syncing back to the server's /all response.
      await loadPackages();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to deactivate package");
      toast.error(message);
    }
  };

  return (
    <Box sx={{ bgcolor: "var(--background)", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <ManagementHeader
        title="Service Package Management"
        description="Manage all care service packages, including viewing details, creating, updating, and deactivating."
        entityLabel="package"
        count={packages.length}
        actionLabel="Create Package"
        onAction={openCreateModal}
      />

      {pageError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPageError(null)}>
          {pageError}
        </Alert>
      )}

      <ServicePackageTable
        packages={packages}
        loading={loading}
        serviceTypeLabelMap={serviceTypeLabelMap}
        onView={(id) => openExistingModal("view", id)}
        onEdit={(id) => openExistingModal("edit", id)}
        onDelete={handleDelete}
      />

      <ServicePackageModal
        open={modalOpen}
        mode={modalMode}
        packageId={selectedId}
        detail={detail}
        detailLoading={detailLoading}
        detailError={detailError}
        formValue={formValue}
        serviceTypeOptions={serviceTypeOptions}
        specializationOptions={specializationOptions}
        categoryOptions={categoryOptions}
        careLevelOptions={careLevelOptions}
        submitting={submitting}
        onClose={closeModal}
        onFormChange={(updater) => setFormValue(updater)}
        onSubmit={handleSubmit}
        onRequestEdit={() => {
          if (selectedId === null || submitting) return;
          setModalMode("edit");
        }}
      />
    </Box>
  );
}
