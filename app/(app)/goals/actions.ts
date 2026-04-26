"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { awardXP } from "@/lib/logic/xp";
import { XP_VALUES } from "@/types/gamification";
import { checkAndUnlockAchievements } from "@/lib/logic/achievements";
import { DEV_MODE, MOCK_USER_ID } from "@/lib/dev/mock-user";

async function getUser() {
  const supabase = await createClient();
  let userId: string;
  if (DEV_MODE) {
    userId = MOCK_USER_ID;
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Nepřihlášen");
    userId = user.id;
  }
  return { supabase, userId };
}

export async function createGoal(formData: FormData) {
  const { supabase, userId } = await getUser();

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const metric = (formData.get("metric") as string) || null;
  const targetValue = formData.get("target_value")
    ? Number(formData.get("target_value"))
    : null;
  const startValue = formData.get("start_value")
    ? Number(formData.get("start_value"))
    : null;
  const currentValue = startValue;
  const targetDate = (formData.get("target_date") as string) || null;

  // New fields
  const goalType = (formData.get("goal_type") as string) || "measurable";
  const area = (formData.get("area") as string) || "other";
  const frequency = (formData.get("frequency") as string) || null;
  const frequencyTarget = formData.get("frequency_target")
    ? Number(formData.get("frequency_target"))
    : null;
  const challengeDays = formData.get("challenge_days")
    ? Number(formData.get("challenge_days"))
    : null;

  // Challenge: auto-set start to today
  const challengeStart =
    goalType === "challenge"
      ? new Date().toISOString().split("T")[0]
      : null;

  // Shared: auto-set visibility to household
  const visibility = goalType === "shared" ? "household" : "private";

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
      visibility,
      goal_type: goalType,
      area,
      frequency,
      frequency_target: frequencyTarget,
      challenge_days: challengeDays,
      challenge_start: challengeStart,
    })
    .select()
    .single();

  if (error) {
    return { error: `Chyba při vytváření cíle: ${error.message}` };
  }

  // Habit type: auto-create a daily_habit linked to this goal
  if (goalType === "habit" && goal) {
    try {
      await supabase.from("daily_habits").insert({
        profile_id: userId,
        goal_id: goal.id,
        title,
        description,
        xp_value: 15,
        is_active: true,
        sort_order: 0,
      });
    } catch {
      // Non-critical — habit creation failure shouldn't block goal creation
    }
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
    suggestHabit: goalType === "measurable",
  };
}

export async function updateGoal(id: string, formData: FormData) {
  const { supabase, userId } = await getUser();

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

  // New fields
  const goalType = (formData.get("goal_type") as string) || undefined;
  const area = (formData.get("area") as string) || undefined;
  const frequency = (formData.get("frequency") as string) || null;
  const frequencyTarget = formData.get("frequency_target")
    ? Number(formData.get("frequency_target"))
    : null;
  const challengeDays = formData.get("challenge_days")
    ? Number(formData.get("challenge_days"))
    : null;

  const updateData: Record<string, unknown> = {
    title,
    description,
    metric,
    target_value: targetValue,
    start_value: startValue,
    current_value: currentValue,
    target_date: targetDate,
    updated_at: new Date().toISOString(),
  };

  if (goalType) updateData.goal_type = goalType;
  if (area) updateData.area = area;
  if (frequency) updateData.frequency = frequency;
  if (frequencyTarget) updateData.frequency_target = frequencyTarget;
  if (challengeDays) updateData.challenge_days = challengeDays;

  const { error } = await supabase
    .from("goals")
    .update(updateData)
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
  const { supabase, userId } = await getUser();

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
    celebration: true,
    xpAwarded: XP_VALUES.GOAL_COMPLETED,
    leveledUp: xpResult?.leveledUp ?? false,
    newLevel: xpResult?.newLevel,
    newTitle: xpResult?.newTitle,
    achievementsUnlocked: achievements ?? [],
  };
}

