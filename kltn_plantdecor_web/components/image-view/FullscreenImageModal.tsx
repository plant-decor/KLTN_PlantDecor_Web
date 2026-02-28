'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  MobileStepper,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';

interface FullscreenImageModalProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  alt?: string;
}

export default function FullscreenImageModal({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  alt = 'Image',
}: FullscreenImageModalProps) {
  const [activeStep, setActiveStep] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const maxSteps = images.length;

  useEffect(() => {
    setActiveStep(initialIndex);
    setZoom(1);
  }, [initialIndex, isOpen]);

  const handleNext = useCallback(() => {
    setActiveStep((prevActiveStep) => (prevActiveStep + 1) % maxSteps);
    setZoom(1);
  }, [maxSteps]);

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => (prevActiveStep - 1 + maxSteps) % maxSteps);
    setZoom(1);
  }, [maxSteps]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, 1));
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handleBack();
          break;
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handleBack, handleZoomIn, handleZoomOut, onClose]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen={false}
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          backgroundImage: 'none',
          boxShadow: 'none',
          borderRadius: 0,
          maxHeight: '100vh',
        },
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          cursor: 'pointer',
        },
      }}
    >
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 0,
          height: '100vh',
          position: 'relative',
          backgroundColor: 'transparent',
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: '#fff',
            backgroundColor: 'rgb(255, 255, 255)',
            '&:hover': {
              backgroundColor: 'rgb(255, 0, 0)',
            },
            zIndex: 10,
          }}
          size="large"
        >
          <CloseIcon fontSize="large" />
        </IconButton>

        {/* Main Image Container */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 'calc(100vh - 120px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              src={images[activeStep]}
              alt={`${alt} ${activeStep + 1}`}
              fill
              className="object-contain"
              style={{
                transform: `scale(${zoom})`,
                transition: 'transform 0.2s ease-in-out',
                cursor: zoom > 1 ? 'grab' : 'pointer',
              }}
              priority
              quality={90}
            />
          </Box>

          {/* Navigation Arrows - Visible on larger screens */}
          {maxSteps > 1 && (
            <>
              <IconButton
                onClick={handleBack}
                sx={{
                  position: 'absolute',
                  left: 16,
                  color: '#fff',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgb(0, 255, 42)',
                  },
                  display: { xs: 'none', sm: 'flex' },
                  zIndex: 5,
                }}
                size="large"
              >
                <ChevronLeftIcon fontSize="large" />
              </IconButton>

              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 16,
                  color: '#fff',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgb(0, 255, 42)',
                  },
                  display: { xs: 'none', sm: 'flex' },
                  zIndex: 5,
                }}
                size="large"
              >
                <ChevronRightIcon fontSize="large" />
              </IconButton>
            </>
          )}
        </Box>

        {/* Zoom Controls */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: 2,
            justifyContent: 'center',
          }}
        >
          <IconButton
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            sx={{
              color: zoom <= 1 ? 'rgba(255, 255, 255, 0.3)' : '#fff',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgb(0, 255, 42)',
              },
            }}
            size="small"
          >
            <ZoomOutIcon />
          </IconButton>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: '#000000',
              px: 2,
              backgroundColor: 'rgb(0, 255, 42)',
              borderRadius: 1,
              minWidth: '60px',
              justifyContent: 'center',
            }}
          >
            {Math.round(zoom * 100)}%
          </Box>

          <IconButton
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            sx={{
              color: zoom >= 3 ? 'rgba(255, 255, 255, 0.3)' : '#fff',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgb(0, 255, 42)',
              },
            }}
            size="small"
          >
            <ZoomInIcon />
          </IconButton>
        </Box>

        {/* Image Counter and Navigation */}
        {maxSteps > 1 && (
          <MobileStepper
            variant="progress"
            steps={maxSteps}
            position="bottom"
            activeStep={activeStep}
            sx={{
              width: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              mt: 2,
              '& .MuiLinearProgress-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#4ade80',
              },
            }}
            nextButton={
              <Button
                size="small"
                onClick={handleNext}
                sx={{
                  color: '#fff',
                  display: { xs: 'flex', sm: 'none' },
                }}
              >
                Next
              </Button>
            }
            backButton={
              <Button
                size="small"
                onClick={handleBack}
                sx={{
                  color: '#fff',
                  display: { xs: 'flex', sm: 'none' },
                }}
              >
                Back
              </Button>
            }
          />
        )}

        {/* Info Text */}
        <Box
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.875rem',
            mt: 1,
            pb: 2,
            textAlign: 'center',
          }}
        >
          {maxSteps > 1 && (
            <span>
              {activeStep + 1} / {maxSteps} • Use arrow keys to navigate • +/- to zoom
            </span>
          )}
          {maxSteps === 1 && <span>Press ESC to close</span>}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
