"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { awardXP } from "@/lib/logic/xp";
import { DEV_MODE, MOCK_USER_ID } from "@/lib/dev/mock-user";
import { calculateDailyTotals } from "@/lib/logic/macros";
import type {
  FoodItem,
  MealWithItems,
  MacroTotals,
  MealType,
} from "@/types/nutrition";

const MEAL_LOGGED_XP = 10;

async function resolveUserId(): Promise<string> {
  if (DEV_MODE) return MOCK_USER_ID;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Neprihlaseny");
  return user.id;
}

export async function getDailyMeals(
  userId: string,
  date: string
): Promise<MealWithItems[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meals")
    .select("*, meal_items(*, food_items(*))")
    .eq("profile_id", userId)
    .eq("date", date)
    .order("consumed_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as MealWithItems[];
}

export async function getDailyMacros(
  userId: string,
  date: string
): Promise<{ meals: MealWithItems[]; totals: MacroTotals }> {
  const meals = await getDailyMeals(userId, date);
  const totals = calculateDailyTotals(meals);
  return { meals, totals };
}

export async function searchFoods(
  query: string,
  userId: string
): Promise<FoodItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("food_items")
    .select("*")
    .or(`owner_id.eq.${userId},source.eq.public`)
    .ilike("name", `%${query}%`)
    .order("name")
    .limit(20);
  if (error) throw new Error(error.message);
  return (data ?? []) as FoodItem[];
}

export async function createMeal(formData: FormData) {
  const supabase = await createClient();
  const userId = await resolveUserId();
  const date =
    (formData.get("date") as string) ||
    new Date().toISOString().split("T")[0];
  const mealType =
    (formData.get("meal_type") as MealType) || "snack";
  const notes =
    (formData.get("notes") as string) || null;
  const consumedAt =
    (formData.get("consumed_at") as string) ||
    new Date().toISOString();

  const { data: meal, error } = await supabase
    .from("meals")
    .insert({
      profile_id: userId,
      date,
      meal_type: mealType,
      consumed_at: consumedAt,
      notes,
      visibility: "private",
    })
    .select()
    .single();

  if (error) return { error: error.message };

  try {
    const { data: existing } = await supabase
      .from("meals")
      .select("id")
      .eq("profile_id", userId)
      .eq("date", date);
    if (existing && existing.length <= 1) {
      await awardXP(
        supabase,
        userId,
        MEAL_LOGGED_XP,
        "První jídlo dne",
        "meal",
        meal.id
      );
    }
  } catch {
    // non-critical
  }

  revalidatePath("/nutrition");
  return { meal };
}

export async function addMealItem(
  mealId: string,
  foodId: string,
  grams: number
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meal_items")
    .insert({
      meal_id: mealId,
      food_id: foodId,
      grams,
    })
    .select("*, food_items(*)")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/nutrition");
  return { item: data };
}

export async function removeMealItem(itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("meal_items")
    .delete()
    .eq("id", itemId);
  if (error) return { error: error.message };
  revalidatePath("/nutrition");
  return { success: true };
}

export async function updateMealItemGrams(
  itemId: string,
  grams: number
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("meal_items")
    .update({ grams })
    .eq("id", itemId);
  if (error) return { error: error.message };
  revalidatePath("/nutrition");
  return { success: true };
}

export async function createFoodItem(formData: FormData) {
  const supabase = await createClient();
  const userId = await resolveUserId();
  const name = formData.get("name") as string;
  const brand =
    (formData.get("brand") as string) || null;
  const kcal =
    Number(formData.get("kcal_per_100g")) || 0;
  const protein =
    Number(formData.get("protein_g")) || 0;
  const carbs =
    Number(formData.get("carbs_g")) || 0;
  const fat = Number(formData.get("fat_g")) || 0;
  const fiber = formData.get("fiber_g")
    ? Number(formData.get("fiber_g"))
    : null;

  const { data, error } = await supabase
    .from("food_items")
    .insert({
      name,
      brand,
      kcal_per_100g: kcal,
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
      fiber_g: fiber,
      source: "custom" as const,
      owner_id: userId,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/nutrition/catalog");
  return { food: data };
}

export async function getWeeklyMacros(
  userId: string
): Promise<{ date: string; totals: MacroTotals }[]> {
  const result: {
    date: string;
    totals: MacroTotals;
  }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const meals = await getDailyMeals(
      userId,
      dateStr
    );
    const totals = calculateDailyTotals(meals);
    result.push({ date: dateStr, totals });
  }
  return result;
}

export async function getUserTargets(
  userId: string
) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_settings")
    .select("protein_g, carbs_g, fat_g")
    .eq("profile_id", userId)
    .single();
  return {
    protein_g: data?.protein_g ?? 180,
    carbs_g: data?.carbs_g ?? 250,
    fat_g: data?.fat_g ?? 70,
  };
}

