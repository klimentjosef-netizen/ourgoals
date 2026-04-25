"use client";

import { useState, useRef, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeMealItem, updateMealItemGrams } from "@/app/(app)/nutrition/actions";
import type { FoodItem, MealItem } from "@/types/nutrition";

interface FoodItemRowProps {
  item: MealItem & { food_items: FoodItem };
  editable?: boolean;
}

export function FoodItemRow({ item, editable = false }: FoodItemRowProps) {
  const food = item.food_items;
  const [grams, setGrams] = useState(item.grams);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const ratio = grams / 100;
  const kcal = item.kcal_override ?? Math.round(food.kcal_per_100g * ratio);
  const protein = item.protein_override ?? Math.round(food.protein_g * ratio * 10) / 10;
  const carbs = item.carbs_override ?? Math.round(food.carbs_g * ratio * 10) / 10;
  const fat = item.fat_override ?? Math.round(food.fat_g * ratio * 10) / 10;

  function commitGrams(newGrams: number) {
    if (newGrams <= 0 || newGrams === item.grams) {
      setGrams(item.grams);
      setEditing(false);
      return;
    }
    setGrams(newGrams);
    setEditing(false);
    startTransition(async () => {
      const result = await updateMealItemGrams(item.id, newGrams);
      if (result.error) {
        toast.error("Nepodařilo se uložit gramáž");
        setGrams(item.grams);
      } else {
        toast.success(`Gramáž změněna na ${newGrams}g`);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      commitGrams(grams);
    } else if (e.key === "Escape") {
      setGrams(item.grams);
      setEditing(false);
    }
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await removeMealItem(item.id);
      if (result.error) {
        toast.error("Nepodařilo se smazat položku");
      } else {
        toast.success("Položka smazána");
      }
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
          {editing ? (
            <Input
              ref={inputRef}
              type="number"
              value={grams}
              onChange={(e) => setGrams(Number(e.target.value))}
              onBlur={() => commitGrams(grams)}
              onKeyDown={handleKeyDown}
              className="w-16 h-7 text-xs text-right font-mono"
              min={1}
              autoFocus
            />
          ) : (
            <button
              type="button"
              className="w-16 h-7 text-xs text-right font-mono bg-muted/50 rounded-md px-2 hover:bg-muted transition-colors cursor-text tabular-nums"
              onClick={() => setEditing(true)}
            >
              {grams}
            </button>
          )}
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
        <button
          type="button"
          className="text-xs font-mono text-muted-foreground shrink-0 hover:underline cursor-pointer"
          onClick={() => setEditing(true)}
        >
          {grams}g
        </button>
      )}
    </div>
  );
}
