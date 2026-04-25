"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  CalendarDays,
  TrendingUp,
  Check,
  X,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { quickUpdateProgress } from "@/app/(app)/goals/actions";
import { toast } from "sonner";
import type { Goal } from "@/types/database";
import { cn } from "@/lib/utils";
import {
  getGoalTypeConfig,
  getGoalAreaConfig,
  type GoalType,
  type GoalArea,
} from "@/types/goals";

interface GoalCardProps {
  goal: Goal;
}

const STATUS_LABELS: Record<Goal["status"], string> = {
  active: "Aktivní",
  completed: "Dokončeno",
  paused: "Pozastaveno",
  abandoned: "Opuštěno",
};

const STATUS_VARIANTS: Record<
  Goal["status"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  active: "default",
  completed: "secondary",
  paused: "outline",
  abandoned: "destructive",
};

/** Border colors per area */
const AREA_BORDER_COLORS: Record<GoalArea, string> = {
  health: "border-l-green-500",
  work: "border-l-blue-500",
  finance: "border-l-yellow-500",
  growth: "border-l-purple-500",
  relationships: "border-l-pink-500",
  mental: "border-l-cyan-500",
  home: "border-l-orange-500",
  other: "border-l-gray-500",
};

function getProgressPercentage(goal: Goal): number {
  if (
    goal.start_value == null ||
    goal.target_value == null ||
    goal.current_value == null
  ) {
    return goal.status === "completed" ? 100 : 0;
  }

  const range = goal.target_value - goal.start_value;
  if (range === 0) return goal.status === "completed" ? 100 : 0;

  const progress = ((goal.current_value - goal.start_value) / range) * 100;
  return Math.max(0, Math.min(100, progress));
}

function getChallengeDayNumber(goal: Goal): number {
  if (!goal.challenge_start) return 0;
  const start = new Date(goal.challenge_start);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(1, diff + 1);
}

/** Deadline countdown badge */
function DeadlineBadge({ targetDate }: { targetDate: string }) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadline = new Date(targetDate);
  deadline.setHours(0, 0, 0, 0);

  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <Badge variant="destructive" className="text-[10px] font-mono">
        Prošlý
      </Badge>
    );
  }

  if (diffDays === 0) {
    return (
      <Badge
        variant="destructive"
        className="text-[10px] font-mono animate-pulse"
      >
        Dnes!
      </Badge>
    );
  }

  const colorClass =
    diffDays <= 7
      ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400"
      : diffDays <= 14
      ? "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
      : "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400";

  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-mono", colorClass)}
    >
      Zbývá {diffDays} {diffDays === 1 ? "den" : diffDays < 5 ? "dny" : "dní"}
    </Badge>
  );
}

/** Area emoji badge */
function AreaBadge({ area }: { area: GoalArea }) {
  const config = getGoalAreaConfig(area);
  return (
    <Badge variant="outline" className={cn("text-[10px] gap-1", config.color)}>
      {config.emoji} {config.label}
    </Badge>
  );
}

/** Measurable card content */
function MeasurableContent({ goal }: { goal: Goal }) {
  const percentage = getProgressPercentage(goal);
  return (
    <>
      <div className="mb-2">
        <div className="flex justify-between text-xs font-mono text-muted-foreground mb-1">
          <span>{goal.metric ?? "Pokrok"}</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
        <Progress value={percentage} />
      </div>
      {goal.target_value != null && (
        <p className="text-xs text-muted-foreground font-mono">
          {goal.current_value ?? goal.start_value ?? 0} &rarr;{" "}
          {goal.target_value}
          {goal.metric ? ` ${goal.metric}` : ""}
        </p>
      )}
    </>
  );
}

/** Habit card content */
function HabitContent({ goal }: { goal: Goal }) {
  const target = goal.frequency_target ?? 5;
  const current = goal.current_value ?? 0;
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-mono font-semibold">
          {current}/{target} tento týden
        </span>
        {goal.frequency && (
          <Badge variant="outline" className="text-[10px] font-mono">
            {goal.frequency === "daily"
              ? "Každý den"
              : goal.frequency === "weekly"
              ? "1× týdně"
              : goal.frequency.replace("x_week", "× týdně")}
          </Badge>
        )}
      </div>
      {/* Mini calendar dots for week */}
      <div className="flex gap-1.5">
        {["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map((day, i) => (
          <div key={day} className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-muted-foreground">{day}</span>
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px]",
                i < current
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i < current ? "✓" : "·"}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/** Oneoff card content */
function OneoffContent({ goal }: { goal: Goal }) {
  const isDone = goal.status === "completed";
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors",
          isDone
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30"
        )}
      >
        {isDone && <CheckCircle2 size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        {goal.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {goal.description}
          </p>
        )}
        {!goal.description && !isDone && (
          <p className="text-xs text-muted-foreground italic">
            Čeká na splnění
          </p>
        )}
        {isDone && (
          <p className="text-xs text-primary font-medium">Hotovo!</p>
        )}
      </div>
    </div>
  );
}

