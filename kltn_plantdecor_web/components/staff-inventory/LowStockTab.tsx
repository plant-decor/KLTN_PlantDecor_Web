'use client';

import { useEffect, useState } from 'react';
import { Alert, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { CustomLoading } from '@/components/CustomLoading';
import { getMyNurseryLowStockProducts } from '@/lib/api/managerNurseryInventoryService';
import type { LowStockProductItem } from '@/types/manager-store-catalog.types';

const getPayload = <T,>(response: { payload?: T; data?: T }): T | undefined => {
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

export default function LowStockTab() {
  const [items, setItems] = useState<LowStockProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getMyNurseryLowStockProducts(true);
        const payload = getPayload<LowStockProductItem[]>(response) ?? [];
        if (!mounted) return;
        setItems(payload);
      } catch (e) {
        if (!mounted) return;
        setError(getErrorMessage(e, 'Failed to load low stock products'));
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box>
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <TableContainer component={Paper} sx={{ border: '1px solid var(--card-border)' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#fff3e6' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Total
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Reserved
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Available
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Threshold
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <CustomLoading size={24} />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <Typography variant="body2" color="text.secondary">
                    No low stock products found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={`${item.productType}-${item.productId}`} hover>
                  <TableCell>{item.productType}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {item.productName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {item.productId}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{item.totalQuantity}</TableCell>
                  <TableCell align="right">{item.reservedQuantity}</TableCell>
                  <TableCell align="right">{item.availableQuantity}</TableCell>
                  <TableCell align="right">{item.threshold}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

