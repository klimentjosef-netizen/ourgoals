"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakFlameProps {
  streak: number;
  className?: string;
}

export function StreakFlame({ streak, className }: StreakFlameProps) {
  const isActive = streak > 0;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 font-mono text-sm",
        isActive ? "text-primary" : "text-muted-foreground",
        className
      )}
    >
      <Flame
        size={18}
        className={cn(
          isActive
            ? "text-orange-500 fill-orange-500"
            : "text-muted-foreground/50"
        )}
      />
      <span className="font-bold">{streak}</span>
      <span className="text-xs">dní</span>
    </div>
  );
}
