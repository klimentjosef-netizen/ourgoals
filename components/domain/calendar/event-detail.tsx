"use client";

import { format, differenceInMinutes } from "date-fns";
import { cs } from "date-fns/locale/cs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventKindBadge } from "@/components/domain/calendar/event-kind-badge";
import { type CalendarEvent } from "@/types/calendar";
import { Pencil, Trash2, Clock, CalendarDays, FileText, Link2, Bell, Users2 } from "lucide-react";

interface EventDetailProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

const REMINDER_LABELS: Record<number, string> = {
  5: "5 min před",
  15: "15 min před",
  30: "30 min před",
  60: "1 hodinu před",
};

export function EventDetail({
  event,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: EventDetailProps) {
  if (!event) return null;

  const isVirtual = event._virtual;

  const timeRange =
    !event.all_day && event.starts_at && event.ends_at
      ? `${format(new Date(event.starts_at), "HH:mm")} - ${format(new Date(event.ends_at), "HH:mm")}`
      : event.all_day
        ? "Celý den"
        : null;

  const dateLabel = event.starts_at
    ? format(new Date(event.starts_at), "EEEE d. MMMM yyyy", { locale: cs })
    : null;

  const duration =
    !event.all_day && event.starts_at && event.ends_at
      ? (() => {
          const mins = differenceInMinutes(
            new Date(event.ends_at),
            new Date(event.starts_at)
          );
          if (mins <= 0) return null;
          const h = Math.floor(mins / 60);
          const m = mins % 60;
          if (h > 0 && m > 0) return `${h}h ${m}min`;
          if (h > 0) return `${h}h`;
          return `${m}min`;
        })()
      : null;

  const isShared = !!event.household_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle className="text-lg">{event.title}</DialogTitle>
            {isVirtual && (
              <Badge variant="secondary" className="text-xs">
                Automatický
              </Badge>
            )}
            {isShared && (
              <Badge variant="outline" className="text-xs text-purple-500 border-purple-300 gap-1">
                <Users2 size={12} />
                Sdílený
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Typ eventu */}
          <div className="flex items-center gap-2">
            <EventKindBadge kind={event.kind} />
            {event.is_completed && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                Hotovo
              </Badge>
            )}
          </div>

          {/* Datum */}
          {dateLabel && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays size={14} />
              <span className="capitalize">{dateLabel}</span>
            </div>
          )}

          {/* Čas */}
          {timeRange && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={14} />
              <span>{timeRange}</span>
              {duration && (
                <span className="text-muted-foreground/60">({duration})</span>
              )}
            </div>
          )}

          {/* Připomenutí */}
          {event.reminder_minutes && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bell size={14} />
              <span>
                Připomenutí: {REMINDER_LABELS[event.reminder_minutes] ?? `${event.reminder_minutes} min před`}
              </span>
            </div>
          )}

          {/* Propojený modul */}
          {event.linked_entity_type && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link2 size={14} />
              <span>Propojeno: {event.linked_entity_type}</span>
            </div>
          )}

          {/* Poznámky */}
          {event.notes && (
            <div className="flex items-start gap-2 text-sm">
              <FileText size={14} className="text-muted-foreground mt-0.5" />
              <p className="text-muted-foreground whitespace-pre-wrap">
                {event.notes}
              </p>
            </div>
          )}

          {/* Opakování */}
          {event.rrule && (
            <div className="text-xs text-muted-foreground/60">
              Opakování: {formatRrule(event.rrule)}
            </div>
          )}
        </div>

        <DialogFooter>
          {!isVirtual && (
            <>
              <Button
                type="button"
                variant="outline"
                className="text-destructive"
                onClick={() => {
                  onDelete(event.id);
                  onOpenChange(false);
                }}
              >
                <Trash2 size={14} className="mr-1" />
                Smazat
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onEdit(event);
                  onOpenChange(false);
                }}
              >
                <Pencil size={14} className="mr-1" />
                Upravit
              </Button>
            </>
          )}
          {isVirtual && (
            <p className="text-xs text-muted-foreground">
              Automatický event z modulu — nelze upravit přímo.
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatRrule(rrule: string): string {
  if (rrule.includes("FREQ=DAILY")) return "Denně";
  if (rrule.includes("FREQ=WEEKLY")) return "Týdně";
  if (rrule.includes("FREQ=MONTHLY")) return "Měsíčně";
  return rrule;
}
