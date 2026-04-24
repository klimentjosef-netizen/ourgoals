"use client";

import { cn } from "@/lib/utils";

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color?: "protein" | "carbs" | "fat" | "kcal";
  className?: string;
}

const COLOR_MAP = {
  protein: "bg-blue-500",
  carbs: "bg-amber-500",
  fat: "bg-purple-500",
  kcal: "bg-primary",
};

function getStatusColor(percentage: number): string {
  if (percentage > 110) return "bg-red-500";
  if (percentage > 95) return "bg-yellow-500";
  return "";
}

export function MacroBar({
  label,
  current,
  target,
  unit,
  color = "kcal",
  className,
}: MacroBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 120) : 0;
  const displayPercentage = Math.min(percentage, 100);
  const statusOverride = getStatusColor(percentage);
  const barColor = statusOverride || COLOR_MAP[color];

  const remaining = Math.max(0, target - current);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-xs font-mono text-muted-foreground">
        <span className="font-medium text-foreground">{label}</span>
        <span>
          {Math.round(current)}/{target}
          {unit} <span className="text-[10px]">(-{Math.round(remaining)})</span>
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            barColor
          )}
          style={{ width: `${displayPercentage}%` }}
        />
      </div>
    </div>
  );
}
