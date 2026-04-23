"use client";

import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WorkSetupData } from "@/types/onboarding";

export function StepWork() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();

  const data = (moduleSetups.work_focus ?? {}) as Partial<WorkSetupData>;

  const update = (partial: Partial<WorkSetupData>) => {
    setModuleSetup("work_focus", { ...data, ...partial });
  };

  return (
    <StepContainer
      title="Práce & focus"
      subtitle="Kdy pracuješ a kolik deep work chceš denně?"
      onNext={nextStep}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="workStart">Začátek práce</Label>
            <Input
              id="workStart"
              type="time"
              value={data.workStartTime ?? "08:00"}
              onChange={(e) => update({ workStartTime: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workEnd">Konec práce</Label>
            <Input
              id="workEnd"
              type="time"
              value={data.workEndTime ?? "17:00"}
              onChange={(e) => update({ workEndTime: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deepWork">Hodin deep work denně</Label>
          <Input
            id="deepWork"
            type="number"
            min={0}
            max={12}
            placeholder="4"
            value={data.deepWorkHours ?? ""}
            onChange={(e) =>
              update({
                deepWorkHours: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
          />
        </div>
      </div>
    </StepContainer>
  );
}
