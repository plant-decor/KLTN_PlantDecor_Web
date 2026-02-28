import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { SAMPLE_PLANTS, SAMPLE_PLANT_INSTANCES, ACTIVE_SAMPLE_USER_ID, STORE_USER_ID } from '@/data/sampledata';
import AddToCartButton from '@/components/cart/AddToCartButton';
import AddToWishlistButton from '@/components/product/AddToWishlistButton';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import PlantInstancesGrid from '@/components/plant/PlantInstancesGrid';
import { getMinPriceFromInstances } from '@/lib/utils/plantInstanceHelper';

interface PageProps {
  params: Promise<{ plantid: string; locale: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { plantid, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'productDetail' });
  const tProducts = await getTranslations({ locale, namespace: 'products' });
  const numberLocale = locale === 'vi' ? 'vi-VN' : 'en-US';

  const formatCurrency = (price: number) => `${price.toLocaleString(numberLocale)}đ`;

  const getCareLevelLabel = (careLevel: string) => {
    if (careLevel === 'easy') return t('careLevelValues.easy');
    if (careLevel === 'medium') return t('careLevelValues.medium');
    return t('careLevelValues.hard');
  };

  const getLightLabel = (lightRequirement: string) => {
    if (lightRequirement === 'low') return t('lightValues.low');
    if (lightRequirement === 'medium') return t('lightValues.medium');
    if (lightRequirement === 'bright') return t('lightValues.bright');
    return t('lightValues.directSun');
  };

  const getWateringLabel = (wateringFrequency: string) => {
    if (wateringFrequency === 'daily') return t('wateringValues.daily');
    if (wateringFrequency === 'weekly') return t('wateringValues.weekly');
    if (wateringFrequency === 'bi-weekly') return t('wateringValues.biWeekly');
    return t('wateringValues.monthly');
  };

  const getSizeLabel = (size: string) => {
    if (size === 'small') return t('sizeValues.small');
    if (size === 'medium') return t('sizeValues.medium');
    return t('sizeValues.large');
  };

  const getInstanceStatusLabel = (status: string) => {
    if (status === 'healthy') return t('instanceStatus.healthy');
    if (status === 'thriving') return t('instanceStatus.thriving');
    if (status === 'needs-attention') return t('instanceStatus.needsAttention');
    return t('instanceStatus.critical');
  };

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
          <Link href="/" className="hover:text-green-600">{t('home')}</Link>
          <span className="mx-2">/</span>
          <Link href="/plant-store" className="hover:text-green-600">{t('store')}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{plant.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-xl shadow-md p-8">
          {/* Image Gallery */}
          <ProductImageGallery
            images={displayImages}
            plantName={plant.name}
            isNewArrival={plant.isNewArrival}
            isSale={!!plant.originalPrice}
            newLabel={tProducts('new')}
            saleLabel={tProducts('sale')}
          />

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
                  {plant.rating} ({t('reviewsWithCount', { count: plant.reviewCount })})
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              {plant.hasInstance && availableInstances.length > 0 && displayPrice < plant.price ? (
                <div>
                  <p className="text-sm text-gray-600 mb-2">{t('priceFrom')}</p>
                  <span className="text-3xl font-bold text-green-600">
                    {formatCurrency(displayPrice)}
                  </span>
                  <span className="ml-3 text-lg text-gray-400">
                    {t('priceTo', { price: formatCurrency(plant.price) })}
                  </span>
                </div>
              ) : plant.originalPrice ? (
                <div>
                  <span className="text-3xl font-bold text-green-600">
                    {formatCurrency(plant.price)}
                  </span>
                  <span className="ml-3 text-xl text-gray-400 line-through">
                    {formatCurrency(plant.originalPrice)}
                  </span>
                  <span className="ml-2 inline-block bg-red-100 text-red-600 px-2 py-1 text-sm rounded">
                    {t('savePercent', {
                      percent: Math.round(
                        ((plant.originalPrice - plant.price) / plant.originalPrice) * 100,
                      ),
                    })}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-green-600">
                  {formatCurrency(plant.price)}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="mb-6">
              {plant.stock > 0 ? (
                <span className="text-green-600 font-medium">
                  ✓ {t('inStock', { count: plant.stock })}
                </span>
              ) : (
                <span className="text-red-600 font-medium">✗ {t('outOfStock')}</span>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('description')}</h3>
              <p className="text-gray-600 leading-relaxed">{plant.description}</p>
            </div>

            {/* Care Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t('careLevel')}</p>
                <p className="font-semibold text-gray-900 capitalize">{getCareLevelLabel(plant.careLevel)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t('light')}</p>
                <p className="font-semibold text-gray-900 capitalize">{getLightLabel(plant.lightRequirement)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t('watering')}</p>
                <p className="font-semibold text-gray-900 capitalize">{getWateringLabel(plant.wateringFrequency)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t('size')}</p>
                <p className="font-semibold text-gray-900 capitalize">{getSizeLabel(plant.size)}</p>
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

            <AddToCartButton plant={plant} />

            <div className="mt-4">
              <AddToWishlistButton plant={plant} fullWidth variant="outlined" />
            </div>
          </div>
        </div>

        {/* Plant Instances Grid - For Instance-based Plants */}
        {plant.hasInstance && availableInstances.length > 0 && (
          <PlantInstancesGrid instances={availableInstances} plantId={plant.id} />
        )}

        {/* Care Instructions Section - For Instance-based Plants */}
        {plant.hasInstance && plant.careInstructions && (
          <div className="mt-12 bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('careInstructions')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plant.careInstructions.watering && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      💧
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{t('watering')}</h3>
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
                    <h3 className="text-lg font-medium text-gray-900">{t('light')}</h3>
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
                    <h3 className="text-lg font-medium text-gray-900">{t('humidity')}</h3>
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
                    <h3 className="text-lg font-medium text-gray-900">{t('temperature')}</h3>
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
                    <h3 className="text-lg font-medium text-gray-900">{t('fertilizing')}</h3>
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
                    <h3 className="text-lg font-medium text-gray-900">{t('pruning')}</h3>
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
                    <h3 className="text-lg font-medium text-gray-900">{t('propagation')}</h3>
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
                    <h3 className="text-lg font-medium text-gray-900">{t('commonPests')}</h3>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('myPlants')}</h2>
            <p className="text-gray-600 mb-6">
              {t('ownedCount', { count: userPlantInstances.length })}
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
                        {getInstanceStatusLabel(instance.status)}
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
                      {t('boughtFrom')}: {new Date(instance.acquiredDate).toLocaleDateString(numberLocale)}
                    </p>
                    {instance.lastWatered && (
                      <p className="text-xs text-gray-500">
                        {t('lastWatered')}: {new Date(instance.lastWatered).toLocaleDateString(numberLocale)}
                      </p>
                    )}
                    <Link
                      href={`/my-plant/1001`}
                      className="mt-3 block text-center bg-green-50 text-green-600 py-2 rounded text-sm font-medium hover:bg-green-100 transition"
                    >
                      {t('viewDetails')}
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
