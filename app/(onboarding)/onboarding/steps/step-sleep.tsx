"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Moon } from "lucide-react";
import type { SleepSetupData } from "@/types/onboarding";

interface TrackingItem {
  key: keyof SleepSetupData;
  icon: string;
  label: string;
}

const TRACKING_ITEMS: TrackingItem[] = [
  { key: "trackMood", icon: "\ud83d\ude0a", label: "N\u00e1lada" },
  { key: "trackEnergy", icon: "\u26a1", label: "Energie" },
  { key: "trackStress", icon: "\ud83d\ude30", label: "Stres" },
  { key: "trackMeditation", icon: "\ud83e\uddd8", label: "Meditace" },
  { key: "trackScreenTime", icon: "\ud83d\udcf1", label: "Screen time" },
  { key: "trackCaffeine", icon: "\u2615", label: "Kofein" },
  { key: "trackAlcohol", icon: "\ud83c\udf77", label: "Alkohol" },
];

export function StepSleep() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const data = (moduleSetups.sleep_wellbeing ?? {
    bedtimeTarget: "22:30",
    wakeTarget: "06:30",
    sleepHours: 8,
    trackMood: true,
    trackEnergy: true,
    trackStress: true,
    trackMeditation: false,
    trackScreenTime: false,
    trackCaffeine: false,
    trackAlcohol: false,
  }) as Partial<SleepSetupData>;

  const update = (partial: Partial<SleepSetupData>) => {
    setModuleSetup("sleep_wellbeing", { ...data, ...partial });
  };

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (data.bedtimeTarget && data.wakeTarget && data.bedtimeTarget === data.wakeTarget) {
      e.time = "\u010cas sp\u00e1nku a buzen\u00ed se nesm\u00ed shodovat";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) nextStep();
  }

  const sleepHours = data.sleepHours ?? 8;

  return (
    <StepContainer
      title="Sp\u00e1nek & wellbeing"
      subtitle="Nastav si c\u00edlov\u00e9 \u010dasy a co chce\u0161 sledovat."
      helperText="Nastaven\u00ed sp\u00e1nku a wellbeingu pro lep\u0161\u00ed regeneraci."
      icon={Moon}
      onNext={handleNext}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-8">
        {/* Section 1: Sp\u00e1nek */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Sp\u00e1nek
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedtime">C\u00edlov\u00fd bedtime</Label>
              <Input
                id="bedtime"
                className="h-11"
                type="time"
                value={data.bedtimeTarget ?? "22:30"}
                onChange={(e) => update({ bedtimeTarget: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waketime">C\u00edlov\u00fd wake time</Label>
              <Input
                id="waketime"
                className="h-11"
                type="time"
                value={data.wakeTarget ?? "06:30"}
                onChange={(e) => update({ wakeTarget: e.target.value })}
              />
            </div>
          </div>
          {errors.time && <p className="text-xs text-red-500">{errors.time}</p>}

          {/* Kolik hodin sp\u00e1nku slider */}
          <div className="space-y-3">
            <Label>Kolik hodin sp\u00e1nku</Label>
            <div className="flex items-center gap-4">
              <Slider
                min={6}
                max={10}
                step={0.5}
                value={[sleepHours]}
                onValueChange={(value) => {
                  const v = Array.isArray(value) ? value[0] : value;
                  update({ sleepHours: v });
                }}
                className="flex-1"
              />
              <span className="text-2xl font-bold w-12 text-right tabular-nums">
                {sleepHours}h
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground/50 px-1">
              <span>6h</span>
              <span>10h</span>
            </div>
          </div>
        </div>

        {/* Section 2: Co sledovat */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Co sledovat?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TRACKING_ITEMS.map((item) => {
              const isActive = data[item.key] === true;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => update({ [item.key]: !isActive } as Partial<SleepSetupData>)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  <div
                    className={`w-10 h-6 rounded-full transition-colors flex items-center ${
                      isActive ? "bg-primary justify-end" : "bg-muted justify-start"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full mx-0.5 transition-colors ${
                        isActive ? "bg-primary-foreground" : "bg-background border border-border"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepContainer>
  );
}
