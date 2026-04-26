"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dumbbell, Check, Info } from "lucide-react";
import type { TrainingSetupData } from "@/types/onboarding";

const EXPERIENCE_OPTIONS = [
  { value: "beginner" as const, label: "Začátečník", desc: "Méně než rok zkušeností" },
  { value: "intermediate" as const, label: "Pokročilý", desc: "1-3 roky pravidelného tréninku" },
  { value: "advanced" as const, label: "Expert", desc: "3+ let, znám progresivní přetěžování" },
];

const ACTIVITY_TYPES = [
  { id: "strength", label: "Silový trénink", emoji: "🏋️" },
  { id: "cardio", label: "Kardio", emoji: "🫀" },
  { id: "running", label: "Běh", emoji: "🏃" },
  { id: "cycling", label: "Cyklistika", emoji: "🚴" },
  { id: "swimming", label: "Plavání", emoji: "🏊" },
  { id: "yoga", label: "Jóga", emoji: "🧘" },
  { id: "crossfit", label: "CrossFit", emoji: "💪" },
  { id: "group", label: "Skupinové lekce", emoji: "👥" },
  { id: "martial", label: "Bojové sporty", emoji: "🥊" },
  { id: "hiking", label: "Turistika", emoji: "🥾" },
];

const LOCATION_OPTIONS = [
  { value: "gym" as const, label: "Posilovna" },
  { value: "home" as const, label: "Doma" },
  { value: "outdoor" as const, label: "Venku" },
  { value: "mix" as const, label: "Mix" },
];

const GOAL_OPTIONS = [
  { value: "cut" as const, label: "Zhubnout", desc: "Kalorický deficit" },
  { value: "bulk" as const, label: "Nabrat", desc: "Kalorický surplus" },
  { value: "maintain" as const, label: "Udržet", desc: "Rovnováha" },
  { value: "recomp" as const, label: "Recomp", desc: "Svaly nahoru, tuk dolů" },
];

const TEMPLATE_PLANS = [
  {
    value: "fullbody3" as const,
    title: "Full Body 3x",
    desc: "3 tréninky týdně, celé tělo každý trénink.",
    forLevel: ["beginner", "intermediate"],
  },
  {
    value: "upperlower4" as const,
    title: "Upper-Lower 4x",
    desc: "2x horní tělo, 2x dolní. Dobrý kompromis.",
    forLevel: ["intermediate", "advanced"],
  },
  {
    value: "ppl6" as const,
    title: "PPL 6x",
    desc: "Push/Pull/Legs 2x týdně. Maximum objemu.",
    forLevel: ["advanced"],
  },
];

