"use client";

import { format, differenceInMinutes } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EventKindBadge } from "@/components/domain/calendar/event-kind-badge";
import { ConflictBadge } from "@/components/domain/calendar/conflict-badge";
import { EVENT_KIND_CONFIG, type CalendarEvent } from "@/types/calendar";
import { ArrowRightLeft } from "lucide-react";

interface EventCardProps {
  event: CalendarEvent;
  hasConflict?: boolean;
  onToggleComplete?: (id: string) => void;
  onClick?: (event: CalendarEvent) => void;
  onMove?: (event: CalendarEvent) => void;
}

function formatDuration(startsAt: string, endsAt: string): string | null {
  const mins = differenceInMinutes(new Date(endsAt), new Date(startsAt));
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

export function EventCard({
  event,
  hasConflict,
  onToggleComplete,
  onClick,
  onMove,
}: EventCardProps) {
  const config = EVENT_KIND_CONFIG[event.kind];
  const borderClass = config?.bgClass ?? "border-l-zinc-300";
  const isVirtual = event._virtual;
  const isShared = !!event.household_id;

  const timeRange =
    !event.all_day && event.starts_at && event.ends_at
      ? `${format(new Date(event.starts_at), "HH:mm")} - ${format(new Date(event.ends_at), "HH:mm")}`
      : event.all_day
        ? "Celý den"
        : null;

  const duration =
    !event.all_day && event.starts_at && event.ends_at
      ? formatDuration(event.starts_at, event.ends_at)
      : null;

  // FEATURE 7: Sdílený event — fialový tint
  const sharedClasses = isShared
    ? "border-purple-400/50 bg-purple-50/30 dark:bg-purple-950/20"
    : "";

  // Virtuální event — jemný styl
  const virtualClasses = isVirtual ? "opacity-60 border-dashed" : "";

  return (
    <Card
      className={`flex items-start gap-3 border-l-4 p-3 cursor-pointer transition-colors hover:bg-muted/50 ${borderClass} ${event.is_completed ? "opacity-40" : ""} ${sharedClasses} ${virtualClasses}`}
      onClick={() => onClick?.(event)}
    >
      {!isVirtual && (
        <div
          className="pt-0.5"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete?.(event.id);
          }}
        >
          <Checkbox checked={event.is_completed} />
        </div>
      )}

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          {/* FEATURE 7: Sdílený indikátor */}
          {isShared && <span title="Sdílený event">👫</span>}
          {isVirtual && <span className="text-xs">🔄</span>}
          <span
            className={`text-sm font-medium truncate ${event.is_completed ? "line-through text-muted-foreground" : ""}`}
          >
            {event.title}
          </span>
          {hasConflict && <ConflictBadge />}
          {isShared && (
            <Badge variant="outline" className="text-[10px] text-purple-500 border-purple-300 py-0">
              Sdílený
            </Badge>
          )}
        </div>

        {event.notes && (
          <p className="text-xs text-muted-foreground/70 line-clamp-1">
            {event.notes}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {timeRange && (
            <span className="text-xs text-muted-foreground">{timeRange}</span>
          )}
          {duration && (
            <span className="text-xs text-muted-foreground/60">
              ({duration})
            </span>
          )}
          <EventKindBadge kind={event.kind} />

          {/* FEATURE 4: Tlačítko Přesunout */}
          {!isVirtual && onMove && (
            <button
              className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onMove(event);
              }}
            >
              <ArrowRightLeft size={12} />
              Přesunout
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
