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
import { CalendarDays, Plus, Trash2, Briefcase, Dumbbell, Moon, ChevronDown, ChevronUp } from "lucide-react";
import type { MeetingData, CommitmentData } from "@/types/onboarding";

const DAY_LABELS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
const DAY_FULL = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];

const DAY_SELECT_OPTIONS = [
  { value: "0", label: "Pondělí" },
  { value: "1", label: "Úterý" },
  { value: "2", label: "Středa" },
  { value: "3", label: "Čtvrtek" },
  { value: "4", label: "Pátek" },
  { value: "5", label: "Sobota" },
  { value: "6", label: "Neděle" },
];

interface DaySchedule {
  day: number;
  type: "work" | "off" | "partial";
  workFrom: string;
  workTo: string;
  workLocation: "office" | "home" | "mix";
  wakeTime: string;
  sleepTime: string;
  hasTraining: boolean;
  trainingFrom: string;
  trainingTo: string;
  deepWorkHours: number;
}

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day: 0, type: "work", workFrom: "08:00", workTo: "17:00", workLocation: "office", wakeTime: "06:30", sleepTime: "22:30", hasTraining: false, trainingFrom: "17:30", trainingTo: "18:30", deepWorkHours: 2 },
  { day: 1, type: "work", workFrom: "08:00", workTo: "17:00", workLocation: "office", wakeTime: "06:30", sleepTime: "22:30", hasTraining: true, trainingFrom: "17:30", trainingTo: "18:30", deepWorkHours: 2 },
  { day: 2, type: "work", workFrom: "08:00", workTo: "17:00", workLocation: "office", wakeTime: "06:30", sleepTime: "22:30", hasTraining: false, trainingFrom: "17:30", trainingTo: "18:30", deepWorkHours: 2 },
  { day: 3, type: "work", workFrom: "08:00", workTo: "17:00", workLocation: "office", wakeTime: "06:30", sleepTime: "22:30", hasTraining: true, trainingFrom: "17:30", trainingTo: "18:30", deepWorkHours: 2 },
  { day: 4, type: "work", workFrom: "08:00", workTo: "17:00", workLocation: "office", wakeTime: "06:30", sleepTime: "22:30", hasTraining: false, trainingFrom: "17:30", trainingTo: "18:30", deepWorkHours: 2 },
  { day: 5, type: "off", workFrom: "08:00", workTo: "17:00", workLocation: "home", wakeTime: "08:00", sleepTime: "23:00", hasTraining: true, trainingFrom: "10:00", trainingTo: "11:00", deepWorkHours: 0 },
  { day: 6, type: "off", workFrom: "08:00", workTo: "17:00", workLocation: "home", wakeTime: "08:00", sleepTime: "23:00", hasTraining: false, trainingFrom: "10:00", trainingTo: "11:00", deepWorkHours: 0 },
];