export function StepTraining() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const data = (moduleSetups.training ?? {
    daysPerWeek: 4,
    trainingLocation: "gym",
    trainingGoal: "maintain",
  }) as Partial<TrainingSetupData> & {
    activityTypes?: string[];
    freeTextGoal?: string;
  };

  const selectedActivities = data.activityTypes ?? ["strength"];

  const update = (partial: Partial<TrainingSetupData> & { activityTypes?: string[]; freeTextGoal?: string }) => {
    setModuleSetup("training", { ...data, ...partial });
  };

  function toggleActivity(id: string) {
    const current = selectedActivities;
    const next = current.includes(id)
      ? current.filter((a) => a !== id)
      : [...current, id];
    update({ activityTypes: next.length > 0 ? next : ["strength"] });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (data.weightKg !== undefined && (data.weightKg < 30 || data.weightKg > 300)) {
      e.weightKg = "Váha musí být 30-300 kg";
    }
    if (data.heightCm !== undefined && (data.heightCm < 100 || data.heightCm > 250)) {
      e.heightCm = "Výška musí být 100-250 cm";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) nextStep();
  }

  const daysPerWeek = data.daysPerWeek ?? 4;
  const experienceLevel = data.experienceLevel ?? "beginner";

  // Filter templates by experience level
  const availableTemplates = TEMPLATE_PLANS.filter((t) =>
    t.forLevel.includes(experienceLevel)
  );

  return (
    <StepContainer
      title="Trénink & tělo"
      subtitle="Řekni nám o svém tréninku, abychom ti vytvořili plán na míru."
      helperText="Čím víc toho víme, tím lepší plán dostaneš."
      icon={Dumbbell}
      onNext={handleNext}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-8">
        {/* Section 1: Zkušenost */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Tvoje zkušenosti
          </h3>

          <div className="grid grid-cols-1 gap-2">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update({ experienceLevel: opt.value })}
                className={`relative flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left ${
                  experienceLevel === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {experienceLevel === opt.value && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check size={12} className="text-primary-foreground" />
                  </div>
                )}
                <span className="font-semibold text-sm">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Jaký sport */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Co cvičíš?
          </h3>
          <p className="text-xs text-muted-foreground -mt-2">Vyber vše co platí.</p>
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITY_TYPES.map((act) => {
              const isSelected = selectedActivities.includes(act.id);
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => toggleActivity(act.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <span className="text-lg">{act.emoji}</span>
                  <span className="text-sm font-medium">{act.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Frekvence a místo */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Frekvence a místo
          </h3>

          <div className="space-y-2">
            <Label>Kolikrát týdně</Label>
            <div className="flex items-center gap-4">
              <button type="button"
                className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center text-lg font-bold hover:bg-muted/70"
                onClick={() => update({ daysPerWeek: Math.max(1, daysPerWeek - 1) })}>-</button>
              <span className="text-2xl font-bold w-8 text-center">{daysPerWeek}</span>
              <button type="button"
                className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center text-lg font-bold hover:bg-muted/70"
                onClick={() => update({ daysPerWeek: Math.min(7, daysPerWeek + 1) })}>+</button>
              <span className="text-sm text-muted-foreground">x týdně</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Kde cvičíš</Label>
            <div className="grid grid-cols-4 gap-2">
              {LOCATION_OPTIONS.map((opt) => (
                <button key={opt.value} type="button"
                  onClick={() => update({ trainingLocation: opt.value })}
                  className={`h-11 rounded-lg text-xs font-medium transition-all border-2 ${
                    data.trainingLocation === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Metriky */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Tělesné metriky
          </h3>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label htmlFor="weight" className="text-xs">Váha (kg)</Label>
              <Input id="weight" className="h-11" type="number" placeholder="80"
                value={data.weightKg ?? ""}
                onChange={(e) => update({ weightKg: e.target.value ? Number(e.target.value) : undefined })} />
              {errors.weightKg && <p className="text-[10px] text-red-500">{errors.weightKg}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="height" className="text-xs">Výška (cm)</Label>
              <Input id="height" className="h-11" type="number" placeholder="180"
                value={data.heightCm ?? ""}
                onChange={(e) => update({ heightCm: e.target.value ? Number(e.target.value) : undefined })} />
              {errors.heightCm && <p className="text-[10px] text-red-500">{errors.heightCm}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="bf" className="text-xs">BF % (vol.)</Label>
              <Input id="bf" className="h-11" type="number" placeholder="15"
                value={data.bodyFatPct ?? ""}
                onChange={(e) => update({ bodyFatPct: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
          </div>

          {/* Cíl */}
          <div className="space-y-2">
            <Label>Cíl</Label>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map((opt) => (
                <button key={opt.value} type="button"
                  onClick={() => update({ trainingGoal: opt.value })}
                  className={`h-auto p-2.5 rounded-lg text-left transition-all border-2 ${
                    data.trainingGoal === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40"
                  }`}>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Plán (filtrovaný podle zkušenosti) */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Tréninkový plán
          </h3>

          {availableTemplates.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Info size={12} />
                Doporučené pro tvoji zkušenost
              </div>
              {availableTemplates.map((tmpl) => (
                <button key={tmpl.value} type="button"
                  onClick={() => update({ templatePlan: tmpl.value })}
                  className={`relative w-full flex flex-col items-start gap-1 p-4 rounded-lg border-2 transition-all text-left ${
                    data.templatePlan === tmpl.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}>
                  {data.templatePlan === tmpl.value && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check size={12} className="text-primary-foreground" />
                    </div>
                  )}
                  <span className="font-semibold text-sm">{tmpl.title}</span>
                  <span className="text-xs text-muted-foreground">{tmpl.desc}</span>
                </button>
              ))}
            </div>
          )}

          <button type="button"
            onClick={() => update({ templatePlan: "custom" })}
            className={`w-full flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
              data.templatePlan === "custom"
                ? "border-primary bg-primary/5"
                : "border-border border-dashed hover:border-primary/40"
            }`}>
            <span className="text-sm font-medium">Vytvořím si vlastní</span>
          </button>
        </div>

        {/* Section 6: Popíše se vlastními slovy */}
        <div className="space-y-2">
          <Label className="text-xs">Chceš nám říct víc? (volitelné)</Label>
          <Textarea
            placeholder="Např.: Chci zhubnout 5kg, běhat 3x týdně a 2x posilovnu. Mám problémy se zády..."
            rows={3}
            value={(data as { freeTextGoal?: string }).freeTextGoal ?? ""}
            onChange={(e) => update({ freeTextGoal: e.target.value })}
          />
          <p className="text-[10px] text-muted-foreground">
            Pomůže nám lépe pochopit tvoje potřeby.
          </p>
        </div>
      </div>
    </StepContainer>
  );
}
