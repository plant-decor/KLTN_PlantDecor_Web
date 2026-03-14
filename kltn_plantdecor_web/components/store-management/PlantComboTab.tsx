'use client';

import React, { useState, useCallback } from 'react';
import { Box, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import PlantComboTable from './PlantComboTable';
import PlantComboFormDialog from './PlantComboFormDialog';
import PlantComboViewDialog from './PlantComboViewDialog';
import type { PlantCombo, ImageUploadData } from '@/types/store-management.types';

interface PlantComboTabProps {
    initialCombos?: PlantCombo[];
}

export default function PlantComboTab({ initialCombos = [] }: PlantComboTabProps) {
    const [combos, setCombos] = useState<PlantCombo[]>(initialCombos);
    const [formOpen, setFormOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editingData, setEditingData] = useState<PlantCombo | undefined>();
    const [viewingData, setViewingData] = useState<PlantCombo | undefined>();
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = useCallback(() => {
        setEditingData(undefined);
        setFormOpen(true);
    }, []);

    const handleEdit = useCallback((combo: PlantCombo) => {
        setEditingData(combo);
        setFormOpen(true);
    }, []);

    const handleView = useCallback((combo: PlantCombo) => {
        setViewingData(combo);
        setViewOpen(true);
    }, []);

    const handleDelete = useCallback((comboId: number) => {
        setDeleteTargetId(comboId);
        setDeleteOpen(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (deleteTargetId !== null) {
            setCombos((prev) => prev.filter((c) => c.plantComboId !== deleteTargetId));
            setDeleteOpen(false);
            setDeleteTargetId(null);
        }
    }, [deleteTargetId]);

    const handleFormSubmit = useCallback(
        (data: PlantCombo, images: ImageUploadData[]) => {
            setIsLoading(true);
            setTimeout(() => {
                if (editingData) {
                    // Update existing
                    setCombos((prev) =>
                        prev.map((c) =>
                            c.plantComboId === editingData.plantComboId
                                ? {
                                    ...data,
                                    plantComboId: editingData.plantComboId,
                                    images: images.map(img => ({
                                        id: img.id,
                                        plantComboId: editingData.plantComboId,
                                        url: img.url || img.preview,
                                        isThumbnail: img.isThumbnail,
                                        createdAt: img.createdAt
                                    }))
                                }
                                : c
                        )
                    );
                } else {
                    // Create new
                    const newCombo: PlantCombo = {
                        ...data,
                        plantComboId: Math.max(0, ...combos.map((c) => c.plantComboId)) + 1,
                        images: images.map(img => ({
                            id: img.id,
                            plantComboId: Math.max(0, ...combos.map((c) => c.plantComboId)) + 1,
                            url: img.url || img.preview,
                            isThumbnail: img.isThumbnail,
                            createdAt: img.createdAt,
                            file: undefined
                        }))
                    };
                    setCombos((prev) => [...prev, newCombo]);
                }
                setFormOpen(false);
                setEditingData(undefined);
                setIsLoading(false);
            }, 500);
        },
        [editingData, combos]
    );

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="600">
                    Danh sách combo ({combos.length})
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
                    Thêm combo mới
                </Button>
            </Stack>

            <PlantComboTable combos={combos} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />

            <PlantComboFormDialog
                open={formOpen}
                editingData={editingData}
                onClose={() => {
                    setFormOpen(false);
                    setEditingData(undefined);
                }}
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
            />

            <PlantComboViewDialog open={viewOpen} combo={viewingData} onClose={() => setViewOpen(false)} />

            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn xóa combo này? Hành động này không thể hoàn tác.</Typography>
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
