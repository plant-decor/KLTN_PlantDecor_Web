'use client';

import { useState, useCallback } from 'react';
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
  const [currentIndex, setCurrentIndex] = useState(initialImageIndex);

  const handleImageClick = useCallback(() => {
    setCurrentIndex(initialImageIndex);
    setIsModalOpen(true);
  }, [initialImageIndex]);

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
        <Image
          src={images[initialImageIndex]}
          alt={alt}
          className={className}
          priority={initialImageIndex === 0}
          style={{
            transition: 'transform 0.3s ease-in-out',
          }}
        />

        {/* Zoom Hint Button - Mobile and Desktop */}
        {showZoomHint && (
          <Tooltip title={`View all images (${images.length})`} arrow>
            <IconButton
              className="zoom-hint"
              onClick={handleImageClick}
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
            1/{images.length}
          </Box>
        )}
      </Box>

      {/* Fullscreen Modal */}
      <FullscreenImageModal
        images={images}
        initialIndex={initialImageIndex}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        alt={alt}
      />
    </>
  );
}
