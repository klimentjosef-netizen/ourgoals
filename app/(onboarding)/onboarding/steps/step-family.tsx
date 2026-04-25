"use client";

import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Users } from "lucide-react";
import type { FamilySetupData } from "@/types/onboarding";

const SHARING_OPTIONS = [
  { id: "calendar", label: "Kalend\u00e1\u0159" },
  { id: "shopping", label: "N\u00e1kupn\u00ed seznamy" },
  { id: "goals", label: "C\u00edle" },
  { id: "messages", label: "Partnelsk\u00e9 vzkazy" },
];

export function StepFamily() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();
  const data = (moduleSetups.family ?? {
    hasPartner: false,
    hasChildren: false,
    childrenCount: 0,
    childrenAges: [],
    sharingPreferences: [],
  }) as Partial<FamilySetupData>;

  const update = (partial: Partial<FamilySetupData>) => {
    setModuleSetup("family", { ...data, ...partial });
  };

  function toggleSharing(id: string) {
    const current = data.sharingPreferences ?? [];
    const next = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];
    update({ sharingPreferences: next });
  }

  function setChildrenCount(count: number) {
    const ages = data.childrenAges ?? [];
    // Adjust ages array length
    const newAges = Array.from({ length: count }, (_, i) => ages[i] ?? 0);
    update({ childrenCount: count, childrenAges: newAges });
  }

  function setChildAge(index: number, age: number) {
    const ages = [...(data.childrenAges ?? [])];
    ages[index] = age;
    update({ childrenAges: ages });
  }

  return (
    <StepContainer
      title="Rodina & partner"
      subtitle="Nastav si rodinn\u00fd modul."
      helperText="Partnera m\u016f\u017ee\u0161 pozvat kdykoliv z nastaven\u00ed."
      icon={Users}
      onNext={nextStep}
      onPrev={prevStep}
      onSkip={nextStep}
      canSkip
      canProceed
    >
      <div className="space-y-8">
        {/* Section 1: Tvoje rodina */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Tvoje rodina
          </h3>

          {/* M\u00e1\u0161 partnera/ku? */}
          <div className="space-y-2">
            <Label>M\u00e1\u0161 partnera/ku?</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update({ hasPartner: true })}
                className={`h-11 rounded-lg text-sm font-medium transition-all border-2 ${
                  data.hasPartner === true
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                Ano
              </button>
              <button
                type="button"
                onClick={() => update({ hasPartner: false })}
                className={`h-11 rounded-lg text-sm font-medium transition-all border-2 ${
                  data.hasPartner === false
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                Ne
              </button>
            </div>
          </div>

          {/* M\u00e1\u0161 d\u011bti? */}
          <div className="space-y-2">
            <Label>M\u00e1\u0161 d\u011bti?</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update({ hasChildren: true })}
                className={`h-11 rounded-lg text-sm font-medium transition-all border-2 ${
                  data.hasChildren === true
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                Ano
              </button>
              <button
                type="button"
                onClick={() => {
                  update({ hasChildren: false, childrenCount: 0, childrenAges: [] });
                }}
                className={`h-11 rounded-lg text-sm font-medium transition-all border-2 ${
                  data.hasChildren === false
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                Ne
              </button>
            </div>
          </div>

          {/* Children details */}
          {data.hasChildren && (
            <div className="space-y-4 pl-1">
              <div className="space-y-2">
                <Label>Kolik?</Label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center text-lg font-bold hover:bg-muted/70 transition-colors"
                    onClick={() =>
                      setChildrenCount(Math.max(1, (data.childrenCount ?? 1) - 1))
                    }
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold w-8 text-center">
                    {data.childrenCount ?? 1}
                  </span>
                  <button
                    type="button"
                    className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center text-lg font-bold hover:bg-muted/70 transition-colors"
                    onClick={() =>
                      setChildrenCount(Math.min(10, (data.childrenCount ?? 1) + 1))
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              {(data.childrenCount ?? 0) > 0 && (
                <div className="space-y-2">
                  <Label>V\u011bk d\u011bt\u00ed</Label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: data.childrenCount ?? 0 }).map((_, i) => (
                      <div key={i} className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">
                          D\u00edt\u011b {i + 1}
                        </span>
                        <Input
                          className="h-11 w-20"
                          type="number"
                          min={0}
                          max={30}
                          placeholder="V\u011bk"
                          value={(data.childrenAges ?? [])[i] ?? ""}
                          onChange={(e) =>
                            setChildAge(
                              i,
                              e.target.value ? Number(e.target.value) : 0
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Co chcete sd\u00edlet */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Co chcete sd\u00edlet?
          </h3>

          <div className="space-y-3">
            {SHARING_OPTIONS.map((opt) => {
              const checked = (data.sharingPreferences ?? []).includes(opt.id);
              return (
                <div key={opt.id} className="flex items-center gap-3">
                  <Checkbox
                    id={`share-${opt.id}`}
                    checked={checked}
                    onCheckedChange={() => toggleSharing(opt.id)}
                  />
                  <Label htmlFor={`share-${opt.id}`} className="font-normal text-sm">
                    {opt.label}
                  </Label>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground/70">
            Partnera m\u016f\u017ee\u0161 pozvat kdykoliv z nastaven\u00ed.
          </p>
        </div>
      </div>
    </StepContainer>
  );
}
