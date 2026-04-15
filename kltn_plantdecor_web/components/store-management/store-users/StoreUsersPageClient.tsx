"use client";

import { useCallback, useEffect, useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import { toast } from "react-toastify";
import ManagementHeader from "@/components/layout/ManagementHeader";
import {
  assignSpecializationToStaff,
  getActiveSpecializationsForStaff,
  getMyNurseryStaffDetail,
  getMyNurseryStaffList,
  replaceStaffSpecializations,
} from "@/lib/api/managerStoreUsersService";
import type { StoreUserItem, StoreUserSpecializationOption } from "@/types/store-management.types";
import StoreUserDetailDialog from "./StoreUserDetailDialog";
import StoreUsersTable from "./StoreUsersTable";

interface PaginationState {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

const DEFAULT_PAGINATION: PaginationState = {
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const candidate = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return candidate.response?.data?.message || candidate.message || fallback;
};

export default function StoreUsersPageClient() {
  const [items, setItems] = useState<StoreUserItem[]>([]);
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<StoreUserItem | null>(null);

  const [specializationOptions, setSpecializationOptions] = useState<StoreUserSpecializationOption[]>([]);
  const [selectedSpecializationIds, setSelectedSpecializationIds] = useState<number[]>([]);

  const fetchList = useCallback(async (nextPage: number, nextSize: number) => {
    setLoading(true);
    setError(null);

    try {
      const payload = await getMyNurseryStaffList({ pageNumber: nextPage, pageSize: nextSize }, false);
      setItems(payload.items);
      setPagination({
        pageNumber: payload.pageNumber,
        pageSize: payload.pageSize,
        totalCount: payload.totalCount,
      });
    } catch (loadError) {
      const message = getErrorMessage(loadError, "Không thể tải danh sách nhân viên");
      setError(message);
      setItems([]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetail = useCallback(async (staffId: number) => {
    setDetailLoading(true);
    setDetailError(null);

    try {
      const [staffDetail, options] = await Promise.all([
        getMyNurseryStaffDetail(staffId, false),
        getActiveSpecializationsForStaff(false),
      ]);

      setDetailItem(staffDetail);
      setSelectedSpecializationIds(staffDetail.specializations.map((item) => item.id));
      setSpecializationOptions(options);
    } catch (detailFetchError) {
      const message = getErrorMessage(detailFetchError, "Không thể tải chi tiết nhân viên");
      setDetailError(message);
      setDetailItem(null);
      toast.error(message);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const fetchSpecializationOptions = useCallback(async () => {
    try {
      const options = await getActiveSpecializationsForStaff(false);
      setSpecializationOptions(options);
    } catch (optionsError) {
      toast.error(getErrorMessage(optionsError, "Không thể tải danh sách chuyên môn"));
      setSpecializationOptions([]);
    }
  }, []);

  useEffect(() => {
    void fetchList(DEFAULT_PAGINATION.pageNumber, DEFAULT_PAGINATION.pageSize);
    void fetchSpecializationOptions();
  }, [fetchList, fetchSpecializationOptions]);

  const handleRefresh = () => {
    void fetchList(pagination.pageNumber, pagination.pageSize);
  };

  const handleViewDetail = (staffId: number) => {
    setDetailOpen(true);
    void fetchDetail(staffId);
  };

  const closeDetailDialog = () => {
    if (submitting) {
      return;
    }

    setDetailOpen(false);
    setDetailError(null);
    setDetailItem(null);
    setSelectedSpecializationIds([]);
  };

  const handleToggleSpecialization = (specializationId: number) => {
    setSelectedSpecializationIds((prev) => {
      if (prev.includes(specializationId)) {
        return prev.filter((id) => id !== specializationId);
      }
      return [...prev, specializationId];
    });
  };

  const refreshDetailAndList = async (staffId: number) => {
    const [refreshedDetail] = await Promise.all([
      getMyNurseryStaffDetail(staffId, false),
      fetchList(pagination.pageNumber, pagination.pageSize),
    ]);

    setDetailItem(refreshedDetail);
    setSelectedSpecializationIds(refreshedDetail.specializations.map((item) => item.id));
  };

  const handleAssignQuick = async (staffId: number, specializationId: number) => {
    if (!staffId || !specializationId) {
      toast.error("Vui lòng chọn nhân viên và chuyên môn để gán nhanh");
      return;
    }

    try {
      setSubmitting(true);
      await assignSpecializationToStaff(staffId, { specializationId }, false);

      if (detailOpen && detailItem?.id === staffId) {
        await refreshDetailAndList(staffId);
      } else {
        await fetchList(pagination.pageNumber, pagination.pageSize);
      }

      toast.success("Gán chuyên môn thành công");
    } catch (assignError) {
      toast.error(getErrorMessage(assignError, "Không thể gán chuyên môn"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAllSpecializations = async () => {
    if (!detailItem) {
      return;
    }

    try {
      setSubmitting(true);
      await replaceStaffSpecializations(
        detailItem.id,
        {
          specializationIds: selectedSpecializationIds,
        },
        false
      );
      await refreshDetailAndList(detailItem.id);
      toast.success("Cập nhật danh sách chuyên môn thành công");
    } catch (saveError) {
      toast.error(getErrorMessage(saveError, "Không thể cập nhật danh sách chuyên môn"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        <ManagementHeader
          title="Người dùng cửa hàng"
          description="Quản lý danh sách nhân viên chăm sóc của vựa và chuyên môn tương ứng"
          entityLabel="nhân viên chăm sóc"
          count={pagination.totalCount}
          onAction={handleRefresh}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <StoreUsersTable
          items={items}
          specializationOptions={specializationOptions}
          pageNumber={pagination.pageNumber}
          pageSize={pagination.pageSize}
          totalCount={pagination.totalCount}
          loading={loading}
          onViewDetail={handleViewDetail}
          onQuickAssign={handleAssignQuick}
          onChangePage={(_event, nextPage) => {
            void fetchList(nextPage + 1, pagination.pageSize);
          }}
          onChangeRowsPerPage={(nextPageSize) => {
            void fetchList(1, nextPageSize);
          }}
        />
      </Paper>

      <StoreUserDetailDialog
        open={detailOpen}
        loading={detailLoading}
        submitting={submitting}
        staff={detailItem}
        specializations={specializationOptions}
        selectedSpecializationIds={selectedSpecializationIds}
        error={detailError}
        onClose={closeDetailDialog}
        onToggleSpecialization={handleToggleSpecialization}
        onSaveAll={handleSaveAllSpecializations}
      />
    </Box>
  );
}
