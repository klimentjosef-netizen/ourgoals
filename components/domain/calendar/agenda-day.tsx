"use client";

import { format, isToday, parseISO, differenceInMinutes } from "date-fns";
import { cs } from "date-fns/locale/cs";
import { EventCard } from "@/components/domain/calendar/event-card";
import type { CalendarEvent } from "@/types/calendar";

interface AgendaDayProps {
  date: string;
  events: CalendarEvent[];
  conflicts: Map<string, string[]>;
  onToggleComplete?: (id: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onMoveEvent?: (event: CalendarEvent) => void;
}

/** FEATURE 6: Spočítá mezery mezi eventy v daném dni */
function computeGaps(events: CalendarEvent[]): GapInfo[] {
  const timed = events
    .filter((e) => !e.all_day && e.starts_at && e.ends_at)
    .sort(
      (a, b) =>
        new Date(a.starts_at!).getTime() - new Date(b.starts_at!).getTime()
    );

  if (timed.length < 2) return [];

  const gaps: GapInfo[] = [];

  for (let i = 0; i < timed.length - 1; i++) {
    const currentEnd = new Date(timed[i].ends_at!);
    const nextStart = new Date(timed[i + 1].starts_at!);
    const gapMinutes = differenceInMinutes(nextStart, currentEnd);

    // Zobrazuj pouze mezery delší než 1 hodinu
    if (gapMinutes >= 60) {
      gaps.push({
        afterEventId: timed[i].id,
        startTime: format(currentEnd, "HH:mm"),
        endTime: format(nextStart, "HH:mm"),
        durationHours: Math.floor(gapMinutes / 60),
        durationMinutes: gapMinutes % 60,
      });
    }
  }

  return gaps;
}

interface GapInfo {
  afterEventId: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  durationMinutes: number;
}

function formatGapDuration(gap: GapInfo): string {
  if (gap.durationHours > 0 && gap.durationMinutes > 0) {
    return `${gap.durationHours}h ${gap.durationMinutes}min`;
  }
  if (gap.durationHours > 0) return `${gap.durationHours}h`;
  return `${gap.durationMinutes}min`;
}

export function AgendaDay({
  date,
  events,
  conflicts,
  onToggleComplete,
  onEventClick,
  onMoveEvent,
}: AgendaDayProps) {
  const dateObj = parseISO(date);
  const today = isToday(dateObj);
  const dayLabel = format(dateObj, "EEEE d. MMMM", { locale: cs });

  // FEATURE 6: Spočítej mezery
  const gaps = computeGaps(events);
  const gapMap = new Map(gaps.map((g) => [g.afterEventId, g]));

  return (
    <div className="space-y-2">
      <h3
        className={`text-sm font-semibold capitalize sticky top-0 bg-background/95 backdrop-blur-sm py-1 ${
          today
            ? "text-primary border-b-2 border-primary pb-1"
            : "text-muted-foreground"
        }`}
      >
        {dayLabel}
        {today && (
          <span className="ml-2 text-xs font-normal text-primary/70">
            dnes
          </span>
        )}
        {events.length > 0 && (
          <span className="ml-2 text-xs font-normal text-muted-foreground/50">
            ({events.length} {events.length === 1 ? "event" : events.length < 5 ? "eventy" : "eventů"})
          </span>
        )}
      </h3>

      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground/30 py-1 pl-1">
          Volný den
        </p>
      ) : (
        <div className="space-y-1.5">
          {events.map((event) => (
            <div key={event.id}>
              <EventCard
                event={event}
                hasConflict={conflicts.has(event.id)}
                onToggleComplete={onToggleComplete}
                onClick={onEventClick}
                onMove={onMoveEvent}
              />
              {/* FEATURE 6: Volný čas mezi eventy */}
              {gapMap.has(event.id) && (
                <div className="flex items-center gap-2 px-3 py-1.5 my-1">
                  <div className="flex-1 border-t border-dashed border-muted-foreground/20" />
                  <span className="text-[11px] text-muted-foreground/40 whitespace-nowrap">
                    Volno {gapMap.get(event.id)!.startTime}–{gapMap.get(event.id)!.endTime} ({formatGapDuration(gapMap.get(event.id)!)})
                  </span>
                  <div className="flex-1 border-t border-dashed border-muted-foreground/20" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
