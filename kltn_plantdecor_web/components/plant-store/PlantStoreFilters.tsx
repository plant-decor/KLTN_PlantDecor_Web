import { Link } from '@/i18n/navigation';
import { Select } from '@mui/material';
import type { CategoryResponse } from '@/lib/api/categoriesService';
import type { PlantEnumValue, ShopNurserySearchPayload } from '@/lib/api/shopPlantsService';
import type { ShopUnifiedSearchRequest } from '@/lib/api/shopUnifiedService';

interface PlantStoreFilterTexts {
  title: string;
  search: string;
  searchByNamePlaceholder: string;
  category: string;
  placementType: string;
  careLevelType: string;
  season: string;
  all: string;
  size: string;
  minPrice: string;
  maxPrice: string;
  fengShuiElement: string;
  none: string;
  nursery: string;
  allNurseries: string;
  toxicity: string;
  airPurifying: string;
  hasFlower: string;
  petSafe: string;
  childSafe: string;
  uniqueInstance: string;
  includePlants: string;
  includeMaterials: string;
  includeCombos: string;
  apply: string;
  reset: string;
}

interface PlantStoreFiltersProps {
  locale: string;
  pageSize: number;
  requestBody: ShopUnifiedSearchRequest;
  categoryOptions: CategoryResponse[];
  selectedCategories: Set<number>;
  sizeOptions: PlantEnumValue[];
  selectedSizes: Set<number>;
  placementTypeOptions: PlantEnumValue[];
  careLevelTypeOptions: PlantEnumValue[];
  seasonOptions: PlantEnumValue[];
  fengShuiElementOptions: PlantEnumValue[];
  nurseriesPayload: ShopNurserySearchPayload;
  texts: PlantStoreFilterTexts;
}

