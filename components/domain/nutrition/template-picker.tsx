"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createMealFromTemplate,
  deleteTemplate,
} from "@/app/(app)/nutrition/actions";
import { MEAL_TYPE_LABELS } from "@/types/nutrition";
import type { MealTemplate, MealType } from "@/types/nutrition";

interface TemplatePickerProps {
  templates: MealTemplate[];
  date: string;
}

export function TemplatePicker({ templates, date }: TemplatePickerProps) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (templates.length === 0) return null;

  function handleUseTemplate(templateId: string) {
    startTransition(async () => {
      const result = await createMealFromTemplate(templateId, date);
      if (result.error) {
        toast.error("Nepodařilo se vytvořit jídlo ze šablony");
      } else {
        toast.success("Jídlo přidáno ze šablony");
      }
    });
  }

  function handleDeleteTemplate(templateId: string) {
    startTransition(async () => {
      const result = await deleteTemplate(templateId);
      if (result.error) {
        toast.error("Nepodařilo se smazat šablonu");
      } else {
        toast.success("Šablona smazána");
      }
      setDeletingId(null);
    });
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Šablony (oblíbená jídla)
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
        {templates.map((tpl) => (
          <Card
            key={tpl.id}
            className="shrink-0 snap-start p-3 w-44 cursor-pointer hover:bg-muted/50 transition-colors relative group"
            onClick={() => {
              if (deletingId !== tpl.id) handleUseTemplate(tpl.id);
            }}
          >
            {/* Delete button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                if (deletingId === tpl.id) {
                  handleDeleteTemplate(tpl.id);
                } else {
                  setDeletingId(tpl.id);
                }
              }}
              disabled={isPending}
            >
              <Trash2 size={12} />
            </Button>

            {deletingId === tpl.id && (
              <div
                className="absolute inset-0 bg-background/90 rounded-lg flex items-center justify-center gap-2 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-[10px] text-destructive">Smazat?</span>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => handleDeleteTemplate(tpl.id)}
                  disabled={isPending}
                >
                  Ano
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => setDeletingId(null)}
                >
                  Ne
                </Button>
              </div>
            )}

            <p className="text-xs font-semibold truncate pr-5">{tpl.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              {tpl.meal_type && (
                <Badge variant="outline" className="text-[9px] px-1 py-0">
                  {MEAL_TYPE_LABELS[tpl.meal_type as MealType]}
                </Badge>
              )}
              <span className="text-[10px] text-muted-foreground font-mono">
                {tpl.items.length} {tpl.items.length === 1 ? "položka" : tpl.items.length < 5 ? "položky" : "položek"}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
