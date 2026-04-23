import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Progress,
} from "@/components/ui/progress";
import { GoalActions } from "@/app/(app)/goals/[id]/goal-actions";
import type { Goal, DailyHabit } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_LABELS: Record<Goal["status"], string> = {
  active: "Aktivní",
  completed: "Dokončeno",
  paused: "Pozastaveno",
  abandoned: "Opuštěno",
};

function getProgressPercentage(goal: Goal): number {
  if (
    goal.start_value == null ||
    goal.target_value == null ||
    goal.current_value == null
  ) {
    return goal.status === "completed" ? 100 : 0;
  }

  const range = goal.target_value - goal.start_value;
  if (range === 0) return goal.status === "completed" ? 100 : 0;

  const progress = ((goal.current_value - goal.start_value) / range) * 100;
  return Math.max(0, Math.min(100, progress));
}

export default async function GoalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: goal, error } = await supabase
    .from("goals")
    .select("*")
    .eq("id", id)
    .eq("profile_id", user.id)
    .single();

  if (error || !goal) {
    notFound();
  }

  const typedGoal = goal as Goal;
  const percentage = getProgressPercentage(typedGoal);

  // Fetch related habits
  const { data: habits } = await supabase
    .from("daily_habits")
    .select("*")
    .eq("goal_id", id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const typedHabits = (habits ?? []) as DailyHabit[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/goals"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold">{typedGoal.title}</h1>
        </div>
        <Link href={`/goals/${id}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil size={14} />
            Upravit
          </Button>
        </Link>
      </div>

      {/* Main card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant={typedGoal.status === "active" ? "default" : "secondary"}>
            {STATUS_LABELS[typedGoal.status]}
          </Badge>
          {typedGoal.target_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays size={12} />
              <span className="font-mono">
                {new Date(typedGoal.target_date).toLocaleDateString("cs-CZ")}
              </span>
            </div>
          )}
        </div>

        {typedGoal.description && (
          <p className="text-sm text-muted-foreground">
            {typedGoal.description}
          </p>
        )}

        {/* Progress */}
        {typedGoal.target_value != null && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-muted-foreground mb-1">
                <span>Pokrok</span>
                <span>{percentage.toFixed(0)}%</span>
              </div>
              <Progress value={percentage} />
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span>Start: {typedGoal.start_value ?? 0}</span>
                <span className="font-bold text-foreground">
                  Nyní: {typedGoal.current_value ?? 0}
                </span>
                <span>Cíl: {typedGoal.target_value}</span>
              </div>
              {typedGoal.metric && (
                <p className="text-xs text-muted-foreground text-center font-mono">
                  Metrika: {typedGoal.metric}
                </p>
              )}
            </div>
          </>
        )}
      </Card>

      {/* Related habits */}
      {typedHabits.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Propojené návyky
          </h2>
          <div className="space-y-2">
            {typedHabits.map((habit) => (
              <Card key={habit.id} className="p-3 flex items-center justify-between">
                <span className="text-sm">{habit.title}</span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  +{habit.xp_value} XP
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {typedGoal.status === "active" && (
        <>
          <Separator />
          <GoalActions goalId={id} />
        </>
      )}
    </div>
  );
}
