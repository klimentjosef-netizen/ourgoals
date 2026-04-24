"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";
import { createMeal } from "@/app/(app)/nutrition/actions";
import { FoodSearch } from "@/components/domain/nutrition/food-search";
import { MEAL_TYPE_OPTIONS } from "@/types/nutrition";
import type { MealType } from "@/types/nutrition";

interface AddMealProps {
  userId: string;
  date: string;
  onClose?: () => void;
}

export function AddMeal({ userId, date, onClose }: AddMealProps) {
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [createdMealId, setCreatedMealId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreateMeal() {
    const fd = new FormData();
    fd.set("date", date);
    fd.set("meal_type", mealType);
    fd.set("consumed_at", new Date().toISOString());

    startTransition(async () => {
      const result = await createMeal(fd);
      if (result.meal) {
        setCreatedMealId(result.meal.id);
      }
    });
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Přidat jídlo
        </h3>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onClose}
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {!createdMealId ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">
              Typ jídla
            </label>
            <Select
              value={mealType}
              onValueChange={(v) =>
                setMealType(v as MealType)
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TYPE_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleCreateMeal}
            disabled={isPending}
            size="sm"
            className="w-full"
          >
            {isPending ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <Plus size={14} />
            )}
            Vytvořit jídlo
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Jídlo vytvořeno. Přidej potraviny:
          </p>
          <FoodSearch
            mealId={createdMealId}
            userId={userId}
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onClose}
          >
            Hotovo
          </Button>
        </div>
      )}
    </Card>
  );
}
