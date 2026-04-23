"use client";

import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon?: string;
  unlocked: boolean;
  className?: string;
}

export function AchievementBadge({
  name,
  description,
  icon,
  unlocked,
  className,
}: AchievementBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 transition-colors",
        unlocked
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-muted/30 opacity-50",
        className
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg",
          unlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        {icon ? (
          <span>{icon}</span>
        ) : (
          <Trophy size={20} />
        )}
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            unlocked ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {name}
        </p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
    </div>
  );
}
