export const getNurseryDesignTemplateErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const candidate = error as { response?: { data?: { message?: string } }; message?: string };
  return candidate.response?.data?.message || candidate.message || fallback;
};

export type NurseryDesignTemplateListFilter = "all" | "active";

/** Maps to API query `activeOnly`: `all` → false, `active` → true. */
export const NURSERY_DESIGN_TEMPLATE_LIST_FILTER_OPTIONS: { value: NurseryDesignTemplateListFilter; label: string }[] = [
  { value: "all", label: "All mappings" },
  { value: "active", label: "Active only" },
];
