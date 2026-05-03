'use client';

import { useCallback, useEffect, useState } from 'react';
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
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
// import AutorenewIcon from '@mui/icons-material/Autorenew';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import { CustomLoading } from '@/components/CustomLoading';
import type { ResponseModel } from '@/types/api.types';
import type {
  ManagerPlantComboInventoryItem,
  ManagerPlantComboListPayload,
  ManagerPlantComboOperationRequest,
} from '@/types/manager-store-catalog.types';
import type { PlantCombo, PlantComboListPayload } from '@/types/store-management.types';
import {
  assembleManagerPlantCombo,
  decomposeManagerPlantCombo,
  getManagerPlantCombos,
  getCompatiblePlantCombosForNursery,
} from '@/lib/api/managerStoreCatalogService';
// import { getAdminPlantCombos } from '@/lib/api/adminPlantCombosService';
import { formatCurrency } from '@/lib/utils/formatUtil';

interface PaginationState {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

interface ImportFormValue {
  comboId: number;
  quantity: number;
}

interface DecomposeFormValue {
  quantity: number;
}

const DEFAULT_PAGINATION: PaginationState = {
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
};

const DEFAULT_IMPORT_FORM: ImportFormValue = {
  comboId: 0,
  quantity: 1,
};

const DEFAULT_DECOMPOSE_FORM: DecomposeFormValue = {
  quantity: 1,
};

const getPayload = <T,>(response: ResponseModel<T>): T | undefined => {
  return response.payload ?? response.data;
};

type CompatibleComboListPayload = PlantComboListPayload | { items?: PlantCombo[]; Items?: PlantCombo[] };

/** Compatible endpoint có thể trả về mảng trực tiếp, hoặc `{ items }` / `{ Items }` (PascalCase). */
const extractCompatibleComboItems = (
  payload: CompatibleComboListPayload | PlantCombo[] | undefined
): PlantCombo[] => {
  if (!payload) {
    return [];
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  const record = payload as { items?: PlantCombo[]; Items?: PlantCombo[] };
  const list = record.items ?? record.Items;
  return Array.isArray(list) ? list : [];
};

const isComboSelectableForImport = (combo: PlantCombo & { IsActive?: boolean }): boolean => {
  const active = combo.isActive ?? combo.IsActive;
  return active !== false;
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

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('vi-VN');
};

interface ManagerPlantComboTabProps {
  readOnly?: boolean;
}

export default function ManagerPlantComboTab({ readOnly = false }: ManagerPlantComboTabProps) {
  const [items, setItems] = useState<ManagerPlantComboInventoryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [importOptions, setImportOptions] = useState<PlantCombo[]>([]);
  const [importOptionsLoading, setImportOptionsLoading] = useState(false);
  const [importForm, setImportForm] = useState<ImportFormValue>(DEFAULT_IMPORT_FORM);

  const [decomposeOpen, setDecomposeOpen] = useState(false);
  const [decomposeTarget, setDecomposeTarget] = useState<ManagerPlantComboInventoryItem | null>(null);
  const [decomposeForm, setDecomposeForm] = useState<DecomposeFormValue>(DEFAULT_DECOMPOSE_FORM);

  const fetchCombos = useCallback(async (nextPage: number, nextSize: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getManagerPlantCombos(
        {
          pageNumber: nextPage,
          pageSize: nextSize,
        },
        true
      );
      const payload = getPayload<ManagerPlantComboListPayload>(response);

      if (!payload) {
        setItems([]);
        setPagination((prev) => ({
          ...prev,
          pageNumber: nextPage,
          pageSize: nextSize,
          totalCount: 0,
        }));
        return;
      }

      setItems(payload.items);
      setPagination({
        pageNumber: payload.pageNumber,
        pageSize: payload.pageSize,
        totalCount: payload.totalCount,
      });
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, 'Failed to load plant combo inventory'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCombos(1, pagination.pageSize);
  }, [fetchCombos, pagination.pageSize]);

  const fetchImportOptions = useCallback(async () => {
    setImportOptionsLoading(true);

    try {
      const response = await getCompatiblePlantCombosForNursery(false);
      const payload = getPayload<CompatibleComboListPayload | PlantCombo[]>(response);
      const rawItems = extractCompatibleComboItems(payload);
      const activeItems = rawItems.filter(isComboSelectableForImport);
      setImportOptions(activeItems);
      console.log('activeItems', activeItems);
      return activeItems;
    } catch {
      setImportOptions([]);
      return [] as PlantCombo[];
    } finally {
      setImportOptionsLoading(false);
    }
  }, []);

  // const totalPageQuantity = useMemo(() => {
  //   return items.reduce((sum, item) => sum + item.quantity, 0);
  // }, [items]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    void fetchCombos(newPage + 1, pagination.pageSize);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextSize = Number(event.target.value);
    void fetchCombos(1, nextSize);
  };

  const handleOpenImportDialog = async () => {
    if (readOnly) {
      return;
    }
    setImportOpen(true);
    const options = await fetchImportOptions();

    setImportForm({
      comboId: options[0]?.id ?? 0,
      quantity: 1,
    });
  };

  const canSubmitImport = importForm.comboId > 0 && importForm.quantity > 0;

  const handleSubmitImport = async () => {
    if (readOnly) {
      return;
    }
    if (!canSubmitImport) {
      return;
    }

    setSubmitting(true);
    try {
      const request: ManagerPlantComboOperationRequest = {
        quantity: importForm.quantity,
      };
      await assembleManagerPlantCombo(importForm.comboId, request, true);
      setImportOpen(false);
      setImportForm(DEFAULT_IMPORT_FORM);
      await fetchCombos(pagination.pageNumber, pagination.pageSize);
    } catch {
      // Error toast is handled globally by axios interceptor.
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDecomposeDialog = (item: ManagerPlantComboInventoryItem) => {
    if (readOnly) {
      return;
    }
    setDecomposeTarget(item);
    setDecomposeForm(DEFAULT_DECOMPOSE_FORM);
    setDecomposeOpen(true);
  };

  const canSubmitDecompose =
    !!decomposeTarget && decomposeForm.quantity > 0 && decomposeForm.quantity <= decomposeTarget.quantity;

  const handleSubmitDecompose = async () => {
    if (readOnly) {
      return;
    }
    if (!decomposeTarget || !canSubmitDecompose) {
      return;
    }

    setSubmitting(true);
    try {
      console.log('decomposeTarget', decomposeTarget);
      const request: ManagerPlantComboOperationRequest = {
        quantity: decomposeForm.quantity,
      };
      await decomposeManagerPlantCombo(decomposeTarget.plantComboId, request, true);
      setDecomposeOpen(false);
      setDecomposeTarget(null);
      setDecomposeForm(DEFAULT_DECOMPOSE_FORM);
      await fetchCombos(pagination.pageNumber, pagination.pageSize);
    } catch {
      // Error toast is handled globally by axios interceptor.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Chip label={`Total rows: ${pagination.totalCount}`} sx={{ bgcolor: '#ecfff3' }} />
          {/* <Chip label={`Page quantity sum: ${totalPageQuantity}`} sx={{ bgcolor: '#ecf7ff' }} /> */}
        </Stack>

        <Stack direction="row" spacing={1}>
          {/* <Button
            startIcon={<AutorenewIcon />}
            variant="outlined"
            onClick={() => void fetchCombos()}
            disabled={loading}
          >
            Refresh
          </Button> */}
          {!readOnly ? (
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => void handleOpenImportDialog()}
              sx={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Import Combo
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
          <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }} align="center">ID</TableCell>
              {/* <TableCell sx={{ fontWeight: 700 }}>Combo Code</TableCell> */}
              <TableCell sx={{ fontWeight: 700 }}>Combo Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Combo Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Price
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Quantity
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Updated At</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                  <CustomLoading size={24} />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                  <Typography variant="body2" color="text.secondary">
                    No plant combo inventory found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell align="center">{item.id}</TableCell>
                  {/* <TableCell>{item.comboCode}</TableCell> */}
                  <TableCell>{item.comboName}</TableCell>
                  <TableCell>{item.comboTypeName}</TableCell>
                  <TableCell align="center">{formatCurrency(item.price, 'vi')}</TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={item.isActive ? 'Active' : 'Inactive'}
                      color={item.isActive ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">{formatDateTime(item.updatedAt)}</TableCell>
                  <TableCell align="center">
                    {!readOnly ? (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CallSplitIcon />}
                        onClick={() => handleOpenDecomposeDialog(item)}
                        disabled={item.quantity <= 0}
                      >
                        Decompose
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        -
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
          <Dialog open={importOpen} onClose={() => setImportOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Import Combo</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="manager-import-combo-label">Combo</InputLabel>
                  <Select
                    labelId="manager-import-combo-label"
                    label="Combo"
                    value={importForm.comboId}
                    disabled={importOptionsLoading}
                    onChange={(event) =>
                      setImportForm((prev) => ({
                        ...prev,
                        comboId: Number(event.target.value),
                      }))
                    }
                  >
                    {importOptions.map((combo) => (
                      <MenuItem key={combo.id} value={combo.id}>
                        {combo.comboCode} - {combo.comboName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Quantity"
                  type="number"
                  size="small"
                  fullWidth
                  value={importForm.quantity}
                  onChange={(event) =>
                    setImportForm((prev) => ({
                      ...prev,
                      quantity: Number(event.target.value),
                    }))
                  }
                  inputProps={{ min: 1 }}
                  error={importForm.quantity <= 0}
                  helperText={importForm.quantity <= 0 ? 'Quantity must be greater than 0' : ' '}
                />

                {!importOptionsLoading && importOptions.length === 0 && (
                  <Alert severity="warning">No active combo available to import.</Alert>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setImportOpen(false);
                  setImportForm(DEFAULT_IMPORT_FORM);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => void handleSubmitImport()}
                disabled={!canSubmitImport || submitting}
              >
                Submit
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={decomposeOpen} onClose={() => setDecomposeOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Decompose Combo</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {decomposeTarget
                    ? `Combo: ${decomposeTarget.comboCode} - ${decomposeTarget.comboName} (Available: ${decomposeTarget.quantity})`
                    : 'Select combo to decompose'}
                </Typography>
                <TextField
                  label="Quantity"
                  type="number"
                  size="small"
                  fullWidth
                  value={decomposeForm.quantity}
                  onChange={(event) =>
                    setDecomposeForm({
                      quantity: Number(event.target.value),
                    })
                  }
                  inputProps={{ min: 1 }}
                  error={decomposeForm.quantity <= 0 || (!!decomposeTarget && decomposeForm.quantity > decomposeTarget.quantity)}
                  helperText={
                    decomposeForm.quantity <= 0
                      ? 'Quantity must be greater than 0'
                      : decomposeTarget && decomposeForm.quantity > decomposeTarget.quantity
                        ? 'Quantity exceeds current combo inventory'
                        : ' '
                  }
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setDecomposeOpen(false);
                  setDecomposeTarget(null);
                  setDecomposeForm(DEFAULT_DECOMPOSE_FORM);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={() => void handleSubmitDecompose()}
                disabled={!canSubmitDecompose || submitting}
              >
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
    </Box>
  );
}
