import * as apiServer from '@/lib/api/apiService.server';
import type { MyPlantItem, PlantGuideDetail } from '@/types/my-plant.types';

type ApiResponse<T> = {
  success?: boolean;
  statusCode?: number;
  message?: string;
  payload?: T;
  data?: T;
};

const getResponsePayload = <T,>(response: ApiResponse<T>): T | undefined => {
  return response.payload ?? response.data;
};

const isNotFoundError = (error: unknown): boolean => {
  return error instanceof Error && /status 404/i.test(error.message);
};

export const getMyPlants = async (): Promise<MyPlantItem[]> => {
  const response = await apiServer.get<ApiResponse<MyPlantItem[]>>('/user-plants/my');
  return getResponsePayload(response) ?? [];
};

export const getPlantGuideByPlantId = async (plantId: number): Promise<PlantGuideDetail | null> => {
  try {
    const response = await apiServer.get<ApiResponse<PlantGuideDetail>>(`/plants/${plantId}/guide`);
    return getResponsePayload(response) ?? null;
  } catch (error) {
    if (isNotFoundError(error)) {
      return null;
    }

    throw error;
  }
};
