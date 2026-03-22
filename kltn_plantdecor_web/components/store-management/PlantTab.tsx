'use client';

import React, { useState, useCallback } from 'react';
import { Box, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import PlantTable from './PlantTable';
import PlantFormDialog from './PlantFormDialog';
import PlantViewDialog from './PlantViewDialog';
import type { Plant, ImageUploadData } from '@/types/store-management.types';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';

interface PlantTabProps {
    initialPlants?: Plant[];
}

export default function PlantTab({ initialPlants = [] }: PlantTabProps) {
    const [plants, setPlants] = useState<Plant[]>(initialPlants);
    const [formOpen, setFormOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editingData, setEditingData] = useState<Plant | undefined>();
    const [viewingData, setViewingData] = useState<Plant | undefined>();
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = useCallback(() => {
        setEditingData(undefined);
        setFormOpen(true);
    }, []);

    const handleEdit = useCallback((plant: Plant) => {
        setEditingData(plant);
        setFormOpen(true);
    }, []);

    const handleView = useCallback((plant: Plant) => {
        setViewingData(plant);
        setViewOpen(true);
    }, []);

    const handleDelete = useCallback((plantId: number) => {
        setDeleteTargetId(plantId);
        setDeleteOpen(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (deleteTargetId !== null) {
            setPlants((prev) => prev.filter((p) => p.plantId !== deleteTargetId));
            setDeleteOpen(false);
            setDeleteTargetId(null);
        }
    }, [deleteTargetId]);

    const handleFormSubmit = useCallback(
        (data: Plant, images: ImageUploadData[]) => {
            setIsLoading(true);
            setTimeout(() => {
                if (editingData) {
                    // Update existing
                    setPlants((prev) =>
                        prev.map((p) =>
                            p.plantId === editingData.plantId
                                ? {
                                    ...data,
                                    plantId: editingData.plantId,
                                    images: images.map(img => ({
                                        id: img.id,
                                        foreignId: editingData.plantId,
                                        url: img.url || img.preview,
                                        isThumbnail: img.isThumbnail,
                                        createdAt: img.createdAt,
                                        plantId: editingData.plantId,
                                        file: undefined
                                    }))
                                }
                                : p
                        )
                    );
                } else {
                    // Create new
                    const newPlant: Plant = {
                        ...data,
                        plantId: Math.max(0, ...plants.map((p) => p.plantId)) + 1,
                        images: images.map(img => ({
                            id: img.id,
                            foreignId: Math.max(0, ...plants.map((p) => p.plantId)) + 1,
                            url: img.url || img.preview,
                            isThumbnail: img.isThumbnail,
                            file: undefined
                        }))
                    };
                    setPlants((prev) => [...prev, newPlant]);
                }
                setFormOpen(false);
                setEditingData(undefined);
                setIsLoading(false);
            }, 500);
        },
        [editingData, plants]
    );

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="600">
                    Danh sách cây ({plants.length})
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={handleCreate} sx={{...hoverLiftStyle}} className='bg-primary!'>
                    Thêm cây mới
                </Button>
            </Stack>

            <PlantTable plants={plants} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />

            <PlantFormDialog
                open={formOpen}
                editingData={editingData}
                onClose={() => {
                    setFormOpen(false);
                    setEditingData(undefined);
                }}
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
            />

            <PlantViewDialog open={viewOpen} plant={viewingData} onClose={() => setViewOpen(false)} />

            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn xóa cây này? Hành động này không thể hoàn tác.</Typography>
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
