import type { ResponseModel } from '@/types/api.types';

export interface OptionItem {
  id: number;
  name: string;
}

export interface CategoryTreeNodeLike {
  id?: number | string;
  name?: string;
  subCategories?: CategoryTreeNodeLike[];
  children?: CategoryTreeNodeLike[];
}

export interface ManagerImportFormValue {
  materialId: number;
  quantity: number;
  expiredDate: string;
}

export interface ManagerEditFormValue {
  quantity: number;
  expiredDate: string;
  isActive: boolean;
}

export interface ManagerPaginationState {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

export const DEFAULT_MANAGER_IMPORT_FORM: ManagerImportFormValue = {
  materialId: 0,
  quantity: 1,
  expiredDate: '',
};

export const DEFAULT_MANAGER_EDIT_FORM: ManagerEditFormValue = {
  quantity: 0,
  expiredDate: '',
  isActive: true,
};

export const DEFAULT_MANAGER_PAGINATION: ManagerPaginationState = {
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
};

export const flattenCategoryTree = (nodes: CategoryTreeNodeLike[]): OptionItem[] => {
  const results: OptionItem[] = [];

  const visit = (items: CategoryTreeNodeLike[]) => {
    items.forEach((node) => {
      if (!node || typeof node !== 'object') {
        return;
      }

      const id = Number(node.id);
      if (Number.isFinite(id)) {
        results.push({ id, name: String(node.name ?? id) });
      }

      const children = Array.isArray(node.subCategories)
        ? node.subCategories
        : Array.isArray(node.children)
          ? node.children
          : [];

      if (children.length > 0) {
        visit(children);
      }
    });
  };

  visit(nodes);

  const deduped = new Map<number, OptionItem>();
  results.forEach((item) => deduped.set(item.id, item));

  return Array.from(deduped.values());
};

export const getPayload = <T,>(response: ResponseModel<T>): T | undefined => {
  return response.payload ?? response.data;
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const candidate = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return candidate.response?.data?.message || candidate.message || fallback;
};
