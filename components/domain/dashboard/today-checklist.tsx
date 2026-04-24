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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleHabit as toggleHabitAction } from "@/app/(app)/goals/habits/actions";
import { XP_VALUES } from "@/types/gamification";
import type { DailyHabit, HabitCompletion } from "@/types/database";
import { format } from "date-fns";
import Link from "next/link";

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
    const today = format(new Date(), "yyyy-MM-dd");

    const result = await toggleHabitAction(habitId, today);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.completed && result?.xpAwarded) {
      toast.success(`+${result.xpAwarded} XP`, {
        description: "Návyk splněn!",
      });
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
            {morningDone ? (
              <span className="text-sm line-through text-muted-foreground">
                Ranní check-in
              </span>
            ) : (
              <Link
                href="/checkin"
                className="text-sm text-primary hover:underline"
              >
                Ranní check-in
              </Link>
            )}
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
            {eveningDone ? (
              <span className="text-sm line-through text-muted-foreground">
                Večerní check-in
              </span>
            ) : (
              <Link
                href="/checkin"
                className="text-sm text-primary hover:underline"
              >
                Večerní check-in
              </Link>
            )}
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
