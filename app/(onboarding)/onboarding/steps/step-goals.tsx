"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Target } from "lucide-react";
import type { GoalSetupData } from "@/types/onboarding";

export function StepGoals() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const data = (moduleSetups.goals_habits ?? {}) as Partial<GoalSetupData>;

  const update = (partial: Partial<GoalSetupData>) => {
    setModuleSetup("goals_habits", { ...data, ...partial });
  };

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (data.targetDate && new Date(data.targetDate) < new Date(new Date().toISOString().split("T")[0])) {
      e.targetDate = "Deadline nemůže být v minulosti";
    }
    if (data.targetValue !== undefined && data.targetValue <= 0) {
      e.targetValue = "Cílová hodnota musí být větší než 0";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) nextStep();
  }

  return (
    <StepContainer
      title="Tvůj první cíl"
      subtitle="Nastav si první cíl."
      helperText="Můžeš přeskočit a přidat cíle později."
      icon={Target}
      onNext={handleNext}
      onPrev={prevStep}
      onSkip={nextStep}
      canSkip
      canProceed
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="goalTitle">Název cíle</Label>
          <Input id="goalTitle" className="h-11" placeholder="Např. Zhubnout 5 kg" value={data.title ?? ""} onChange={(e) => update({ title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="goalDesc">Popis</Label>
          <Textarea id="goalDesc" placeholder="Proč je pro tebe tento cíl důležitý?" value={data.description ?? ""} onChange={(e) => update({ description: e.target.value })} rows={2} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="goalMetric">Metrika (co měříš)</Label>
          <Input id="goalMetric" className="h-11" placeholder="Např. váha v kg" value={data.metric ?? ""} onChange={(e) => update({ metric: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="goalTarget">Cílová hodnota</Label>
            <Input id="goalTarget" className="h-11" type="number" placeholder="80" value={data.targetValue ?? ""} onChange={(e) => update({ targetValue: e.target.value ? Number(e.target.value) : undefined })} />
            {errors.targetValue && <p className="text-xs text-red-500 mt-1">{errors.targetValue}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="goalStart">Aktuální hodnota</Label>
            <Input id="goalStart" className="h-11" type="number" placeholder="85" value={data.startValue ?? ""} onChange={(e) => update({ startValue: e.target.value ? Number(e.target.value) : undefined })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="goalDeadline">Deadline</Label>
          <Input id="goalDeadline" className="h-11" type="date" min={new Date().toISOString().split("T")[0]} value={data.targetDate ?? ""} onChange={(e) => update({ targetDate: e.target.value })} />
          {errors.targetDate && <p className="text-xs text-red-500 mt-1">{errors.targetDate}</p>}
        </div>
      </div>
    </StepContainer>
  );
}
