"use client";

import { getXPProgress } from "@/types/gamification";
import { Progress } from "@/components/ui/progress";

interface XPBarProps {
  totalXP: number;
  className?: string;
}

export function XPBar({ totalXP, className }: XPBarProps) {
  const progress = getXPProgress(totalXP);

  return (
    <div className={className}>
      <div className="flex justify-between text-xs font-mono text-muted-foreground mb-1">
        <span>Lv.{progress.currentLevel}</span>
        <span>
          {progress.currentXP} / {progress.nextLevelXP} XP
        </span>
      </div>
      <Progress value={progress.percentage} />
    </div>
  );
}
