import type { AIChatMessageRole, AIChatSuggestedPlant } from "@/types/ai-chatbot.types";

export type ChatMessageView = {
  id: number | string;
  role: AIChatMessageRole;
  content: string;
  createdAt?: string | null;
  careTips?: string[] | null;
  followUpQuestions?: string[] | null;
  suggestedPlants?: AIChatSuggestedPlant[] | null;
};

export type AdvancedFilters = {
  roomDescription: string;
  fengShuiElement: string;
  maxBudget: string;
  limit: string;
  preferredRooms: string[];
  petSafe: boolean;
  childSafe: boolean;
  onlyPurchasable: boolean;
};

export const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  roomDescription: "",
  fengShuiElement: "",
  maxBudget: "",
  limit: "",
  preferredRooms: [],
  petSafe: true,
  childSafe: true,
  onlyPurchasable: true,
};

