"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell } from "lucide-react";
import type { TrainingSetupData } from "@/types/onboarding";

export function StepTraining() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const data = (moduleSetups.training ?? {}) as Partial<TrainingSetupData>;

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

  return (
    <StepContainer
      title="Trénink & tělo"
      subtitle="Nastav si základní parametry."
      helperText="Řekni nám o svém tréninku, abychom ti mohli pomoct."
      icon={Dumbbell}
      onNext={handleNext}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Zkušenost</Label>
          <Select value={data.experienceLevel ?? ""} onValueChange={(val) => { if (val) update({ experienceLevel: val as TrainingSetupData["experienceLevel"] }); }}>
            <SelectTrigger className="h-11"><SelectValue placeholder="Vyber úroveň" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Začátečník</SelectItem>
              <SelectItem value="intermediate">Pokročilý</SelectItem>
              <SelectItem value="advanced">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="daysPerWeek">Dní týdně</Label>
          <Input id="daysPerWeek" className="h-11" type="number" min={1} max={7} placeholder="4" value={data.daysPerWeek ?? ""} onChange={(e) => update({ daysPerWeek: e.target.value ? Number(e.target.value) : undefined })} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="weight">Váha (kg)</Label>
            <Input id="weight" className="h-11" type="number" placeholder="80" value={data.weightKg ?? ""} onChange={(e) => update({ weightKg: e.target.value ? Number(e.target.value) : undefined })} />
            {errors.weightKg && <p className="text-xs text-red-500 mt-1">{errors.weightKg}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Výška (cm)</Label>
            <Input id="height" className="h-11" type="number" placeholder="180" value={data.heightCm ?? ""} onChange={(e) => update({ heightCm: e.target.value ? Number(e.target.value) : undefined })} />
            {errors.heightCm && <p className="text-xs text-red-500 mt-1">{errors.heightCm}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bf">Body fat %</Label>
            <Input id="bf" className="h-11" type="number" placeholder="15" value={data.bodyFatPct ?? ""} onChange={(e) => update({ bodyFatPct: e.target.value ? Number(e.target.value) : undefined })} />
            {errors.bodyFatPct && <p className="text-xs text-red-500 mt-1">{errors.bodyFatPct}</p>}
          </div>
        </div>
      </div>
    </StepContainer>
  );
}
