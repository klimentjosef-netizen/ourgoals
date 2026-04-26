"use client";

interface OnboardingProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepName?: string;
}

export function OnboardingProgressBar({
  currentStep,
  totalSteps,
  stepName,
}: OnboardingProgressBarProps) {
  const percentage = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="w-full space-y-2">
      {/* Step name + percentage */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground">
          {stepName || `Krok ${currentStep + 1}`}
        </p>
        <p className="text-xs font-mono text-muted-foreground">
          {currentStep + 1}/{totalSteps}
        </p>
      </div>

      {/* Smooth progress bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Dot indicators */}
      <div className="flex gap-1 justify-center">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i < currentStep
                ? "bg-primary w-2 h-2"
                : i === currentStep
                  ? "bg-primary w-3 h-3 ring-2 ring-primary/20"
                  : "bg-muted w-2 h-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
