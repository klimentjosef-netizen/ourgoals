"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { awardXP } from "@/lib/logic/xp";
import { XP_VALUES } from "@/types/gamification";
import { DEV_MODE, MOCK_USER_ID } from "@/lib/dev/mock-user";
import { calculateTargetLoad } from "@/lib/logic/overload";
import type { SetLog, Exercise } from "@/types/training";
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

export interface ExerciseSuggestionResult {
  suggestedWeight: number | null;
  suggestedReps: number | null;
  reasoning: string;
  lastSets: string | null;
}

export async function getExerciseSuggestion(
  userId: string,
  exerciseId: string,
  repsLow: number,
  repsHigh: number,
  rpeTarget: number
): Promise<ExerciseSuggestionResult> {
  if (DEV_MODE) {
    return {
      suggestedWeight: 80,
      suggestedReps: repsLow,
      reasoning: "Dev mode — ukázková data",
      lastSets: "80kg × 8, 80kg × 8, 80kg × 7",
    };
  }

  const supabase = await createClient();

  // Načti poslední 3 sessions s tímto cvikem
  const { data: logs } = await supabase
    .from("set_logs")
    .select("*, workout_sessions!inner(profile_id, date, id)")
    .eq("exercise_id", exerciseId)
    .eq("workout_sessions.profile_id", userId)
    .order("completed_at", { ascending: false })
    .limit(60);

  if (!logs || logs.length === 0) {
    return {
      suggestedWeight: null,
      suggestedReps: repsLow,
      reasoning: "První trénink tohoto cviku — zadej váhu sám",
      lastSets: null,
    };
  }

  // Seskup logy podle session
  const sessionMap = new Map<string, SetLog[]>();
  for (const log of logs) {
    const sid = (log.workout_sessions as Record<string, string>)?.id ?? log.session_id;
    if (!sessionMap.has(sid)) sessionMap.set(sid, []);
    sessionMap.get(sid)!.push(log as SetLog);
  }

  const lastSessions = Array.from(sessionMap.values()).slice(0, 3);

  // Načti exercise pro kategorii
  const { data: exercise } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", exerciseId)
    .single();

  const suggestion = calculateTargetLoad(
    lastSessions,
    (exercise ?? { category: "compound" }) as Exercise,
    repsLow,
    repsHigh,
    rpeTarget
  );

  // Formátuj string posledních sérií
  const lastSessionSets = lastSessions[0] ?? [];
  const workingSets = lastSessionSets.filter((s) => !s.is_warmup);
  const lastSetsStr = workingSets.length > 0
    ? workingSets.map((s) => `${s.weight_kg ?? 0}kg × ${s.reps ?? 0}`).join(", ")
    : null;

  return {
    suggestedWeight: suggestion.suggestedWeight,
    suggestedReps: suggestion.suggestedReps,
    reasoning: suggestion.reasoning,
    lastSets: lastSetsStr,
  };
}

export async function getSessionHistoryWithSets(userId: string, limit = 30) {
  if (DEV_MODE) {
    return [
      {
        id: "dev-session-1",
        date: "2026-04-22",
        completed_at: "2026-04-22T18:00:00Z",
        mood_1_10: 8,
        energy_1_10: 7,
        workouts: { day_label: "Push A", focus: "Hrudník + triceps" },
        set_logs: [
          { set_idx: 0, weight_kg: 80, reps: 8, rpe: 7, is_warmup: false, exercises: { name: "Bench press (tlak na lavičce)" } },
          { set_idx: 1, weight_kg: 80, reps: 8, rpe: 8, is_warmup: false, exercises: { name: "Bench press (tlak na lavičce)" } },
          { set_idx: 0, weight_kg: 50, reps: 10, rpe: 7, is_warmup: false, exercises: { name: "Tlak nad hlavou" } },
        ],
      },
      {
        id: "dev-session-2",
        date: "2026-04-20",
        completed_at: "2026-04-20T17:30:00Z",
        mood_1_10: 7,
        energy_1_10: 6,
        workouts: { day_label: "Pull A", focus: "Záda + biceps" },
        set_logs: [
          { set_idx: 0, weight_kg: 0, reps: 10, rpe: 8, is_warmup: false, exercises: { name: "Shyby" } },
          { set_idx: 0, weight_kg: 70, reps: 8, rpe: 7, is_warmup: false, exercises: { name: "Přítahy činky" } },
        ],
      },
    ];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_sessions")
    .select("*, workouts(day_label, focus), set_logs(*, exercises(name))")
    .eq("profile_id", userId)
    .order("date", { ascending: false })
    .limit(limit);

  return data ?? [];
}
