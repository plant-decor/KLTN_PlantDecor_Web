'use client';

import { PlantInstance } from '@/data/sampledata';

interface MyPlantsClientProps {
  instances: PlantInstance[];
}

export default function MyPlantsClient({ instances }: MyPlantsClientProps) {
  // Collect all care history from all instances, sorted by date
  const allCareHistory = instances
    .flatMap(instance =>
      (instance.careHistory || []).map(history => ({
        ...history,
        instanceId: instance.id,
        instanceName: instance.customName,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20); // Show last 20 records

  const getCareIcon = (type: string) => {
    switch (type) {
      case 'watered':
        return '💧';
      case 'fertilized':
        return '🌱';
      case 'pruned':
        return '✂️';
      case 'repotted':
        return '🪴';
      case 'treated':
        return '🔬';
      default:
        return '📝';
    }
  };

  const getCareLabel = (type: string) => {
    switch (type) {
      case 'watered':
        return 'Tưới nước';
      case 'fertilized':
        return 'Phân bón';
      case 'pruned':
        return 'Cắt tỉa';
      case 'repotted':
        return 'Đổi chậu';
      case 'treated':
        return 'Xử lý sâu bệnh';
      default:
        return 'Ghi chú';
    }
  };

  if (allCareHistory.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Chưa có lịch sử chăm sóc nào. Hãy bắt đầu ghi lại những công việc chăm sóc cây của bạn!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allCareHistory.map((history, idx) => (
        <div key={idx} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0">
          <div className="text-2xl flex-shrink-0">
            {getCareIcon(history.type)}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-semibold text-gray-900">
                {getCareLabel(history.type)} - {history.instanceName}
              </h4>
              <span className="text-xs text-gray-500">
                {new Date(history.date).toLocaleDateString('vi-VN')}
              </span>
            </div>
            {history.notes && (
              <p className="text-sm text-gray-600">{history.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
