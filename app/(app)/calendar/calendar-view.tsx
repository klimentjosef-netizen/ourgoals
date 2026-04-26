"use client";

import { useState, useCallback, useTransition, useMemo } from "react";
import {
  endOfWeek,
  addDays,
  format,
  differenceInMinutes,
  isBefore,
  parseISO,
} from "date-fns";
import { cs } from "date-fns/locale/cs";
import { CalendarToolbar } from "@/components/domain/calendar/calendar-toolbar";
import { AgendaDay } from "@/components/domain/calendar/agenda-day";
import { WeekGrid } from "@/components/domain/calendar/week-grid";
import { EventForm } from "@/components/domain/calendar/event-form";
import { EventDetail } from "@/components/domain/calendar/event-detail";
import { MoveEventDialog } from "@/components/domain/calendar/move-event-dialog";
import { groupEventsByDay } from "@/lib/calendar/group-by-day";
import { expandRecurringEvents } from "@/lib/calendar/recurring";
import { generateVirtualEvents } from "@/lib/calendar/virtual-events";
import { detectConflicts } from "@/lib/calendar/conflicts";
import {
  getCalendarEvents,
  toggleEventCompleted,
  deleteCalendarEvent,
} from "@/app/(app)/calendar/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Sun } from "lucide-react";
import type { CalendarEvent } from "@/types/calendar";
import { toast } from "sonner";

type ViewMode = "agenda" | "week";

interface CalendarViewProps {
  initialEvents: CalendarEvent[];
  initialConflicts: [string, string[]][];
  initialWeekStart: string;
  userId: string;
  /** Nastavení modulů pro virtuální eventy */
  moduleConfig?: {
    enableSleep?: boolean;
    bedtimeTarget?: string | null;
    wakeTarget?: string | null;
    enableCheckin?: boolean;
    trainingDays?: { dayIndex: number; dayLabel: string; focus: string | null }[];
    preferTrainingTime?: string;
    workDays?: number[];
    workStartTime?: string;
    workEndTime?: string;
    deepWorkHours?: number;
    preferDeepWork?: string;
  };
}

