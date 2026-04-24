"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { XP_VALUES } from "@/types/gamification";
import { format } from "date-fns";
import { DEV_MODE, MOCK_USER_ID } from "@/lib/dev/mock-user";

interface CheckinResult {
  error?: string;
  xpAwarded?: number;
  streak?: number;
  achievementsUnlocked?: string[];
}

function getToday(): string {
  return format(new Date(), "yyyy-MM-dd");
}

async function getCurrentUserId() {
  if (DEV_MODE) {
    return MOCK_USER_ID;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id;
}

async function awardXP(
  profileId: string,
  amount: number,
  reason: string,
  sourceType?: string,
  sourceId?: string
) {
  const supabase = await createClient();

  // Insert ledger entry
  await supabase.from("xp_ledger").insert({
    profile_id: profileId,
    amount,
    reason,
    source_type: sourceType ?? null,
    source_id: sourceId ?? null,
  });

  // Update total XP in gamification_profiles
  const { data: profile } = await supabase
    .from("gamification_profiles")
    .select("total_xp, level, title")
    .eq("profile_id", profileId)
    .single();

  if (profile) {
    const newXP = profile.total_xp + amount;
    // Recalculate level
    const { getLevelForXP } = await import("@/types/gamification");
    const newLevel = getLevelForXP(newXP);

    await supabase
      .from("gamification_profiles")
      .update({
        total_xp: newXP,
        level: newLevel.level,
        title: newLevel.title,
      })
      .eq("profile_id", profileId);
  }

  return amount;
}

async function checkFirstCheckinAchievement(profileId: string): Promise<string[]> {
  const supabase = await createClient();
  const unlocked: string[] = [];

  // Check if first_checkin achievement exists and is not yet unlocked
  const { data: achievement } = await supabase
    .from("achievements")
    .select("id, name")
    .eq("key", "first_checkin")
    .single();

  if (!achievement) return unlocked;

  const { data: existing } = await supabase
    .from("user_achievements")
    .select("id")
    .eq("profile_id", profileId)
    .eq("achievement_id", achievement.id)
    .single();

  if (!existing) {
    await supabase.from("user_achievements").insert({
      profile_id: profileId,
      achievement_id: achievement.id,
    });

    // Award achievement XP if any
    const { data: achDetail } = await supabase
      .from("achievements")
      .select("xp_reward")
      .eq("id", achievement.id)
      .single();

    if (achDetail?.xp_reward) {
      await awardXP(profileId, achDetail.xp_reward, "achievement_unlocked", "achievement", achievement.id);
    }

    unlocked.push(achievement.name);
  }

  return unlocked;
}

export async function saveMorningCheckin(
  formData: FormData
): Promise<CheckinResult> {
  const profileId = await getCurrentUserId();
  if (!profileId) return { error: "Nejsi přihlášen" };

  const today = getToday();

  const mood = Number(formData.get("mood")) || null;
  const energy = Number(formData.get("energy")) || null;
  const weight = formData.get("weight") ? Number(formData.get("weight")) : null;
  const plan = (formData.get("plan") as string) || null;

  // Sleep data
  const bedtime = (formData.get("bedtime") as string) || null;
  const wakeTime = (formData.get("wake_time") as string) || null;
  const sleepQuality = Number(formData.get("sleep_quality")) || null;
  const wakeCount = formData.get("wake_count") ? Number(formData.get("wake_count")) : null;

  // Calculate sleep hours
  let sleepHours: number | null = null;
  if (bedtime && wakeTime) {
    const [bh, bm] = bedtime.split(":").map(Number);
    const [wh, wm] = wakeTime.split(":").map(Number);
    let bedMin = bh * 60 + bm;
    let wakeMin = wh * 60 + wm;
    if (wakeMin <= bedMin) wakeMin += 24 * 60; // went past midnight
    sleepHours = Math.round(((wakeMin - bedMin) / 60) * 10) / 10;
  }

  const supabase = await createClient();

  // Upsert daily_checkins
  await supabase.from("daily_checkins").upsert(
    {
      profile_id: profileId,
      date: today,
      morning_ritual_done: true,
      mood_1_10: mood,
      energy_1_10: energy,
      notes: plan,
    },
    { onConflict: "profile_id,date" }
  );

  // Upsert sleep_logs
  if (bedtime || wakeTime || sleepQuality) {
    await supabase.from("sleep_logs").upsert(
      {
        profile_id: profileId,
        date: today,
        bedtime,
        wake_time: wakeTime,
        quality_1_10: sleepQuality,
        wake_count: wakeCount,
        sleep_hours: sleepHours,
      },
      { onConflict: "profile_id,date" }
    );
  }

  // Award XP
  const xpAwarded = await awardXP(
    profileId,
    XP_VALUES.MORNING_CHECKIN,
    "morning_checkin",
    "checkin",
    today
  );

  // Also award sleep XP if logged
  if (sleepHours != null) {
    await awardXP(profileId, XP_VALUES.SLEEP_LOGGED, "sleep_logged", "sleep", today);
  }

  // Weight XP
  if (weight != null) {
    await awardXP(profileId, XP_VALUES.WEIGHT_LOGGED, "weight_logged", "weight", today);
  }

  // Check achievements
  const achievementsUnlocked = await checkFirstCheckinAchievement(profileId);

  // Update daily_completion
  await supabase.from("daily_completion").upsert(
    {
      profile_id: profileId,
      date: today,
      morning_checkin: true,
    },
    { onConflict: "profile_id,date" }
  );

  revalidatePath("/checkin");
  revalidatePath("/dashboard");

  let totalXP = xpAwarded;
  if (sleepHours != null) totalXP += XP_VALUES.SLEEP_LOGGED;
  if (weight != null) totalXP += XP_VALUES.WEIGHT_LOGGED;

  return { xpAwarded: totalXP, achievementsUnlocked };
}

export async function saveEveningCheckin(
  formData: FormData
): Promise<CheckinResult> {
  const profileId = await getCurrentUserId();
  if (!profileId) return { error: "Nejsi přihlášen" };

  const today = getToday();

  const dayRating = Number(formData.get("day_rating")) || null;
  const mood = Number(formData.get("mood")) || null;
  const stress = Number(formData.get("stress")) || null;
  const bestThing = (formData.get("best_thing") as string) || null;
  const worstThing = (formData.get("worst_thing") as string) || null;
  const tomorrowRisk = (formData.get("tomorrow_risk") as string) || null;
  const caffeine = formData.get("caffeine") ? Number(formData.get("caffeine")) : null;
  const alcohol = formData.get("alcohol") ? Number(formData.get("alcohol")) : null;
  const screenTime = formData.get("screen_time") ? Number(formData.get("screen_time")) : null;

  const supabase = await createClient();

  // Upsert daily_checkins (merge with morning data)
  await supabase.from("daily_checkins").upsert(
    {
      profile_id: profileId,
      date: today,
      evening_ritual_done: true,
      day_rating_1_10: dayRating,
      stress_1_10: stress,
      best_thing: bestThing,
      worst_thing: worstThing,
      tomorrow_risk: tomorrowRisk,
      caffeine_drinks: caffeine,
      alcohol_drinks: alcohol,
      screen_time_min: screenTime,
      // Also update mood if evening mood differs
      mood_1_10: mood,
    },
    { onConflict: "profile_id,date" }
  );

  // Award XP
  const xpAwarded = await awardXP(
    profileId,
    XP_VALUES.EVENING_CHECKIN,
    "evening_checkin",
    "checkin",
    today
  );

  // Evaluate day: check habits completed
  const { data: habits } = await supabase
    .from("daily_habits")
    .select("id")
    .eq("profile_id", profileId)
    .eq("is_active", true);

  const { data: completions } = await supabase
    .from("habit_completions")
    .select("id")
    .eq("profile_id", profileId)
    .eq("date", today);

  const totalHabits = habits?.length ?? 0;
  const completedHabits = completions?.length ?? 0;

  // Get checkin status
  const { data: checkin } = await supabase
    .from("daily_checkins")
    .select("morning_ritual_done, evening_ritual_done")
    .eq("profile_id", profileId)
    .eq("date", today)
    .single();

  const morningDone = checkin?.morning_ritual_done ?? false;
  const eveningDone = true; // we just set it

  // Determine day status
  let dayStatus: "perfect" | "ok" | "missed" = "missed";
  const allHabitsDone = totalHabits === 0 || completedHabits >= totalHabits;
  if (morningDone && eveningDone && allHabitsDone) {
    dayStatus = "perfect";
  } else if (morningDone || eveningDone || completedHabits > 0) {
    dayStatus = "ok";
  }

  // Calculate total day XP
  const habitXP = completedHabits * XP_VALUES.HABIT_COMPLETED;
  const checkinXP = (morningDone ? XP_VALUES.MORNING_CHECKIN : 0) + XP_VALUES.EVENING_CHECKIN;
  const dayTotalXP = habitXP + checkinXP;

  // Update daily_completion
  await supabase.from("daily_completion").upsert(
    {
      profile_id: profileId,
      date: today,
      evening_checkin: true,
      xp_earned: dayTotalXP,
      status: dayStatus,
    },
    { onConflict: "profile_id,date" }
  );

  // Update gamification profile streak & day counts
  const { data: gamProfile } = await supabase
    .from("gamification_profiles")
    .select("current_streak, longest_streak, perfect_days, ok_days, missed_days")
    .eq("profile_id", profileId)
    .single();

  if (gamProfile) {
    const newStreak =
      dayStatus === "missed" ? 0 : gamProfile.current_streak + 1;
    const longestStreak = Math.max(newStreak, gamProfile.longest_streak);

    await supabase
      .from("gamification_profiles")
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        perfect_days:
          gamProfile.perfect_days + (dayStatus === "perfect" ? 1 : 0),
        ok_days: gamProfile.ok_days + (dayStatus === "ok" ? 1 : 0),
        missed_days:
          gamProfile.missed_days + (dayStatus === "missed" ? 1 : 0),
      })
      .eq("profile_id", profileId);

    // Perfect day bonus
    if (dayStatus === "perfect") {
      await awardXP(profileId, dayTotalXP, "perfect_day_bonus", "bonus", today);
    }

    // Check streak achievements
    const achievementsUnlocked = await checkStreakAchievements(
      profileId,
      newStreak
    );

    revalidatePath("/checkin");
    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return {
      xpAwarded: xpAwarded + (dayStatus === "perfect" ? dayTotalXP : 0),
      streak: newStreak,
      achievementsUnlocked,
    };
  }

  revalidatePath("/checkin");
  revalidatePath("/dashboard");

  return { xpAwarded };
}

async function checkStreakAchievements(
  profileId: string,
  streak: number
): Promise<string[]> {
  const supabase = await createClient();
  const unlocked: string[] = [];

  // Check for streak-based achievements
  const streakMilestones = [
    { key: "streak_3", threshold: 3 },
    { key: "streak_7", threshold: 7 },
    { key: "streak_14", threshold: 14 },
    { key: "streak_30", threshold: 30 },
  ];

  for (const milestone of streakMilestones) {
    if (streak < milestone.threshold) continue;

    const { data: achievement } = await supabase
      .from("achievements")
      .select("id, name, xp_reward")
      .eq("key", milestone.key)
      .single();

    if (!achievement) continue;

    const { data: existing } = await supabase
      .from("user_achievements")
      .select("id")
      .eq("profile_id", profileId)
      .eq("achievement_id", achievement.id)
      .single();

    if (!existing) {
      await supabase.from("user_achievements").insert({
        profile_id: profileId,
        achievement_id: achievement.id,
      });

      if (achievement.xp_reward) {
        await awardXP(
          profileId,
          achievement.xp_reward,
          "achievement_unlocked",
          "achievement",
          achievement.id
        );
      }

      unlocked.push(achievement.name);
    }
  }

  return unlocked;
}
