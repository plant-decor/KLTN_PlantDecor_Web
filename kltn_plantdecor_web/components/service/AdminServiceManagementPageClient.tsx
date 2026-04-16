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
} from "@/lib/api/adminCareServicePackagesService";
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
  type ModalMode,
  type ServicePackageFormValue,
} from "@/components/service/service-management/types";

export default function AdminServiceManagementPageClient() {
  const [packages, setPackages] = useState<AdminCareServicePackageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [serviceTypeOptions, setServiceTypeOptions] = useState<CareServiceTypeOption[]>([]);
  const [specializationOptions, setSpecializationOptions] = useState<AdminSpecializationOption[]>([]);

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

      const [listResult, enumResult, specializationResult] = await Promise.all([
        getAllAdminCareServicePackages(false),
        getCareServiceTypeOptions(false),
        getActiveSpecializations(false),
      ]);

      setPackages(listResult);
      setServiceTypeOptions(enumResult);
      setSpecializationOptions(specializationResult);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải dữ liệu quản lý gói dịch vụ");
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
        const message = getErrorMessage(error, "Không thể tải chi tiết gói dịch vụ");
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
    if (!formValue.name.trim()) return "Tên gói không được để trống";
    if (!formValue.description.trim()) return "Mô tả không được để trống";
    if (!formValue.features.trim()) return "Features không được để trống";
    if (!Number.isFinite(formValue.serviceType) || formValue.serviceType <= 0) return "Loại dịch vụ không hợp lệ";
    if (
      formValue.visitPerWeek !== null &&
      (!Number.isFinite(formValue.visitPerWeek) || formValue.visitPerWeek < 0)
    ) {
      return "Số lần/tuần không hợp lệ";
    }

    if (formValue.serviceType === 2 && (!formValue.visitPerWeek || formValue.visitPerWeek <= 0)) {
      return "Gói định kỳ cần số lần/tuần lớn hơn 0";
    }

    if (!Number.isFinite(formValue.durationDays) || formValue.durationDays <= 0) return "Thời lượng phải lớn hơn 0";
    if (!Number.isFinite(formValue.areaLimit) || formValue.areaLimit < 0) return "Diện tích không hợp lệ";
    if (!Number.isFinite(formValue.unitPrice) || formValue.unitPrice < 0) return "Đơn giá không hợp lệ";
    if (modalMode === "create" && formValue.specializationIds.length === 0) {
      return "Vui lòng chọn ít nhất một chuyên môn";
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
        const payload: AdminCareServicePackageCreateRequest = {
          name: formValue.name.trim(),
          description: formValue.description.trim(),
          features: formValue.features.trim(),
          serviceType: formValue.serviceType,
          visitPerWeek: formValue.visitPerWeek ?? 0,
          durationDays: formValue.durationDays,
          areaLimit: formValue.areaLimit,
          unitPrice: formValue.unitPrice,
          specializationIds: formValue.specializationIds,
        };

        await createAdminCareServicePackage(payload, false);
        toast.success("Tạo gói dịch vụ thành công");
      } else if (modalMode === "edit" && selectedId !== null) {
        const payload: AdminCareServicePackageUpdateRequest = {
          name: formValue.name.trim(),
          description: formValue.description.trim(),
          features: formValue.features.trim(),
          serviceType: formValue.serviceType,
          visitPerWeek: formValue.visitPerWeek ?? 0,
          durationDays: formValue.durationDays,
          areaLimit: formValue.areaLimit,
          unitPrice: formValue.unitPrice,
          isActive: formValue.isActive,
        };

        await updateAdminCareServicePackage(selectedId, payload, false);
        toast.success("Cập nhật gói dịch vụ thành công");
      }

      await loadPackages();
      closeModal();
    } catch (error) {
      const message = getErrorMessage(error, "Không thể lưu gói dịch vụ");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }, [closeModal, formValue, loadPackages, modalMode, selectedId, validateForm]);

  const handleDelete = async (id: number) => {
    try {
      await deleteAdminCareServicePackage(id, false);
      toast.success("Đã vô hiệu hóa gói dịch vụ");

      // Keep inactive rows visible by always syncing back to the server's /all response.
      await loadPackages();
    } catch (error) {
      const message = getErrorMessage(error, "Không thể vô hiệu hóa gói dịch vụ");
      toast.error(message);
    }
  };

  return (
    <Box sx={{ bgcolor: "var(--background)", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <ManagementHeader
        title="Quản lý gói dịch vụ"
        description="Quản trị toàn bộ gói dịch vụ chăm sóc, bao gồm xem chi tiết, tạo mới, cập nhật và vô hiệu hóa."
        entityLabel="gói"
        count={packages.length}
        actionLabel="Tạo gói mới"
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
        submitting={submitting}
        onClose={closeModal}
        onFormChange={(updater) => setFormValue(updater)}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
