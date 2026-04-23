import type { SupabaseClient } from "@supabase/supabase-js";

export type DayStatus = "perfect" | "ok" | "missed";

export function evaluateDayStatus(data: {
  morningCheckin: boolean;
  eveningCheckin: boolean;
  habitsCompleted: number;
  habitsTotal: number;
}): DayStatus {
  const { morningCheckin, eveningCheckin, habitsCompleted, habitsTotal } = data;

  const allHabits = habitsTotal > 0 && habitsCompleted >= habitsTotal;
  const bothCheckins = morningCheckin && eveningCheckin;

  // Perfect: all habits done + both check-ins
  if (allHabits && bothCheckins) {
    return "perfect";
  }

  // Ok: at least 1 check-in OR >50% habits
  const hasCheckin = morningCheckin || eveningCheckin;
  const halfHabits = habitsTotal > 0 && habitsCompleted > habitsTotal * 0.5;

  if (hasCheckin || halfHabits) {
    return "ok";
  }

  // Missed: nothing meaningful done
  return "missed";
}

interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

export async function recalculateStreak(
  supabase: SupabaseClient,
  profileId: string
): Promise<StreakResult> {
  // Get daily completions ordered by date DESC
  const { data: completions, error } = await supabase
    .from("daily_completion")
    .select("date, status")
    .eq("profile_id", profileId)
    .order("date", { ascending: false })
    .limit(365);

  if (error) {
    throw new Error(`Chyba při načítání streak: ${error.message}`);
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let streakBroken = false;

  if (completions && completions.length > 0) {
    for (const day of completions) {
      const status = day.status as string;

      // Today's 'pending' does NOT break streak
      if (status === "pending") {
        continue;
      }

      if (status === "ok" || status === "perfect") {
        tempStreak++;
        if (!streakBroken) {
          currentStreak = tempStreak;
        }
      } else {
        // streak broken
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 0;
        streakBroken = true;
      }
    }
    // Final check for longest
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Update profile
  const { error: updateError } = await supabase
    .from("gamification_profiles")
    .update({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      updated_at: new Date().toISOString(),
    })
    .eq("profile_id", profileId);

  if (updateError) {
    throw new Error(`Chyba při aktualizaci streak: ${updateError.message}`);
  }

  return { currentStreak, longestStreak };
}
