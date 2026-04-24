import type { FoodItem, MealItem, MacroTotals, MealWithItems } from "@/types/nutrition";

/**
 * Calculate macro totals for a list of meal items with their food data.
 * Respects per-item overrides if set.
 */
export function calculateMealMacros(
  items: MealItem[],
  foods: FoodItem[]
): MacroTotals {
  const foodMap = new Map(foods.map((f) => [f.id, f]));

  return items.reduce(
    (acc, item) => {
      const food = foodMap.get(item.food_id);
      if (!food) return acc;

      const ratio = item.grams / 100;

      const kcal =
        item.kcal_override ?? Math.round(food.kcal_per_100g * ratio);
      const protein =
        item.protein_override ??
        Math.round(food.protein_g * ratio * 10) / 10;
      const carbs =
        item.carbs_override ??
        Math.round(food.carbs_g * ratio * 10) / 10;
      const fat =
        item.fat_override ?? Math.round(food.fat_g * ratio * 10) / 10;

      return {
        kcal: acc.kcal + kcal,
        protein: acc.protein + protein,
        carbs: acc.carbs + carbs,
        fat: acc.fat + fat,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 } as MacroTotals
  );
}

/**
 * Calculate daily totals from an array of meals with nested meal_items + food_items.
 */
export function calculateDailyTotals(
  meals: MealWithItems[]
): MacroTotals {
  return meals.reduce(
    (acc, meal) => {
      const mealTotals = calculateMealMacros(
        meal.meal_items,
        meal.meal_items.map((mi) => mi.food_items)
      );
      return {
        kcal: acc.kcal + mealTotals.kcal,
        protein: acc.protein + mealTotals.protein,
        carbs: acc.carbs + mealTotals.carbs,
        fat: acc.fat + mealTotals.fat,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 } as MacroTotals
  );
}

/**
 * Compare actual totals against user targets.
 * Target kcal is derived from macros: protein*4 + carbs*4 + fat*9
 */
export function compareToTarget(
  totals: MacroTotals,
  targets: {
    protein_g: number | null;
    carbs_g: number | null;
    fat_g: number | null;
  }
): {
  delta_p: number;
  delta_c: number;
  delta_f: number;
  totalKcal: number;
  targetKcal: number;
  status: "on_track" | "under" | "over";
} {
  const targetP = targets.protein_g ?? 0;
  const targetC = targets.carbs_g ?? 0;
  const targetF = targets.fat_g ?? 0;

  const targetKcal = targetP * 4 + targetC * 4 + targetF * 9;
  const totalKcal = totals.kcal;

  const delta_p = totals.protein - targetP;
  const delta_c = totals.carbs - targetC;
  const delta_f = totals.fat - targetF;

  // Determine status based on kcal
  let status: "on_track" | "under" | "over";
  if (targetKcal === 0) {
    status = "on_track";
  } else {
    const ratio = totalKcal / targetKcal;
    if (ratio > 1.1) {
      status = "over";
    } else if (ratio < 0.8) {
      status = "under";
    } else {
      status = "on_track";
    }
  }

  return { delta_p, delta_c, delta_f, totalKcal, targetKcal, status };
}
