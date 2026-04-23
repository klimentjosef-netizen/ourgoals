"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { OnboardingProgressBar } from "@/components/domain/onboarding/progress-bar";
import { MODULE_REGISTRY } from "@/types/modules";
import type { OnboardingData } from "@/types/onboarding";
import { completeOnboarding } from "../actions";

import { StepProfile } from "./steps/step-profile";
import { StepModules } from "./steps/step-modules";
import { StepGoals } from "./steps/step-goals";
import { StepSleep } from "./steps/step-sleep";
import { StepTraining } from "./steps/step-training";
import { StepNutrition } from "./steps/step-nutrition";
import { StepCalendar } from "./steps/step-calendar";
import { StepWork } from "./steps/step-work";
import { StepCoach } from "./steps/step-coach";

const MODULE_STEP_MAP: Record<string, React.ComponentType> = {
  goals_habits: StepGoals,
  sleep_wellbeing: StepSleep,
  training: StepTraining,
  nutrition: StepNutrition,
  calendar: StepCalendar,
  work_focus: StepWork,
};

export function OnboardingWizard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { currentStep, selectedModules, profile, moduleSetups, coachTone } =
    useOnboarding();

  const steps = useMemo(() => {
    const base: React.ComponentType[] = [StepProfile, StepModules];

    const dynamicSteps = selectedModules
      .filter((moduleId) => {
        const mod = MODULE_REGISTRY.find((m) => m.id === moduleId);
        return mod?.onboardingStep && MODULE_STEP_MAP[moduleId];
      })
      .map((moduleId) => MODULE_STEP_MAP[moduleId]);

    return [...base, ...dynamicSteps, StepCoach];
  }, [selectedModules]);

  const totalSteps = steps.length;
  const CurrentStepComponent = steps[currentStep] ?? StepProfile;

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
    <div className="space-y-8">
      <OnboardingProgressBar
        currentStep={currentStep}
        totalSteps={totalSteps}
      />
      <CurrentStepComponent />
    </div>
  );
}
