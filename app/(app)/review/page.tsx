import { getAuthUser } from "@/lib/auth";
import { getWeeklyReviewData } from "./actions";
import { WeeklyReviewForm } from "@/components/domain/review/weekly-review-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, Smile, Zap, Moon, Brain, Dumbbell, Clock, Target, Flame, Trophy } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

export default async function ReviewPage() {
  const user = await getAuthUser();
  const data = await getWeeklyReviewData(user.id);

  const weekLabel = `${format(new Date(data.weekStart + "T00:00:00"), "d. MMMM", { locale: cs })} – ${format(new Date(data.weekEnd + "T00:00:00"), "d. MMMM", { locale: cs })}`;

  const habitAdherence = data.habitsTotal > 0
    ? Math.round((data.habitsCompleted / data.habitsTotal) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Týdenní review</h1>
          <p className="text-sm text-muted-foreground">{weekLabel}</p>
        </div>
        {data.isCompleted && (
          <Badge variant="default" className="ml-auto">Hotovo</Badge>
        )}
      </div>

      {/* Auto-generated stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" />
            Shrnutí týdne
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {data.avgMood != null && (
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Smile size={14} className="text-amber-500" />
                </div>
                <p className="text-2xl font-bold tabular-nums">{data.avgMood}</p>
                <p className="text-[10px] text-muted-foreground">Nálada</p>
              </div>
            )}
            {data.avgEnergy != null && (
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Zap size={14} className="text-green-500" />
                </div>
                <p className="text-2xl font-bold tabular-nums">{data.avgEnergy}</p>
                <p className="text-[10px] text-muted-foreground">Energie</p>
              </div>
            )}
            {data.avgSleepHours != null && (
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Moon size={14} className="text-indigo-400" />
                </div>
                <p className="text-2xl font-bold tabular-nums">{data.avgSleepHours}h</p>
                <p className="text-[10px] text-muted-foreground">Spánek</p>
              </div>
            )}
            {data.avgStress != null && (
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Brain size={14} className="text-red-400" />
                </div>
                <p className="text-2xl font-bold tabular-nums">{data.avgStress}</p>
                <p className="text-[10px] text-muted-foreground">Stres</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <Dumbbell size={16} className="mx-auto text-primary mb-1" />
            <p className="text-xl font-bold tabular-nums">{data.trainingSessions}</p>
            <p className="text-[10px] text-muted-foreground">Tréninky</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <Clock size={16} className="mx-auto text-blue-500 mb-1" />
            <p className="text-xl font-bold tabular-nums">
              {Math.round(data.deepWorkMinutes / 60 * 10) / 10}h
            </p>
            <p className="text-[10px] text-muted-foreground">Deep work</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <Target size={16} className="mx-auto text-emerald-500 mb-1" />
            <p className="text-xl font-bold tabular-nums">{habitAdherence}%</p>
            <p className="text-[10px] text-muted-foreground">Návyky</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <Trophy size={16} className="mx-auto text-amber-500 mb-1" />
            <p className="text-xl font-bold tabular-nums">{data.xpEarned}</p>
            <p className="text-[10px] text-muted-foreground">XP získáno</p>
          </CardContent>
        </Card>
      </div>

      {/* Streak */}
      {data.streakAtEnd > 0 && (
        <div className="flex items-center justify-center gap-2 py-2">
          <Flame size={20} className="text-orange-500" />
          <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
            Streak: {data.streakAtEnd} dní v řadě
          </span>
        </div>
      )}

      {/* User reflection form */}
      <WeeklyReviewForm
        weekStart={data.weekStart}
        initialWins={data.wins}
        initialStruggles={data.struggles}
        initialNextWeekFocus={data.nextWeekFocus}
        isCompleted={data.isCompleted}
      />
    </div>
  );
}
