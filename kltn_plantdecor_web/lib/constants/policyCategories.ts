export interface PolicyCategoryDefinition {
  value: number;
  slug: string;
  label: string;
}

export const POLICY_CATEGORIES: readonly PolicyCategoryDefinition[] = [
  { value: 1, slug: "terms-of-use", label: "Terms of Use" },
  { value: 2, slug: "return-refund", label: "Return & Refund" },
  { value: 3, slug: "privacy", label: "Privacy" },
  { value: 4, slug: "payment", label: "Payment" },
  { value: 5, slug: "shipping", label: "Shipping" },
  { value: 99, slug: "complaint", label: "Complaint" },
] as const;

export const getCategoryByValue = (value: number): PolicyCategoryDefinition | undefined => {
  return POLICY_CATEGORIES.find((c) => c.value === value);
};

export const getCategoryBySlug = (slug: string): PolicyCategoryDefinition | undefined => {
  return POLICY_CATEGORIES.find((c) => c.slug === slug);
};

export const getCategoryLabel = (value: number): string => {
  return getCategoryByValue(value)?.label ?? `Category ${value}`;
};
