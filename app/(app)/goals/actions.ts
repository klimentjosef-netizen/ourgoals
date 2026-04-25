"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { awardXP } from "@/lib/logic/xp";
import { XP_VALUES } from "@/types/gamification";
import { checkAndUnlockAchievements } from "@/lib/logic/achievements";
import { DEV_MODE, MOCK_USER_ID } from "@/lib/dev/mock-user";

export async function createGoal(formData: FormData) {
  const supabase = await createClient();
  let userId: string;
  if (DEV_MODE) {
    userId = MOCK_USER_ID;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nepřihlášen");
    userId = user.id;
  }

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const metric = (formData.get("metric") as string) || null;
  const targetValue = formData.get("target_value")
    ? Number(formData.get("target_value"))
    : null;
  const startValue = formData.get("start_value")
    ? Number(formData.get("start_value"))
    : null;
  const currentValue = formData.get("current_value")
    ? Number(formData.get("current_value"))
    : startValue;
  const targetDate = (formData.get("target_date") as string) || null;

  const { data: goal, error } = await supabase
    .from("goals")
    .insert({
      profile_id: userId,
      title,
      description,
      metric,
      target_value: targetValue,
      start_value: startValue,
      current_value: currentValue,
      target_date: targetDate,
      status: "active",
      visibility: "private",
    })
    .select()
    .single();

  if (error) {
    return { error: `Chyba při vytváření cíle: ${error.message}` };
  }

  // Award XP
  let xpResult;
  try {
    xpResult = await awardXP(
      supabase,
      userId,
      XP_VALUES.GOAL_CREATED,
      "Nový cíl vytvořen",
      "goal",
      goal.id
    );
  } catch {
    // XP award failure is non-critical
  }

  // Check achievements
  let achievements;
  try {
    achievements = await checkAndUnlockAchievements(
      supabase,
      userId,
      "goal_created"
    );
  } catch {
    // Achievement check failure is non-critical
  }

  revalidatePath("/goals");

  return {
    goal,
    xpAwarded: XP_VALUES.GOAL_CREATED,
    leveledUp: xpResult?.leveledUp ?? false,
    newLevel: xpResult?.newLevel,
    newTitle: xpResult?.newTitle,
    achievementsUnlocked: achievements ?? [],
  };
}

export async function updateGoal(id: string, formData: FormData) {
  const supabase = await createClient();
  let userId: string;
  if (DEV_MODE) {
    userId = MOCK_USER_ID;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nepřihlášen");
    userId = user.id;
  }

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const metric = (formData.get("metric") as string) || null;
  const targetValue = formData.get("target_value")
    ? Number(formData.get("target_value"))
    : null;
  const startValue = formData.get("start_value")
    ? Number(formData.get("start_value"))
    : null;
  const currentValue = formData.get("current_value")
    ? Number(formData.get("current_value"))
    : null;
  const targetDate = (formData.get("target_date") as string) || null;

  const { error } = await supabase
    .from("goals")
    .update({
      title,
      description,
      metric,
      target_value: targetValue,
      start_value: startValue,
      current_value: currentValue,
      target_date: targetDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("profile_id", userId);

  if (error) {
    return { error: `Chyba při aktualizaci: ${error.message}` };
  }

  revalidatePath("/goals");
  revalidatePath(`/goals/${id}`);

  return { success: true };
}

export async function completeGoal(id: string) {
  const supabase = await createClient();
  let userId: string;
  if (DEV_MODE) {
    userId = MOCK_USER_ID;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nepřihlášen");
    userId = user.id;
  }

  const { error } = await supabase
    .from("goals")
    .update({
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("profile_id", userId);

  if (error) {
    return { error: `Chyba: ${error.message}` };
  }

  let xpResult;
  try {
    xpResult = await awardXP(
      supabase,
      userId,
      XP_VALUES.GOAL_COMPLETED,
      "Cíl dokončen",
      "goal",
      id
    );
  } catch {
    // non-critical
  }

  let achievements;
  try {
    achievements = await checkAndUnlockAchievements(
      supabase,
      userId,
      "goal_completed"
    );
  } catch {
    // non-critical
  }

  revalidatePath("/goals");
  revalidatePath(`/goals/${id}`);

  return {
    success: true,
    xpAwarded: XP_VALUES.GOAL_COMPLETED,
    leveledUp: xpResult?.leveledUp ?? false,
    newLevel: xpResult?.newLevel,
    newTitle: xpResult?.newTitle,
    achievementsUnlocked: achievements ?? [],
  };
}

export async function pauseGoal(id: string) {
  const supabase = await createClient();
  let userId: string;
  if (DEV_MODE) {
    userId = MOCK_USER_ID;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nepřihlášen");
    userId = user.id;
  }

  const { error } = await supabase
    .from("goals")
    .update({
      status: "paused",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("profile_id", userId);

  if (error) {
    return { error: `Chyba: ${error.message}` };
  }

  revalidatePath("/goals");
  revalidatePath(`/goals/${id}`);

  return { success: true };
}

export async function quickUpdateProgress(goalId: string, currentValue: number) {
  const supabase = await createClient();
  let userId: string;
  if (DEV_MODE) {
    userId = MOCK_USER_ID;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nepřihlášen");
    userId = user.id;
  }

  const { error } = await supabase
    .from("goals")
    .update({
      current_value: currentValue,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId)
    .eq("profile_id", userId);

  if (error) {
    return { error: `Chyba při aktualizaci: ${error.message}` };
  }

  revalidatePath("/goals");
  revalidatePath(`/goals/${goalId}`);

  return { success: true };
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  let userId: string;
  if (DEV_MODE) {
    userId = MOCK_USER_ID;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nepřihlášen");
    userId = user.id;
  }

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("profile_id", userId);

  if (error) {
    return { error: `Chyba při mazání: ${error.message}` };
  }

  revalidatePath("/goals");

  return { success: true };
}
