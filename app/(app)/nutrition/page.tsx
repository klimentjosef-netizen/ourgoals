import Link from "next/link";
import { UtensilsCrossed, CalendarDays, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { getAuthUser } from "@/lib/auth";
import {
  getDailyMacros,
  getUserTargets,
  getMealTemplates,
  getSuggestions,
  getWaterGlasses,
  isTrainingDay,
  getDailyMealsForDate,
  getTemplateMacros,
} from "@/app/(app)/nutrition/actions";
import { MacroSummary } from "@/components/domain/nutrition/macro-summary";
import { MealCard } from "@/components/domain/nutrition/meal-card";
import { TemplatePicker } from "@/components/domain/nutrition/template-picker";
import { FoodSuggestions } from "@/components/domain/nutrition/food-suggestions";
import { MacroWarnings } from "@/components/domain/nutrition/macro-warnings";
import { WaterTracker } from "@/components/domain/nutrition/water-tracker";
import { TrainingDayBanner } from "@/components/domain/nutrition/training-day-banner";
import { DailySummary } from "@/components/domain/nutrition/daily-summary";
import { NutritionActionsBar } from "@/components/domain/nutrition/nutrition-actions-bar";
import type { MealType, MealWithItems } from "@/types/nutrition";

export default async function NutritionPage() {
  const user = await getAuthUser();
  const today = new Date().toISOString().split("T")[0];

  // Compute tomorrow's date
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];

  const [{ meals, totals }, targets, templates] = await Promise.all([
    getDailyMacros(user.id, today),
    getUserTargets(user.id),
    getMealTemplates(user.id),
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

  // Feature 1: Suggestions — only if any macro is >30% below target
  const targetP = targets.protein_g ?? 0;
  const targetC = targets.carbs_g ?? 0;
  const targetF = targets.fat_g ?? 0;
  const needsSuggestions =
    (targetP > 0 && remainP > targetP * 0.3) ||
    (targetC > 0 && remainC > targetC * 0.3) ||
    (targetF > 0 && remainF > targetF * 0.3);

  // Parallel fetch of optional data
  const [suggestions, waterGlasses, trainingDay, tomorrowMeals, templateMacros] =
    await Promise.all([
      needsSuggestions
        ? getSuggestions(user.id, remainP, remainC, remainF)
        : Promise.resolve([]),
      getWaterGlasses(user.id, today).catch(() => 0),
      isTrainingDay(user.id, today).catch(() => false),
      getDailyMealsForDate(user.id, tomorrow).catch(() => [] as MealWithItems[]),
      getTemplateMacros(templates),
    ]);

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

      {/* Feature 9: Training day banner */}
      {trainingDay && <TrainingDayBanner />}

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

      {/* Feature 3: Real-time macro warnings */}
      <MacroWarnings
        remainingP={remainP}
        currentKcal={totals.kcal}
        targetKcal={targetKcal}
      />

      {/* Feature 1: Food suggestions */}
      {needsSuggestions && suggestions.length > 0 && (
        <FoodSuggestions
          suggestions={suggestions}
          remainingP={remainP}
          remainingC={remainC}
          remainingF={remainF}
        />
      )}

      {/* Feature 8: Water tracking */}
      <WaterTracker initialGlasses={waterGlasses} date={today} />

      <Separator />

      {/* Meal templates (Feature 4: with macro preview) */}
      <TemplatePicker templates={templates} date={today} templateMacros={templateMacros} />

      {/* Meals list */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Dnešní jídla
        </h2>
        {meals.length === 0 && (
          <Card>
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                <UtensilsCrossed size={32} className="text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Začni sledovat co jíš</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Loguj jídla a sleduj makra v reálném čase. Hledej v databázi 3M+ potravin.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {meals.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>

      {/* Feature 7: Tomorrow's planned meals */}
      {tomorrowMeals.length > 0 && (
        <div className="space-y-3">
          <Separator />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Naplánováno na zítra
          </h2>
          {tomorrowMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}

      {/* Add meal + Copy yesterday + Plan tomorrow (Features 7, 10) */}
      <NutritionActionsBar
        userId={user.id}
        date={today}
        tomorrowDate={tomorrow}
      />

      {/* Feature 11: Daily summary card */}
      {meals.length > 0 && (
        <>
          <Separator />
          <DailySummary
            totals={totals}
            targets={targets}
            mealCount={meals.length}
            waterGlasses={waterGlasses}
          />
        </>
      )}
    </div>
  );
}
