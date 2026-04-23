import type { SupabaseClient } from "@supabase/supabase-js";
import type { Achievement } from "@/types/gamification";
import { awardXP } from "@/lib/logic/xp";

type EventType =
  | "goal_created"
  | "goal_completed"
  | "habit_completed"
  | "checkin"
  | "streak_update"
  | "level_up"
  | "xp_earned";

const EVENT_CATEGORIES: Record<EventType, string[]> = {
  goal_created: ["milestone"],
  goal_completed: ["milestone"],
  habit_completed: ["consistency", "training", "nutrition"],
  checkin: ["consistency", "sleep"],
  streak_update: ["streak"],
  level_up: ["milestone"],
  xp_earned: ["milestone"],
};

interface UnlockedAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
}

export async function checkAndUnlockAchievements(
  supabase: SupabaseClient,
  profileId: string,
  eventType: EventType
): Promise<UnlockedAchievement[]> {
  // Get all achievements
  const { data: allAchievements, error: achError } = await supabase
    .from("achievements")
    .select("*");

  if (achError || !allAchievements) {
    return [];
  }

  // Get already unlocked achievements
  const { data: unlocked } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("profile_id", profileId);

  const unlockedIds = new Set((unlocked ?? []).map((u) => u.achievement_id));

  // Filter to relevant + not yet unlocked
  const relevantCategories = EVENT_CATEGORIES[eventType] ?? [];
  const candidates = (allAchievements as Achievement[]).filter(
    (a) => !unlockedIds.has(a.id) && relevantCategories.includes(a.category)
  );

  if (candidates.length === 0) {
    return [];
  }

  // Get current profile for evaluation
  const { data: profile } = await supabase
    .from("gamification_profiles")
    .select("*")
    .eq("profile_id", profileId)
    .single();

  if (!profile) {
    return [];
  }

  // Count goals
  const { count: goalCount } = await supabase
    .from("goals")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId);

  const { count: completedGoalCount } = await supabase
    .from("goals")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("status", "completed");

  const newlyUnlocked: UnlockedAchievement[] = [];

  for (const achievement of candidates) {
    const cond = achievement.condition_json as Record<string, number>;
    let met = false;

    if (cond.streak_threshold != null) {
      met = profile.current_streak >= cond.streak_threshold;
    } else if (cond.level_threshold != null) {
      met = profile.level >= cond.level_threshold;
    } else if (cond.xp_total != null) {
      met = profile.total_xp >= cond.xp_total;
    } else if (cond.goals_created != null) {
      met = (goalCount ?? 0) >= cond.goals_created;
    } else if (cond.goals_completed != null) {
      met = (completedGoalCount ?? 0) >= cond.goals_completed;
    } else if (cond.perfect_days != null) {
      met = profile.perfect_days >= cond.perfect_days;
    }

    if (met) {
      // Unlock achievement
      const { error: insertError } = await supabase
        .from("user_achievements")
        .insert({
          profile_id: profileId,
          achievement_id: achievement.id,
        });

      if (!insertError) {
        // Award XP reward
        if (achievement.xp_reward > 0) {
          await awardXP(
            supabase,
            profileId,
            achievement.xp_reward,
            `Úspěch: ${achievement.name}`,
            "achievement",
            achievement.id
          );
        }

        newlyUnlocked.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          xp_reward: achievement.xp_reward,
        });
      }
    }
  }

  return newlyUnlocked;
}
