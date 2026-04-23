"use client";

import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { ModuleCard } from "@/components/domain/onboarding/module-card";
import { getAvailableModules } from "@/lib/logic/modules";

export function StepModules() {
  const { selectedModules, toggleModule, nextStep, prevStep } =
    useOnboarding();

  const modules = getAvailableModules();

  return (
    <StepContainer
      title="Vyber si moduly"
      subtitle="Co chceš sledovat a zlepšovat? Můžeš přidat nebo odebrat kdykoliv."
      onNext={nextStep}
      onPrev={prevStep}
      canSkip={false}
      canProceed={selectedModules.length > 0}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {modules.map((mod) => (
          <ModuleCard
            key={mod.id}
            module={mod}
            selected={selectedModules.includes(mod.id)}
            onToggle={() => toggleModule(mod.id)}
          />
        ))}
      </div>
    </StepContainer>
  );
}
