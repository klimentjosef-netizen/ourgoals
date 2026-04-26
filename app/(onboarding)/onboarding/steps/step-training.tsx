"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Check } from "lucide-react";
import type { TrainingSetupData } from "@/types/onboarding";

const EXPERIENCE_OPTIONS = [
  { value: "beginner" as const, label: "Začátečník" },
  { value: "intermediate" as const, label: "Pokročilý" },
  { value: "advanced" as const, label: "Expert" },
];

const LOCATION_OPTIONS = [
  { value: "gym" as const, label: "Posilovna" },
  { value: "home" as const, label: "Doma" },
  { value: "outdoor" as const, label: "Venku" },
  { value: "mix" as const, label: "Mix" },
];

const GOAL_OPTIONS = [
  { value: "cut" as const, label: "Zhubnout" },
  { value: "bulk" as const, label: "Nabrat" },
  { value: "maintain" as const, label: "Udržet" },
  { value: "recomp" as const, label: "Recomposition" },
];

const TEMPLATE_PLANS = [
  {
    value: "fullbody3" as const,
    title: "Full Body 3x",
    desc: "3 tréninky týdně, celé tělo každý trénink. Ideální pro začátečníky.",
  },
  {
    value: "upperlower4" as const,
    title: "Upper-Lower 4x",
    desc: "2x horní tělo, 2x dolní. Dobrý kompromis objemu a frekvence.",
  },
  {
    value: "ppl6" as const,
    title: "PPL 6x",
    desc: "Push/Pull/Legs 2x týdně. Pro pokročilé s víc času.",
  },
];

export function StepTraining() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const data = (moduleSetups.training ?? {
    daysPerWeek: 4,
    trainingLocation: "gym",
    trainingGoal: "maintain",
  }) as Partial<TrainingSetupData>;

  const update = (partial: Partial<TrainingSetupData>) => {
    setModuleSetup("training", { ...data, ...partial });
  };

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (data.weightKg !== undefined && (data.weightKg < 30 || data.weightKg > 300)) {
      e.weightKg = "Váha musí být 30–300 kg";
    }
    if (data.heightCm !== undefined && (data.heightCm < 100 || data.heightCm > 250)) {
      e.heightCm = "Výška musí být 100–250 cm";
    }
    if (data.bodyFatPct !== undefined && (data.bodyFatPct < 3 || data.bodyFatPct > 60)) {
      e.bodyFatPct = "Body fat musí být 3–60%";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) nextStep();
  }

  const daysPerWeek = data.daysPerWeek ?? 4;

  return (
    <StepContainer
      title="Trénink & tělo"
      subtitle="Nastav si základní parametry tréninku."
      helperText="Řekni nám o svém tréninku, abychom ti mohli pomoct."
      icon={Dumbbell}
      onNext={handleNext}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-8">
        {/* Section 1: Tvůj trénink */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Tvůj trénink
          </h3>

          {/* Zkušenost */}
          <div className="space-y-2">
            <Label>Zkušenost</Label>
            <div className="grid grid-cols-3 gap-2">
              {EXPERIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ experienceLevel: opt.value })}
                  className={`h-11 rounded-lg text-sm font-medium transition-all border-2 ${
                    data.experienceLevel === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kolikrát týdně */}
          <div className="space-y-2">
            <Label>Kolikrát týdně</Label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center text-lg font-bold hover:bg-muted/70 transition-colors"
                onClick={() => update({ daysPerWeek: Math.max(2, daysPerWeek - 1) })}
              >
                -
              </button>
              <span className="text-2xl font-bold w-8 text-center">{daysPerWeek}</span>
              <button
                type="button"
                className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center text-lg font-bold hover:bg-muted/70 transition-colors"
                onClick={() => update({ daysPerWeek: Math.min(7, daysPerWeek + 1) })}
              >
                +
              </button>
              <span className="text-sm text-muted-foreground">x týdně</span>
            </div>
          </div>

          {/* Kde cvičíš */}
          <div className="space-y-2">
            <Label>Kde cvičíš</Label>
            <div className="grid grid-cols-4 gap-2">
              {LOCATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ trainingLocation: opt.value })}
                  className={`h-11 rounded-lg text-sm font-medium transition-all border-2 ${
                    data.trainingLocation === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Tělesné metriky */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Tělesné metriky
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="weight">Váha (kg)</Label>
              <Input
                id="weight"
                className="h-11"
                type="number"
                placeholder="80"
                value={data.weightKg ?? ""}
                onChange={(e) =>
                  update({
                    weightKg: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
              {errors.weightKg && (
                <p className="text-xs text-red-500 mt-1">{errors.weightKg}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Výška (cm)</Label>
              <Input
                id="height"
                className="h-11"
                type="number"
                placeholder="180"
                value={data.heightCm ?? ""}
                onChange={(e) =>
                  update({
                    heightCm: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
              {errors.heightCm && (
                <p className="text-xs text-red-500 mt-1">{errors.heightCm}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bf">Body fat % (volitelné)</Label>
              <Input
                id="bf"
                className="h-11"
                type="number"
                placeholder="15"
                value={data.bodyFatPct ?? ""}
                onChange={(e) =>
                  update({
                    bodyFatPct: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
              {errors.bodyFatPct && (
                <p className="text-xs text-red-500 mt-1">{errors.bodyFatPct}</p>
              )}
            </div>
          </div>

          {/* Cíl */}
          <div className="space-y-2">
            <Label>Cíl</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ trainingGoal: opt.value })}
                  className={`h-11 rounded-lg text-sm font-medium transition-all border-2 ${
                    data.trainingGoal === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Tréninkový plán */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Tréninkový plán
          </h3>
          <p className="text-xs text-muted-foreground -mt-3">
            Vyber šablonu nebo si vytvoř vlastní později.
          </p>

          <div className="grid grid-cols-1 gap-3">
            {TEMPLATE_PLANS.map((tmpl) => (
              <button
                key={tmpl.value}
                type="button"
                onClick={() => update({ templatePlan: tmpl.value })}
                className={`relative flex flex-col items-start gap-1 p-4 rounded-lg border-2 transition-all text-left ${
                  data.templatePlan === tmpl.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {data.templatePlan === tmpl.value && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check size={12} className="text-primary-foreground" />
                  </div>
                )}
                <span className="font-semibold text-sm">{tmpl.title}</span>
                <span className="text-xs text-muted-foreground">{tmpl.desc}</span>
              </button>
            ))}

            {/* Custom option */}
            <button
              type="button"
              onClick={() => update({ templatePlan: "custom" })}
              className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                data.templatePlan === "custom"
                  ? "border-primary bg-primary/5"
                  : "border-border border-dashed hover:border-primary/40"
              }`}
            >
              <span className="text-sm font-medium">Vytvořím si vlastní</span>
            </button>
          </div>
        </div>
      </div>
    </StepContainer>
  );
}
