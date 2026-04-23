export type FounderLogCategory =
  | "product"
  | "ux"
  | "emotional"
  | "technical"
  | "family_feedback";

export interface FounderLogEntry {
  id: string;
  profile_id: string;
  date: string;
  insight: string;
  category: FounderLogCategory;
  priority_1_5: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const FOUNDER_LOG_CATEGORIES: {
  value: FounderLogCategory;
  label: string;
  color: string;
}[] = [
  { value: "product", label: "Produkt", color: "text-blue-500" },
  { value: "ux", label: "UX", color: "text-purple-500" },
  { value: "emotional", label: "Emoční", color: "text-pink-500" },
  { value: "technical", label: "Technické", color: "text-green-500" },
  { value: "family_feedback", label: "Rodina feedback", color: "text-amber-500" },
];
