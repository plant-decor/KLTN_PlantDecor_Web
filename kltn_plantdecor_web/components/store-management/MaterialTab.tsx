'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Button,
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
import { Add, Edit, ToggleOff, ToggleOn } from '@mui/icons-material';
import { toast } from 'react-toastify';
import MaterialTable from './MaterialTable';
import MaterialFormDialog from './MaterialFormDialog';
import MaterialViewDialog from './MaterialViewDialog';
import type {
  Material,
  MaterialDetail,
  MaterialFormData,
  ImageUploadData,
} from '@/types/store-management.types';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { useAdminMaterials } from '@/lib/api/admin/useAdminMaterials';
import { useAdminCategories } from '@/lib/api/admin/useAdminCategories';
import { useAdminTags } from '@/lib/api/admin/useAdminTags';
import type { ResponseModel } from '@/types/api.types';
import type {
  ImportNurseryMaterialRequest,
  NurseryMaterialItem,
  PaginatedPayload,
  UpdateNurseryMaterialRequest,
} from '@/types/manager-store-catalog.types';
import {
  getMyManagerNurseryMaterials,
  importManagerNurseryMaterial,
  toggleManagerNurseryMaterialActive,
  updateManagerNurseryMaterial,
} from '@/lib/api/managerNurseryMaterialsService';
import { searchAdminMaterials } from '@/lib/api/adminMaterialsService';

interface MaterialTabProps {
  initialMaterials?: Material[];
  mode?: 'admin' | 'manager';
}

interface OptionItem {
  id: number;
  name: string;
}

interface CategoryTreeNodeLike {
  id?: number | string;
  name?: string;
  subCategories?: CategoryTreeNodeLike[];
  children?: CategoryTreeNodeLike[];
}

