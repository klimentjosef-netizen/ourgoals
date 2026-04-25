"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import type { WorkSetupData, MeetingData } from "@/types/onboarding";

const DAY_LABELS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

const DAY_SELECT_OPTIONS = [
  { value: "0", label: "Pondělí" },
  { value: "1", label: "Úterý" },
  { value: "2", label: "Středa" },
  { value: "3", label: "Čtvrtek" },
  { value: "4", label: "Pátek" },
  { value: "5", label: "Sobota" },
  { value: "6", label: "Neděle" },
];

function createEmptyMeeting(): MeetingData {
  return { day: 0, timeFrom: "10:00", timeTo: "11:00", name: "" };
}

export function StepWork() {
  const { moduleSetups, setModuleSetup, nextStep, prevStep } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const data = (moduleSetups.work_focus ?? {}) as Partial<WorkSetupData>;

  const workLocation = data.workLocation ?? "office";
  const workStartTime = data.workStartTime ?? "08:00";
  const workEndTime = data.workEndTime ?? "17:00";
  const deepWorkHours = data.deepWorkHours ?? 4;
  const meetings = data.meetings ?? [];

  const [addingMeeting, setAddingMeeting] = useState(false);
  const [newMeeting, setNewMeeting] = useState<MeetingData>(createEmptyMeeting());

  const update = (partial: Partial<WorkSetupData>) => {
    setModuleSetup("work_focus", {
      ...data,
      workLocation,
      workStartTime,
      workEndTime,
      deepWorkHours,
      meetings,
      ...partial,
    });
  };

  const addMeeting = () => {
    if (!newMeeting.name.trim()) return;
    update({ meetings: [...meetings, newMeeting] });
    setNewMeeting(createEmptyMeeting());
    setAddingMeeting(false);
  };

  const removeMeeting = (index: number) => {
    update({ meetings: meetings.filter((_, i) => i !== index) });
  };

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (workStartTime && workEndTime && workStartTime >= workEndTime) {
      e.time = "Začátek práce musí být před koncem";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) nextStep();
  }

  return (
    <StepContainer
      title="Práce & focus"
      subtitle="Kde a kdy pracuješ, a kolik deep work chceš denně?"
      helperText="Nastav si pracovní režim, abychom mohli lépe plánovat."
      icon={Briefcase}
      onNext={handleNext}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-8">
        {/* Section 1: Tvoje práce */}
        <section className="space-y-5">
          <div>
            <h3 className="text-base font-semibold">Tvoje práce</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Základní nastavení tvého pracovního dne.
            </p>
          </div>

          {/* Work location pills */}
          <div className="space-y-2">
            <Label className="text-sm">Kde pracuješ?</Label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: "home", label: "Z domova" },
                  { value: "office", label: "Kancelář" },
                  { value: "mix", label: "Mix" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ workLocation: opt.value })}
                  className={`px-4 h-11 rounded-lg text-sm font-medium transition-all ${
                    workLocation === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Work time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workStart">Pracovní doba od</Label>
              <Input
                id="workStart"
                className="h-11"
                type="time"
                value={workStartTime}
                onChange={(e) => update({ workStartTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workEnd">Pracovní doba do</Label>
              <Input
                id="workEnd"
                className="h-11"
                type="time"
                value={workEndTime}
                onChange={(e) => update({ workEndTime: e.target.value })}
              />
            </div>
          </div>
          {errors.time && <p className="text-xs text-red-500">{errors.time}</p>}

          {/* Deep work slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Hodin deep work denně</Label>
              <span className="text-lg font-bold tabular-nums text-primary">
                {deepWorkHours}h
              </span>
            </div>
            <Slider
              value={[deepWorkHours]}
              onValueChange={(val) =>
                update({ deepWorkHours: Array.isArray(val) ? val[0] : val })
              }
              min={0}
              max={8}
              step={0.5}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/60">
              <span>0h</span>
              <span>4h</span>
              <span>8h</span>
            </div>
          </div>
        </section>

        {/* Section 2: Stálé meetingy */}
        <section className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">Stálé meetingy</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pravidelné schůzky, které máš každý týden.
            </p>
          </div>

          {/* Existing meetings */}
          {meetings.length > 0 && (
            <div className="space-y-2">
              {meetings.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {DAY_LABELS[m.day]} {m.timeFrom}–{m.timeTo}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => removeMeeting(i)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Inline add form */}
          {addingMeeting ? (
            <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Název</Label>
                <Input
                  className="h-11"
                  placeholder="Např. Týmový standup, 1:1 s manažerem..."
                  value={newMeeting.name}
                  onChange={(e) => setNewMeeting({ ...newMeeting, name: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Den</Label>
                  <Select
                    value={String(newMeeting.day)}
                    onValueChange={(val) => {
                      if (val !== null) setNewMeeting({ ...newMeeting, day: Number(val) });
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
                    value={newMeeting.timeFrom}
                    onChange={(e) => setNewMeeting({ ...newMeeting, timeFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Do</Label>
                  <Input
                    type="time"
                    className="h-11"
                    value={newMeeting.timeTo}
                    onChange={(e) => setNewMeeting({ ...newMeeting, timeTo: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  className="h-9"
                  onClick={addMeeting}
                  disabled={!newMeeting.name.trim()}
                >
                  Přidat
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9"
                  onClick={() => {
                    setAddingMeeting(false);
                    setNewMeeting(createEmptyMeeting());
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
              onClick={() => setAddingMeeting(true)}
            >
              <Plus size={16} className="mr-1.5" />
              Přidat meeting
            </Button>
          )}
        </section>
      </div>
    </StepContainer>
  );
}
