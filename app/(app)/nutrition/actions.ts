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
