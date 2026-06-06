'use client';

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { ManagerNurseryOrder, RefundNurseryOrderRequest } from '@/types/manager-sales-orders.types';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils/formatUtil';

interface RefundNurseryOrderDialogProps {
  open: boolean;
  order: ManagerNurseryOrder | null;
  onClose: () => void;
  onSubmit: (request: RefundNurseryOrderRequest) => void;
}

export default function RefundNurseryOrderDialog({
  open,
  order,
  onClose,
  onSubmit,
}: RefundNurseryOrderDialogProps) {
  const [prevOrderId, setPrevOrderId] = useState<number | null>(null);
  const [refundedAmount, setRefundedAmount] = useState('');
  const [refundReference, setRefundReference] = useState('');
  const [managerRefundNote, setManagerRefundNote] = useState('');
  const [amountError, setAmountError] = useState('');

  // React-approved pattern: adjust state when props change (avoids useEffect for derived state)
  if (open && order && order.id !== prevOrderId) {
    setPrevOrderId(order.id);
    setRefundedAmount(formatCurrencyInput(order.subTotalAmount, 'vi-VN'));
    setRefundReference('');
    setManagerRefundNote('');
    setAmountError('');
  }

  const handleClose = () => {
    setPrevOrderId(null);
    setRefundedAmount('');
    setRefundReference('');
    setManagerRefundNote('');
    setAmountError('');
    onClose();
  };

  const handleSubmit = () => {
    const parsed = parseCurrencyInput(refundedAmount);
    if (!refundedAmount.trim() || parsed <= 0) {
      setAmountError('Refund amount must be greater than 0');
      return;
    }

    setAmountError('');
    onSubmit({
      refundedAmount: parsed,
      refundReference: refundReference.trim() || undefined,
      managerRefundNote: managerRefundNote.trim() || undefined,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Refund Failed Order #{order?.id}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {order && (
            <Typography variant="body2" color="text.secondary">
              Subtotal: <strong>{formatCurrency(order.subTotalAmount, 'vi-VN')}</strong>
              {order.depositAmount != null && order.depositAmount > 0 && (
                <> &nbsp;|&nbsp; Deposit: <strong>{formatCurrency(order.depositAmount, 'vi-VN')}</strong></>
              )}
            </Typography>
          )}
          <TextField
            label="Refund Amount"
            required
            fullWidth
            size="small"
            value={refundedAmount}
            onChange={(e) => {
              setRefundedAmount(formatCurrencyInput(e.target.value, 'vi-VN'));
              setAmountError('');
            }}
            error={!!amountError}
            helperText={amountError || 'Amount to refund to the customer'}
            inputProps={{ inputMode: 'numeric' }}
          />
          <TextField
            label="Refund Reference"
            fullWidth
            size="small"
            value={refundReference}
            onChange={(e) => setRefundReference(e.target.value)}
            helperText="Optional — transaction ID or bank reference"
            inputProps={{ maxLength: 100 }}
          />
          <TextField
            label="Manager Note"
            fullWidth
            multiline
            rows={2}
            size="small"
            value={managerRefundNote}
            onChange={(e) => setManagerRefundNote(e.target.value)}
            helperText="Optional — internal note about this refund"
            inputProps={{ maxLength: 255 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Confirm Refund
        </Button>
      </DialogActions>
    </Dialog>
  );
}
