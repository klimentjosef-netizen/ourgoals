"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { FoodItemRow } from "@/components/domain/nutrition/food-item-row";
import { calculateMealMacros } from "@/lib/logic/macros";
import { MEAL_TYPE_LABELS } from "@/types/nutrition";
import type { MealWithItems } from "@/types/nutrition";

interface MealCardProps {
  meal: MealWithItems;
  onAddItem?: (mealId: string) => void;
}

export function MealCard({ meal, onAddItem }: MealCardProps) {
  const [expanded, setExpanded] = useState(true);

  const totals = calculateMealMacros(
    meal.meal_items,
    meal.meal_items.map((mi) => mi.food_items)
  );

  const time = meal.consumed_at
    ? new Date(meal.consumed_at).toLocaleTimeString("cs-CZ", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Card className="p-3">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            {MEAL_TYPE_LABELS[meal.meal_type]}
          </Badge>
          {time && (
            <span className="text-[10px] text-muted-foreground font-mono">
              {time}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">
            {Math.round(totals.kcal)} kcal
          </span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {expanded && (
        <div className="mt-2 space-y-0.5">
          {meal.meal_items.length === 0 && (
            <p className="text-xs text-muted-foreground py-2">
              Zatím žádné položky
            </p>
          )}
          {meal.meal_items.map((item) => (
            <FoodItemRow key={item.id} item={item} editable />
          ))}

          <div className="flex items-center justify-between pt-2 border-t mt-2">
            <p className="text-[10px] font-mono text-muted-foreground">
              {Math.round(totals.protein)}P &middot; {Math.round(totals.carbs)}C &middot;{" "}
              {Math.round(totals.fat)}F
            </p>
            {onAddItem && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddItem(meal.id);
                }}
              >
                <Plus size={14} />
                Přidat
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
