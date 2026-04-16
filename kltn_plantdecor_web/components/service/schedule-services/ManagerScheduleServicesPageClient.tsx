'use client';

import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ManagementHeader from '@/components/layout/ManagementHeader';
import {
  getEligibleCaretakersForServiceRegistration,
  getNurseryScheduleByDate,
  getServiceProgressDetail,
  reassignServiceProgressCaretaker,
} from '@/lib/api/careServiceService';
import type { EligibleCaretaker, NurseryServiceScheduleItem, ServiceProgressDetail } from '@/types/care-service.types';
import ManagerScheduleServicesTable from './ManagerScheduleServicesTable';
import ServiceProgressDetailDialog from './ServiceProgressDetailDialog';
import ServiceProgressReassignDialog from './ServiceProgressReassignDialog';

const toApiDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const candidate = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return candidate.response?.data?.message || candidate.message || fallback;
};

export default function ManagerScheduleServicesPageClient() {
  const [selectedDate, setSelectedDate] = useState<string>(toApiDate(new Date()));
  const [items, setItems] = useState<NurseryServiceScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detail, setDetail] = useState<ServiceProgressDetail | null>(null);

  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignLoading, setReassignLoading] = useState(false);
  const [reassignSubmitting, setReassignSubmitting] = useState(false);
  const [reassignError, setReassignError] = useState<string | null>(null);
  const [reassignTarget, setReassignTarget] = useState<NurseryServiceScheduleItem | null>(null);
  const [eligibleCaretakers, setEligibleCaretakers] = useState<EligibleCaretaker[]>([]);
  const [selectedCaretakerId, setSelectedCaretakerId] = useState<number>(0);

  const fetchSchedule = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);

    try {
      const payload = await getNurseryScheduleByDate(date, false);
      setItems(payload);
    } catch (loadError) {
      const message = getErrorMessage(loadError, 'Không thể tải lịch chăm sóc theo ngày');
      setError(message);
      setItems([]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSchedule(selectedDate);
  }, [fetchSchedule, selectedDate]);

  const handleViewDetail = async (item: NurseryServiceScheduleItem) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);

    try {
      const payload = await getServiceProgressDetail(item.id, false);
      setDetail(payload);
    } catch (detailLoadError) {
      const message = getErrorMessage(detailLoadError, 'Không thể tải chi tiết phiên chăm sóc');
      setDetailError(message);
      setDetail(null);
      toast.error(message);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailDialog = () => {
    setDetailOpen(false);
    setDetailError(null);
    setDetail(null);
  };

  const handleOpenReassign = async (item: NurseryServiceScheduleItem) => {
    if (!item.serviceRegistrationId) {
      toast.error('Không tìm thấy service registration để lấy caretaker đủ điều kiện');
      return;
    }

    setReassignOpen(true);
    setReassignTarget(item);
    setReassignLoading(true);
    setReassignError(null);
    setEligibleCaretakers([]);
    setSelectedCaretakerId(0);

    try {
      const caretakers = await getEligibleCaretakersForServiceRegistration(item.serviceRegistrationId, false);
      setEligibleCaretakers(caretakers);
      if (caretakers.length > 0) {
        setSelectedCaretakerId(caretakers[0].id);
      }
    } catch (loadError) {
      const message = getErrorMessage(loadError, 'Không thể tải danh sách caretaker đủ điều kiện');
      setReassignError(message);
      toast.error(message);
    } finally {
      setReassignLoading(false);
    }
  };

  const closeReassignDialog = () => {
    if (reassignSubmitting) {
      return;
    }

    setReassignOpen(false);
    setReassignError(null);
    setReassignTarget(null);
    setSelectedCaretakerId(0);
    setEligibleCaretakers([]);
  };

  const refreshDetailIfNeeded = useCallback(
    async (serviceProgressId: number) => {
      if (!detailOpen || detail?.id !== serviceProgressId) {
        return;
      }

      try {
        const refreshed = await getServiceProgressDetail(serviceProgressId, false);
        setDetail(refreshed);
      } catch {
        // Keep previous detail content if refresh fails.
      }
    },
    [detail, detailOpen]
  );

  const handleSubmitReassign = async () => {
    if (!reassignTarget?.id || !selectedCaretakerId) {
      toast.error('Vui lòng chọn caretaker mới');
      return;
    }

    try {
      setReassignSubmitting(true);
      await reassignServiceProgressCaretaker(
        reassignTarget.id,
        {
          newCaretakerId: selectedCaretakerId,
        },
        false
      );

      toast.success('Chuyển caretaker thành công');
      closeReassignDialog();
      await Promise.all([fetchSchedule(selectedDate), refreshDetailIfNeeded(reassignTarget.id)]);
    } catch (submitError) {
      const message = getErrorMessage(submitError, 'Không thể chuyển caretaker cho phiên chăm sóc');
      setReassignError(message);
      toast.error(message);
    } finally {
      setReassignSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        <ManagementHeader
          title='Lịch chăm sóc dịch vụ'
          description='Theo dõi lịch chăm sóc toàn vựa theo ngày và xử lý chuyển caretaker khi cần'
          entityLabel='phiên chăm sóc'
          count={items.length}
        />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 2 }}>
          <TextField
            label='Chọn ngày'
            type='date'
            size='small'
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant='outlined'
            startIcon={<RefreshIcon />}
            onClick={() => void fetchSchedule(selectedDate)}
            sx={{ width: { xs: '100%', md: 'fit-content' } }}
          >
            Tải lại
          </Button>
          <Typography variant='body2' color='text.secondary'>
            Mặc định hiển thị lịch của ngày hôm nay.
          </Typography>
        </Stack>

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <ManagerScheduleServicesTable
          items={items}
          loading={loading}
          onViewDetail={handleViewDetail}
          onReassign={handleOpenReassign}
        />
      </Paper>

      <ServiceProgressDetailDialog
        open={detailOpen}
        loading={detailLoading}
        error={detailError}
        detail={detail}
        onClose={closeDetailDialog}
      />

      <ServiceProgressReassignDialog
        open={reassignOpen}
        loading={reassignLoading}
        submitting={reassignSubmitting}
        error={reassignError}
        selectedCaretakerId={selectedCaretakerId}
        target={reassignTarget}
        caretakers={eligibleCaretakers}
        onChangeCaretakerId={setSelectedCaretakerId}
        onClose={closeReassignDialog}
        onSubmit={() => void handleSubmitReassign()}
      />
    </Box>
  );
}
