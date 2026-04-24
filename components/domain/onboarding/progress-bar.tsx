"use client";

interface OnboardingProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgressBar({
  currentStep,
  totalSteps,
}: OnboardingProgressBarProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex gap-1.5 justify-center">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i < currentStep
                ? "bg-primary/50 w-6"
                : i === currentStep
                  ? "bg-primary w-8 scale-y-110"
                  : "bg-muted w-6"
            }`}
          />
        ))}
      </div>
      <p className="text-[10px] font-mono text-muted-foreground text-center">
        Krok {currentStep + 1} z {totalSteps}
      </p>
    </div>
  );
}
