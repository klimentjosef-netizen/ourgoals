import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth";
import { format, subDays } from "date-fns";
import { cs } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Moon, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { SleepLog } from "@/types/database";

export default async function WellbeingPage() {
  const user = await getAuthUser();
  const supabase = await createClient();

  const today = new Date();
  const twoWeeksAgo = format(subDays(today, 14), "yyyy-MM-dd");

  const { data: sleepLogs } = await supabase
    .from("sleep_logs")
    .select("*")
    .eq("profile_id", user.id)
    .gte("date", twoWeeksAgo)
    .order("date", { ascending: true });

  const logs = (sleepLogs as SleepLog[] | null) ?? [];

  // Calculate stats
  const logsWithHours = logs.filter((l) => l.sleep_hours != null);
  const avgSleepHours =
    logsWithHours.length > 0
      ? logsWithHours.reduce((sum, l) => sum + (l.sleep_hours ?? 0), 0) /
        logsWithHours.length
      : null;

  const avgQuality =
    logsWithHours.length > 0
      ? logsWithHours.reduce((sum, l) => sum + (l.quality_1_10 ?? 0), 0) /
        logsWithHours.filter((l) => l.quality_1_10 != null).length
      : null;

  // Check consecutive <6h days
  let consecutiveLowSleep = 0;
  let hasLowSleepAlert = false;
  for (let i = logs.length - 1; i >= 0; i--) {
    if (logs[i].sleep_hours != null && logs[i].sleep_hours! < 6) {
      consecutiveLowSleep++;
    } else {
      break;
    }
  }
  hasLowSleepAlert = consecutiveLowSleep >= 3;

  // Max sleep hours for bar scaling
  const maxHours = Math.max(
    ...logsWithHours.map((l) => l.sleep_hours ?? 0),
    9
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Wellbeing</h1>
        <Link
          href="/checkin"
          className="text-sm text-primary hover:underline"
        >
          Zadat check-in
        </Link>
      </div>

      {hasLowSleepAlert && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 flex gap-3">
          <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">
              Spánkový deficit!
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              Posledních {consecutiveLowSleep} dní jsi spal méně než 6 hodin.
              Zvyš prioritu spánku.
            </p>
          </div>
        </div>
      )}

      {/* Stats overview */}
      <div className="grid grid-cols-3 gap-3">
        <Card size="sm">
          <CardContent className="text-center pt-2">
            <p className="text-2xl font-bold">
              {avgSleepHours != null ? avgSleepHours.toFixed(1) : "–"}
            </p>
            <p className="text-[10px] text-muted-foreground">Prům. hodin</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="text-center pt-2">
            <p className="text-2xl font-bold">
              {avgQuality != null ? avgQuality.toFixed(1) : "–"}
            </p>
            <p className="text-[10px] text-muted-foreground">Prům. kvalita</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="text-center pt-2">
            <p className="text-2xl font-bold">{logsWithHours.length}</p>
            <p className="text-[10px] text-muted-foreground">Záznamů</p>
          </CardContent>
        </Card>
      </div>

      {/* Sleep trend - CSS bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon size={18} />
            Spánek: posledních 14 dní
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                <Moon size={32} className="text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Začni sledovat svůj spánek</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Sleduj kvalitu spánku a najdi vzorce. Lepší spánek = lepší výkon.
                </p>
              </div>
              <Link href="/checkin">
                <Button>Udělat ranní check-in &rarr;</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Bar chart */}
              <div className="flex items-end gap-1 h-40">
                {Array.from({ length: 14 }, (_, i) => {
                  const date = format(subDays(today, 13 - i), "yyyy-MM-dd");
                  const log = logs.find((l) => l.date === date);
                  const hours = log?.sleep_hours ?? 0;
                  const heightPercent =
                    maxHours > 0 ? (hours / maxHours) * 100 : 0;
                  const isLow = hours > 0 && hours < 6;
                  const isGood = hours >= 7;

                  return (
                    <div
                      key={date}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <span className="text-[9px] tabular-nums text-muted-foreground">
                        {hours > 0 ? hours.toFixed(1) : ""}
                      </span>
                      <div className="w-full flex items-end" style={{ height: "120px" }}>
                        <div
                          className={`w-full rounded-t-sm transition-all ${
                            hours === 0
                              ? "bg-muted"
                              : isLow
                                ? "bg-red-400 dark:bg-red-600"
                                : isGood
                                  ? "bg-green-400 dark:bg-green-600"
                                  : "bg-yellow-400 dark:bg-yellow-600"
                          }`}
                          style={{
                            height: hours === 0 ? "2px" : `${heightPercent}%`,
                            minHeight: hours > 0 ? "4px" : "2px",
                          }}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground tabular-nums">
                        {format(subDays(today, 13 - i), "d.M.", { locale: cs })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex gap-4 justify-center mt-3 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span>7+ h</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span>6–7 h</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span>&lt;6 h</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent sleep logs list */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Poslední záznamy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...logs].reverse().slice(0, 7).map((log) => (
              <div key={log.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {format(new Date(log.date + "T00:00:00"), "EEEE d. MMMM", {
                      locale: cs,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {log.bedtime && log.wake_time
                      ? `${log.bedtime} → ${log.wake_time}`
                      : "Časy nezadány"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {log.sleep_hours != null && (
                    <Badge
                      variant={
                        log.sleep_hours >= 7
                          ? "default"
                          : log.sleep_hours >= 6
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {log.sleep_hours.toFixed(1)}h
                    </Badge>
                  )}
                  {log.quality_1_10 != null && (
                    <span className="text-xs text-muted-foreground">
                      Q: {log.quality_1_10}/10
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
