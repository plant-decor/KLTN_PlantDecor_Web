'use client';

import React, { useState, useCallback } from 'react';
import { Box, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import MaterialTable from './MaterialTable';
import MaterialFormDialog from './MaterialFormDialog';
import MaterialViewDialog from './MaterialViewDialog';
import type { Material, ImageUploadData } from '@/types/store-management.types';

interface MaterialTabProps {
    initialMaterials?: Material[];
}

export default function MaterialTab({ initialMaterials = [] }: MaterialTabProps) {
    const [materials, setMaterials] = useState<Material[]>(initialMaterials);
    const [formOpen, setFormOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editingData, setEditingData] = useState<Material | undefined>();
    const [viewingData, setViewingData] = useState<Material | undefined>();
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = useCallback(() => {
        setEditingData(undefined);
        setFormOpen(true);
    }, []);

    const handleEdit = useCallback((material: Material) => {
        setEditingData(material);
        setFormOpen(true);
    }, []);

    const handleView = useCallback((material: Material) => {
        setViewingData(material);
        setViewOpen(true);
    }, []);

    const handleDelete = useCallback((id: number) => {
        setDeleteTargetId(id);
        setDeleteOpen(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (deleteTargetId !== null) {
            setMaterials((prev) => prev.filter((m) => m.id !== deleteTargetId));
            setDeleteOpen(false);
            setDeleteTargetId(null);
        }
    }, [deleteTargetId]);

    const handleFormSubmit = useCallback(
        (data: Material, images: ImageUploadData[]) => {
            setIsLoading(true);
            setTimeout(() => {
                if (editingData) {
                    // Update existing
                    setMaterials((prev) =>
                        prev.map((m) =>
                            m.id === editingData.id
                                ? {
                                    ...data,
                                    id: editingData.id,
                                    images: images.map(img => ({
                                        id: img.id,
                                        materialId: editingData.id,
                                        url: img.url || img.preview,
                                        isThumbnail: img.isThumbnail,
                                        createdAt: img.createdAt
                                    }))
                                }
                                : m
                        )
                    );
                } else {
                    // Create new
                    const newMaterial: Material = {
                        ...data,
                        id: Math.max(0, ...materials.map((m) => m.id)) + 1,
                        images: images.map(img => ({
                            id:img.id,
                            materialId: Math.max(0, ...materials.map((m) => m.id)) + 1,
                            url: img.url || img.preview,
                            isThumbnail: img.isThumbnail,
                            createdAt: img.createdAt,
                            file: undefined
                        }))
                    };
                    setMaterials((prev) => [...prev, newMaterial]);
                }
                setFormOpen(false);
                setEditingData(undefined);
                setIsLoading(false);
            }, 500);
        },
        [editingData, materials]
    );

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="600">
                    Danh sách vật tư ({materials.length})
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
                    Thêm vật tư mới
                </Button>
            </Stack>

            <MaterialTable materials={materials} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />

            <MaterialFormDialog
                open={formOpen}
                editingData={editingData}
                onClose={() => {
                    setFormOpen(false);
                    setEditingData(undefined);
                }}
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
            />

            <MaterialViewDialog open={viewOpen} material={viewingData} onClose={() => setViewOpen(false)} />

            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn xóa vật tư này? Hành động này không thể hoàn tác.</Typography>
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
