import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth";
import { Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GoalCard } from "@/components/domain/goals/goal-card";
import { GoalsFilterBar } from "@/components/domain/goals/goals-filter-bar";
import { HabitChecklist } from "@/components/domain/goals/habit-checklist";
import { AddHabitDialog } from "@/components/domain/goals/add-habit-dialog";
import { getWeeklyHabitStats } from "@/app/(app)/goals/habits/actions";
import type { Goal, DailyHabit, HabitCompletion } from "@/types/database";

interface PageProps {
  searchParams: Promise<{ area?: string; type?: string }>;
}

export default async function GoalsPage({ searchParams }: PageProps) {
  const user = await getAuthUser();
  const supabase = await createClient();
  const params = await searchParams;

  const filterArea = params.area ?? "all";
  const filterType = params.type ?? "all";

  // Fetch goals (exclude abandoned)
  let query = supabase
    .from("goals")
    .select("*")
    .eq("profile_id", user.id)
    .neq("status", "abandoned")
    .order("created_at", { ascending: false });

  if (filterArea !== "all") {
    query = query.eq("area", filterArea);
  }
  if (filterType !== "all") {
    query = query.eq("goal_type", filterType);
  }

  const { data: goals } = await query;

  // Fetch today's habits
  const today = new Date().toISOString().split("T")[0];

  const { data: habits } = await supabase
    .from("daily_habits")
    .select("*")
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const { data: completions } = await supabase
    .from("habit_completions")
    .select("*")
    .eq("profile_id", user.id)
    .eq("date", today);

  const typedGoals = (goals ?? []) as Goal[];
  const typedHabits = (habits ?? []) as DailyHabit[];
  const typedCompletions = (completions ?? []) as HabitCompletion[];

  // Fetch weekly habit stats
  const habitIds = typedHabits.map((h) => h.id);
  const weeklyStats =
    habitIds.length > 0
      ? await getWeeklyHabitStats(user.id, habitIds)
      : { stats: {}, weekStart: today };

  const activeGoals = typedGoals.filter((g) => g.status === "active");
  const otherGoals = typedGoals.filter((g) => g.status !== "active");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={24} className="text-primary" />
          <h1 className="text-xl font-bold">Cíle & návyky</h1>
        </div>
        <Link href="/goals/new">
          <Button size="sm">
            <Plus size={16} />
            Nový cíl
          </Button>
        </Link>
      </div>

      {/* Filter bars */}
      <GoalsFilterBar currentArea={filterArea} currentType={filterType} />

      {/* Habit checklist */}
      {typedHabits.length > 0 ? (
        <>
          <HabitChecklist
            habits={typedHabits}
            completions={typedCompletions}
            date={today}
            weeklyStats={weeklyStats.stats}
            weekStart={weeklyStats.weekStart}
          />
          <div className="flex justify-end">
            <AddHabitDialog goals={activeGoals} />
          </div>
          <Separator />
        </>
      ) : (
        <div className="flex justify-end">
          <AddHabitDialog goals={activeGoals} />
        </div>
      )}

      {/* Active goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Aktivní cíle
          </h2>
          <div className="grid gap-3">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {/* Completed / Paused goals */}
      {otherGoals.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Dokončené & pozastavené
          </h2>
          <div className="grid gap-3">
            {otherGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {typedGoals.length === 0 && typedHabits.length === 0 && (
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
              <Target size={32} className="text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Nastav si první cíl</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Definuj co chceš dosáhnout a sleduj svůj pokrok. Za vytvoření
                cíle dostaneš 25 XP.
              </p>
            </div>
            <Link href="/goals/new">
              <Button>Vytvořit cíl &rarr;</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* No results with active filters */}
      {typedGoals.length === 0 &&
        typedHabits.length > 0 &&
        (filterArea !== "all" || filterType !== "all") && (
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-sm text-muted-foreground">
                Žádné cíle neodpovídají filtru. Zkus jiný filtr nebo{" "}
                <Link
                  href="/goals/new"
                  className="text-primary underline underline-offset-2"
                >
                  vytvořit nový cíl
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
