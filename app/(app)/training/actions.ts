"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { awardXP } from "@/lib/logic/xp";
import { XP_VALUES } from "@/types/gamification";
import { DEV_MODE, MOCK_USER_ID } from "@/lib/dev/mock-user";
import { format } from "date-fns";

async function getUserId() {
  if (DEV_MODE) return MOCK_USER_ID;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Nepřihlášen");
  return user.id;
}

export async function getTrainingPlans(userId: string) {
  if (DEV_MODE) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("training_plans")
    .select("*")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getWorkoutForToday(userId: string) {
  if (DEV_MODE) return null;
  const supabase = await createClient();
  const dayIndex = (new Date().getDay() + 6) % 7; // 0=Mon

  const { data: plans } = await supabase
    .from("training_plans")
    .select("id")
    .eq("profile_id", userId)
    .lte("start_date", format(new Date(), "yyyy-MM-dd"))
    .order("created_at", { ascending: false })
    .limit(1);

  if (!plans?.length) return null;

  const { data: workout } = await supabase
    .from("workouts")
    .select("*, workout_exercises(*, exercises(*))")
    .eq("plan_id", plans[0].id)
    .eq("day_index", dayIndex)
    .single();

  return workout;
}

export async function startSession(workoutId: string | null) {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode — databáze nedostupná" };
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workout_sessions")
    .insert({
      profile_id: userId,
      workout_id: workoutId,
      date: format(new Date(), "yyyy-MM-dd"),
      started_at: new Date().toISOString(),
      visibility: "private",
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/training");
  return { session: data };
}

export async function logSet(
  sessionId: string,
  exerciseId: string,
  setIdx: number,
  weightKg: number,
  reps: number,
  rpe: number | null,
  isWarmup: boolean
) {
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();

  const { error } = await supabase.from("set_logs").insert({
    session_id: sessionId,
    exercise_id: exerciseId,
    set_idx: setIdx,
    weight_kg: weightKg,
    reps,
    rpe,
    is_warmup: isWarmup,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function completeSession(
  sessionId: string,
  mood: number | null,
  energy: number | null,
  notes: string | null
) {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();

  const { error } = await supabase
    .from("workout_sessions")
    .update({
      completed_at: new Date().toISOString(),
      mood_1_10: mood,
      energy_1_10: energy,
      notes,
    })
    .eq("id", sessionId)
    .eq("profile_id", userId);

  if (error) return { error: error.message };

  try {
    await awardXP(supabase, userId, 30, "Trénink dokončen", "workout_session", sessionId);
  } catch {}

  revalidatePath("/training");
  revalidatePath("/dashboard");
  return { success: true, xpAwarded: 30 };
}

export async function getSessionHistory(userId: string, limit = 30) {
  if (DEV_MODE) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_sessions")
    .select("*, workouts(day_label, focus)")
    .eq("profile_id", userId)
    .order("date", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getExerciseHistory(userId: string, exerciseId: string, limit = 10) {
  if (DEV_MODE) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("set_logs")
    .select("*, workout_sessions!inner(profile_id, date)")
    .eq("exercise_id", exerciseId)
    .eq("workout_sessions.profile_id", userId)
    .order("completed_at", { ascending: false })
    .limit(limit * 10);
  return data ?? [];
}
