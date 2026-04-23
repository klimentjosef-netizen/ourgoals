"use client";

import { Progress } from "@/components/ui/progress";

interface OnboardingProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgressBar({
  currentStep,
  totalSteps,
}: OnboardingProgressBarProps) {
  const percentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs font-mono text-muted-foreground">
        <span>
          Krok {currentStep + 1} / {totalSteps}
        </span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <Progress value={percentage} className="h-1.5" />
    </div>
  );
}
