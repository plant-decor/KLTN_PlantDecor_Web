import { SAMPLE_PLANTS } from '@/data/sampledata';
import ProductCard from '@/components/ProductCard';

export default function PlantStorePage() {
  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cửa hàng cây cảnh</h1>
          <p className="text-xl text-gray-600">
            Khám phá bộ sưu tập cây cảnh đa dạng của chúng tôi
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {SAMPLE_PLANTS.map((plant) => (
            <ProductCard key={plant.id} plant={plant} />
          ))}
        </div>
      </div>
    </div>
  );
}