/** Challenge card content */
function ChallengeContent({ goal }: { goal: Goal }) {
  const totalDays = goal.challenge_days ?? 30;
  const currentDay = getChallengeDayNumber(goal);
  const percentage = Math.min(100, (currentDay / totalDays) * 100);

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-orange-500" />
          <span className="text-sm font-mono font-bold">
            Den {Math.min(currentDay, totalDays)}/{totalDays}
          </span>
        </div>
        {currentDay > 1 && (
          <Badge
            variant="outline"
            className="text-[10px] font-mono text-orange-500 border-orange-200"
          >
            🔥 {currentDay - 1} dní streak
          </Badge>
        )}
      </div>
      <Progress value={percentage} />
    </>
  );
}

/** Shared badge */
function SharedBadge() {
  return (
    <Badge
      variant="outline"
      className="text-[10px] gap-1 text-pink-500 border-pink-200"
    >
      👫 Sdílený
    </Badge>
  );
}

export function GoalCard({ goal }: GoalCardProps) {
  const goalType = (goal.goal_type ?? "measurable") as GoalType;
  const goalArea = (goal.area ?? "other") as GoalArea;
  const typeConfig = getGoalTypeConfig(goalType);

  const [showQuickUpdate, setShowQuickUpdate] = useState(false);
  const [quickValue, setQuickValue] = useState(
    String(goal.current_value ?? goal.start_value ?? 0)
  );
  const [isSaving, setIsSaving] = useState(false);

  async function handleQuickUpdate() {
    const value = Number(quickValue);
    if (isNaN(value)) {
      toast.error("Zadej platné číslo");
      return;
    }

    setIsSaving(true);
    try {
      const result = await quickUpdateProgress(goal.id, value);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Pokrok aktualizován!");
      setShowQuickUpdate(false);
    } catch {
      toast.error("Něco se pokazilo");
    } finally {
      setIsSaving(false);
    }
  }

  const borderClass = AREA_BORDER_COLORS[goalArea] ?? "border-l-gray-500";

  return (
    <Card
      className={cn(
        "p-4 hover:border-primary/30 transition-colors border-l-4",
        borderClass
      )}
    >
      <Link href={`/goals/${goal.id}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base shrink-0">{typeConfig.emoji}</span>
            <h3 className="text-sm font-semibold leading-tight line-clamp-2">
              {goal.title}
            </h3>
          </div>
          <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
            {goal.target_date && goal.status === "active" && (
              <DeadlineBadge targetDate={goal.target_date} />
            )}
            <Badge
              variant={STATUS_VARIANTS[goal.status]}
              className="text-[10px]"
            >
              {STATUS_LABELS[goal.status]}
            </Badge>
          </div>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <AreaBadge area={goalArea} />
          {goalType === "shared" && <SharedBadge />}
        </div>

        {/* Type-specific content */}
        {goalType === "measurable" && <MeasurableContent goal={goal} />}
        {goalType === "habit" && <HabitContent goal={goal} />}
        {goalType === "oneoff" && <OneoffContent goal={goal} />}
        {goalType === "challenge" && <ChallengeContent goal={goal} />}
        {goalType === "shared" && <MeasurableContent goal={goal} />}

        {/* Date footer */}
        {goal.target_date && goalType !== "challenge" && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <CalendarDays size={12} />
            <span className="font-mono">
              {new Date(goal.target_date).toLocaleDateString("cs-CZ")}
            </span>
          </div>
        )}
      </Link>

      {/* Quick progress update — measurable & shared only */}
      {goal.status === "active" &&
        goal.target_value != null &&
        (goalType === "measurable" || goalType === "shared") && (
          <div className="mt-2 pt-2 border-t">
            {showQuickUpdate ? (
              <div className="flex items-center gap-2">
                <Input
                  value={quickValue}
                  onChange={(e) => setQuickValue(e.target.value)}
                  type="number"
                  step="any"
                  className="h-8 text-sm flex-1"
                  placeholder="Nová hodnota"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleQuickUpdate();
                    }
                    if (e.key === "Escape") setShowQuickUpdate(false);
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleQuickUpdate}
                  disabled={isSaving}
                  className="h-8 px-2"
                >
                  <Check size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickUpdate(false)}
                  className="h-8 px-2"
                >
                  <X size={14} />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickUpdate(true)}
                className="h-7 text-xs w-full text-muted-foreground hover:text-foreground"
              >
                <TrendingUp size={12} />
                Aktualizovat pokrok
              </Button>
            )}
          </div>
        )}
    </Card>
  );
}
