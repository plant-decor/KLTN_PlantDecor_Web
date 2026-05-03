'use client';

import type { Dispatch, SetStateAction } from 'react';
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { ConsultantOrderFilterDraft } from '@/types/consultant-order.types';
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/utils/formatUtil';

const AMOUNT_INPUT_LOCALE = 'vi-VN';

export type ConsultantCustomerOrdersFilterProps = {
  value: ConsultantOrderFilterDraft;
  onChange: Dispatch<SetStateAction<ConsultantOrderFilterDraft>>;
  orderStatusByValue: Record<number, string>;
  orderTypeByValue: Record<number, string>;
  paymentStrategyByValue: Record<number, string>;
  onApply: () => void;
  onReset: () => void;
};

function enumValuesToSortedOptions(
  map: Record<number, string>
): Array<{ value: number; label: string }> {
  return Object.entries(map)
    .map(([k, label]) => ({ value: Number(k), label }))
    .filter((x) => Number.isFinite(x.value))
    .sort((a, b) => a.value - b.value);
}

export default function ConsultantCustomerOrdersFilter({
  value,
  onChange,
  orderStatusByValue,
  orderTypeByValue,
  paymentStrategyByValue,
  onApply,
  onReset,
}: ConsultantCustomerOrdersFilterProps) {
  const patch = (partial: Partial<ConsultantOrderFilterDraft>) => {
    onChange((d) => ({ ...d, ...partial }));
  };

  const handleMinAmountChange = (raw: string) => {
    if (raw.trim() === '') {
      patch({ minAmount: '' });
      return;
    }
    const parsed = parseCurrencyInput(raw);
    patch({ minAmount: formatCurrencyInput(parsed, AMOUNT_INPUT_LOCALE) });
  };

  const handleMaxAmountChange = (raw: string) => {
    if (raw.trim() === '') {
      patch({ maxAmount: '' });
      return;
    }
    const parsed = parseCurrencyInput(raw);
    patch({ maxAmount: formatCurrencyInput(parsed, AMOUNT_INPUT_LOCALE) });
  };

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Filters
      </Typography>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Customer email"
            placeholder="Filter by customer email"
            value={value.email}
            onChange={(e) => patch({ email: e.target.value })}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="consultant-order-status-filter">Status</InputLabel>
            <Select
              labelId="consultant-order-status-filter"
              label="Status"
              value={value.status}
              onChange={(e) => patch({ status: Number(e.target.value) })}
            >
              <MenuItem value={0}>All</MenuItem>
              {enumValuesToSortedOptions(orderStatusByValue).map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="consultant-order-type-filter">Order type</InputLabel>
            <Select
              labelId="consultant-order-type-filter"
              label="Order type"
              value={value.orderType}
              onChange={(e) => patch({ orderType: Number(e.target.value) })}
            >
              <MenuItem value={0}>All</MenuItem>
              {enumValuesToSortedOptions(orderTypeByValue).map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="consultant-order-payment-filter">Payment</InputLabel>
            <Select
              labelId="consultant-order-payment-filter"
              label="Payment"
              value={value.payment}
              onChange={(e) => patch({ payment: Number(e.target.value) })}
            >
              <MenuItem value={0}>All</MenuItem>
              {enumValuesToSortedOptions(paymentStrategyByValue).map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Created from"
            type="date"
            value={value.createdFrom}
            onChange={(e) => patch({ createdFrom: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Created to"
            type="date"
            value={value.createdTo}
            onChange={(e) => patch({ createdTo: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Min total (VND)"
            value={value.minAmount}
            onChange={(e) => handleMinAmountChange(e.target.value)}
            inputMode="numeric"
            placeholder={formatCurrencyInput(0, AMOUNT_INPUT_LOCALE)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Max total (VND)"
            value={value.maxAmount}
            onChange={(e) => handleMaxAmountChange(e.target.value)}
            inputMode="numeric"
            placeholder={formatCurrencyInput(0, AMOUNT_INPUT_LOCALE)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Button sx={{backgroundColor: 'var(--primary)'}} fullWidth variant="contained" onClick={onApply}>
            Apply filter
          </Button>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Button fullWidth variant="outlined" color="secondary" onClick={onReset}>
            Reset filters
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
