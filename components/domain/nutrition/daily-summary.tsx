"use client";

import { Card } from "@/components/ui/card";
import type { MacroTotals } from "@/types/nutrition";

interface DailySummaryProps {
  totals: MacroTotals;
  targets: {
    protein_g: number | null;
    carbs_g: number | null;
    fat_g: number | null;
  };
  mealCount: number;
  waterGlasses: number;
  waterTarget?: number;
}

function macroStatus(
  current: number,
  target: number
): { icon: string; color: string; text: string } {
  if (target === 0) return { icon: "➖", color: "text-muted-foreground", text: `${Math.round(current)}g` };

  const ratio = current / target;
  const diff = Math.round(current - target);

  if (ratio >= 0.9 && ratio <= 1.1) {
    return {
      icon: "✅",
      color: "text-green-600 dark:text-green-400",
      text: `${Math.round(current)}/${target}g`,
    };
  } else if (ratio > 1.1) {
    return {
      icon: "⚠️",
      color: "text-red-500",
      text: `${Math.round(current)}/${target}g (+${diff}g)`,
    };
  } else {
    return {
      icon: "🔸",
      color: "text-yellow-500",
      text: `${Math.round(current)}/${target}g`,
    };
  }
}

export function DailySummary({
  totals,
  targets,
  mealCount,
  waterGlasses,
  waterTarget = 8,
}: DailySummaryProps) {
  const targetP = targets.protein_g ?? 0;
  const targetC = targets.carbs_g ?? 0;
  const targetF = targets.fat_g ?? 0;
  const targetKcal = targetP * 4 + targetC * 4 + targetF * 9;

  const kcalPct = targetKcal > 0 ? Math.round((totals.kcal / targetKcal) * 100) : 0;
  const proteinStatus = macroStatus(totals.protein, targetP);
  const carbsStatus = macroStatus(totals.carbs, targetC);
  const fatStatus = macroStatus(totals.fat, targetF);

  // Overall status
  const allGood =
    totals.kcal <= targetKcal * 1.1 &&
    totals.protein >= targetP * 0.9 &&
    totals.carbs >= targetC * 0.8 &&
    totals.fat <= targetF * 1.15;
  const overKcal = targetKcal > 0 && totals.kcal > targetKcal * 1.2;
  const statusText = overKcal
    ? "Překročeno"
    : allGood
    ? "Splněno"
    : "V průběhu";
  const statusIcon = overKcal ? "🔴" : allGood ? "✅" : "🟡";

  return (
    <Card className="p-4 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">📊</span>
        <h3 className="text-sm font-semibold">Dnešní shrnutí</h3>
      </div>

      <div className="space-y-1 text-xs font-mono">
        <p>
          {Math.round(totals.kcal)} / {targetKcal} kcal ({kcalPct}%)
        </p>
        <p className={proteinStatus.color}>
          {proteinStatus.icon} Protein: {proteinStatus.text}
        </p>
        <p className={carbsStatus.color}>
          {carbsStatus.icon} Sacharidy: {carbsStatus.text}
        </p>
        <p className={fatStatus.color}>
          {fatStatus.icon} Tuky: {fatStatus.text}
        </p>
        <p>💧 Voda: {waterGlasses}/{waterTarget}</p>
        <p>
          🍽️ {mealCount} {mealCount === 1 ? "jídlo" : mealCount < 5 ? "jídla" : "jídel"} zalogováno
        </p>
      </div>

      <div className="pt-1 border-t">
        <p className="text-xs font-semibold">
          Status: {statusIcon} {statusText}
        </p>
      </div>
    </Card>
  );
}
