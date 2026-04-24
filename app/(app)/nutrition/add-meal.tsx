"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Search, Zap } from "lucide-react";
import { createMeal, quickAddMeal } from "@/app/(app)/nutrition/actions";
import { FoodSearch } from "@/components/domain/nutrition/food-search";
import { MEAL_TYPE_OPTIONS } from "@/types/nutrition";
import type { MealType } from "@/types/nutrition";
import { toast } from "sonner";

interface AddMealProps {
  userId: string;
  date: string;
  onDone?: () => void;
}

export function AddMealForm({ userId, date, onDone }: AddMealProps) {
  const [tab, setTab] = useState("search");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [createdMealId, setCreatedMealId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Quick add state
  const [quickKcal, setQuickKcal] = useState("");
  const [quickProtein, setQuickProtein] = useState("");
  const [quickCarbs, setQuickCarbs] = useState("");
  const [quickFat, setQuickFat] = useState("");
  const [quickNotes, setQuickNotes] = useState("");

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

  function handleQuickAdd() {
    const fd = new FormData();
    fd.set("date", date);
    fd.set("meal_type", mealType);
    fd.set("kcal", quickKcal);
    fd.set("protein", quickProtein);
    fd.set("carbs", quickCarbs);
    fd.set("fat", quickFat);
    fd.set("notes", quickNotes);

    startTransition(async () => {
      const result = await quickAddMeal(fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Jídlo přidáno!");
        onDone?.();
      }
    });
  }

  // Meal type selector (shared between tabs)
  const mealTypeSelector = (
    <div className="space-y-1">
      <Label className="text-xs">Typ jídla</Label>
      <Select value={mealType} onValueChange={(v) => { if (v) setMealType(v as MealType); }}>
        <SelectTrigger className="h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MEAL_TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="search" className="flex-1 gap-1">
            <Search size={14} />
            Vyhledat
          </TabsTrigger>
          <TabsTrigger value="quick" className="flex-1 gap-1">
            <Zap size={14} />
            Rychlý zápis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-3 mt-3">
          {!createdMealId ? (
            <>
              {mealTypeSelector}
              <Button onClick={handleCreateMeal} disabled={isPending} className="w-full h-11">
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Vytvořit jídlo a hledat potraviny
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Jídlo vytvořeno. Hledej a přidávej potraviny:
              </p>
              <FoodSearch mealId={createdMealId} userId={userId} />
              <Button variant="outline" className="w-full h-11" onClick={onDone}>
                Hotovo
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="quick" className="space-y-3 mt-3">
          {mealTypeSelector}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Kalorie (kcal)</Label>
              <Input className="h-11 font-mono" type="number" placeholder="500" value={quickKcal} onChange={(e) => setQuickKcal(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Protein (g)</Label>
              <Input className="h-11 font-mono" type="number" placeholder="30" value={quickProtein} onChange={(e) => setQuickProtein(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sacharidy (g)</Label>
              <Input className="h-11 font-mono" type="number" placeholder="60" value={quickCarbs} onChange={(e) => setQuickCarbs(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tuky (g)</Label>
              <Input className="h-11 font-mono" type="number" placeholder="15" value={quickFat} onChange={(e) => setQuickFat(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Co to bylo? (nepovinné)</Label>
            <Input className="h-11" placeholder="Např. oběd v restauraci" value={quickNotes} onChange={(e) => setQuickNotes(e.target.value)} />
          </div>

          <Button onClick={handleQuickAdd} disabled={isPending || !quickKcal} className="w-full h-11">
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            Přidat rychlý zápis
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
