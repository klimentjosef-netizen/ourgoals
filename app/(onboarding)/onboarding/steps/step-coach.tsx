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
      title="Tv\u016fj kou\u010d"
      subtitle="Jak\u00fd styl komunikace ti sed\u00ed?"
      helperText="M\u016f\u017ee\u0161 zm\u011bnit kdykoliv v nastaven\u00ed."
      icon={MessageCircle}
      onNext={onSubmit}
      onPrev={prevStep}
      canSkip={false}
      canProceed={!isPending}
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

      {/* Live preview */}
      {coachTone && (() => {
        const activeTone = COACH_TONES.find((t) => t.id === coachTone);
        if (!activeTone || activeTone.id === "minimal") return null;
        return (
          <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20 animate-in fade-in-0 duration-200">
            <p className="text-xs text-muted-foreground mb-1.5">Uk\u00e1zka od kou\u010de:</p>
            <p className="text-sm font-medium">
              &ldquo;{activeTone.example}&rdquo;
            </p>
          </div>
        );
      })()}
    </StepContainer>
  );
}
