"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UtensilsCrossed } from "lucide-react";
import type { NutritionSetupData } from "@/types/onboarding";

export function StepNutrition() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const data = (moduleSetups.nutrition ?? {}) as Partial<NutritionSetupData>;

  const update = (partial: Partial<NutritionSetupData>) => {
    setModuleSetup("nutrition", { ...data, ...partial });
  };

  function validate(): boolean {
    const e: Record<string, string> = {};
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
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) nextStep();
  }

  return (
    <StepContainer
      title="Jídlo & výživa"
      subtitle="Nastav si denní cíle pro kalorický příjem a makra."
      helperText="Pokud nevíš, začni s doporučenými hodnotami a uprav později."
      icon={UtensilsCrossed}
      onNext={handleNext}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="kcal">Cílové kalorie/den</Label>
          <Input id="kcal" className="h-11" type="number" placeholder="2200" value={data.targetKcal ?? ""} onChange={(e) => update({ targetKcal: e.target.value ? Number(e.target.value) : undefined })} />
          {errors.targetKcal && <p className="text-xs text-red-500 mt-1">{errors.targetKcal}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="protein">Protein (g)</Label>
            <Input id="protein" className="h-11" type="number" placeholder="160" value={data.proteinG ?? ""} onChange={(e) => update({ proteinG: e.target.value ? Number(e.target.value) : undefined })} />
            {errors.proteinG && <p className="text-xs text-red-500 mt-1">{errors.proteinG}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="carbs">Sacharidy (g)</Label>
            <Input id="carbs" className="h-11" type="number" placeholder="250" value={data.carbsG ?? ""} onChange={(e) => update({ carbsG: e.target.value ? Number(e.target.value) : undefined })} />
            {errors.carbsG && <p className="text-xs text-red-500 mt-1">{errors.carbsG}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fat">Tuky (g)</Label>
            <Input id="fat" className="h-11" type="number" placeholder="70" value={data.fatG ?? ""} onChange={(e) => update({ fatG: e.target.value ? Number(e.target.value) : undefined })} />
            {errors.fatG && <p className="text-xs text-red-500 mt-1">{errors.fatG}</p>}
          </div>
        </div>
      </div>
    </StepContainer>
  );
}
