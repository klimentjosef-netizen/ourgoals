"use client";

import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { SleepSetupData } from "@/types/onboarding";

export function StepSleep() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();

  const data = (moduleSetups.sleep_wellbeing ?? {
    trackMood: true,
    trackEnergy: true,
    trackStress: true,
  }) as Partial<SleepSetupData>;

  const update = (partial: Partial<SleepSetupData>) => {
    setModuleSetup("sleep_wellbeing", { ...data, ...partial });
  };

  return (
    <StepContainer
      title="Spánek & wellbeing"
      subtitle="Nastav si cílové časy a co chceš trackovat."
      onNext={nextStep}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bedtime">Cílový bedtime</Label>
            <Input
              id="bedtime"
              type="time"
              value={data.bedtimeTarget ?? "22:30"}
              onChange={(e) => update({ bedtimeTarget: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waketime">Cílový wake time</Label>
            <Input
              id="waketime"
              type="time"
              value={data.wakeTarget ?? "06:30"}
              onChange={(e) => update({ wakeTarget: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Tracking</Label>

          <div className="flex items-center gap-3">
            <Checkbox
              id="trackMood"
              checked={data.trackMood ?? true}
              onCheckedChange={(checked) =>
                update({ trackMood: checked === true })
              }
            />
            <Label htmlFor="trackMood" className="font-normal">
              Trackovat náladu
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="trackEnergy"
              checked={data.trackEnergy ?? true}
              onCheckedChange={(checked) =>
                update({ trackEnergy: checked === true })
              }
            />
            <Label htmlFor="trackEnergy" className="font-normal">
              Trackovat energii
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="trackStress"
              checked={data.trackStress ?? true}
              onCheckedChange={(checked) =>
                update({ trackStress: checked === true })
              }
            />
            <Label htmlFor="trackStress" className="font-normal">
              Trackovat stres
            </Label>
          </div>
        </div>
      </div>
    </StepContainer>
  );
}
