'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { CustomLoading } from '@/components/CustomLoading';
import ManagerMaterialMode from '@/components/store-management/ManagerMaterialMode';
import { getMyNurseryExpiringSoonMaterials } from '@/lib/api/managerNurseryInventoryService';
import type { ExpiringSoonMaterialItem } from '@/types/manager-store-catalog.types';

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

export default function StaffMaterialTabView() {
  const [open, setOpen] = useState(false);
  const [daysAhead, setDaysAhead] = useState<number>(30);

  const [items, setItems] = useState<ExpiringSoonMaterialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedDaysAhead = useMemo(() => {
    if (!Number.isFinite(daysAhead) || daysAhead <= 0) return 30;
    return Math.floor(daysAhead);
  }, [daysAhead]);

  const handleFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyNurseryExpiringSoonMaterials(normalizedDaysAhead, true);
      const payload = getPayload<ExpiringSoonMaterialItem[]>(response) ?? [];
      setItems(payload);
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to load expiring materials'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [normalizedDaysAhead]);

  const headerActions = (
    <Button
      variant="outlined"
      startIcon={<WarningAmberOutlinedIcon />}
      onClick={() => {
        setOpen(true);
        setItems([]);
        setError(null);
        setDaysAhead(30);
      }}
    >
      Expiring soon
    </Button>
  );

  return (
    <Box>
      <ManagerMaterialMode readOnly headerActions={headerActions} />

      <Dialog open={open} onClose={loading ? undefined : () => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Expiring-soon materials</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Show materials expiring within the next {normalizedDaysAhead} days.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
              <TextField
                label="daysAhead"
                type="number"
                value={daysAhead}
                onChange={(e) => setDaysAhead(Number(e.target.value))}
                inputProps={{ min: 1 }}
                size="small"
                sx={{ width: { xs: '100%', sm: 180 } }}
                disabled={loading}
              />
              <Button variant="contained" onClick={() => void handleFetch()} disabled={loading}>
                Fetch
              </Button>
              {loading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CustomLoading size={18} />
                  <Typography variant="body2" color="text.secondary">
                    Loading...
                  </Typography>
                </Stack>
              ) : null}
            </Stack>

            {error ? (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            ) : null}

            <TableContainer component={Paper} sx={{ border: '1px solid var(--card-border)' }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#fff3e6' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Material</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Available
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Expired Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Days to expire
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!loading && items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No data.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.nurseryMaterialId} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {item.materialName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            NurseryMaterial ID: {item.nurseryMaterialId}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.materialCode}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell align="right">{item.availableQuantity}</TableCell>
                        <TableCell>{item.expiredDate}</TableCell>
                        <TableCell align="right">{item.daysToExpire}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

