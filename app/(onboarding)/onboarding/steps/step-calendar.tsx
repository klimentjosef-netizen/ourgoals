"use client";

import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import type { CalendarSetupData } from "@/types/onboarding";

const DAYS = [
  { value: 1, label: "Po" },
  { value: 2, label: "Út" },
  { value: 3, label: "St" },
  { value: 4, label: "Čt" },
  { value: 5, label: "Pá" },
  { value: 6, label: "So" },
  { value: 0, label: "Ne" },
];

export function StepCalendar() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();

  const data = (moduleSetups.calendar ?? {
    workDays: [1, 2, 3, 4, 5],
  }) as Partial<CalendarSetupData>;

  const workDays = data.workDays ?? [1, 2, 3, 4, 5];

  const update = (partial: Partial<CalendarSetupData>) => {
    setModuleSetup("calendar", { ...data, ...partial });
  };

  const toggleDay = (day: number) => {
    const next = workDays.includes(day)
      ? workDays.filter((d) => d !== day)
      : [...workDays, day];
    update({ workDays: next });
  };

  return (
    <StepContainer
      title="Kalendář & čas"
      subtitle="Nastav si pracovní dny a stálé závazky."
      onNext={nextStep}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Pracovní dny</Label>
          <div className="flex flex-wrap gap-3">
            {DAYS.map((day) => (
              <div key={day.value} className="flex items-center gap-2">
                <Checkbox
                  id={`day-${day.value}`}
                  checked={workDays.includes(day.value)}
                  onCheckedChange={() => toggleDay(day.value)}
                />
                <Label htmlFor={`day-${day.value}`} className="font-normal">
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commitments">Stálé závazky</Label>
          <Textarea
            id="commitments"
            placeholder="Např. Pondělí 18:00 - anglicky, Středa 7:00 - crossfit..."
            value={data.fixedCommitments ?? ""}
            onChange={(e) => update({ fixedCommitments: e.target.value })}
            rows={4}
          />
        </div>
      </div>
    </StepContainer>
  );
}
