export interface TierPackage {
  id: number;
  name: string;
  price: number;
  quotaRequests: number;
  durationMonths: number | null;
  description: string | null;
  isActive: boolean;
  createdAt: string | null;
}

export interface CreateTierPackageRequest {
  name: string;
  price: number;
  quotaRequests: number;
  durationMonths?: number;
  description?: string;
}

export interface UpdateTierPackageRequest {
  name?: string;
  price?: number;
  quotaRequests?: number;
  durationMonths?: number;
  description?: string;
  isActive?: boolean;
}

export interface TierThreshold {
  id: number;
  name: string;
  tierLevel: number;
  minTotalSpent: number;
  benefitDescription: string | null;
  isActive: boolean;
  monthlyFreeQuota: number;
}

export interface CreateTierThresholdRequest {
  name: string;
  tierLevel: number;
  minTotalSpent: number;
  benefitDescription?: string;
  monthlyFreeQuota: number;
}

export interface UpdateTierThresholdRequest {
  name?: string;
  tierLevel?: number;
  minTotalSpent?: number;
  benefitDescription?: string;
  isActive?: boolean;
  monthlyFreeQuota?: number;
}

export interface SubscriptionQuotaItem {
  subscriptionId: number;
  packageName: string;
  totalQuota: number;
  usedQuota: number;
  remainingQuota: number;
  endDate: string | null;
  isMonthlyFree: boolean;
}

export interface UserQuotaStatus {
  tierLevel: number;
  tierName: string | null;
  tierMonthlyFreeQuota: number;
  totalRemainingQuota: number;
  activeSubscriptions: SubscriptionQuotaItem[];
}

export interface UserSubscription {
  id: number;
  packageName: string;
  totalQuota: number;
  usedQuota: number;
  remainingQuota: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  isMonthlyFree: boolean;
  paidAt: string | null;
  createdAt: string | null;
}

export interface CreateTierPackagePaymentRequest {
  tierPackageId: number;
}

export interface CreateTierPackagePaymentResponse {
  paymentId: number;
  paymentUrl: string;
}

export interface TierProgress {
  currentTierLevel: number;
  currentTierName: string;
  currentTierBenefitDescription: string | null;
  currentTierMonthlyFreeQuota: number;
  currentTierMinSpent: number;
  totalSpent: number;
  nextTierLevel: number | null;
  nextTierName: string | null;
  nextTierBenefitDescription: string | null;
  nextTierMonthlyFreeQuota: number | null;
  nextTierMinSpent: number | null;
  amountToNextTier: number | null;
  progressPercent: number;
  isMaxTier: boolean;
}
