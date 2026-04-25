"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

type DayStatus = "perfect" | "ok" | "missed" | "pending" | "future";

interface WeeklyProgressProps {
  /** Array of 7 entries (Mon-Sun), each with date and status */
  days: Array<{
    date: string;
    dayLabel: string;
    status: DayStatus;
  }>;
}

const STATUS_STYLES: Record<DayStatus, string> = {
  perfect: "bg-green-500",
  ok: "bg-yellow-500",
  missed: "bg-muted-foreground/30",
  pending: "border-2 border-primary bg-primary/10",
  future: "border-2 border-muted-foreground/20 bg-transparent",
};

const DAY_LABELS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

export function WeeklyProgress({ days }: WeeklyProgressProps) {
  const completedDays = days.filter(
    (d) => d.status === "perfect" || d.status === "ok"
  ).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 size={16} className="text-primary" />
          Tento týden: {completedDays}/7 dní splněno
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          {days.map((day, i) => (
            <div key={day.date} className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full ${STATUS_STYLES[day.status]}`}
                title={`${DAY_LABELS[i]}: ${day.status}`}
              />
              <span className="text-[10px] text-muted-foreground">
                {DAY_LABELS[i]}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
