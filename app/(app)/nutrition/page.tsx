import Link from "next/link";
import { UtensilsCrossed, CalendarDays, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { getAuthUser } from "@/lib/auth";
import { getDailyMacros, getUserTargets } from "@/app/(app)/nutrition/actions";
import { MacroSummary } from "@/components/domain/nutrition/macro-summary";
import { MealCard } from "@/components/domain/nutrition/meal-card";
import { NutritionClient } from "@/app/(app)/nutrition/nutrition-client";
import { MEAL_TYPE_LABELS } from "@/types/nutrition";
import type { MealType, MealWithItems } from "@/types/nutrition";

export default async function NutritionPage() {
  const user = await getAuthUser();
  const today = new Date().toISOString().split("T")[0];

  const [{ meals, totals }, targets] = await Promise.all([
    getDailyMacros(user.id, today),
    getUserTargets(user.id),
  ]);

  const targetKcal =
    (targets.protein_g ?? 0) * 4 +
    (targets.carbs_g ?? 0) * 4 +
    (targets.fat_g ?? 0) * 9;

  // Group meals by type
  const mealsByType = new Map<MealType, MealWithItems[]>();
  for (const meal of meals) {
    const existing = mealsByType.get(meal.meal_type) ?? [];
    existing.push(meal);
    mealsByType.set(meal.meal_type, existing);
  }

  // Remaining macros
  const remainP = Math.max(
    0,
    (targets.protein_g ?? 0) - totals.protein
  );
  const remainC = Math.max(
    0,
    (targets.carbs_g ?? 0) - totals.carbs
  );
  const remainF = Math.max(
    0,
    (targets.fat_g ?? 0) - totals.fat
  );
  const remainKcal = Math.max(0, targetKcal - totals.kcal);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UtensilsCrossed size={24} className="text-primary" />
          <h1 className="text-xl font-bold">Jídlo & Makra</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/nutrition/catalog">
            <Button variant="outline" size="sm">
              <BookOpen size={14} />
              Katalog
            </Button>
          </Link>
          <Link href="/nutrition/week">
            <Button variant="outline" size="sm">
              <CalendarDays size={14} />
              Týden
            </Button>
          </Link>
        </div>
      </div>

      {/* Macro progress */}
      <Card className="p-4">
        <h2 className="text-sm font-semibold mb-3">
          Dnešní makra
        </h2>
        <MacroSummary totals={totals} targets={targets} />
      </Card>

      {/* Remaining widget */}
      <Card className="p-3 bg-muted/50">
        <p className="text-xs font-semibold mb-1">
          Zbývá do cíle
        </p>
        <div className="flex gap-4 text-xs font-mono">
          <span>
            <span className="text-muted-foreground">kcal:</span>{" "}
            {Math.round(remainKcal)}
          </span>
          <span>
            <span className="text-blue-500">P:</span>{" "}
            {Math.round(remainP)}g
          </span>
          <span>
            <span className="text-amber-500">C:</span>{" "}
            {Math.round(remainC)}g
          </span>
          <span>
            <span className="text-purple-500">F:</span>{" "}
            {Math.round(remainF)}g
          </span>
        </div>
      </Card>

      <Separator />

      {/* Meals list */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Dnešní jídla
        </h2>
        {meals.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Zatím žádná jídla. Přidej první jídlo dne!
          </p>
        )}
        {meals.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>

      {/* Add meal (client component) */}
      <NutritionClient
        userId={user.id}
        date={today}
      />
    </div>
  );
}
