"use client";

import { useState } from "react";
import { HabitItem } from "@/components/domain/goals/habit-item";
import { showXPToast } from "@/components/domain/gamification/xp-toast";
import { AchievementUnlockDialog } from "@/components/domain/gamification/achievement-unlock-dialog";
import { toggleHabit } from "@/app/(app)/goals/habits/actions";
import { toast } from "sonner";
import type { DailyHabit, HabitCompletion } from "@/types/database";

interface WeeklyHabitStat {
  count: number;
  days: string[];
}

interface HabitChecklistProps {
  habits: DailyHabit[];
  completions: HabitCompletion[];
  date: string;
  weeklyStats?: Record<string, WeeklyHabitStat>;
  weekStart?: string;
}

interface UnlockedAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
}

const DAY_LABELS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

function WeekDots({
  stat,
  weekStart,
}: {
  stat: WeeklyHabitStat;
  weekStart: string;
}) {
  const startDate = new Date(weekStart);

  return (
    <div className="flex items-center gap-1 mt-1">
      {DAY_LABELS.map((label, i) => {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + i);
        const dayStr = dayDate.toISOString().split("T")[0];
        const completed = stat.days.includes(dayStr);

        return (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span className="text-[8px] text-muted-foreground leading-none">
              {label}
            </span>
            <div
              className={`w-2 h-2 rounded-full ${
                completed
                  ? "bg-primary"
                  : "bg-muted border border-border"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

export function HabitChecklist({
  habits,
  completions,
  date,
  weeklyStats,
  weekStart,
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
        {habits.map((habit) => {
          const stat = weeklyStats?.[habit.id];

          return (
            <div key={habit.id} className="space-y-1">
              <HabitItem
                id={habit.id}
                title={habit.title}
                xpValue={habit.xp_value}
                completed={completedIds.has(habit.id)}
                onToggle={handleToggle}
              />
              {/* Feature 5: Týdenní stats */}
              {stat && weekStart && (
                <div className="flex items-center justify-between pl-9 pr-1">
                  <WeekDots stat={stat} weekStart={weekStart} />
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Tento týden: {stat.count}/7
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AchievementUnlockDialog
        achievement={unlockedAchievement}
        onClose={() => setUnlockedAchievement(null)}
      />
    </div>
  );
}
