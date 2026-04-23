"use server";

import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { DEV_MODE, MOCK_ACTIVE_MODULES } from "@/lib/dev/mock-user";
import type {
  GamificationProfile,
  UserSettings,
  DailyCheckin,
  DailyHabit,
  HabitCompletion,
  Goal,
} from "@/types/database";
import type { CoachTone } from "@/types/gamification";

interface DashboardData {
  gamification: GamificationProfile | null;
  coachTone: CoachTone;
  displayName: string;
  activeModules: string[];
  checkin: DailyCheckin | null;
  habits: DailyHabit[];
  completions: HabitCompletion[];
  goals: Goal[];
}

export async function getDashboardData(
  userId: string
): Promise<DashboardData> {
  if (DEV_MODE) {
    return {
      gamification: null,
      coachTone: "friendly_mentor",
      displayName: "Dev User",
      activeModules: MOCK_ACTIVE_MODULES,
      checkin: null,
      habits: [],
      completions: [],
      goals: [],
    };
  }

  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  // Run all queries in parallel
  const [
    gamificationRes,
    settingsRes,
    profileRes,
    checkinRes,
    habitsRes,
    completionsRes,
    goalsRes,
  ] = await Promise.all([
    supabase
      .from("gamification_profiles")
      .select("*")
      .eq("profile_id", userId)
      .single(),
    supabase
      .from("user_settings")
      .select("active_modules, coach_tone")
      .eq("profile_id", userId)
      .single(),
    supabase
      .from("profiles")
      .select("display_name")
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
  ]);

  return {
    gamification: (gamificationRes.data as GamificationProfile) ?? null,
    coachTone: ((settingsRes.data?.coach_tone as CoachTone) ?? "friendly_mentor"),
    displayName: profileRes.data?.display_name ?? "uživateli",
    activeModules: (settingsRes.data?.active_modules as string[]) ?? [],
    checkin: (checkinRes.data as DailyCheckin) ?? null,
    habits: (habitsRes.data as DailyHabit[]) ?? [],
    completions: (completionsRes.data as HabitCompletion[]) ?? [],
    goals: (goalsRes.data as Goal[]) ?? [],
  };
}
