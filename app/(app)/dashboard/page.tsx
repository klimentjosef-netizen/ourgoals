import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardData } from "./actions";
import { LevelCard } from "@/components/domain/dashboard/level-card";
import { StreakCard } from "@/components/domain/dashboard/streak-card";
import { CoachMessage } from "@/components/domain/dashboard/coach-message";
import { TodayChecklist } from "@/components/domain/dashboard/today-checklist";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const data = await getDashboardData(user.id);

  const morningDone = data.checkin?.morning_ritual_done ?? false;
  const eveningDone = data.checkin?.evening_ritual_done ?? false;

  // Determine which modules are active
  const hasGoals = data.activeModules.includes("goals_habits");
  const hasSleepWellbeing = data.activeModules.includes("sleep_wellbeing");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Coach message */}
      <CoachMessage
        tone={data.coachTone}
        streak={data.gamification?.current_streak ?? 0}
        morningDone={morningDone}
        eveningDone={eveningDone}
        displayName={data.displayName}
      />

      {/* Level + Streak row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <LevelCard totalXP={data.gamification?.total_xp ?? 0} />
        <StreakCard
          currentStreak={data.gamification?.current_streak ?? 0}
          longestStreak={data.gamification?.longest_streak ?? 0}
        />
      </div>

      {/* Today's checklist */}
      {hasSleepWellbeing || data.habits.length > 0 ? (
        <TodayChecklist
          morningDone={morningDone}
          eveningDone={eveningDone}
          habits={data.habits}
          completions={data.completions}
          profileId={user.id}
        />
      ) : null}

      {/* Active goals */}
      {hasGoals && data.goals.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target size={16} />
                Aktivní cíle
              </CardTitle>
              <Link
                href="/goals"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Všechny
                <ArrowRight size={12} />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.goals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{goal.title}</p>
                  {goal.target_date && (
                    <p className="text-xs text-muted-foreground">
                      Do: {goal.target_date}
                    </p>
                  )}
                </div>
                {goal.current_value != null && goal.target_value != null && (
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    {Math.round(
                      (goal.current_value / goal.target_value) * 100
                    )}
                    %
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick links when no modules active */}
      {!hasGoals && !hasSleepWellbeing && data.habits.length === 0 && (
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-muted-foreground text-sm mb-3">
              Zatím nemáš aktivní moduly. Nastav si je v nastavení.
            </p>
            <Link
              href="/settings"
              className="text-primary text-sm hover:underline"
            >
              Přejít do nastavení
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
