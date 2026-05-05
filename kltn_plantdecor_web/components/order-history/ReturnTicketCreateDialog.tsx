'use client';

import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { Order } from '@/types/order.types';
import type { CreateReturnTicketRequest } from '@/types/return-ticket.types';

export interface ReturnTicketEvidenceMap {
  [nurseryOrderDetailId: number]: File[];
}

interface EligibleItem {
  nurseryOrderDetailId: number;
  nurseryOrderId: number;
  nurseryName: string;
  itemName: string;
  maxQuantity: number;
}

interface ReturnTicketCreateDialogProps {
  open: boolean;
  order: Order;
  submitting: boolean;
  submitError: string;
  onClose: () => void;
  onSubmit: (request: CreateReturnTicketRequest, evidenceMap: ReturnTicketEvidenceMap) => Promise<void>;
}

const ITEM_REASON_OPTIONS = [
  'Damaged item',
  'Wrong item received',
  'Not as described',
  'No longer needed',
  'Other',
];

const OVERALL_REASON_OPTIONS = [
  'Request refund for selected items',
  'Product issue after receiving',
  'Received incorrect products',
  'Other',
];

export default function ReturnTicketCreateDialog({
  open,
  order,
  submitting,
  submitError,
  onClose,
  onSubmit,
}: ReturnTicketCreateDialogProps) {
  const eligibleItems = useMemo<EligibleItem[]>(() => {
    return order.nurseryOrders.flatMap((nurseryOrder) =>
      nurseryOrder.items
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          nurseryOrderDetailId: item.id,
          nurseryOrderId: nurseryOrder.id,
          nurseryName: nurseryOrder.nurseryName,
          itemName: item.itemName,
          maxQuantity: item.quantity,
        }))
    );
  }, [order.nurseryOrders]);

  const [quickReason, setQuickReason] = useState<string>(OVERALL_REASON_OPTIONS[0]);
  const [otherReason, setOtherReason] = useState<string>('');
  const [selectedDetailIds, setSelectedDetailIds] = useState<number[]>([]);
  const [quantitiesByDetailId, setQuantitiesByDetailId] = useState<Record<number, number>>(() => {
    const initialState: Record<number, number> = {};
    eligibleItems.forEach((item) => {
      initialState[item.nurseryOrderDetailId] = 1;
    });
    return initialState;
  });
  const [reasonsByDetailId, setReasonsByDetailId] = useState<Record<number, string>>(() => {
    const initialState: Record<number, string> = {};
    eligibleItems.forEach((item) => {
      initialState[item.nurseryOrderDetailId] = ITEM_REASON_OPTIONS[0];
    });
    return initialState;
  });
  const [imagesByDetailId, setImagesByDetailId] = useState<ReturnTicketEvidenceMap>({});
  const [validationError, setValidationError] = useState('');

  const toggleItemSelection = (nurseryOrderDetailId: number) => {
    setSelectedDetailIds((prev) =>
      prev.includes(nurseryOrderDetailId)
        ? prev.filter((id) => id !== nurseryOrderDetailId)
        : [...prev, nurseryOrderDetailId]
    );
  };

  const handleQuantityChange = (nurseryOrderDetailId: number, value: number) => {
    setQuantitiesByDetailId((prev) => ({
      ...prev,
      [nurseryOrderDetailId]: value,
    }));
  };

  const handleReasonChange = (nurseryOrderDetailId: number, value: string) => {
    setReasonsByDetailId((prev) => ({
      ...prev,
      [nurseryOrderDetailId]: value,
    }));
  };

  const handleImagesSelected = (nurseryOrderDetailId: number, files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const fileArray = Array.from(files);
    setImagesByDetailId((prev) => ({
      ...prev,
      [nurseryOrderDetailId]: [...(prev[nurseryOrderDetailId] || []), ...fileArray],
    }));
  };

  const removeImage = (nurseryOrderDetailId: number, index: number) => {
    setImagesByDetailId((prev) => {
      const next = [...(prev[nurseryOrderDetailId] || [])];
      next.splice(index, 1);

      return {
        ...prev,
        [nurseryOrderDetailId]: next,
      };
    });
  };

  const validateAndBuildRequest = (): CreateReturnTicketRequest | null => {
    if (selectedDetailIds.length === 0) {
      setValidationError('Please select at least one item to return.');
      return null;
    }

    const resolvedReason = quickReason === 'Other' ? otherReason.trim() : quickReason.trim();

    if (!resolvedReason) {
      setValidationError('Please provide a return ticket reason.');
      return null;
    }

    for (const detailId of selectedDetailIds) {
      const found = eligibleItems.find((item) => item.nurseryOrderDetailId === detailId);
      if (!found) {
        setValidationError('One or more selected items are no longer eligible for return.');
        return null;
      }

      const quantity = quantitiesByDetailId[detailId] ?? 0;
      if (quantity < 1 || quantity > found.maxQuantity) {
        setValidationError(`Requested quantity for ${found.itemName} must be between 1 and ${found.maxQuantity}.`);
        return null;
      }

      const itemReason = (reasonsByDetailId[detailId] || '').trim();
      if (!itemReason) {
        setValidationError(`Please provide a reason for ${found.itemName}.`);
        return null;
      }

      const evidenceFiles = imagesByDetailId[detailId] || [];
      if (evidenceFiles.length === 0) {
        setValidationError(`Please upload at least one evidence image for ${found.itemName}.`);
        return null;
      }
    }

    setValidationError('');

    return {
      orderId: order.id,
      reason: resolvedReason,
      items: selectedDetailIds.map((detailId) => ({
        nurseryOrderDetailId: detailId,
        requestedQuantity: quantitiesByDetailId[detailId],
        reason: (reasonsByDetailId[detailId] || '').trim(),
      })),
    };
  };

  const handleSubmit = async () => {
    const request = validateAndBuildRequest();
    if (!request) {
      return;
    }

    try {
      await onSubmit(request, imagesByDetailId);
    } catch {
      // Error state is managed by parent and displayed through submitError.
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Create Return Ticket for Order #{order.id}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {/* <Alert severity="info">
            Only items with Pending status are eligible. At least one image is required for each selected item.
          </Alert> */}

          {validationError ? <Alert severity="error">{validationError}</Alert> : null}
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}

          <FormControl fullWidth>
            <InputLabel id="overall-reason-label">Quick Reason</InputLabel>
            <Select
              labelId="overall-reason-label"
              label="Quick Reason"
              value={quickReason}
              onChange={(event) => setQuickReason(String(event.target.value))}
            >
              {OVERALL_REASON_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {quickReason === 'Other' ? (
            <TextField
              label="Reason"
              fullWidth
              value={otherReason}
              onChange={(event) => setOtherReason(event.target.value)}
              placeholder="Describe your return reason"
              multiline
              minRows={3}
            />
          ) : null}

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ fontWeight: 700 }}>
                  Select
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Max Qty
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Return Qty
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Item Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eligibleItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">No items available for return in this order.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                eligibleItems.map((item) => {
                  const selected = selectedDetailIds.includes(item.nurseryOrderDetailId);

                  return (
                    <TableRow key={item.nurseryOrderDetailId} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected}
                          onChange={() => toggleItemSelection(item.nurseryOrderDetailId)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600}>{item.itemName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.nurseryName} - Detail #{item.nurseryOrderDetailId}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{item.maxQuantity}</TableCell>
                      <TableCell align="center" sx={{ width: 120 }}>
                        <TextField
                          size="small"
                          type="number"
                          value={quantitiesByDetailId[item.nurseryOrderDetailId] || 1}
                          onChange={(event) =>
                            handleQuantityChange(
                              item.nurseryOrderDetailId,
                              Number.parseInt(event.target.value || '0', 10)
                            )
                          }
                          inputProps={{ min: 1, max: item.maxQuantity }}
                          disabled={!selected}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small" disabled={!selected}>
                          <Select
                            value={reasonsByDetailId[item.nurseryOrderDetailId] || ITEM_REASON_OPTIONS[0]}
                            onChange={(event) =>
                              handleReasonChange(item.nurseryOrderDetailId, String(event.target.value))
                            }
                          >
                            {ITEM_REASON_OPTIONS.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {selectedDetailIds.length > 0 ? (
            <Stack spacing={1.5}>
              <Typography fontWeight={700}>Evidence Images (required per selected item)</Typography>
              {selectedDetailIds.map((detailId) => {
                const selectedItem = eligibleItems.find((item) => item.nurseryOrderDetailId === detailId);
                if (!selectedItem) {
                  return null;
                }

                const selectedFiles = imagesByDetailId[detailId] || [];

                return (
                  <Card key={detailId} variant="outlined">
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography fontWeight={600}>
                          {selectedItem.itemName} (Detail #{detailId})
                        </Typography>
                        <Button component="label" variant="outlined" size="small" sx={{ width: 'fit-content' }}>
                          Upload Evidence Images
                          <input
                            hidden
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(event) => handleImagesSelected(detailId, event.target.files)}
                          />
                        </Button>

                        {selectedFiles.length === 0 ? (
                          <Typography variant="caption" color="error">
                            No image selected yet.
                          </Typography>
                        ) : (
                          <Stack spacing={0.5}>
                            {selectedFiles.map((file, index) => (
                              <Box
                                key={`${detailId}-${file.name}-${index}`}
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                              >
                                <Tooltip title={file.name}>
                                  <Typography variant="caption" sx={{ maxWidth: 420 }} noWrap>
                                    {file.name}
                                  </Typography>
                                </Tooltip>
                                <IconButton size="small" onClick={() => removeImage(detailId, index)}>
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button className='bg-primary' variant="contained" onClick={() => void handleSubmit()} disabled={submitting || eligibleItems.length === 0}>
          {submitting ? 'Submitting...' : 'Submit Return Ticket'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
