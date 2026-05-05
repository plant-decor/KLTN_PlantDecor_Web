'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  IconButton,
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
// import AutorenewIcon from '@mui/icons-material/Autorenew';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { CustomLoading } from '@/components/CustomLoading';
import {
  batchUpdateManagerPlantInstanceStatus,
  createManagerPlantInstanceBatch,
  getManagerPlantInstances,
  getManagerPlantsSummary,
  getPlantInstanceEnums,
  searchSystemPlants,
  updateManagerPlantInstance,
  updateManagerPlantInstanceStatus,
  uploadManagerPlantInstanceImages,
  uploadManagerPlantInstanceThumbnail,
} from '@/lib/api/managerStoreCatalogService';
import { generatePlantInstanceSku } from '@/lib/utils/plantInstanceSku';
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
import PlantInstanceDetailDialog from './PlantInstanceDetailDialog';
// import { formatDateTime } from '@/lib/utils/dateUtils';

interface PlantInstanceManagerTabProps {
  nurseryId: number | null;
  readOnly?: boolean;
  /** Tên manager vườn — dùng khi sinh SKU tự động */
  managerName?: string;
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

// const statusColorMap: Record<number, 'success' | 'warning' | 'default' | 'error' | 'info'> = {
//   1: 'success',
//   2: 'default',
//   3: 'warning',
//   4: 'error',
//   5: 'info',
// };

export default function PlantInstanceManagerTab({
  nurseryId,
  readOnly = false,
  managerName = '',
}: PlantInstanceManagerTabProps) {
  const [summaryItems, setSummaryItems] = useState<PlantSummaryItem[]>([]);
  // const [summaryLoading, setSummaryLoading] = useState(false);

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

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(null);
  const [detailDefaultMode, setDetailDefaultMode] = useState<'view' | 'edit'>('view');

  const fetchPlantSummary = useCallback(async () => {
    if (!nurseryId) {
      setSummaryItems([]);
      return;
    }

    // setSummaryLoading(true);
    try {
      const response = await getManagerPlantsSummary(nurseryId, true);
      const payload = getPayload<PlantSummaryItem[]>(response) ?? [];
      setSummaryItems(payload);
    } catch {
      setSummaryItems([]);
    } finally {
      // setSummaryLoading(false);
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
          isActive: true,
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
    if (readOnly) {
      return;
    }
    setSubmitting(true);
    try {
      await updateManagerPlantInstanceStatus(instanceId, { status }, true);
      await fetchPlantInstances(pagination.pageNumber, pagination.pageSize, selectedStatusFilter);
      await fetchPlantSummary();
    } catch {
      // Error toast is handled globally by axios interceptor.
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchStatusUpdate = async () => {
    if (readOnly) {
      return;
    }
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
      setSelectedIds([]);
      setBatchStatus('');
      await fetchPlantInstances(pagination.pageNumber, pagination.pageSize, selectedStatusFilter);
      await fetchPlantSummary();
    } catch {
      // Error toast is handled globally by axios interceptor.
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubmit = async (value: PlantInstanceCreateSubmitValue) => {
    if (readOnly) {
      return;
    }
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

      if (hasUploadError) {
        toast.warning('Plant instance created with partial image upload errors');
      }

      const created = payload?.instances?.[0];
      if (created && (!created.sku || !String(created.sku).trim())) {
        try {
          await updateManagerPlantInstance(
            created.id,
            {
              sku: generatePlantInstanceSku({
                plantName: created.plantName,
                managerName,
              }),
              specificPrice: created.specificPrice,
              height: created.height,
              trunkDiameter: created.trunkDiameter ?? null,
              healthStatus: created.healthStatus,
              age: created.age,
              description: created.description ?? '',
            },
            true
          );
        } catch {
          // Error toast is handled globally by axios interceptor.
        }
      }

      setCreateOpen(false);
      await fetchPlantInstances(1, pagination.pageSize, selectedStatusFilter);
      await fetchPlantSummary();
    } catch {
      // Error toast is handled globally by axios interceptor.
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCreate = async () => {
    if (readOnly) {
      return;
    }
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

  const handleOpenDetail = (instanceId: number, mode: 'view' | 'edit' = 'view') => {
    setDetailDefaultMode(mode);
    setSelectedInstanceId(instanceId);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedInstanceId(null);
    setDetailDefaultMode('view');
  };

  const handleDetailUpdated = () => {
    void fetchPlantInstances(pagination.pageNumber, pagination.pageSize, selectedStatusFilter);
    void fetchPlantSummary();
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
          {/* <Button
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
          </Button> */}
          {!readOnly ? (
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => void handleOpenCreate()}
              disabled={createPlantOptionsLoading}
              sx={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Add Plant Instance
            </Button>
          ) : null}
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

        {!readOnly ? (
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
              startIcon={<DoneAllIcon />}
              disabled={selectedIds.length === 0 || batchStatus === '' || submitting}
              onClick={() => void handleBatchStatusUpdate()}
              className='bg-primary!'
            >
              Apply Batch
            </Button>
          </Stack>
        ) : null}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ border: '1px solid var(--card-border)' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
            <TableRow>
              <TableCell padding="checkbox">
                {!readOnly ? (
                  <Checkbox
                    size="small"
                    checked={allCurrentPageSelected}
                    indeterminate={selectedIds.length > 0 && !allCurrentPageSelected}
                    onChange={toggleSelectAllCurrentPage}
                  />
                ) : null}
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Plant</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">SKU</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Price</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Height</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Health</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
              {/* <TableCell sx={{ fontWeight: 700 }} align="center">Updated</TableCell> */}
              <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <CustomLoading size={24} />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <Typography variant="body2" color="text.secondary">
                    No plant instances found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.plantInstanceId} hover>
                  <TableCell padding="checkbox">
                    {!readOnly ? (
                      <Checkbox
                        size="small"
                        checked={selectedSet.has(item.plantInstanceId)}
                        onChange={() => toggleSingleSelect(item.plantInstanceId)}
                      />
                    ) : null}
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
                  <TableCell align="center">{item.sku ?? '-'}</TableCell>
                  <TableCell align="center">{formatCurrency(item.specificPrice, 'vi')}</TableCell>
                  <TableCell align="center">{item.height} cm</TableCell>
                  <TableCell align="center">{item.healthStatus}</TableCell>
                  {/* <TableCell align="center">{item.statusName}</TableCell> */}
                  <TableCell align="center">
                    <Box>
                      {!readOnly ? (
                        <FormControl size="small" sx={{ minWidth: 140, maxWidth: 220 }}>
                          <Select
                            value={item.status}
                            onChange={(event) =>
                              void handleRowStatusUpdate(item.plantInstanceId, Number(event.target.value))
                            }
                            disabled={submitting}
                          >
                            {statusOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : null}
                    </Box>
                  </TableCell>
                  <TableCell align="center">

                    {/* </TableCell>
                  <TableCell align="center"> */}
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                      <IconButton
                        size="small"
                        title="View details"
                        onClick={() => handleOpenDetail(item.plantInstanceId, 'view')}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      {!readOnly ? (
                        <IconButton
                          size="small"
                          title="Edit instance"
                          onClick={() => handleOpenDetail(item.plantInstanceId, 'edit')}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      ) : null}
                    </Stack>
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

      {!readOnly ? (
        <PlantInstanceCreateDialog
          open={createOpen}
          plants={createPlantOptions}
          loadingPlants={createPlantOptionsLoading}
          submitting={submitting}
          onClose={() => setCreateOpen(false)}
          onSubmit={(value) => void handleCreateSubmit(value)}
        />
      ) : null}

      <PlantInstanceDetailDialog
        open={detailOpen}
        instanceId={selectedInstanceId}
        readOnly={readOnly}
        defaultMode={detailDefaultMode}
        managerName={managerName}
        statusOptions={statusOptions}
        onClose={handleCloseDetail}
        onUpdated={handleDetailUpdated}
      />
    </Box>
  );
}
