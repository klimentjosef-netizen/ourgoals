import { format } from "date-fns";
import type { CalendarEvent } from "@/types/calendar";

export function groupEventsByDay(
  events: CalendarEvent[]
): Map<string, CalendarEvent[]> {
  const groups = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const dateKey = event.starts_at
      ? format(new Date(event.starts_at), "yyyy-MM-dd")
      : event.all_day
        ? format(new Date(event.created_at), "yyyy-MM-dd")
        : "unknown";

    const existing = groups.get(dateKey) ?? [];
    existing.push(event);
    groups.set(dateKey, existing);
  }

  return groups;
}
