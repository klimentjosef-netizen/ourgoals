"use client";

import { useState, useEffect } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { THEME_PRESETS, type ThemePreset } from "@/types/theme";
import { Palette, Check } from "lucide-react";
import type { ColorSetupData } from "@/types/onboarding";

function applyTheme(theme: ThemePreset) {
  const root = document.documentElement;
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--primary-foreground", theme.primaryFg);
  root.style.setProperty("--accent", theme.primary);
  root.style.setProperty("--accent-foreground", theme.primaryFg);
  root.style.setProperty("--ring", theme.primary);
  root.style.setProperty("--gold", theme.gold);
  root.style.setProperty("--gold-foreground", theme.goldFg);
  root.style.setProperty("--sidebar-primary", theme.primary);
  root.style.setProperty("--sidebar-primary-foreground", theme.primaryFg);
  root.style.setProperty("--sidebar-ring", theme.primary);
  root.style.setProperty("--chart-1", theme.primary);
  root.style.setProperty("--chart-2", theme.gold);
}

interface StepColorsProps {
  onSubmit: () => void;
  isPending: boolean;
}

export function StepColors({ onSubmit, isPending }: StepColorsProps) {
  const { moduleSetups, setModuleSetup, prevStep } = useOnboarding();
  const data = (moduleSetups.colors ?? {}) as Partial<ColorSetupData>;
  const [selected, setSelected] = useState(data.themeId ?? "green");

  useEffect(() => {
    // Restore saved theme on mount
    const saved = localStorage.getItem("ourgoals-theme");
    if (saved) {
      setSelected(saved);
    }
  }, []);

  function handleSelect(theme: ThemePreset) {
    setSelected(theme.id);
    applyTheme(theme);
    localStorage.setItem("ourgoals-theme", theme.id);
    setModuleSetup("colors", { ...data, themeId: theme.id });
  }

  function handleSubmit() {
    setModuleSetup("colors", { ...data, themeId: selected });
    onSubmit();
  }

  return (
    <StepContainer
      title="Vyber si barevn\u00e9 sch\u00e9ma"
      subtitle="P\u0159izp\u016fsob si vzhled aplikace."
      helperText="M\u016f\u017ee\u0161 zm\u011bnit kdykoliv v nastaven\u00ed."
      icon={Palette}
      onNext={handleSubmit}
      onPrev={prevStep}
      canSkip={false}
      canProceed={!isPending}
      isLast
      nextLabel={isPending ? "Ukl\u00e1d\u00e1m..." : "Dokon\u010dit"}
      isPending={isPending}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {THEME_PRESETS.map((theme, idx) => (
          <button
            key={`${theme.id}-${idx}`}
            type="button"
            onClick={() => handleSelect(theme)}
            className={`relative flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
              selected === theme.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            }`}
          >
            {selected === theme.id && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check size={12} className="text-primary-foreground" />
              </div>
            )}
            <div className="flex gap-1.5">
              <div
                className="w-7 h-7 rounded-full border border-border"
                style={{ backgroundColor: theme.preview }}
              />
              <div
                className="w-7 h-7 rounded-full border border-border"
                style={{ backgroundColor: theme.previewGold }}
              />
            </div>
            <span className="text-sm font-medium">{theme.name}</span>
          </button>
        ))}
      </div>
    </StepContainer>
  );
}
