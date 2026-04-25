"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Moon,
  Zap,
  Smile,
  Flame,
  Star,
  Battery,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import type {
  DailyCheckin,
  SleepLog,
  GamificationProfile,
} from "@/types/database";
import { XP_VALUES } from "@/types/gamification";

interface CheckinSummaryProps {
  checkin: DailyCheckin;
  sleepLog: SleepLog | null;
  gamification: GamificationProfile | null;
}

function getDayStatus(checkin: DailyCheckin): {
  label: string;
  color: string;
  bg: string;
} {
  const hasMorning = checkin.mood_1_10 != null;
  const hasEvening = checkin.day_rating_1_10 != null;

  if (hasMorning && hasEvening) {
    return {
      label: "Perfektní den!",
      color: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    };
  }
  if (hasMorning || hasEvening) {
    return {
      label: "Dobrý den",
      color: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    };
  }
  return {
    label: "Zmeškáno",
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800",
  };
}

export function CheckinSummary({
  checkin,
  sleepLog,
  gamification,
}: CheckinSummaryProps) {
  const status = getDayStatus(checkin);

  return (
    <div className="space-y-5">
      {/* ---- Status badge ---- */}
      <div
        className={`rounded-xl border p-4 flex items-center gap-3 ${status.bg}`}
      >
        <CheckCircle2 size={28} className={status.color} />
        <div>
          <p className={`text-lg font-bold ${status.color}`}>{status.label}</p>
          <p className="text-sm text-muted-foreground">
            Dnešní check-in hotový
          </p>
        </div>
      </div>

      {/* ---- XP breakdown ---- */}
      {gamification && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap size={18} className="text-yellow-500" />
              XP dnešního dne
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5 text-sm">
              {checkin.mood_1_10 != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Ranní check-in
                  </span>
                  <span className="font-medium">+{XP_VALUES.MORNING_CHECKIN} XP</span>
                </div>
              )}
              {checkin.day_rating_1_10 != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Večerní check-in
                  </span>
                  <span className="font-medium">+{XP_VALUES.EVENING_CHECKIN} XP</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Celkem XP</span>
                <span>{gamification.total_xp} XP</span>
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-2 pt-1">
              <Flame
                size={22}
                className={`text-orange-500 ${
                  gamification.current_streak > 0 ? "animate-pulse" : ""
                }`}
              />
              <span className="text-lg font-bold tabular-nums">
                {gamification.current_streak}
              </span>
              <span className="text-sm text-muted-foreground">
                dní v řadě
              </span>
              <div className="ml-auto">
                <Badge variant="secondary">
                  Lv.&nbsp;{gamification.level} &mdash; {gamification.title}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---- Dnešní statistiky ---- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dnešní statistiky</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <StatTile
              icon={<Smile size={18} className="text-amber-500" />}
              value={checkin.mood_1_10}
              label="Nálada"
              max={10}
            />
            <StatTile
              icon={<Battery size={18} className="text-green-500" />}
              value={checkin.energy_1_10}
              label="Energie"
              max={10}
            />
            <StatTile
              icon={<Moon size={18} className="text-indigo-400" />}
              value={
                sleepLog?.sleep_hours != null
                  ? Number(sleepLog.sleep_hours.toFixed(1))
                  : null
              }
              label="Spánek"
              suffix="h"
            />
            <StatTile
              icon={<Star size={18} className="text-yellow-500" />}
              value={checkin.day_rating_1_10}
              label="Hodnocení"
              max={10}
            />
          </div>

          {checkin.stress_1_10 != null && checkin.stress_1_10 >= 7 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertTriangle size={14} />
              <span>
                Vysoký stres ({checkin.stress_1_10}/10) &mdash; zkus
                odpočinek
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Reflexe ---- */}
      {(checkin.best_thing || checkin.worst_thing) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star size={18} className="text-purple-500" />
              Reflexe dne
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checkin.best_thing && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Nejlepší moment
                </p>
                <p className="text-sm">{checkin.best_thing}</p>
              </div>
            )}
            {checkin.worst_thing && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Nejhorší moment
                  </p>
                  <p className="text-sm">{checkin.worst_thing}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ---- Link na wellbeing ---- */}
      <Link href="/wellbeing">
        <Button variant="outline" className="w-full">
          Wellbeing trendy
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </Link>
    </div>
  );
}

/* ---- Stat tile helper ---- */
function StatTile({
  icon,
  value,
  label,
  max,
  suffix,
}: {
  icon: React.ReactNode;
  value: number | null | undefined;
  label: string;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      {icon}
      <p className="text-2xl font-bold tabular-nums">
        {value != null ? value : "—"}
        {value != null && suffix && (
          <span className="text-sm font-normal text-muted-foreground">
            {suffix}
          </span>
        )}
      </p>
      <p className="text-xs text-muted-foreground">
        {label}
        {max != null && <span>/{max}</span>}
      </p>
    </div>
  );
}
