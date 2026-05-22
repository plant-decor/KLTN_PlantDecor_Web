'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import type { PlantEnumValue } from '@/lib/api/shopPlantsService';
import type { RoomViewAngle } from '@/types/ai-recommendation.types';
import ClickableImageViewer from '@/components/image-view/ClickableImageViewer';
import { CustomLoading } from '@/components/CustomLoading';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/heif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SLOT_ANGLES: RoomViewAngle[] = ['Front', 'Left', 'Right', 'Back'];

const MOCK_ROOM_DETECTIONS: Array<{ roomType: string; confidence: number }> = [
  { roomType: 'LivingRoom', confidence: 92 },
  { roomType: 'Bedroom', confidence: 88 },
  { roomType: 'HomeOffice', confidence: 85 },
  { roomType: 'Kitchen', confidence: 79 },
  { roomType: 'Balcony', confidence: 76 },
];

const humanizeEnum = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();

interface Step1Props {
  imagesByViewAngle: Partial<Record<RoomViewAngle, File>>;
  imagePreviewUrlsByViewAngle: Partial<Record<RoomViewAngle, string>>;
  roomType: string;
  roomStyle: string;
  roomArea: string;
  roomTypes: PlantEnumValue[];
  roomStyles: PlantEnumValue[];
  error: string | null;
  onUploadImage: (viewAngle: RoomViewAngle, event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (viewAngle: RoomViewAngle) => void;
  onRoomTypeChange: (value: string) => void;
  onRoomStyleChange: (value: string) => void;
  onRoomAreaChange: (value: string) => void;
  onErrorDismiss: () => void;
  onNext: () => void;
}

export default function Step1ImageUpload({
  imagesByViewAngle,
  imagePreviewUrlsByViewAngle,
  roomType,
  roomStyle,
  roomArea,
  roomTypes,
  roomStyles,
  error,
  onUploadImage,
  onRemoveImage,
  onRoomTypeChange,
  onRoomStyleChange,
  onRoomAreaChange,
  onErrorDismiss,
  onNext,
}: Step1Props) {
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedRoomType, setDetectedRoomType] = useState<string | null>(null);
  const [detectedConfidence, setDetectedConfidence] = useState<number>(0);
  const [isOverriding, setIsOverriding] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);
  const detectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const uploadedAngles = SLOT_ANGLES.filter((a) => Boolean(imagesByViewAngle[a]));
  const uploadCount = uploadedAngles.length;
  const hasAnyImage = uploadCount > 0;
  const canAddMore = uploadCount < 4;

  // Cleanup timer on unmount
  useEffect(() => () => {
    if (detectionTimerRef.current) clearTimeout(detectionTimerRef.current);
  }, []);

  const startMockDetection = () => {
    if (detectionTimerRef.current) clearTimeout(detectionTimerRef.current);
    setIsDetecting(true);
    setDetectedRoomType(null);
    const pick = MOCK_ROOM_DETECTIONS[Math.floor(Math.random() * MOCK_ROOM_DETECTIONS.length)];
    detectionTimerRef.current = setTimeout(() => {
      setIsDetecting(false);
      setDetectedRoomType(pick.roomType);
      setDetectedConfidence(pick.confidence);
      onRoomTypeChange(pick.roomType);
      setIsOverriding(false);
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setLocalError('Unsupported format. Please select JPEG, JPG, PNG, or HEIF.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setLocalError('File size must be 10 MB or less.');
      e.target.value = '';
      return;
    }
    // Auto-assign next free angle slot
    const nextAngle = SLOT_ANGLES.find((a) => !imagesByViewAngle[a]);
    if (!nextAngle) return;
    setLocalError(null);
    onErrorDismiss();
    // Trigger mock detection when adding the very first image
    if (uploadCount === 0) startMockDetection();
    onUploadImage(nextAngle, e);
  };

  const handleRemoveImage = (angle: RoomViewAngle) => {
    // Reset detection when removing the last image
    if (uploadCount === 1) {
      if (detectionTimerRef.current) clearTimeout(detectionTimerRef.current);
      setIsDetecting(false);
      setDetectedRoomType(null);
      setIsOverriding(false);
    }
    onRemoveImage(angle);
  };

  const displayError = localError ?? error;

  const roomTypeOptions =
    roomTypes.length > 0
      ? roomTypes
      : [
          { value: 1, name: 'LivingRoom' },
          { value: 2, name: 'Bedroom' },
          { value: 3, name: 'Kitchen' },
          { value: 4, name: 'HomeOffice' },
          { value: 5, name: 'Bathroom' },
          { value: 6, name: 'Balcony' },
        ];

  const roomStyleOptions =
    roomStyles.length > 0
      ? roomStyles
      : [
          { value: 1, name: 'Minimalist' },
          { value: 2, name: 'Scandinavian' },
          { value: 3, name: 'Modern' },
          { value: 4, name: 'Rustic' },
          { value: 5, name: 'Industrial' },
          { value: 6, name: 'Bohemian' },
        ];

  return (
    <Card sx={{ boxShadow: 2 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography variant="h6" fontWeight="bold">
            Room Images
          </Typography>
          <Typography variant="body2" color={uploadCount === 0 ? 'error' : 'text.secondary'}>
            {uploadCount} / 4 photo{uploadCount !== 1 ? 's' : ''}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Upload 1–4 photos of your room. At least one photo is required. AI will automatically detect the room type.
        </Typography>

        {displayError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => { setLocalError(null); onErrorDismiss(); }}>
            {displayError}
          </Alert>
        )}

        {/* Photo grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Uploaded thumbnails */}
          {uploadedAngles.map((angle, idx) => {
            const previewUrl = imagePreviewUrlsByViewAngle[angle];
            return (
              <Box key={angle} sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', aspectRatio: '1 / 1' }}>
                {previewUrl ? (
                  <ClickableImageViewer
                    images={[previewUrl]}
                    alt={`Room photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                    containerClassName="block w-full h-full"
                    showZoomHint={false}
                  />
                ) : (
                  <Box sx={{ width: '100%', height: '100%', backgroundColor: 'action.hover' }} />
                )}
                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  onClick={() => handleRemoveImage(angle)}
                  sx={{ position: 'absolute', top: 4, right: 4, minWidth: 0, p: 0.5, ...hoverLiftStyle }}
                >
                  <DeleteIcon fontSize="small" />
                </Button>
                {idx === 0 && (
                  <Chip
                    label="Main"
                    size="small"
                    color="primary"
                    sx={{ position: 'absolute', bottom: 4, left: 4, fontSize: '0.65rem', height: 18 }}
                  />
                )}
              </Box>
            );
          })}

          {/* Add photo slot — visible when < 4 images */}
          {canAddMore && (
            <Box
              component="label"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                aspectRatio: '1 / 1',
                border: '2px dashed',
                borderColor: uploadCount === 0 ? 'primary.main' : 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                transition: 'border-color 0.2s, background-color 0.2s',
                '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
              }}
            >
              <AddPhotoIcon color={uploadCount === 0 ? 'primary' : 'action'} />
              <Typography variant="caption" color={uploadCount === 0 ? 'primary' : 'text.secondary'} textAlign="center">
                {uploadCount === 0 ? 'Add photo *' : 'Add more'}
              </Typography>
              <input
                ref={addInputRef}
                hidden
                accept="image/jpeg,image/jpg,image/png,image/heif"
                type="file"
                onChange={handleFileChange}
              />
            </Box>
          )}
        </Box>

        {/* AI detection status */}
        {isDetecting && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 1.5, backgroundColor: 'action.hover', borderRadius: 1 }}>
            <CustomLoading size={20} />
            <Typography variant="body2" color="text.secondary">
              AI is analyzing the image...
            </Typography>
          </Box>
        )}

        {detectedRoomType && !isDetecting && (
          <Box sx={{ mb: 2, p: 1.5, border: '1px solid', borderColor: 'success.light', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', bgcolor: 'success.50' }}>
            <AutoAwesomeIcon color="success" fontSize="small" />
            <Typography variant="body2" fontWeight={600}>
              AI detected:
            </Typography>
            <Chip
              label={`${humanizeEnum(detectedRoomType)} — ${detectedConfidence}%`}
              color="success"
              size="small"
              variant="outlined"
            />
            {!isOverriding && (
              <Button size="small" startIcon={<EditIcon />} onClick={() => setIsOverriding(true)} sx={{ ml: 'auto' }}>
                Override
              </Button>
            )}
          </Box>
        )}

        {/* Room details */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Room type"
            value={roomType}
            onChange={(e) => onRoomTypeChange(e.target.value)}
            select
            fullWidth
            disabled={detectedRoomType !== null && !isOverriding}
            helperText={detectedRoomType && !isOverriding ? 'AI detected result (click Override to change)' : ' '}
          >
            {roomTypeOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.name}>
                {humanizeEnum(opt.name)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Room style"
            value={roomStyle}
            onChange={(e) => onRoomStyleChange(e.target.value)}
            select
            fullWidth
            helperText=" "
          >
            {roomStyleOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.name}>
                {humanizeEnum(opt.name)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Room area (m²)"
            value={roomArea}
            onChange={(e) => onRoomAreaChange(e.target.value)}
            type="number"
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
            helperText=" "
          />
        </Box>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={onNext}
            disabled={!hasAnyImage || isDetecting}
            sx={{ backgroundColor: 'var(--primary)', fontWeight: 600, ...hoverLiftStyle }}
          >
            Next
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
