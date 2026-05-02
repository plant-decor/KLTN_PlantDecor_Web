'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Add, Edit, ToggleOff, ToggleOn } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import { CustomLoading } from '@/components/CustomLoading';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import {
  getMyManagerNurseryMaterials,
  importManagerNurseryMaterial,
  toggleManagerNurseryMaterialActive,
  updateManagerNurseryMaterial,
} from '@/lib/api/managerNurseryMaterialsService';
import { searchAdminMaterials } from '@/lib/api/adminMaterialsService';
import type { Material } from '@/types/store-management.types';
import type {
  ImportNurseryMaterialRequest,
  NurseryMaterialItem,
  PaginatedPayload,
  UpdateNurseryMaterialRequest,
} from '@/types/manager-store-catalog.types';
import {
  DEFAULT_MANAGER_EDIT_FORM,
  DEFAULT_MANAGER_IMPORT_FORM,
  DEFAULT_MANAGER_PAGINATION,
  getErrorMessage,
  getPayload,
  type ManagerEditFormValue,
  type ManagerImportFormValue,
  type ManagerPaginationState,
} from './MaterialTab.shared';

interface ManagerMaterialModeProps {
  readOnly?: boolean;
  headerActions?: React.ReactNode;
}

export default function ManagerMaterialMode({ readOnly = false, headerActions = null }: ManagerMaterialModeProps) {
  const [items, setItems] = useState<NurseryMaterialItem[]>([]);
  const [pagination, setPagination] = useState<ManagerPaginationState>(DEFAULT_MANAGER_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [catalog, setCatalog] = useState<Material[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [importForm, setImportForm] = useState<ManagerImportFormValue>(DEFAULT_MANAGER_IMPORT_FORM);

  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NurseryMaterialItem | null>(null);
  const [editForm, setEditForm] = useState<ManagerEditFormValue>(DEFAULT_MANAGER_EDIT_FORM);

  const [toggleOpen, setToggleOpen] = useState(false);
  const [toggleItem, setToggleItem] = useState<NurseryMaterialItem | null>(null);

  const fetchItems = useCallback(async (nextPage: number, nextSize: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyManagerNurseryMaterials({
        pageNumber: nextPage,
        pageSize: nextSize,
      });
      const payload = getPayload<PaginatedPayload<NurseryMaterialItem>>(response);

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
      setError(getErrorMessage(fetchError, 'Failed to load nursery materials'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems(1, pagination.pageSize);
  }, [fetchItems, pagination.pageSize]);

  const fetchMaterialCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const response = await searchAdminMaterials({
        pagination: { pageNumber: 1, pageSize: 100 },
      });
      const payload = getPayload(response);
      const catalogItems = payload?.items ?? [];
      setCatalog(catalogItems);
      return catalogItems as Material[];
    } catch (fetchError) {
      toast.error(getErrorMessage(fetchError, 'Failed to load material catalog'));
      setCatalog([]);
      return [] as Material[];
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  const handleOpenImport = useCallback(async () => {
    if (readOnly) {
      return;
    }
    setImportOpen(true);
    const materials = await fetchMaterialCatalog();
    setImportForm({
      materialId: materials[0]?.id ?? 0,
      quantity: 1,
      expiredDate: '',
    });
  }, [fetchMaterialCatalog, readOnly]);

  const handleCloseImport = useCallback(() => {
    setImportOpen(false);
    setImportForm(DEFAULT_MANAGER_IMPORT_FORM);
  }, []);

  const handleSubmitImport = useCallback(async () => {
    if (readOnly) {
      return;
    }
    if (submitting || catalogLoading || importForm.materialId <= 0 || importForm.quantity <= 0) {
      return;
    }

    const payload: ImportNurseryMaterialRequest = {
      materialId: importForm.materialId,
      quantity: importForm.quantity,
      expiredDate: importForm.expiredDate || null,
    };

    setSubmitting(true);
    try {
      await importManagerNurseryMaterial(payload);
      toast.success('Material imported successfully');
      handleCloseImport();
      await fetchItems(1, pagination.pageSize);
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, 'Import failed'));
    } finally {
      setSubmitting(false);
    }
  }, [catalogLoading, fetchItems, handleCloseImport, importForm.expiredDate, importForm.materialId, importForm.quantity, pagination.pageSize, readOnly, submitting]);

  const handleOpenEdit = useCallback((item: NurseryMaterialItem) => {
    if (readOnly) {
      return;
    }
    setEditingItem(item);
    setEditForm({
      quantity: item.quantity,
      expiredDate: item.expiredDate ?? '',
      isActive: item.isActive,
    });
    setEditOpen(true);
  }, [readOnly]);

  const handleCloseEdit = useCallback(() => {
    setEditOpen(false);
    setEditingItem(null);
    setEditForm(DEFAULT_MANAGER_EDIT_FORM);
  }, []);

  const handleSubmitEdit = useCallback(async () => {
    if (readOnly) {
      return;
    }
    if (!editingItem || submitting || editForm.quantity < 0) {
      return;
    }

    const payload: UpdateNurseryMaterialRequest = {
      quantity: editForm.quantity,
      expiredDate: editForm.expiredDate || null,
      isActive: editForm.isActive,
    };

    setSubmitting(true);
    try {
      await updateManagerNurseryMaterial(editingItem.id, payload);
      toast.success('Material updated successfully');
      handleCloseEdit();
      await fetchItems(pagination.pageNumber, pagination.pageSize);
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, 'Update failed'));
    } finally {
      setSubmitting(false);
    }
  }, [editForm.expiredDate, editForm.isActive, editForm.quantity, editingItem, fetchItems, handleCloseEdit, pagination.pageNumber, pagination.pageSize, readOnly, submitting]);

  const handleOpenToggle = useCallback((item: NurseryMaterialItem) => {
    if (readOnly) {
      return;
    }
    setToggleItem(item);
    setToggleOpen(true);
  }, [readOnly]);

  const handleCloseToggle = useCallback(() => {
    setToggleOpen(false);
    setToggleItem(null);
  }, []);

  const handleSubmitToggle = useCallback(async () => {
    if (readOnly) {
      return;
    }
    if (!toggleItem || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await toggleManagerNurseryMaterialActive(toggleItem.id);
      toast.success(toggleItem.isActive ? 'Material deactivated' : 'Material activated');
      handleCloseToggle();
      await fetchItems(pagination.pageNumber, pagination.pageSize);
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, 'Toggle status failed'));
    } finally {
      setSubmitting(false);
    }
  }, [fetchItems, handleCloseToggle, pagination.pageNumber, pagination.pageSize, readOnly, submitting, toggleItem]);

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    void fetchItems(newPage + 1, pagination.pageSize);
  }, [fetchItems, pagination.pageSize]);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const nextPageSize = Number(event.target.value);
    void fetchItems(1, nextPageSize);
  }, [fetchItems]);

  // const pageQuantitySum = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Chip label={`Total rows: ${pagination.totalCount}`} sx={{ bgcolor: '#ecfff3' }} />
          {/* <Chip label={`Page quantity sum: ${pageQuantitySum}`} sx={{ bgcolor: '#ecf7ff' }} /> */}
        </Stack>

        <Stack direction="row" spacing={1}>
          {/* <Button
            variant="outlined"
            onClick={() => void fetchItems(pagination.pageNumber, pagination.pageSize)}
            disabled={loading || submitting}
          >
            Refresh
          </Button> */}
          {headerActions}
          {!readOnly ? (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => void handleOpenImport()}
              sx={{ ...hoverLiftStyle }}
              className="bg-primary!"
              disabled={submitting}
            >
              Import material
            </Button>
          ) : null}
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
              <TableCell sx={{ fontWeight: 700 }}>Material</TableCell>
              {/* <TableCell sx={{ fontWeight: 700 }}>Code</TableCell> */}
              <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Quantity</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Reserved</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Available</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Expired Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                  <CustomLoading size={24} />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                  <Typography variant="body2" color="text.secondary">
                    No nursery materials found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{item.materialName}</Typography>
                    <Typography variant="caption" color="text.secondary">Material ID: {item.materialId}</Typography>
                  </TableCell>
                  {/* <TableCell>{item.materialCode}</TableCell> */}
                  <TableCell>{item.unit}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{item.reservedQuantity}</TableCell>
                  <TableCell align="right">{item.availableQuantity}</TableCell>
                  <TableCell>{item.expiredDate || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.isActive ? 'Active' : 'Inactive'}
                      color={item.isActive ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {!readOnly ? (
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenEdit(item)}
                            disabled={submitting}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={item.isActive ? 'Deactivate' : 'Activate'}>
                          <IconButton
                            size="small"
                            color={item.isActive ? 'success' : 'default'}
                            onClick={() => handleOpenToggle(item)}
                            disabled={submitting}
                          >
                            {item.isActive ? <ToggleOn fontSize="small" /> : <ToggleOff fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Read-only
                      </Typography>
                    )}
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
        <>
          <Dialog open={importOpen} onClose={submitting ? undefined : handleCloseImport} maxWidth="sm" fullWidth>
            <DialogTitle>Import material</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <FormControl fullWidth disabled={catalogLoading || submitting}>
                  <InputLabel id="manager-material-select-label">Material</InputLabel>
                  <Select
                    labelId="manager-material-select-label"
                    value={importForm.materialId}
                    label="Material"
                    onChange={(event) =>
                      setImportForm((prev) => ({ ...prev, materialId: Number(event.target.value) }))
                    }
                  >
                    {catalog.map((material) => (
                      <MenuItem key={material.id} value={material.id}>
                        {material.materialCode} - {material.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {catalogLoading && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CustomLoading size={18} />
                    <Typography variant="body2" color="text.secondary">
                      Loading material catalog...
                    </Typography>
                  </Stack>
                )}

                {!catalogLoading && catalog.length === 0 && (
                  <Alert severity="warning">No material available to import.</Alert>
                )}

                <TextField
                  type="number"
                  label="Quantity"
                  value={importForm.quantity}
                  onChange={(event) => setImportForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))}
                  inputProps={{ min: 1 }}
                  fullWidth
                  disabled={submitting || catalogLoading || catalog.length === 0}
                />

                <TextField
                  type="date"
                  label="Expired Date"
                  value={importForm.expiredDate}
                  onChange={(event) => setImportForm((prev) => ({ ...prev, expiredDate: event.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={submitting || catalogLoading || catalog.length === 0}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseImport} disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={() => void handleSubmitImport()}
                variant="contained"
                disabled={
                  submitting ||
                  catalogLoading ||
                  catalog.length === 0 ||
                  importForm.materialId <= 0 ||
                  importForm.quantity <= 0
                }
              >
                Import
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={editOpen} onClose={submitting ? undefined : handleCloseEdit} maxWidth="sm" fullWidth>
            <DialogTitle>Edit material quantity</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  type="number"
                  label="Quantity"
                  value={editForm.quantity}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))}
                  inputProps={{ min: 0 }}
                  fullWidth
                  disabled={submitting}
                />

                <TextField
                  type="date"
                  label="Expired Date"
                  value={editForm.expiredDate}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, expiredDate: event.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={submitting}
                />

                <FormControl fullWidth disabled={submitting}>
                  <InputLabel id="manager-material-status-label">Status</InputLabel>
                  <Select
                    labelId="manager-material-status-label"
                    value={editForm.isActive ? 'active' : 'inactive'}
                    label="Status"
                    onChange={(event) => setEditForm((prev) => ({ ...prev, isActive: event.target.value === 'active' }))}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEdit} disabled={submitting}>
                Cancel
              </Button>
              <Button
                sx={{ backgroundColor: 'var(--primary)' }}
                onClick={() => void handleSubmitEdit()}
                variant="contained"
                disabled={submitting || editForm.quantity < 0}
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={toggleOpen} onClose={submitting ? undefined : handleCloseToggle}>
            <DialogTitle>Confirm status change</DialogTitle>
            <DialogContent>
              <Typography variant="body2">
                {toggleItem ? `Change status for ${toggleItem.materialName}?` : 'Change status for this nursery material?'}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseToggle} disabled={submitting}>
                Cancel
              </Button>
              <Button className="bg-primary!" onClick={() => void handleSubmitToggle()} variant="contained" disabled={submitting}>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
    </Box>
  );
}
