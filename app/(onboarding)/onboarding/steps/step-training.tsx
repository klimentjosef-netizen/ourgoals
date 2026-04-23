"use client";

import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TrainingSetupData } from "@/types/onboarding";

export function StepTraining() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();

  const data = (moduleSetups.training ?? {}) as Partial<TrainingSetupData>;

  const update = (partial: Partial<TrainingSetupData>) => {
    setModuleSetup("training", { ...data, ...partial });
  };

  return (
    <StepContainer
      title="Trénink & tělo"
      subtitle="Nastav si základní parametry pro trénink."
      onNext={nextStep}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Zkušenost</Label>
          <Select
            value={data.experienceLevel ?? ""}
            onValueChange={(val) =>
              update({
                experienceLevel: val as TrainingSetupData["experienceLevel"],
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Vyber úroveň" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Začátečník</SelectItem>
              <SelectItem value="intermediate">Pokročilý</SelectItem>
              <SelectItem value="advanced">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="daysPerWeek">Dní týdně</Label>
          <Input
            id="daysPerWeek"
            type="number"
            min={1}
            max={7}
            placeholder="4"
            value={data.daysPerWeek ?? ""}
            onChange={(e) =>
              update({
                daysPerWeek: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="weight">Váha (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="80"
              value={data.weightKg ?? ""}
              onChange={(e) =>
                update({
                  weightKg: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Výška (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="180"
              value={data.heightCm ?? ""}
              onChange={(e) =>
                update({
                  heightCm: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bf">Body fat %</Label>
            <Input
              id="bf"
              type="number"
              placeholder="15"
              value={data.bodyFatPct ?? ""}
              onChange={(e) =>
                update({
                  bodyFatPct: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            />
          </div>
        </div>
      </div>
    </StepContainer>
  );
}
