"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { getYesterdayCheckin } from "@/app/(app)/checkin/history-actions";

interface CheckinHistoryEntry {
  date: string;
  mood: number | null;
  energy: number | null;
  sleepHours: number | null;
  dayRating: number | null;
  stress: number | null;
}

interface YesterdayComparisonProps {
  userId: string;
  variant: "morning" | "evening";
}

export function YesterdayComparison({ userId, variant }: YesterdayComparisonProps) {
  const [data, setData] = useState<CheckinHistoryEntry | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getYesterdayCheckin(userId)
      .then(setData)
      .finally(() => setLoaded(true));
  }, [userId]);

  if (!loaded || !data) return null;

  const parts: string[] = [];

  if (data.mood != null) parts.push(`nálada ${data.mood}`);
  if (data.energy != null) parts.push(`energie ${data.energy}`);
  if (data.sleepHours != null) parts.push(`spánek ${data.sleepHours}h`);
  if (variant === "evening") {
    if (data.dayRating != null) parts.push(`den ${data.dayRating}/10`);
    if (data.stress != null) parts.push(`stres ${data.stress}`);
  }

  if (parts.length === 0) return null;

  return (
    <div className="rounded-lg bg-muted/50 border p-3 flex items-start gap-2.5">
      <ArrowLeftRight size={14} className="text-muted-foreground shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-0.5">Včera</p>
        <p className="text-sm">{parts.join(" · ")}</p>
      </div>
    </div>
  );
}