function DayCard({
  schedule,
  onChange,
  expanded,
  onToggle,
  hasTrainingModule,
  hasWorkModule,
}: {
  schedule: DaySchedule;
  onChange: (s: DaySchedule) => void;
  expanded: boolean;
  onToggle: () => void;
  hasTrainingModule: boolean;
  hasWorkModule: boolean;
}) {
  const isWork = schedule.type === "work" || schedule.type === "partial";

  return (
    <div className={`rounded-xl border-2 transition-all overflow-hidden ${
      expanded ? "border-primary/30 shadow-sm" : "border-border"
    }`}>
      {/* Header — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-sm font-bold w-6">{DAY_LABELS[schedule.day]}</span>

        {/* Quick status pills */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            schedule.type === "work"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              : schedule.type === "partial"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
          }`}>
            {schedule.type === "work" ? "Práce" : schedule.type === "partial" ? "Částečný" : "Volno"}
          </span>

          {isWork && hasWorkModule && (
            <span className="text-[10px] text-muted-foreground">
              {schedule.workFrom}–{schedule.workTo}
            </span>
          )}

          {schedule.hasTraining && hasTrainingModule && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
              Trénink {schedule.trainingFrom}
            </span>
          )}
        </div>

        {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-3 pb-4 space-y-4 border-t border-border/50 pt-3">
          {/* Day type */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{DAY_FULL[schedule.day]}</Label>
            <div className="flex rounded-lg overflow-hidden border border-border">
              {(["work", "partial", "off"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange({ ...schedule, type })}
                  className={`flex-1 h-10 text-xs font-medium transition-colors ${
                    schedule.type === type
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {type === "work" ? "Pracovní" : type === "partial" ? "Částečný" : "Volný"}
                </button>
              ))}
            </div>
          </div>

          {/* Work details */}
          {isWork && hasWorkModule && (
            <div className="space-y-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/10">
              <div className="flex items-center gap-2">
                <Briefcase size={14} className="text-blue-500" />
                <span className="text-xs font-medium">Práce</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px]">Od</Label>
                  <Input type="time" className="h-9 text-xs" value={schedule.workFrom} onChange={(e) => onChange({ ...schedule, workFrom: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Do</Label>
                  <Input type="time" className="h-9 text-xs" value={schedule.workTo} onChange={(e) => onChange({ ...schedule, workTo: e.target.value })} />
                </div>
              </div>
              <div className="flex rounded-lg overflow-hidden border border-border">
                {(["office", "home", "mix"] as const).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => onChange({ ...schedule, workLocation: loc })}
                    className={`flex-1 h-8 text-[10px] font-medium transition-colors ${
                      schedule.workLocation === loc
                        ? "bg-blue-500 text-white"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {loc === "office" ? "Kancelář" : loc === "home" ? "Domov" : "Mix"}
                  </button>
                ))}
              </div>
              {/* Deep work */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Deep work</span>
                <span className="text-xs font-bold tabular-nums">{schedule.deepWorkHours}h</span>
              </div>
              <Slider
                value={[schedule.deepWorkHours]}
                onValueChange={(val) => onChange({ ...schedule, deepWorkHours: Array.isArray(val) ? val[0] : val })}
                min={0} max={6} step={0.5}
              />
            </div>
          )}

          {/* Training */}
          {hasTrainingModule && (
            <div className={`space-y-3 p-3 rounded-lg ${schedule.hasTraining ? "bg-orange-50/50 dark:bg-orange-950/10" : "bg-muted/30"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell size={14} className={schedule.hasTraining ? "text-orange-500" : "text-muted-foreground"} />
                  <span className="text-xs font-medium">Trénink</span>
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ ...schedule, hasTraining: !schedule.hasTraining })}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center ${
                    schedule.hasTraining ? "bg-orange-500 justify-end" : "bg-muted justify-start"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full mx-0.5 ${schedule.hasTraining ? "bg-white" : "bg-background border border-border"}`} />
                </button>
              </div>
              {schedule.hasTraining && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Od</Label>
                    <Input type="time" className="h-9 text-xs" value={schedule.trainingFrom} onChange={(e) => onChange({ ...schedule, trainingFrom: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Do</Label>
                    <Input type="time" className="h-9 text-xs" value={schedule.trainingTo} onChange={(e) => onChange({ ...schedule, trainingTo: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sleep */}
          <div className="space-y-3 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/10">
            <div className="flex items-center gap-2">
              <Moon size={14} className="text-indigo-400" />
              <span className="text-xs font-medium">Spánek</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px]">Vstávám</Label>
                <Input type="time" className="h-9 text-xs" value={schedule.wakeTime} onChange={(e) => onChange({ ...schedule, wakeTime: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Spát</Label>
                <Input type="time" className="h-9 text-xs" value={schedule.sleepTime} onChange={(e) => onChange({ ...schedule, sleepTime: e.target.value })} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function StepWeek() {
  const { moduleSetups, setModuleSetup, selectedModules, nextStep, prevStep } = useOnboarding();

  const hasTraining = selectedModules.includes("training");
  const hasWork = selectedModules.includes("work_focus");

  // Load saved data or defaults
  const savedSchedule = (moduleSetups.week_schedule as { days?: DaySchedule[] } | undefined)?.days;
  const [schedule, setSchedule] = useState<DaySchedule[]>(savedSchedule ?? DEFAULT_SCHEDULE);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  // Meetings & commitments
  const savedMeetings = (moduleSetups.week_schedule as { meetings?: MeetingData[] } | undefined)?.meetings ?? [];
  const savedCommitments = (moduleSetups.week_schedule as { commitments?: CommitmentData[] } | undefined)?.commitments ?? [];
  const [meetings, setMeetings] = useState<MeetingData[]>(savedMeetings);
  const [commitments, setCommitments] = useState<CommitmentData[]>(savedCommitments);
  const [addingItem, setAddingItem] = useState<"meeting" | "commitment" | null>(null);
  const [newName, setNewName] = useState("");
  const [newDay, setNewDay] = useState("0");
  const [newFrom, setNewFrom] = useState("09:00");
  const [newTo, setNewTo] = useState("10:00");

  function updateDay(dayIndex: number, changes: Partial<DaySchedule>) {
    setSchedule((prev) => prev.map((d) => d.day === dayIndex ? { ...d, ...changes } : d));
  }

  function addItem() {
    if (!newName.trim()) return;
    if (addingItem === "meeting") {
      setMeetings([...meetings, { day: Number(newDay), timeFrom: newFrom, timeTo: newTo, name: newName.trim() }]);
    } else {
      setCommitments([...commitments, { day: Number(newDay), timeFrom: newFrom, timeTo: newTo, name: newName.trim(), recurring: true }]);
    }
    setNewName("");
    setAddingItem(null);
  }

  function handleNext() {
    // Save everything to both module stores for backward compatibility
    const workDays = schedule.filter((d) => d.type !== "off").map((d) => d.day);
    const weekDays = schedule.map((d) => ({
      day: d.day,
      isWorkDay: d.type !== "off",
      wakeTime: d.wakeTime,
      sleepTime: d.sleepTime,
    }));

    // Find most common work time for backward compat
    const workSchedules = schedule.filter((d) => d.type !== "off");
    const workStartTime = workSchedules[0]?.workFrom ?? "08:00";
    const workEndTime = workSchedules[0]?.workTo ?? "17:00";
    const avgDeepWork = workSchedules.length > 0
      ? Math.round(workSchedules.reduce((sum, d) => sum + d.deepWorkHours, 0) / workSchedules.length * 2) / 2
      : 0;

    // Save unified schedule
    setModuleSetup("week_schedule", { days: schedule, meetings, commitments });

    // Save to calendar module store
    setModuleSetup("calendar", {
      weekDays,
      commitments,
      workDays,
      preferTraining: "custom",
      preferDeepWork: "custom",
    });

    // Save to work_focus module store
    setModuleSetup("work_focus", {
      workLocation: workSchedules[0]?.workLocation ?? "office",
      workStartTime,
      workEndTime,
      deepWorkHours: avgDeepWork,
      meetings,
    });

    nextStep();
  }

  const trainingDaysCount = schedule.filter((d) => d.hasTraining).length;

  return (
    <StepContainer
      title="Tvůj týden"
      subtitle="Nastav si každý den přesně podle sebe."
      helperText="Rozvrh se propíše do kalendáře. Můžeš upravit kdykoliv."
      icon={CalendarDays}
      onNext={handleNext}
      onPrev={prevStep}
      canSkip={false}
      canProceed
    >
      <div className="space-y-6">
        {/* Quick summary */}
        <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-medium">
            {schedule.filter((d) => d.type !== "off").length} pracovních dní
          </span>
          {hasTraining && (
            <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 font-medium">
              {trainingDaysCount} tréninků
            </span>
          )}
          <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-medium">
            {meetings.length + commitments.length} závazků
          </span>
        </div>

        {/* Day cards */}
        <div className="space-y-2">
          {schedule.map((day) => (
            <DayCard
              key={day.day}
              schedule={day}
              onChange={(s) => updateDay(day.day, s)}
              expanded={expandedDay === day.day}
              onToggle={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
              hasTrainingModule={hasTraining}
              hasWorkModule={hasWork}
            />
          ))}
        </div>

        {/* Meetings & commitments */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Pravidelné meetingy a závazky</h3>

          {/* List */}
          {(meetings.length > 0 || commitments.length > 0) && (
            <div className="space-y-1.5">
              {meetings.map((m, i) => (
                <div key={`m-${i}`} className="flex items-center gap-2 p-2.5 rounded-lg bg-purple-50/50 dark:bg-purple-950/10 border border-purple-200/50 dark:border-purple-800/30">
                  <Briefcase size={12} className="text-purple-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">{DAY_FULL[m.day]} {m.timeFrom}–{m.timeTo}</p>
                  </div>
                  <button type="button" onClick={() => setMeetings(meetings.filter((_, idx) => idx !== i))} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
                </div>
              ))}
              {commitments.map((c, i) => (
                <div key={`c-${i}`} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/50">
                  <CalendarDays size={12} className="text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.day >= 0 ? DAY_FULL[c.day] : "Každý den"} {c.timeFrom}–{c.timeTo}</p>
                  </div>
                  <button type="button" onClick={() => setCommitments(commitments.filter((_, idx) => idx !== i))} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          )}

          {/* Add form */}
          {addingItem ? (
            <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
              <Input className="h-10" placeholder={addingItem === "meeting" ? "Název meetingu..." : "Název závazku..."} value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
              <div className="grid grid-cols-3 gap-2">
                <Select value={newDay} onValueChange={(v) => { if (v) setNewDay(v); }}>
                  <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAY_SELECT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="time" className="h-10 text-xs" value={newFrom} onChange={(e) => setNewFrom(e.target.value)} />
                <Input type="time" className="h-10 text-xs" value={newTo} onChange={(e) => setNewTo(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-9" onClick={addItem} disabled={!newName.trim()}>Přidat</Button>
                <Button size="sm" variant="ghost" className="h-9" onClick={() => { setAddingItem(null); setNewName(""); }}>Zrušit</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-10 text-xs" onClick={() => setAddingItem("meeting")}>
                <Plus size={14} className="mr-1" /> Meeting
              </Button>
              <Button variant="outline" size="sm" className="h-10 text-xs" onClick={() => setAddingItem("commitment")}>
                <Plus size={14} className="mr-1" /> Závazek
              </Button>
            </div>
          )}
        </section>
      </div>
    </StepContainer>
  );
}
