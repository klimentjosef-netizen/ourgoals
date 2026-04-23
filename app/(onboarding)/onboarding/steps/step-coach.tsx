"use client";

import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { CoachToneCard } from "@/components/domain/onboarding/coach-tone-card";
import { COACH_TONES } from "@/types/gamification";
import type { OnboardingData } from "@/types/onboarding";
import { completeOnboarding } from "../../actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export function StepCoach() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    coachTone,
    setCoachTone,
    prevStep,
    profile,
    selectedModules,
    moduleSetups,
  } = useOnboarding();

  const handleComplete = () => {
    const data: OnboardingData = {
      profile,
      selectedModules,
      moduleSetups: moduleSetups as OnboardingData["moduleSetups"],
      coachTone,
    };

    startTransition(async () => {
      const result = await completeOnboarding(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Onboarding dokončen!");
        router.push("/dashboard");
      }
    });
  };

  return (
    <StepContainer
      title="Tvůj kouč"
      subtitle="Jaký styl komunikace ti sedí?"
      onNext={handleComplete}
      onPrev={prevStep}
      canSkip={false}
      canProceed={!isPending}
      isLast
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
