import { format, addDays } from "date-fns";
import type { CalendarEvent } from "@/types/calendar";

/**
 * Generuje virtuální (display-only) eventy z aktivních modulů.
 * Tyto eventy se nezapisují do DB — jsou pouze pro zobrazení v kalendáři.
 */

interface WorkoutDay {
  dayIndex: number;
  dayLabel: string;
  focus: string | null;
}

interface VirtualEventConfig {
  enableSleep?: boolean;
  bedtimeTarget?: string; // "22:30"
  wakeTarget?: string;    // "06:30"
  enableCheckin?: boolean;
  // Training
  trainingDays?: WorkoutDay[];
  preferTrainingTime?: string; // "morning" | "afternoon" | "evening"
  // Work
  workDays?: number[];        // [0,1,2,3,4] (0=Po)
  workStartTime?: string;     // "08:00"
  workEndTime?: string;       // "17:00"
  deepWorkHours?: number;
  preferDeepWork?: string;    // "morning" | "afternoon"
}

function getTrainingStartTime(pref?: string): string {
  switch (pref) {
    case "morning": return "07:00";
    case "afternoon": return "14:00";
    case "evening": return "18:00";
    default: return "17:00";
  }
}

function getDeepWorkStartTime(pref?: string, workStart?: string): string {
  if (pref === "morning") return workStart ?? "08:00";
  if (pref === "afternoon") return "13:00";
  // Default: 1 hour after work start
  if (workStart) {
    const [h, m] = workStart.split(":").map(Number);
    return `${String(Math.min(h + 1, 23)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  return "09:00";
}

export function generateVirtualEvents(
  weekStart: Date,
  weekEnd: Date,
  config: VirtualEventConfig
): CalendarEvent[] {
  const virtuals: CalendarEvent[] = [];
  let cursor = new Date(weekStart);

  while (cursor <= weekEnd) {
    const dateStr = format(cursor, "yyyy-MM-dd");
    const dayOfWeek = (cursor.getDay() + 6) % 7; // 0=Po

    // Spánkové eventy
    if (config.enableSleep) {
      if (config.bedtimeTarget) {
        virtuals.push(makeVirtualEvent({
          id: `virtual_sleep_bed_${dateStr}`,
          title: `Večerní rutina & spánek`,
          kind: "sleep",
          date: dateStr,
          startTime: config.bedtimeTarget,
          endTime: "23:59",
          linkedType: "sleep_module",
        }));
      }
      if (config.wakeTarget) {
        virtuals.push(makeVirtualEvent({
          id: `virtual_sleep_wake_${dateStr}`,
          title: `Buzení`,
          kind: "sleep",
          date: dateStr,
          startTime: config.wakeTarget,
          endTime: addMinutes(config.wakeTarget, 30),
          linkedType: "sleep_module",
        }));
      }
    }

    // Check-in eventy
    if (config.enableCheckin) {
      virtuals.push(makeVirtualEvent({
        id: `virtual_checkin_am_${dateStr}`,
        title: "Ranní check-in",
        kind: "checkin",
        date: dateStr,
        startTime: config.wakeTarget ? addMinutes(config.wakeTarget, 15) : "07:00",
        endTime: config.wakeTarget ? addMinutes(config.wakeTarget, 30) : "07:15",
        linkedType: "checkin_module",
      }));
      virtuals.push(makeVirtualEvent({
        id: `virtual_checkin_pm_${dateStr}`,
        title: "Večerní check-in",
        kind: "checkin",
        date: dateStr,
        startTime: config.bedtimeTarget ? addMinutes(config.bedtimeTarget, -30) : "21:00",
        endTime: config.bedtimeTarget ?? "21:15",
        linkedType: "checkin_module",
      }));
    }

    // Training eventy — zobrazit plánovaný trénink pro daný den
    if (config.trainingDays) {
      const todayWorkout = config.trainingDays.find((w) => w.dayIndex === dayOfWeek);
      if (todayWorkout) {
        const startTime = getTrainingStartTime(config.preferTrainingTime);
        virtuals.push(makeVirtualEvent({
          id: `virtual_training_${dateStr}`,
          title: `Trénink: ${todayWorkout.dayLabel}`,
          kind: "training",
          date: dateStr,
          startTime,
          endTime: addMinutes(startTime, 60),
          linkedType: "training_module",
          notes: todayWorkout.focus ?? undefined,
        }));
      }
    }

    // Deep work bloky — v pracovní dny
    if (config.deepWorkHours && config.deepWorkHours > 0 && config.workDays) {
      const isWorkDay = config.workDays.includes(dayOfWeek);
      if (isWorkDay) {
        const startTime = getDeepWorkStartTime(config.preferDeepWork, config.workStartTime);
        const durationMin = Math.round(config.deepWorkHours * 60);
        virtuals.push(makeVirtualEvent({
          id: `virtual_deepwork_${dateStr}`,
          title: `Deep work (${config.deepWorkHours}h)`,
          kind: "work_deep",
          date: dateStr,
          startTime,
          endTime: addMinutes(startTime, durationMin),
          linkedType: "work_module",
        }));
      }
    }

    cursor = addDays(cursor, 1);
  }

  return virtuals;
}

function makeVirtualEvent(params: {
  id: string;
  title: string;
  kind: string;
  date: string;
  startTime: string;
  endTime: string;
  linkedType: string;
  notes?: string;
}): CalendarEvent {
  return {
    id: params.id,
    owner_id: "",
    household_id: null,
    title: params.title,
    kind: params.kind as CalendarEvent["kind"],
    starts_at: `${params.date}T${params.startTime}:00`,
    ends_at: `${params.date}T${params.endTime}:00`,
    all_day: false,
    rrule: null,
    color: null,
    visibility: "private",
    notes: params.notes ?? null,
    linked_entity_type: params.linkedType,
    linked_entity_id: null,
    is_completed: false,
    reminder_minutes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    _virtual: true,
  };
}

/** Přidá minuty k časovému stringu HH:MM a vrátí nový HH:MM */
function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}
