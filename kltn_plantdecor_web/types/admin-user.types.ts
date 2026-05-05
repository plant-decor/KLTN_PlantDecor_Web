export interface AdminUserSearchRequest {
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
  keyword?: string;
  role?: string;
  status?: string;
  isVerified?: boolean;
  nurseryId?: number;
  createdFrom?: string;
  createdTo?: string;
}

export interface AdminUserSearchPayload {
  items: AdminUser[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

/** User row / detail from admin users API */
export interface AdminUser {
  id: number;
  email: string;
  username: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  isVerified: boolean;
  role: string;
  nurseryId?: number;
  nurseryName?: string;
}
