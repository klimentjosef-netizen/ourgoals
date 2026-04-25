import { addDays, addWeeks, addMonths, format, parseISO, differenceInMilliseconds } from "date-fns";
import type { CalendarEvent } from "@/types/calendar";

/**
 * Expanduje opakující se eventy (s polem rrule) do konkrétních výskytů
 * v zadaném rozsahu [startDate, endDate].
 *
 * Podporované frekvence:
 * - FREQ=DAILY  → každý den
 * - FREQ=WEEKLY → stejný den v týdnu
 * - FREQ=MONTHLY → stejné datum v měsíci
 */
export function expandRecurringEvents(
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  const result: CalendarEvent[] = [];

  for (const event of events) {
    if (!event.rrule || !event.starts_at) {
      // Nerekurentní event — přidej jak je
      result.push(event);
      continue;
    }

    const freq = parseFrequency(event.rrule);
    if (!freq) {
      result.push(event);
      continue;
    }

    const eventStart = parseISO(event.starts_at);
    const eventEnd = event.ends_at ? parseISO(event.ends_at) : null;
    const durationMs = eventEnd
      ? differenceInMilliseconds(eventEnd, eventStart)
      : 0;

    // Generuj výskyty od data původního eventu
    let cursor = new Date(eventStart);
    let iteration = 0;
    const MAX_ITERATIONS = 366; // ochrana proti nekonečné smyčce

    while (cursor <= endDate && iteration < MAX_ITERATIONS) {
      iteration++;

      if (cursor >= startDate && cursor <= endDate) {
        const newStart = new Date(cursor);
        const newEnd = new Date(newStart.getTime() + durationMs);

        result.push({
          ...event,
          id: `${event.id}_recur_${format(newStart, "yyyy-MM-dd")}`,
          starts_at: newStart.toISOString(),
          ends_at: newEnd.toISOString(),
          // Označení, že jde o expandovaný výskyt
          _recurring_source_id: event.id,
        } as CalendarEvent & { _recurring_source_id?: string });
      }

      // Posuň kurzor podle frekvence
      switch (freq) {
        case "DAILY":
          cursor = addDays(cursor, 1);
          break;
        case "WEEKLY":
          cursor = addWeeks(cursor, 1);
          break;
        case "MONTHLY":
          cursor = addMonths(cursor, 1);
          break;
      }
    }
  }

  return result;
}

function parseFrequency(rrule: string): "DAILY" | "WEEKLY" | "MONTHLY" | null {
  if (rrule.includes("FREQ=DAILY")) return "DAILY";
  if (rrule.includes("FREQ=WEEKLY")) return "WEEKLY";
  if (rrule.includes("FREQ=MONTHLY")) return "MONTHLY";
  return null;
}
