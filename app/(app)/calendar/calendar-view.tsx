"use client";

import { useState, useCallback, useTransition } from "react";
import {
  startOfWeek,
  endOfWeek,
  addDays,
  format,
} from "date-fns";
import { CalendarToolbar } from "@/components/domain/calendar/calendar-toolbar";
import { AgendaDay } from "@/components/domain/calendar/agenda-day";
import { WeekGrid } from "@/components/domain/calendar/week-grid";
import { EventForm } from "@/components/domain/calendar/event-form";
import { groupEventsByDay } from "@/lib/calendar/group-by-day";
import { detectConflicts } from "@/lib/calendar/conflicts";
import {
  getCalendarEvents,
  toggleEventCompleted,
} from "@/app/(app)/calendar/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import type { CalendarEvent } from "@/types/calendar";
import { toast } from "sonner";

type CalendarView = "agenda" | "week";

interface CalendarViewProps {
  initialEvents: CalendarEvent[];
  initialConflicts: [string, string[]][];
  initialWeekStart: string;
  userId: string;
}

export function CalendarView({
  initialEvents,
  initialConflicts,
  initialWeekStart,
  userId,
}: CalendarViewProps) {
  const [view, setView] = useState<CalendarView>("agenda");
  const [currentWeekStart, setCurrentWeekStart] = useState(
    new Date(initialWeekStart)
  );
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [conflicts, setConflicts] = useState<Map<string, string[]>>(
    new Map(initialConflicts)
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [, startTransition] = useTransition();

  const fetchEvents = useCallback(
    async (weekStart: Date) => {
      const rangeStart = format(weekStart, "yyyy-MM-dd'T'00:00:00");
      const rangeEnd = format(
        endOfWeek(weekStart, { weekStartsOn: 1 }),
        "yyyy-MM-dd'T'23:59:59"
      );

      const result = await getCalendarEvents(userId, rangeStart, rangeEnd);
      if (!result.error) {
        setEvents(result.events);
        setConflicts(detectConflicts(result.events));
      }
    },
    [userId]
  );

  function handleWeekChange(newStart: Date) {
    setCurrentWeekStart(newStart);
    startTransition(() => {
      fetchEvents(newStart);
    });
  }

  function handleNewEvent() {
    setEditingEvent(undefined);
    setFormOpen(true);
  }

  function handleEventClick(event: CalendarEvent) {
    setEditingEvent(event);
    setFormOpen(true);
  }

  async function handleToggleComplete(id: string) {
    // Optimistic update
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, is_completed: !e.is_completed } : e
      )
    );

    const result = await toggleEventCompleted(id);
    if (result.error) {
      toast.error(result.error);
      // Revert
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, is_completed: !e.is_completed } : e
        )
      );
    }
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open);
    if (!open) {
      setEditingEvent(undefined);
      // Refetch events after form closes
      startTransition(() => {
        fetchEvents(currentWeekStart);
      });
    }
  }

  // Group events by day for agenda view
  const grouped = groupEventsByDay(events);

  // Ensure all 7 days of the week appear in agenda
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    format(addDays(currentWeekStart, i), "yyyy-MM-dd")
  );

  return (
    <div className="space-y-4">
      <CalendarToolbar
        view={view}
        onViewChange={setView}
        currentWeekStart={currentWeekStart}
        onWeekChange={handleWeekChange}
        events={events}
        onNewEvent={handleNewEvent}
      />

      {events.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
              <CalendarPlus size={32} className="text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Tento týden je prázdný</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Naplánuj si tréninky, schůzky a důležité úkoly. Struktura dne ti pomůže dosáhnout cílů.
              </p>
            </div>
            <Button onClick={handleNewEvent}>Přidat událost &rarr;</Button>
          </CardContent>
        </Card>
      ) : view === "agenda" ? (
        <div className="space-y-6">
          {weekDays.map((dayStr) => (
            <AgendaDay
              key={dayStr}
              date={dayStr}
              events={grouped.get(dayStr) ?? []}
              conflicts={conflicts}
              onToggleComplete={handleToggleComplete}
              onEventClick={handleEventClick}
            />
          ))}
        </div>
      ) : (
        <WeekGrid
          weekStart={currentWeekStart}
          events={events}
          onEventClick={handleEventClick}
        />
      )}

      <EventForm
        event={editingEvent}
        open={formOpen}
        onOpenChange={handleFormClose}
      />
    </div>
  );
}
