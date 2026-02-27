import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { SAMPLE_PLANTS, SAMPLE_PLANT_INSTANCES, ACTIVE_SAMPLE_USER_ID, STORE_USER_ID } from '@/data/sampledata';
import AddToCartButton from '@/components/Cart/AddToCartButton';
import ProductDetailClient from '@/components/product/ProductDetailClient';
import PlantInstancesGrid from '@/components/plant/PlantInstancesGrid';
import { getMinPriceFromInstances } from '@/lib/utils/plantInstanceHelper';

interface PageProps {
  params: Promise<{ plantid: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { plantid } = await params;
  const plant = SAMPLE_PLANTS.find((p) => p.id === parseInt(plantid));

  if (!plant) {
    notFound();
  }

  const displayImages = plant.images || [plant.imageUrl];
  
  // Get available plant instances for sale (store inventory)
  const availableInstances = plant.hasInstance
    ? SAMPLE_PLANT_INSTANCES.filter(instance =>
        instance.plantId === plant.id && instance.userId === STORE_USER_ID
      )
    : [];
  
  // Get user's plant instances (owned)
  const userPlantInstances = plant.hasInstance 
    ? SAMPLE_PLANT_INSTANCES.filter(instance => 
        instance.plantId === plant.id && instance.userId === ACTIVE_SAMPLE_USER_ID
      )
    : [];

  // Calculate minimum price from available instances
  const displayPrice = plant.hasInstance && availableInstances.length > 0
    ? getMinPriceFromInstances(availableInstances, plant.price)
    : plant.price;

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-green-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link href="/plant-store" className="hover:text-green-600">Cửa hàng</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{plant.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-xl shadow-md p-8">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
              <Image
                src={displayImages[0]}
                alt={plant.name}
                fill
                className="object-cover"
              />
              {plant.isNewArrival && (
                <span className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 text-sm rounded">
                  Mới
                </span>
              )}
              {plant.originalPrice && (
                <span className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 text-sm rounded">
                  Giảm giá
                </span>
              )}
            </div>
            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {displayImages.slice(0, 4).map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-green-600 cursor-pointer">
                    <Image
                      src={img}
                      alt={`${plant.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{plant.name}</h1>
            <p className="text-xl text-gray-600 italic mb-6">{plant.scientificName}</p>

            {/* Rating */}
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(plant.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-gray-600">
                  {plant.rating} ({plant.reviewCount} đánh giá)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              {plant.hasInstance && availableInstances.length > 0 && displayPrice < plant.price ? (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Giá từ:</p>
                  <span className="text-3xl font-bold text-green-600">
                    {displayPrice.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="ml-3 text-lg text-gray-400">
                    đến {plant.price.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              ) : plant.originalPrice ? (
                <div>
                  <span className="text-3xl font-bold text-green-600">
                    {plant.price.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="ml-3 text-xl text-gray-400 line-through">
                    {plant.originalPrice.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="ml-2 inline-block bg-red-100 text-red-600 px-2 py-1 text-sm rounded">
                    Tiết kiệm {Math.round(((plant.originalPrice - plant.price) / plant.originalPrice) * 100)}%
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-green-600">
                  {plant.price.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="mb-6">
              {plant.stock > 0 ? (
                <span className="text-green-600 font-medium">
                  ✓ Còn hàng ({plant.stock} sản phẩm)
                </span>
              ) : (
                <span className="text-red-600 font-medium">✗ Hết hàng</span>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả</h3>
              <p className="text-gray-600 leading-relaxed">{plant.description}</p>
            </div>

            {/* Care Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Độ khó chăm sóc</p>
                <p className="font-semibold text-gray-900 capitalize">{plant.careLevel === 'easy' ? 'Dễ' : plant.careLevel === 'medium' ? 'Trung bình' : 'Khó'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Ánh sáng</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {plant.lightRequirement === 'low' ? 'Yếu' : plant.lightRequirement === 'medium' ? 'Trung bình' : plant.lightRequirement === 'bright' ? 'Sáng' : 'Trực tiếp'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Tưới nước</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {plant.wateringFrequency === 'daily' ? 'Hàng ngày' : plant.wateringFrequency === 'weekly' ? 'Hàng tuần' : plant.wateringFrequency === 'bi-weekly' ? '2 tuần/lần' : 'Hàng tháng'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Kích thước</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {plant.size === 'small' ? 'Nhỏ' : plant.size === 'medium' ? 'Trung' : 'Lớn'}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {plant.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Add to Cart - For Quantity-based Plants */}
            {!plant.hasInstance && <AddToCartButton plant={plant} />}
            
            {/* Add to My Plants - For Instance-based Plants */}
            {plant.hasInstance && (
              <ProductDetailClient plant={plant} />
            )}
          </div>
        </div>

        {/* Plant Instances Grid - For Instance-based Plants */}
        {plant.hasInstance && availableInstances.length > 0 && (
          <PlantInstancesGrid instances={availableInstances} plantId={plant.id} />
        )}

        {/* Care Instructions Section - For Instance-based Plants */}
        {plant.hasInstance && plant.careInstructions && (
          <div className="mt-12 bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Hướng dẫn chăm sóc</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plant.careInstructions.watering && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      💧
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Tưới nước</h3>
                    <p className="mt-2 text-gray-600">{plant.careInstructions.watering}</p>
                  </div>
                </div>
              )}
              
              {plant.careInstructions.sunlight && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white">
                      ☀️
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Ánh sáng</h3>
                    <p className="mt-2 text-gray-600">{plant.careInstructions.sunlight}</p>
                  </div>
                </div>
              )}
              
              {plant.careInstructions.humidity && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-cyan-500 text-white">
                      💦
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Độ ẩm</h3>
                    <p className="mt-2 text-gray-600">{plant.careInstructions.humidity}</p>
                  </div>
                </div>
              )}
              
              {plant.careInstructions.temperature && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                      🌡️
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Nhiệt độ</h3>
                    <p className="mt-2 text-gray-600">{plant.careInstructions.temperature}</p>
                  </div>
                </div>
              )}
              
              {plant.careInstructions.fertilizing && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                      🌱
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Phân bón</h3>
                    <p className="mt-2 text-gray-600">{plant.careInstructions.fertilizing}</p>
                  </div>
                </div>
              )}
              
              {plant.careInstructions.pruning && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                      ✂️
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Cắt tỉa</h3>
                    <p className="mt-2 text-gray-600">{plant.careInstructions.pruning}</p>
                  </div>
                </div>
              )}
              
              {plant.careInstructions.propagation && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                      🌿
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Nhân giống</h3>
                    <p className="mt-2 text-gray-600">{plant.careInstructions.propagation}</p>
                  </div>
                </div>
              )}
              
              {plant.careInstructions.commonPests && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                      🐛
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Sâu bệnh thường gặp</h3>
                    <p className="mt-2 text-gray-600">{plant.careInstructions.commonPests}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Plants Section - For Instance-based Plants */}
        {plant.hasInstance && userPlantInstances.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Cây của tôi</h2>
            <p className="text-gray-600 mb-6">
              Bạn đang sở hữu <strong>{userPlantInstances.length}</strong> cây loại này
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {userPlantInstances.map((instance) => (
                <div key={instance.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {instance.imageUrl && (
                    <div className="relative aspect-square">
                      <Image
                        src={instance.imageUrl}
                        alt={instance.customName || plant.name}
                        fill
                        className="object-cover"
                      />
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold text-white ${
                        instance.status === 'healthy' ? 'bg-green-500' :
                        instance.status === 'thriving' ? 'bg-green-600' :
                        instance.status === 'needs-attention' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {instance.status === 'healthy' ? '✓ Khỏe' :
                         instance.status === 'thriving' ? '✨ Phát triển tốt' :
                         instance.status === 'needs-attention' ? '⚠️ Cần chăm sóc' : '🔴 Tình trạng nghiêm trọng'}
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {instance.customName || plant.name}
                    </h3>
                    {instance.location && (
                      <p className="text-sm text-gray-600 mt-1">📍 {instance.location}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Mua từ: {new Date(instance.acquiredDate).toLocaleDateString('vi-VN')}
                    </p>
                    {instance.lastWatered && (
                      <p className="text-xs text-gray-500">
                        Tưới lần cuối: {new Date(instance.lastWatered).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                    <Link
                      href={`/my-plant/1001`}
                      className="mt-3 block text-center bg-green-50 text-green-600 py-2 rounded text-sm font-medium hover:bg-green-100 transition"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
