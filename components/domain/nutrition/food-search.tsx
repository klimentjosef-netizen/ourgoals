"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Loader2, Globe, Star } from "lucide-react";
import { searchFoodsHybrid, saveOFFFood, addMealItem } from "@/app/(app)/nutrition/actions";
import type { FoodItem } from "@/types/nutrition";
import { toast } from "sonner";

interface FoodSearchProps {
  mealId: string;
  userId: string;
  onItemAdded?: () => void;
}

export function FoodSearch({ mealId, userId, onItemAdded }: FoodSearchProps) {
  const [query, setQuery] = useState("");
  const [localResults, setLocalResults] = useState<FoodItem[]>([]);
  const [offResults, setOffResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState(100);
  const [isSearching, startSearch] = useTransition();
  const [isAdding, startAdd] = useTransition();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      setSelectedFood(null);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.length < 2) {
        setLocalResults([]);
        setOffResults([]);
        return;
      }

      debounceRef.current = setTimeout(() => {
        startSearch(async () => {
          const { local, off } = await searchFoodsHybrid(value, userId);
          setLocalResults(local);
          setOffResults(off);
        });
      }, 300);
    },
    [userId]
  );

  async function handleSelectOFF(food: FoodItem) {
    // Save OFF product to local DB first
    const result = await saveOFFFood({
      name: food.name,
      brand: food.brand,
      kcal_per_100g: food.kcal_per_100g ?? 0,
      protein_g: food.protein_g ?? 0,
      carbs_g: food.carbs_g ?? 0,
      fat_g: food.fat_g ?? 0,
      fiber_g: food.fiber_g ?? null,
      off_code: food.id.replace("off_", ""),
    });

    if (result.food) {
      setSelectedFood(result.food as FoodItem);
    } else {
      // Fallback: use the OFF data directly (won't have real ID)
      setSelectedFood(food);
    }
    setLocalResults([]);
    setOffResults([]);
    setQuery(food.name);
  }

  function handleSelectLocal(food: FoodItem) {
    setSelectedFood(food);
    setLocalResults([]);
    setOffResults([]);
    setQuery(food.name);
  }

  function handleAdd() {
    if (!selectedFood) return;
    startAdd(async () => {
      await addMealItem(mealId, selectedFood.id, grams);
      toast.success("Potravina přidána");
      setSelectedFood(null);
      setQuery("");
      setGrams(100);
      onItemAdded?.();
    });
  }

  const preview = selectedFood
    ? {
        kcal: Math.round(((selectedFood.kcal_per_100g ?? 0) * grams) / 100),
        protein: Math.round(((selectedFood.protein_g ?? 0) * grams) / 100 * 10) / 10,
        carbs: Math.round(((selectedFood.carbs_g ?? 0) * grams) / 100 * 10) / 10,
        fat: Math.round(((selectedFood.fat_g ?? 0) * grams) / 100 * 10) / 10,
      }
    : null;

  const hasResults = localResults.length > 0 || offResults.length > 0;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Hledat potravinu (název nebo značka)..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-8 h-11 text-sm"
        />
        {isSearching && (
          <Loader2 size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {hasResults && !selectedFood && (
        <Card className="max-h-64 overflow-y-auto">
          {/* Local results */}
          {localResults.length > 0 && (
            <>
              <div className="px-3 py-1.5 bg-muted/50 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Star size={10} />
                Tvoje potraviny
              </div>
              {localResults.map((food) => (
                <button
                  key={food.id}
                  className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors border-b border-border last:border-0"
                  onClick={() => handleSelectLocal(food)}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium truncate">{food.name}</p>
                    <Badge variant="secondary" className="text-[9px] ml-2 shrink-0">{food.kcal_per_100g} kcal</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    P:{food.protein_g}g C:{food.carbs_g}g F:{food.fat_g}g /100g
                  </p>
                </button>
              ))}
            </>
          )}

          {/* OFF results */}
          {offResults.length > 0 && (
            <>
              <div className="px-3 py-1.5 bg-muted/50 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Globe size={10} />
                OpenFoodFacts
              </div>
              {offResults.map((food) => (
                <button
                  key={food.id}
                  className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors border-b border-border last:border-0"
                  onClick={() => handleSelectOFF(food)}
                >
                  <div className="flex items-center justify-between">
                    <div className="truncate">
                      <p className="text-xs font-medium truncate">{food.name}</p>
                      {food.brand && <p className="text-[10px] text-muted-foreground">{food.brand}</p>}
                    </div>
                    <Badge variant="outline" className="text-[9px] ml-2 shrink-0">{food.kcal_per_100g} kcal</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    P:{food.protein_g}g C:{food.carbs_g}g F:{food.fat_g}g /100g
                  </p>
                </button>
              ))}
            </>
          )}

          {!hasResults && query.length >= 2 && !isSearching && (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              Žádné výsledky pro &quot;{query}&quot;
            </p>
          )}
        </Card>
      )}

      {selectedFood && (
        <div className="space-y-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
          <p className="text-sm font-medium">{selectedFood.name}</p>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Gramáž</label>
              <Input
                type="number"
                value={grams}
                onChange={(e) => setGrams(Number(e.target.value))}
                className="h-11 text-sm font-mono"
                min={1}
              />
            </div>
            <Button onClick={handleAdd} disabled={isAdding || grams <= 0} className="h-11">
              {isAdding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Přidat
            </Button>
          </div>
          {preview && (
            <p className="text-[10px] font-mono text-muted-foreground">
              {preview.kcal} kcal • {preview.protein}g P • {preview.carbs}g C • {preview.fat}g F pro {grams}g
            </p>
          )}
        </div>
      )}
    </div>
  );
}
