"use client";

import { format, addWeeks, subWeeks, endOfWeek } from "date-fns";
import { cs } from "date-fns/locale/cs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Plus, Download, Link2 } from "lucide-react";
import { generateICS, downloadICSBlob } from "@/lib/calendar/ics";
import type { CalendarEvent } from "@/types/calendar";
import Link from "next/link";

type CalendarView = "agenda" | "week";

interface CalendarToolbarProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  currentWeekStart: Date;
  onWeekChange: (newStart: Date) => void;
  events: CalendarEvent[];
  onNewEvent: () => void;
}

export function CalendarToolbar({
  view,
  onViewChange,
  currentWeekStart,
  onWeekChange,
  events,
  onNewEvent,
}: CalendarToolbarProps) {
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  const rangeLabel = `${format(currentWeekStart, "d.", { locale: cs })} - ${format(weekEnd, "d. MMMM yyyy", { locale: cs })}`;

  function handleExportICS() {
    const ics = generateICS(events);
    downloadICSBlob(ics, "ourgoals-calendar.ics");
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Tabs
          value={view}
          onValueChange={(val) => onViewChange(val as CalendarView)}
        >
          <TabsList>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="week">Týden</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onWeekChange(subWeeks(currentWeekStart, 1))}
        >
          <ChevronLeft size={16} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const today = new Date();
            const day = today.getDay();
            const diff = day === 0 ? -6 : 1 - day;
            const monday = new Date(today);
            monday.setDate(today.getDate() + diff);
            monday.setHours(0, 0, 0, 0);
            onWeekChange(monday);
          }}
        >
          Dnes
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onWeekChange(addWeeks(currentWeekStart, 1))}
        >
          <ChevronRight size={16} />
        </Button>

        <span className="text-sm text-muted-foreground ml-2 hidden sm:inline">
          {rangeLabel}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExportICS}>
          <Download size={14} className="mr-1" />
          ICS
        </Button>

        {/* FEATURE 9: Připojit kalendář */}
        <Link href="/calendar/connect">
          <Button variant="outline" size="sm">
            <Link2 size={14} className="mr-1" />
            <span className="hidden sm:inline">Připojit</span>
          </Button>
        </Link>

        <Button size="sm" onClick={onNewEvent}>
          <Plus size={14} className="mr-1" />
          Nový event
        </Button>
      </div>
    </div>
  );
}
