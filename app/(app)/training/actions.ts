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
  if (DEV_MODE) return { error: "Dev mode: databáze nedostupná" };
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
  notes: string | null,
  workoutLabel?: string
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

  // Feature 10: Calendar sync
  try {
    const { data: session } = await supabase
      .from("workout_sessions")
      .select("started_at, workouts(day_label)")
      .eq("id", sessionId)
      .single();

    const rawWorkouts = session?.workouts;
    const workoutObj = Array.isArray(rawWorkouts) ? rawWorkouts[0] : rawWorkouts;
    const label = workoutLabel
      ?? (workoutObj as Record<string, string> | null)?.day_label
      ?? "Volný trénink";
    const startedAt = session?.started_at ?? new Date().toISOString();

    await createCalendarEventForSession(userId, sessionId, label, startedAt);
  } catch {
    // Non-critical — calendar event failure shouldn't block session completion
  }

  // Auto-complete training habits
  try {
    const today = format(new Date(), "yyyy-MM-dd");

    // Find active habit goals in health area
    const { data: healthHabitGoals } = await supabase
      .from("goals")
      .select("id, frequency")
      .eq("profile_id", userId)
      .eq("status", "active")
      .eq("goal_type", "habit")
      .eq("area", "health");

    if (healthHabitGoals && healthHabitGoals.length > 0) {
      const goalIds = healthHabitGoals.map((g) => g.id);

      // Find daily_habits linked to those goals
      const { data: linkedHabits } = await supabase
        .from("daily_habits")
        .select("id")
        .in("goal_id", goalIds)
        .eq("profile_id", userId)
        .eq("is_active", true);

      if (linkedHabits && linkedHabits.length > 0) {
        for (const habit of linkedHabits) {
          // Check if already completed today
          const { data: existing } = await supabase
            .from("habit_completions")
            .select("id")
            .eq("profile_id", userId)
            .eq("habit_id", habit.id)
            .eq("date", today)
            .maybeSingle();

          if (!existing) {
            await supabase.from("habit_completions").insert({
              profile_id: userId,
              habit_id: habit.id,
              date: today,
            });
          }
        }
      }
    }
  } catch {
    // Non-critical — habit auto-complete failure shouldn't block session completion
  }

  revalidatePath("/training");
  revalidatePath("/dashboard");
  revalidatePath("/goals");
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
      reasoning: "Dev mode: ukázková data",
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
      reasoning: "První trénink tohoto cviku. Zadej váhu sám.",
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

