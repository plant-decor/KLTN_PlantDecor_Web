'use client';

import Image from 'next/image';
import { PlantInstance, SAMPLE_PLANTS } from '@/data/sampledata';
import { useTranslations } from 'next-intl';
import { use, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { ZoomIn as ZoomInIcon } from '@mui/icons-material';
import FullscreenImageModal from '@/components/image-view/FullscreenImageModal';

interface PlantInstancesGridProps {
  instances: PlantInstance[];
  plantId: number;
}

export default function PlantInstancesGrid({ instances, plantId }: PlantInstancesGridProps) {
  const t = useTranslations('PlantInstancesGrid');
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(
    instances.length > 0 ? instances[0].id : null
  );
  const [fullscreenImageId, setFullscreenImageId] = useState<number | null>(null);

  const selectedInstance = instances.find(i => i.id === selectedInstanceId);
  const plant = SAMPLE_PLANTS.find(p => p.id === plantId);

  if (!plant || instances.length === 0) return null;

  const getInstancePrice = (instance: PlantInstance) => {
    return instance.price || plant.price;
  };

  const minPrice = Math.min(...instances.map(getInstancePrice));

  return (
    <div className="mt-12 bg-white rounded-xl shadow-md p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h2>
        <p className="text-gray-600">
          {t('description')}
        </p>
      </div>

      {/* Instances Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {instances.map((instance) => {
          const price = getInstancePrice(instance);
          const isSelected = selectedInstanceId === instance.id;
          const isOnSale = price < plant.price;

          return (
            <button
              key={instance.id}
              onClick={() => setSelectedInstanceId(instance.id)}
              className={`relative rounded-lg overflow-hidden border-2 transition-all hover:shadow-lg ${
                isSelected
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-green-400'
              }`}
            >
              {/* Image with Fullscreen Viewer */}
              {instance.imageUrl && (
                <Box
                  sx={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    backgroundColor: '#f3f4f6',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    '&:hover img': {
                      transform: 'scale(1.05)',
                    },
                    '&:hover .zoom-hint': {
                      opacity: 1,
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenImageId(instance.id);
                  }}
                >
                  <Image
                    src={instance.imageUrl}
                    alt={instance.customName || plant.name}
                    fill
                    className="object-cover"
                    style={{
                      transition: 'transform 0.3s ease-in-out',
                    }}
                  />

                  {/* Zoom Hint */}
                  <Tooltip title="View fullscreen" arrow>
                    <IconButton
                      className="zoom-hint"
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 4,
                        right: 4,
                        backgroundColor: 'rgba(76, 175, 80, 0.9)',
                        color: 'white',
                        opacity: { xs: 1, sm: 0 },
                        transition: 'opacity 0.3s ease-in-out',
                        '&:hover': {
                          backgroundColor: 'rgba(56, 142, 60, 1)',
                        },
                        zIndex: 5,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullscreenImageId(instance.id);
                      }}
                    >
                      <ZoomInIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                  ✓ {t('selected')}
                </div>
              )}

              {/* On Sale Badge */}
              {isOnSale && (
                <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  {t('onSale')}
                </div>
              )}

              {/* Info Overlay */}
              <div className="p-3 text-left bg-white">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {instance.customName || plant.name}
                </h3>
                <p className="text-green-600 font-bold text-lg mt-1">
                  ₫{price.toLocaleString('vi-VN')}
                </p>
                {isOnSale && (
                  <p className="text-xs text-gray-500 line-through">
                    ₫{plant.price.toLocaleString('vi-VN')}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Instance Details */}
      {selectedInstance && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <h3 className="font-bold text-blue-900 mb-2">📋 {t('selectedInfo')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-800">
            <div>
              <span className="block text-xs text-blue-600 font-semibold">{t('name')}</span>
              <span className="block font-medium">{selectedInstance.customName || plant.name}</span>
            </div>
            <div>
              <span className="block text-xs text-blue-600 font-semibold">{t('price')}</span>
              <span className="block font-bold text-green-600">
                ₫{getInstancePrice(selectedInstance).toLocaleString('vi-VN')}
              </span>
            </div>
            {selectedInstance.location && (
              <div>
                <span className="block text-xs text-blue-600 font-semibold">{t('location')}</span>
                <span className="block font-medium">{selectedInstance.location}</span>
              </div>
            )}
            <div>
              <span className="block text-xs text-blue-600 font-semibold">{t('status')}</span>
              <span className="block font-medium capitalize">
                {selectedInstance.status === 'healthy' ? '✓ Khỏe'
                  : selectedInstance.status === 'thriving' ? '✨ Phát triển tốt'
                  : selectedInstance.status === 'needs-attention' ? '⚠️ Cần chăm sóc'
                  : '🔴 Nghiêm trọng'}
              </span>
            </div>
          </div>
          {selectedInstance.notes && (
            <p className="mt-3 text-sm text-blue-700 bg-white bg-opacity-60 p-2 rounded">
              📝 {selectedInstance.notes}
            </p>
          )}
        </div>
      )}

      {/* Stock Info */}
      <div className="mt-6 text-sm">
        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
          {t('inStock')}: <strong>{instances.length} cây</strong>
        </span>
        {minPrice < plant.price && (
          <span className="ml-3 inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
            {t('fromPrice')} ₫{minPrice.toLocaleString('vi-VN')}
          </span>
        )}
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImageId !== null && (
        <FullscreenImageModal
          images={[
            instances.find((i) => i.id === fullscreenImageId)?.imageUrl || '',
          ]}
          initialIndex={0}
          isOpen={fullscreenImageId !== null}
          onClose={() => setFullscreenImageId(null)}
          alt={
            instances.find((i) => i.id === fullscreenImageId)?.customName ||
            plant?.name ||
            'Instance'
          }
        />
      )}
    </div>
  );
}
