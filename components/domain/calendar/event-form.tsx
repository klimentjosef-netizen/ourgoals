"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { showXPToast } from "@/components/domain/gamification/xp-toast";
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "@/app/(app)/calendar/actions";
import { EVENT_KIND_OPTIONS, type CalendarEvent, type EventKind } from "@/types/calendar";
import { format } from "date-fns";
import { Bell } from "lucide-react";

interface EventFormProps {
  event?: CalendarEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
}

type FormState = {
  error?: string;
  event?: CalendarEvent;
  xpAwarded?: number;
  leveledUp?: boolean;
  newLevel?: number;
  newTitle?: string;
  success?: boolean;
} | null;

const RRULE_OPTIONS = [
  { value: "none", label: "Neopakovat" },
  { value: "FREQ=DAILY", label: "Denně" },
  { value: "FREQ=WEEKLY", label: "Týdně" },
  { value: "FREQ=MONTHLY", label: "Měsíčně" },
];

const REMINDER_OPTIONS = [
  { value: "none", label: "Žádné připomenutí" },
  { value: "5", label: "5 min před" },
  { value: "15", label: "15 min před" },
  { value: "30", label: "30 min před" },
  { value: "60", label: "1 hodinu před" },
];

export function EventForm({
  event,
  open,
  onOpenChange,
  defaultDate,
}: EventFormProps) {
  const isEditing = !!event;

  const [kind, setKind] = useState(event?.kind ?? "custom");
  const [rrule, setRrule] = useState(event?.rrule ?? "none");
  const [allDay, setAllDay] = useState(event?.all_day ?? false);
  const [reminderMinutes, setReminderMinutes] = useState(
    event?.reminder_minutes ? String(event.reminder_minutes) : "none"
  );

  // Reset state when event changes
  useEffect(() => {
    setKind(event?.kind ?? "custom");
    setRrule(event?.rrule ?? "none");
    setAllDay(event?.all_day ?? false);
    setReminderMinutes(
      event?.reminder_minutes ? String(event.reminder_minutes) : "none"
    );
  }, [event]);

  const defaultDateValue = event?.starts_at
    ? format(new Date(event.starts_at), "yyyy-MM-dd")
    : defaultDate ?? format(new Date(), "yyyy-MM-dd");

  const defaultStartTime = event?.starts_at && !event.all_day
    ? format(new Date(event.starts_at), "HH:mm")
    : "09:00";

  const defaultEndTime = event?.ends_at && !event.all_day
    ? format(new Date(event.ends_at), "HH:mm")
    : "10:00";

  async function formAction(
    _prevState: FormState,
    formData: FormData
  ): Promise<FormState> {
    // Inject controlled values into formData
    formData.set("kind", kind);
    formData.set("rrule", rrule);
    formData.set("reminder_minutes", reminderMinutes);
    if (allDay) {
      formData.set("all_day", "on");
    } else {
      formData.delete("all_day");
    }

    // Validace: začátek musí být před koncem
    if (!allDay) {
      const startTime = formData.get("starts_at_time") as string;
      const endTime = formData.get("ends_at_time") as string;
      if (startTime && endTime && startTime >= endTime) {
        return { error: "Začátek musí být před koncem" };
      }
    }

    try {
      if (isEditing) {
        const result = await updateCalendarEvent(event.id, formData);
        if (result.error) return { error: result.error };
        return { success: true };
      } else {
        const result = await createCalendarEvent(formData);
        if (result.error) return { error: result.error };
        return result;
      }
    } catch {
      return { error: "Neočekávaná chyba" };
    }
  }

  const [state, dispatch, isPending] = useActionState(formAction, null);

  useEffect(() => {
    if (!state) return;

    if (state.error) {
      toast.error(state.error);
      return;
    }

    if (state.xpAwarded) {
      showXPToast(state.xpAwarded, "Nový event v kalendáři");
    }

    if (state.leveledUp && state.newLevel && state.newTitle) {
      toast.success(`Level Up! Lv.${state.newLevel} ${state.newTitle}`);
    }

    toast.success(isEditing ? "Event aktualizován" : "Event vytvořen!");
    onOpenChange(false);
  }, [state, isEditing, onOpenChange]);

  async function handleDelete() {
    if (!event) return;
    const result = await deleteCalendarEvent(event.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Event smazán");
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Upravit event" : "Nový event"}
          </DialogTitle>
        </DialogHeader>

        <form action={dispatch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Název *</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Např. Trénink, Meeting..."
              defaultValue={event?.title ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label>Typ</Label>
            <Select value={kind} onValueChange={(val) => { if (val) setKind(val as EventKind); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Vyber typ" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_KIND_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Datum *</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={defaultDateValue}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="all_day"
              checked={allDay}
              onCheckedChange={(checked) => setAllDay(checked === true)}
            />
            <Label htmlFor="all_day" className="text-sm cursor-pointer">
              Celý den
            </Label>
          </div>

          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="starts_at_time">Od</Label>
                <Input
                  id="starts_at_time"
                  name="starts_at_time"
                  type="time"
                  defaultValue={defaultStartTime}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ends_at_time">Do</Label>
                <Input
                  id="ends_at_time"
                  name="ends_at_time"
                  type="time"
                  defaultValue={defaultEndTime}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Opakování</Label>
            <Select value={rrule} onValueChange={(val) => { if (val !== null) setRrule(val); }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RRULE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Bell size={14} />
              Připomenout
            </Label>
            <Select value={reminderMinutes} onValueChange={(val) => { if (val !== null) setReminderMinutes(val); }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {reminderMinutes !== "none" && (
              <p className="text-xs text-muted-foreground/70">
                Push notifikace budou brzy dostupné. Připomenutí se zatím uloží k eventu.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Poznámky</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Volitelné poznámky..."
              rows={3}
              defaultValue={event?.notes ?? ""}
            />
          </div>

          <DialogFooter>
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                className="text-destructive"
                onClick={handleDelete}
              >
                Smazat
              </Button>
            )}
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Ukládám..."
                : isEditing
                  ? "Uložit změny"
                  : "Vytvořit event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
