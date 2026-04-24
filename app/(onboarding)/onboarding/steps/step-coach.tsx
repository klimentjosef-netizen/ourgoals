"use client";

import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { CoachToneCard } from "@/components/domain/onboarding/coach-tone-card";
import { COACH_TONES } from "@/types/gamification";
import { MessageCircle } from "lucide-react";

interface StepCoachProps {
  onSubmit: () => void;
  isPending: boolean;
}

export function StepCoach({ onSubmit, isPending }: StepCoachProps) {
  const { coachTone, setCoachTone, prevStep } = useOnboarding();

  return (
    <StepContainer
      title="Tvůj kouč"
      subtitle="Jaký styl komunikace ti sedí?"
      helperText="Můžeš změnit kdykoliv v nastavení."
      icon={MessageCircle}
      onNext={onSubmit}
      onPrev={prevStep}
      canSkip={false}
      canProceed={!isPending}
      isLast
      nextLabel={isPending ? "Ukládám..." : "Dokončit"}
      isPending={isPending}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {COACH_TONES.map((tone) => (
          <CoachToneCard
            key={tone.id}
            tone={tone}
            selected={coachTone === tone.id}
            onSelect={() => setCoachTone(tone.id)}
          />
        ))}
      </div>
    </StepContainer>
  );
}
