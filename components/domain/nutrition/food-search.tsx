"use client";

import { useState, useTransition, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Plus, Loader2 } from "lucide-react";
import { searchFoods, addMealItem } from "@/app/(app)/nutrition/actions";
import type { FoodItem } from "@/types/nutrition";

interface FoodSearchProps {
  mealId: string;
  userId: string;
  onItemAdded?: () => void;
}

export function FoodSearch({ mealId, userId, onItemAdded }: FoodSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState(100);
  const [isSearching, startSearch] = useTransition();
  const [isAdding, startAdd] = useTransition();

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      if (value.length < 2) {
        setResults([]);
        return;
      }
      startSearch(async () => {
        const foods = await searchFoods(value, userId);
        setResults(foods);
      });
    },
    [userId]
  );

  function handleSelect(food: FoodItem) {
    setSelectedFood(food);
    setResults([]);
    setQuery(food.name);
  }

  function handleAdd() {
    if (!selectedFood) return;
    startAdd(async () => {
      await addMealItem(mealId, selectedFood.id, grams);
      setSelectedFood(null);
      setQuery("");
      setGrams(100);
      onItemAdded?.();
    });
  }

  const preview = selectedFood
    ? {
        kcal: Math.round(
          (selectedFood.kcal_per_100g * grams) / 100
        ),
        protein:
          Math.round(
            ((selectedFood.protein_g * grams) / 100) * 10
          ) / 10,
        carbs:
          Math.round(
            ((selectedFood.carbs_g * grams) / 100) * 10
          ) / 10,
        fat:
          Math.round(
            ((selectedFood.fat_g * grams) / 100) * 10
          ) / 10,
      }
    : null;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Hledat potravinu..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-8 h-9 text-sm"
        />
        {isSearching && (
          <Loader2
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
          />
        )}
      </div>

      {results.length > 0 && !selectedFood && (
        <Card className="max-h-48 overflow-y-auto divide-y">
          {results.map((food) => (
            <button
              key={food.id}
              className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
              onClick={() => handleSelect(food)}
            >
              <p className="text-xs font-medium truncate">
                {food.name}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {food.kcal_per_100g}kcal {food.protein_g}P{" "}
                {food.carbs_g}C {food.fat_g}F /100g
              </p>
            </button>
          ))}
        </Card>
      )}

      {selectedFood && (
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">
                Gramaz
              </label>
              <Input
                type="number"
                value={grams}
                onChange={(e) =>
                  setGrams(Number(e.target.value))
                }
                className="h-9 text-sm font-mono"
                min={1}
              />
            </div>
            <Button
              onClick={handleAdd}
              disabled={isAdding || grams <= 0}
              size="sm"
              className="h-9"
            >
              {isAdding ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <Plus size={14} />
              )}
              Pridat
            </Button>
          </div>
          {preview && (
            <p className="text-[10px] font-mono text-muted-foreground">
              {preview.kcal}kcal {preview.protein}P{" "}
              {preview.carbs}C {preview.fat}F pro {grams}g
            </p>
          )}
        </div>
      )}
    </div>
  );
}
