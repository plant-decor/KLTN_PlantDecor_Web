import Image from 'next/image';
import Link from 'next/link';
import { SAMPLE_PLANT_INSTANCES, SAMPLE_PLANTS } from '@/data/sampledata';
import MyPlantsClient from '@/components/plant/MyPlantsClient';

interface PageProps {
  params: Promise<{ userid: string }>;
}

export default async function MyPlantPage({ params }: PageProps) {
  const { userid } = await params;
  const userPlantInstances = SAMPLE_PLANT_INSTANCES.filter(
    instance => instance.userId === parseInt(userid)
  );

  const getPlantInfo = (plantId: number) => {
    return SAMPLE_PLANTS.find(p => p.id === plantId);
  };

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🌱 Cây của tôi</h1>
          <p className="text-xl text-gray-600">
            Quản lý và chăm sóc {userPlantInstances.length} cây trong vườn của bạn
          </p>
        </div>

        {userPlantInstances.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🌿</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bạn chưa có cây nào</h2>
            <p className="text-gray-600 mb-6">
              Hãy thêm những cây yêu thích vào vườn của bạn để bắt đầu quản lý và chăm sóc chúng.
            </p>
            <Link
              href="/plant-store"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              🛒 Ghé thăm cửa hàng
            </Link>
          </div>
        ) : (
          // Instances Grid
          <div className="space-y-6">
            {userPlantInstances.map((instance) => {
              const plant = getPlantInfo(instance.plantId);
              if (!plant) return null;

              const statusColors = {
                healthy: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', label: '✓ Khỏe mạnh' },
                thriving: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', label: '✨ Phát triển tốt' },
                'needs-attention': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', label: '⚠️ Cần chăm sóc' },
                critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', label: '🔴 Tình trạng nghiêm trọng' },
              };
              const statusColor = statusColors[instance.status as keyof typeof statusColors] || statusColors.healthy;

              return (
                <div key={instance.id} className={`${statusColor.bg} ${statusColor.border} border rounded-lg overflow-hidden hover:shadow-lg transition-shadow`}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
                    {/* Plant Image */}
                    <div className="md:col-span-1">
                      {instance.imageUrl && (
                        <div className="relative aspect-square rounded-lg overflow-hidden">
                          <Image
                            src={instance.imageUrl}
                            alt={instance.customName || plant.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Plant Info */}
                    <div className="md:col-span-2 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {instance.customName || plant.name}
                        </h3>
                        <p className="text-sm text-gray-600 italic mb-4">{plant.scientificName}</p>
                        
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColor.text} mb-3`}>
                          {statusColor.label}
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {instance.location && (
                            <div>
                              <span className="text-gray-600">📍 Vị trí:</span>
                              <p className="font-semibold text-gray-900">{instance.location}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600">📅 Mua từ:</span>
                            <p className="font-semibold text-gray-900">
                              {new Date(instance.acquiredDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          {instance.lastWatered && (
                            <div>
                              <span className="text-gray-600">💧 Tưới lần cuối:</span>
                              <p className="font-semibold text-gray-900">
                                {new Date(instance.lastWatered).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          )}
                          {instance.lastFertilized && (
                            <div>
                              <span className="text-gray-600">🌱 Phân bón:</span>
                              <p className="font-semibold text-gray-900">
                                {new Date(instance.lastFertilized).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          )}
                        </div>

                        {instance.notes && (
                          <div className="mt-3 bg-white bg-opacity-50 p-2 rounded text-sm text-gray-700">
                            📝 {instance.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Care Requirements Quick View */}
                    <div className="md:col-span-1">
                      <div className="bg-white bg-opacity-60 rounded-lg p-4 space-y-3">
                        <h4 className="font-semibold text-gray-900 text-sm">Chăm sóc</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Độ khó:</span>
                            <span className="font-medium text-gray-900">
                              {plant.careLevel === 'easy' ? 'Dễ' : plant.careLevel === 'medium' ? 'Trung bình' : 'Khó'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ánh sáng:</span>
                            <span className="font-medium text-gray-900">
                              {plant.lightRequirement === 'low' ? 'Yếu' : plant.lightRequirement === 'medium' ? 'Trung bình' : plant.lightRequirement === 'bright' ? 'Sáng' : 'Trực tiếp'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tưới:</span>
                            <span className="font-medium text-gray-900">
                              {plant.wateringFrequency === 'daily' ? 'Hàng ngày' : plant.wateringFrequency === 'weekly' ? 'Tuần' : plant.wateringFrequency === 'bi-weekly' ? '2 tuần' : 'Tháng'}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-white border-opacity-30">
                          <Link
                            href={`/products/${plant.id}`}
                            className="flex-1 text-center bg-white text-green-600 py-2 rounded text-xs font-semibold hover:bg-green-50 transition"
                          >
                            Chi tiết
                          </Link>
                          <button className="flex-1 bg-green-600 text-white py-2 rounded text-xs font-semibold hover:bg-green-700 transition">
                            Sửa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Care Timeline - Show all care history */}
        {userPlantInstances.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Lịch sử chăm sóc gần đây</h2>
            <MyPlantsClient instances={userPlantInstances} />
          </div>
        )}
      </div>
    </div>
  );
}