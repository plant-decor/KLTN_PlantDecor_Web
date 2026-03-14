'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  CardMedia,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete, CloudUpload } from '@mui/icons-material';
import type { ImageUploadData } from '@/types/store-management.types';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';

interface ImageUploadProps {
  images: ImageUploadData[];
  onImagesChange: (images: ImageUploadData[]) => void;
  maxImages?: number;
  label?: string;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  label = 'Hình ảnh sản phẩm',
}: ImageUploadProps) {
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<string>('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    const newImages: ImageUploadData[] = [];
    const remainingSlots = maxImages - images.length;

    Array.from(files).slice(0, remainingSlots).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push({
          file,
          isThumbnail: false,
          preview: reader.result as string,
        });

        if (newImages.length === Array.from(files).slice(0, remainingSlots).length) {
          onImagesChange([...images, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const handleSetThumbnail = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isThumbnail: i === index,
    }));
    onImagesChange(updatedImages);
  };

  const handleOpenPreview = (preview: string) => {
    setSelectedPreview(preview);
    setPreviewDialogOpen(true);
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
        {label}
      </Typography>

      <Box
        sx={{
          width: '100%',
          height: 150,
          padding: 2,
          textAlign: 'center',
          cursor: 'pointer',
          ...hoverLiftStyle,
        }}
        component="label"
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
          disabled={images.length >= maxImages}
        />
        <Stack alignItems="center" spacing={1} sx={{border: '2px dashed', margin: 2, padding: 2, borderRadius: 8}}>
          <CloudUpload sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="body2" color="text.secondary">
            Kéo thả hoặc nhấp để chọn hình ảnh
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Tối đa {maxImages} hình ảnh | PNG, JPG, GIF (tối đa 5MB)
          </Typography>
        </Stack>
      </Box>

      {images.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" fontWeight="600" color="text.secondary" gutterBottom>
            Hình ảnh được tải lên ({images.length}/{maxImages})
          </Typography>
          <Grid container spacing={2}>
            {images.map((image, index) => (
              <Grid sx={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Paper
                  sx={{
                    position: 'relative',
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: image.isThumbnail ? '3px solid' : '1px solid',
                    borderColor: image.isThumbnail ? 'primary.main' : 'divider',
                  }}
                  onClick={() => handleOpenPreview(image.preview)}
                >
                  <CardMedia
                    component="img"
                    image={image.preview}
                    alt={`Preview ${index + 1}`}
                    sx={{ height: 200, objectFit: 'cover' }}
                  />
                  {image.isThumbnail && (
                    <Chip
                      label="Ảnh Chính"
                      size="small"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                      }}
                    />
                  )}

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 1,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                    }}
                  >
                    <Button
                      size="small"
                      className='text-white!'
                      variant={image.isThumbnail ? 'contained' : 'outlined'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetThumbnail(index);
                      }}
                      sx={{ flex: 1, fontSize: '0.7rem'}}
                    >
                      {image.isThumbnail ? '✓ Chính' : 'Đặt làm ảnh chính'}
                    </Button>
                    <IconButton
                      size="small"
                      className='text-error!'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="md">
        <DialogTitle>Xem trước hình ảnh</DialogTitle>
        <DialogContent>
          <Box
            component="img"
            src={selectedPreview}
            alt="Preview"
            sx={{ width: '100%', maxHeight: 600, objectFit: 'contain' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
