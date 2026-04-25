"use client";

import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface MacroWarningsProps {
  remainingP: number;
  currentKcal: number;
  targetKcal: number;
}

export function MacroWarnings({ remainingP, currentKcal, targetKcal }: MacroWarningsProps) {
  const currentHour = new Date().getHours();
  const warnings: { message: string; type: "warning" | "danger" }[] = [];

  // Low protein late in the day
  if (remainingP > 50 && currentHour > 18) {
    warnings.push({
      message: `Málo proteinu! Zbývá ${Math.round(remainingP)}g a jen pár hodin.`,
      type: "warning",
    });
  }

  // Calorie overshoot by 20%
  if (targetKcal > 0 && currentKcal > targetKcal * 1.2) {
    const overBy = Math.round(currentKcal - targetKcal);
    warnings.push({
      message: `Přesáhl jsi kalorický limit o ${overBy} kcal.`,
      type: "danger",
    });
  }

  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {warnings.map((w, i) => (
        <Card
          key={i}
          className={`p-3 flex items-start gap-2 ${
            w.type === "danger"
              ? "border-red-500/30 bg-red-50/50 dark:bg-red-950/20"
              : "border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20"
          }`}
        >
          <AlertTriangle
            size={14}
            className={`shrink-0 mt-0.5 ${
              w.type === "danger" ? "text-red-500" : "text-amber-500"
            }`}
          />
          <p className="text-xs">{w.message}</p>
        </Card>
      ))}
    </div>
  );
}
