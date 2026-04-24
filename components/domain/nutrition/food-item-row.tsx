"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { removeMealItem, updateMealItemGrams } from "@/app/(app)/nutrition/actions";
import type { FoodItem, MealItem } from "@/types/nutrition";

interface FoodItemRowProps {
  item: MealItem & { food_items: FoodItem };
  editable?: boolean;
}

export function FoodItemRow({ item, editable = false }: FoodItemRowProps) {
  const food = item.food_items;
  const [grams, setGrams] = useState(item.grams);
  const [isPending, startTransition] = useTransition();

  const ratio = grams / 100;
  const kcal = item.kcal_override ?? Math.round(food.kcal_per_100g * ratio);
  const protein = item.protein_override ?? Math.round(food.protein_g * ratio * 10) / 10;
  const carbs = item.carbs_override ?? Math.round(food.carbs_g * ratio * 10) / 10;
  const fat = item.fat_override ?? Math.round(food.fat_g * ratio * 10) / 10;

  function handleGramsChange(newGrams: number) {
    setGrams(newGrams);
    if (newGrams > 0) {
      startTransition(async () => {
        await updateMealItemGrams(item.id, newGrams);
      });
    }
  }

  function handleDelete() {
    startTransition(async () => {
      await removeMealItem(item.id);
    });
  }

  return (
    <div className="flex items-center gap-2 py-1.5 text-sm">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate text-xs">{food.name}</p>
        <p className="text-[10px] text-muted-foreground font-mono">
          {Math.round(kcal)} kcal &middot; {protein}P &middot; {carbs}C &middot; {fat}F
        </p>
      </div>
      {editable ? (
        <>
          <Input
            type="number"
            value={grams}
            onChange={(e) => handleGramsChange(Number(e.target.value))}
            className="w-16 h-7 text-xs text-right font-mono"
            min={1}
          />
          <span className="text-xs text-muted-foreground">g</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 size={14} />
          </Button>
        </>
      ) : (
        <span className="text-xs font-mono text-muted-foreground shrink-0">
          {grams}g
        </span>
      )}
    </div>
  );
}
