"use client";

import { MacroBar } from "@/components/domain/nutrition/macro-bar";
import type { MacroTotals } from "@/types/nutrition";
import { cn } from "@/lib/utils";

interface MacroSummaryProps {
  totals: MacroTotals;
  targets: {
    protein_g: number | null;
    carbs_g: number | null;
    fat_g: number | null;
  };
  className?: string;
}

export function MacroSummary({ totals, targets, className }: MacroSummaryProps) {
  const targetP = targets.protein_g ?? 0;
  const targetC = targets.carbs_g ?? 0;
  const targetF = targets.fat_g ?? 0;
  const targetKcal = targetP * 4 + targetC * 4 + targetF * 9;

  return (
    <div className={cn("grid gap-3", className)}>
      <MacroBar
        label="Kalorie"
        current={totals.kcal}
        target={targetKcal}
        unit="kcal"
        color="kcal"
      />
      <MacroBar
        label="Protein"
        current={totals.protein}
        target={targetP}
        unit="g"
        color="protein"
      />
      <MacroBar
        label="Sacharidy"
        current={totals.carbs}
        target={targetC}
        unit="g"
        color="carbs"
      />
      <MacroBar
        label="Tuky"
        current={totals.fat}
        target={targetF}
        unit="g"
        color="fat"
      />
    </div>
  );
}
