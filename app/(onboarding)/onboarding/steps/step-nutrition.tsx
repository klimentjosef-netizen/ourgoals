"use client";

import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NutritionSetupData } from "@/types/onboarding";

export function StepNutrition() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();

  const data = (moduleSetups.nutrition ?? {}) as Partial<NutritionSetupData>;

  const update = (partial: Partial<NutritionSetupData>) => {
    setModuleSetup("nutrition", { ...data, ...partial });
  };

  return (
    <StepContainer
      title="Jídlo & výživa"
      subtitle="Nastav si denní cíle pro kalorickém příjmu a makra."
      onNext={nextStep}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="kcal">Cílové kalorie/den</Label>
          <Input
            id="kcal"
            type="number"
            placeholder="2200"
            value={data.targetKcal ?? ""}
            onChange={(e) =>
              update({
                targetKcal: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="protein">Protein (g)</Label>
            <Input
              id="protein"
              type="number"
              placeholder="160"
              value={data.proteinG ?? ""}
              onChange={(e) =>
                update({
                  proteinG: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="carbs">Sacharidy (g)</Label>
            <Input
              id="carbs"
              type="number"
              placeholder="250"
              value={data.carbsG ?? ""}
              onChange={(e) =>
                update({
                  carbsG: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fat">Tuky (g)</Label>
            <Input
              id="fat"
              type="number"
              placeholder="70"
              value={data.fatG ?? ""}
              onChange={(e) =>
                update({
                  fatG: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
        </div>
      </div>
    </StepContainer>
  );
}
