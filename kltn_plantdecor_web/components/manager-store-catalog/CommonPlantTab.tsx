'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import {
  createManagerCommonPlant,
  getAvailableImportCommonPlants,
  getManagerCommonPlants,
  toggleManagerCommonPlantActive,
  updateManagerCommonPlant,
} from '@/lib/api/managerStoreCatalogService';
import type {
  AvailableImportCommonPlantItem,
  CommonPlantInventoryItem,
  PaginatedPayload,
} from '@/types/manager-store-catalog.types';
import type { ResponseModel } from '@/types/api.types';
import CommonPlantEditDialog, { type UpdateFormValue } from './CommonPlantEditDialog';
import CommonPlantImportDialog, { type ImportFormValue } from './CommonPlantImportDialog';

interface CommonPlantTabProps {
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

const DEFAULT_IMPORT_FORM: ImportFormValue = {
  plantId: 0,
  quantity: 1,
  isActive: true,
};

const DEFAULT_EDIT_FORM: UpdateFormValue = {
  quantity: 0,
  reservedQuantity: 0,
  isActive: true,
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

export default function CommonPlantTab({ nurseryId }: CommonPlantTabProps) {
  const [items, setItems] = useState<CommonPlantInventoryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [importForm, setImportForm] = useState<ImportFormValue>(DEFAULT_IMPORT_FORM);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [availablePlants, setAvailablePlants] = useState<AvailableImportCommonPlantItem[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CommonPlantInventoryItem | null>(null);
  const [editForm, setEditForm] = useState<UpdateFormValue>(DEFAULT_EDIT_FORM);

  const [toggleOpen, setToggleOpen] = useState(false);
  const [toggleItem, setToggleItem] = useState<CommonPlantInventoryItem | null>(null);

  const fetchCommonPlants = useCallback(
    async (nextPage = pagination.pageNumber, nextSize = pagination.pageSize) => {
      if (!nurseryId) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await getManagerCommonPlants(
          nurseryId,
          { pageNumber: nextPage, pageSize: nextSize },
          true
        );
        const payload = getPayload<PaginatedPayload<CommonPlantInventoryItem>>(response);

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
        setError(getErrorMessage(fetchError, 'Failed to load common plants'));
      } finally {
        setLoading(false);
      }
    },
    [nurseryId, pagination.pageNumber, pagination.pageSize]
  );

  useEffect(() => {
    if (!nurseryId) {
      setItems([]);
      return;
    }

    void fetchCommonPlants(1, pagination.pageSize);
  }, [nurseryId, fetchCommonPlants, pagination.pageSize]);

  const fetchAvailablePlants = useCallback(async () => {
    if (!nurseryId) {
      return [] as AvailableImportCommonPlantItem[];
    }

    setAvailableLoading(true);
    try {
      const response = await getAvailableImportCommonPlants(
        nurseryId,
        { pageNumber: 1, pageSize: 100 },
        true
      );
      const payload = getPayload<PaginatedPayload<AvailableImportCommonPlantItem>>(response);
      const nextItems = payload?.items ?? [];
      setAvailablePlants(nextItems);
      return nextItems;
    } catch {
      setAvailablePlants([]);
      return [] as AvailableImportCommonPlantItem[];
    } finally {
      setAvailableLoading(false);
    }
  }, [nurseryId]);

  const handleOpenImport = async () => {
    setImportOpen(true);
    const nextItems = await fetchAvailablePlants();
    setImportForm({
      plantId: nextItems[0]?.id ?? 0,
      quantity: 1,
      isActive: true,
    });
  };

  const handleImportSubmit = async () => {
    if (!nurseryId) {
      return;
    }

    setSubmitting(true);
    try {
      await createManagerCommonPlant(nurseryId, importForm, true);
      setImportOpen(false);
      setImportForm(DEFAULT_IMPORT_FORM);
      await fetchCommonPlants(1, pagination.pageSize);
    } catch {
      // Error toast is handled globally by axios interceptor.
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: CommonPlantInventoryItem) => {
    setEditingItem(item);
    setEditForm({
      quantity: item.quantity,
      reservedQuantity: item.reservedQuantity,
      isActive: item.isActive,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!nurseryId || !editingItem) {
      return;
    }

    setSubmitting(true);
    try {
      await updateManagerCommonPlant(nurseryId, editingItem.id, editForm, true);
      setEditOpen(false);
      setEditingItem(null);
      setEditForm(DEFAULT_EDIT_FORM);
      await fetchCommonPlants();
    } catch {
      // Error toast is handled globally by axios interceptor.
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = (item: CommonPlantInventoryItem) => {
    setToggleItem(item);
    setToggleOpen(true);
  };

  const confirmToggle = async () => {
    if (!nurseryId || !toggleItem) {
      return;
    }

    setSubmitting(true);
    try {
      await toggleManagerCommonPlantActive(nurseryId, toggleItem.id, true);
      setToggleOpen(false);
      setToggleItem(null);
      await fetchCommonPlants();
    } catch {
      // Error toast is handled globally by axios interceptor.
    } finally {
      setSubmitting(false);
    }
  };

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    void fetchCommonPlants(newPage + 1, pagination.pageSize);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextPageSize = Number(event.target.value);
    void fetchCommonPlants(1, nextPageSize);
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
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Chip label={`Total rows: ${pagination.totalCount}`} sx={{ bgcolor: '#ecfff3' }} />
          <Chip label={`Page quantity sum: ${totalQuantity}`} sx={{ bgcolor: '#ecf7ff' }} />
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<AutorenewIcon />}
            variant="outlined"
            onClick={() => void fetchCommonPlants()}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => void handleOpenImport()}
            sx={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Import Plant
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
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Plant Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Quantity
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Reserved
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Available
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <Typography variant="body2" color="text.secondary">
                    No common plants found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {item.plantName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Plant ID: {item.plantId}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{item.reservedQuantity}</TableCell>
                  <TableCell align="right">{item.availableQuantity}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.isActive ? 'Active' : 'Inactive'}
                      color={item.isActive ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => handleEdit(item)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={item.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          color={item.isActive ? 'success' : 'default'}
                          onClick={() => handleToggle(item)}
                        >
                          {item.isActive ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
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

      <CommonPlantImportDialog
        open={importOpen}
        availablePlants={availablePlants}
        loadingAvailable={availableLoading}
        submitting={submitting}
        form={importForm}
        onFormChange={setImportForm}
        onClose={() => {
          setImportOpen(false);
          setImportForm(DEFAULT_IMPORT_FORM);
        }}
        onSubmit={handleImportSubmit}
      />

      <CommonPlantEditDialog
        open={editOpen}
        item={editingItem}
        submitting={submitting}
        form={editForm}
        onFormChange={setEditForm}
        onClose={() => {
          setEditOpen(false);
          setEditingItem(null);
          setEditForm(DEFAULT_EDIT_FORM);
        }}
        onSubmit={handleEditSubmit}
      />

      <Dialog open={toggleOpen} onClose={() => setToggleOpen(false)}>
        <DialogTitle>Confirm status change</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {toggleItem
              ? `Change status for ${toggleItem.plantName}?`
              : 'Change status for this common plant?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToggleOpen(false)}>Cancel</Button>
          <Button
            onClick={() => void confirmToggle()}
            variant="contained"
            disabled={submitting}
            sx={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
