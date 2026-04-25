"use client";

import { useMemo } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { ModuleCard } from "@/components/domain/onboarding/module-card";
import { getAvailableModules } from "@/lib/logic/modules";
import { MODULE_REGISTRY } from "@/types/modules";
import { Layers, Check } from "lucide-react";

export function StepModules() {
  const { selectedModules, toggleModule, nextStep, prevStep } =
    useOnboarding();

  const modules = getAvailableModules();

  // Last selected module for benefit preview
  const lastSelected = useMemo(() => {
    if (selectedModules.length === 0) return null;
    const lastId = selectedModules[selectedModules.length - 1];
    return MODULE_REGISTRY.find((m) => m.id === lastId) ?? null;
  }, [selectedModules]);

  return (
    <StepContainer
      title="Vyber si moduly"
      subtitle="Co chceš sledovat a zlepšovat?"
      helperText="Vyber si oblasti, které chceš mít pod kontrolou. Můžeš je kdykoliv změnit."
      icon={Layers}
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

      {lastSelected && (
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2 animate-in fade-in-0 duration-200">
          <Check size={14} className="text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{lastSelected.label}</span>
            {" — "}
            {lastSelected.description}
          </p>
        </div>
      )}
    </StepContainer>
  );
}
