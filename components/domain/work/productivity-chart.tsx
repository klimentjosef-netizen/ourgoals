"use client";

import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

interface DayData {
  date: string;
  minutes?: number;
  count?: number;
}

interface ProductivityChartProps {
  deepWork: DayData[];
  tasksCompleted: DayData[];
}

export function ProductivityChart({ deepWork, tasksCompleted }: ProductivityChartProps) {
  const maxMinutes = Math.max(...deepWork.map((d) => d.minutes ?? 0), 60);
  const maxTasks = Math.max(...tasksCompleted.map((d) => d.count ?? 0), 1);

  const totalDW = deepWork.reduce((sum, d) => sum + (d.minutes ?? 0), 0);
  const totalTasks = tasksCompleted.reduce((sum, d) => sum + (d.count ?? 0), 0);

  if (totalDW === 0 && totalTasks === 0) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center">
          <p className="text-sm text-muted-foreground">
            Zatím žádná data. Spusť deep work nebo dokonči úkol.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-4">
        {/* Deep work bars */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Deep work (minuty)</p>
          <div className="flex items-end gap-1 h-24">
            {deepWork.map((d) => {
              const heightPct = maxMinutes > 0 ? ((d.minutes ?? 0) / maxMinutes) * 100 : 0;
              const dayLabel = format(new Date(d.date + "T00:00:00"), "EEEEEE", { locale: cs });
              const isToday = d.date === format(new Date(), "yyyy-MM-dd");

              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] tabular-nums text-muted-foreground">
                    {(d.minutes ?? 0) > 0 ? d.minutes : ""}
                  </span>
                  <div className="w-full flex items-end" style={{ height: "70px" }}>
                    <div
                      className={`w-full rounded-t-sm transition-all ${
                        (d.minutes ?? 0) === 0
                          ? "bg-muted"
                          : isToday
                            ? "bg-primary"
                            : "bg-primary/60"
                      }`}
                      style={{
                        height: (d.minutes ?? 0) === 0 ? "2px" : `${heightPct}%`,
                        minHeight: (d.minutes ?? 0) > 0 ? "4px" : "2px",
                      }}
                    />
                  </div>
                  <span className={`text-[10px] tabular-nums ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks bars */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Dokončené úkoly</p>
          <div className="flex items-end gap-1 h-16">
            {tasksCompleted.map((d) => {
              const heightPct = maxTasks > 0 ? ((d.count ?? 0) / maxTasks) * 100 : 0;
              const dayLabel = format(new Date(d.date + "T00:00:00"), "EEEEEE", { locale: cs });
              const isToday = d.date === format(new Date(), "yyyy-MM-dd");

              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] tabular-nums text-muted-foreground">
                    {(d.count ?? 0) > 0 ? d.count : ""}
                  </span>
                  <div className="w-full flex items-end" style={{ height: "40px" }}>
                    <div
                      className={`w-full rounded-t-sm transition-all ${
                        (d.count ?? 0) === 0
                          ? "bg-muted"
                          : isToday
                            ? "bg-emerald-500"
                            : "bg-emerald-400/60"
                      }`}
                      style={{
                        height: (d.count ?? 0) === 0 ? "2px" : `${heightPct}%`,
                        minHeight: (d.count ?? 0) > 0 ? "4px" : "2px",
                      }}
                    />
                  </div>
                  <span className={`text-[10px] tabular-nums ${isToday ? "font-bold text-emerald-600" : "text-muted-foreground"}`}>
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Deep work: <strong className="text-foreground">{Math.round(totalDW / 60 * 10) / 10}h</strong></span>
          <span>Úkoly: <strong className="text-foreground">{totalTasks}</strong></span>
        </div>
      </CardContent>
    </Card>
  );
}
