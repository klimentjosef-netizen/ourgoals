"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { History } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale/cs";
import {
  getCheckinHistory,
} from "@/app/(app)/checkin/history-actions";

function getMoodEmoji(mood: number | null): string {
  if (mood == null) return "–";
  if (mood >= 8) return "😄";
  if (mood >= 6) return "🙂";
  if (mood >= 4) return "😐";
  return "😞";
}

interface CheckinHistoryEntry {
  date: string;
  mood: number | null;
  energy: number | null;
  sleepHours: number | null;
  dayRating: number | null;
  stress: number | null;
}

interface CheckinHistoryProps {
  userId: string;
}

export function CheckinHistory({ userId }: CheckinHistoryProps) {
  const [entries, setEntries] = useState<CheckinHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCheckinHistory(userId, 7)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History size={18} />
            Historie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="min-w-[100px] h-24 rounded-lg bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History size={18} />
            Historie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Zatím žádné záznamy. Pokračuj v check-inech!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History size={18} />
          Historie – posledních 7 dní
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {entries.map((entry) => (
            <div
              key={entry.date}
              className="min-w-[105px] flex-shrink-0 rounded-lg border bg-card p-2.5 space-y-1.5"
            >
              <p className="text-[10px] font-medium text-muted-foreground">
                {format(new Date(entry.date + "T00:00:00"), "EEEE", {
                  locale: cs,
                })}
              </p>
              <p className="text-xs tabular-nums">
                {format(new Date(entry.date + "T00:00:00"), "d. M.", {
                  locale: cs,
                })}
              </p>
              <div className="text-xl text-center">
                {getMoodEmoji(entry.mood)}
              </div>
              <div className="space-y-0.5 text-[10px]">
                {entry.energy != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Energie</span>
                    <span className="font-medium">{entry.energy}/10</span>
                  </div>
                )}
                {entry.sleepHours != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spánek</span>
                    <span className="font-medium">{entry.sleepHours}h</span>
                  </div>
                )}
                {entry.dayRating != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Den</span>
                    <span className="font-medium">{entry.dayRating}/10</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
