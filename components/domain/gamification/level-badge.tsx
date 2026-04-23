"use client";

import { getLevelForXP } from "@/types/gamification";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  totalXP: number;
  className?: string;
}

export function LevelBadge({ totalXP, className }: LevelBadgeProps) {
  const level = getLevelForXP(totalXP);

  return (
    <Badge variant="secondary" className={cn("font-mono text-xs", className)}>
      Lv.{level.level} {level.title}
    </Badge>
  );
}
