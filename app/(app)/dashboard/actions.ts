"use server";

import { createClient } from "@/lib/supabase/server";
import { format, startOfWeek, addDays } from "date-fns";
import { cs } from "date-fns/locale";
import { DEV_MODE, MOCK_ACTIVE_MODULES } from "@/lib/dev/mock-user";
import type {
  GamificationProfile,
  DailyCheckin,
  DailyHabit,
  HabitCompletion,
  Goal,
  DailyCompletion,
} from "@/types/database";
import type { CoachTone } from "@/types/gamification";

interface TodayWorkout {
  day_label: string;
  focus: string | null;
}

interface TodayMacros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MacroTargets {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface TodayEvent {
  id: string;
  title: string;
  kind: string;
  starts_at: string | null;
}

type DayStatus = "perfect" | "ok" | "missed" | "pending" | "future";

interface WeekDay {
  date: string;
  dayLabel: string;
  status: DayStatus;
}

interface DashboardData {
  gamification: GamificationProfile | null;
  coachTone: CoachTone;
  displayName: string;
  activeModules: string[];
  checkin: DailyCheckin | null;
  habits: DailyHabit[];
  completions: HabitCompletion[];
  goals: Goal[];
  todayWorkout: TodayWorkout | null;
  todayMacros: TodayMacros | null;
  macroTargets: MacroTargets | null;
  todayEvents: TodayEvent[];
  latestWeight: number | null;
  registeredAt: string;
  nearestGoalDeadline: string | null;
  weeklyProgress: WeekDay[];
}

export async function getDashboardData(
  userId: string
): Promise<DashboardData> {
  if (DEV_MODE) {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    const weekDays: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(monday, i);
      const dateStr = format(d, "yyyy-MM-dd");
      const isToday = dateStr === format(today, "yyyy-MM-dd");
      const isFuture = d > today;
      return {
        date: dateStr,
        dayLabel: format(d, "EEEEEE", { locale: cs }),
        status: isFuture ? "future" : isToday ? "pending" : "missed",
      };
    });