export default function PlantStoreFilters({
  locale,
  pageSize,
  requestBody,
  categoryOptions,
  selectedCategories,
  sizeOptions,
  selectedSizes,
  placementTypeOptions,
  careLevelTypeOptions,
  seasonOptions,
  fengShuiElementOptions,
  nurseriesPayload,
  texts,
}: PlantStoreFiltersProps) {
  return (
    <form method="get" className="bg-white rounded-lg shadow-md p-6 sticky top-4 space-y-6">
      <h2 className="text-xl font-bold text-gray-900">{texts.title}</h2>

      <div>
        <label htmlFor="q" className="font-semibold text-gray-900 mb-2 block">
          {texts.search}
        </label>
        <input
          id="q"
          name="q"
          defaultValue={requestBody.keyword || ''}
          placeholder={texts.searchByNamePlaceholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center text-sm text-gray-700">
          <input
            type="checkbox"
            name="includePlants"
            value="true"
            defaultChecked={requestBody.includePlants !== false}
            className="mr-2"
          />
          {texts.includePlants}
        </label>
        <label className="flex items-center text-sm text-gray-700">
          <input
            type="checkbox"
            name="includeMaterials"
            value="true"
            defaultChecked={requestBody.includeMaterials !== false}
            className="mr-2"
          />
          {texts.includeMaterials}
        </label>
        <label className="flex items-center text-sm text-gray-700">
          <input
            type="checkbox"
            name="includeCombos"
            value="true"
            defaultChecked={requestBody.includeCombos !== false}
            className="mr-2"
          />
          {texts.includeCombos}
        </label>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">{texts.category}</h3>
        <div className="max-h-48 overflow-auto space-y-2 pr-1">
          {categoryOptions.map((category) => (
            <label key={category.id} className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                name="categoryIds"
                value={String(category.id)}
                defaultChecked={selectedCategories.has(category.id)}
                className="mr-2"
              />
              {category.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="placementType" className="font-semibold text-gray-900 mb-2 block">
          {texts.placementType}
        </label>
        <select
          id="placementType"
          name="placementType"
          defaultValue={
            requestBody.placementType !== undefined ? String(requestBody.placementType) : ''
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">{texts.all}</option>
          {placementTypeOptions.map((option) => (
            <option key={option.value} value={String(option.value)}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="careLevelType" className="font-semibold text-gray-900 mb-2 block">
          {texts.careLevelType}
        </label>
        <select
          id="careLevelType"
          name="careLevelType"
          defaultValue={
            requestBody.careLevelType !== undefined ? String(requestBody.careLevelType) : ''
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">{texts.all}</option>
          {careLevelTypeOptions.map((option) => (
            <option key={option.value} value={String(option.value)}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="season" className="font-semibold text-gray-900 mb-2 block">
          {texts.season}
        </label>
        <select
          id="season"
          name="season"
          defaultValue={
            requestBody.comboSeason !== undefined ? String(requestBody.comboSeason) : ''
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">{texts.all}</option>
          {seasonOptions.map((option) => (
            <option key={option.value} value={String(option.value)}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">{texts.size}</h3>
        <div className="space-y-2">
          {sizeOptions.map((option) => (
            <label key={option.value} className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                name="sizes"
                value={String(option.value)}
                defaultChecked={selectedSizes.has(option.value)}
                className="mr-2"
              />
              {option.name}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="minBasePrice" className="font-semibold text-gray-900 mb-2 block">
            {texts.minPrice}
          </label>
          <input
            id="minBasePrice"
            name="minPrice"
            type="number"
            defaultValue={requestBody.minPrice ?? ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label htmlFor="maxBasePrice" className="font-semibold text-gray-900 mb-2 block">
            {texts.maxPrice}
          </label>
          <input
            id="maxBasePrice"
            name="maxPrice"
            type="number"
            defaultValue={requestBody.maxPrice ?? ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="fengShuiElement" className="font-semibold text-gray-900 mb-2 block">
          {texts.fengShuiElement}
        </label>
        <Select
          native
          id="fengShuiElement"
          name="fengShuiElement"
          defaultValue={
            requestBody.fengShuiElement !== undefined ? String(requestBody.fengShuiElement) : ''
          }
          className="w-full border border-gray-300 rounded-lg text-sm"
        >
          <option value="">{texts.none}</option>
          {fengShuiElementOptions.map((option) => (
            <option key={option.value} value={String(option.value)}>
              {option.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor="nurseryId" className="font-semibold text-gray-900 mb-2 block">
          {texts.nursery}
        </label>
        <select
          id="nurseryId"
          name="nurseryId"
          defaultValue={requestBody.nurseryId !== undefined ? String(requestBody.nurseryId) : ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">{texts.allNurseries}</option>
          {nurseriesPayload.items
            .filter((nursery) => nursery.isActive)
            .map((nursery) => (
              <option key={nursery.id} value={String(nursery.id)}>
                {nursery.name}
              </option>
            ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center text-sm text-gray-700">
          <input
            type="checkbox"
            name="toxicity"
            value="true"
            defaultChecked={requestBody.toxicity === true}
            className="mr-2"
          />
          {texts.toxicity}
        </label>
        <label className="flex items-center text-sm text-gray-700">
          <input
            type="checkbox"
            name="airPurifying"
            value="true"
            defaultChecked={requestBody.airPurifying === true}
            className="mr-2"
          />
          {texts.airPurifying}
        </label>
        <label className="flex items-center text-sm text-gray-700">
          <input
            type="checkbox"
            name="hasFlower"
            value="true"
            defaultChecked={requestBody.hasFlower === true}
            className="mr-2"
          />
          {texts.hasFlower}
        </label>
        <label className="flex items-center text-sm text-gray-700">
          <input
            type="checkbox"
            name="petSafe"
            value="true"
            defaultChecked={requestBody.petSafe === true}
            className="mr-2"
          />
          {texts.petSafe}
        </label>
        <label className="flex items-center text-sm text-gray-700">
          <input
            type="checkbox"
            name="childSafe"
            value="true"
            defaultChecked={requestBody.childSafe === true}
            className="mr-2"
          />
          {texts.childSafe}
        </label>
        <label className="flex items-center text-sm text-gray-700">
          <input
            type="checkbox"
            name="isUniqueInstance"
            value="true"
            defaultChecked={requestBody.isUniqueInstance === true}
            className="mr-2"
          />
          {texts.uniqueInstance}
        </label>
      </div>

      <input type="hidden" name="page" value="1" />
      <input type="hidden" name="pageSize" value={String(pageSize)} />
      <input type="hidden" name="sortBy" value="CreatedAt" />
      <input type="hidden" name="sortDirection" value="Desc" />

      <div className="flex gap-1">
        <button
          type="submit"
          className="flex-1 bg-green-600 text-white! px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          {texts.apply}
        </button>
        <Link
          href={`/plant-store?pageSize=${pageSize}&includePlants=true&includeMaterials=true&includeCombos=true`}
          locale={locale}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-semibold flex items-center"
        >
          {texts.reset}
        </Link>
      </div>
    </form>
  );
}
