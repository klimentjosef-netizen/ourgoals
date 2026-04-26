"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UtensilsCrossed, Check, Zap, Pill } from "lucide-react";
import type { NutritionSetupData, TrainingSetupData } from "@/types/onboarding";

const TRACKING_LEVELS = [
  {
    value: "macros" as const,
    title: "Přesně (makra)",
    desc: "Sleduj kalorie, protein, sacharidy i tuky.",
  },
  {
    value: "kcal_only" as const,
    title: "Přibližně (jen kcal)",
    desc: "Sleduj jen celkové kalorie.",
  },
  {
    value: "none" as const,
    title: "Nechci sledovat",
    desc: "Žádné počítání, jen tipy.",
  },
];

const ALLERGY_OPTIONS = [
  { id: "lactose", label: "Laktóza" },
  { id: "gluten", label: "Lepek" },
  { id: "nuts", label: "Ořechy" },
  { id: "soy", label: "Sója" },
  { id: "none", label: "Žádné" },
];

const DIET_OPTIONS = [
  { value: "none" as const, label: "Bez omezení" },
  { value: "vegetarian" as const, label: "Vegetárián" },
  { value: "vegan" as const, label: "Vegan" },
];

const MEALS_OPTIONS = [3, 4, 5];

/** Calculate recommended macros from weight and goal */
function calculateRecommended(
  weightKg?: number,
  goal?: string
): { kcal: number; protein: number; carbs: number; fat: number } | null {
  if (!weightKg) return null;

  // Base multiplier for maintenance
  let kcalPerKg = 28; // light activity baseline
  if (goal === "cut") kcalPerKg = 24;
  else if (goal === "bulk") kcalPerKg = 32;
  else if (goal === "recomp") kcalPerKg = 27;

  const kcal = Math.round(weightKg * kcalPerKg);
  const protein = Math.round(weightKg * 2); // 2g/kg
  const fat = Math.round(weightKg * 0.9); // 0.9g/kg
  const fatKcal = fat * 9;
  const proteinKcal = protein * 4;
  const carbsKcal = kcal - proteinKcal - fatKcal;
  const carbs = Math.max(50, Math.round(carbsKcal / 4));

  return { kcal, protein, carbs, fat };
}

