"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { awardXP } from "@/lib/logic/xp";
import { recalculateStreak, evaluateDayStatus } from "@/lib/logic/streaks";
import { checkAndUnlockAchievements } from "@/lib/logic/achievements";
import { DEV_MODE, MOCK_USER_ID } from "@/lib/dev/mock-user";

export async function createHabit(formData: FormData) {
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
  const goalId = (formData.get("goal_id") as string) || null;
  const xpValue = Number(formData.get("xp_value") || 15);

  const { error } = await supabase.from("daily_habits").insert({
    profile_id: userId,
    goal_id: goalId,
    title,
    description,
    xp_value: xpValue,
    is_active: true,
    sort_order: 0,
  });

  if (error) {
    return { error: `Chyba při vytváření návyku: ${error.message}` };
  }

  revalidatePath("/goals");

  return { success: true };
}

export async function toggleHabit(habitId: string, date: string) {
  const supabase = await createClient();
  let userId: string;
  if (DEV_MODE) {
    userId = MOCK_USER_ID;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nepřihlášen");
    userId = user.id;
  }

  // Check if completion already exists
  const { data: existing } = await supabase
    .from("habit_completions")
    .select("id")
    .eq("habit_id", habitId)
    .eq("profile_id", userId)
    .eq("date", date)
    .maybeSingle();

  // Get habit for xp_value
  const { data: habit } = await supabase
    .from("daily_habits")
    .select("xp_value")
    .eq("id", habitId)
    .single();

  let xpAwarded = 0;
  let achievementsUnlocked: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    xp_reward: number;
  }> = [];

  if (existing) {
    // Uncomplete: delete the completion
    await supabase
      .from("habit_completions")
      .delete()
      .eq("id", existing.id);
  } else {
    // Complete: insert completion
    const { error } = await supabase.from("habit_completions").insert({
      profile_id: userId,
      habit_id: habitId,
      date,
    });

    if (error) {
      return { error: `Chyba: ${error.message}` };
    }

    // Award XP
    if (habit?.xp_value) {
      try {
        await awardXP(
          supabase,
          userId,
          habit.xp_value,
          "Návyk splněn",
          "habit",
          habitId
        );
        xpAwarded = habit.xp_value;
      } catch {
        // non-critical
      }
    }

    // Check achievements
    try {
      achievementsUnlocked = await checkAndUnlockAchievements(
        supabase,
        userId,
        "habit_completed"
      );
    } catch {
      // non-critical
    }
  }

  // Update daily_completion status
  try {
    await updateDailyCompletion(supabase, userId, date);
  } catch {
    // non-critical
  }

  // Recalculate streak
  try {
    await recalculateStreak(supabase, userId);
  } catch {
    // non-critical
  }

  revalidatePath("/goals");

  return {
    completed: !existing,
    xpAwarded,
    achievementsUnlocked,
  };
}

async function updateDailyCompletion(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profileId: string,
  date: string
) {
  // Get all habits and completions for this date
  const { data: habits } = await supabase
    .from("daily_habits")
    .select("id")
    .eq("profile_id", profileId)
    .eq("is_active", true);

  const { data: completions } = await supabase
    .from("habit_completions")
    .select("habit_id")
    .eq("profile_id", profileId)
    .eq("date", date);

  // Get checkin data
  const { data: checkin } = await supabase
    .from("daily_checkins")
    .select("morning_ritual_done, evening_ritual_done")
    .eq("profile_id", profileId)
    .eq("date", date)
    .maybeSingle();

  const habitsTotal = habits?.length ?? 0;
  const habitsCompleted = completions?.length ?? 0;
  const morningCheckin = checkin?.morning_ritual_done ?? false;
  const eveningCheckin = checkin?.evening_ritual_done ?? false;

  const status = evaluateDayStatus({
    morningCheckin,
    eveningCheckin,
    habitsCompleted,
    habitsTotal,
  });

  // Upsert daily_completion
  const { data: existing } = await supabase
    .from("daily_completion")
    .select("id")
    .eq("profile_id", profileId)
    .eq("date", date)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("daily_completion")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("daily_completion").insert({
      profile_id: profileId,
      date,
      morning_checkin: morningCheckin,
      evening_checkin: eveningCheckin,
      status,
      xp_earned: 0,
      training_done: false,
      training_required: false,
      protein_target_met: false,
      bedtime_target_met: false,
    });
  }
}

export async function deleteHabit(id: string) {
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
    .from("daily_habits")
    .delete()
    .eq("id", id)
    .eq("profile_id", userId);

  if (error) {
    return { error: `Chyba při mazání: ${error.message}` };
  }

  revalidatePath("/goals");

  return { success: true };
}
