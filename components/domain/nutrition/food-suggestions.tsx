"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Lightbulb } from "lucide-react";

interface Suggestion {
  macro: string;
  label: string;
  foods: { name: string; grams: number; value: number }[];
}

interface FoodSuggestionsProps {
  suggestions: Suggestion[];
  remainingP: number;
  remainingC: number;
  remainingF: number;
}

export function FoodSuggestions({
  suggestions,
  remainingP,
  remainingC,
  remainingF,
}: FoodSuggestionsProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || suggestions.length === 0) return null;

  return (
    <Card className="p-3 border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Lightbulb size={16} className="text-amber-500 shrink-0" />
          <p className="text-xs font-semibold">Co jíst teď?</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => setDismissed(true)}
        >
          <X size={14} />
        </Button>
      </div>

      <div className="space-y-2">
        {suggestions.map((s) => {
          const remaining =
            s.macro === "P" ? remainingP : s.macro === "C" ? remainingC : remainingF;
          return (
            <div key={s.macro}>
              <p className="text-[11px] text-muted-foreground mb-1">
                Zbývá <span className="font-semibold text-foreground">{Math.round(remaining)}g</span>{" "}
                {s.label}. Zkus:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {s.foods.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[10px] bg-background border rounded-md px-2 py-1 font-mono"
                  >
                    {f.name} {f.grams}g
                    <span className="text-muted-foreground">({f.value}g {s.macro})</span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