// Feature 5: PR tracking
export async function checkForPR(
  userId: string,
  exerciseId: string,
  weight: number,
  reps: number
): Promise<{ isPR: boolean; previousBest: number | null }> {
  if (DEV_MODE) {
    // V dev režimu simulujeme PR pro váhy nad 100 kg
    return { isPR: weight >= 100, previousBest: weight >= 100 ? 95 : null };
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from("set_logs")
    .select("weight_kg, workout_sessions!inner(profile_id)")
    .eq("exercise_id", exerciseId)
    .eq("workout_sessions.profile_id", userId)
    .eq("is_warmup", false)
    .order("weight_kg", { ascending: false })
    .limit(1);

  const previousBest = data?.[0]?.weight_kg ?? null;

  return {
    isPR: previousBest === null ? true : weight > previousBest,
    previousBest,
  };
}

// Feature 11: Exercise progress data
export async function getExerciseProgressData(userId: string) {
  if (DEV_MODE) {
    return [
      {
        exerciseName: "Bench press (tlak na lavičce)",
        data: [
          { date: "2026-04-01", maxWeight: 70 },
          { date: "2026-04-05", maxWeight: 72.5 },
          { date: "2026-04-09", maxWeight: 72.5 },
          { date: "2026-04-13", maxWeight: 75 },
          { date: "2026-04-17", maxWeight: 77.5 },
          { date: "2026-04-20", maxWeight: 80 },
        ],
      },
      {
        exerciseName: "Přítahy činky",
        data: [
          { date: "2026-04-02", maxWeight: 60 },
          { date: "2026-04-06", maxWeight: 62.5 },
          { date: "2026-04-10", maxWeight: 65 },
          { date: "2026-04-14", maxWeight: 65 },
          { date: "2026-04-18", maxWeight: 67.5 },
          { date: "2026-04-22", maxWeight: 70 },
        ],
      },
      {
        exerciseName: "Dřepy",
        data: [
          { date: "2026-04-03", maxWeight: 80 },
          { date: "2026-04-07", maxWeight: 85 },
          { date: "2026-04-11", maxWeight: 87.5 },
          { date: "2026-04-15", maxWeight: 90 },
          { date: "2026-04-19", maxWeight: 90 },
          { date: "2026-04-22", maxWeight: 92.5 },
        ],
      },
    ];
  }

  const supabase = await createClient();

  // Najdi top 3 nejčastější cviky
  const { data: topExercises } = await supabase
    .from("set_logs")
    .select("exercise_id, exercises(name), workout_sessions!inner(profile_id)")
    .eq("workout_sessions.profile_id", userId)
    .eq("is_warmup", false);

  if (!topExercises || topExercises.length === 0) return [];

  // Spočítej frekvenci cviků
  const freqMap = new Map<string, { count: number; name: string }>();
  for (const log of topExercises) {
    const id = log.exercise_id;
    const rawEx = log.exercises;
    const exObj = Array.isArray(rawEx) ? rawEx[0] : rawEx;
    const name = (exObj as Record<string, string> | null)?.name ?? "Cvik";
    const curr = freqMap.get(id) ?? { count: 0, name };
    curr.count++;
    freqMap.set(id, curr);
  }

  const top3 = Array.from(freqMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);

  const results = [];

  for (const [exerciseId, { name }] of top3) {
    const { data: logs } = await supabase
      .from("set_logs")
      .select("weight_kg, workout_sessions!inner(profile_id, date)")
      .eq("exercise_id", exerciseId)
      .eq("workout_sessions.profile_id", userId)
      .eq("is_warmup", false)
      .order("completed_at", { ascending: false })
      .limit(80);

    if (!logs || logs.length === 0) continue;

    // Seskup podle session date a vezmi max váhu
    const dateMap = new Map<string, number>();
    for (const log of logs) {
      const rawSess = log.workout_sessions;
      const sessObj = Array.isArray(rawSess) ? rawSess[0] : rawSess;
      const date = (sessObj as Record<string, string> | null)?.date ?? "";
      const w = log.weight_kg ?? 0;
      dateMap.set(date, Math.max(dateMap.get(date) ?? 0, w));
    }

    const data = Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-8)
      .map(([date, maxWeight]) => ({ date, maxWeight }));

    results.push({ exerciseName: name, data });
  }

  return results;
}

// Feature 10: Calendar sync
async function createCalendarEventForSession(
  userId: string,
  sessionId: string,
  workoutLabel: string,
  startedAt: string
) {
  if (DEV_MODE) return;
  const supabase = await createClient();

  await supabase.from("calendar_events").insert({
    owner_id: userId,
    title: `Trénink: ${workoutLabel}`,
    kind: "training",
    starts_at: startedAt,
    ends_at: new Date().toISOString(),
    is_completed: true,
  });
}

// Feature 9: Get next workout info
export async function getNextWorkoutInfo(userId: string): Promise<string | null> {
  if (DEV_MODE) return "Push A — Hrudník + triceps";
  const supabase = await createClient();

  const todayIndex = (new Date().getDay() + 6) % 7; // 0=Mon

  const { data: plans } = await supabase
    .from("training_plans")
    .select("id")
    .eq("profile_id", userId)
    .lte("start_date", format(new Date(), "yyyy-MM-dd"))
    .order("created_at", { ascending: false })
    .limit(1);

  if (!plans?.length) return null;

  // Hledáme další den v plánu po dnešku
  const { data: workouts } = await supabase
    .from("workouts")
    .select("day_index, day_label, focus")
    .eq("plan_id", plans[0].id)
    .order("day_index", { ascending: true });

  if (!workouts?.length) return null;

  // Najdi nejbližší den po dnešku
  const nextWorkout = workouts.find((w) => w.day_index > todayIndex)
    ?? workouts[0]; // Wrap around to first day

  return `${nextWorkout.day_label}${nextWorkout.focus ? ` — ${nextWorkout.focus}` : ""}`;
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
