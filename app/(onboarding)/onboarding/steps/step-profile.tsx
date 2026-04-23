"use client";

import { useEffect } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StepProfile() {
  const { profile, setProfile, nextStep } = useOnboarding();

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && tz !== profile.timezone) {
      setProfile({ timezone: tz });
    }
  }, []);

  return (
    <StepContainer
      title="O tobě"
      subtitle="Základní informace pro personalizaci."
      onNext={nextStep}
      canSkip={false}
      canProceed={profile.displayName.trim().length > 0}
      isFirst
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="displayName">Jméno</Label>
          <Input
            id="displayName"
            placeholder="Jak ti máme říkat?"
            value={profile.displayName}
            onChange={(e) => setProfile({ displayName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Datum narození</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={profile.dateOfBirth ?? ""}
            onChange={(e) => setProfile({ dateOfBirth: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Časové pásmo</Label>
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
            {profile.timezone}
          </p>
        </div>
      </div>
    </StepContainer>
  );
}
