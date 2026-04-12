export interface AdminSpecializationListItem {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface AdminSpecializationDetail extends AdminSpecializationListItem {
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminSpecializationCreateRequest {
  name: string;
  description: string;
}

export interface AdminSpecializationUpdateRequest {
  name: string;
  description: string;
  isActive: boolean;
}