export function CalendarView({
  initialEvents,
  initialConflicts,
  initialWeekStart,
  userId,
  moduleConfig,
}: CalendarViewProps) {
  const [view, setView] = useState<ViewMode>("agenda");
  const [currentWeekStart, setCurrentWeekStart] = useState(
    new Date(initialWeekStart)
  );
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [conflicts, setConflicts] = useState<Map<string, string[]>>(
    new Map(initialConflicts)
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();

  // Kind filter chips
  const [hiddenKinds, setHiddenKinds] = useState<Set<string>>(new Set());
  function toggleKind(kind: string) {
    setHiddenKinds((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }

  // FEATURE 5: Detail dialog
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // FEATURE 4: Move dialog
  const [moveEventTarget, setMoveEventTarget] = useState<CalendarEvent | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);

  const [, startTransition] = useTransition();

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  // FEATURE 2: Expand recurring events
  // FEATURE 3: Inject virtual events from modules
  const displayEvents = useMemo(() => {
    // Expanduj rekurentní eventy
    const expanded = expandRecurringEvents(events, currentWeekStart, weekEnd);

    // Přidej virtuální eventy z modulů
    if (moduleConfig) {
      const virtuals = generateVirtualEvents(
        currentWeekStart,
        weekEnd,
        {
          enableSleep: moduleConfig.enableSleep,
          bedtimeTarget: moduleConfig.bedtimeTarget ?? undefined,
          wakeTarget: moduleConfig.wakeTarget ?? undefined,
          enableCheckin: moduleConfig.enableCheckin,
        }
      );
      expanded.push(...virtuals);
    }

    // Seřaď podle starts_at
    expanded.sort((a, b) => {
      if (!a.starts_at) return 1;
      if (!b.starts_at) return -1;
      return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
    });

    // Filtruj podle hidden kinds
    return expanded.filter((e) => !hiddenKinds.has(e.kind));
  }, [events, currentWeekStart, weekEnd, moduleConfig, hiddenKinds]);

  // Aktualizuj konflikty pro display eventy
  const displayConflicts = useMemo(
    () => detectConflicts(displayEvents),
    [displayEvents]
  );

  // FEATURE 1: "Dnes" přehled
  const todayOverview = useMemo(() => {
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");

    const todayEvents = displayEvents.filter((e) => {
      if (!e.starts_at) return false;
      return format(parseISO(e.starts_at), "yyyy-MM-dd") === todayStr;
    });

    // Najdi další nadcházející event
    let nextEvent: CalendarEvent | null = null;
    let minutesUntilNext: number | null = null;

    for (const e of todayEvents) {
      if (!e.starts_at || e.is_completed) continue;
      const eventStart = parseISO(e.starts_at);
      if (isBefore(now, eventStart)) {
        nextEvent = e;
        minutesUntilNext = differenceInMinutes(eventStart, now);
        break;
      }
    }

    return {
      todayStr,
      dateLabel: format(now, "EEEE d. MMMM", { locale: cs }),
      eventCount: todayEvents.length,
      nextEvent,
      minutesUntilNext,
    };
  }, [displayEvents]);

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

  // FEATURE 5: Kliknutí na event otevře detail (ne edit)
  function handleEventClick(event: CalendarEvent) {
    setDetailEvent(event);
    setDetailOpen(true);
  }

  // Z detailu -> edit
  function handleEditFromDetail(event: CalendarEvent) {
    setEditingEvent(event);
    setFormOpen(true);
  }

  // Z detailu -> smazat
  async function handleDeleteFromDetail(id: string) {
    const result = await deleteCalendarEvent(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Event smazán");
      startTransition(() => {
        fetchEvents(currentWeekStart);
      });
    }
  }

  // FEATURE 4: Přesun eventu
  function handleMoveEvent(event: CalendarEvent) {
    setMoveEventTarget(event);
    setMoveOpen(true);
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
  const grouped = groupEventsByDay(displayEvents);

  // Ensure all 7 days of the week appear in agenda
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    format(addDays(currentWeekStart, i), "yyyy-MM-dd")
  );

  // FEATURE 1: Formátování "za X min" textu
  function formatTimeUntil(minutes: number): string {
    if (minutes < 1) return "právě teď";
    if (minutes < 60) return `Za ${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (m === 0) return `Za ${h}h`;
    return `Za ${h}h ${m}min`;
  }

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

      {/* Kind filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { kind: "training", label: "Trénink", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-300 dark:border-green-800" },
          { kind: "work_deep", label: "Deep work", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800" },
          { kind: "work_meeting", label: "Meeting", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800" },
          { kind: "family", label: "Rodina", color: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 border-pink-300 dark:border-pink-800" },
          { kind: "sleep", label: "Spánek", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800" },
          { kind: "checkin", label: "Check-in", color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800" },
          { kind: "custom", label: "Vlastní", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700" },
        ].map((chip) => (
          <button
            key={chip.kind}
            type="button"
            onClick={() => toggleKind(chip.kind)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
              hiddenKinds.has(chip.kind)
                ? "opacity-40 line-through bg-muted text-muted-foreground border-border"
                : chip.color
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Kompaktní "Dnes" přehled */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Sun size={18} className="text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium capitalize">
                {todayOverview.dateLabel}
              </p>
              {todayOverview.eventCount === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Dnes volno ✨
                </p>
              ) : (
                <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                  <span>
                    Dnes: {todayOverview.eventCount}{" "}
                    {todayOverview.eventCount === 1
                      ? "event"
                      : todayOverview.eventCount < 5
                        ? "eventy"
                        : "eventů"}
                  </span>
                  {todayOverview.nextEvent && todayOverview.minutesUntilNext !== null && (
                    <span className="text-primary font-medium">
                      {formatTimeUntil(todayOverview.minutesUntilNext)}: {todayOverview.nextEvent.title}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {displayEvents.length === 0 ? (
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
              conflicts={displayConflicts}
              onToggleComplete={handleToggleComplete}
              onEventClick={handleEventClick}
              onMoveEvent={handleMoveEvent}
            />
          ))}
        </div>
      ) : (
        <WeekGrid
          weekStart={currentWeekStart}
          events={displayEvents}
          onEventClick={handleEventClick}
        />
      )}

      {/* FEATURE 5: Event detail dialog */}
      <EventDetail
        event={detailEvent}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />

      {/* FEATURE 4: Move event dialog */}
      <MoveEventDialog
        event={moveEventTarget}
        open={moveOpen}
        onOpenChange={setMoveOpen}
        onMoved={() => {
          startTransition(() => {
            fetchEvents(currentWeekStart);
          });
        }}
      />

      <EventForm
        event={editingEvent}
        open={formOpen}
        onOpenChange={handleFormClose}
      />
    </div>
  );
}
