"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { DEV_MODE, MOCK_USER_ID } from "@/lib/dev/mock-user";
import { format } from "date-fns";
import { PLAN_TEMPLATES } from "./templates";

async function getUserId() {
  if (DEV_MODE) return MOCK_USER_ID;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Nepřihlášen");
  return user.id;
}

export async function getExercises() {
  if (DEV_MODE) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("exercises")
    .select("*")
    .order("category")
    .order("name");
  return data ?? [];
}

export async function createPlan(formData: FormData) {
  const userId = await getUserId();
  const name = formData.get("name") as string;
  const daysPerWeek = parseInt(formData.get("days_per_week") as string) || null;
  const splitType = (formData.get("split_type") as string) || null;

  if (DEV_MODE) return { error: "Dev mode — databáze nedostupná" };
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("training_plans")
    .insert({
      profile_id: userId,
      name,
      start_date: format(new Date(), "yyyy-MM-dd"),
      days_per_week: daysPerWeek,
      split_type: splitType,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/training");
  revalidatePath("/training/plan");
  return { plan: data };
}

export async function addWorkoutToPlan(planId: string, formData: FormData) {
  if (DEV_MODE) return { error: "Dev mode — databáze nedostupná" };
  const supabase = await createClient();

  const dayIndex = parseInt(formData.get("day_index") as string);
  const dayLabel = formData.get("day_label") as string;
  const focus = (formData.get("focus") as string) || null;
  const targetDuration = parseInt(formData.get("target_duration_min") as string) || null;

  const { data, error } = await supabase
    .from("workouts")
    .insert({
      plan_id: planId,
      day_index: dayIndex,
      day_label: dayLabel,
      focus,
      target_duration_min: targetDuration,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/training/plan");
  return { workout: data };
}

export async function addExerciseToWorkout(workoutId: string, formData: FormData) {
  if (DEV_MODE) return { error: "Dev mode — databáze nedostupná" };
  const supabase = await createClient();

  const exerciseId = formData.get("exercise_id") as string;
  const orderIdx = parseInt(formData.get("order_idx") as string) || 0;
  const sets = parseInt(formData.get("sets") as string) || 3;
  const repsLow = parseInt(formData.get("reps_low") as string) || 8;
  const repsHigh = parseInt(formData.get("reps_high") as string) || null;
  const rpeTarget = parseFloat(formData.get("rpe_target") as string) || null;
  const restSec = parseInt(formData.get("rest_sec") as string) || null;

  const { data, error } = await supabase
    .from("workout_exercises")
    .insert({
      workout_id: workoutId,
      exercise_id: exerciseId,
      order_idx: orderIdx,
      sets,
      reps_low: repsLow,
      reps_high: repsHigh,
      rpe_target: rpeTarget,
      rest_sec: restSec,
    })
    .select("*, exercises(*)")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/training/plan");
  return { exercise: data };
}

export async function removeExerciseFromWorkout(id: string) {
  if (DEV_MODE) return { error: "Dev mode — databáze nedostupná" };
  const supabase = await createClient();

  const { error } = await supabase
    .from("workout_exercises")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/training/plan");
  return { success: true };
}

export async function removeWorkout(id: string) {
  if (DEV_MODE) return { error: "Dev mode — databáze nedostupná" };
  const supabase = await createClient();

  // Delete exercises first, then workout
  await supabase
    .from("workout_exercises")
    .delete()
    .eq("workout_id", id);

  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/training/plan");
  return { success: true };
}

export async function createPlanFromTemplate(templateId: string) {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode — databáze nedostupná" };

  const template = PLAN_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return { error: "Šablona nenalezena" };

  const supabase = await createClient();

  // 1. Create the plan
  const { data: plan, error: planError } = await supabase
    .from("training_plans")
    .insert({
      profile_id: userId,
      name: template.name,
      start_date: format(new Date(), "yyyy-MM-dd"),
      days_per_week: template.daysPerWeek,
      split_type: template.splitType,
    })
    .select()
    .single();

  if (planError) return { error: planError.message };

  // 2. Fetch all exercises to map names → IDs
  const { data: allExercises } = await supabase
    .from("exercises")
    .select("id, name");

  const exerciseMap = new Map(
    (allExercises ?? []).map((e: { id: string; name: string }) => [e.name, e.id])
  );

  // 3. Create workouts + exercises for each day
  for (const day of template.days) {
    const { data: workout, error: wErr } = await supabase
      .from("workouts")
      .insert({
        plan_id: plan.id,
        day_index: day.dayIndex,
        day_label: day.label,
        focus: day.focus,
        target_duration_min: 60,
      })
      .select()
      .single();

    if (wErr || !workout) continue;

    const exerciseRows = day.exercises
      .map((name, idx) => {
        const exerciseId = exerciseMap.get(name);
        if (!exerciseId) return null;
        return {
          workout_id: workout.id,
          exercise_id: exerciseId,
          order_idx: idx,
          sets: 3,
          reps_low: 8,
          reps_high: 12,
          rpe_target: 7,
          rest_sec: 90,
        };
      })
      .filter(Boolean);

    if (exerciseRows.length > 0) {
      await supabase.from("workout_exercises").insert(exerciseRows);
    }
  }

  revalidatePath("/training");
  revalidatePath("/training/plan");
  return { plan };
}
