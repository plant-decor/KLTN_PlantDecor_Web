'use client';

import { useCallback, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useRouter } from 'next/navigation';
import { Select } from '@mui/material';
import type { CategoryResponse } from '@/lib/api/categoriesService';
import { ExpandMore as ExpandMoreIcon} from '@mui/icons-material';
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
  mobileMode?: boolean;
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
  mobileMode = false,
}: PlantStoreFiltersProps) {
  const router = useRouter();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      const formData = new FormData(e.currentTarget);
      const params = new URLSearchParams();

      // Add all form data to params
      for (const [key, value] of formData.entries()) {
        if (key === 'includePlants' || key === 'includeMaterials' || key === 'includeCombos') {
          // Skip - we'll handle these explicitly
          continue;
        }
        params.append(key, String(value));
      }

      // Handle the three include checkboxes explicitly
      const includePlantsCheckbox = e.currentTarget.querySelector<HTMLInputElement>(
        'input[name="includePlants"]'
      );
      const includeMaterialsCheckbox = e.currentTarget.querySelector<HTMLInputElement>(
        'input[name="includeMaterials"]'
      );
      const includeCombosCheckbox = e.currentTarget.querySelector<HTMLInputElement>(
        'input[name="includeCombos"]'
      );

      if (includePlantsCheckbox?.checked) {
        params.append('includePlants', 'true');
      } else {
        params.append('includePlants', 'false');
      }

      if (includeMaterialsCheckbox?.checked) {
        params.append('includeMaterials', 'true');
      } else {
        params.append('includeMaterials', 'false');
      }

      if (includeCombosCheckbox?.checked) {
        params.append('includeCombos', 'true');
      } else {
        params.append('includeCombos', 'false');
      }

      // Reset page to 1 when filters change
      params.set('page', '1');

      if (mobileMode) {
        setIsMobileDrawerOpen(false);
      }

      router.push(`/plant-store?${params.toString()}`);
    },
    [router, mobileMode]
  );

  // Mobile drawer overlay backdrop
  if (mobileMode && isMobileDrawerOpen) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileDrawerOpen(false)}
          aria-hidden="true"
        />

        {/* Mobile Drawer */}
        <form onSubmit={handleFormSubmit} className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            {/* <h2 className="text-xl font-bold text-gray-900">{texts.title}</h2> */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="text-gray-500 hover:text-gray-900 p-2 -mr-2"
              aria-label="Close filters"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Drawer Content */}
          <div className="p-6 space-y-6">
            <FilterFormContent
              texts={texts}
              requestBody={requestBody}
              categoryOptions={categoryOptions}
              selectedCategories={selectedCategories}
              sizeOptions={sizeOptions}
              selectedSizes={selectedSizes}
              placementTypeOptions={placementTypeOptions}
              careLevelTypeOptions={careLevelTypeOptions}
              seasonOptions={seasonOptions}
              fengShuiElementOptions={fengShuiElementOptions}
              nurseriesPayload={nurseriesPayload}
            />

            {/* Mobile Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {texts.apply}
              </button>
              <Link
                href={`/plant-store?pageSize=${pageSize}&includePlants=true&includeMaterials=true&includeCombos=true`}
                locale={locale}
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex-1 text-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                {texts.reset}
              </Link>
            </div>
          </div>
        </form>
      </>
    );
  }

  // Mobile trigger button
  if (mobileMode) {
    return (
      <button
        onClick={() => setIsMobileDrawerOpen(true)}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <span>{texts.title}</span>
        <ExpandMoreIcon sx={{ fontSize: 20 }} />
      </button>
    );
  }

  // Desktop/Tablet sticky filter
  return (
    <form
      onSubmit={handleFormSubmit}
      className="mobile-filter-form bg-white rounded-lg shadow-md p-6 space-y-6 sticky top-4"
    >
      <FilterFormContent
        texts={texts}
        requestBody={requestBody}
        categoryOptions={categoryOptions}
        selectedCategories={selectedCategories}
        sizeOptions={sizeOptions}
        selectedSizes={selectedSizes}
        placementTypeOptions={placementTypeOptions}
        careLevelTypeOptions={careLevelTypeOptions}
        seasonOptions={seasonOptions}
        fengShuiElementOptions={fengShuiElementOptions}
        nurseriesPayload={nurseriesPayload}

      />

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

interface FilterFormContentProps {
  texts: PlantStoreFilterTexts;
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
}

function FilterFormContent({
  texts,
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
}: FilterFormContentProps) {
  return (
    <>
      <h2 className="text-lg font-bold text-gray-900">{texts.title}</h2>

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
    </>
  );
}
