import { get, post } from '@/lib/api/apiService';
import type { ResponseModel } from '@/types/api.types';
import type {
  AllergyPlantOption,
  AnalyzeRoomUploadPayload,
  AnalyzeRoomRequest,
  GenerateLayoutImagesPayload,
  GeneratedImageItem,
  RoomViewAngle,
  UploadRoomImagesPayload,
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

const isNonEmptyFile = (file: unknown): file is File => {
  return typeof File !== 'undefined' && file instanceof File;
};

export const uploadRoomImages = async (
  request: { imagesByViewAngle: Partial<Record<RoomViewAngle, File>> },
  isServer = false,
  loading = false
): Promise<UploadRoomImagesPayload | null> => {
  const formData = new FormData();

  Object.entries(request.imagesByViewAngle).forEach(([viewAngle, file]) => {
    if (!file || !isNonEmptyFile(file)) {
      return;
    }
    // Backend expects repeated keys: Images[] + ViewAngles[]
    formData.append('Images', file);
    formData.append('ViewAngles', viewAngle);
  });

  const response = await post<ResponseModel<UploadRoomImagesPayload>>(
    '/RoomImages/upload',
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

export const analyzeRoom = async (
  request: AnalyzeRoomRequest,
  isServer = false,
  loading = false
): Promise<AnalyzeRoomUploadPayload | null> => {
  const response = await post<ResponseModel<AnalyzeRoomUploadPayload>>(
    '/RoomDesign/analyze',
    request,
    isServer,
    loading
  );

  return unwrapResponse(response);
};

export const generateLayoutImages = async (
  layoutDesignId: number,
  isServer = false,
  loading = false
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

export const getMyDesignGeneratedImages = async (
  isServer = false,
  loading = false
): Promise<GeneratedImageItem[]> => {
  const response = await get<ResponseModel<GeneratedImageItem[]>>(
    '/RoomDesign/generated-images',
    undefined,
    isServer,
    loading
  );

  return unwrapResponse(response) ?? [];
};
