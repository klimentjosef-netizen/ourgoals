"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Moon } from "lucide-react";
import type { SleepSetupData } from "@/types/onboarding";

export function StepSleep() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const data = (moduleSetups.sleep_wellbeing ?? {
    trackMood: true, trackEnergy: true, trackStress: true,
  }) as Partial<SleepSetupData>;

  const update = (partial: Partial<SleepSetupData>) => {
    setModuleSetup("sleep_wellbeing", { ...data, ...partial });
  };

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (data.bedtimeTarget && data.wakeTarget && data.bedtimeTarget === data.wakeTarget) {
      e.time = "Čas spánku a buzení se nesmí shodovat";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) nextStep();
  }

  return (
    <StepContainer
      title="Spánek & wellbeing"
      subtitle="Nastav si cílové časy a co chceš trackovat."
      helperText="Nastavení spánku a wellbeingu pro lepší regeneraci."
      icon={Moon}
      onNext={handleNext}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bedtime">Cílový bedtime</Label>
            <Input id="bedtime" className="h-11" type="time" value={data.bedtimeTarget ?? "22:30"} onChange={(e) => update({ bedtimeTarget: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waketime">Cílový wake time</Label>
            <Input id="waketime" className="h-11" type="time" value={data.wakeTarget ?? "06:30"} onChange={(e) => update({ wakeTarget: e.target.value })} />
          </div>
        </div>
        {errors.time && <p className="text-xs text-red-500">{errors.time}</p>}

        <div className="space-y-4">
          <Label>Co chceš sledovat?</Label>
          {[
            { id: "trackMood", label: "Nálada", key: "trackMood" as const },
            { id: "trackEnergy", label: "Energie", key: "trackEnergy" as const },
            { id: "trackStress", label: "Stres", key: "trackStress" as const },
          ].map(({ id, label, key }) => (
            <div key={id} className="flex items-center gap-3">
              <Checkbox id={id} checked={data[key] ?? true} onCheckedChange={(checked) => update({ [key]: checked === true })} />
              <Label htmlFor={id} className="font-normal">{label}</Label>
            </div>
          ))}
        </div>
      </div>
    </StepContainer>
  );
}
