"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Bookmark,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { FoodItemRow } from "@/components/domain/nutrition/food-item-row";
import { calculateMealMacros } from "@/lib/logic/macros";
import { deleteMeal, saveMealAsTemplate } from "@/app/(app)/nutrition/actions";
import { MEAL_TYPE_LABELS } from "@/types/nutrition";
import type { MealWithItems } from "@/types/nutrition";

interface MealCardProps {
  meal: MealWithItems;
  onAddItem?: (mealId: string) => void;
}

export function MealCard({ meal, onAddItem }: MealCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showTemplateSave, setShowTemplateSave] = useState(false);
  const [showPhotoHint, setShowPhotoHint] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  function handleDeleteMeal() {
    startTransition(async () => {
      const result = await deleteMeal(meal.id);
      if (result.error) {
        toast.error("Nepodařilo se smazat jídlo");
      } else {
        toast.success("Jídlo smazáno");
      }
      setConfirmDelete(false);
    });
  }

  function handleSaveTemplate() {
    if (!templateName.trim()) return;
    startTransition(async () => {
      const result = await saveMealAsTemplate(meal.id, templateName.trim());
      if (result.error) {
        toast.error("Nepodařilo se uložit šablonu");
      } else {
        toast.success("Šablona uložena");
        setShowTemplateSave(false);
        setTemplateName("");
      }
    });
  }

  return (
    <Card className="p-3">
      {/* Header */}
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

          {/* Delete meal button */}
          {!confirmDelete ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(true);
              }}
            >
              <Trash2 size={14} />
            </Button>
          ) : (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[10px] text-destructive">
                Opravdu smazat?
              </span>
              <Button
                variant="destructive"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={handleDeleteMeal}
                disabled={isPending}
              >
                Ano
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => setConfirmDelete(false)}
              >
                Ne
              </Button>
            </div>
          )}

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
            <div className="flex items-center gap-1">
              {/* Photo placeholder (Feature 12) */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground relative"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPhotoHint(!showPhotoHint);
                  setTimeout(() => setShowPhotoHint(false), 2000);
                }}
              >
                <Camera size={14} />
                Foto
                {showPhotoHint && (
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] bg-popover border rounded px-2 py-0.5 shadow-sm z-10">
                    Brzy dostupné
                  </span>
                )}
              </Button>

              {/* Save as template */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTemplateSave(!showTemplateSave);
                }}
              >
                <Bookmark size={14} />
                Šablona
              </Button>

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

          {/* Template save inline form */}
          {showTemplateSave && (
            <div
              className="flex items-center gap-2 pt-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Input
                type="text"
                placeholder="Název šablony..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTemplate();
                }}
                className="h-7 text-xs flex-1"
                autoFocus
              />
              <Button
                variant="default"
                size="sm"
                className="h-7 text-xs px-3"
                onClick={handleSaveTemplate}
                disabled={isPending || !templateName.trim()}
              >
                Uložit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => {
                  setShowTemplateSave(false);
                  setTemplateName("");
                }}
              >
                Zrušit
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
