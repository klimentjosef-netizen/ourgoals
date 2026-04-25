"use client";

import { useEffect, useState } from "react";
import { format, addDays, isToday, differenceInMinutes, parseISO } from "date-fns";
import { cs } from "date-fns/locale/cs";
import { EVENT_KIND_CONFIG, type CalendarEvent } from "@/types/calendar";

interface WeekGridProps {
  weekStart: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

const HOUR_START = 6;
const HOUR_END = 23;
const HOUR_HEIGHT = 48; // px per hour
const TOTAL_HOURS = HOUR_END - HOUR_START;

export function WeekGrid({ weekStart, events, onEventClick }: WeekGridProps) {
  const [currentMinutes, setCurrentMinutes] = useState<number | null>(null);

  useEffect(() => {
    function update() {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      setCurrentMinutes(mins);
    }
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function getEventPosition(event: CalendarEvent) {
    if (!event.starts_at || !event.ends_at || event.all_day) return null;

    const start = new Date(event.starts_at);
    const end = new Date(event.ends_at);

    const startMins = start.getHours() * 60 + start.getMinutes();
    const durationMins = differenceInMinutes(end, start);

    const topOffset = ((startMins - HOUR_START * 60) / 60) * HOUR_HEIGHT;
    const height = (durationMins / 60) * HOUR_HEIGHT;

    return {
      top: Math.max(0, topOffset),
      height: Math.max(HOUR_HEIGHT / 4, height),
    };
  }

  function getEventsForDay(day: Date) {
    const dayStr = format(day, "yyyy-MM-dd");
    return events.filter((e) => {
      if (!e.starts_at) return false;
      return format(parseISO(e.starts_at), "yyyy-MM-dd") === dayStr;
    });
  }

  const currentTimeTop =
    currentMinutes !== null
      ? ((currentMinutes - HOUR_START * 60) / 60) * HOUR_HEIGHT
      : null;

  return (
    <div className="overflow-x-auto">
      {/* FEATURE 8: Mobilní upozornění */}
      <div className="block sm:hidden text-center py-4 text-sm text-muted-foreground">
        <p>Týdenní pohled je dostupný na větší obrazovce.</p>
        <p className="text-xs text-muted-foreground/50 mt-1">
          Na mobilu doporučujeme pohled Agenda.
        </p>
      </div>
      <div className="min-w-[700px] hidden sm:block">
        {/* Day headers */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
          <div className="p-2 text-xs text-muted-foreground" />
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={`p-2 text-center text-xs font-medium capitalize ${
                isToday(day) ? "text-primary bg-primary/5" : "text-muted-foreground"
              }`}
            >
              <div>{format(day, "EEE", { locale: cs })}</div>
              <div className={`text-lg ${isToday(day) ? "font-bold" : ""}`}>
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div
          className="relative grid grid-cols-[60px_repeat(7,1fr)]"
          style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
        >
          {/* Hour labels */}
          {Array.from({ length: TOTAL_HOURS }, (_, i) => (
            <div
              key={i}
              className="absolute left-0 w-[60px] text-[10px] text-muted-foreground pr-2 text-right -translate-y-1/2"
              style={{ top: `${i * HOUR_HEIGHT}px` }}
            >
              {`${HOUR_START + i}:00`}
            </div>
          ))}

          {/* Hour lines */}
          {Array.from({ length: TOTAL_HOURS }, (_, i) => (
            <div
              key={`line-${i}`}
              className="absolute left-[60px] right-0 border-t border-muted/40"
              style={{ top: `${i * HOUR_HEIGHT}px` }}
            />
          ))}

          {/* Current time indicator */}
          {currentTimeTop !== null &&
            currentTimeTop >= 0 &&
            currentTimeTop <= TOTAL_HOURS * HOUR_HEIGHT && (
              <div
                className="absolute left-[60px] right-0 border-t-2 border-red-500 z-20 pointer-events-none"
                style={{ top: `${currentTimeTop}px` }}
              >
                <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-red-500" />
              </div>
            )}

          {/* Event columns */}
          {days.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(day);

            return (
              <div
                key={day.toISOString()}
                className="relative border-l border-muted/40"
                style={{
                  gridColumn: `${dayIndex + 2}`,
                  gridRow: "1",
                }}
              >
                {/* All-day events at top */}
                {dayEvents
                  .filter((e) => e.all_day)
                  .map((event) => {
                    const config = EVENT_KIND_CONFIG[event.kind];
                    return (
                      <div
                        key={event.id}
                        className={`absolute left-0.5 right-0.5 rounded px-1 py-0.5 text-[10px] truncate cursor-pointer z-10 ${config?.bgClass ?? "bg-muted"}`}
                        style={{ top: 0, height: `${HOUR_HEIGHT / 2}px` }}
                        onClick={() => onEventClick?.(event)}
                      >
                        {event.title}
                      </div>
                    );
                  })}

                {/* Timed events */}
                {dayEvents
                  .filter((e) => !e.all_day)
                  .map((event) => {
                    const pos = getEventPosition(event);
                    if (!pos) return null;

                    const config = EVENT_KIND_CONFIG[event.kind];

                    return (
                      <div
                        key={event.id}
                        className={`absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 text-[10px] leading-tight overflow-hidden cursor-pointer border-l-2 ${config?.bgClass ?? "bg-muted border-l-muted"} ${event.is_completed ? "opacity-50" : ""}`}
                        style={{
                          top: `${pos.top}px`,
                          height: `${pos.height}px`,
                        }}
                        onClick={() => onEventClick?.(event)}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        {pos.height > 24 && event.starts_at && event.ends_at && (
                          <div className="text-muted-foreground">
                            {format(new Date(event.starts_at), "HH:mm")} -{" "}
                            {format(new Date(event.ends_at), "HH:mm")}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