const flattenCategoryTree = (nodes: CategoryTreeNodeLike[]): OptionItem[] => {
  const results: OptionItem[] = [];

  const visit = (items: CategoryTreeNodeLike[]) => {
    items.forEach((node) => {
      if (!node || typeof node !== 'object') {
        return;
      }

      const id = Number(node.id);
      if (Number.isFinite(id)) {
        results.push({ id, name: String(node.name ?? id) });
      }

      const children = Array.isArray(node.subCategories)
        ? node.subCategories
        : Array.isArray(node.children)
          ? node.children
          : [];

      if (children.length > 0) {
        visit(children);
      }
    });
  };

  visit(nodes);

  const deduped = new Map<number, OptionItem>();
  results.forEach((item) => deduped.set(item.id, item));

  return Array.from(deduped.values());
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

interface ManagerImportFormValue {
  materialId: number;
  quantity: number;
  expiredDate: string;
}

interface ManagerEditFormValue {
  quantity: number;
  expiredDate: string;
  isActive: boolean;
}

interface ManagerPaginationState {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

const DEFAULT_MANAGER_IMPORT_FORM: ManagerImportFormValue = {
  materialId: 0,
  quantity: 1,
  expiredDate: '',
};

const DEFAULT_MANAGER_EDIT_FORM: ManagerEditFormValue = {
  quantity: 0,
  expiredDate: '',
  isActive: true,
};

const DEFAULT_MANAGER_PAGINATION: ManagerPaginationState = {
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
};

function ManagerMaterialMode() {
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

  const handleOpenImport = async () => {
    setImportOpen(true);
    const materials = await fetchMaterialCatalog();
    setImportForm({
      materialId: materials[0]?.id ?? 0,
      quantity: 1,
      expiredDate: '',
    });
  };

  const handleImportSubmit = async () => {
    const payload: ImportNurseryMaterialRequest = {
      materialId: importForm.materialId,
      quantity: importForm.quantity,
      expiredDate: importForm.expiredDate || null,
    };

    setSubmitting(true);
    try {
      await importManagerNurseryMaterial(payload);
      toast.success('Material imported successfully');
      setImportOpen(false);
      setImportForm(DEFAULT_MANAGER_IMPORT_FORM);
      await fetchItems(1, pagination.pageSize);
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, 'Import failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: NurseryMaterialItem) => {
    setEditingItem(item);
    setEditForm({
      quantity: item.quantity,
      expiredDate: item.expiredDate ?? '',
      isActive: item.isActive,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingItem) {
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
      setEditOpen(false);
      setEditingItem(null);
      setEditForm(DEFAULT_MANAGER_EDIT_FORM);
      await fetchItems(pagination.pageNumber, pagination.pageSize);
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, 'Update failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = (item: NurseryMaterialItem) => {
    setToggleItem(item);
    setToggleOpen(true);
  };

  const confirmToggle = async () => {
    if (!toggleItem) {
      return;
    }

    setSubmitting(true);
    try {
      await toggleManagerNurseryMaterialActive(toggleItem.id);
      toast.success(toggleItem.isActive ? 'Material deactivated' : 'Material activated');
      setToggleOpen(false);
      setToggleItem(null);
      await fetchItems(pagination.pageNumber, pagination.pageSize);
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, 'Toggle status failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    void fetchItems(newPage + 1, pagination.pageSize);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextPageSize = Number(event.target.value);
    void fetchItems(1, nextPageSize);
  };

  const pageQuantitySum = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Chip label={`Total rows: ${pagination.totalCount}`} sx={{ bgcolor: '#ecfff3' }} />
          <Chip label={`Page quantity sum: ${pageQuantitySum}`} sx={{ bgcolor: '#ecf7ff' }} />
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => void fetchItems(pagination.pageNumber, pagination.pageSize)}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => void handleOpenImport()}
            sx={{ ...hoverLiftStyle }}
            className="bg-primary!"
          >
            Import material
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
              <TableCell sx={{ fontWeight: 700 }}>Material</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Quantity
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Reserved
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Available
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Expired Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={24} />
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
                    <Typography variant="body2" fontWeight={600}>
                      {item.materialName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Material ID: {item.materialId}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.materialCode}</TableCell>
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
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => handleEdit(item)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={item.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          color={item.isActive ? 'success' : 'default'}
                          onClick={() => handleToggle(item)}
                        >
                          {item.isActive ? <ToggleOn fontSize="small" /> : <ToggleOff fontSize="small" />}
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

      <Dialog open={importOpen} onClose={() => setImportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import material</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
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

            <TextField
              type="number"
              label="Quantity"
              value={importForm.quantity}
              onChange={(event) =>
                setImportForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))
              }
              inputProps={{ min: 1 }}
              fullWidth
            />

            <TextField
              type="date"
              label="Expired Date"
              value={importForm.expiredDate}
              onChange={(event) => setImportForm((prev) => ({ ...prev, expiredDate: event.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)}>Cancel</Button>
          <Button
            onClick={() => void handleImportSubmit()}
            variant="contained"
            disabled={submitting || catalogLoading || importForm.materialId <= 0 || importForm.quantity <= 0}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
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
            />

            <TextField
              type="date"
              label="Expired Date"
              value={editForm.expiredDate}
              onChange={(event) => setEditForm((prev) => ({ ...prev, expiredDate: event.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel id="manager-material-status-label">Status</InputLabel>
              <Select
                labelId="manager-material-status-label"
                value={editForm.isActive ? 'active' : 'inactive'}
                label="Status"
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, isActive: event.target.value === 'active' }))
                }
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            onClick={() => void handleEditSubmit()}
            variant="contained"
            disabled={submitting || editForm.quantity < 0}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={toggleOpen} onClose={() => setToggleOpen(false)}>
        <DialogTitle>Confirm status change</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {toggleItem
              ? `Change status for ${toggleItem.materialName}?`
              : 'Change status for this nursery material?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToggleOpen(false)}>Cancel</Button>
          <Button onClick={() => void confirmToggle()} variant="contained" disabled={submitting}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function AdminMaterialMode() {
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);
  const [editingData, setEditingData] = useState<MaterialDetail | undefined>();
  const [viewingData, setViewingData] = useState<MaterialDetail | undefined>();
  const [toggleTarget, setToggleTarget] = useState<Material | null>(null);

  const {
    materials,
    saving,
    detailLoading,
    error,
    pagination,
    fetchMaterials,
    fetchMaterialById,
    saveMaterial,
    toggleMaterialActive,
    setPage,
    setPageSize,
    clearError,
  } = useAdminMaterials();

  const {
    categoryTree,
    error: categoryError,
    fetchCategoryTree,
  } = useAdminCategories();

  const {
    tags,
    error: tagError,
    fetchTags,
  } = useAdminTags();

  useEffect(() => {
    void fetchMaterials({
      pagination: { pageNumber: 1, pageSize: 10 },
    });
    void fetchCategoryTree();
    void fetchTags({ pageNumber: 1, pageSize: 1000 });
  }, [fetchCategoryTree, fetchMaterials, fetchTags]);

  const categoryOptions = useMemo(
    () => flattenCategoryTree(categoryTree as CategoryTreeNodeLike[]),
    [categoryTree]
  );

  const tagOptions = useMemo<OptionItem[]>(() => {
    return tags.map((tag) => ({ id: tag.id, name: tag.tagName }));
  }, [tags]);

  const handleCreate = useCallback(() => {
    setEditingData(undefined);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback(async (material: Material) => {
    const detail = await fetchMaterialById(material.id);
    if (!detail) {
      toast.error('Failed to load material detail');
      return;
    }

    setEditingData(detail);
    setFormOpen(true);
  }, [fetchMaterialById]);

  const handleView = useCallback(async (material: Material) => {
    const detail = await fetchMaterialById(material.id);
    if (!detail) {
      toast.error('Failed to load material detail');
      return;
    }

    setViewingData(detail);
    setViewOpen(true);
  }, [fetchMaterialById]);

  const handleToggle = useCallback((material: Material) => {
    setToggleTarget(material);
    setToggleOpen(true);
  }, []);

  const handlePageChange = useCallback((pageNumber: number) => {
    void setPage(pageNumber);
  }, [setPage]);

  const handleRowsPerPageChange = useCallback((rows: number) => {
    void setPageSize(rows);
  }, [setPageSize]);

  const confirmToggle = useCallback(async () => {
    if (!toggleTarget) {
      return;
    }

    const success = await toggleMaterialActive(toggleTarget.id);
    if (success) {
      toast.success(`Material ${toggleTarget.isActive ? 'deactivated' : 'activated'} successfully`);
    } else {
      toast.error('Failed to update material status');
    }

    setToggleOpen(false);
    setToggleTarget(null);
  }, [toggleMaterialActive, toggleTarget]);

  const handleFormSubmit = useCallback(async (data: MaterialFormData, images: ImageUploadData[]) => {
    const success = await saveMaterial({
      formData: data,
      images,
      editingMaterialId: editingData?.id,
      currentCategoryIds: editingData?.categories.map((item) => item.id) ?? [],
      currentTagIds: editingData?.tags.map((item) => item.id) ?? [],
    });

    if (success) {
      toast.success(editingData ? 'Material updated successfully' : 'Material created successfully');
      setFormOpen(false);
      setEditingData(undefined);
      return;
    }

    toast.error('Failed to save material');
  }, [editingData, saveMaterial]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="600">
          Material list ({pagination.totalCount})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreate}
          sx={{ ...hoverLiftStyle }}
          className="bg-primary!"
        >
          TẠO VẬT TƯ MỚI
        </Button>
      </Stack>

      {(error || categoryError || tagError) && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error || categoryError || tagError}
        </Alert>
      )}

      <MaterialTable
        materials={materials}
        pageNumber={pagination.pageNumber}
        pageSize={pagination.pageSize}
        totalCount={pagination.totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleEdit}
        onToggleActive={handleToggle}
        onView={handleView}
      />

      <MaterialFormDialog
        open={formOpen}
        editingData={editingData}
        categories={categoryOptions}
        tags={tagOptions}
        onClose={() => {
          setFormOpen(false);
          setEditingData(undefined);
        }}
        onSubmit={handleFormSubmit}
        isLoading={saving || detailLoading}
      />

      <MaterialViewDialog
        open={viewOpen}
        material={viewingData}
        onClose={() => {
          setViewOpen(false);
          setViewingData(undefined);
        }}
      />

      <Dialog open={toggleOpen} onClose={() => setToggleOpen(false)}>
        <DialogTitle>Confirm status update</DialogTitle>
        <DialogContent>
          <Typography>
            {toggleTarget
              ? `Do you want to ${toggleTarget.isActive ? 'deactivate' : 'activate'} this material?`
              : 'Do you want to update this material status?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToggleOpen(false)}>Cancel</Button>
          <Button onClick={confirmToggle} color="primary" variant="contained" disabled={saving}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function MaterialTab({ mode = 'admin' }: MaterialTabProps) {
  if (mode === 'manager') {
    return <ManagerMaterialMode />;
  }

  return <AdminMaterialMode />;
}
