import type { CalendarEvent } from "@/types/calendar";

export function detectConflicts(
  events: CalendarEvent[]
): Map<string, string[]> {
  const conflicts = new Map<string, string[]>();

  const timed = events
    .filter((e) => !e.all_day && e.starts_at && e.ends_at)
    .sort(
      (a, b) =>
        new Date(a.starts_at!).getTime() - new Date(b.starts_at!).getTime()
    );

  for (let i = 0; i < timed.length; i++) {
    for (let j = i + 1; j < timed.length; j++) {
      const aEnd = new Date(timed[i].ends_at!).getTime();
      const bStart = new Date(timed[j].starts_at!).getTime();

      if (bStart >= aEnd) break;

      // Overlap detected
      const aConflicts = conflicts.get(timed[i].id) ?? [];
      aConflicts.push(timed[j].id);
      conflicts.set(timed[i].id, aConflicts);

      const bConflicts = conflicts.get(timed[j].id) ?? [];
      bConflicts.push(timed[i].id);
      conflicts.set(timed[j].id, bConflicts);
    }
  }

  return conflicts;
}

export function hasConflict(
  event: CalendarEvent,
  others: CalendarEvent[]
): boolean {
  if (event.all_day || !event.starts_at || !event.ends_at) return false;

  const eStart = new Date(event.starts_at).getTime();
  const eEnd = new Date(event.ends_at).getTime();

  return others.some((o) => {
    if (o.id === event.id || o.all_day || !o.starts_at || !o.ends_at)
      return false;
    const oStart = new Date(o.starts_at).getTime();
    const oEnd = new Date(o.ends_at).getTime();
    return eStart < oEnd && eEnd > oStart;
  });
}
