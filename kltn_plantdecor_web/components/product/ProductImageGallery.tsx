'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Box, IconButton, Tooltip } from '@mui/material';
import { ZoomIn as ZoomInIcon } from '@mui/icons-material';
import FullscreenImageModal from '@/components/image-view/FullscreenImageModal';

interface ProductImageGalleryProps {
  images: string[];
  plantName: string;
  isNewArrival?: boolean;
  isSale?: boolean;
  newLabel?: string;
  saleLabel?: string;
}

export default function ProductImageGallery({
  images,
  plantName,
  isNewArrival = false,
  isSale = false,
  newLabel = 'New',
  saleLabel = 'Sale',
}: ProductImageGalleryProps) {
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  return (
    <div>
      {/* Main Image */}
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '1 / 1',
          mb: 2,
          borderRadius: 1,
          overflow: 'hidden',
          backgroundColor: '#f3f4f6',
          cursor: 'pointer',
          '&:hover img': {
            transform: 'scale(1.05)',
          },
          '&:hover .zoom-hint': {
            opacity: 1,
          },
        }}
        onClick={() => setFullscreenIndex(0)}
      >
        <Image
          src={images[0]}
          alt={plantName}
          fill
          className="object-cover"
          style={{
            transition: 'transform 0.3s ease-in-out',
          }}
          priority
        />

        {/* Badges */}
        {isNewArrival && (
          <span className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 text-sm rounded">
            {newLabel}
          </span>
        )}
        {isSale && (
          <span className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 text-sm rounded">
            {saleLabel}
          </span>
        )}

        {/* Zoom Hint */}
        <Tooltip
          title={`View all images (${images.length})`}
          arrow
        >
          <IconButton
            className="zoom-hint"
            onClick={() => setFullscreenIndex(0)}
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

        {/* Multiple Images Indicator */}
        {images.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
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

      {/* Image Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((img, idx) => (
            <Box
              key={idx}
              sx={{
                position: 'relative',
                aspectRatio: '1 / 1',
                borderRadius: 1,
                overflow: 'hidden',
                border: '2px solid',
                borderColor: hoverIndex === idx ? '#22c55e' : '#e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  borderColor: '#22c55e',
                  transform: 'scale(1.02)',
                },
                '&:hover img': {
                  transform: 'scale(1.1)',
                },
                '&:hover .thumbnail-overlay': {
                  opacity: 1,
                },
              }}
              onClick={() => setFullscreenIndex(idx)}
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <Image
                src={img}
                alt={`${plantName} ${idx + 1}`}
                fill
                className="object-cover"
                style={{
                  transition: 'transform 0.3s ease-in-out',
                }}
              />

              {/* Thumbnail Overlay */}
              <Box
                className="thumbnail-overlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease-in-out',
                }}
              >
                <ZoomInIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
            </Box>
          ))}

          {/* More Images Indicator */}
          {images.length > 4 && (
            <Box
              sx={{
                position: 'relative',
                aspectRatio: '1 / 1',
                borderRadius: 1,
                overflow: 'hidden',
                border: '2px solid #e5e7eb',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                color: '#6b7280',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  borderColor: '#22c55e',
                  backgroundColor: '#f0fdf4',
                },
              }}
              onClick={() => setFullscreenIndex(4)}
            >
              +{images.length - 4} more
            </Box>
          )}
        </div>
      )}

      {/* Fullscreen Modal */}
      {fullscreenIndex !== null && (
        <FullscreenImageModal
          images={images}
          initialIndex={fullscreenIndex}
          isOpen={fullscreenIndex !== null}
          onClose={() => setFullscreenIndex(null)}
          alt={plantName}
        />
      )}
    </div>
  );
}
