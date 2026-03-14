'use client';

import React, { useState, useCallback } from 'react';
import { Box, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import PlantInstanceTable from './PlantInstanceTable';
import PlantInstanceFormDialog from './PlantInstanceFormDialog';
import PlantInstanceViewDialog from './PlantInstanceViewDialog';
import type { PlantInstance, ImageUploadData } from '@/types/store-management.types';

interface PlantInstanceTabProps {
  initialInstances?: PlantInstance[];
}

export default function PlantInstanceTab({ initialInstances = [] }: PlantInstanceTabProps) {
  const [instances, setInstances] = useState<PlantInstance[]>(initialInstances);
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingData, setEditingData] = useState<PlantInstance | undefined>();
  const [viewingData, setViewingData] = useState<PlantInstance | undefined>();
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = useCallback(() => {
    setEditingData(undefined);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((instance: PlantInstance) => {
    setEditingData(instance);
    setFormOpen(true);
  }, []);

  const handleView = useCallback((instance: PlantInstance) => {
    setViewingData(instance);
    setViewOpen(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    setDeleteTargetId(id);
    setDeleteOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteTargetId !== null) {
      setInstances((prev) => prev.filter((i) => i.id !== deleteTargetId));
      setDeleteOpen(false);
      setDeleteTargetId(null);
    }
  }, [deleteTargetId]);

  const handleFormSubmit = useCallback(
    (data: PlantInstance, images: ImageUploadData[]) => {
      setIsLoading(true);
      setTimeout(() => {
        if (editingData) {
          // Update existing
          setInstances((prev) =>
            prev.map((i) =>
              i.id === editingData.id
                ? {
                    ...data,
                    id: editingData.id,
                    images: images.map(img => ({
                      id: img.id,
                      foreignId: editingData.id,
                      url: img.url || img.preview,
                      isThumbnail: img.isThumbnail,
                      plantInstanceId: editingData.id,
                      file: undefined
                    }))
                  }
                : i
            )
          );
        } else {
          // Create new
          const newInstance: PlantInstance = {
            ...data,
            id: Math.max(0, ...instances.map((i) => i.id)) + 1,
            images: images.map(img => ({
              ...img,
              id: img.id,
              foreignId: Math.max(0, ...instances.map((i) => i.id)) + 1,
              url: img.url || img.preview,
              isThumbnail: img.isThumbnail,
              plantInstanceId: Math.max(0, ...instances.map((i) => i.id)) + 1,
              file: undefined
            }))
          };
          setInstances((prev) => [...prev, newInstance]);
        }
        setFormOpen(false);
        setEditingData(undefined);
        setIsLoading(false);
      }, 500);
    },
    [editingData, instances]
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="600">
          Danh sách mẫu cây ({instances.length})
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
          Thêm mẫu cây mới
        </Button>
      </Stack>

      <PlantInstanceTable instances={instances} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />

      <PlantInstanceFormDialog
        open={formOpen}
        editingData={editingData}
        onClose={() => {
          setFormOpen(false);
          setEditingData(undefined);
        }}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />

      <PlantInstanceViewDialog open={viewOpen} instance={viewingData} onClose={() => setViewOpen(false)} />

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa mẫu cây này? Hành động này không thể hoàn tác.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Hủy</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
