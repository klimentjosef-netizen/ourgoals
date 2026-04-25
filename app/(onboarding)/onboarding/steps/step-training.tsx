"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Check } from "lucide-react";
import type { TrainingSetupData } from "@/types/onboarding";

const EXPERIENCE_OPTIONS = [
  { value: "beginner" as const, label: "Za\u010d\u00e1te\u010dn\u00edk" },
  { value: "intermediate" as const, label: "Pokro\u010dil\u00fd" },
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
  { value: "maintain" as const, label: "Udr\u017eet" },
  { value: "recomp" as const, label: "Recomposition" },
];

const TEMPLATE_PLANS = [
  {
    value: "fullbody3" as const,
    title: "Full Body 3x",
    desc: "3 tr\u00e9ninky t\u00fddn\u011b, cel\u00e9 t\u011blo ka\u017ed\u00fd tr\u00e9nink. Ide\u00e1ln\u00ed pro za\u010d\u00e1te\u010dn\u00edky.",
  },
  {
    value: "upperlower4" as const,
    title: "Upper-Lower 4x",
    desc: "2x horn\u00ed t\u011blo, 2x doln\u00ed. Dobr\u00fd kompromis objemu a frekvence.",
  },
  {
    value: "ppl6" as const,
    title: "PPL 6x",
    desc: "Push/Pull/Legs 2x t\u00fddn\u011b. Pro pokro\u010dil\u00e9 s v\u00edc \u010dasu.",
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
      e.weightKg = "V\u00e1ha mus\u00ed b\u00fdt 30\u2013300 kg";
    }
    if (data.heightCm !== undefined && (data.heightCm < 100 || data.heightCm > 250)) {
      e.heightCm = "V\u00fd\u0161ka mus\u00ed b\u00fdt 100\u2013250 cm";
    }
    if (data.bodyFatPct !== undefined && (data.bodyFatPct < 3 || data.bodyFatPct > 60)) {
      e.bodyFatPct = "Body fat mus\u00ed b\u00fdt 3\u201360%";
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
      title="Tr\u00e9nink & t\u011blo"
      subtitle="Nastav si z\u00e1kladn\u00ed parametry tr\u00e9ninku."
      helperText="\u0158ekni n\u00e1m o sv\u00e9m tr\u00e9ninku, abychom ti mohli pomoct."
      icon={Dumbbell}
      onNext={handleNext}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-8">
        {/* Section 1: Tv\u016fj tr\u00e9nink */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Tv\u016fj tr\u00e9nink
          </h3>

          {/* Zku\u0161enost */}
          <div className="space-y-2">
            <Label>Zku\u0161enost</Label>
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

          {/* Kolikr\u00e1t t\u00fddn\u011b */}
          <div className="space-y-2">
            <Label>Kolikr\u00e1t t\u00fddn\u011b</Label>
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
              <span className="text-sm text-muted-foreground">x t\u00fddn\u011b</span>
            </div>
          </div>

          {/* Kde cvi\u010d\u00ed\u0161 */}
          <div className="space-y-2">
            <Label>Kde cvi\u010d\u00ed\u0161</Label>
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

        {/* Section 2: T\u011blesn\u00e9 metriky */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            T\u011blesn\u00e9 metriky
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="weight">V\u00e1ha (kg)</Label>
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
              <Label htmlFor="height">V\u00fd\u0161ka (cm)</Label>
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
              <Label htmlFor="bf">Body fat % (voliteln\u00e9)</Label>
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

          {/* C\u00edl */}
          <div className="space-y-2">
            <Label>C\u00edl</Label>
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

        {/* Section 3: Tr\u00e9ninkov\u00fd pl\u00e1n */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Tr\u00e9ninkov\u00fd pl\u00e1n
          </h3>
          <p className="text-xs text-muted-foreground -mt-3">
            Vyber \u0161ablonu nebo si vytvo\u0159 vlastn\u00ed pozd\u011bji.
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
              <span className="text-sm font-medium">Vytvo\u0159\u00edm si vlastn\u00ed</span>
            </button>
          </div>
        </div>
      </div>
    </StepContainer>
  );
}
