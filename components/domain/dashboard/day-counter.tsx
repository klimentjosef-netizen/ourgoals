"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

interface DayCounterProps {
  /** ISO date string of user registration */
  registeredAt: string;
  /** If user has goal with deadline: { current day, total days } */
  goalDeadline?: { targetDate: string } | null;
}

export function DayCounter({ registeredAt, goalDeadline }: DayCounterProps) {
  const today = new Date();
  const daysSinceRegistration = differenceInDays(today, parseISO(registeredAt)) + 1;

  let label: string;
  if (goalDeadline?.targetDate) {
    const totalDays = differenceInDays(parseISO(goalDeadline.targetDate), parseISO(registeredAt)) + 1;
    label = `Den ${daysSinceRegistration}/${totalDays}`;
  } else {
    label = `Den ${daysSinceRegistration}`;
  }

  return (
    <Card className="shrink-0 min-w-[120px]">
      <CardContent className="pt-2 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950/30 text-violet-500">
            <CalendarDays size={20} />
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums">{label}</p>
            <p className="text-xs text-muted-foreground">od registrace</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
