'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Box, IconButton, Tooltip } from '@mui/material';
import { ZoomIn as ZoomInIcon } from '@mui/icons-material';
import FullscreenImageModal from './FullscreenImageModal';

interface ClickableImageViewerProps {
  images: string[];
  initialImageIndex?: number;
  alt?: string;
  className?: string;
  containerClassName?: string;
  showZoomHint?: boolean;
}

export default function ClickableImageViewer({
  images,
  initialImageIndex = 0,
  alt = 'Image',
  className = '',
  containerClassName = '',
  showZoomHint = true,
}: ClickableImageViewerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const safeInitialIndex = useMemo(() => {
    if (images.length === 0) return 0;
    return Math.min(Math.max(initialImageIndex, 0), images.length - 1);
  }, [images.length, initialImageIndex]);

  const [currentIndex, setCurrentIndex] = useState(safeInitialIndex);

  useEffect(() => {
    setCurrentIndex(safeInitialIndex);
  }, [safeInitialIndex]);

  const handleImageClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const currentImage = images[currentIndex] ?? images[0] ?? '';

  return (
    <>
      {/* Main Image Container */}
      <Box
        component="div"
        className={containerClassName}
        sx={{
          position: 'relative',
          cursor: 'pointer',
          overflow: 'hidden',
          borderRadius: 1,
          '&:hover .zoom-hint': {
            opacity: 1,
          },
          '&:hover img': {
            transform: 'scale(1.05)',
          },
        }}
        onClick={handleImageClick}
      >
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
          <Image
            src={currentImage}
            alt={alt}
            className={className + ' object-contain'}
            priority={currentIndex === 0}
            layout="fill"
            loading='eager'
            style={{
              transition: 'transform 0.3s ease-in-out',
            }}
          />
        </div>

        {/* Zoom Hint Button - Mobile and Desktop */}
        {showZoomHint && (
          <Tooltip title={`View all images (${images.length})`} arrow>
            <IconButton
              className="zoom-hint"
              onClick={(event) => {
                event.stopPropagation();
                handleImageClick();
              }}
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                backgroundColor: 'rgba(76, 175, 80, 0.9)',
                color: 'white',
                opacity: { xs: 1, sm: 0 },
                transition: 'opacity 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(56, 142, 60, 1)',
                },
                zIndex: 5,
              }}
              size="medium"
            >
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Image Count Badge - Only show if multiple images */}
        {images.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 'bold',
              zIndex: 4,
            }}
          >
            {currentIndex + 1}/{images.length}
          </Box>
        )}
      </Box>

      {images.length > 1 && (
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            pb: 0.5,
          }}
        >
          {images.map((image, index) => (
            <Box
              key={`${image}-${index}`}
              component="button"
              type="button"
              onClick={() => handleThumbnailClick(index)}
              sx={{
                position: 'relative',
                width: 72,
                height: 72,
                flex: '0 0 auto',
                borderRadius: 1,
                overflow: 'hidden',
                border: currentIndex === index ? '2px solid #16a34a' : '1px solid #d1d5db',
                opacity: currentIndex === index ? 1 : 0.75,
                cursor: 'pointer',
                backgroundColor: '#f3f4f6',
              }}
            >
              <Image
                src={image}
                loading='eager'
                alt={`${alt} ${index + 1}`}
                layout="fill"
                className="object-cover"
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Fullscreen Modal */}
      <FullscreenImageModal
        images={images}
        initialIndex={currentIndex}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        alt={alt}
      />
    </>
  );
}
