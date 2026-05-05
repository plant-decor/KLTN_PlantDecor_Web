'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Paper, Tab, TableContainer, Tabs } from '@mui/material';
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
  assignCaretakerToDesignRegistration,
  assignDesignTask,
  approveDesignRegistration,
  buildDesignFlowLabelMap,
  getDesignTaskDetail,
  getDesignFlowEnums,
  getDesignTasksByRegistration,
  getEligibleCaretakersForDesignRegistration,
  getEligibleCaretakersWithAvailabilityForDesignRegistration,
  getNurseryDesignRegistrationDetail,
  getNurseryDesignRegistrations,
  managerCancelDesignRegistration,
  rejectDesignRegistration,
  rescheduleDesignTask,
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
import DesignServiceTab from './DesignServiceTab';
import ManagementHeader from '@/components/layout/ManagementHeader';
import { formatEnumLabel } from '@/lib/utils/enumLabelUtil';
import { DESIGN_STATUS } from './utils/designStatusConstants';
import DesignTaskRescheduleDialog from './dialogs/DesignTaskRescheduleDialog';
import DesignTaskDetailDialog from '@/components/design-registration/DesignTaskDetailDialog';

interface ManagerServiceOrdersPageClientProps {
  pageTitle?: string;
  pageDescription?: string;
  entityLabel?: string;
}

const getLocalDateInputValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
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
  const [designTaskDetailOpen, setDesignTaskDetailOpen] = useState(false);
  const [designTaskDetailLoading, setDesignTaskDetailLoading] = useState(false);
  const [designTaskDetailError, setDesignTaskDetailError] = useState<string | null>(null);
  const [designTaskDetail, setDesignTaskDetail] = useState<DesignRegistrationTask | null>(null);
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

  const [designTaskRescheduleTarget, setDesignTaskRescheduleTarget] = useState<DesignRegistrationTask | null>(null);
  const [designTaskRescheduleRegistration, setDesignTaskRescheduleRegistration] = useState<CustomerDesignRegistrationListItem | CustomerDesignRegistrationDetail | null>(null);
  const [designTaskRescheduleDate, setDesignTaskRescheduleDate] = useState(getLocalDateInputValue());

  const [designCaretakerAssignTarget, setDesignCaretakerAssignTarget] = useState<CustomerDesignRegistrationListItem | CustomerDesignRegistrationDetail | null>(null);
  const [eligibleCaretakersForAssign, setEligibleCaretakersForAssign] = useState<DesignEligibleCaretaker[]>([]);
  const [eligibleCaretakerAvailabilityForAssign, setEligibleCaretakerAvailabilityForAssign] = useState<DesignEligibleCaretakerAvailability[]>([]);
  const [designCaretakerAssignLoading, setDesignCaretakerAssignLoading] = useState(false);
  const [selectedCaretakerIdForAssign, setSelectedCaretakerIdForAssign] = useState<number>(0);
  const [designCaretakerAssignStartDate, setDesignCaretakerAssignStartDate] = useState(getLocalDateInputValue());

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

  const handleViewDesignTaskDetail = async (taskId: number) => {
    setDesignTaskDetailOpen(true);
    setDesignTaskDetailLoading(true);
    setDesignTaskDetailError(null);
    setDesignTaskDetail(null);

    try {
      const detailPayload = await getDesignTaskDetail(taskId, false);
      setDesignTaskDetail(detailPayload);
    } catch (viewError) {
      const message = getErrorMessage(viewError, 'Cannot load design task details');
      setDesignTaskDetailError(message);
      setDesignTaskDetail(null);
      toast.error(message);
    } finally {
      setDesignTaskDetailLoading(false);
    }
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

  const openDesignTaskRescheduleDialog = (
    task: DesignRegistrationTask,
    registration: CustomerDesignRegistrationListItem | CustomerDesignRegistrationDetail
  ) => {
    const initialDate = task.scheduledDate?.slice(0, 10) || getLocalDateInputValue();
    setDesignTaskRescheduleTarget(task);
    setDesignTaskRescheduleRegistration(registration);
    setDesignTaskRescheduleDate(initialDate);
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

  const handleDesignTaskReschedule = async () => {
    if (!designTaskRescheduleTarget || !designTaskRescheduleRegistration) {
      return;
    }

    if (!designTaskRescheduleDate) {
      toast.error('Please select a scheduled date');
      return;
    }

    try {
      setSubmitting(true);
      await rescheduleDesignTask(designTaskRescheduleTarget.id, { scheduledDate: designTaskRescheduleDate }, false);
      toast.success('Design task rescheduled successfully');
      const registrationId = designTaskRescheduleRegistration.id;
      setDesignTaskRescheduleTarget(null);
      setDesignTaskRescheduleRegistration(null);
      await Promise.all([loadDesignOrders(), refreshDesignDetailIfNeeded(registrationId)]);
    } catch (rescheduleError) {
      toast.error(getErrorMessage(rescheduleError, 'Cannot reschedule design task'));
    } finally {
      setSubmitting(false);
    }
  };

  const loadEligibleCaretakersForAssignment = useCallback(
    async (registrationId: number, startDate: string) => {
      if (startDate) {
        const availability = await getEligibleCaretakersWithAvailabilityForDesignRegistration(registrationId, startDate, false);
        setEligibleCaretakerAvailabilityForAssign(availability);
        setEligibleCaretakersForAssign(availability.map((item) => item.staff));
        const firstAvailable = availability.find((item) => item.isAvailable)?.staff ?? availability[0]?.staff;
        setSelectedCaretakerIdForAssign(firstAvailable?.id ?? 0);
        return;
      }

      const caretakers = await getEligibleCaretakersForDesignRegistration(registrationId, false);
      setEligibleCaretakersForAssign(caretakers);
      setEligibleCaretakerAvailabilityForAssign([]);
      const firstCaretaker = caretakers[0];
      setSelectedCaretakerIdForAssign(firstCaretaker?.id ?? 0);
    },
    []
  );

  const openDesignCaretakerAssignDialog = async (
    registration: CustomerDesignRegistrationListItem | CustomerDesignRegistrationDetail
  ) => {
    try {
      const initialDate = getLocalDateInputValue();
      setDesignCaretakerAssignTarget(registration);
      setDesignCaretakerAssignStartDate(initialDate);
      setDesignCaretakerAssignLoading(true);
      setSelectedCaretakerIdForAssign(0);
      await loadEligibleCaretakersForAssignment(registration.id, initialDate);
    } catch (loadError) {
      toast.error(getErrorMessage(loadError, 'Cannot load eligible caretakers'));
      setDesignCaretakerAssignTarget(null);
      setEligibleCaretakersForAssign([]);
      setEligibleCaretakerAvailabilityForAssign([]);
    } finally {
      setDesignCaretakerAssignLoading(false);
    }
  };

  const handleDesignCaretakerAssignStartDateChange = async (value: string) => {
    setDesignCaretakerAssignStartDate(value);
    if (!designCaretakerAssignTarget) {
      return;
    }

    try {
      setDesignCaretakerAssignLoading(true);
      await loadEligibleCaretakersForAssignment(designCaretakerAssignTarget.id, value);
    } catch (availabilityError) {
      toast.error(getErrorMessage(availabilityError, 'Cannot check caretaker availability'));
      setEligibleCaretakersForAssign([]);
      setEligibleCaretakerAvailabilityForAssign([]);
      setSelectedCaretakerIdForAssign(0);
    } finally {
      setDesignCaretakerAssignLoading(false);
    }
  };

  const handleDesignCaretakerAssign = async () => {
    if (!designCaretakerAssignTarget || !selectedCaretakerIdForAssign) {
      toast.error('Please select a caretaker');
      return;
    }

    if (!designCaretakerAssignStartDate) {
      toast.error('Please select a start date');
      return;
    }

    try {
      setSubmitting(true);
      await assignCaretakerToDesignRegistration(
        designCaretakerAssignTarget.id,
        { caretakerId: selectedCaretakerIdForAssign, startDate: designCaretakerAssignStartDate },
        false
      );
      toast.success('Caretaker assigned successfully');
      const registrationId = designCaretakerAssignTarget.id;
      setDesignCaretakerAssignTarget(null);
      setEligibleCaretakersForAssign([]);
      setEligibleCaretakerAvailabilityForAssign([]);
      setSelectedCaretakerIdForAssign(0);
      await Promise.all([loadDesignOrders(), refreshDesignDetailIfNeeded(registrationId)]);
    } catch (assignError) {
      toast.error(getErrorMessage(assignError, 'Cannot assign caretaker'));
    } finally {
      setSubmitting(false);
    }
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
        <Tabs value={currentTab} onChange={(_event, newValue) => setCurrentTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
            '& .Mui-selected': { backgroundColor: 'var(--primary) !important', color: '#fff !important' },
          }}
        >
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
        <DesignServiceTab
          designOrders={designOrders}
          designLoading={designLoading}
          designError={designError}
          designStatusFilter={designStatusFilter}
          designStatusOptions={designStatusOptions}
          activeDesignFilterLabel={activeDesignFilterLabel}
          designStats={designStats}
          submitting={submitting}
          designDetailOpen={designDetailOpen}
          designDetailLoading={designDetailLoading}
          designDetailItem={designDetailItem}
          designCancelTarget={designCancelTarget}
          designCancelReason={designCancelReason}
          designRejectTarget={designRejectTarget}
          designRejectReason={designRejectReason}
          designTaskAssignTarget={designTaskAssignTarget}
          designTaskAssignRegistration={designTaskAssignRegistration}
          eligibleDesignCaretakers={eligibleDesignCaretakers}
          eligibleDesignAvailability={eligibleDesignAvailability}
          designAssignLoading={designAssignLoading}
          selectedDesignCaretakerId={selectedDesignCaretakerId}
          designTaskScheduledDate={designTaskScheduledDate}
          designCaretakerAssignTarget={designCaretakerAssignTarget}
          eligibleCaretakersForAssign={eligibleCaretakersForAssign}
          eligibleCaretakerAvailabilityForAssign={eligibleCaretakerAvailabilityForAssign}
          designCaretakerAssignLoading={designCaretakerAssignLoading}
          selectedCaretakerIdForAssign={selectedCaretakerIdForAssign}
          designCaretakerAssignStartDate={designCaretakerAssignStartDate}
          getDesignRegistrationStatusLabel={getDesignRegistrationStatusLabel}
          getDesignTaskStatusLabel={getDesignTaskStatusLabel}
          getDesignTaskTypeLabel={getDesignTaskTypeLabel}
          onStatusFilterChange={(value) => {
            setDesignStatusFilter(value);
          }}
          onRefresh={() => void loadDesignOrders()}
          onViewDetail={(id) => void handleViewDesignDetail(id)}
          onViewTaskDetail={(taskId) => void handleViewDesignTaskDetail(taskId)}
          onApprove={(id) => void handleDesignApprove(id)}
          onOpenRejectDialog={(item) => {
            setDesignRejectTarget(item);
            setDesignRejectReason('');
          }}
          onOpenCancelDialog={(item) => {
            setDesignCancelTarget(item);
            setDesignCancelReason('');
          }}
          onOpenCaretakerAssignDialog={(registration) => void openDesignCaretakerAssignDialog(registration)}
          onOpenTaskAssignDialog={(task, registration) => void openDesignTaskAssignDialog(task, registration)}
          onOpenTaskRescheduleDialog={(task, registration) => openDesignTaskRescheduleDialog(task, registration)}
          onCloseDetail={() => setDesignDetailOpen(false)}
          onCloseCancel={() => setDesignCancelTarget(null)}
          onCloseReject={() => setDesignRejectTarget(null)}
          onCloseCaretakerAssign={() => {
            setDesignCaretakerAssignTarget(null);
            setEligibleCaretakersForAssign([]);
            setEligibleCaretakerAvailabilityForAssign([]);
          }}
          onCloseTaskAssign={() => {
            setDesignTaskAssignTarget(null);
            setDesignTaskAssignRegistration(null);
            setEligibleDesignCaretakers([]);
            setEligibleDesignAvailability([]);
          }}
          onConfirmCancel={() => void handleDesignCancel()}
          onConfirmReject={() => void handleDesignReject()}
          onConfirmCaretakerAssign={() => void handleDesignCaretakerAssign()}
          onConfirmAssign={() => void handleDesignAssign()}
          onCaretakerAssignStartDateChange={(date) => void handleDesignCaretakerAssignStartDateChange(date)}
          onSelectedCaretakerIdForAssignChange={setSelectedCaretakerIdForAssign}
          onScheduledDateChange={(date) => void handleDesignTaskScheduledDateChange(date)}
          onSelectedCaretakerIdChange={setSelectedDesignCaretakerId}
          onCancelReasonChange={setDesignCancelReason}
          onRejectReasonChange={setDesignRejectReason}
        />
      )}

      <DesignTaskRescheduleDialog
        open={Boolean(designTaskRescheduleTarget)}
        target={designTaskRescheduleTarget}
        scheduledDate={designTaskRescheduleDate}
        submitting={submitting}
        onScheduledDateChange={setDesignTaskRescheduleDate}
        onClose={() => {
          setDesignTaskRescheduleTarget(null);
          setDesignTaskRescheduleRegistration(null);
        }}
        onConfirm={() => void handleDesignTaskReschedule()}
        getDesignTaskTypeLabel={getDesignTaskTypeLabel}
      />

      <DesignTaskDetailDialog
        open={designTaskDetailOpen}
        loading={designTaskDetailLoading}
        error={designTaskDetailError}
        detail={designTaskDetail}
        onClose={() => {
          setDesignTaskDetailOpen(false);
          setDesignTaskDetailError(null);
          setDesignTaskDetail(null);
        }}
      />
    </Box>
  );
}
