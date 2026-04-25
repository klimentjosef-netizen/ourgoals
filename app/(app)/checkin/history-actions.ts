"use server";

import { createClient } from "@/lib/supabase/server";
import { DEV_MODE, MOCK_USER_ID } from "@/lib/dev/mock-user";
import { format, subDays } from "date-fns";
import type { DailyCheckin, SleepLog } from "@/types/database";

interface CheckinHistoryEntry {
  date: string;
  mood: number | null;
  energy: number | null;
  sleepHours: number | null;
  dayRating: number | null;
  stress: number | null;
}

function getMoodEmoji(mood: number | null): string {
  if (mood == null) return "—";
  if (mood >= 8) return "😄";
  if (mood >= 6) return "🙂";
  if (mood >= 4) return "😐";
  if (mood >= 2) return "😟";
  return "😢";
}

// getMoodEmoji is used internally and by components that import it
// Wrap in async for "use server" compatibility
export async function getMoodEmojiAsync(mood: number | null): Promise<string> {
  return getMoodEmoji(mood);
}

export async function getCheckinHistory(
  userId: string,
  days = 7
): Promise<CheckinHistoryEntry[]> {
  if (DEV_MODE) {
    // Return mock data
    const entries: CheckinHistoryEntry[] = [];
    for (let i = 1; i <= days; i++) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      entries.push({
        date,
        mood: Math.floor(Math.random() * 4) + 5,
        energy: Math.floor(Math.random() * 4) + 5,
        sleepHours: Math.round((6 + Math.random() * 2.5) * 10) / 10,
        dayRating: Math.floor(Math.random() * 4) + 5,
        stress: Math.floor(Math.random() * 5) + 2,
      });
    }
    return entries;
  }

  const supabase = await createClient();
  const fromDate = format(subDays(new Date(), days), "yyyy-MM-dd");

  const [checkinsRes, sleepRes] = await Promise.all([
    supabase
      .from("daily_checkins")
      .select("date, mood_1_10, energy_1_10, day_rating_1_10, stress_1_10")
      .eq("profile_id", userId)
      .gte("date", fromDate)
      .order("date", { ascending: false }),
    supabase
      .from("sleep_logs")
      .select("date, sleep_hours")
      .eq("profile_id", userId)
      .gte("date", fromDate),
  ]);

  const checkins = (checkinsRes.data ?? []) as Pick<
    DailyCheckin,
    "date" | "mood_1_10" | "energy_1_10" | "day_rating_1_10" | "stress_1_10"
  >[];
  const sleepLogs = (sleepRes.data ?? []) as Pick<SleepLog, "date" | "sleep_hours">[];

  const sleepMap = new Map(sleepLogs.map((s) => [s.date, s.sleep_hours]));

  return checkins.map((c) => ({
    date: c.date,
    mood: c.mood_1_10,
    energy: c.energy_1_10,
    sleepHours: sleepMap.get(c.date) ?? null,
    dayRating: c.day_rating_1_10,
    stress: c.stress_1_10,
  }));
}

export async function getCorrelationData(
  userId: string,
  days = 14
): Promise<{
  highSleepAvgEnergy: number | null;
  lowSleepAvgEnergy: number | null;
  highSleepAvgMood: number | null;
  lowSleepAvgMood: number | null;
  dataPoints: number;
}> {
  if (DEV_MODE) {
    return {
      highSleepAvgEnergy: 7.2,
      lowSleepAvgEnergy: 4.8,
      highSleepAvgMood: 7.5,
      lowSleepAvgMood: 5.1,
      dataPoints: 12,
    };
  }

  const supabase = await createClient();
  const fromDate = format(subDays(new Date(), days), "yyyy-MM-dd");

  const [checkinsRes, sleepRes] = await Promise.all([
    supabase
      .from("daily_checkins")
      .select("date, mood_1_10, energy_1_10")
      .eq("profile_id", userId)
      .gte("date", fromDate),
    supabase
      .from("sleep_logs")
      .select("date, sleep_hours")
      .eq("profile_id", userId)
      .gte("date", fromDate),
  ]);

  const checkins = (checkinsRes.data ?? []) as Pick<
    DailyCheckin,
    "date" | "mood_1_10" | "energy_1_10"
  >[];
  const sleepLogs = (sleepRes.data ?? []) as Pick<SleepLog, "date" | "sleep_hours">[];

  const sleepMap = new Map(sleepLogs.map((s) => [s.date, s.sleep_hours]));

  const highSleepEnergies: number[] = [];
  const lowSleepEnergies: number[] = [];
  const highSleepMoods: number[] = [];
  const lowSleepMoods: number[] = [];

  for (const c of checkins) {
    const sleep = sleepMap.get(c.date);
    if (sleep == null) continue;

    if (sleep >= 7) {
      if (c.energy_1_10 != null) highSleepEnergies.push(c.energy_1_10);
      if (c.mood_1_10 != null) highSleepMoods.push(c.mood_1_10);
    } else if (sleep < 6) {
      if (c.energy_1_10 != null) lowSleepEnergies.push(c.energy_1_10);
      if (c.mood_1_10 != null) lowSleepMoods.push(c.mood_1_10);
    }
  }

  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;

  return {
    highSleepAvgEnergy: avg(highSleepEnergies),
    lowSleepAvgEnergy: avg(lowSleepEnergies),
    highSleepAvgMood: avg(highSleepMoods),
    lowSleepAvgMood: avg(lowSleepMoods),
    dataPoints: checkins.length,
  };
}

export async function getYesterdayCheckin(
  userId: string
): Promise<CheckinHistoryEntry | null> {
  if (DEV_MODE) {
    return {
      date: format(subDays(new Date(), 1), "yyyy-MM-dd"),
      mood: 7,
      energy: 8,
      sleepHours: 7.5,
      dayRating: 7,
      stress: 3,
    };
  }

  const supabase = await createClient();
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

  const [checkinRes, sleepRes] = await Promise.all([
    supabase
      .from("daily_checkins")
      .select("date, mood_1_10, energy_1_10, day_rating_1_10, stress_1_10")
      .eq("profile_id", userId)
      .eq("date", yesterday)
      .single(),
    supabase
      .from("sleep_logs")
      .select("date, sleep_hours")
      .eq("profile_id", userId)
      .eq("date", yesterday)
      .single(),
  ]);

  if (!checkinRes.data) return null;

  const c = checkinRes.data as Pick<
    DailyCheckin,
    "date" | "mood_1_10" | "energy_1_10" | "day_rating_1_10" | "stress_1_10"
  >;

  return {
    date: c.date,
    mood: c.mood_1_10,
    energy: c.energy_1_10,
    sleepHours: (sleepRes.data as Pick<SleepLog, "date" | "sleep_hours"> | null)?.sleep_hours ?? null,
    dayRating: c.day_rating_1_10,
    stress: c.stress_1_10,
  };
}
