"use client";

import { useMemo, useTransition } from "react";
import { toast } from "sonner";

import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { OnboardingProgressBar } from "@/components/domain/onboarding/progress-bar";
import { MODULE_REGISTRY } from "@/types/modules";
import { COACH_TONES } from "@/types/gamification";
import type { OnboardingData } from "@/types/onboarding";
import { completeOnboarding } from "../actions";

import { StepWelcome } from "./steps/step-welcome";
import { StepProfile } from "./steps/step-profile";
import { StepModules } from "./steps/step-modules";
import { StepGoals } from "./steps/step-goals";
import { StepSleep } from "./steps/step-sleep";
import { StepTraining } from "./steps/step-training";
import { StepNutrition } from "./steps/step-nutrition";
import { StepCalendar } from "./steps/step-calendar";
import { StepWork } from "./steps/step-work";
import { StepCoach } from "./steps/step-coach";
import { StepComplete } from "./steps/step-complete";

type StepId =
  | "welcome"
  | "profile"
  | "modules"
  | "goals_habits"
  | "sleep_wellbeing"
  | "training"
  | "nutrition"
  | "calendar"
  | "work_focus"
  | "coach"
  | "complete";

const MODULE_STEP_MAP: Record<string, React.ComponentType> = {
  goals_habits: StepGoals,
  sleep_wellbeing: StepSleep,
  training: StepTraining,
  nutrition: StepNutrition,
  calendar: StepCalendar,
  work_focus: StepWork,
};

export function OnboardingWizard() {
  const [isPending, startTransition] = useTransition();
  const store = useOnboarding();
  const {
    currentStep,
    selectedModules,
    profile,
    moduleSetups,
    coachTone,
    nextStep,
    setCompleted,
  } = store;

  const stepIds = useMemo<StepId[]>(() => {
    const ids: StepId[] = ["welcome", "profile", "modules"];

    const dynamicModules = selectedModules.filter((moduleId) => {
      const mod = MODULE_REGISTRY.find((m) => m.id === moduleId);
      return mod?.onboardingStep && MODULE_STEP_MAP[moduleId];
    });
    ids.push(...(dynamicModules as StepId[]));

    ids.push("coach", "complete");
    return ids;
  }, [selectedModules]);

  const totalSteps = stepIds.length;
  const currentStepId = stepIds[currentStep] ?? "welcome";

  // Steps where progress bar is hidden
  const showProgressBar =
    currentStepId !== "welcome" && currentStepId !== "complete";

  // Progress bar adjustments (exclude welcome and complete from count)
  const progressCurrent = Math.max(0, currentStep - 1);
  const progressTotal = Math.max(1, totalSteps - 2);

  async function handleSubmit() {
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
        return;
      }
      setCompleted();
      nextStep(); // advance to StepComplete
    });
  }

  // Get coach tone label for completion screen
  const coachToneLabel =
    COACH_TONES.find((t) => t.id === coachTone)?.label ?? coachTone;

  function renderStep() {
    switch (currentStepId) {
      case "welcome":
        return <StepWelcome onNext={nextStep} />;
      case "profile":
        return <StepProfile />;
      case "modules":
        return <StepModules />;
      case "goals_habits":
        return <StepGoals />;
      case "sleep_wellbeing":
        return <StepSleep />;
      case "training":
        return <StepTraining />;
      case "nutrition":
        return <StepNutrition />;
      case "calendar":
        return <StepCalendar />;
      case "work_focus":
        return <StepWork />;
      case "coach":
        return <StepCoach onSubmit={handleSubmit} isPending={isPending} />;
      case "complete":
        return (
          <StepComplete
            moduleCount={selectedModules.length}
            coachToneLabel={coachToneLabel}
          />
        );
      default:
        return <StepProfile />;
    }
  }

  return (
    <div className="space-y-6">
      {showProgressBar && (
        <OnboardingProgressBar
          currentStep={progressCurrent}
          totalSteps={progressTotal}
        />
      )}
      {renderStep()}
    </div>
  );
}
