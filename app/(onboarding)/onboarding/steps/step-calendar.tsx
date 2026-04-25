"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CalendarSetupData, WeekDayData, CommitmentData } from "@/types/onboarding";

const DAY_LABELS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

const DAY_SELECT_OPTIONS = [
  { value: "-1", label: "Každý den" },
  { value: "0", label: "Pondělí" },
  { value: "1", label: "Úterý" },
  { value: "2", label: "Středa" },
  { value: "3", label: "Čtvrtek" },
  { value: "4", label: "Pátek" },
  { value: "5", label: "Sobota" },
  { value: "6", label: "Neděle" },
];

const DEFAULT_WEEK_DAYS: WeekDayData[] = [
  { day: 0, isWorkDay: true, wakeTime: "06:30", sleepTime: "22:30" },
  { day: 1, isWorkDay: true, wakeTime: "06:30", sleepTime: "22:30" },
  { day: 2, isWorkDay: true, wakeTime: "06:30", sleepTime: "22:30" },
  { day: 3, isWorkDay: true, wakeTime: "06:30", sleepTime: "22:30" },
  { day: 4, isWorkDay: true, wakeTime: "06:30", sleepTime: "22:30" },
  { day: 5, isWorkDay: false, wakeTime: "08:00", sleepTime: "23:00" },
  { day: 6, isWorkDay: false, wakeTime: "08:00", sleepTime: "23:00" },
];

function createEmptyCommitment(): CommitmentData {
  return { day: 0, timeFrom: "09:00", timeTo: "10:00", name: "", recurring: true };
}

