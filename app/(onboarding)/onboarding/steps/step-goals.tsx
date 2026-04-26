"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Plus, X, ChevronDown, ChevronUp, Info, Clock, CalendarDays } from "lucide-react";
import { GOAL_TEMPLATES, type GoalTemplate } from "@/lib/data/goal-templates";
import type { GoalSetupData, QuickGoalData, GoalType } from "@/types/onboarding";

let goalIdCounter = 0;
function nextGoalId() {
  return `goal_${Date.now()}_${goalIdCounter++}`;
}

function GoalGuidance({ template }: { template: GoalTemplate }) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="mt-2 space-y-2">
      <button
        type="button"
        onClick={() => setShowDetail(!showDetail)}
        className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
      >
        <Info size={12} />
        {showDetail ? "Skrýt podrobnosti" : "Jak na to?"}
      </button>

      {showDetail && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2 animate-in fade-in-0 duration-200">
          <p className="text-xs text-muted-foreground">{template.description}</p>
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Jak na to:</p>
            {template.howTo.map((tip, i) => (
              <p key={i} className="text-xs text-muted-foreground flex gap-1.5">
                <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                {tip}
              </p>
            ))}
          </div>
          {template.suggestedHabits.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-primary/10">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Doporučené návyky:</p>
              {template.suggestedHabits.map((h, i) => (
                <p key={i} className="text-xs text-muted-foreground">
                  <span className="text-green-600 dark:text-green-400">+</span> {h.title}
                  <span className="text-muted-foreground/60 ml-1">({h.frequency === "daily" ? "denně" : h.frequency})</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
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

  const relevantTemplates = GOAL_TEMPLATES.filter((t) =>
    t.modules.some((m) => selectedModules.includes(m as typeof selectedModules[number]))
  );

  function addFromTemplate(template: GoalTemplate) {
    if (goals.some((g) => g.title === template.title)) return;
    const newGoal: QuickGoalData = {
      id: nextGoalId(),
      title: template.title,
      type: template.type,
    };
    setGoals([...goals, newGoal]);
    setExpandedGoal(newGoal.id);
  }

  function addCustom() {
    if (!customTitle.trim()) return;
    const newGoal: QuickGoalData = {
      id: nextGoalId(),
      title: customTitle.trim(),
      type: "oneoff",
    };
    setGoals([...goals, newGoal]);
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
      case "measurable": return "Měřitelný";
      case "habit": return "Návyk";
      case "challenge": return "Výzva";
      case "oneoff": return "Jednorázový";
    }
  }

  function getTypeColor(type: GoalType): string {
    switch (type) {
      case "measurable": return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      case "habit": return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
      case "challenge": return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
      case "oneoff": return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
    }
  }

  function handleNext() {
    if (goals.length > 0) {
      update({ title: goals[0].title, goals });
    }
    nextStep();
  }

  const shortTermTemplates = relevantTemplates.filter((t) => t.timeHorizon === "short_term");
  const longTermTemplates = relevantTemplates.filter((t) => t.timeHorizon === "long_term");

  return (
    <StepContainer
      title="Na čem chceš pracovat?"
      subtitle="Vyber si cíle a my ti poradíme jak na ně."
      helperText="Můžeš přeskočit a přidat cíle později."
      icon={Target}
      onNext={handleNext}
      onPrev={prevStep}
      onSkip={nextStep}
      canSkip
      canProceed
    >
      <div className="space-y-6">
        {/* Short-term goals */}
        {shortTermTemplates.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-muted-foreground" />
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Krátkodobé (týdny)
              </Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {shortTermTemplates.map((t) => {
                const added = goals.some((g) => g.title === t.title);
                return (
                  <button key={t.title} type="button" disabled={added} onClick={() => addFromTemplate(t)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${added ? "bg-primary/10 border-primary text-primary cursor-default" : "border-border hover:border-primary/40 hover:bg-muted/50"} disabled:opacity-40`}>
                    {t.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Long-term goals */}
        {longTermTemplates.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-muted-foreground" />
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Dlouhodobé (měsíce)
              </Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {longTermTemplates.map((t) => {
                const added = goals.some((g) => g.title === t.title);
                return (
                  <button key={t.title} type="button" disabled={added} onClick={() => addFromTemplate(t)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${added ? "bg-primary/10 border-primary text-primary cursor-default" : "border-border hover:border-primary/40 hover:bg-muted/50"} disabled:opacity-40`}>
                    {t.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom goal */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vlastní cíl</Label>
          <div className="flex gap-2">
            <Input className="h-11 flex-1" placeholder="Napiš svůj cíl..." value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} />
            <button type="button" onClick={addCustom} disabled={!customTitle.trim()}
              className="h-11 w-11 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40">
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Added goals */}
        {goals.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tvoje cíle ({goals.length})
              </Label>
              {goals.length > 5 && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400">
                  Tip: začni s 3-5 cíli
                </span>
              )}
            </div>
            <div className="space-y-2">
              {goals.map((goal) => {
                const isExpanded = expandedGoal === goal.id;
                const template = GOAL_TEMPLATES.find((t) => t.title === goal.title);

                return (
                  <div key={goal.id} className="border rounded-xl overflow-hidden transition-all">
                    <div className="flex items-center justify-between p-3">
                      <button type="button" className="flex items-center gap-2 flex-1 text-left min-w-0"
                        onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}>
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        <span className="text-sm font-medium truncate">{goal.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${getTypeColor(goal.type)}`}>
                          {getTypeLabel(goal.type)}
                        </span>
                        {isExpanded ? <ChevronUp size={14} className="text-muted-foreground shrink-0" /> : <ChevronDown size={14} className="text-muted-foreground shrink-0" />}
                      </button>
                      <button type="button" onClick={() => removeGoal(goal.id)} className="p-1 hover:bg-muted rounded shrink-0 ml-1">
                        <X size={14} className="text-muted-foreground" />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t space-y-3">
                        {template && <GoalGuidance template={template} />}

                        {goal.type === "measurable" && (
                          <div className="space-y-2">
                            <Label className="text-xs">Cílová hodnota</Label>
                            <Input className="h-11" type="number"
                              placeholder={goal.title.includes("hub") ? "Cílová váha (kg)" : "Cílové číslo"}
                              value={goal.targetWeight ?? ""}
                              onChange={(e) => updateGoal(goal.id, { targetWeight: e.target.value ? Number(e.target.value) : undefined })} />
                          </div>
                        )}
                        {goal.type === "habit" && (
                          <div className="space-y-2">
                            <Label className="text-xs">Kolikrát týdně</Label>
                            <div className="flex items-center gap-3">
                              <button type="button" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/70"
                                onClick={() => updateGoal(goal.id, { frequency: Math.max(1, (goal.frequency ?? 3) - 1) })}>-</button>
                              <span className="text-lg font-bold w-8 text-center">{goal.frequency ?? 3}</span>
                              <button type="button" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/70"
                                onClick={() => updateGoal(goal.id, { frequency: Math.min(7, (goal.frequency ?? 3) + 1) })}>+</button>
                              <span className="text-xs text-muted-foreground">x týdně</span>
                            </div>
                          </div>
                        )}
                        {goal.type === "challenge" && (
                          <div className="space-y-2">
                            <Label className="text-xs">Počet dní</Label>
                            <Input className="h-11" type="number" placeholder="30"
                              value={goal.challengeDays ?? ""}
                              onChange={(e) => updateGoal(goal.id, { challengeDays: e.target.value ? Number(e.target.value) : undefined })} />
                          </div>
                        )}
                        {goal.type === "oneoff" && (
                          <div className="space-y-2">
                            <Label className="text-xs">Deadline</Label>
                            <Input className="h-11" type="date" min={new Date().toISOString().split("T")[0]}
                              value={goal.deadline ?? ""} onChange={(e) => updateGoal(goal.id, { deadline: e.target.value })} />
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
