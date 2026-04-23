"use client";

import { format, isToday, parseISO } from "date-fns";
import { cs } from "date-fns/locale/cs";
import { EventCard } from "@/components/domain/calendar/event-card";
import type { CalendarEvent } from "@/types/calendar";

interface AgendaDayProps {
  date: string;
  events: CalendarEvent[];
  conflicts: Map<string, string[]>;
  onToggleComplete?: (id: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export function AgendaDay({
  date,
  events,
  conflicts,
  onToggleComplete,
  onEventClick,
}: AgendaDayProps) {
  const dateObj = parseISO(date);
  const today = isToday(dateObj);
  const dayLabel = format(dateObj, "EEEE d. MMMM", { locale: cs });

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
      </h3>

      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground/50 py-2 pl-1">
          Žádné eventy
        </p>
      ) : (
        <div className="space-y-1.5">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              hasConflict={conflicts.has(event.id)}
              onToggleComplete={onToggleComplete}
              onClick={onEventClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
