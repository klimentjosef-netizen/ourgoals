"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Moon, Zap, Smile, Flame, Star } from "lucide-react";
import type { DailyCheckin, SleepLog, GamificationProfile } from "@/types/database";

interface CheckinSummaryProps {
  checkin: DailyCheckin;
  sleepLog: SleepLog | null;
  gamification: GamificationProfile | null;
}

export function CheckinSummary({
  checkin,
  sleepLog,
  gamification,
}: CheckinSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle2 size={24} />
        <h2 className="text-lg font-bold">Dnešní check-in hotový!</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile size={18} />
            Nálada & energie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{checkin.mood_1_10 ?? "—"}</p>
              <p className="text-xs text-muted-foreground">Nálada</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{checkin.energy_1_10 ?? "—"}</p>
              <p className="text-xs text-muted-foreground">Energie</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{checkin.stress_1_10 ?? "—"}</p>
              <p className="text-xs text-muted-foreground">Stres</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {sleepLog && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon size={18} />
              Spánek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">
                  {sleepLog.sleep_hours != null
                    ? `${sleepLog.sleep_hours.toFixed(1)}h`
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Hodin</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {sleepLog.quality_1_10 ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">Kvalita</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {sleepLog.wake_count ?? "—"}×
                </p>
                <p className="text-xs text-muted-foreground">Probuzení</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {checkin.day_rating_1_10 != null && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star size={18} />
              Hodnocení dne
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <p className="text-3xl font-bold">{checkin.day_rating_1_10}/10</p>
            </div>
            <Separator />
            {checkin.best_thing && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Nejlepší moment</p>
                <p className="text-sm">{checkin.best_thing}</p>
              </div>
            )}
            {checkin.worst_thing && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Nejhorší moment</p>
                <p className="text-sm">{checkin.worst_thing}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {gamification && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap size={18} />
              Gamifikace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-2xl font-bold">{gamification.total_xp}</p>
                <p className="text-xs text-muted-foreground">XP celkem</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Flame size={20} className="text-orange-500" />
                  <p className="text-2xl font-bold">
                    {gamification.current_streak}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Streak</p>
              </div>
              <div className="text-center">
                <Badge variant="secondary">Lv. {gamification.level}</Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {gamification.title}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
