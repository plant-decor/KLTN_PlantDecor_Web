'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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
  TableRow,
  Typography,
} from '@mui/material';
import { Add, DeleteOutline, Refresh, ToggleOff, ToggleOn } from '@mui/icons-material';
import { toast } from 'react-toastify';
import ManagementHeader from '@/components/layout/ManagementHeader';
import {
  createNurseryDesignTemplate,
  deleteNurseryDesignTemplate,
  getMyNurseryDesignTemplates,
  getNotOfferedDesignTemplates,
  toggleNurseryDesignTemplate,
} from '@/lib/api/managerNurseryDesignTemplatesService';
import type { ManagerNotOfferedDesignTemplate, ManagerNurseryDesignTemplateListItem } from '@/types/manager-design-template.types';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const candidate = error as { response?: { data?: { message?: string } }; message?: string };
  return candidate.response?.data?.message || candidate.message || fallback;
};

export default function ManagerNurseryDesignTemplateManagementPageClient() {
  const [items, setItems] = useState<ManagerNurseryDesignTemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notOfferedTemplates, setNotOfferedTemplates] = useState<ManagerNotOfferedDesignTemplate[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<ManagerNurseryDesignTemplateListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagerNurseryDesignTemplateListItem | null>(null);

  const activeCount = useMemo(() => items.filter((item) => item.isActive).length, [items]);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [currentMappings, availableTemplates] = await Promise.all([
        getMyNurseryDesignTemplates(false, false),
        getNotOfferedDesignTemplates(false),
      ]);

      setItems(currentMappings);
      setNotOfferedTemplates(availableTemplates);
    } catch (loadError) {
      const message = getErrorMessage(loadError, 'Cannot load nursery design templates');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const handleOpenAddDialog = useCallback(async () => {
    try {
      const availableTemplates = await getNotOfferedDesignTemplates(false);
      setNotOfferedTemplates(availableTemplates);
      setSelectedTemplateId(availableTemplates[0]?.id ?? 0);
      setAddDialogOpen(true);
    } catch (loadError) {
      toast.error(getErrorMessage(loadError, 'Cannot load available design templates'));
    }
  }, []);

  const handleAddTemplate = useCallback(async () => {
    if (!selectedTemplateId) {
      toast.error('Please select a design template');
      return;
    }

    try {
      setSubmitting(true);
      await createNurseryDesignTemplate({ designTemplateId: selectedTemplateId }, false);
      toast.success('Design template added to nursery successfully');
      setAddDialogOpen(false);
      await loadInitialData();
    } catch (addError) {
      toast.error(getErrorMessage(addError, 'Cannot add design template'));
    } finally {
      setSubmitting(false);
    }
  }, [loadInitialData, selectedTemplateId]);

  const handleToggle = useCallback(async () => {
    if (!toggleTarget) {
      return;
    }

    try {
      setSubmitting(true);
      await toggleNurseryDesignTemplate(toggleTarget.id, false);
      toast.success(toggleTarget.isActive ? 'Nursery design template deactivated successfully' : 'Nursery design template activated successfully');
      setToggleTarget(null);
      await loadInitialData();
    } catch (toggleError) {
      toast.error(getErrorMessage(toggleError, 'Cannot change mapping status'));
    } finally {
      setSubmitting(false);
    }
  }, [loadInitialData, toggleTarget]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setSubmitting(true);
      await deleteNurseryDesignTemplate(deleteTarget.id, false);
      toast.success('Design template removed from nursery successfully');
      setDeleteTarget(null);
      await loadInitialData();
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError, 'Cannot remove design template'));
    } finally {
      setSubmitting(false);
    }
  }, [deleteTarget, loadInitialData]);

  return (
    <Box sx={{ bgcolor: 'var(--background)', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
      <ManagementHeader
        title="Nursery Design Templates"
        description="Manage which design templates are offered by your nursery."
        entityLabel="nursery design template"
        count={items.length}
        actionLabel="Add Template"
        onAction={() => void handleOpenAddDialog()}
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Chip label={`Active: ${activeCount}`} color="success" variant="outlined" />
        <Chip label={`Inactive: ${items.length - activeCount}`} variant="outlined" />
        <Button size="small" variant="outlined" startIcon={<Refresh />} onClick={() => void loadInitialData()} disabled={loading}>
          Reload
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid var(--card-border)' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Design Template</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Nursery</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No nursery design templates found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} hover sx={{ opacity: item.isActive ? 1 : 0.7 }}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>
                    <Typography fontWeight={700}>{item.designTemplateName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Design Template ID: {item.designTemplateId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{item.nurseryName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Nursery ID: {item.nurseryId}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip size="small" label={item.isActive ? 'Active' : 'Inactive'} color={item.isActive ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '-'}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton size="small" color={item.isActive ? 'success' : 'default'} onClick={() => setToggleTarget(item)}>
                        {item.isActive ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(item)}>
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Design Template</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="not-offered-template-label">Design Template</InputLabel>
              <Select
                labelId="not-offered-template-label"
                label="Design Template"
                value={selectedTemplateId}
                onChange={(event) => setSelectedTemplateId(Number(event.target.value))}
              >
                {notOfferedTemplates.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {notOfferedTemplates.length === 0 && (
              <Alert severity="info">No more templates are currently available to add.</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => void handleAddTemplate()} disabled={submitting || notOfferedTemplates.length === 0}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(toggleTarget)} onClose={() => setToggleTarget(null)}>
        <DialogTitle>{toggleTarget?.isActive ? 'Deactivate mapping?' : 'Activate mapping?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This changes the offering status for <strong>{toggleTarget?.designTemplateName}</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToggleTarget(null)}>Cancel</Button>
          <Button variant="contained" className='bg-primary!' onClick={() => void handleToggle()} disabled={submitting}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Remove mapping?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will remove <strong>{deleteTarget?.designTemplateName}</strong> from your nursery offerings.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => void handleDelete()} disabled={submitting}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
