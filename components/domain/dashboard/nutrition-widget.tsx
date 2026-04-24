"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UtensilsCrossed } from "lucide-react";
import Link from "next/link";

interface NutritionWidgetProps {
  macros: { kcal: number; protein: number; carbs: number; fat: number } | null;
  targets: { protein_g: number; carbs_g: number; fat_g: number } | null;
}

function MacroBar({
  label,
  current,
  target,
  color,
}: {
  label: string;
  current: number;
  target: number;
  color: string;
}) {
  const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums">
          {Math.round(current)}/{target}g
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function NutritionWidget({ macros, targets }: NutritionWidgetProps) {
  const current = macros ?? { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  const t = targets ?? { protein_g: 0, carbs_g: 0, fat_g: 0 };

  const remainP = Math.max(0, t.protein_g - current.protein);
  const remainC = Math.max(0, t.carbs_g - current.carbs);
  const remainF = Math.max(0, t.fat_g - current.fat);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <UtensilsCrossed size={16} className="text-amber-500" />
          Výživa dnes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* kcal summary */}
        <p className="text-sm font-medium tabular-nums">
          {Math.round(current.kcal)} kcal
        </p>

        {targets ? (
          <>
            <div className="space-y-2">
              <MacroBar
                label="P"
                current={current.protein}
                target={t.protein_g}
                color="bg-red-400"
              />
              <MacroBar
                label="C"
                current={current.carbs}
                target={t.carbs_g}
                color="bg-yellow-400"
              />
              <MacroBar
                label="F"
                current={current.fat}
                target={t.fat_g}
                color="bg-blue-400"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Zbývá: {Math.round(remainP)}g P, {Math.round(remainC)}g C,{" "}
              {Math.round(remainF)}g F
            </p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            Nastav si cíle makroživin v nastavení.
          </p>
        )}

        <Link href="/nutrition">
          <Button variant="outline" size="sm" className="w-full">
            Přidat jídlo →
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
