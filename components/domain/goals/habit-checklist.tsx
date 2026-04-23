"use client";

import { useState } from "react";
import { HabitItem } from "@/components/domain/goals/habit-item";
import { showXPToast } from "@/components/domain/gamification/xp-toast";
import { AchievementUnlockDialog } from "@/components/domain/gamification/achievement-unlock-dialog";
import { toggleHabit } from "@/app/(app)/goals/habits/actions";
import { toast } from "sonner";
import type { DailyHabit, HabitCompletion } from "@/types/database";

interface HabitChecklistProps {
  habits: DailyHabit[];
  completions: HabitCompletion[];
  date: string;
}

interface UnlockedAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
}

export function HabitChecklist({
  habits,
  completions,
  date,
}: HabitChecklistProps) {
  const [unlockedAchievement, setUnlockedAchievement] =
    useState<UnlockedAchievement | null>(null);

  const completedIds = new Set(completions.map((c) => c.habit_id));

  async function handleToggle(habitId: string) {
    try {
      const result = await toggleHabit(habitId, date);

      if (result.error) {
        toast.error(result.error);
        throw new Error(result.error);
      }

      if (result.completed && result.xpAwarded) {
        showXPToast(result.xpAwarded, "Návyk splněn");
      }

      if (
        result.achievementsUnlocked &&
        result.achievementsUnlocked.length > 0
      ) {
        setUnlockedAchievement(result.achievementsUnlocked[0]);
      }
    } catch (err) {
      if (err instanceof Error && err.message) {
        // Already handled above
      } else {
        toast.error("Něco se pokazilo");
      }
      throw err;
    }
  }

  if (habits.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Zatím nemáš žádné návyky. Přidej si je k cílům!
      </p>
    );
  }

  const completedCount = habits.filter((h) => completedIds.has(h.id)).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Dnešní návyky</h3>
        <span className="text-xs text-muted-foreground font-mono">
          {completedCount}/{habits.length}
        </span>
      </div>

      <div className="space-y-1.5">
        {habits.map((habit) => (
          <HabitItem
            key={habit.id}
            id={habit.id}
            title={habit.title}
            xpValue={habit.xp_value}
            completed={completedIds.has(habit.id)}
            onToggle={handleToggle}
          />
        ))}
      </div>

      <AchievementUnlockDialog
        achievement={unlockedAchievement}
        onClose={() => setUnlockedAchievement(null)}
      />
    </div>
  );
}
