"use client";

import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { GoalSetupData } from "@/types/onboarding";

export function StepGoals() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();

  const data = (moduleSetups.goals_habits ?? {}) as Partial<GoalSetupData>;

  const update = (partial: Partial<GoalSetupData>) => {
    setModuleSetup("goals_habits", { ...data, ...partial });
  };

  return (
    <StepContainer
      title="Tvůj první cíl"
      subtitle="Nastav si první cíl. Můžeš to přeskočit a přidat cíle později."
      onNext={nextStep}
      onPrev={prevStep}
      onSkip={nextStep}
      canSkip
      canProceed
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="goalTitle">Název prvního cíle</Label>
          <Input
            id="goalTitle"
            placeholder="Např. Zhubnout 5 kg"
            value={data.title ?? ""}
            onChange={(e) => update({ title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goalDesc">Popis</Label>
          <Textarea
            id="goalDesc"
            placeholder="Proč je pro tebe tento cíl důležitý?"
            value={data.description ?? ""}
            onChange={(e) => update({ description: e.target.value })}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goalMetric">Metrika (co měříš)</Label>
          <Input
            id="goalMetric"
            placeholder="Např. váha v kg"
            value={data.metric ?? ""}
            onChange={(e) => update({ metric: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="goalTarget">Cílová hodnota</Label>
            <Input
              id="goalTarget"
              type="number"
              placeholder="80"
              value={data.targetValue ?? ""}
              onChange={(e) =>
                update({ targetValue: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goalStart">Aktuální hodnota</Label>
            <Input
              id="goalStart"
              type="number"
              placeholder="85"
              value={data.startValue ?? ""}
              onChange={(e) =>
                update({ startValue: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="goalDeadline">Deadline</Label>
          <Input
            id="goalDeadline"
            type="date"
            value={data.targetDate ?? ""}
            onChange={(e) => update({ targetDate: e.target.value })}
          />
        </div>
      </div>
    </StepContainer>
  );
}
