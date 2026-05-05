'use client';

import { useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { resolveDesignSampleImageSrc } from '@/lib/utils/designTemplateSampleImage';
import type { ManagerNotOfferedDesignTemplate, ManagerNurseryDesignTemplateListItem } from '@/types/manager-design-template.types';

interface ManagerNurseryDesignTemplateDialogsProps {
  addDialogOpen: boolean;
  onCloseAddDialog: () => void;
  notOfferedTemplates: ManagerNotOfferedDesignTemplate[];
  selectedTemplateId: number;
  onSelectedTemplateIdChange: (id: number) => void;
  onConfirmAdd: () => void;
  submitting: boolean;
  toggleTarget: ManagerNurseryDesignTemplateListItem | null;
  onCloseToggleDialog: () => void;
  onConfirmToggle: () => void;
  deleteTarget: ManagerNurseryDesignTemplateListItem | null;
  onCloseDeleteDialog: () => void;
  onConfirmDelete: () => void;
}

export default function ManagerNurseryDesignTemplateDialogs({
  addDialogOpen,
  onCloseAddDialog,
  notOfferedTemplates,
  selectedTemplateId,
  onSelectedTemplateIdChange,
  onConfirmAdd,
  submitting,
  toggleTarget,
  onCloseToggleDialog,
  onConfirmToggle,
  deleteTarget,
  onCloseDeleteDialog,
  onConfirmDelete,
}: ManagerNurseryDesignTemplateDialogsProps) {
  const selectedNotOffered = useMemo(
    () => notOfferedTemplates.find((t) => t.id === selectedTemplateId) ?? null,
    [notOfferedTemplates, selectedTemplateId]
  );

  const previewSrc = useMemo(() => {
    const raw = selectedNotOffered?.imageUrl?.trim() ?? '';
    return raw ? resolveDesignSampleImageSrc(raw) : '';
  }, [selectedNotOffered?.imageUrl]);

  return (
    <>
      <Dialog open={addDialogOpen} onClose={onCloseAddDialog} fullWidth maxWidth="sm">
        <DialogTitle>Add Design Template</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="not-offered-template-label">Design Template</InputLabel>
              <Select
                labelId="not-offered-template-label"
                label="Design Template"
                value={selectedTemplateId}
                onChange={(event) => onSelectedTemplateIdChange(Number(event.target.value))}
              >
                {notOfferedTemplates.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedNotOffered && (
              <Stack spacing={1}>
                {previewSrc ? (
                  <Box
                    component="img"
                    src={previewSrc}
                    alt={selectedNotOffered.name}
                    sx={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 1, bgcolor: 'action.hover' }}
                  />
                ) : null}
                {selectedNotOffered.description ? (
                  <Typography variant="body2" color="text.secondary">
                    {selectedNotOffered.description}
                  </Typography>
                ) : null}
              </Stack>
            )}
            {notOfferedTemplates.length === 0 && <Alert severity="info">No more templates are currently available to add.</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseAddDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onConfirmAdd}
            disabled={submitting || notOfferedTemplates.length === 0}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(toggleTarget)} onClose={onCloseToggleDialog}>
        <DialogTitle>{toggleTarget?.isActive ? 'Deactivate mapping?' : 'Activate mapping?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This changes the offering status for <strong>{toggleTarget?.designTemplateName}</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseToggleDialog}>Cancel</Button>
          <Button variant="contained" className="bg-primary!" onClick={onConfirmToggle} disabled={submitting}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={onCloseDeleteDialog}>
        <DialogTitle>Remove mapping?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will remove <strong>{deleteTarget?.designTemplateName}</strong> from your nursery offerings.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDeleteDialog}>Cancel</Button>
          <Button color="error" variant="contained" onClick={onConfirmDelete} disabled={submitting}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
