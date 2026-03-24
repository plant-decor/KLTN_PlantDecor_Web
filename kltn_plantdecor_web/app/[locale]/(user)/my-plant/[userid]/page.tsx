import Image from 'next/image';
import Link from 'next/link';
import { SAMPLE_PLANT_INSTANCES } from '@/data/sampledata';
import MyPlantsClient from '@/components/plant/MyPlantsClient';

interface PageProps {
  params: Promise<{ userid: string }>;
}

export default async function MyPlantPage({ params }: PageProps) {
  const { userid } = await params;
  const userPlantInstances = SAMPLE_PLANT_INSTANCES.filter(
    instance => instance.userId === parseInt(userid)
  );

  // TODO: Implement plant data fetching from API
  // Currently SAMPLE_PLANTS is not available in sampledata.ts
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

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            ⚠️ Trang này đang được phát triển. Plant data API chưa sẵn sàng.
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
        ) : null}

        {/* Care Timeline */}
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