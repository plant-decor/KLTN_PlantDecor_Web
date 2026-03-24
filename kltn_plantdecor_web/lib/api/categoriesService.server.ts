import type { CategoryTreeNode } from '@/lib/api/categoriesService';
import { ResponseModel } from '@/types/api.types';
import { get } from './apiService.server';

// Fetch category tree for SSR/server components
export const getCategoryTreeSSR = async (): Promise<ResponseModel<CategoryTreeNode[]>> => {
  // Adjust the URL if your API is not on the same domain or needs a full path
  const res: ResponseModel<CategoryTreeNode[]> = await get('/admin/Categories/tree', false);
    
  if (!res.success) throw new Error('Failed to fetch category tree');
  return res;
};
