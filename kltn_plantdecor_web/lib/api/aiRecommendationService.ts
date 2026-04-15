import { get, post } from '@/lib/api/apiService';
import type { ResponseModel } from '@/types/api.types';
import type {
  AllergyPlantOption,
  AnalyzeRoomUploadPayload,
  AnalyzeRoomUploadRequest,
  GenerateLayoutImagesPayload,
  GeneratedImageItem,
} from '@/types/ai-recommendation.types';

const unwrapResponse = <T,>(response: ResponseModel<T> | null | undefined): T | null => {
  if (!response) {
    return null;
  }

  return response.payload ?? response.data ?? null;
};

export const getAllergyPlants = async (
  params: { keyword?: string; take?: number } = {},
  isServer = false,
  loading = false
): Promise<AllergyPlantOption[]> => {
  const response = await get<ResponseModel<AllergyPlantOption[]>>(
    '/RoomDesign/allergy-plants',
    {
      keyword: params.keyword ?? '',
      take: params.take ?? 50,
    },
    isServer,
    loading
  );

  return unwrapResponse(response) ?? [];
};

const appendIfDefined = (formData: FormData, key: string, value: string | number | boolean | null | undefined) => {
  if (value === undefined || value === null) {
    return;
  }

  formData.append(key, String(value));
};

export const analyzeRoomUpload = async (
  request: AnalyzeRoomUploadRequest,
  isServer = false,
  loading = true
): Promise<AnalyzeRoomUploadPayload | null> => {
  const formData = new FormData();
  formData.append('Image', request.image);
  appendIfDefined(formData, 'FengShuiElement', request.fengShuiElement);
  appendIfDefined(formData, 'RoomType', request.roomType);
  appendIfDefined(formData, 'RoomStyle', request.roomStyle);
  appendIfDefined(formData, 'MinBudget', request.minBudget);
  appendIfDefined(formData, 'MaxBudget', request.maxBudget);
  appendIfDefined(formData, 'CareLevelType', request.careLevelType);
  appendIfDefined(formData, 'HasAllergy', request.hasAllergy);
  appendIfDefined(formData, 'AllergyNote', request.allergyNote);
  appendIfDefined(formData, 'PetSafe', request.petSafe);
  appendIfDefined(formData, 'ChildSafe', request.childSafe);

  request.allergicPlantIds?.forEach((id) => {
    formData.append('AllergicPlantIds', String(id));
  });

  request.preferredNurseryIds?.forEach((id) => {
    formData.append('PreferredNurseryIds', String(id));
  });

  const response = await post<ResponseModel<AnalyzeRoomUploadPayload>>(
    '/RoomDesign/analyze-upload',
    formData,
    isServer,
    loading,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return unwrapResponse(response);
};

export const generateLayoutImages = async (
  layoutDesignId: number,
  isServer = false,
  loading = true
): Promise<GenerateLayoutImagesPayload | null> => {
  const response = await post<ResponseModel<GenerateLayoutImagesPayload>>(
    `/RoomDesign/${layoutDesignId}/generate-images`,
    undefined,
    isServer,
    loading
  );

  return unwrapResponse(response);
};

export const getGeneratedImages = async (
  layoutDesignId: number,
  isServer = false,
  loading = false
): Promise<GeneratedImageItem[]> => {
  const response = await get<ResponseModel<GeneratedImageItem[]>>(
    `/RoomDesign/${layoutDesignId}/generated-images`,
    undefined,
    isServer,
    loading
  );

  return unwrapResponse(response) ?? [];
};
