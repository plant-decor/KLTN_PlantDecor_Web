'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-toastify';
import { CustomLoading } from '@/components/CustomLoading';
import {
  approveManagerServiceRegistration,
  assignCaretakerToManagerServiceRegistration,
  getEligibleCaretakersForServiceRegistration,
  getManagerNurseryServiceRegistrationDetail,
  getManagerNurseryServiceRegistrations,
  getPublicShifts,
  getSystemEnumValues,
  managerCancelServiceRegistration,
  rejectManagerServiceRegistration,
  rescheduleManagerServiceRegistration,
} from '@/lib/api/careServiceService';
import {
  assignDesignTask,
  approveDesignRegistration,
  buildDesignFlowLabelMap,
  getDesignFlowEnums,
  getDesignTasksByRegistration,
  getEligibleCaretakersForDesignRegistration,
  getEligibleCaretakersWithAvailabilityForDesignRegistration,
  getNurseryDesignRegistrationDetail,
  getNurseryDesignRegistrations,
  managerCancelDesignRegistration,
  rejectDesignRegistration,
} from '@/lib/api/designRegistrationService';
import type { CustomerDesignRegistrationDetail, CustomerDesignRegistrationListItem, DesignEligibleCaretaker, DesignEligibleCaretakerAvailability, DesignFlowEnumGroup, DesignRegistrationTask } from '@/types/design-registration.types';
import type { EligibleCaretaker, EnumOption, ManagerServiceRegistration, PublicShift } from '@/types/care-service.types';
import {
  ALL_STATUS_FILTER,
  buildServiceStatusLabelMap,
  buildServiceStatusOptions,
  getErrorMessage,
  type ServiceStatusOption,
  type ServiceStatusFilterValue,
} from './managerServiceOrders.constants';
import ServiceOrdersHeader from './ServiceOrdersHeader';
import ServiceOrdersTable from './ServiceOrdersTable';
import ServiceOrderDetailDialog from './ServiceOrderDetailDialog';
import ServiceOrderApproveDialog from './ServiceOrderApproveDialog';
import ServiceOrderRejectDialog from './ServiceOrderRejectDialog';
import ServiceOrderCancelDialog from './ServiceOrderCancelDialog';
import ServiceOrderAssignDialog from './ServiceOrderAssignDialog';
import ServiceOrderRescheduleDialog, { type ServiceOrderRescheduleValues } from './ServiceOrderRescheduleDialog';
import ManagementHeader from '@/components/layout/ManagementHeader';
import { formatCurrency } from '@/lib/utils/formatUtil';

interface ManagerServiceOrdersPageClientProps {
  pageTitle?: string;
  pageDescription?: string;
  entityLabel?: string;
}

const DESIGN_STATUS = {
  PendingApproval: 1,
  AwaitDeposit: 2,
  DepositPaid: 3,
  InProgress: 4,
  AwaitFinalPayment: 5,
  Completed: 6,
  Rejected: 7,
  Cancelled: 8,
} as const;

const DESIGN_TASK_STATUS = {
  Completed: 3,
  Cancelled: 4,
} as const;

const FINAL_DESIGN_STATUSES = new Set<number>([
  DESIGN_STATUS.Completed,
  DESIGN_STATUS.Rejected,
  DESIGN_STATUS.Cancelled,
]);

const formatEnumLabel = (value: string) => {
  if (!value) {
    return '';
  }

  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getLocalDateInputValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
};

const getDesignStatusChipColor = (status: number): 'default' | 'warning' | 'success' | 'error' | 'info' => {
  if (status === DESIGN_STATUS.PendingApproval) return 'warning';
  if (status === DESIGN_STATUS.AwaitDeposit || status === DESIGN_STATUS.AwaitFinalPayment) return 'info';
  if (status === DESIGN_STATUS.DepositPaid || status === DESIGN_STATUS.InProgress || status === DESIGN_STATUS.Completed) return 'success';
  if (status === DESIGN_STATUS.Rejected || status === DESIGN_STATUS.Cancelled) return 'error';
  return 'default';
};

const canApproveOrRejectDesign = (status: number) => status === DESIGN_STATUS.PendingApproval;
const canManagerCancelDesign = (status: number) => !FINAL_DESIGN_STATUSES.has(status);
const canAssignDesignTask = (task: DesignRegistrationTask) => {
  return task.status !== DESIGN_TASK_STATUS.Completed && task.status !== DESIGN_TASK_STATUS.Cancelled;
};