export function StepNutrition() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const data = (moduleSetups.nutrition ?? {
    trackingLevel: "macros",
    dietType: "none",
    mealsPerDay: 3,
    allergies: [],
  }) as Partial<NutritionSetupData>;

  const trainingData = (moduleSetups.training ?? {}) as Partial<TrainingSetupData>;

  const update = (partial: Partial<NutritionSetupData>) => {
    setModuleSetup("nutrition", { ...data, ...partial });
  };

  const recommended = useMemo(
    () => calculateRecommended(trainingData.weightKg, trainingData.trainingGoal),
    [trainingData.weightKg, trainingData.trainingGoal]
  );

  const isTracking = data.trackingLevel !== "none";

  // Auto-apply recommended on first render if no user-set values
  const didAutoApply = useRef(false);
  useEffect(() => {
    if (!didAutoApply.current && recommended && isTracking && !data.targetKcal && !data.proteinG) {
      update({
        targetKcal: recommended.kcal,
        proteinG: recommended.protein,
        carbsG: recommended.carbs,
        fatG: recommended.fat,
      });
      didAutoApply.current = true;
    }
  }, [recommended, isTracking]); // eslint-disable-line react-hooks/exhaustive-deps

  // Supplement recommendations based on goal
  const supplements = useMemo(() => {
    const list: { name: string; reason: string }[] = [];
    const goal = trainingData.trainingGoal;
    if (goal === "bulk" || goal === "recomp") {
      list.push({ name: "Kreatin (5g/den)", reason: "Zvyšuje sílu a objem svalů" });
    }
    if (recommended && recommended.protein > 120) {
      list.push({ name: "Protein (whey/isolát)", reason: "Pomůže dosáhnout proteinového cíle" });
    }
    if (goal === "cut") {
      list.push({ name: "Kofein před tréninkem", reason: "Zvyšuje výkon při deficitu" });
    }
    list.push({ name: "Omega-3 (rybí olej)", reason: "Podpora kloubů a regenerace" });
    list.push({ name: "Vitamin D (2000 IU)", reason: "Většina populace má deficit" });
    return list;
  }, [trainingData.trainingGoal, recommended]);

  function applyRecommended() {
    if (!recommended) return;
    update({
      targetKcal: recommended.kcal,
      proteinG: recommended.protein,
      carbsG: recommended.carbs,
      fatG: recommended.fat,
    });
  }

  function toggleAllergy(id: string) {
    const current = data.allergies ?? [];
    if (id === "none") {
      update({ allergies: current.includes("none") ? [] : ["none"] });
      return;
    }
    // Remove "none" if adding specific allergy
    const withoutNone = current.filter((a) => a !== "none");
    const next = withoutNone.includes(id)
      ? withoutNone.filter((a) => a !== id)
      : [...withoutNone, id];
    update({ allergies: next });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (isTracking) {
      if (data.targetKcal !== undefined && (data.targetKcal < 800 || data.targetKcal > 6000)) {
        e.targetKcal = "Kalorie musí být 800–6000";
      }
      if (data.proteinG !== undefined && (data.proteinG < 20 || data.proteinG > 500)) {
        e.proteinG = "Protein musí být 20–500g";
      }
      if (data.carbsG !== undefined && (data.carbsG < 20 || data.carbsG > 800)) {
        e.carbsG = "Sacharidy musí být 20–800g";
      }
      if (data.fatG !== undefined && (data.fatG < 10 || data.fatG > 300)) {
        e.fatG = "Tuky musí být 10–300g";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) nextStep();
  }

  return (
    <StepContainer
      title="Jídlo & výživa"
      subtitle="Nastav si, jak detailně chceš sledovat stravu."
      helperText="Pokud nevíš, začni s doporučenými hodnotami a uprav později."
      icon={UtensilsCrossed}
      onNext={handleNext}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-8">
        {/* Section 1: Jak detailně sledovat */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Jak detailně sledovat?
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {TRACKING_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => update({ trackingLevel: level.value })}
                className={`relative flex flex-col items-start gap-1 p-4 rounded-lg border-2 transition-all text-left ${
                  data.trackingLevel === level.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {data.trackingLevel === level.value && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check size={12} className="text-primary-foreground" />
                  </div>
                )}
                <span className="font-semibold text-sm">{level.title}</span>
                <span className="text-xs text-muted-foreground">{level.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Cíle (only if tracking) */}
        {isTracking && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Cíle
            </h3>

            {/* Recommendation banner */}
            {recommended && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Zap size={16} className="text-primary mt-0.5 shrink-0" />
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium">
                    Doporučeno: {recommended.kcal} kcal, {recommended.protein}g P,{" "}
                    {recommended.carbs}g C, {recommended.fat}g F
                  </p>
                  <button
                    type="button"
                    onClick={applyRecommended}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Použít doporučené hodnoty
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="kcal">Denní kcal</Label>
              <Input
                id="kcal"
                className="h-11"
                type="number"
                placeholder="2200"
                value={data.targetKcal ?? ""}
                onChange={(e) =>
                  update({
                    targetKcal: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
              {errors.targetKcal && (
                <p className="text-xs text-red-500 mt-1">{errors.targetKcal}</p>
              )}
            </div>

            {data.trackingLevel === "macros" && (
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    className="h-11"
                    type="number"
                    placeholder="160"
                    value={data.proteinG ?? ""}
                    onChange={(e) =>
                      update({
                        proteinG: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                  {errors.proteinG && (
                    <p className="text-xs text-red-500 mt-1">{errors.proteinG}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs">Sacharidy (g)</Label>
                  <Input
                    id="carbs"
                    className="h-11"
                    type="number"
                    placeholder="250"
                    value={data.carbsG ?? ""}
                    onChange={(e) =>
                      update({
                        carbsG: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                  {errors.carbsG && (
                    <p className="text-xs text-red-500 mt-1">{errors.carbsG}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat">Tuky (g)</Label>
                  <Input
                    id="fat"
                    className="h-11"
                    type="number"
                    placeholder="70"
                    value={data.fatG ?? ""}
                    onChange={(e) =>
                      update({
                        fatG: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                  {errors.fatG && (
                    <p className="text-xs text-red-500 mt-1">{errors.fatG}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 3: Preference */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Preference
          </h3>

          {/* Alergie */}
          <div className="space-y-3">
            <Label>Alergie / intolerance</Label>
            <div className="flex flex-wrap gap-3">
              {ALLERGY_OPTIONS.map((opt) => {
                const checked = (data.allergies ?? []).includes(opt.id);
                return (
                  <div key={opt.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`allergy-${opt.id}`}
                      checked={checked}
                      onCheckedChange={() => toggleAllergy(opt.id)}
                    />
                    <Label htmlFor={`allergy-${opt.id}`} className="font-normal text-sm">
                      {opt.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stravování */}
          <div className="space-y-2">
            <Label>Stravování</Label>
            <div className="grid grid-cols-3 gap-2">
              {DIET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ dietType: opt.value })}
                  className={`h-11 rounded-lg text-sm font-medium transition-all border-2 ${
                    data.dietType === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Jídel denně */}
          <div className="space-y-2">
            <Label>Jídel denně</Label>
            <div className="grid grid-cols-3 gap-2">
              {MEALS_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => update({ mealsPerDay: n })}
                  className={`h-11 rounded-lg text-sm font-medium transition-all border-2 ${
                    data.mealsPerDay === n
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Doporučené doplňky */}
        {isTracking && supplements.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Pill size={14} />
              Doporučené doplňky
            </h3>
            <p className="text-xs text-muted-foreground -mt-1">
              Na základě tvého cíle a tréninku.
            </p>
            <div className="space-y-2">
              {supplements.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <span className="text-primary font-bold text-sm mt-0.5">+</span>
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.reason}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/60">
              Pouze informativní. Konzultuj s lékařem.
            </p>
          </div>
        )}
      </div>
    </StepContainer>
  );
}
