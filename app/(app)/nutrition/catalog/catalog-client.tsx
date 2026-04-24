"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Search,
  Plus,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  searchFoods,
  createFoodItem,
} from "@/app/(app)/nutrition/actions";
import type { FoodItem } from "@/types/nutrition";

interface CatalogClientProps {
  userId: string;
  initialFoods: FoodItem[];
}

export function CatalogClient({
  userId,
  initialFoods,
}: CatalogClientProps) {
  const [query, setQuery] = useState("");
  const [foods, setFoods] =
    useState<FoodItem[]>(initialFoods);
  const [isSearching, startSearch] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [isCreating, startCreate] = useTransition();

  function handleSearch(value: string) {
    setQuery(value);
    if (value.length < 2) {
      setFoods(initialFoods);
      return;
    }
    startSearch(async () => {
      const results = await searchFoods(value, userId);
      setFoods(results);
    });
  }

  function handleCreate(fd: FormData) {
    startCreate(async () => {
      const result = await createFoodItem(fd);
      if (result.food) {
        setFoods((prev) => [
          result.food as FoodItem,
          ...prev,
        ]);
        setShowForm(false);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Hledat potravinu..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <ChevronUp size={14} />
          ) : (
            <Plus size={14} />
          )}
          Nova
        </Button>
      </div>

      {/* Add food form */}
      {showForm && (
        <Card>
          <CardContent className="pt-4">
            <form action={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <Label className="text-xs">Nazev</Label>
                  <Input
                    name="name"
                    required
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Znacka</Label>
                  <Input
                    name="brand"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">
                    kcal/100g
                  </Label>
                  <Input
                    name="kcal_per_100g"
                    type="number"
                    required
                    className="h-8 text-sm font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs">
                    Protein (g)
                  </Label>
                  <Input
                    name="protein_g"
                    type="number"
                    step="0.1"
                    required
                    className="h-8 text-sm font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs">
                    Sacharidy (g)
                  </Label>
                  <Input
                    name="carbs_g"
                    type="number"
                    step="0.1"
                    required
                    className="h-8 text-sm font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs">
                    Tuky (g)
                  </Label>
                  <Input
                    name="fat_g"
                    type="number"
                    step="0.1"
                    required
                    className="h-8 text-sm font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs">
                    Vlaknina (g)
                  </Label>
                  <Input
                    name="fiber_g"
                    type="number"
                    step="0.1"
                    className="h-8 text-sm font-mono"
                  />
                </div>
              </div>
              <Button
                type="submit"
                size="sm"
                className="w-full"
                disabled={isCreating}
              >
                {isCreating ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <Plus size={14} />
                )}
                Ulozit potravinu
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Food list */}
      {foods.length === 0 && (
        <Card>
          <CardContent className="pt-4 text-center text-muted-foreground text-sm">
            {query
              ? "Zadne vysledky."
              : "Katalog je prazdny. Spust seed-foods.sql."}
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {foods.map((food) => (
          <Card key={food.id}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {food.name}
                  </p>
                  {food.brand && (
                    <p className="text-xs text-muted-foreground">
                      {food.brand}
                    </p>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-mono shrink-0"
                >
                  {food.kcal_per_100g} kcal
                </Badge>
              </div>
              <div className="flex gap-3 mt-2 text-[10px] font-mono text-muted-foreground">
                <span className="text-blue-500">
                  P: {food.protein_g}g
                </span>
                <span className="text-amber-500">
                  C: {food.carbs_g}g
                </span>
                <span className="text-purple-500">
                  F: {food.fat_g}g
                </span>
                {food.fiber_g ? (
                  <span>Vl: {food.fiber_g}g</span>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