export default function ManagerServiceOrdersPageClient({
  pageTitle = 'Service Orders Management',
  pageDescription = 'Manage service registration orders for your nursery, including approval, cancellation, and caretaker assignment.',
  entityLabel = 'service orders',
}: ManagerServiceOrdersPageClientProps) {
  const [items, setItems] = useState<ManagerServiceRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusEnums, setStatusEnums] = useState<EnumOption[]>([]);
  const [statusFilter, setStatusFilter] = useState<ServiceStatusFilterValue>(ALL_STATUS_FILTER);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [currentTab, setCurrentTab] = useState(0);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailItem, setDetailItem] = useState<ManagerServiceRegistration | null>(null);

  const [approveTarget, setApproveTarget] = useState<ManagerServiceRegistration | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ManagerServiceRegistration | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [cancelTarget, setCancelTarget] = useState<ManagerServiceRegistration | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const [assignTarget, setAssignTarget] = useState<ManagerServiceRegistration | null>(null);
  const [eligibleCaretakers, setEligibleCaretakers] = useState<EligibleCaretaker[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedCaretakerId, setSelectedCaretakerId] = useState<number>(0);

  const [rescheduleTarget, setRescheduleTarget] = useState<ManagerServiceRegistration | null>(null);
  const [publicShifts, setPublicShifts] = useState<PublicShift[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [designOrders, setDesignOrders] = useState<CustomerDesignRegistrationListItem[]>([]);
  const [designLoading, setDesignLoading] = useState(false);
  const [designError, setDesignError] = useState<string | null>(null);
  const [designFlowEnums, setDesignFlowEnums] = useState<DesignFlowEnumGroup[]>([]);
  const [designStatusFilter, setDesignStatusFilter] = useState<ServiceStatusFilterValue>(ALL_STATUS_FILTER);
  const [designDetailOpen, setDesignDetailOpen] = useState(false);
  const [designDetailLoading, setDesignDetailLoading] = useState(false);
  const [designDetailItem, setDesignDetailItem] = useState<CustomerDesignRegistrationDetail | null>(null);
  const [designCancelTarget, setDesignCancelTarget] = useState<CustomerDesignRegistrationListItem | null>(null);
  const [designCancelReason, setDesignCancelReason] = useState('');
  const [designRejectTarget, setDesignRejectTarget] = useState<CustomerDesignRegistrationListItem | null>(null);
  const [designRejectReason, setDesignRejectReason] = useState('');
  const [designTaskAssignTarget, setDesignTaskAssignTarget] = useState<DesignRegistrationTask | null>(null);
  const [designTaskAssignRegistration, setDesignTaskAssignRegistration] = useState<CustomerDesignRegistrationListItem | CustomerDesignRegistrationDetail | null>(null);
  const [eligibleDesignCaretakers, setEligibleDesignCaretakers] = useState<DesignEligibleCaretaker[]>([]);
  const [eligibleDesignAvailability, setEligibleDesignAvailability] = useState<DesignEligibleCaretakerAvailability[]>([]);
  const [designAssignLoading, setDesignAssignLoading] = useState(false);
  const [selectedDesignCaretakerId, setSelectedDesignCaretakerId] = useState<number>(0);
  const [designTaskScheduledDate, setDesignTaskScheduledDate] = useState(getLocalDateInputValue());

  useEffect(() => {
    const loadStatusEnums = async () => {
      try {
        const enums = await getSystemEnumValues('service-registrations', false);
        setStatusEnums(enums);
      } catch {
        setStatusEnums([]);
      }
    };

    void loadStatusEnums();
  }, []);

  useEffect(() => {
    const loadDesignFlowEnums = async () => {
      try {
        const enums = await getDesignFlowEnums(false);
        setDesignFlowEnums(enums);
      } catch {
        setDesignFlowEnums([]);
      }
    };

    void loadDesignFlowEnums();
  }, []);

  const statusOptions = useMemo(() => buildServiceStatusOptions(statusEnums), [statusEnums]);
  const statusLabelMap = useMemo(() => buildServiceStatusLabelMap(statusEnums), [statusEnums]);

  const designRegistrationStatusValues = useMemo(
    () => designFlowEnums.find((group) => group.enumName === 'DesignRegistrationStatus')?.values ?? [],
    [designFlowEnums]
  );
  const designStatusOptions = useMemo<ServiceStatusOption[]>(
    () => [
      { value: ALL_STATUS_FILTER, label: 'All Statuses' },
      ...designRegistrationStatusValues.map((item) => ({ value: item.value, label: formatEnumLabel(item.name) })),
    ],
    [designRegistrationStatusValues]
  );
  const designStatusLabelMap = useMemo(
    () => buildDesignFlowLabelMap(designFlowEnums, 'DesignRegistrationStatus', formatEnumLabel),
    [designFlowEnums]
  );
  const designTaskStatusLabelMap = useMemo(
    () => buildDesignFlowLabelMap(designFlowEnums, 'DesignTaskStatus', formatEnumLabel),
    [designFlowEnums]
  );
  const designTaskTypeLabelMap = useMemo(
    () => buildDesignFlowLabelMap(designFlowEnums, 'TaskType', formatEnumLabel),
    [designFlowEnums]
  );

  const activeFilterLabel = useMemo(
    () => statusOptions.find((option) => option.value === statusFilter)?.label || 'All Statuses',
    [statusFilter, statusOptions]
  );

  const activeDesignFilterLabel = useMemo(
    () => designStatusOptions.find((option) => option.value === designStatusFilter)?.label || 'All Statuses',
    [designStatusFilter, designStatusOptions]
  );

  const stats = useMemo(() => {
    return {
      pending: items.filter((item) => item.status === 1).length,
      awaitingPayment: items.filter((item) => item.status === 2).length,
      active: items.filter((item) => item.status === 3).length,
    };
  }, [items]);

  const designStats = useMemo(() => {
    return {
      pending: designOrders.filter((item) => item.status === DESIGN_STATUS.PendingApproval).length,
      awaitingPayment: designOrders.filter((item) => item.status === DESIGN_STATUS.AwaitDeposit || item.status === DESIGN_STATUS.AwaitFinalPayment).length,
      active: designOrders.filter((item) => item.status === DESIGN_STATUS.DepositPaid || item.status === DESIGN_STATUS.InProgress).length,
    };
  }, [designOrders]);

  const designAvailabilityByStaffId = useMemo(() => {
    return eligibleDesignAvailability.reduce<Record<number, DesignEligibleCaretakerAvailability>>((accumulator, item) => {
      accumulator[item.staff.id] = item;
      return accumulator;
    }, {});
  }, [eligibleDesignAvailability]);

  const getDesignRegistrationStatusLabel = useCallback(
    (item: Pick<CustomerDesignRegistrationListItem, 'status' | 'statusName'>) => {
      return designStatusLabelMap[item.status] || formatEnumLabel(item.statusName) || `#${item.status}`;
    },
    [designStatusLabelMap]
  );

  const getDesignTaskStatusLabel = useCallback(
    (task: DesignRegistrationTask) => {
      return designTaskStatusLabelMap[task.status] || formatEnumLabel(task.statusName) || `#${task.status}`;
    },
    [designTaskStatusLabelMap]
  );

  const getDesignTaskTypeLabel = useCallback(
    (task: DesignRegistrationTask) => {
      return designTaskTypeLabelMap[task.taskType] || formatEnumLabel(task.taskTypeName) || `#${task.taskType}`;
    },
    [designTaskTypeLabelMap]
  );

  const loadDesignOrders = useCallback(async () => {
    try {
      setDesignLoading(true);
      setDesignError(null);
      const response = await getNurseryDesignRegistrations({
        pageNumber: 1,
        pageSize: 10,
        status: designStatusFilter === ALL_STATUS_FILTER ? undefined : designStatusFilter,
      }, false);
      setDesignOrders(response.items);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Cannot load design service orders';
      setDesignError(message);
      toast.error(message);
    } finally {
      setDesignLoading(false);
    }
  }, [designStatusFilter]);

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getManagerNurseryServiceRegistrations(
        {
          pageNumber,
          pageSize,
          status: statusFilter === ALL_STATUS_FILTER ? undefined : statusFilter,
        },
        false
      );
      setItems(response.items);
    } catch (loadError) {
      const message = getErrorMessage(loadError, 'Cannot load service orders');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, statusFilter]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (currentTab !== 1) {
      return;
    }
    void loadDesignOrders();
  }, [currentTab, loadDesignOrders]);

  const refreshDetailIfNeeded = useCallback(
    async (registrationId: number) => {
      if (!detailOpen || detailItem?.id !== registrationId) {
        return;
      }

      try {
        const refreshed = await getManagerNurseryServiceRegistrationDetail(registrationId, false);
        setDetailItem(refreshed);
      } catch {
        // Keep current detail content if refresh fails.
      }
    },
    [detailItem?.id, detailOpen]
  );

  const refreshDesignDetailIfNeeded = useCallback(
    async (registrationId: number) => {
      if (!designDetailOpen || designDetailItem?.id !== registrationId) {
        return;
      }

      try {
        const [detail, tasks] = await Promise.all([
          getNurseryDesignRegistrationDetail(registrationId, false),
          getDesignTasksByRegistration(registrationId, false),
        ]);
        setDesignDetailItem({
          ...detail,
          designTasks: tasks.length > 0 ? tasks : detail.designTasks,
        });
      } catch {
        // Keep current design detail content if refresh fails.
      }
    },
    [designDetailItem?.id, designDetailOpen]
  );

  const handleViewDetail = async (id: number) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      const response = await getManagerNurseryServiceRegistrationDetail(id, false);
      setDetailItem(response);
    } catch (viewError) {
      toast.error(getErrorMessage(viewError, 'Cannot load service order details'));
      setDetailOpen(false);
      setDetailItem(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDesignDetail = async (id: number) => {
    try {
      setDesignDetailOpen(true);
      setDesignDetailLoading(true);
      const [response, tasks] = await Promise.all([
        getNurseryDesignRegistrationDetail(id, false),
        getDesignTasksByRegistration(id, false),
      ]);
      setDesignDetailItem({
        ...response,
        designTasks: tasks.length > 0 ? tasks : response.designTasks,
      });
    } catch (viewError) {
      toast.error(getErrorMessage(viewError, 'Cannot load design registration details'));
      setDesignDetailOpen(false);
      setDesignDetailItem(null);
    } finally {
      setDesignDetailLoading(false);
    }
  };

  const handleOpenDesignCancelDialog = (item: CustomerDesignRegistrationListItem) => {
    setDesignCancelTarget(item);
    setDesignCancelReason('');
  };

  const handleDesignCancel = async () => {
    if (!designCancelTarget) {
      return;
    }

    const trimmedReason = designCancelReason.trim();
    if (!trimmedReason) {
      toast.error('Please enter a reason for cancellation');
      return;
    }

    try {
      setSubmitting(true);
      await managerCancelDesignRegistration(designCancelTarget.id, trimmedReason, false);
      toast.success('Design order cancelled successfully');
      setDesignCancelTarget(null);
      setDesignCancelReason('');
      await Promise.all([loadDesignOrders(), refreshDesignDetailIfNeeded(designCancelTarget.id)]);
    } catch (cancelError) {
      toast.error(getErrorMessage(cancelError, 'Cannot cancel design order'));
    } finally {
      setSubmitting(false);
    }
  };

  const loadDesignCaretakersForAssignment = useCallback(
    async (registrationId: number, scheduledDate: string) => {
      if (scheduledDate) {
        const availability = await getEligibleCaretakersWithAvailabilityForDesignRegistration(registrationId, scheduledDate, false);
        setEligibleDesignAvailability(availability);
        setEligibleDesignCaretakers(availability.map((item) => item.staff));
        const firstAvailable = availability.find((item) => item.isAvailable)?.staff ?? availability[0]?.staff;
        setSelectedDesignCaretakerId(firstAvailable?.id ?? 0);
        return;
      }

      const caretakers = await getEligibleCaretakersForDesignRegistration(registrationId, false);
      setEligibleDesignAvailability([]);
      setEligibleDesignCaretakers(caretakers);
      setSelectedDesignCaretakerId(caretakers[0]?.id ?? 0);
    },
    []
  );

  const openDesignTaskAssignDialog = async (
    task: DesignRegistrationTask,
    registration: CustomerDesignRegistrationListItem | CustomerDesignRegistrationDetail
  ) => {
    try {
      const initialDate = task.scheduledDate?.slice(0, 10) || getLocalDateInputValue();
      setDesignTaskAssignTarget(task);
      setDesignTaskAssignRegistration(registration);
      setDesignTaskScheduledDate(initialDate);
      setDesignAssignLoading(true);
      setSelectedDesignCaretakerId(0);
      await loadDesignCaretakersForAssignment(registration.id, initialDate);
    } catch (assignError) {
      toast.error(getErrorMessage(assignError, 'Cannot load eligible caretakers'));
      setDesignTaskAssignTarget(null);
      setDesignTaskAssignRegistration(null);
      setEligibleDesignCaretakers([]);
      setEligibleDesignAvailability([]);
    } finally {
      setDesignAssignLoading(false);
    }
  };

  const handleDesignTaskScheduledDateChange = async (value: string) => {
    setDesignTaskScheduledDate(value);
    if (!designTaskAssignRegistration) {
      return;
    }

    try {
      setDesignAssignLoading(true);
      await loadDesignCaretakersForAssignment(designTaskAssignRegistration.id, value);
    } catch (availabilityError) {
      toast.error(getErrorMessage(availabilityError, 'Cannot check caretaker availability'));
      setEligibleDesignCaretakers([]);
      setEligibleDesignAvailability([]);
      setSelectedDesignCaretakerId(0);
    } finally {
      setDesignAssignLoading(false);
    }
  };

  const handleDesignAssign = async () => {
    if (!designTaskAssignTarget || !designTaskAssignRegistration || !selectedDesignCaretakerId) {
      toast.error('Please select a caretaker');
      return;
    }

    if (!designTaskScheduledDate) {
      toast.error('Please select a scheduled date');
      return;
    }

    try {
      setSubmitting(true);
      await assignDesignTask(
        designTaskAssignTarget.id,
        { assignedStaffId: selectedDesignCaretakerId, scheduledDate: designTaskScheduledDate },
        false
      );
      toast.success('Design task assigned successfully');
      const registrationId = designTaskAssignRegistration.id;
      setDesignTaskAssignTarget(null);
      setDesignTaskAssignRegistration(null);
      setEligibleDesignCaretakers([]);
      setEligibleDesignAvailability([]);
      setSelectedDesignCaretakerId(0);
      await Promise.all([loadDesignOrders(), refreshDesignDetailIfNeeded(registrationId)]);
    } catch (assignError) {
      toast.error(getErrorMessage(assignError, 'Cannot assign design task'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDesignRejectDialog = (item: CustomerDesignRegistrationListItem) => {
    setDesignRejectTarget(item);
    setDesignRejectReason('');
  };

  const handleDesignReject = async () => {
    if (!designRejectTarget) {
      return;
    }

    const trimmedReason = designRejectReason.trim();
    if (!trimmedReason) {
      toast.error('Please enter a reason for rejection');
      return;
    }

    try {
      setSubmitting(true);
      await rejectDesignRegistration(designRejectTarget.id, trimmedReason, false);
      toast.success('Design order rejected successfully');
      const targetId = designRejectTarget.id;
      setDesignRejectTarget(null);
      setDesignRejectReason('');
      await Promise.all([loadDesignOrders(), refreshDesignDetailIfNeeded(targetId)]);
    } catch (rejectError) {
      toast.error(getErrorMessage(rejectError, 'Cannot reject design order'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDesignApprove = async (id: number) => {
    try {
      setSubmitting(true);
      await approveDesignRegistration(id, false);
      toast.success('Design order approved successfully');
      await Promise.all([loadDesignOrders(), refreshDesignDetailIfNeeded(id)]);
    } catch (approveError) {
      toast.error(getErrorMessage(approveError, 'Cannot approve design order'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!approveTarget) {
      return;
    }

    try {
      setSubmitting(true);
      await approveManagerServiceRegistration(approveTarget.id, false);
      toast.success('Service order approved successfully');
      setApproveTarget(null);
      await Promise.all([loadList(), refreshDetailIfNeeded(approveTarget.id)]);
    } catch (approveError) {
      toast.error(getErrorMessage(approveError, 'Cannot approve service order'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) {
      return;
    }

    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      toast.error('Please enter a reason for rejection');
      return;
    }

    try {
      setSubmitting(true);
      await rejectManagerServiceRegistration(rejectTarget.id, trimmedReason, false);
      toast.success('Service order rejected successfully');
      setRejectTarget(null);
      setRejectReason('');
      await Promise.all([loadList(), refreshDetailIfNeeded(rejectTarget.id)]);
    } catch (rejectError) {
      toast.error(getErrorMessage(rejectError, 'Cannot reject service order'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleManagerCancel = async () => {
    if (!cancelTarget) {
      return;
    }

    const trimmedReason = cancelReason.trim();
    if (!trimmedReason) {
      toast.error('Please enter a reason for cancellation');
      return;
    }

    try {
      setSubmitting(true);
      await managerCancelServiceRegistration(cancelTarget.id, trimmedReason, false);
      toast.success('Service order cancelled successfully');
      setCancelTarget(null);
      setCancelReason('');
      await Promise.all([loadList(), refreshDetailIfNeeded(cancelTarget.id)]);
    } catch (cancelError) {
      toast.error(getErrorMessage(cancelError, 'Cannot cancel service order'));
    } finally {
      setSubmitting(false);
    }
  };

  const openAssignDialog = async (registration: ManagerServiceRegistration) => {
    try {
      setAssignTarget(registration);
      setAssignLoading(true);
      setSelectedCaretakerId(0);
      const caretakers = await getEligibleCaretakersForServiceRegistration(registration.id, false);
      setEligibleCaretakers(caretakers);
      if (caretakers.length > 0) {
        setSelectedCaretakerId(caretakers[0].id);
      }
    } catch (assignError) {
      toast.error(getErrorMessage(assignError, 'Cannot load eligible caretakers'));
      setAssignTarget(null);
      setEligibleCaretakers([]);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssignCaretaker = async () => {
    if (!assignTarget || !selectedCaretakerId) {
      toast.error('Please select a caretaker');
      return;
    }

    try {
      setSubmitting(true);
      await assignCaretakerToManagerServiceRegistration(assignTarget.id, { caretakerId: selectedCaretakerId }, false);
      toast.success('Caretaker assigned successfully');
      setAssignTarget(null);
      setEligibleCaretakers([]);
      setSelectedCaretakerId(0);
      await Promise.all([loadList(), refreshDetailIfNeeded(assignTarget.id)]);
    } catch (assignError) {
      toast.error(getErrorMessage(assignError, 'Cannot assign caretaker'));
    } finally {
      setSubmitting(false);
    }
  };

  const openRescheduleDialog = async (registration: ManagerServiceRegistration) => {
    try {
      setRescheduleTarget(registration);
      if (publicShifts.length > 0) {
        return;
      }

      setShiftsLoading(true);
      const shifts = await getPublicShifts(false);
      setPublicShifts(shifts);
    } catch (shiftError) {
      toast.error(getErrorMessage(shiftError, 'Cannot load shifts'));
      setRescheduleTarget(null);
      setPublicShifts([]);
    } finally {
      setShiftsLoading(false);
    }
  };

  const handleReschedule = async (values: ServiceOrderRescheduleValues) => {
    if (!rescheduleTarget) {
      return;
    }

    try {
      setSubmitting(true);
      await rescheduleManagerServiceRegistration(rescheduleTarget.id, values, false);
      toast.success('Registration schedule updated successfully');
      const targetId = rescheduleTarget.id;
      setRescheduleTarget(null);
      await Promise.all([loadList(), refreshDetailIfNeeded(targetId)]);
    } catch (rescheduleError) {
      toast.error(getErrorMessage(rescheduleError, 'Cannot reschedule service order'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, mx: 'auto' }}>
      <ManagementHeader
        title={pageTitle}
        description={pageDescription}
        entityLabel={entityLabel}
        count={currentTab === 0 ? items.length : designOrders.length}
      />

      <Box sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(_event, newValue) => setCurrentTab(newValue)}>
          <Tab label="Care Service" />
          <Tab label="Design Service" />
        </Tabs>
      </Box>

      {currentTab === 0 ? (
        <>
          <ServiceOrdersHeader
            statusFilter={statusFilter}
            statusOptions={statusOptions}
            activeFilterLabel={activeFilterLabel}
            pendingCount={stats.pending}
            awaitingPaymentCount={stats.awaitingPayment}
            activeCount={stats.active}
            loading={loading}
            onStatusFilterChange={(value) => {
              setStatusFilter(value);
              setPageNumber(1);
            }}
            onRefresh={() => void loadList()}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Paper sx={{ border: '1px solid var(--card-border)', overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CustomLoading />
              </Box>
            ) : (
              <TableContainer>
                <ServiceOrdersTable
                  items={items}
                  statusLabels={statusLabelMap}
                  submitting={submitting}
                  onViewDetail={handleViewDetail}
                  onApprove={(item) => setApproveTarget(item)}
                  onReject={(item) => {
                    setRejectTarget(item);
                    setRejectReason('');
                  }}
                  onCancel={(item) => {
                    setCancelTarget(item);
                    setCancelReason('');
                  }}
                  onAssignCaretaker={(item) => void openAssignDialog(item)}
                  onReschedule={(item) => void openRescheduleDialog(item)}
                />
              </TableContainer>
            )}
          </Paper>

          <ServiceOrderDetailDialog
            open={detailOpen}
            loading={detailLoading}
            submitting={submitting}
            detailItem={detailItem}
            statusLabels={statusLabelMap}
            onClose={() => {
              setDetailOpen(false);
              setDetailItem(null);
            }}
            onApprove={(item) => setApproveTarget(item)}
            onReject={(item) => {
              setRejectTarget(item);
              setRejectReason('');
            }}
            onCancel={(item) => {
              setCancelTarget(item);
              setCancelReason('');
            }}
            onAssignCaretaker={(item) => void openAssignDialog(item)}
            onReschedule={(item) => void openRescheduleDialog(item)}
          />

          <ServiceOrderApproveDialog
            open={Boolean(approveTarget)}
            target={approveTarget}
            submitting={submitting}
            onClose={() => setApproveTarget(null)}
            onConfirm={() => void handleApprove()}
          />

          <ServiceOrderRejectDialog
            open={Boolean(rejectTarget)}
            target={rejectTarget}
            reason={rejectReason}
            submitting={submitting}
            onReasonChange={setRejectReason}
            onClose={() => setRejectTarget(null)}
            onConfirm={() => void handleReject()}
          />

          <ServiceOrderCancelDialog
            open={Boolean(cancelTarget)}
            target={cancelTarget}
            reason={cancelReason}
            submitting={submitting}
            onReasonChange={setCancelReason}
            onClose={() => setCancelTarget(null)}
            onConfirm={() => void handleManagerCancel()}
          />

          <ServiceOrderAssignDialog
            open={Boolean(assignTarget)}
            target={assignTarget}
            selectedCaretakerId={selectedCaretakerId}
            eligibleCaretakers={eligibleCaretakers}
            loading={assignLoading}
            submitting={submitting}
            onSelectedCaretakerIdChange={setSelectedCaretakerId}
            onClose={() => {
              setAssignTarget(null);
              setEligibleCaretakers([]);
            }}
            onConfirm={() => void handleAssignCaretaker()}
          />

          <ServiceOrderRescheduleDialog
            open={Boolean(rescheduleTarget)}
            target={rescheduleTarget}
            shifts={publicShifts}
            shiftsLoading={shiftsLoading}
            submitting={submitting}
            onClose={() => setRescheduleTarget(null)}
            onConfirm={(values) => void handleReschedule(values)}
          />
        </>
      ) : (
        <>
          <ServiceOrdersHeader
            statusFilter={designStatusFilter}
            statusOptions={designStatusOptions}
            activeFilterLabel={activeDesignFilterLabel}
            pendingCount={designStats.pending}
            awaitingPaymentCount={designStats.awaitingPayment}
            activeCount={designStats.active}
            loading={designLoading}
            onStatusFilterChange={(value) => {
              setDesignStatusFilter(value);
            }}
            onRefresh={() => void loadDesignOrders()}
          />

          {designError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDesignError(null)}>
              {designError}
            </Alert>
          )}

          <Paper sx={{ border: '1px solid var(--card-border)', overflow: 'hidden' }}>
            {designLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CustomLoading />
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Design Template</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Nursery</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align='center'>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">
                        Total Price
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {designOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          No design service orders found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      designOrders.map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell>#{order.id}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {order.customer?.fullName || '-'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.customer?.email || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {order.designTemplateTier.designTemplate.name || '-'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.designTemplateTier.tierName || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>{order.nursery?.name || 'Optional'}</TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              color={getDesignStatusChipColor(order.status)}
                              label={getDesignRegistrationStatusLabel(order)}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {formatCurrency(order.totalPrice, 'vi-VN')}
                          </TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell align="center" >
                            <Stack direction="row" spacing={1} justifyContent="center" useFlexGap flexWrap="nowrap" maxHeight={40}>
                              <Tooltip title="View details and tasks">
                                <IconButton size="small" onClick={() => void handleViewDesignDetail(order.id)}>
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {canApproveOrRejectDesign(order.status) && (
                                <>
                                  <Button
                                    size="small"
                                    variant='contained'
                                    className='bg-primary! aspect-square! rounded-full!'
                                    disabled={submitting}
                                    title="Approve"
                                    onClick={() => void handleDesignApprove(order.id)}
                                    sx={{ ml: 1 }}
                                  >
                                    <CheckCircleOutlineIcon />
                                  </Button>
                                  <Button
                                    size="small"
                                    variant='contained'
                                    className='bg-error! aspect-square! rounded-full!'
                                    disabled={submitting}
                                    title="Reject"
                                    onClick={() => handleOpenDesignRejectDialog(order)}
                                    sx={{ ml: 1 }}
                                  >
                                    <CancelOutlinedIcon />
                                  </Button>
                                </>
                              )}
                              {canManagerCancelDesign(order.status) && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="error"
                                  className='bg-error! aspect-square! rounded-full!'
                                  disabled={submitting}
                                  title="Cancel"
                                  onClick={() => handleOpenDesignCancelDialog(order)}
                                  sx={{ ml: 1 }}
                                >
                                  <CancelOutlinedIcon />
                                </Button>
                              )}
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

          <Dialog open={designDetailOpen} onClose={() => setDesignDetailOpen(false)} fullWidth maxWidth="md">
            <DialogTitle>{designDetailItem ? `Design Registration #${designDetailItem.id}` : 'Design Registration'}</DialogTitle>
            <DialogContent dividers>
              {designDetailLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CustomLoading />
                </Box>
              ) : designDetailItem ? (
                <Stack spacing={1.5}>
                  <Box>
                    <strong>Status:</strong>{' '}
                    <Chip
                      size="small"
                      color={getDesignStatusChipColor(designDetailItem.status)}
                      label={getDesignRegistrationStatusLabel(designDetailItem)}
                    />
                  </Box>
                  {designDetailItem.customer && (
                    <Typography variant="body2">
                      <strong>Customer:</strong> {designDetailItem.customer.fullName} ({designDetailItem.customer.email || '-'})
                    </Typography>
                  )}
                  <Typography variant="body2"><strong>Phone:</strong> {designDetailItem.phone || '-'}</Typography>
                  <Typography variant="body2"><strong>Address:</strong> {designDetailItem.address || '-'}</Typography>
                  <Typography variant="body2"><strong>Nursery:</strong> {designDetailItem.nursery?.name || 'Optional'}</Typography>
                  <Typography variant="body2"><strong>Template:</strong> {designDetailItem.designTemplateTier.designTemplate.name || '-'}</Typography>
                  <Typography variant="body2"><strong>Tier:</strong> {designDetailItem.designTemplateTier.tierName || '-'}</Typography>
                  <Typography variant="body2"><strong>Total price:</strong> {formatCurrency(designDetailItem.totalPrice, 'vi-VN')}</Typography>
                  <Typography variant="body2"><strong>Deposit:</strong> {formatCurrency(designDetailItem.depositAmount, 'vi-VN')}</Typography>
                  <Typography variant="body2"><strong>Order ID:</strong> {designDetailItem.orderId ? `#${designDetailItem.orderId}` : '-'}</Typography>
                  <Typography variant="body2"><strong>Assigned caretaker:</strong> {designDetailItem.assignedCaretaker?.fullName || '-'}</Typography>
                  <Typography variant="body2"><strong>Customer note:</strong> {designDetailItem.customerNote || '-'}</Typography>
                  <Typography variant="body2"><strong>Created at:</strong> {formatDate(designDetailItem.createdAt)}</Typography>
                  <Typography variant="body2"><strong>Approved at:</strong> {formatDate(designDetailItem.approvedAt)}</Typography>
                  {designDetailItem.cancelReason && (
                    <Typography variant="body2" color="error">
                      <strong>Cancel Reason:</strong> {designDetailItem.cancelReason}
                    </Typography>
                  )}

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="h6" fontWeight={700}>
                    Design Tasks
                  </Typography>
                  {designDetailItem.designTasks.length === 0 ? (
                    <Alert severity="info">No design tasks found for this registration.</Alert>
                  ) : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Task</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Scheduled Date</TableCell>
                            <TableCell>Assigned Staff</TableCell>
                            <TableCell align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {designDetailItem.designTasks.map((task) => (
                            <TableRow key={task.id}>
                              <TableCell>{getDesignTaskTypeLabel(task)}</TableCell>
                              <TableCell>
                                <Chip size="small" label={getDesignTaskStatusLabel(task)} />
                              </TableCell>
                              <TableCell>{formatDate(task.scheduledDate)}</TableCell>
                              <TableCell>{task.assignedStaff?.fullName || '-'}</TableCell>
                              <TableCell align="center">
                                {canAssignDesignTask(task) ? (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => void openDesignTaskAssignDialog(task, designDetailItem)}
                                    disabled={submitting}
                                  >
                                    Assign
                                  </Button>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Stack>
              ) : (
                <Typography>No detail data available.</Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {designDetailItem && canApproveOrRejectDesign(designDetailItem.status) && (
                  <Button
                    variant="contained"
                    color="success"
                    className="bg-primary!"
                    onClick={() => void handleDesignApprove(designDetailItem.id)}
                    disabled={submitting}
                  >
                    Approve
                  </Button>
                )}
                {designDetailItem && canApproveOrRejectDesign(designDetailItem.status) && (
                  <Button
                    variant="outlined"
                    color="error"
                    className="bg-error!"
                    onClick={() => handleOpenDesignRejectDialog(designDetailItem)}
                    disabled={submitting}
                  >
                    Reject
                  </Button>
                )}
                {designDetailItem && canManagerCancelDesign(designDetailItem.status) && (
                  <Button
                    variant="outlined"
                    color="error"
                    className="bg-error!"
                    onClick={() => handleOpenDesignCancelDialog(designDetailItem)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>
              <Button onClick={() => setDesignDetailOpen(false)} disabled={designDetailLoading}>
                Close
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={Boolean(designCancelTarget)} onClose={() => setDesignCancelTarget(null)} fullWidth maxWidth="sm">
            <DialogTitle>
              {designCancelTarget ? `Cancel design order #${designCancelTarget.id}` : 'Cancel design order'}
            </DialogTitle>
            <DialogContent dividers>
              <TextField
                label="Cancellation reason"
                fullWidth
                multiline
                minRows={3}
                value={designCancelReason}
                onChange={(event) => setDesignCancelReason(event.target.value)}
                disabled={submitting}
                placeholder="Enter cancellation reason"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDesignCancelTarget(null)} disabled={submitting}>
                Close
              </Button>
              <Button onClick={() => void handleDesignCancel()} disabled={submitting || designCancelReason.trim().length === 0} variant="contained" color="error">
                {submitting ? 'Processing...' : 'Confirm cancellation'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={Boolean(designRejectTarget)} onClose={() => setDesignRejectTarget(null)} fullWidth maxWidth="sm">
            <DialogTitle>
              {designRejectTarget ? `Reject design order #${designRejectTarget.id}` : 'Reject design order'}
            </DialogTitle>
            <DialogContent dividers>
              <TextField
                label="Rejection reason"
                fullWidth
                multiline
                minRows={3}
                value={designRejectReason}
                onChange={(event) => setDesignRejectReason(event.target.value)}
                disabled={submitting}
                placeholder="Enter rejection reason"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDesignRejectTarget(null)} disabled={submitting}>
                Close
              </Button>
              <Button onClick={() => void handleDesignReject()} disabled={submitting || designRejectReason.trim().length === 0} variant="contained" color="error">
                {submitting ? 'Processing...' : 'Confirm rejection'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={Boolean(designTaskAssignTarget)}
            onClose={() => {
              setDesignTaskAssignTarget(null);
              setDesignTaskAssignRegistration(null);
              setEligibleDesignCaretakers([]);
              setEligibleDesignAvailability([]);
            }}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle>
              Assign {designTaskAssignTarget ? getDesignTaskTypeLabel(designTaskAssignTarget) : 'design task'}
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <TextField
                  label="Scheduled date"
                  type="date"
                  value={designTaskScheduledDate}
                  onChange={(event) => void handleDesignTaskScheduledDateChange(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  disabled={submitting}
                  fullWidth
                />

                {designAssignLoading ? (
                  <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                    <CustomLoading />
                  </Box>
                ) : eligibleDesignCaretakers.length === 0 ? (
                  <Alert severity="warning">No eligible caretakers found for this design task.</Alert>
                ) : (
                  <FormControl fullWidth>
                    <InputLabel id="design-task-caretaker-label">Eligible Staff</InputLabel>
                    <Select
                      labelId="design-task-caretaker-label"
                      label="Eligible Staff"
                      value={selectedDesignCaretakerId || ''}
                      onChange={(event) => setSelectedDesignCaretakerId(Number(event.target.value))}
                    >
                      <MenuItem value="">
                        <em>Select a staff member</em>
                      </MenuItem>
                    {eligibleDesignCaretakers.map((caretaker) => (
                        <MenuItem key={caretaker.id} value={caretaker.id}>
                          <Box>
                            <Typography variant="body2" fontWeight={700}>
                              {caretaker.username} - {caretaker.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {caretaker.phoneNumber || '-'}
                              {designAvailabilityByStaffId[caretaker.id]
                                ? designAvailabilityByStaffId[caretaker.id].isAvailable
                                  ? ' - Available'
                                  : ` - Conflicts: ${designAvailabilityByStaffId[caretaker.id].conflictDates.join(', ') || 'yes'}`
                                : ''}
                            </Typography>
                          </Box>
                        </MenuItem>
                    ))}
                    </Select>
                  </FormControl>
                )}
                <Typography variant="body2" color="text.secondary">
                  Availability is checked against the selected date when the API returns conflict information.
                </Typography>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setDesignTaskAssignTarget(null);
                  setDesignTaskAssignRegistration(null);
                  setEligibleDesignCaretakers([]);
                  setEligibleDesignAvailability([]);
                }}
                disabled={submitting || designAssignLoading}
              >
                Close
              </Button>
              <Button
                onClick={() => void handleDesignAssign()}
                disabled={submitting || designAssignLoading || eligibleDesignCaretakers.length === 0 || !selectedDesignCaretakerId}
                variant="contained"
              >
                {submitting ? 'Processing...' : 'Confirm assignment'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}
