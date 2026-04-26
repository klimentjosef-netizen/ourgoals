"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import type { GoalSetupData, QuickGoalData, GoalType } from "@/types/onboarding";

interface SuggestedGoal {
  title: string;
  type: GoalType;
  modules: string[];
}

const SUGGESTED_GOALS: SuggestedGoal[] = [
  { title: "Zhubnout", type: "measurable", modules: ["training"] },
  { title: "Zvýšit sílu", type: "measurable", modules: ["training"] },
  { title: "Cvičit pravidelně", type: "habit", modules: ["training"] },
  { title: "Jíst zdravěji", type: "habit", modules: ["nutrition"] },
  { title: "Hlídat makra", type: "habit", modules: ["nutrition"] },
  { title: "Spát víc", type: "habit", modules: ["sleep_wellbeing"] },
  { title: "Snížit stres", type: "habit", modules: ["sleep_wellbeing"] },
  { title: "30 dní meditace", type: "challenge", modules: ["sleep_wellbeing"] },
  { title: "Víc deep work", type: "habit", modules: ["work_focus"] },
  { title: "Dokončit projekt", type: "oneoff", modules: ["work_focus"] },
  { title: "Přečíst X knih", type: "measurable", modules: ["goals_habits"] },
  { title: "Naučit se jazyk", type: "oneoff", modules: ["goals_habits"] },
  { title: "Společný streak", type: "challenge", modules: ["family"] },
  { title: "Lepší komunikace", type: "habit", modules: ["family"] },
];

let goalIdCounter = 0;
function nextGoalId() {
  return `goal_${Date.now()}_${goalIdCounter++}`;
}

