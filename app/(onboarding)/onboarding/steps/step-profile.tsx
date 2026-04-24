"use client";

import { useEffect, useState } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

export function StepProfile() {
  const { profile, setProfile, nextStep } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && tz !== profile.timezone) {
      setProfile({ timezone: tz });
    }
  }, [profile.timezone, setProfile]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (profile.displayName.trim().length < 2) {
      e.displayName = "Jméno musí mít alespoň 2 znaky";
    }
    if (profile.dateOfBirth) {
      const dob = new Date(profile.dateOfBirth);
      if (dob > new Date()) e.dateOfBirth = "Datum narození nemůže být v budoucnosti";
      if (dob < new Date("1920-01-01")) e.dateOfBirth = "Neplatné datum narození";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) nextStep();
  }

  return (
    <StepContainer
      title="O tobě"
      subtitle="Základní informace pro personalizaci."
      helperText="Řekni nám o sobě základní informace."
      icon={User}
      onNext={handleNext}
      canSkip={false}
      canProceed={profile.displayName.trim().length >= 2}
      isFirst
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="displayName">Jméno *</Label>
          <Input
            id="displayName"
            className="h-11"
            placeholder="Jak ti máme říkat?"
            value={profile.displayName}
            onChange={(e) => {
              setProfile({ displayName: e.target.value });
              if (errors.displayName) setErrors((p) => ({ ...p, displayName: "" }));
            }}
          />
          {errors.displayName && <p className="text-xs text-red-500 mt-1">{errors.displayName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Datum narození</Label>
          <Input
            id="dateOfBirth"
            type="date"
            className="h-11"
            max={new Date().toISOString().split("T")[0]}
            value={profile.dateOfBirth ?? ""}
            onChange={(e) => {
              setProfile({ dateOfBirth: e.target.value });
              if (errors.dateOfBirth) setErrors((p) => ({ ...p, dateOfBirth: "" }));
            }}
          />
          {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>}
        </div>

        <div className="space-y-2">
          <Label>Časové pásmo</Label>
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2.5">
            {profile.timezone}
          </p>
        </div>
      </div>
    </StepContainer>
  );
}
