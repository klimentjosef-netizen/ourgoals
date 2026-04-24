import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth";
import { Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GoalCard } from "@/components/domain/goals/goal-card";
import { HabitChecklist } from "@/components/domain/goals/habit-checklist";
import type { Goal, DailyHabit, HabitCompletion } from "@/types/database";

export default async function GoalsPage() {
  const user = await getAuthUser();
  const supabase = await createClient();

  // Fetch goals (exclude abandoned)
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("profile_id", user.id)
    .neq("status", "abandoned")
    .order("created_at", { ascending: false });

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

      {/* Habit checklist */}
      {typedHabits.length > 0 && (
        <>
          <HabitChecklist
            habits={typedHabits}
            completions={typedCompletions}
            date={today}
          />
          <Separator />
        </>
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
                Definuj co chceš dosáhnout a sleduj svůj pokrok. Za vytvoření cíle dostaneš 25 XP.
              </p>
            </div>
            <Link href="/goals/new">
              <Button>Vytvořit cíl &rarr;</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
