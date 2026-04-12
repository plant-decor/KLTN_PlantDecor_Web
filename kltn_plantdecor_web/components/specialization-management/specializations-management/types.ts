export interface SpecializationFormValue {
  name: string;
  description: string;
  isActive: boolean;
}

export type SpecializationModalMode = "create" | "edit" | "view";

export const emptySpecializationFormValue = (): SpecializationFormValue => ({
  name: "",
  description: "",
  isActive: true,
});

export const getSpecializationErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
};
