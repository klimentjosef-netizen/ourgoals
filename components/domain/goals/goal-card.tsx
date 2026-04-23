"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarDays } from "lucide-react";
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

export function GoalCard({ goal }: GoalCardProps) {
  const percentage = getProgressPercentage(goal);

  return (
    <Link href={`/goals/${goal.id}`}>
      <Card className="p-4 hover:border-primary/30 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold leading-tight line-clamp-2">
            {goal.title}
          </h3>
          <Badge
            variant={STATUS_VARIANTS[goal.status]}
            className="shrink-0 text-[10px]"
          >
            {STATUS_LABELS[goal.status]}
          </Badge>
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
            {goal.current_value ?? goal.start_value ?? 0} → {goal.target_value}
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
      </Card>
    </Link>
  );
}