    return {
      gamification: null,
      coachTone: "friendly_mentor",
      displayName: "Dev User",
      activeModules: MOCK_ACTIVE_MODULES,
      checkin: null,
      habits: [],
      completions: [],
      goals: [],
      todayWorkout: null,
      todayMacros: null,
      macroTargets: null,
      todayEvents: [],
      latestWeight: null,
      registeredAt: new Date().toISOString(),
      nearestGoalDeadline: null,
      weeklyProgress: weekDays,
    };
  }

  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  // Calculate week range (Monday to Sunday)
  const todayDate = new Date();
  const monday = startOfWeek(todayDate, { weekStartsOn: 1 });
  const sunday = addDays(monday, 6);
  const mondayStr = format(monday, "yyyy-MM-dd");
  const sundayStr = format(sunday, "yyyy-MM-dd");

  // Run all queries in parallel
  const [
    gamificationRes,
    settingsRes,
    profileRes,
    checkinRes,
    habitsRes,
    completionsRes,
    goalsRes,
    weeklyRes,
  ] = await Promise.all([
    supabase
      .from("gamification_profiles")
      .select("*")
      .eq("profile_id", userId)
      .single(),
    supabase
      .from("user_settings")
      .select("active_modules, coach_tone, protein_g, carbs_g, fat_g")
      .eq("profile_id", userId)
      .single(),
    supabase
      .from("profiles")
      .select("display_name, created_at")
      .eq("id", userId)
      .single(),
    supabase
      .from("daily_checkins")
      .select("*")
      .eq("profile_id", userId)
      .eq("date", today)
      .single(),
    supabase
      .from("daily_habits")
      .select("*")
      .eq("profile_id", userId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("habit_completions")
      .select("*")
      .eq("profile_id", userId)
      .eq("date", today),
    supabase
      .from("goals")
      .select("*")
      .eq("profile_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("daily_completions")
      .select("date, status")
      .eq("profile_id", userId)
      .gte("date", mondayStr)
      .lte("date", sundayStr),
  ]);

  const activeModules = (settingsRes.data?.active_modules as string[]) ?? [];

  // Module-specific queries — run in parallel, only if module is active
  const hasTraining = activeModules.includes("training");
  const hasNutrition = activeModules.includes("nutrition");
  const hasCalendar = activeModules.includes("calendar");

  const dayOfWeek = new Date().getDay(); // 0=Sun

  // Nearest goal deadline
  const nearestGoalRes = await supabase
    .from("goals")
    .select("target_date")
    .eq("profile_id", userId)
    .eq("status", "active")
    .not("target_date", "is", null)
    .order("target_date", { ascending: true })
    .limit(1);

  const [workoutRes, mealsRes, eventsRes, weightRes, macroTargetsRaw] =
    await Promise.all([
      hasTraining
        ? supabase
            .from("workouts")
            .select("day_label, focus")
            .eq("profile_id", userId)
            .eq("day_index", dayOfWeek)
            .single()
        : Promise.resolve({ data: null }),
      hasNutrition
        ? supabase
            .from("meals")
            .select("kcal, protein_g, carbs_g, fat_g")
            .eq("profile_id", userId)
            .eq("date", today)
        : Promise.resolve({ data: null }),
      hasCalendar
        ? supabase
            .from("calendar_events")
            .select("id, title, kind, starts_at")
            .eq("owner_id", userId)
            .gte("starts_at", `${today}T00:00:00`)
            .lte("starts_at", `${today}T23:59:59`)
            .order("starts_at", { ascending: true })
            .limit(3)
        : Promise.resolve({ data: null }),
      hasTraining
        ? supabase
            .from("body_metrics")
            .select("weight_kg")
            .eq("profile_id", userId)
            .order("measured_at", { ascending: false })
            .limit(1)
            .single()
        : Promise.resolve({ data: null }),
      hasNutrition
        ? Promise.resolve({
            protein_g: settingsRes.data?.protein_g ?? null,
            carbs_g: settingsRes.data?.carbs_g ?? null,
            fat_g: settingsRes.data?.fat_g ?? null,
          })
        : Promise.resolve(null),
    ]);

  // Aggregate today's meals
  let todayMacros: TodayMacros | null = null;
  if (hasNutrition && Array.isArray(mealsRes.data) && mealsRes.data.length > 0) {
    todayMacros = (mealsRes.data as Array<{ kcal: number; protein_g: number; carbs_g: number; fat_g: number }>).reduce(
      (acc, m) => ({
        kcal: acc.kcal + (m.kcal ?? 0),
        protein: acc.protein + (m.protein_g ?? 0),
        carbs: acc.carbs + (m.carbs_g ?? 0),
        fat: acc.fat + (m.fat_g ?? 0),
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }

  const macroTargets: MacroTargets | null =
    macroTargetsRaw && macroTargetsRaw.protein_g != null
      ? {
          protein_g: macroTargetsRaw.protein_g,
          carbs_g: macroTargetsRaw.carbs_g ?? 0,
          fat_g: macroTargetsRaw.fat_g ?? 0,
        }
      : null;

  // Build weekly progress
  const weeklyCompletionMap = new Map<string, DayStatus>();
  if (Array.isArray(weeklyRes.data)) {
    for (const row of weeklyRes.data as Array<{ date: string; status: string }>) {
      weeklyCompletionMap.set(row.date, row.status as DayStatus);
    }
  }

  const weeklyProgress: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, i);
    const dateStr = format(d, "yyyy-MM-dd");
    const isToday = dateStr === today;
    const isFuture = d > todayDate && !isToday;

    let status: DayStatus;
    if (isFuture) {
      status = "future";
    } else if (weeklyCompletionMap.has(dateStr)) {
      status = weeklyCompletionMap.get(dateStr)!;
    } else if (isToday) {
      status = "pending";
    } else {
      status = "missed";
    }

    return {
      date: dateStr,
      dayLabel: format(d, "EEEEEE", { locale: cs }),
      status,
    };
  });

  return {
    gamification: (gamificationRes.data as GamificationProfile) ?? null,
    coachTone: ((settingsRes.data?.coach_tone as CoachTone) ?? "friendly_mentor"),
    displayName: profileRes.data?.display_name ?? "uživateli",
    activeModules,
    checkin: (checkinRes.data as DailyCheckin) ?? null,
    habits: (habitsRes.data as DailyHabit[]) ?? [],
    completions: (completionsRes.data as HabitCompletion[]) ?? [],
    goals: (goalsRes.data as Goal[]) ?? [],
    todayWorkout: workoutRes.data
      ? { day_label: workoutRes.data.day_label, focus: workoutRes.data.focus ?? null }
      : null,
    todayMacros,
    macroTargets,
    todayEvents: (eventsRes.data as TodayEvent[]) ?? [],
    latestWeight: weightRes.data?.weight_kg ?? null,
    registeredAt: profileRes.data?.created_at ?? new Date().toISOString(),
    nearestGoalDeadline: nearestGoalRes.data?.[0]?.target_date ?? null,
    weeklyProgress,
  };
}
