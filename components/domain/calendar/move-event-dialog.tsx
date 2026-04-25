"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { moveEvent } from "@/app/(app)/calendar/actions";
import type { CalendarEvent } from "@/types/calendar";

interface MoveEventDialogProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMoved: () => void;
}

export function MoveEventDialog({
  event,
  open,
  onOpenChange,
  onMoved,
}: MoveEventDialogProps) {
  const [isPending, startTransition] = useTransition();

  const defaultDate = event?.starts_at
    ? format(new Date(event.starts_at), "yyyy-MM-dd")
    : format(new Date(), "yyyy-MM-dd");

  const defaultStart = event?.starts_at && !event.all_day
    ? format(new Date(event.starts_at), "HH:mm")
    : "09:00";

  const defaultEnd = event?.ends_at && !event.all_day
    ? format(new Date(event.ends_at), "HH:mm")
    : "10:00";

  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);

  // Resetuj stav když se event změní
  if (event?.starts_at) {
    const newDate = format(new Date(event.starts_at), "yyyy-MM-dd");
    const newStart = !event.all_day ? format(new Date(event.starts_at), "HH:mm") : "09:00";
    const newEnd = event.ends_at && !event.all_day ? format(new Date(event.ends_at), "HH:mm") : "10:00";
    if (date !== newDate && !open) {
      setDate(newDate);
      setStartTime(newStart);
      setEndTime(newEnd);
    }
  }

  if (!event) return null;

  function handleSubmit() {
    if (!event) return;
    if (startTime >= endTime) {
      toast.error("Začátek musí být před koncem");
      return;
    }

    const newStartsAt = `${date}T${startTime}:00`;
    const newEndsAt = `${date}T${endTime}:00`;

    startTransition(async () => {
      const result = await moveEvent(event.id, newStartsAt, newEndsAt);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Event přesunut");
        onMoved();
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Přesunout: {event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="move-date">Nové datum</Label>
            <Input
              id="move-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="move-start">Od</Label>
              <Input
                id="move-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="move-end">Do</Label>
              <Input
                id="move-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Zrušit
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Přesouvám..." : "Přesunout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