export function StepGoals() {
  const { moduleSetups, setModuleSetup, selectedModules, nextStep, prevStep } =
    useOnboarding();
  const data = (moduleSetups.goals_habits ?? {}) as Partial<GoalSetupData>;
  const goals: QuickGoalData[] = (data.goals as QuickGoalData[] | undefined) ?? [];

  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState("");

  const update = (partial: Partial<GoalSetupData>) => {
    setModuleSetup("goals_habits", { ...data, ...partial });
  };

  const setGoals = (newGoals: QuickGoalData[]) => {
    update({ goals: newGoals });
  };

  // Filter suggestions based on selected modules
  const relevantSuggestions = SUGGESTED_GOALS.filter((sg) =>
    sg.modules.some((m) => selectedModules.includes(m as typeof selectedModules[number]))
  );

  function addSuggested(sg: SuggestedGoal) {
    if (goals.length >= 5) return;
    // Don't add duplicates
    if (goals.some((g) => g.title === sg.title)) return;
    const newGoal: QuickGoalData = {
      id: nextGoalId(),
      title: sg.title,
      type: sg.type,
    };
    const next = [...goals, newGoal];
    setGoals(next);
    setExpandedGoal(newGoal.id);
  }

  function addCustom() {
    if (goals.length >= 5 || !customTitle.trim()) return;
    const newGoal: QuickGoalData = {
      id: nextGoalId(),
      title: customTitle.trim(),
      type: "oneoff",
    };
    const next = [...goals, newGoal];
    setGoals(next);
    setExpandedGoal(newGoal.id);
    setCustomTitle("");
  }

  function removeGoal(id: string) {
    setGoals(goals.filter((g) => g.id !== id));
    if (expandedGoal === id) setExpandedGoal(null);
  }

  function updateGoal(id: string, partial: Partial<QuickGoalData>) {
    setGoals(goals.map((g) => (g.id === id ? { ...g, ...partial } : g)));
  }

  function getTypeLabel(type: GoalType): string {
    switch (type) {
      case "measurable":
        return "Měřitelný";
      case "habit":
        return "Návyk";
      case "challenge":
        return "Výzva";
      case "oneoff":
        return "Jednorázový";
    }
  }

  // For backward compat, also set title from first goal
  function handleNext() {
    if (goals.length > 0) {
      update({ title: goals[0].title, goals });
    }
    nextStep();
  }

  return (
    <StepContainer
      title="Na čem chceš pracovat?"
      subtitle="Vyber si cíle podle svých modulů nebo si přidej vlastní."
      helperText="Můžeš přeskocit a přidat cíle později."
      icon={Target}
      onNext={handleNext}
      onPrev={prevStep}
      onSkip={nextStep}
      canSkip
      canProceed
    >
      <div className="space-y-5">
        {/* Suggested quick goals */}
        {relevantSuggestions.length > 0 && (
          <div className="space-y-2">
            <Label>Doporučené cíle</Label>
            <div className="flex flex-wrap gap-2">
              {relevantSuggestions.map((sg) => {
                const alreadyAdded = goals.some((g) => g.title === sg.title);
                return (
                  <button
                    key={sg.title}
                    type="button"
                    disabled={alreadyAdded || goals.length >= 5}
                    onClick={() => addSuggested(sg)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                      alreadyAdded
                        ? "bg-primary/10 border-primary text-primary cursor-default"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    } disabled:opacity-40`}
                  >
                    {sg.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom goal input */}
        <div className="space-y-2">
          <Label>Vlastní cíl</Label>
          <div className="flex gap-2">
            <Input
              className="h-11 flex-1"
              placeholder="Napiš svůj cíl..."
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
              disabled={goals.length >= 5}
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={goals.length >= 5 || !customTitle.trim()}
              className="h-11 w-11 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Added goals */}
        {goals.length > 0 && (
          <div className="space-y-2">
            <Label>
              Tvoje cíle ({goals.length}/5)
            </Label>
            <div className="space-y-2">
              {goals.map((goal) => {
                const isExpanded = expandedGoal === goal.id;
                return (
                  <div
                    key={goal.id}
                    className="border rounded-lg overflow-hidden transition-all"
                  >
                    {/* Goal header */}
                    <div className="flex items-center justify-between p-3">
                      <button
                        type="button"
                        className="flex items-center gap-2 flex-1 text-left"
                        onClick={() =>
                          setExpandedGoal(isExpanded ? null : goal.id)
                        }
                      >
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm font-medium">{goal.title}</span>
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {getTypeLabel(goal.type)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={14} className="text-muted-foreground" />
                        ) : (
                          <ChevronDown size={14} className="text-muted-foreground" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeGoal(goal.id)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <X size={14} className="text-muted-foreground" />
                      </button>
                    </div>

                    {/* Expanded type-specific fields */}
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t space-y-3">
                        {goal.type === "measurable" && (
                          <div className="space-y-2">
                            <Label className="text-xs">Cílová hodnota</Label>
                            <Input
                              className="h-11"
                              type="number"
                              placeholder={
                                goal.title === "Zhubnout"
                                  ? "Cílová váha (kg)"
                                  : "Cílové číslo"
                              }
                              value={goal.targetWeight ?? ""}
                              onChange={(e) =>
                                updateGoal(goal.id, {
                                  targetWeight: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                })
                              }
                            />
                          </div>
                        )}
                        {goal.type === "habit" && (
                          <div className="space-y-2">
                            <Label className="text-xs">Kolikrát týdně</Label>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/70"
                                onClick={() =>
                                  updateGoal(goal.id, {
                                    frequency: Math.max(
                                      1,
                                      (goal.frequency ?? 3) - 1
                                    ),
                                  })
                                }
                              >
                                -
                              </button>
                              <span className="text-lg font-bold w-8 text-center">
                                {goal.frequency ?? 3}
                              </span>
                              <button
                                type="button"
                                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/70"
                                onClick={() =>
                                  updateGoal(goal.id, {
                                    frequency: Math.min(
                                      7,
                                      (goal.frequency ?? 3) + 1
                                    ),
                                  })
                                }
                              >
                                +
                              </button>
                              <span className="text-xs text-muted-foreground">
                                x týdně
                              </span>
                            </div>
                          </div>
                        )}
                        {goal.type === "challenge" && (
                          <div className="space-y-2">
                            <Label className="text-xs">Počet dní</Label>
                            <Input
                              className="h-11"
                              type="number"
                              placeholder="30"
                              value={goal.challengeDays ?? ""}
                              onChange={(e) =>
                                updateGoal(goal.id, {
                                  challengeDays: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                })
                              }
                            />
                          </div>
                        )}
                        {goal.type === "oneoff" && (
                          <div className="space-y-2">
                            <Label className="text-xs">Deadline</Label>
                            <Input
                              className="h-11"
                              type="date"
                              min={new Date().toISOString().split("T")[0]}
                              value={goal.deadline ?? ""}
                              onChange={(e) =>
                                updateGoal(goal.id, {
                                  deadline: e.target.value,
                                })
                              }
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </StepContainer>
  );
}
