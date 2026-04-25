"use client";

import { useState, useMemo } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UtensilsCrossed, Check, Zap } from "lucide-react";
import type { NutritionSetupData, TrainingSetupData } from "@/types/onboarding";

const TRACKING_LEVELS = [
  {
    value: "macros" as const,
    title: "P\u0159esn\u011b (makra)",
    desc: "Sleduj kalorie, protein, sacharidy i tuky.",
  },
  {
    value: "kcal_only" as const,
    title: "P\u0159ibli\u017en\u011b (jen kcal)",
    desc: "Sleduj jen celkov\u00e9 kalorie.",
  },
  {
    value: "none" as const,
    title: "Nechci sledovat",
    desc: "\u017d\u00e1dn\u00e9 po\u010d\u00edt\u00e1n\u00ed, jen tipy.",
  },
];

const ALLERGY_OPTIONS = [
  { id: "lactose", label: "Lakt\u00f3za" },
  { id: "gluten", label: "Lepek" },
  { id: "nuts", label: "O\u0159echy" },
  { id: "soy", label: "S\u00f3ja" },
  { id: "none", label: "\u017d\u00e1dn\u00e9" },
];

const DIET_OPTIONS = [
  { value: "none" as const, label: "Bez omezen\u00ed" },
  { value: "vegetarian" as const, label: "Veget\u00e1ri\u00e1n" },
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
        e.targetKcal = "Kalorie mus\u00ed b\u00fdt 800\u20136000";
      }
      if (data.proteinG !== undefined && (data.proteinG < 20 || data.proteinG > 500)) {
        e.proteinG = "Protein mus\u00ed b\u00fdt 20\u2013500g";
      }
      if (data.carbsG !== undefined && (data.carbsG < 20 || data.carbsG > 800)) {
        e.carbsG = "Sacharidy mus\u00ed b\u00fdt 20\u2013800g";
      }
      if (data.fatG !== undefined && (data.fatG < 10 || data.fatG > 300)) {
        e.fatG = "Tuky mus\u00ed b\u00fdt 10\u2013300g";
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
      title="J\u00eddlo & v\u00fd\u017eiva"
      subtitle="Nastav si, jak detailn\u011b chce\u0161 sledovat stravu."
      helperText="Pokud nev\u00ed\u0161, za\u010dni s doporu\u010den\u00fdmi hodnotami a uprav pozd\u011bji."
      icon={UtensilsCrossed}
      onNext={handleNext}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-8">
        {/* Section 1: Jak detailn\u011b sledovat */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Jak detailn\u011b sledovat?
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

        {/* Section 2: C\u00edle (only if tracking) */}
        {isTracking && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              C\u00edle
            </h3>

            {/* Recommendation banner */}
            {recommended && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Zap size={16} className="text-primary mt-0.5 shrink-0" />
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium">
                    Doporu\u010deno: {recommended.kcal} kcal, {recommended.protein}g P,{" "}
                    {recommended.carbs}g C, {recommended.fat}g F
                  </p>
                  <button
                    type="button"
                    onClick={applyRecommended}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Pou\u017e\u00edt doporu\u010den\u00e9 hodnoty
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="kcal">Denn\u00ed kcal</Label>
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

          {/* Stravov\u00e1n\u00ed */}
          <div className="space-y-2">
            <Label>Stravov\u00e1n\u00ed</Label>
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

          {/* J\u00eddel denn\u011b */}
          <div className="space-y-2">
            <Label>J\u00eddel denn\u011b</Label>
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
      </div>
    </StepContainer>
  );
}
