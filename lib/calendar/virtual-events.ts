import { format, addDays } from "date-fns";
import type { CalendarEvent } from "@/types/calendar";

/**
 * Generuje virtuální (display-only) eventy z aktivních modulů.
 * Tyto eventy se nezapisují do DB — jsou pouze pro zobrazení v kalendáři.
 */

interface VirtualEventConfig {
  enableSleep?: boolean;
  bedtimeTarget?: string; // "22:30"
  wakeTarget?: string;    // "06:30"
  enableCheckin?: boolean;
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
        startTime: "07:00",
        endTime: "07:15",
        linkedType: "checkin_module",
      }));
      virtuals.push(makeVirtualEvent({
        id: `virtual_checkin_pm_${dateStr}`,
        title: "Večerní check-in",
        kind: "checkin",
        date: dateStr,
        startTime: "21:00",
        endTime: "21:15",
        linkedType: "checkin_module",
      }));
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
    notes: null,
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
