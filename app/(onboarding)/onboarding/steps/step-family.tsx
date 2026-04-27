"use client";

import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Heart, MessageCircle, CalendarDays, Target, ShoppingCart, ListTodo, Trophy } from "lucide-react";
import type { FamilySetupData } from "@/types/onboarding";

const FEATURES_PREVIEW = [
  {
    icon: MessageCircle,
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-950/20",
    title: "Partnerské vzkazy",
    desc: "Vděčnost, přání, pochvaly. Gottman 5:1 pravidlo pro zdravý vztah.",
  },
  {
    icon: ListTodo,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    title: "Společné úkoly",
    desc: "Kdo vyzvědne děti, kdo nakoupí, kdo uklidí. S termíny a notifikacemi.",
  },
  {
    icon: CalendarDays,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/20",
    title: "Sdílený kalendář",
    desc: "Vidíte co má ten druhý v plánu. Žádné překvapení.",
  },
  {
    icon: Target,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    title: "Společné cíle a výzvy",
    desc: "30 dní challenge spolu. Společné streaky. Vzájemná motivace.",
  },
];

export function StepFamily() {
  const { moduleSetups, setModuleSetup, profile, nextStep, prevStep } = useOnboarding();
  const data = (moduleSetups.family ?? {
    hasPartner: false,
    hasChildren: false,
    childrenCount: 0,
    childrenAges: [],
    sharingPreferences: ["calendar", "shopping", "goals", "messages"],
    householdName: "",
  }) as Partial<FamilySetupData> & { householdName?: string };

  const update = (partial: Partial<FamilySetupData> & { householdName?: string }) => {
    setModuleSetup("family", { ...data, ...partial });
  };

  function setChildrenCount(count: number) {
    const ages = data.childrenAges ?? [];
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
      subtitle="Sdílej svůj život s těmi, na kterých ti záleží."
      helperText="Po dokončení onboardingu budeš moct pozvat partnera odkazem."
      icon={Users}
      onNext={nextStep}
      onPrev={prevStep}
      onSkip={nextStep}
      canSkip
      canProceed
    >
      <div className="space-y-8">
        {/* Máš partnera? */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Máš partnera/ku?</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => update({ hasPartner: true })}
              className={`p-4 rounded-xl text-center transition-all border-2 ${
                data.hasPartner === true
                  ? "border-pink-500 bg-pink-50 dark:bg-pink-950/20"
                  : "border-border hover:border-pink-300"
              }`}
            >
              <Heart size={24} className={`mx-auto mb-2 ${data.hasPartner ? "text-pink-500" : "text-muted-foreground"}`} fill={data.hasPartner ? "currentColor" : "none"} />
              <p className="text-sm font-semibold">Ano</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Chci sdílet</p>
            </button>
            <button
              type="button"
              onClick={() => update({ hasPartner: false })}
              className={`p-4 rounded-xl text-center transition-all border-2 ${
                data.hasPartner === false
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <Users size={24} className={`mx-auto mb-2 ${!data.hasPartner ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-sm font-semibold">Ne / později</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Můžu přidat kdykoliv</p>
            </button>
          </div>
        </div>

        {/* Partner details */}
        {data.hasPartner && (
          <div className="space-y-5">
            {/* Household name */}
            <div className="space-y-2">
              <Label>Název domácnosti</Label>
              <Input
                className="h-11"
                placeholder={`Např. ${profile.displayName || "Kliment"}ovi`}
                value={data.householdName ?? ""}
                onChange={(e) => update({ householdName: e.target.value })}
              />
              <p className="text-[10px] text-muted-foreground">
                Uvidíte ho oba. Můžeš kdykoliv změnit.
              </p>
            </div>

            {/* Features preview */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Co budete moct sdílet
              </p>
              <div className="grid grid-cols-1 gap-2">
                {FEATURES_PREVIEW.map((feat) => (
                  <div
                    key={feat.title}
                    className={`flex items-start gap-3 p-3 rounded-lg ${feat.bg}`}
                  >
                    <feat.icon size={18} className={`${feat.color} mt-0.5 shrink-0`} />
                    <div>
                      <p className="text-sm font-medium">{feat.title}</p>
                      <p className="text-xs text-muted-foreground">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How invite works */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-pink-50/80 to-purple-50/50 dark:from-pink-950/20 dark:to-purple-950/10 border border-pink-200/50 dark:border-pink-800/30">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={16} className="text-pink-500" />
                <p className="text-sm font-semibold">Jak to bude fungovat?</p>
              </div>
              <ol className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-bold text-pink-500 shrink-0">1.</span>
                  Dokončíš onboarding
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-pink-500 shrink-0">2.</span>
                  V sekci Partner dostaneš odkaz na pozvání
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-pink-500 shrink-0">3.</span>
                  Partner klikne, zaregistruje se a je v domácnosti
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-pink-500 shrink-0">4.</span>
                  Sdílíte kalendář, úkoly, vzkazy a cíle
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Máš děti? */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Máš děti?</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => update({ hasChildren: true })}
              className={`h-12 rounded-xl text-sm font-medium transition-all border-2 ${
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
              className={`h-12 rounded-xl text-sm font-medium transition-all border-2 ${
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
          <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="space-y-2">
              <Label>Kolik dětí?</Label>
              <div className="flex items-center gap-4">
                <button type="button"
                  className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center text-lg font-bold hover:bg-muted/70"
                  onClick={() => setChildrenCount(Math.max(1, (data.childrenCount ?? 1) - 1))}>
                  -
                </button>
                <span className="text-2xl font-bold w-8 text-center">{data.childrenCount ?? 1}</span>
                <button type="button"
                  className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center text-lg font-bold hover:bg-muted/70"
                  onClick={() => setChildrenCount(Math.min(10, (data.childrenCount ?? 1) + 1))}>
                  +
                </button>
              </div>
            </div>

            {(data.childrenCount ?? 0) > 0 && (
              <div className="space-y-2">
                <Label className="text-xs">Věk dětí</Label>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: data.childrenCount ?? 0 }).map((_, i) => (
                    <div key={i} className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground">Dítě {i + 1}</span>
                      <Input className="h-10 w-16" type="number" min={0} max={30} placeholder="Věk"
                        value={(data.childrenAges ?? [])[i] ?? ""}
                        onChange={(e) => setChildAge(i, e.target.value ? Number(e.target.value) : 0)} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </StepContainer>
  );
}
