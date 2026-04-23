"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HabitItemProps {
  id: string;
  title: string;
  xpValue: number;
  completed: boolean;
  onToggle: (habitId: string) => Promise<void>;
}

export function HabitItem({
  id,
  title,
  xpValue,
  completed,
  onToggle,
}: HabitItemProps) {
  const [optimisticCompleted, setOptimisticCompleted] = useState(completed);
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle() {
    setIsLoading(true);
    setOptimisticCompleted(!optimisticCompleted);

    try {
      await onToggle(id);
    } catch {
      // Revert on error
      setOptimisticCompleted(optimisticCompleted);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
        optimisticCompleted
          ? "border-primary/20 bg-primary/5"
          : "border-border"
      )}
    >
      <Checkbox
        checked={optimisticCompleted}
        onCheckedChange={handleToggle}
        disabled={isLoading}
      />
      <span
        className={cn(
          "flex-1 text-sm",
          optimisticCompleted && "line-through text-muted-foreground"
        )}
      >
        {title}
      </span>
      <Badge variant="outline" className="font-mono text-[10px] shrink-0">
        +{xpValue} XP
      </Badge>
    </div>
  );
}
