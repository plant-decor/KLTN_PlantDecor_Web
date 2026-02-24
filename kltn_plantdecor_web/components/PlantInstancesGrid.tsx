'use client';

import Image from 'next/image';
import { PlantInstance, SAMPLE_PLANTS } from '@/data/sampledata';
import { useState } from 'react';

interface PlantInstancesGridProps {
  instances: PlantInstance[];
  plantId: number;
}

export default function PlantInstancesGrid({ instances, plantId }: PlantInstancesGridProps) {
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(
    instances.length > 0 ? instances[0].id : null
  );

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🌿 Chọn cây bonsai bạn thích</h2>
        <p className="text-gray-600">
          Mỗi cây có các mức giá khác nhau tùy theo kích thước và tuổi của cây. Click vào ảnh để xem chi tiết.
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
              {/* Image */}
              {instance.imageUrl && (
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    src={instance.imageUrl}
                    alt={instance.customName || plant.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                  ✓ Đã chọn
                </div>
              )}

              {/* On Sale Badge */}
              {isOnSale && (
                <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  Giảm giá
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
          <h3 className="font-bold text-blue-900 mb-2">📋 Thông tin cây đã chọn</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-800">
            <div>
              <span className="block text-xs text-blue-600 font-semibold">Tên</span>
              <span className="block font-medium">{selectedInstance.customName || plant.name}</span>
            </div>
            <div>
              <span className="block text-xs text-blue-600 font-semibold">Giá</span>
              <span className="block font-bold text-green-600">
                ₫{getInstancePrice(selectedInstance).toLocaleString('vi-VN')}
              </span>
            </div>
            {selectedInstance.location && (
              <div>
                <span className="block text-xs text-blue-600 font-semibold">Vị trí</span>
                <span className="block font-medium">{selectedInstance.location}</span>
              </div>
            )}
            <div>
              <span className="block text-xs text-blue-600 font-semibold">Trạng thái</span>
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
          Còn hàng: <strong>{instances.length} cây</strong>
        </span>
        {minPrice < plant.price && (
          <span className="ml-3 inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
            Giá từ ₫{minPrice.toLocaleString('vi-VN')}
          </span>
        )}
      </div>
    </div>
  );
}
