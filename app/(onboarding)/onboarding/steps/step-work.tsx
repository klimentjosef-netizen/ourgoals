"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase } from "lucide-react";
import type { WorkSetupData } from "@/types/onboarding";

export function StepWork() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const data = (moduleSetups.work_focus ?? {}) as Partial<WorkSetupData>;

  const update = (partial: Partial<WorkSetupData>) => {
    setModuleSetup("work_focus", { ...data, ...partial });
  };

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (data.workStartTime && data.workEndTime && data.workStartTime >= data.workEndTime) {
      e.time = "Začátek práce musí být před koncem";
    }
    if (data.deepWorkHours !== undefined && (data.deepWorkHours < 0 || data.deepWorkHours > 12)) {
      e.deepWorkHours = "Deep work musí být 0–12 hodin";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) nextStep();
  }

  return (
    <StepContainer
      title="Práce & focus"
      subtitle="Kdy pracuješ a kolik deep work chceš denně?"
      helperText="Kdy pracuješ a kolik hodin chceš soustředěně pracovat?"
      icon={Briefcase}
      onNext={handleNext}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="workStart">Začátek práce</Label>
            <Input id="workStart" className="h-11" type="time" value={data.workStartTime ?? "08:00"} onChange={(e) => update({ workStartTime: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workEnd">Konec práce</Label>
            <Input id="workEnd" className="h-11" type="time" value={data.workEndTime ?? "17:00"} onChange={(e) => update({ workEndTime: e.target.value })} />
          </div>
        </div>
        {errors.time && <p className="text-xs text-red-500">{errors.time}</p>}

        <div className="space-y-2">
          <Label htmlFor="deepWork">Hodin deep work denně</Label>
          <Input id="deepWork" className="h-11" type="number" min={0} max={12} placeholder="4" value={data.deepWorkHours ?? ""} onChange={(e) => update({ deepWorkHours: e.target.value ? Number(e.target.value) : undefined })} />
          {errors.deepWorkHours && <p className="text-xs text-red-500 mt-1">{errors.deepWorkHours}</p>}
        </div>
      </div>
    </StepContainer>
  );
}