// Search OpenFoodFacts + local DB
export async function searchFoodsHybrid(
  query: string,
  userId: string
): Promise<{ local: FoodItem[]; off: FoodItem[] }> {
  const { searchOFF, offToFoodItem } = await import("@/lib/nutrition/openfoodfacts");

  // Search local DB
  const local = await searchFoods(query, userId);

  // Search OpenFoodFacts
  const offResult = await searchOFF(query);
  const off = offResult.products.map((p) => ({
    id: `off_${p.code}`,
    ...offToFoodItem(p),
    owner_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })) as FoodItem[];

  return { local, off };
}

// Save OFF product to local DB for future use
export async function saveOFFFood(product: {
  name: string;
  brand: string | null;
  kcal_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
  off_code: string;
}) {
  const supabase = await createClient();
  const userId = await resolveUserId();

  const { data, error } = await supabase
    .from("food_items")
    .insert({
      name: product.name,
      brand: product.brand,
      kcal_per_100g: product.kcal_per_100g,
      protein_g: product.protein_g,
      carbs_g: product.carbs_g,
      fat_g: product.fat_g,
      fiber_g: product.fiber_g,
      source: "openfoodfacts",
      owner_id: userId,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { food: data };
}

export async function deleteMeal(mealId: string) {
  const supabase = await createClient();
  const userId = await resolveUserId();
  // Delete meal (cascades meal_items)
  const { error } = await supabase
    .from("meals")
    .delete()
    .eq("id", mealId)
    .eq("profile_id", userId);
  if (error) return { error: error.message };
  revalidatePath("/nutrition");
  return { success: true };
}

// ── Meal Templates ──────────────────────────────────────────

export async function getMealTemplates(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meal_templates")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as import("@/types/nutrition").MealTemplate[];
}

export async function saveMealAsTemplate(mealId: string, name: string) {
  const supabase = await createClient();
  const userId = await resolveUserId();

  // Fetch meal + items
  const { data: meal, error: mealError } = await supabase
    .from("meals")
    .select("*, meal_items(*, food_items(*))")
    .eq("id", mealId)
    .eq("profile_id", userId)
    .single();

  if (mealError || !meal) return { error: mealError?.message ?? "Jídlo nenalezeno" };

  const items = (meal.meal_items ?? []).map(
    (mi: { food_id: string; grams: number; food_items: { name: string } }) => ({
      food_id: mi.food_id,
      food_name: mi.food_items.name,
      grams: mi.grams,
    })
  );

  const { data, error } = await supabase
    .from("meal_templates")
    .insert({
      owner_id: userId,
      name,
      meal_type: meal.meal_type,
      items,
      is_household: false,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/nutrition");
  return { template: data };
}

export async function createMealFromTemplate(templateId: string, date: string) {
  const supabase = await createClient();
  const userId = await resolveUserId();

  // Fetch template
  const { data: template, error: tplError } = await supabase
    .from("meal_templates")
    .select("*")
    .eq("id", templateId)
    .eq("owner_id", userId)
    .single();

  if (tplError || !template) return { error: tplError?.message ?? "Šablona nenalezena" };

  // Create meal
  const { data: meal, error: mealError } = await supabase
    .from("meals")
    .insert({
      profile_id: userId,
      date,
      meal_type: template.meal_type ?? "snack",
      consumed_at: new Date().toISOString(),
      notes: `Ze šablony: ${template.name}`,
      visibility: "private",
    })
    .select()
    .single();

  if (mealError || !meal) return { error: mealError?.message ?? "Nepodařilo se vytvořit jídlo" };

  // Insert items from template
  const items = (template.items as { food_id: string; grams: number }[]) ?? [];
  if (items.length > 0) {
    const { error: itemsError } = await supabase.from("meal_items").insert(
      items.map((i) => ({
        meal_id: meal.id,
        food_id: i.food_id,
        grams: i.grams,
      }))
    );
    if (itemsError) return { error: itemsError.message };
  }

  revalidatePath("/nutrition");
  return { success: true, meal };
}

// ── Feature 4: Template macro preview computation ─────────────────
export async function getTemplateMacros(
  templates: import("@/types/nutrition").MealTemplate[]
): Promise<Record<string, { kcal: number; protein: number }>> {
  if (templates.length === 0) return {};

  const supabase = await createClient();

  // Collect all unique food IDs from all templates
  const allFoodIds = new Set<string>();
  for (const tpl of templates) {
    for (const item of tpl.items) {
      allFoodIds.add(item.food_id);
    }
  }

  if (allFoodIds.size === 0) return {};

  // Fetch all foods in one query
  const { data: foods } = await supabase
    .from("food_items")
    .select("id, kcal_per_100g, protein_g")
    .in("id", Array.from(allFoodIds));

  const foodMap = new Map(
    (foods ?? []).map((f) => [f.id, f])
  );

  // Calculate per template
  const result: Record<string, { kcal: number; protein: number }> = {};
  for (const tpl of templates) {
    let totalKcal = 0;
    let totalProtein = 0;
    for (const item of tpl.items) {
      const food = foodMap.get(item.food_id);
      if (food) {
        const ratio = item.grams / 100;
        totalKcal += Math.round((food.kcal_per_100g ?? 0) * ratio);
        totalProtein += Math.round((food.protein_g ?? 0) * ratio);
      }
    }
    result[tpl.id] = { kcal: totalKcal, protein: totalProtein };
  }

  return result;
}

export async function deleteTemplate(templateId: string) {
  const supabase = await createClient();
  const userId = await resolveUserId();
  const { error } = await supabase
    .from("meal_templates")
    .delete()
    .eq("id", templateId)
    .eq("owner_id", userId);
  if (error) return { error: error.message };
  revalidatePath("/nutrition");
  return { success: true };
}

// ── Feature 1: "Co jíst teď?" suggestions ──────────────────────────
export async function getSuggestions(
  userId: string,
  remainingP: number,
  remainingC: number,
  remainingF: number
): Promise<{ macro: string; label: string; foods: { name: string; grams: number; value: number }[] }[]> {
  const supabase = await createClient();
  const suggestions: { macro: string; label: string; foods: { name: string; grams: number; value: number }[] }[] = [];

  // Determine which macro has biggest deficit (>30% of target remaining)
  const macroNeeds: { macro: string; label: string; remaining: number; column: string; unit: string }[] = [];
  if (remainingP > 0) macroNeeds.push({ macro: "protein", label: "proteinu", remaining: remainingP, column: "protein_g", unit: "P" });
  if (remainingC > 0) macroNeeds.push({ macro: "carbs", label: "sacharidů", remaining: remainingC, column: "carbs_g", unit: "C" });
  if (remainingF > 0) macroNeeds.push({ macro: "fat", label: "tuků", remaining: remainingF, column: "fat_g", unit: "F" });

  // Sort by remaining descending (biggest need first)
  macroNeeds.sort((a, b) => b.remaining - a.remaining);

  for (const need of macroNeeds.slice(0, 2)) {
    const { data } = await supabase
      .from("food_items")
      .select("name, kcal_per_100g, protein_g, carbs_g, fat_g")
      .or(`owner_id.eq.${userId},source.eq.public`)
      .order(need.column, { ascending: false })
      .limit(5);

    if (data && data.length > 0) {
      const foods = data.map((f) => {
        // Suggest portion to get ~30-40% of remaining need
        const per100 = (f as Record<string, number>)[need.column] ?? 0;
        const targetGrams = per100 > 0 ? Math.round((need.remaining * 0.35 / per100) * 100) : 100;
        const grams = Math.min(Math.max(targetGrams, 50), 300);
        const value = Math.round((per100 * grams) / 100);
        return { name: f.name, grams, value };
      }).slice(0, 3);

      suggestions.push({
        macro: need.unit,
        label: need.label,
        foods,
      });
    }
  }

  return suggestions;
}

// ── Feature 7: Plan meal for future date ──────────────────────────
export async function getDailyMealsForDate(
  userId: string,
  date: string
): Promise<MealWithItems[]> {
  return getDailyMeals(userId, date);
}

// ── Feature 8: Water tracking ─────────────────────────────────────
export async function getWaterGlasses(
  userId: string,
  date: string
): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_checkins")
    .select("water_glasses")
    .eq("profile_id", userId)
    .eq("date", date)
    .single();
  return data?.water_glasses ?? 0;
}

export async function addWaterGlass(date: string) {
  const supabase = await createClient();
  const userId = await resolveUserId();

  // Upsert: increment water_glasses
  const { data: existing } = await supabase
    .from("daily_checkins")
    .select("id, water_glasses")
    .eq("profile_id", userId)
    .eq("date", date)
    .single();

  if (existing) {
    const newCount = (existing.water_glasses ?? 0) + 1;
    await supabase
      .from("daily_checkins")
      .update({ water_glasses: newCount })
      .eq("id", existing.id);
    revalidatePath("/nutrition");
    return { glasses: newCount };
  } else {
    const { error } = await supabase
      .from("daily_checkins")
      .insert({ profile_id: userId, date, water_glasses: 1 });
    if (error) return { glasses: 0 };
    revalidatePath("/nutrition");
    return { glasses: 1 };
  }
}

export async function removeWaterGlass(date: string) {
  const supabase = await createClient();
  const userId = await resolveUserId();

  const { data: existing } = await supabase
    .from("daily_checkins")
    .select("id, water_glasses")
    .eq("profile_id", userId)
    .eq("date", date)
    .single();

  if (existing && (existing.water_glasses ?? 0) > 0) {
    const newCount = (existing.water_glasses ?? 0) - 1;
    await supabase
      .from("daily_checkins")
      .update({ water_glasses: newCount })
      .eq("id", existing.id);
    revalidatePath("/nutrition");
    return { glasses: newCount };
  }
  return { glasses: 0 };
}

// ── Feature 9: Check if training day ──────────────────────────────
export async function isTrainingDay(
  userId: string,
  date: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_sessions")
    .select("id")
    .eq("profile_id", userId)
    .eq("date", date)
    .limit(1);
  return (data?.length ?? 0) > 0;
}

// ── Feature 10: Copy yesterday's meals ────────────────────────────
export async function copyYesterdayMeals(date: string) {
  const supabase = await createClient();
  const userId = await resolveUserId();

  // Compute yesterday
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  const yesterday = d.toISOString().split("T")[0];

  // Fetch yesterday's meals + items
  const yesterdayMeals = await getDailyMeals(userId, yesterday);
  if (yesterdayMeals.length === 0) {
    return { error: "Včera nebyly žádné jídla k zkopírování." };
  }

  let copiedCount = 0;
  for (const meal of yesterdayMeals) {
    const { data: newMeal, error: mealError } = await supabase
      .from("meals")
      .insert({
        profile_id: userId,
        date,
        meal_type: meal.meal_type,
        consumed_at: new Date().toISOString(),
        notes: meal.notes ? `${meal.notes} (kopie)` : "Kopie z včerejška",
        visibility: "private",
      })
      .select()
      .single();

    if (mealError || !newMeal) continue;

    if (meal.meal_items.length > 0) {
      await supabase.from("meal_items").insert(
        meal.meal_items.map((mi) => ({
          meal_id: newMeal.id,
          food_id: mi.food_id,
          grams: mi.grams,
        }))
      );
    }
    copiedCount++;
  }

  revalidatePath("/nutrition");
  return { success: true, count: copiedCount };
}

// Quick-add: just kcal + macros, no food search
export async function quickAddMeal(formData: FormData) {
  const supabase = await createClient();
  const userId = await resolveUserId();
  const date = (formData.get("date") as string) || new Date().toISOString().split("T")[0];
  const mealType = (formData.get("meal_type") as MealType) || "snack";
  const kcal = Number(formData.get("kcal")) || 0;
  const protein = Number(formData.get("protein")) || 0;
  const carbs = Number(formData.get("carbs")) || 0;
  const fat = Number(formData.get("fat")) || 0;
  const notes = (formData.get("notes") as string) || null;

  // Create a "quick add" food item
  const { data: food } = await supabase
    .from("food_items")
    .insert({
      name: notes || `Rychlý zápis (${kcal} kcal)`,
      kcal_per_100g: kcal,
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
      source: "manual",
      owner_id: userId,
    })
    .select()
    .single();

  if (!food) return { error: "Nepodařilo se vytvořit potravinu" };

  // Create meal with 100g (so macros match exactly)
  const { data: meal } = await supabase
    .from("meals")
    .insert({
      profile_id: userId,
      date,
      meal_type: mealType,
      consumed_at: new Date().toISOString(),
      notes,
      visibility: "private",
    })
    .select()
    .single();

  if (!meal) return { error: "Nepodařilo se vytvořit jídlo" };

  await supabase.from("meal_items").insert({
    meal_id: meal.id,
    food_id: food.id,
    grams: 100,
  });

  revalidatePath("/nutrition");
  return { success: true };
}
