export interface FoodItem {
  id: string;
  name: string;
  brand: string | null;
  kcal_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
  source: "manual" | "openfoodfacts" | "custom" | "public";
  owner_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Meal {
  id: string;
  profile_id: string;
  date: string;
  meal_type: MealType;
  consumed_at: string | null;
  notes: string | null;
  visibility: string;
  household_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MealItem {
  id: string;
  meal_id: string;
  food_id: string;
  grams: number;
  kcal_override: number | null;
  protein_override: number | null;
  carbs_override: number | null;
  fat_override: number | null;
  created_at?: string;
}

export interface MealTemplate {
  id: string;
  owner_id: string;
  name: string;
  meal_type: MealType | null;
  items: MealTemplateItem[];
  is_household: boolean;
  household_id: string | null;
  created_at?: string;
}

export interface MealTemplateItem {
  food_id: string;
  food_name: string;
  grams: number;
}

export type MealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "pre_workout"
  | "post_workout";

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Snídaně",
  lunch: "Oběd",
  dinner: "Večeře",
  snack: "Svačina",
  pre_workout: "Pre-workout",
  post_workout: "Post-workout",
};

export const MEAL_TYPE_OPTIONS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Snídaně" },
  { value: "lunch", label: "Oběd" },
  { value: "dinner", label: "Večeře" },
  { value: "snack", label: "Svačina" },
  { value: "pre_workout", label: "Pre-workout" },
  { value: "post_workout", label: "Post-workout" },
];

export interface MacroTotals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealWithItems extends Meal {
  meal_items: (MealItem & { food_items: FoodItem })[];
}
