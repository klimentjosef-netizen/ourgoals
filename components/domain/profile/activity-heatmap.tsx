"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Loader2 } from "lucide-react";
import { format, subDays } from "date-fns";
import { cs } from "date-fns/locale/cs";
import { getActivityHeatmapData } from "@/app/(app)/profile/profile-actions";

interface ActivityHeatmapProps {
  userId: string;
}

interface DayData {
  date: string;
  status: "none" | "ok" | "perfect";
  xp: number;
}

const DAY_LABELS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

export function ActivityHeatmap({ userId }: ActivityHeatmapProps) {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivityHeatmapData(userId, 91)
      .then(setData)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity size={18} />
            Aktivita
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Build grid: 13 columns (weeks) x 7 rows (days)
  // We need to align so the last column ends with today
  const today = new Date();
  const todayDow = today.getDay(); // 0=Sun, 1=Mon, ...
  // Convert to Mon=0 ... Sun=6
  const mondayDow = todayDow === 0 ? 6 : todayDow - 1;

  // Total days to show: 13 weeks * 7 = 91
  const totalDays = 91;
  const startDate = subDays(today, totalDays - 1);

  // Create a map for quick lookup
  const dataMap = new Map(data.map((d) => [d.date, d]));

  // Build grid columns (weeks)
  const weeks: { date: Date; data: DayData | null }[][] = [];
  let currentDate = new Date(startDate);

  // Find the Monday of the start week
  const startDow = currentDate.getDay();
  const startMondayOffset = startDow === 0 ? 6 : startDow - 1;

  // Adjust start to Monday
  const adjustedStart = subDays(currentDate, startMondayOffset);
  currentDate = new Date(adjustedStart);

  let currentWeek: { date: Date; data: DayData | null }[] = [];

  for (let i = 0; i < 13 * 7; i++) {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    const dayData = dataMap.get(dateStr) ?? null;
    const isInRange =
      currentDate >= startDate && currentDate <= today;

    currentWeek.push({
      date: new Date(currentDate),
      data: isInRange ? dayData : null,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentDate = new Date(currentDate.getTime() + 86400000);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Count active days
  const activeDays = data.filter((d) => d.status !== "none").length;
  const perfectDays = data.filter((d) => d.status === "perfect").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity size={18} />
          Aktivita – posledních 90 dní
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-[3px]">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] pr-1.5">
            {DAY_LABELS.map((label, i) => (
              <div
                key={label}
                className="h-[14px] flex items-center text-[9px] text-muted-foreground"
              >
                {i % 2 === 0 ? label : ""}
              </div>
            ))}
          </div>

          {/* Grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => {
                const dateStr = format(day.date, "yyyy-MM-dd");
                const status = day.data?.status ?? "none";
                const isFuture = day.date > today;
                const isOutOfRange = day.data === null && !isFuture;

                let bgClass = "bg-muted/40";
                if (!isFuture && !isOutOfRange) {
                  if (status === "perfect") {
                    bgClass = "bg-green-500 dark:bg-green-600";
                  } else if (status === "ok") {
                    bgClass = "bg-green-300 dark:bg-green-800";
                  } else {
                    bgClass = "bg-muted/60";
                  }
                }
                if (isFuture) {
                  bgClass = "bg-transparent";
                }

                return (
                  <div
                    key={dateStr}
                    className={`w-[14px] h-[14px] rounded-[2px] ${bgClass}`}
                    title={
                      isFuture
                        ? ""
                        : `${format(day.date, "d. M.", { locale: cs })} – ${
                            status === "perfect"
                              ? "perfektní"
                              : status === "ok"
                                ? "OK"
                                : "bez aktivity"
                          }${day.data?.xp ? ` (${day.data.xp} XP)` : ""}`
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend and stats */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>Méně</span>
            <div className="w-[10px] h-[10px] rounded-[2px] bg-muted/60" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-green-300 dark:bg-green-800" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-green-500 dark:bg-green-600" />
            <span>Více</span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            {activeDays} aktivních dní · {perfectDays} perfektních
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
