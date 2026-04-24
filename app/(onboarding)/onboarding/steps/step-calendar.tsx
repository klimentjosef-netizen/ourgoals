"use client";

import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays } from "lucide-react";
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

  const data = (moduleSetups.calendar ?? { workDays: [1, 2, 3, 4, 5] }) as Partial<CalendarSetupData>;
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
      helperText="Které dny obvykle pracuješ? Pomůže nám to s plánováním."
      icon={CalendarDays}
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
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`w-11 h-11 rounded-lg text-sm font-medium transition-all ${
                  workDays.includes(day.value)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commitments">Stálé závazky (nepovinné)</Label>
          <Textarea
            id="commitments"
            placeholder="Např. Pondělí 18:00 — angličtina, Středa 7:00 — crossfit..."
            value={data.fixedCommitments ?? ""}
            onChange={(e) => update({ fixedCommitments: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    </StepContainer>
  );
}
