"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, TrendingUp, Check, X } from "lucide-react";
import { quickUpdateProgress } from "@/app/(app)/goals/actions";
import { toast } from "sonner";
import type { Goal } from "@/types/database";
import { cn } from "@/lib/utils";

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

/** Feature 4: Deadline countdown */
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
      <Badge variant="destructive" className="text-[10px] font-mono animate-pulse">
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
    <Badge variant="outline" className={cn("text-[10px] font-mono", colorClass)}>
      Zbývá {diffDays} {diffDays === 1 ? "den" : diffDays < 5 ? "dny" : "dní"}
    </Badge>
  );
}

export function GoalCard({ goal }: GoalCardProps) {
  const percentage = getProgressPercentage(goal);
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

  return (
    <Card className="p-4 hover:border-primary/30 transition-colors">
      <Link href={`/goals/${goal.id}`}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold leading-tight line-clamp-2">
            {goal.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            {/* Feature 4: Deadline countdown */}
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

        <div className="mb-2">
          <div className="flex justify-between text-xs font-mono text-muted-foreground mb-1">
            <span>{goal.metric ?? "Pokrok"}</span>
            <span>{percentage.toFixed(0)}%</span>
          </div>
          <Progress value={percentage} />
        </div>

        {goal.target_value != null && (
          <p className="text-xs text-muted-foreground font-mono mb-2">
            {goal.current_value ?? goal.start_value ?? 0} &rarr; {goal.target_value}
            {goal.metric ? ` ${goal.metric}` : ""}
          </p>
        )}

        {goal.target_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays size={12} />
            <span className="font-mono">
              {new Date(goal.target_date).toLocaleDateString("cs-CZ")}
            </span>
          </div>
        )}
      </Link>

      {/* Feature 3: Quick progress update */}
      {goal.status === "active" && goal.target_value != null && (
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
