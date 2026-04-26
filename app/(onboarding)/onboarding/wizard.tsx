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
import { StepWeek } from "./steps/step-week";
import { StepFamily } from "./steps/step-family";
import { StepCoach } from "./steps/step-coach";
import { StepColors } from "./steps/step-colors";
import { StepComplete } from "./steps/step-complete";

type StepId =
  | "welcome"
  | "profile"
  | "modules"
  | "colors"
  | "week"
  | "goals_habits"
  | "sleep_wellbeing"
  | "training"
  | "nutrition"
  | "family"
  | "coach"
  | "complete";

const STEP_NAMES: Record<StepId, string> = {
  welcome: "",
  profile: "Profil",
  modules: "Moduly",
  colors: "Barvy",
  week: "Tvůj týden",
  goals_habits: "Cíle",
  sleep_wellbeing: "Spánek",
  training: "Trénink",
  nutrition: "Jídlo",
  family: "Rodina",
  coach: "Kouč",
  complete: "",
};

// Modules that have their own dedicated onboarding step
// Note: calendar and work_focus are now merged into "week" step
const MODULE_STEP_MAP: Record<string, React.ComponentType> = {
  goals_habits: StepGoals,
  sleep_wellbeing: StepSleep,
  training: StepTraining,
  nutrition: StepNutrition,
  family: StepFamily,
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
    const ids: StepId[] = ["welcome", "profile", "modules", "colors"];

    // "Tvůj týden" step is shown if user has calendar OR work_focus OR training
    const needsWeek = selectedModules.some((m) =>
      ["calendar", "work_focus", "training"].includes(m)
    );
    if (needsWeek) {
      ids.push("week");
    }

    // Add module-specific steps (excluding calendar and work_focus which are in "week")
    const dynamicModules = selectedModules.filter((moduleId) => {
      if (moduleId === "calendar" || moduleId === "work_focus") return false;
      const mod = MODULE_REGISTRY.find((m) => m.id === moduleId);
      return mod?.onboardingStep && MODULE_STEP_MAP[moduleId];
    });
    ids.push(...(dynamicModules as StepId[]));

    ids.push("coach", "complete");
    return ids;
  }, [selectedModules]);

  const totalSteps = stepIds.length;
  const currentStepId = stepIds[currentStep] ?? "welcome";

  const showProgressBar =
    currentStepId !== "welcome" && currentStepId !== "complete";

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
      nextStep();
    });
  }

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
      case "colors":
        return <StepColors />;
      case "week":
        return <StepWeek />;
      case "goals_habits":
        return <StepGoals />;
      case "sleep_wellbeing":
        return <StepSleep />;
      case "training":
        return <StepTraining />;
      case "nutrition":
        return <StepNutrition />;
      case "family":
        return <StepFamily />;
      case "coach":
        return <StepCoach onSubmit={handleSubmit} isPending={isPending} />;
      case "complete": {
        const goalSetup = moduleSetups.goals_habits as Record<string, unknown> | undefined;
        const goalTitle = goalSetup?.title as string | undefined;
        return (
          <StepComplete
            moduleCount={selectedModules.length}
            coachToneLabel={coachToneLabel}
            selectedModules={selectedModules}
            goalTitle={goalTitle}
          />
        );
      }
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
          stepName={STEP_NAMES[currentStepId]}
        />
      )}
      {renderStep()}
    </div>
  );
}
