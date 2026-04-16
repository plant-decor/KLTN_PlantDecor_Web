"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Paper } from "@mui/material";
import { toast } from "react-toastify";
import ManagementHeader from "@/components/layout/ManagementHeader";
import {
  getCaretakerScheduleByRange,
  getServiceProgressDetail,
} from "@/lib/api/careServiceService";
import {
  assignSpecializationToStaff,
  getActiveSpecializationsForStaff,
  getMyNurseryStaffDetail,
  getMyNurseryStaffList,
  replaceStaffSpecializations,
} from "@/lib/api/managerStoreUsersService";
import type { NurseryServiceScheduleItem, ServiceProgressDetail } from "@/types/care-service.types";
import type { StoreUserItem, StoreUserSpecializationOption } from "@/types/store-management.types";
import ServiceProgressDetailDialog from "@/components/service/schedule-services/ServiceProgressDetailDialog";
import CaretakerScheduleDrawer from "./CaretakerScheduleDrawer";
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

const toApiDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMonthRange = () => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    from: toApiDate(first),
    to: toApiDate(last),
  };
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

  const [scheduleDrawerOpen, setScheduleDrawerOpen] = useState(false);
  const [selectedCaretaker, setSelectedCaretaker] = useState<StoreUserItem | null>(null);
  const [scheduleItems, setScheduleItems] = useState<NurseryServiceScheduleItem[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleFromDate, setScheduleFromDate] = useState<string>(getMonthRange().from);
  const [scheduleToDate, setScheduleToDate] = useState<string>(getMonthRange().to);
  const [scheduleDetailOpen, setScheduleDetailOpen] = useState(false);
  const [scheduleDetailLoading, setScheduleDetailLoading] = useState(false);
  const [scheduleDetailError, setScheduleDetailError] = useState<string | null>(null);
  const [scheduleDetail, setScheduleDetail] = useState<ServiceProgressDetail | null>(null);

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

  const fetchCaretakerSchedule = useCallback(async (caretakerId: number, from: string, to: string) => {
    setScheduleLoading(true);
    setScheduleError(null);

    try {
      const payload = await getCaretakerScheduleByRange(caretakerId, from, to, false);
      setScheduleItems(payload);
    } catch (loadError) {
      const message = getErrorMessage(loadError, "Không thể tải lịch công việc caretaker");
      setScheduleError(message);
      setScheduleItems([]);
      toast.error(message);
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  const handleViewSchedule = (staffId: number) => {
    const caretaker = items.find((staff) => staff.id === staffId) ?? null;
    if (!caretaker) {
      toast.error("Không tìm thấy caretaker trong danh sách hiện tại");
      return;
    }

    const monthRange = getMonthRange();
    setSelectedCaretaker(caretaker);
    setScheduleDrawerOpen(true);
    setScheduleFromDate(monthRange.from);
    setScheduleToDate(monthRange.to);
    void fetchCaretakerSchedule(caretaker.id, monthRange.from, monthRange.to);
  };

  const closeScheduleDrawer = () => {
    setScheduleDrawerOpen(false);
    setSelectedCaretaker(null);
    setScheduleItems([]);
    setScheduleError(null);
  };

  const handleRefreshSchedule = () => {
    if (!selectedCaretaker) {
      return;
    }

    if (!scheduleFromDate || !scheduleToDate) {
      toast.error("Vui lòng chọn đầy đủ khoảng ngày");
      return;
    }

    if (scheduleFromDate > scheduleToDate) {
      toast.error("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
      return;
    }

    void fetchCaretakerSchedule(selectedCaretaker.id, scheduleFromDate, scheduleToDate);
  };

  const handleViewScheduleProgressDetail = async (serviceProgressId: number) => {
    setScheduleDetailOpen(true);
    setScheduleDetailLoading(true);
    setScheduleDetailError(null);

    try {
      const detailPayload = await getServiceProgressDetail(serviceProgressId, false);
      setScheduleDetail(detailPayload);
    } catch (detailLoadError) {
      const message = getErrorMessage(detailLoadError, "Không thể tải chi tiết phiên chăm sóc");
      setScheduleDetailError(message);
      setScheduleDetail(null);
      toast.error(message);
    } finally {
      setScheduleDetailLoading(false);
    }
  };

  const closeScheduleProgressDetailDialog = () => {
    setScheduleDetailOpen(false);
    setScheduleDetailError(null);
    setScheduleDetail(null);
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
          onViewSchedule={handleViewSchedule}
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

      <CaretakerScheduleDrawer
        open={scheduleDrawerOpen}
        caretaker={selectedCaretaker}
        fromDate={scheduleFromDate}
        toDate={scheduleToDate}
        loading={scheduleLoading}
        error={scheduleError}
        items={scheduleItems}
        onClose={closeScheduleDrawer}
        onChangeFromDate={setScheduleFromDate}
        onChangeToDate={setScheduleToDate}
        onRefresh={handleRefreshSchedule}
        onViewProgressDetail={handleViewScheduleProgressDetail}
      />

      <ServiceProgressDetailDialog
        open={scheduleDetailOpen}
        loading={scheduleDetailLoading}
        error={scheduleDetailError}
        detail={scheduleDetail}
        onClose={closeScheduleProgressDetailDialog}
      />
    </Box>
  );
}
