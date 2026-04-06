import { Link } from '@/i18n/navigation';
import type { PlantStorePageQuery, PlantStoreTab } from '@/lib/utils/plant-store/constants';
import { buildTabHref } from '@/lib/utils/plant-store/url';

interface PlantStoreTabsProps {
  locale: string;
  query: PlantStorePageQuery;
  activeTab: PlantStoreTab;
  plantsLabel: string;
  materialsLabel: string;
}

export default function PlantStoreTabs({
  locale,
  query,
  activeTab,
  plantsLabel,
  materialsLabel,
}: PlantStoreTabsProps) {
  return (
    <div className="mb-6 border-b border-gray-200">
      <div className="flex gap-2">
        <Link
          href={buildTabHref(query, 'plants')}
          locale={locale}
          className={`px-4 py-3 text-sm font-medium rounded-t-lg border ${
            activeTab === 'plants'
              ? 'border-gray-300 border-b-white bg-white text-green-700'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          {plantsLabel}
        </Link>
        <Link
          href={buildTabHref(query, 'materials')}
          locale={locale}
          className={`px-4 py-3 text-sm font-medium rounded-t-lg border ${
            activeTab === 'materials'
              ? 'border-gray-300 border-b-white bg-white text-green-700'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          {materialsLabel}
        </Link>
      </div>
    </div>
  );
}
