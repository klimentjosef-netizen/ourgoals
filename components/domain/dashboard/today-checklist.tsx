"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Circle, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { XP_VALUES } from "@/types/gamification";
import type { DailyHabit, HabitCompletion } from "@/types/database";
import { format } from "date-fns";

interface TodayChecklistProps {
  morningDone: boolean;
  eveningDone: boolean;
  habits: DailyHabit[];
  completions: HabitCompletion[];
  profileId: string;
}

export function TodayChecklist({
  morningDone,
  eveningDone,
  habits,
  completions,
  profileId,
}: TodayChecklistProps) {
  const router = useRouter();

  const completedHabitIds = new Set(completions.map((c) => c.habit_id));
  const totalTasks = 2 + habits.length; // morning + evening + habits
  const doneTasks =
    (morningDone ? 1 : 0) +
    (eveningDone ? 1 : 0) +
    completions.length;

  async function toggleHabit(habitId: string, completed: boolean) {
    const supabase = createClient();
    const today = format(new Date(), "yyyy-MM-dd");

    if (completed) {
      // Mark as complete
      await supabase.from("habit_completions").insert({
        profile_id: profileId,
        habit_id: habitId,
        date: today,
      });

      // Award XP
      await supabase.from("xp_ledger").insert({
        profile_id: profileId,
        amount: XP_VALUES.HABIT_COMPLETED,
        reason: "habit_completed",
        source_type: "habit",
        source_id: habitId,
      });

      // Update total XP
      const { data: profile } = await supabase
        .from("gamification_profiles")
        .select("total_xp")
        .eq("profile_id", profileId)
        .single();

      if (profile) {
        await supabase
          .from("gamification_profiles")
          .update({ total_xp: profile.total_xp + XP_VALUES.HABIT_COMPLETED })
          .eq("profile_id", profileId);
      }

      toast.success(`+${XP_VALUES.HABIT_COMPLETED} XP`, {
        description: "Návyk splněn!",
      });
    } else {
      // Remove completion
      await supabase
        .from("habit_completions")
        .delete()
        .eq("profile_id", profileId)
        .eq("habit_id", habitId)
        .eq("date", today);
    }

    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Dnešní úkoly</CardTitle>
          <Badge variant={doneTasks === totalTasks ? "default" : "secondary"}>
            {doneTasks}/{totalTasks} splněno
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Check-ins */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {morningDone ? (
              <CheckCircle2 size={16} className="text-green-500" />
            ) : (
              <Circle size={16} className="text-muted-foreground" />
            )}
            <span
              className={`text-sm ${
                morningDone ? "line-through text-muted-foreground" : ""
              }`}
            >
              Ranní check-in
            </span>
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Zap size={10} />
            {XP_VALUES.MORNING_CHECKIN} XP
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {eveningDone ? (
              <CheckCircle2 size={16} className="text-green-500" />
            ) : (
              <Circle size={16} className="text-muted-foreground" />
            )}
            <span
              className={`text-sm ${
                eveningDone ? "line-through text-muted-foreground" : ""
              }`}
            >
              Večerní check-in
            </span>
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Zap size={10} />
            {XP_VALUES.EVENING_CHECKIN} XP
          </span>
        </div>

        {habits.length > 0 && <Separator />}

        {/* Habits */}
        {habits.map((habit) => {
          const isDone = completedHabitIds.has(habit.id);
          return (
            <div
              key={habit.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isDone}
                  onCheckedChange={(checked) =>
                    toggleHabit(habit.id, !!checked)
                  }
                />
                <Label
                  className={`text-sm cursor-pointer ${
                    isDone ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {habit.title}
                </Label>
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap size={10} />
                {habit.xp_value} XP
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