export async function pauseGoal(id: string) {
  const { supabase, userId } = await getUser();

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

export async function quickUpdateProgress(
  goalId: string,
  currentValue: number
) {
  const { supabase, userId } = await getUser();

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

export async function extendGoalDeadline(goalId: string, days: number) {
  const { supabase, userId } = await getUser();

  const { data: goal } = await supabase
    .from("goals")
    .select("target_date")
    .eq("id", goalId)
    .eq("profile_id", userId)
    .single();

  if (!goal) return { error: "Cíl nenalezen" };

  const currentDate = goal.target_date
    ? new Date(goal.target_date)
    : new Date();
  currentDate.setDate(currentDate.getDate() + days);
  const newDate = currentDate.toISOString().split("T")[0];

  const { error } = await supabase
    .from("goals")
    .update({
      target_date: newDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId)
    .eq("profile_id", userId);

  if (error) return { error: `Chyba: ${error.message}` };

  revalidatePath("/goals");
  revalidatePath(`/goals/${goalId}`);
  return { success: true, newDate };
}

export async function archiveGoal(goalId: string) {
  const { supabase, userId } = await getUser();

  const { error } = await supabase
    .from("goals")
    .update({
      status: "abandoned",
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId)
    .eq("profile_id", userId);

  if (error) return { error: `Chyba: ${error.message}` };

  revalidatePath("/goals");
  revalidatePath(`/goals/${goalId}`);
  return { success: true };
}

export async function restartChallenge(goalId: string) {
  const { supabase, userId } = await getUser();

  const today = new Date().toISOString().split("T")[0];

  const { error } = await supabase
    .from("goals")
    .update({
      challenge_start: today,
      current_value: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId)
    .eq("profile_id", userId);

  if (error) return { error: `Chyba: ${error.message}` };

  revalidatePath("/goals");
  revalidatePath(`/goals/${goalId}`);
  return { success: true };
}

export async function deleteGoal(id: string) {
  const { supabase, userId } = await getUser();

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

// ==================== MILESTONES ====================

export interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  target_value: number | null;
  completed: boolean;
  completed_at: string | null;
  sort_order: number;
}

export async function getMilestones(goalId: string): Promise<GoalMilestone[]> {
  const { supabase } = await getUser();

  const { data } = await supabase
    .from("goal_milestones")
    .select("*")
    .eq("goal_id", goalId)
    .order("sort_order", { ascending: true });

  return (data ?? []) as GoalMilestone[];
}

export async function addMilestone(
  goalId: string,
  title: string,
  targetValue?: number
): Promise<{ error?: string }> {
  const { supabase, userId } = await getUser();

  // Verify goal ownership
  const { data: goal } = await supabase
    .from("goals")
    .select("id")
    .eq("id", goalId)
    .eq("profile_id", userId)
    .single();

  if (!goal) return { error: "Cíl nenalezen" };

  // Get max sort_order
  const { data: existing } = await supabase
    .from("goal_milestones")
    .select("sort_order")
    .eq("goal_id", goalId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? (existing[0].sort_order + 1) : 0;

  const { error } = await supabase.from("goal_milestones").insert({
    goal_id: goalId,
    title,
    target_value: targetValue ?? null,
    sort_order: nextOrder,
  });

  if (error) return { error: error.message };

  revalidatePath(`/goals/${goalId}`);
  return {};
}

export async function completeMilestone(
  milestoneId: string
): Promise<{ xpAwarded?: number; error?: string }> {
  const { supabase, userId } = await getUser();

  const { data: milestone } = await supabase
    .from("goal_milestones")
    .select("id, goal_id, completed")
    .eq("id", milestoneId)
    .single();

  if (!milestone) return { error: "Milestone nenalezen" };
  if (milestone.completed) return { error: "Už je dokončen" };

  await supabase
    .from("goal_milestones")
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", milestoneId);

  // Award XP
  await awardXP(supabase, userId, XP_VALUES.MILESTONE_COMPLETED, "Milestone dokončen", "milestone", milestoneId);

  revalidatePath(`/goals/${milestone.goal_id}`);
  return { xpAwarded: XP_VALUES.MILESTONE_COMPLETED };
}

export async function deleteMilestone(milestoneId: string): Promise<{ error?: string }> {
  const { supabase } = await getUser();

  const { error } = await supabase
    .from("goal_milestones")
    .delete()
    .eq("id", milestoneId);

  if (error) return { error: error.message };

  revalidatePath("/goals");
  return {};
}
