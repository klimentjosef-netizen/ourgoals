"use client";

import { useState, useEffect } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { THEME_PRESETS, type ThemePreset } from "@/types/theme";
import { Palette, Check, Sparkles } from "lucide-react";
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

export function StepColors() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();
  const data = (moduleSetups.colors ?? {}) as Partial<ColorSetupData>;
  const [selected, setSelected] = useState(data.themeId ?? "blue");

  useEffect(() => {
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

  function handleNext() {
    setModuleSetup("colors", { ...data, themeId: selected });
    nextStep();
  }

  const selectedTheme = THEME_PRESETS.find((t) => t.id === selected) ?? THEME_PRESETS[0];

  return (
    <StepContainer
      title="Zvol si svůj styl"
      subtitle="Vyber barevné schéma, které ti sedí."
      helperText="Můžeš změnit kdykoliv v nastavení."
      icon={Palette}
      onNext={handleNext}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-6">
        {/* Live preview card */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 transition-all duration-500"
          style={{
            background: `linear-gradient(135deg, ${selectedTheme.preview}15, ${selectedTheme.previewGold}10)`,
            border: `2px solid ${selectedTheme.preview}30`,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: selectedTheme.preview }}
            >
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">Takhle bude vypadat tvoje app</p>
              <p className="text-[11px] text-muted-foreground">{selectedTheme.name}</p>
            </div>
          </div>

          {/* Mini dashboard preview */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg p-3 bg-background/80 backdrop-blur-sm border border-border/50">
              <div
                className="w-6 h-6 rounded-full mb-1.5"
                style={{ backgroundColor: selectedTheme.preview }}
              />
              <div className="h-1.5 rounded-full bg-muted w-full mb-1" />
              <div className="h-1.5 rounded-full w-2/3" style={{ backgroundColor: selectedTheme.preview + "40" }} />
            </div>
            <div className="rounded-lg p-3 bg-background/80 backdrop-blur-sm border border-border/50">
              <div
                className="w-6 h-6 rounded-full mb-1.5"
                style={{ backgroundColor: selectedTheme.previewGold }}
              />
              <div className="h-1.5 rounded-full bg-muted w-full mb-1" />
              <div className="h-1.5 rounded-full w-3/4" style={{ backgroundColor: selectedTheme.previewGold + "40" }} />
            </div>
            <div className="rounded-lg p-3 bg-background/80 backdrop-blur-sm border border-border/50">
              <div className="flex gap-1 mb-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTheme.preview }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTheme.previewGold }} />
              </div>
              <div className="h-1.5 rounded-full bg-muted w-full mb-1" />
              <div className="h-1.5 rounded-full bg-muted w-1/2" />
            </div>
          </div>

          {/* Progress bar preview */}
          <div className="mt-3 h-2 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ backgroundColor: selectedTheme.preview, width: "68%" }}
            />
          </div>
        </div>

        {/* Theme grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {THEME_PRESETS.map((theme, idx) => {
            const isSelected = selected === theme.id && (idx === THEME_PRESETS.indexOf(THEME_PRESETS.find(t => t.id === theme.id && THEME_PRESETS.indexOf(t) === idx)!));
            const isActive = selected === theme.id;

            return (
              <button
                key={`${theme.id}-${idx}`}
                type="button"
                onClick={() => handleSelect(theme)}
                className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                  isActive
                    ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                    : "border-border hover:border-primary/40 hover:shadow-md"
                }`}
              >
                {/* Selection indicator */}
                {isActive && (
                  <div
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: theme.preview }}
                  >
                    <Check size={14} className="text-white" />
                  </div>
                )}

                {/* Color orbs with glow */}
                <div className="relative flex gap-2">
                  <div
                    className="w-10 h-10 rounded-xl shadow-md transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: theme.preview,
                      boxShadow: isActive ? `0 4px 14px ${theme.preview}40` : undefined,
                    }}
                  />
                  <div
                    className="w-10 h-10 rounded-xl shadow-md transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: theme.previewGold,
                      boxShadow: isActive ? `0 4px 14px ${theme.previewGold}40` : undefined,
                    }}
                  />
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-semibold block ${isActive ? "text-primary" : ""}`}>
                    {theme.name}
                  </span>
                  {/* Color bar preview */}
                  <div className="flex gap-0.5 mt-1.5">
                    <div className="h-1 rounded-full flex-1" style={{ backgroundColor: theme.preview }} />
                    <div className="h-1 rounded-full flex-1" style={{ backgroundColor: theme.previewGold }} />
                    <div className="h-1 rounded-full flex-1 bg-muted" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </StepContainer>
  );
}
