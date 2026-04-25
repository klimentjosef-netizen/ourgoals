"use server";

import { createClient } from "@/lib/supabase/server";
import { DEV_MODE } from "@/lib/dev/mock-user";
import { format, subDays } from "date-fns";

export interface ProfileStats {
  totalWorkouts: number;
  totalMeals: number;
  totalCheckins: number;
  totalXP: number;
  avgAdherence: number; // percentage of ok+perfect days
}

export interface HeatmapDay {
  date: string;
  status: "none" | "ok" | "perfect";
  xp: number;
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  if (DEV_MODE) {
    return {
      totalWorkouts: 47,
      totalMeals: 213,
      totalCheckins: 89,
      totalXP: 3450,
      avgAdherence: 72,
    };
  }

  const supabase = await createClient();

  const [workoutsRes, mealsRes, checkinsRes, gamRes] = await Promise.all([
    supabase
      .from("workout_sessions")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", userId),
    supabase
      .from("meals")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", userId),
    supabase
      .from("daily_checkins")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", userId),
    supabase
      .from("gamification_profiles")
      .select("total_xp, perfect_days, ok_days, missed_days")
      .eq("profile_id", userId)
      .single(),
  ]);

  const gam = gamRes.data;
  const totalDays = (gam?.perfect_days ?? 0) + (gam?.ok_days ?? 0) + (gam?.missed_days ?? 0);
  const adherentDays = (gam?.perfect_days ?? 0) + (gam?.ok_days ?? 0);
  const avgAdherence = totalDays > 0 ? Math.round((adherentDays / totalDays) * 100) : 0;

  return {
    totalWorkouts: workoutsRes.count ?? 0,
    totalMeals: mealsRes.count ?? 0,
    totalCheckins: checkinsRes.count ?? 0,
    totalXP: gam?.total_xp ?? 0,
    avgAdherence,
  };
}

export async function getActivityHeatmapData(
  userId: string,
  days = 91
): Promise<HeatmapDay[]> {
  if (DEV_MODE) {
    const result: HeatmapDay[] = [];
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd");
      const rand = Math.random();
      let status: "none" | "ok" | "perfect" = "none";
      let xp = 0;
      if (rand > 0.3) {
        status = rand > 0.6 ? "perfect" : "ok";
        xp = status === "perfect" ? Math.floor(Math.random() * 80) + 40 : Math.floor(Math.random() * 40) + 10;
      }
      result.push({ date, status, xp });
    }
    return result;
  }

  const supabase = await createClient();
  const fromDate = format(subDays(new Date(), days), "yyyy-MM-dd");

  const { data } = await supabase
    .from("daily_completion")
    .select("date, status, xp_earned")
    .eq("profile_id", userId)
    .gte("date", fromDate)
    .order("date", { ascending: true });

  if (!data) return [];

  return data.map((d: { date: string; status: string; xp_earned: number }) => ({
    date: d.date,
    status: (d.status === "perfect" ? "perfect" : d.status === "ok" ? "ok" : "none") as HeatmapDay["status"],
    xp: d.xp_earned ?? 0,
  }));
}

export async function getAchievementProgress(
  userId: string
): Promise<{
  currentStreak: number;
  totalXP: number;
  perfectDays: number;
  totalWorkouts: number;
  totalMeals: number;
  goalsCompleted: number;
}> {
  if (DEV_MODE) {
    return {
      currentStreak: 5,
      totalXP: 3450,
      perfectDays: 28,
      totalWorkouts: 47,
      totalMeals: 213,
      goalsCompleted: 3,
    };
  }

  const supabase = await createClient();

  const [gamRes, workoutsRes, mealsRes, goalsRes] = await Promise.all([
    supabase
      .from("gamification_profiles")
      .select("current_streak, total_xp, perfect_days")
      .eq("profile_id", userId)
      .single(),
    supabase
      .from("workout_sessions")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", userId),
    supabase
      .from("meals")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", userId),
    supabase
      .from("goals")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", userId)
      .eq("status", "completed"),
  ]);

  const gam = gamRes.data;

  return {
    currentStreak: gam?.current_streak ?? 0,
    totalXP: gam?.total_xp ?? 0,
    perfectDays: gam?.perfect_days ?? 0,
    totalWorkouts: workoutsRes.count ?? 0,
    totalMeals: mealsRes.count ?? 0,
    goalsCompleted: goalsRes.count ?? 0,
  };
}
