import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth";
import { format, subDays, startOfWeek } from "date-fns";
import { cs } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Moon, AlertTriangle, Clock, Smile, Zap, TrendingUp, ArrowUp, ArrowDown, Minus, BarChart3, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { SleepLog, DailyCheckin } from "@/types/database";

export default async function WellbeingPage() {
  const user = await getAuthUser();
  const supabase = await createClient();

  const today = new Date();
  const twoWeeksAgo = format(subDays(today, 14), "yyyy-MM-dd");

  // Fetch sleep logs AND checkin data for mood/energy trends
  const [sleepRes, checkinRes] = await Promise.all([
    supabase
      .from("sleep_logs")
      .select("*")
      .eq("profile_id", user.id)
      .gte("date", twoWeeksAgo)
      .order("date", { ascending: true }),
    supabase
      .from("daily_checkins")
      .select("*")
      .eq("profile_id", user.id)
      .gte("date", twoWeeksAgo)
      .order("date", { ascending: true }),
  ]);

  const logs = (sleepRes.data as SleepLog[] | null) ?? [];
  const checkins = (checkinRes.data as DailyCheckin[] | null) ?? [];

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

  // ---- W1: Mood & Energy trend data ----
  const checkinsWithMood = checkins.filter((c) => c.mood_1_10 != null);
  const checkinsWithEnergy = checkins.filter((c) => c.energy_1_10 != null);
  const maxMood = 10;
  const maxEnergy = 10;

  // ---- W3: Weekly wellbeing summary ----
  const thisWeekStart = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const lastWeekStart = format(subDays(startOfWeek(today, { weekStartsOn: 1 }), 7), "yyyy-MM-dd");
  const lastWeekEnd = format(subDays(startOfWeek(today, { weekStartsOn: 1 }), 1), "yyyy-MM-dd");

  const thisWeekCheckins = checkins.filter((c) => c.date >= thisWeekStart);
  const lastWeekCheckins = checkins.filter((c) => c.date >= lastWeekStart && c.date <= lastWeekEnd);
  const thisWeekSleep = logs.filter((l) => l.date >= thisWeekStart);
  const lastWeekSleep = logs.filter((l) => l.date >= lastWeekStart && l.date <= lastWeekEnd);

  const avgNum = (arr: (number | null | undefined)[]): number | null => {
    const valid = arr.filter((v): v is number => v != null);
    return valid.length > 0 ? Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10 : null;
  };

  const thisWeekAvgMood = avgNum(thisWeekCheckins.map((c) => c.mood_1_10));
  const thisWeekAvgEnergy = avgNum(thisWeekCheckins.map((c) => c.energy_1_10));
  const thisWeekAvgSleep = avgNum(thisWeekSleep.map((l) => l.sleep_hours));
  const thisWeekAvgStress = avgNum(thisWeekCheckins.map((c) => c.stress_1_10));

  const lastWeekAvgMood = avgNum(lastWeekCheckins.map((c) => c.mood_1_10));
  const lastWeekAvgEnergy = avgNum(lastWeekCheckins.map((c) => c.energy_1_10));
  const lastWeekAvgSleep = avgNum(lastWeekSleep.map((l) => l.sleep_hours));
  const lastWeekAvgStress = avgNum(lastWeekCheckins.map((c) => c.stress_1_10));

  const getTrend = (current: number | null, previous: number | null): "up" | "down" | "same" | null => {
    if (current == null || previous == null) return null;
    const diff = current - previous;
    if (Math.abs(diff) < 0.3) return "same";
    return diff > 0 ? "up" : "down";
  };

  // Wellbeing score (weighted: mood 30%, energy 25%, sleep 25%, inverted stress 20%)
  const wellbeingScore = (() => {
    const parts: number[] = [];
    if (thisWeekAvgMood != null) parts.push((thisWeekAvgMood / 10) * 30);
    if (thisWeekAvgEnergy != null) parts.push((thisWeekAvgEnergy / 10) * 25);
    if (thisWeekAvgSleep != null) parts.push((Math.min(thisWeekAvgSleep, 9) / 9) * 25);
    if (thisWeekAvgStress != null) parts.push(((10 - thisWeekAvgStress) / 10) * 20);
    if (parts.length === 0) return null;
    const maxPossible = (thisWeekAvgMood != null ? 30 : 0) + (thisWeekAvgEnergy != null ? 25 : 0) + (thisWeekAvgSleep != null ? 25 : 0) + (thisWeekAvgStress != null ? 20 : 0);
    return maxPossible > 0 ? Math.round((parts.reduce((a, b) => a + b, 0) / maxPossible) * 100) : null;
  })();

  // ---- W2: Correlation insights ----
  const correlationInsights: { text: string; color: string }[] = [];

  // Sleep → Energy correlation
  const highSleepEnergies = checkins
    .filter((c) => {
      const sl = logs.find((l) => l.date === c.date);
      return sl?.sleep_hours != null && sl.sleep_hours >= 7 && c.energy_1_10 != null;
    })
    .map((c) => c.energy_1_10!);
  const lowSleepEnergies = checkins
    .filter((c) => {
      const sl = logs.find((l) => l.date === c.date);
      return sl?.sleep_hours != null && sl.sleep_hours < 6 && c.energy_1_10 != null;
    })
    .map((c) => c.energy_1_10!);

  if (highSleepEnergies.length >= 2 && lowSleepEnergies.length >= 2) {
    const highAvg = Math.round((highSleepEnergies.reduce((a, b) => a + b, 0) / highSleepEnergies.length) * 10) / 10;
    const lowAvg = Math.round((lowSleepEnergies.reduce((a, b) => a + b, 0) / lowSleepEnergies.length) * 10) / 10;
    const diff = highAvg - lowAvg;
    if (diff > 1) {
      correlationInsights.push({
        text: `Spánek → Energie: Silná korelace. Více spánku = více energie (${lowAvg} → ${highAvg}).`,
        color: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
      });
    } else if (diff > 0.3) {
      correlationInsights.push({
        text: `Spánek → Energie: Mírná korelace. Lepší spánek mírně zvyšuje energii (${lowAvg} → ${highAvg}).`,
        color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
      });
    }
  }

  // Stress → Mood correlation
  const highStressMoods = checkins
    .filter((c) => c.stress_1_10 != null && c.stress_1_10 >= 7 && c.mood_1_10 != null)
    .map((c) => c.mood_1_10!);
  const lowStressMoods = checkins
    .filter((c) => c.stress_1_10 != null && c.stress_1_10 <= 3 && c.mood_1_10 != null)
    .map((c) => c.mood_1_10!);

  if (highStressMoods.length >= 2 && lowStressMoods.length >= 2) {
    const highStressAvg = Math.round((highStressMoods.reduce((a, b) => a + b, 0) / highStressMoods.length) * 10) / 10;
    const lowStressAvg = Math.round((lowStressMoods.reduce((a, b) => a + b, 0) / lowStressMoods.length) * 10) / 10;
    const diff = lowStressAvg - highStressAvg;
    if (diff > 0.5) {
      correlationInsights.push({
        text: `Stres → Nálada: Inverzní. Vysoký stres snižuje náladu (${lowStressAvg} → ${highStressAvg}).`,
        color: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
      });
    }
  }

  // TrendArrow component helper
  function TrendArrow({ trend, inverted = false }: { trend: "up" | "down" | "same" | null; inverted?: boolean }) {
    if (trend == null) return <span className="text-xs text-muted-foreground">–</span>;
    if (trend === "same") return <Minus size={12} className="text-muted-foreground" />;
    // For stress, "down" is good (inverted)
    const isGood = inverted ? trend === "down" : trend === "up";
    if (trend === "up") return <ArrowUp size={12} className={isGood ? "text-green-500" : "text-red-500"} />;
    return <ArrowDown size={12} className={isGood ? "text-green-500" : "text-red-500"} />;
  }

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

      {/* W3: Weekly wellbeing summary */}
      {(thisWeekAvgMood != null || thisWeekAvgEnergy != null || thisWeekAvgSleep != null) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 size={18} />
              Tento týden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="space-y-0.5">
                <div className="flex items-center justify-center gap-1">
                  <Smile size={14} className="text-amber-500" />
                  <TrendArrow trend={getTrend(thisWeekAvgMood, lastWeekAvgMood)} />
                </div>
                <p className="text-lg font-bold tabular-nums">
                  {thisWeekAvgMood ?? "–"}
                </p>
                <p className="text-[10px] text-muted-foreground">Nálada</p>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-center gap-1">
                  <Zap size={14} className="text-green-500" />
                  <TrendArrow trend={getTrend(thisWeekAvgEnergy, lastWeekAvgEnergy)} />
                </div>
                <p className="text-lg font-bold tabular-nums">
                  {thisWeekAvgEnergy ?? "–"}
                </p>
                <p className="text-[10px] text-muted-foreground">Energie</p>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-center gap-1">
                  <Moon size={14} className="text-indigo-400" />
                  <TrendArrow trend={getTrend(thisWeekAvgSleep, lastWeekAvgSleep)} />
                </div>
                <p className="text-lg font-bold tabular-nums">
                  {thisWeekAvgSleep != null ? `${thisWeekAvgSleep}h` : "–"}
                </p>
                <p className="text-[10px] text-muted-foreground">Spánek</p>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-center gap-1">
                  <Brain size={14} className="text-red-400" />
                  <TrendArrow trend={getTrend(thisWeekAvgStress, lastWeekAvgStress)} inverted />
                </div>
                <p className="text-lg font-bold tabular-nums">
                  {thisWeekAvgStress ?? "–"}
                </p>
                <p className="text-[10px] text-muted-foreground">Stres</p>
              </div>
            </div>
            {wellbeingScore != null && (
              <div className="mt-3 pt-3 border-t text-center">
                <p className="text-xs text-muted-foreground mb-1">Celkové skóre</p>
                <p className="text-2xl font-bold tabular-nums">
                  {wellbeingScore}
                  <span className="text-sm font-normal text-muted-foreground">/100</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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

      {/* W1: Mood trend - CSS bar chart */}
      {checkinsWithMood.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile size={18} className="text-amber-500" />
              Nálada: posledních 14 dní
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-end gap-1 h-40">
                {Array.from({ length: 14 }, (_, i) => {
                  const date = format(subDays(today, 13 - i), "yyyy-MM-dd");
                  const checkin = checkins.find((c) => c.date === date);
                  const mood = checkin?.mood_1_10 ?? 0;
                  const heightPercent = maxMood > 0 ? (mood / maxMood) * 100 : 0;
                  const isLow = mood > 0 && mood < 4;
                  const isHigh = mood >= 7;

                  return (
                    <div
                      key={date}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <span className="text-[9px] tabular-nums text-muted-foreground">
                        {mood > 0 ? mood : ""}
                      </span>
                      <div className="w-full flex items-end" style={{ height: "120px" }}>
                        <div
                          className={`w-full rounded-t-sm transition-all ${
                            mood === 0
                              ? "bg-muted"
                              : isLow
                                ? "bg-red-400 dark:bg-red-600"
                                : isHigh
                                  ? "bg-amber-400 dark:bg-amber-500"
                                  : "bg-amber-300 dark:bg-amber-700"
                          }`}
                          style={{
                            height: mood === 0 ? "2px" : `${heightPercent}%`,
                            minHeight: mood > 0 ? "4px" : "2px",
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
              <div className="flex gap-4 justify-center mt-3 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>7+</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-300" />
                  <span>4–6</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span>&lt;4</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* W1: Energy trend - CSS bar chart */}
      {checkinsWithEnergy.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap size={18} className="text-green-500" />
              Energie: posledních 14 dní
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-end gap-1 h-40">
                {Array.from({ length: 14 }, (_, i) => {
                  const date = format(subDays(today, 13 - i), "yyyy-MM-dd");
                  const checkin = checkins.find((c) => c.date === date);
                  const energy = checkin?.energy_1_10 ?? 0;
                  const heightPercent = maxEnergy > 0 ? (energy / maxEnergy) * 100 : 0;
                  const isLow = energy > 0 && energy < 4;
                  const isHigh = energy >= 7;

                  return (
                    <div
                      key={date}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <span className="text-[9px] tabular-nums text-muted-foreground">
                        {energy > 0 ? energy : ""}
                      </span>
                      <div className="w-full flex items-end" style={{ height: "120px" }}>
                        <div
                          className={`w-full rounded-t-sm transition-all ${
                            energy === 0
                              ? "bg-muted"
                              : isLow
                                ? "bg-red-400 dark:bg-red-600"
                                : isHigh
                                  ? "bg-emerald-400 dark:bg-emerald-500"
                                  : "bg-emerald-300 dark:bg-emerald-700"
                          }`}
                          style={{
                            height: energy === 0 ? "2px" : `${heightPercent}%`,
                            minHeight: energy > 0 ? "4px" : "2px",
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
              <div className="flex gap-4 justify-center mt-3 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>7+</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-300" />
                  <span>4–6</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span>&lt;4</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* W2: Correlation insights */}
      {correlationInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp size={18} />
              Korelace a vzorce
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {correlationInsights.map((insight, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 text-sm ${insight.color}`}
              >
                {insight.text}
              </div>
            ))}
            {correlationInsights.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Potřebujeme více dat pro analýzu korelací.
              </p>
            )}
          </CardContent>
        </Card>
      )}

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
