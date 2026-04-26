"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { format, startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { DEV_MODE, MOCK_USER_ID } from "@/lib/dev/mock-user";
import { XP_VALUES } from "@/types/gamification";

async function getUserId() {
  if (DEV_MODE) return MOCK_USER_ID;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Nepřihlášen");
  return user.id;
}

export interface WeeklyReviewData {
  // Auto-generated stats
  weekStart: string;
  weekEnd: string;
  avgMood: number | null;
  avgEnergy: number | null;
  avgSleepHours: number | null;
  avgStress: number | null;
  trainingSessions: number;
  deepWorkMinutes: number;
  habitsCompleted: number;
  habitsTotal: number;
  goalsProgress: { title: string; change: string }[];
  xpEarned: number;
  streakAtEnd: number;
  // User-filled
  wins: string | null;
  struggles: string | null;
  nextWeekFocus: string | null;
  isCompleted: boolean;
}

export async function getWeeklyReviewData(userId: string): Promise<WeeklyReviewData> {
  const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 });
  const startStr = format(lastWeekStart, "yyyy-MM-dd");
  const endStr = format(lastWeekEnd, "yyyy-MM-dd");

  if (DEV_MODE) {
    return {
      weekStart: startStr,
      weekEnd: endStr,
      avgMood: 7.2,
      avgEnergy: 6.8,
      avgSleepHours: 7.5,
      avgStress: 4.1,
      trainingSessions: 4,
      deepWorkMinutes: 320,
      habitsCompleted: 28,
      habitsTotal: 35,
      goalsProgress: [
        { title: "Zhubnout", change: "-0.5 kg" },
        { title: "Cvičit pravidelně", change: "4/5 dní" },
      ],
      xpEarned: 450,
      streakAtEnd: 12,
      wins: null,
      struggles: null,
      nextWeekFocus: null,
      isCompleted: false,
    };
  }

  const supabase = await createClient();

  // Check if review already exists
  const { data: existingReview } = await supabase
    .from("weekly_reviews")
    .select("*")
    .eq("profile_id", userId)
    .eq("week_start", startStr)
    .single();

  // Fetch stats in parallel
  const [checkinRes, sleepRes, sessionRes, dwRes, habitsRes, completionsRes, xpRes, gamRes] = await Promise.all([
    supabase
      .from("daily_checkins")
      .select("mood_1_10, energy_1_10, stress_1_10")
      .eq("profile_id", userId)
      .gte("date", startStr)
      .lte("date", endStr),
    supabase
      .from("sleep_logs")
      .select("sleep_hours")
      .eq("profile_id", userId)
      .gte("date", startStr)
      .lte("date", endStr),
    supabase
      .from("workout_sessions")
      .select("id")
      .eq("profile_id", userId)
      .gte("date", startStr)
      .lte("date", endStr)
      .not("completed_at", "is", null),
    supabase
      .from("deep_work_sessions")
      .select("actual_minutes")
      .eq("profile_id", userId)
      .gte("date", startStr)
      .lte("date", endStr)
      .not("ended_at", "is", null),
    supabase
      .from("daily_habits")
      .select("id")
      .eq("profile_id", userId)
      .eq("is_active", true),
    supabase
      .from("habit_completions")
      .select("id")
      .eq("profile_id", userId)
      .gte("date", startStr)
      .lte("date", endStr),
    supabase
      .from("xp_ledger")
      .select("amount")
      .eq("profile_id", userId)
      .gte("earned_at", `${startStr}T00:00:00`)
      .lte("earned_at", `${endStr}T23:59:59`),
    supabase
      .from("gamification_profiles")
      .select("current_streak")
      .eq("profile_id", userId)
      .single(),
  ]);

  const checkins = checkinRes.data ?? [];
  const sleepLogs = sleepRes.data ?? [];

  const avg = (arr: (number | null | undefined)[]): number | null => {
    const valid = arr.filter((v): v is number => v != null);
    return valid.length > 0 ? Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10 : null;
  };

  const totalHabitsPerWeek = (habitsRes.data?.length ?? 0) * 7;
  const dwMinutes = (dwRes.data ?? []).reduce((sum, s) => sum + ((s as { actual_minutes: number | null }).actual_minutes ?? 0), 0);
  const totalXP = (xpRes.data ?? []).reduce((sum, e) => sum + ((e as { amount: number }).amount ?? 0), 0);

  return {
    weekStart: startStr,
    weekEnd: endStr,
    avgMood: avg(checkins.map((c) => (c as { mood_1_10: number | null }).mood_1_10)),
    avgEnergy: avg(checkins.map((c) => (c as { energy_1_10: number | null }).energy_1_10)),
    avgSleepHours: avg(sleepLogs.map((l) => (l as { sleep_hours: number | null }).sleep_hours)),
    avgStress: avg(checkins.map((c) => (c as { stress_1_10: number | null }).stress_1_10)),
    trainingSessions: sessionRes.data?.length ?? 0,
    deepWorkMinutes: dwMinutes,
    habitsCompleted: completionsRes.data?.length ?? 0,
    habitsTotal: totalHabitsPerWeek,
    goalsProgress: [], // TODO: goal progress tracking
    xpEarned: totalXP,
    streakAtEnd: gamRes.data?.current_streak ?? 0,
    wins: existingReview?.wins ?? null,
    struggles: existingReview?.struggles ?? null,
    nextWeekFocus: existingReview?.next_week_focus ?? null,
    isCompleted: !!existingReview,
  };
}

export async function saveWeeklyReview(formData: FormData): Promise<{ xpAwarded?: number; error?: string }> {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };

  const supabase = await createClient();
  const weekStart = formData.get("week_start") as string;
  const wins = (formData.get("wins") as string) || null;
  const struggles = (formData.get("struggles") as string) || null;
  const nextWeekFocus = (formData.get("next_week_focus") as string) || null;

  // Get auto stats for storage
  const reviewData = await getWeeklyReviewData(userId);

  await supabase.from("weekly_reviews").upsert(
    {
      profile_id: userId,
      week_start: weekStart,
      wins,
      struggles,
      next_week_focus: nextWeekFocus,
      avg_mood: reviewData.avgMood,
      avg_energy: reviewData.avgEnergy,
      avg_sleep_hours: reviewData.avgSleepHours,
      training_sessions_count: reviewData.trainingSessions,
      deep_work_minutes: reviewData.deepWorkMinutes,
      habits_completed: reviewData.habitsCompleted,
      habits_total: reviewData.habitsTotal,
      xp_earned: reviewData.xpEarned,
    },
    { onConflict: "profile_id,week_start" }
  );

  // Award XP for completing review
  const { getLevelForXP } = await import("@/types/gamification");
  const { data: gam } = await supabase
    .from("gamification_profiles")
    .select("total_xp")
    .eq("profile_id", userId)
    .single();

  if (gam) {
    const newXP = gam.total_xp + XP_VALUES.WEEKLY_REVIEW;
    const newLevel = getLevelForXP(newXP);

    await supabase.from("xp_ledger").insert({
      profile_id: userId,
      amount: XP_VALUES.WEEKLY_REVIEW,
      reason: "Týdenní review",
      source_type: "review",
    });

    await supabase
      .from("gamification_profiles")
      .update({ total_xp: newXP, level: newLevel.level, title: newLevel.title })
      .eq("profile_id", userId);
  }

  revalidatePath("/review");
  revalidatePath("/dashboard");
  return { xpAwarded: XP_VALUES.WEEKLY_REVIEW };
}
