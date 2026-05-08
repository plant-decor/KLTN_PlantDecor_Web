'use client';

// import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  Box,
  // Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ManagementHeader from '@/components/layout/ManagementHeader';
import {
  getEligibleCaretakersForReassgiCaretaker,
  getNurseryScheduleByDate,
  getServiceProgressDetail,
  reassignServiceProgressCaretaker,
} from '@/lib/api/careServiceService';
import {
  assignDesignTask,
  getDesignTaskDetail,
  getEligibleCaretakersForDesignRegistration,
} from '@/lib/api/designRegistrationService';
import type { EligibleCaretaker, NurseryServiceScheduleItem, ServiceProgressDetail } from '@/types/care-service.types';
import type { DesignRegistrationTask, DesignEligibleCaretaker } from '@/types/design-registration.types';
import ManagerScheduleServicesTable from './ManagerScheduleServicesTable';
import ServiceProgressDetailDialog from './ServiceProgressDetailDialog';
import ServiceProgressReassignDialog from './ServiceProgressReassignDialog';
import DesignTaskDetailDialog from '@/components/design-registration/DesignTaskDetailDialog';

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

const toDateInputValue = (value: string | null | undefined, fallback: string): string => {
  const text = value?.trim() || '';
  if (!text) return fallback;
  if (text.includes('T')) return text.split('T')[0] || fallback;
  if (text.length >= 10) return text.slice(0, 10);
  return fallback;
};

const mapDesignCaretakerToEligibleCaretaker = (caretaker: DesignEligibleCaretaker): EligibleCaretaker => {
  return {
    id: caretaker.id,
    username: caretaker.username,
    email: caretaker.email,
    phoneNumber: caretaker.phoneNumber,
    avatarUrl: caretaker.avatarUrl,
    status: caretaker.status,
    specializations: caretaker.specializations.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
    })),
  };
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

  const [designDetailOpen, setDesignDetailOpen] = useState(false);
  const [designDetailLoading, setDesignDetailLoading] = useState(false);
  const [designDetailError, setDesignDetailError] = useState<string | null>(null);
  const [designDetail, setDesignDetail] = useState<DesignRegistrationTask | null>(null);

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
      const message = getErrorMessage(loadError, 'Cannot load nursery schedule by date');
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
    if (item.taskType === 'DesignService') {
      setDesignDetailOpen(true);
      setDesignDetailLoading(true);
      setDesignDetailError(null);

      try {
        const payload = await getDesignTaskDetail(item.id, false);
        console.log('payload', payload);
        setDesignDetail(payload);
      } catch (detailLoadError) {
        const message = getErrorMessage(detailLoadError, 'Cannot load design task detail');
        setDesignDetailError(message);
        setDesignDetail(null);
        toast.error(message);
      } finally {
        setDesignDetailLoading(false);
      }

      return;
    }

    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);

    try {
      const payload = await getServiceProgressDetail(item.id, false);
      setDetail(payload);
    } catch (detailLoadError) {
      const message = getErrorMessage(detailLoadError, 'Cannot load service progress detail');
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

  const closeDesignDetailDialog = () => {
    setDesignDetailOpen(false);
    setDesignDetailError(null);
    setDesignDetail(null);
  };

  const handleOpenReassign = async (item: NurseryServiceScheduleItem) => {
    setReassignOpen(true);
    setReassignTarget(item);
    setReassignLoading(true);
    setReassignError(null);
    setEligibleCaretakers([]);
    setSelectedCaretakerId(0);

    try {
      if (item.taskType === 'DesignService') {
        const designRegistrationId = item.serviceRegistration?.id;
        if (!designRegistrationId) {
          throw new Error('Cannot find design registration to fetch eligible staff');
        }

        const caretakers = await getEligibleCaretakersForDesignRegistration(designRegistrationId, false);
        const mapped = caretakers.map(mapDesignCaretakerToEligibleCaretaker);
        setEligibleCaretakers(mapped);
        if (mapped.length > 0) {
          setSelectedCaretakerId(mapped[0].id);
        }
      } else {
        if (!item.serviceRegistrationId) {
          throw new Error('Cannot find service registration to fetch eligible caretakers');
        }

        const caretakers = await getEligibleCaretakersForReassgiCaretaker(item.id, false);
        setEligibleCaretakers(caretakers);
        if (caretakers.length > 0) {
          setSelectedCaretakerId(caretakers[0].id);
        }
      }
    } catch (loadError) {
      const message = getErrorMessage(loadError, 'Cannot load list of eligible caretakers');
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

  const refreshDesignDetailIfNeeded = useCallback(
    async (designTaskId: number) => {
      if (!designDetailOpen || designDetail?.id !== designTaskId) {
        return;
      }

      try {
        const refreshed = await getDesignTaskDetail(designTaskId, false);
        setDesignDetail(refreshed);
      } catch {
        // Keep previous detail content if refresh fails.
      }
    },
    [designDetail, designDetailOpen]
  );

  const handleSubmitReassign = async () => {
    if (!reassignTarget?.id || !selectedCaretakerId) {
      toast.error('Please select a new caretaker');
      return;
    }

    try {
      setReassignSubmitting(true);
      if (reassignTarget.taskType === 'DesignService') {
        await assignDesignTask(
          reassignTarget.id,
          {
            assignedStaffId: selectedCaretakerId,
            scheduledDate: toDateInputValue(reassignTarget.taskDate, selectedDate),
          },
          false
        );
      } else {
        await reassignServiceProgressCaretaker(
          reassignTarget.id,
          {
            newCaretakerId: selectedCaretakerId,
          },
          false
        );
      }

      toast.success('Reassign caretaker successfully');
      closeReassignDialog();
      await Promise.all([
        fetchSchedule(selectedDate),
        refreshDetailIfNeeded(reassignTarget.id),
        refreshDesignDetailIfNeeded(reassignTarget.id),
      ]);
    } catch (submitError) {
      const message = getErrorMessage(submitError, 'Can not reassign caretaker');
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
          title='Schedule Services Management'
          description='View and manage scheduled care service sessions for the nursery.'
          entityLabel='scheduled sessions'
          count={items.length}
        />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 2 }}>
          <TextField
            label='Select Date'
            type='date'
            size='small'
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Typography variant='body2' color='text.secondary'>
            Default display schedule for today.
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

      <DesignTaskDetailDialog
        open={designDetailOpen}
        loading={designDetailLoading}
        error={designDetailError}
        detail={designDetail}
        onClose={closeDesignDetailDialog}
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
