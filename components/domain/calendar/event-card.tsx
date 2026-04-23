"use client";

import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EventKindBadge } from "@/components/domain/calendar/event-kind-badge";
import { ConflictBadge } from "@/components/domain/calendar/conflict-badge";
import { EVENT_KIND_CONFIG, type CalendarEvent } from "@/types/calendar";

interface EventCardProps {
  event: CalendarEvent;
  hasConflict?: boolean;
  onToggleComplete?: (id: string) => void;
  onClick?: (event: CalendarEvent) => void;
}

export function EventCard({
  event,
  hasConflict,
  onToggleComplete,
  onClick,
}: EventCardProps) {
  const config = EVENT_KIND_CONFIG[event.kind];
  const borderClass = config?.bgClass ?? "border-l-zinc-300";

  const timeRange =
    !event.all_day && event.starts_at && event.ends_at
      ? `${format(new Date(event.starts_at), "HH:mm")} - ${format(new Date(event.ends_at), "HH:mm")}`
      : event.all_day
        ? "Celý den"
        : null;

  return (
    <Card
      className={`flex items-start gap-3 border-l-4 p-3 cursor-pointer transition-colors hover:bg-muted/50 ${borderClass} ${event.is_completed ? "opacity-60" : ""}`}
      onClick={() => onClick?.(event)}
    >
      <div
        className="pt-0.5"
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete?.(event.id);
        }}
      >
        <Checkbox checked={event.is_completed} />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm font-medium truncate ${event.is_completed ? "line-through" : ""}`}
          >
            {event.title}
          </span>
          {hasConflict && <ConflictBadge />}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {timeRange && (
            <span className="text-xs text-muted-foreground">{timeRange}</span>
          )}
          <EventKindBadge kind={event.kind} />
        </div>
      </div>
    </Card>
  );
}
