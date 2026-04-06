'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import {
  batchUpdateManagerPlantInstanceStatus,
  createManagerPlantInstanceBatch,
  getManagerPlantInstances,
  getManagerPlantsSummary,
  getPlantInstanceEnums,
  searchSystemPlants,
  updateManagerPlantInstanceStatus,
  uploadManagerPlantInstanceImages,
  uploadManagerPlantInstanceThumbnail,
} from '@/lib/api/managerStoreCatalogService';
import type { ResponseModel } from '@/types/api.types';
import type {
  PaginatedPayload,
  PlantInstanceEnumGroup,
  PlantInstanceItem,
  PlantSummaryItem,
  PlantInstanceEnumValue,
  SystemPlantSearchItem,
} from '@/types/manager-store-catalog.types';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/lib/utils/formatUtil';
import PlantInstanceCreateDialog, { type PlantInstanceCreateSubmitValue } from './PlantInstanceCreateDialog';

interface PlantInstanceManagerTabProps {
  nurseryId: number | null;
}

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

const getPayload = <T,>(response: ResponseModel<T>): T | undefined => {
  return response.payload ?? response.data;
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

const statusColorMap: Record<number, 'success' | 'warning' | 'default' | 'error' | 'info'> = {
  1: 'success',
  2: 'default',
  3: 'warning',
  4: 'error',
  5: 'info',
};

export default function PlantInstanceManagerTab({ nurseryId }: PlantInstanceManagerTabProps) {
  const [summaryItems, setSummaryItems] = useState<PlantSummaryItem[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [items, setItems] = useState<PlantInstanceItem[]>([]);
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statusOptions, setStatusOptions] = useState<PlantInstanceEnumValue[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<number | 'all'>('all');

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [batchStatus, setBatchStatus] = useState<number | ''>('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createPlantOptions, setCreatePlantOptions] = useState<SystemPlantSearchItem[]>([]);
  const [createPlantOptionsLoading, setCreatePlantOptionsLoading] = useState(false);

  const fetchPlantSummary = useCallback(async () => {
    if (!nurseryId) {
      setSummaryItems([]);
      return;
    }

    setSummaryLoading(true);
    try {
      const response = await getManagerPlantsSummary(nurseryId, true);
      const payload = getPayload<PlantSummaryItem[]>(response) ?? [];
      setSummaryItems(payload);
    } catch {
      setSummaryItems([]);
    } finally {
      setSummaryLoading(false);
    }
  }, [nurseryId]);

  const fetchPlantInstances = useCallback(
    async (nextPage: number, nextSize: number, nextStatus: number | 'all') => {
      if (!nurseryId) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await getManagerPlantInstances(
          nurseryId,
          {
            pageNumber: nextPage,
            pageSize: nextSize,
            status: nextStatus === 'all' ? undefined : nextStatus,
          },
          true
        );
        const payload = getPayload<PaginatedPayload<PlantInstanceItem>>(response);

        if (!payload) {
          setItems([]);
          setPagination((prev) => ({ ...prev, pageNumber: nextPage, pageSize: nextSize, totalCount: 0 }));
          return;
        }

        setItems(payload.items);
        setPagination({
          pageNumber: payload.pageNumber,
          pageSize: payload.pageSize,
          totalCount: payload.totalCount,
        });
      } catch (fetchError) {
        setError(getErrorMessage(fetchError, 'Failed to load plant instances'));
      } finally {
        setLoading(false);
      }
    },
    [nurseryId]
  );

  const fetchEnumValues = useCallback(async () => {
    try {
      const response = await getPlantInstanceEnums(true);
      const payload = getPayload<PlantInstanceEnumGroup[]>(response) ?? [];
      const enumGroup = payload.find((group) => group.enumName === 'PlantInstanceStatus');
      setStatusOptions(enumGroup?.values ?? []);
    } catch {
      setStatusOptions([]);
    }
  }, []);

  const fetchCreatePlantOptions = useCallback(async () => {
    setCreatePlantOptionsLoading(true);
    try {
      const response = await searchSystemPlants(
        {
          pagination: { pageNumber: 1, pageSize: 1000 },
          isUniqueInstance: true,
        },
        true
      );
      const payload = getPayload(response);
      setCreatePlantOptions(payload?.items ?? []);
    } catch (fetchError) {
      setCreatePlantOptions([]);
      toast.error(getErrorMessage(fetchError, 'Failed to load plant options'));
    } finally {
      setCreatePlantOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!nurseryId) {
      setItems([]);
      setSummaryItems([]);
      setSelectedIds([]);
      setSelectedStatusFilter('all');
      return;
    }

    void Promise.all([
      fetchPlantSummary(),
      fetchPlantInstances(1, DEFAULT_PAGINATION.pageSize, 'all'),
      fetchEnumValues(),
    ]);
  }, [nurseryId, fetchPlantSummary, fetchPlantInstances, fetchEnumValues]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const totals = useMemo(() => {
    return summaryItems.reduce(
      (acc, item) => {
        acc.totalInstances += item.totalInstances;
        acc.available += item.availableCount;
        acc.sold += item.soldCount;
        acc.reserved += item.reservedCount;
        acc.damaged += item.damagedCount;
        acc.inactive += item.inactive;
        return acc;
      },
      {
        totalInstances: 0,
        available: 0,
        sold: 0,
        reserved: 0,
        damaged: 0,
        inactive: 0,
      }
    );
  }, [summaryItems]);

  const allCurrentPageSelected = items.length > 0 && items.every((item) => selectedSet.has(item.plantInstanceId));

  const toggleSingleSelect = (instanceId: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(instanceId)) {
        return prev.filter((id) => id !== instanceId);
      }
      return [...prev, instanceId];
    });
  };

  const toggleSelectAllCurrentPage = () => {
    if (allCurrentPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !items.some((item) => item.plantInstanceId === id)));
      return;
    }

    setSelectedIds((prev) => {
      const merged = new Set(prev);
      items.forEach((item) => merged.add(item.plantInstanceId));
      return Array.from(merged);
    });
  };

  const handleRowStatusUpdate = async (instanceId: number, status: number) => {
    setSubmitting(true);
    try {
      await updateManagerPlantInstanceStatus(instanceId, { status }, true);
      toast.success('Plant instance status updated successfully');
      await fetchPlantInstances(pagination.pageNumber, pagination.pageSize, selectedStatusFilter);
      await fetchPlantSummary();
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, 'Failed to update status'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchStatusUpdate = async () => {
    if (selectedIds.length === 0 || batchStatus === '') {
      return;
    }

    setSubmitting(true);
    try {
      await batchUpdateManagerPlantInstanceStatus(
        {
          instanceIds: selectedIds,
          status: batchStatus,
        },
        true
      );
      toast.success('Batch status update successful');
      setSelectedIds([]);
      setBatchStatus('');
      await fetchPlantInstances(pagination.pageNumber, pagination.pageSize, selectedStatusFilter);
      await fetchPlantSummary();
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, 'Batch status update failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubmit = async (value: PlantInstanceCreateSubmitValue) => {
    if (!nurseryId) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await createManagerPlantInstanceBatch(
        nurseryId,
        {
          instances: [value.form],
        },
        true
      );

      const payload = getPayload(response);
      const instanceId = payload?.instances?.[0]?.id;

      if (!instanceId) {
        toast.error('Create instance succeeded but no instance id returned');
        return;
      }

      const thumbnail = value.images.find((image) => image.isThumbnail && image.file)?.file;
      const normalFiles = value.images
        .filter((image) => !image.isThumbnail && image.file)
        .map((image) => image.file as File);

      let hasUploadError = false;

      if (thumbnail) {
        try {
          await uploadManagerPlantInstanceThumbnail(instanceId, thumbnail, true);
        } catch {
          hasUploadError = true;
          toast.error('Plant instance created but thumbnail upload failed');
        }
      }

      if (normalFiles.length > 0) {
        try {
          await uploadManagerPlantInstanceImages(instanceId, normalFiles, true);
        } catch {
          hasUploadError = true;
          toast.error('Plant instance created but gallery upload failed');
        }
      }

      if (!hasUploadError) {
        toast.success('Plant instance created successfully');
      } else {
        toast.warning('Plant instance created with partial image upload errors');
      }

      setCreateOpen(false);
      await fetchPlantInstances(1, pagination.pageSize, selectedStatusFilter);
      await fetchPlantSummary();
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, 'Failed to create plant instance'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCreate = async () => {
    setCreateOpen(true);
    await fetchCreatePlantOptions();
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    void fetchPlantInstances(newPage + 1, pagination.pageSize, selectedStatusFilter);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextPageSize = Number(event.target.value);
    void fetchPlantInstances(1, nextPageSize, selectedStatusFilter);
  };

  const handleStatusFilterChange = (value: number | 'all') => {
    setSelectedStatusFilter(value);
    setSelectedIds([]);
    void fetchPlantInstances(1, pagination.pageSize, value);
  };

  if (!nurseryId) {
    return (
      <Alert severity="warning">
        Could not resolve the manager nursery. Please verify account permissions.
      </Alert>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap">
          <Chip label={`Total Instances: ${totals.totalInstances}`} sx={{ bgcolor: '#ecfff3' }} />
          <Chip label={`Available: ${totals.available}`} color="success" variant="outlined" />
          <Chip label={`Sold: ${totals.sold}`} variant="outlined" />
          <Chip label={`Reserved: ${totals.reserved}`} color="warning" variant="outlined" />
          <Chip label={`Damaged: ${totals.damaged}`} color="error" variant="outlined" />
          <Chip label={`Inactive: ${totals.inactive}`} color="info" variant="outlined" />
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<AutorenewIcon />}
            variant="outlined"
            onClick={() =>
              void Promise.all([
                fetchPlantSummary(),
                fetchPlantInstances(pagination.pageNumber, pagination.pageSize, selectedStatusFilter),
              ])
            }
            disabled={loading || summaryLoading}
          >
            Refresh
          </Button>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => void handleOpenCreate()}
            disabled={createPlantOptionsLoading}
            sx={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Add Plant Instance
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel id="status-filter-label">Filter Status</InputLabel>
          <Select
            labelId="status-filter-label"
            label="Filter Status"
            value={selectedStatusFilter}
            onChange={(event) => handleStatusFilterChange(event.target.value as number | 'all')}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            {statusOptions.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip label={`Selected: ${selectedIds.length}`} variant="outlined" />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="batch-status-label">Batch Status</InputLabel>
            <Select
              labelId="batch-status-label"
              label="Batch Status"
              value={batchStatus}
              onChange={(event) => setBatchStatus(event.target.value as number | '')}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DoneAllIcon />}
            disabled={selectedIds.length === 0 || batchStatus === '' || submitting}
            onClick={() => void handleBatchStatusUpdate()}
          >
            Apply Batch
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ border: '1px solid var(--card-border)' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f4fff8' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  size="small"
                  checked={allCurrentPageSelected}
                  indeterminate={selectedIds.length > 0 && !allCurrentPageSelected}
                  onChange={toggleSelectAllCurrentPage}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Plant</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Price</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Height</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Health</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                  <Typography variant="body2" color="text.secondary">
                    No plant instances found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.plantInstanceId} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={selectedSet.has(item.plantInstanceId)}
                      onChange={() => toggleSingleSelect(item.plantInstanceId)}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={item.primaryImageUrl ?? undefined} alt={item.plantName} variant="rounded" />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{item.plantName}</Typography>
                        <Typography variant="caption" color="text.secondary">ID: {item.plantId}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{item.sku ?? '-'}</TableCell>
                  <TableCell align="right">{formatCurrency(item.specificPrice, 'vi')}</TableCell>
                  <TableCell align="right">{item.height} cm</TableCell>
                  <TableCell>{item.healthStatus}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.statusName}
                      color={statusColorMap[item.status] ?? 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell align="center">
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                      <Select
                        value={item.status}
                        onChange={(event) => void handleRowStatusUpdate(item.plantInstanceId, Number(event.target.value))}
                        disabled={submitting}
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={pagination.totalCount}
          page={Math.max(pagination.pageNumber - 1, 0)}
          onPageChange={handleChangePage}
          rowsPerPage={pagination.pageSize}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="Rows"
        />
      </TableContainer>

      <PlantInstanceCreateDialog
        open={createOpen}
        plants={createPlantOptions}
        loadingPlants={createPlantOptionsLoading}
        submitting={submitting}
        onClose={() => setCreateOpen(false)}
        onSubmit={(value) => void handleCreateSubmit(value)}
      />
    </Box>
  );
}
