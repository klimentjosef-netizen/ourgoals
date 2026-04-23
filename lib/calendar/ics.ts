import { format } from "date-fns";
import type { CalendarEvent } from "@/types/calendar";

function formatICSDate(dateStr: string, allDay: boolean): string {
  const d = new Date(dateStr);
  if (allDay) {
    return format(d, "yyyyMMdd");
  }
  return format(d, "yyyyMMdd'T'HHmmss");
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function generateICS(
  events: CalendarEvent[],
  tzName = "Europe/Prague"
): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OurGoals//CZ",
    `X-WR-TIMEZONE:${tzName}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const event of events) {
    if (!event.starts_at) continue;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.id}@ourgoals`);
    lines.push(`SUMMARY:${escapeICS(event.title)}`);

    if (event.all_day) {
      lines.push(`DTSTART;VALUE=DATE:${formatICSDate(event.starts_at, true)}`);
      if (event.ends_at) {
        lines.push(`DTEND;VALUE=DATE:${formatICSDate(event.ends_at, true)}`);
      }
    } else {
      lines.push(`DTSTART;TZID=${tzName}:${formatICSDate(event.starts_at, false)}`);
      if (event.ends_at) {
        lines.push(`DTEND;TZID=${tzName}:${formatICSDate(event.ends_at, false)}`);
      }
    }

    if (event.rrule) {
      lines.push(`RRULE:${event.rrule}`);
    }
    if (event.notes) {
      lines.push(`DESCRIPTION:${escapeICS(event.notes)}`);
    }

    lines.push(`CATEGORIES:${event.kind}`);
    lines.push(`STATUS:${event.is_completed ? "COMPLETED" : "CONFIRMED"}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadICSBlob(icsString: string, filename: string): void {
  const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