export function StepCalendar() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();

  const data = (moduleSetups.calendar ?? {}) as Partial<CalendarSetupData>;
  const weekDays = data.weekDays ?? DEFAULT_WEEK_DAYS;
  const commitments = data.commitments ?? [];
  const preferTraining = data.preferTraining ?? "any";
  const preferDeepWork = data.preferDeepWork ?? "any";

  const [addingCommitment, setAddingCommitment] = useState(false);
  const [newCommitment, setNewCommitment] = useState<CommitmentData>(createEmptyCommitment());

  const update = (partial: Partial<CalendarSetupData>) => {
    setModuleSetup("calendar", { ...data, weekDays, commitments, preferTraining, preferDeepWork, ...partial });
  };

  const updateDay = (dayIndex: number, changes: Partial<WeekDayData>) => {
    const next = weekDays.map((d) => (d.day === dayIndex ? { ...d, ...changes } : d));
    update({ weekDays: next });
  };

  const addCommitment = () => {
    if (!newCommitment.name.trim()) return;
    update({ commitments: [...commitments, newCommitment] });
    setNewCommitment(createEmptyCommitment());
    setAddingCommitment(false);
  };

  const removeCommitment = (index: number) => {
    update({ commitments: commitments.filter((_, i) => i !== index) });
  };

  return (
    <StepContainer
      title="Kalendář & čas"
      subtitle="Nastav si svůj typický týden, závazky a preference."
      helperText="Detailní nastavení nám pomůže lépe plánovat tvůj den."
      icon={CalendarDays}
      onNext={nextStep}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-8">
        {/* Section 1: Tvůj typický týden */}
        <section className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">Tvůj typický týden</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Nastav si pro každý den, jestli je pracovní, a kdy vstáváš/chodíš spát.
            </p>
          </div>

          <div className="space-y-3">
            {weekDays.map((wd) => (
              <div
                key={wd.day}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                {/* Day name */}
                <span className="text-sm font-medium w-8 shrink-0">
                  {DAY_LABELS[wd.day]}
                </span>

                {/* Work/Free toggle */}
                <div className="flex rounded-lg overflow-hidden border border-border shrink-0">
                  <button
                    type="button"
                    onClick={() => updateDay(wd.day, { isWorkDay: true })}
                    className={`px-3 h-9 text-xs font-medium transition-colors ${
                      wd.isWorkDay
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Pracovní
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDay(wd.day, { isWorkDay: false })}
                    className={`px-3 h-9 text-xs font-medium transition-colors ${
                      !wd.isWorkDay
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Volný
                  </button>
                </div>

                {/* Time pickers */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground shrink-0">Vstávám</span>
                    <Input
                      type="time"
                      className="h-9 text-xs flex-1 min-w-[90px]"
                      value={wd.wakeTime}
                      onChange={(e) => updateDay(wd.day, { wakeTime: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground shrink-0">Spát</span>
                    <Input
                      type="time"
                      className="h-9 text-xs flex-1 min-w-[90px]"
                      value={wd.sleepTime}
                      onChange={(e) => updateDay(wd.day, { sleepTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Stálé závazky */}
        <section className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">Stálé závazky</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Přidej pravidelné aktivity, které máš každý týden (kroužky, lekce, ...).
            </p>
          </div>

          {/* Existing commitments */}
          {commitments.length > 0 && (
            <div className="space-y-2">
              {commitments.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.day === -1 ? "Každý den" : DAY_LABELS[c.day]}{" "}
                      {c.timeFrom}–{c.timeTo}
                      {c.recurring ? " · každý týden" : " · jednorázově"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => removeCommitment(i)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Inline add form */}
          {addingCommitment ? (
            <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Název</Label>
                <Input
                  className="h-11"
                  placeholder="Např. Angličtina, Crossfit..."
                  value={newCommitment.name}
                  onChange={(e) => setNewCommitment({ ...newCommitment, name: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Den</Label>
                  <Select
                    value={String(newCommitment.day)}
                    onValueChange={(val) => {
                      if (val !== null) setNewCommitment({ ...newCommitment, day: Number(val) });
                    }}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAY_SELECT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Od</Label>
                  <Input
                    type="time"
                    className="h-11"
                    value={newCommitment.timeFrom}
                    onChange={(e) => setNewCommitment({ ...newCommitment, timeFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Do</Label>
                  <Input
                    type="time"
                    className="h-11"
                    value={newCommitment.timeTo}
                    onChange={(e) => setNewCommitment({ ...newCommitment, timeTo: e.target.value })}
                  />
                </div>
              </div>

              {/* Recurring toggle */}
              <div className="flex items-center gap-2">
                <Label className="text-xs">Opakování:</Label>
                <div className="flex rounded-lg overflow-hidden border border-border">
                  <button
                    type="button"
                    onClick={() => setNewCommitment({ ...newCommitment, recurring: true })}
                    className={`px-3 h-8 text-xs font-medium transition-colors ${
                      newCommitment.recurring
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Každý týden
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCommitment({ ...newCommitment, recurring: false })}
                    className={`px-3 h-8 text-xs font-medium transition-colors ${
                      !newCommitment.recurring
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Jednorázově
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  className="h-9"
                  onClick={addCommitment}
                  disabled={!newCommitment.name.trim()}
                >
                  Přidat
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9"
                  onClick={() => {
                    setAddingCommitment(false);
                    setNewCommitment(createEmptyCommitment());
                  }}
                >
                  Zrušit
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-11 w-full"
              onClick={() => setAddingCommitment(true)}
            >
              <Plus size={16} className="mr-1.5" />
              Přidat závazek
            </Button>
          )}
        </section>

        {/* Section 3: Preference */}
        <section className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">Preference</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Kdy přednostně plánujeme aktivity?
            </p>
          </div>

          {/* Prefer training */}
          <div className="space-y-2">
            <Label className="text-sm">Kdy preferuješ trénovat?</Label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: "morning", label: "Ráno" },
                  { value: "afternoon", label: "Odpoledne" },
                  { value: "evening", label: "Večer" },
                  { value: "any", label: "Je mi jedno" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ preferTraining: opt.value })}
                  className={`px-4 h-11 rounded-lg text-sm font-medium transition-all ${
                    preferTraining === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prefer deep work */}
          <div className="space-y-2">
            <Label className="text-sm">Kdy preferuješ deep work?</Label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: "morning", label: "Ráno" },
                  { value: "afternoon", label: "Odpoledne" },
                  { value: "any", label: "Je mi jedno" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ preferDeepWork: opt.value })}
                  className={`px-4 h-11 rounded-lg text-sm font-medium transition-all ${
                    preferDeepWork === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </StepContainer>
  );
}
