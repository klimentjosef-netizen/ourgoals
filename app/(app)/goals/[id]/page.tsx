import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Pencil,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { GoalActions } from "@/app/(app)/goals/[id]/goal-actions";
import { getMilestones } from "@/app/(app)/goals/actions";
import { MilestoneSection } from "@/components/domain/goals/milestone-section";
import type { Goal, DailyHabit } from "@/types/database";
import { cn } from "@/lib/utils";
import {
  getGoalTypeConfig,
  getGoalAreaConfig,
  type GoalType,
  type GoalArea,
} from "@/types/goals";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_LABELS: Record<Goal["status"], string> = {
  active: "Aktivní",
  completed: "Dokončeno",
  paused: "Pozastaveno",
  abandoned: "Opuštěno",
};

const AREA_BORDER_COLORS: Record<GoalArea, string> = {
  health: "border-l-green-500",
  work: "border-l-blue-500",
  finance: "border-l-yellow-500",
  growth: "border-l-purple-500",
  relationships: "border-l-pink-500",
  mental: "border-l-cyan-500",
  home: "border-l-orange-500",
  other: "border-l-gray-500",
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

function getChallengeDayNumber(goal: Goal): number {
  if (!goal.challenge_start) return 0;
  const start = new Date(goal.challenge_start);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(1, diff + 1);
}

/** Milestones for measurable goals */
const MILESTONES = [
  { percent: 25, label: "Čtvrtina cesty za tebou!" },
  { percent: 50, label: "Jsi v půlce! Skvělá práce!" },
  { percent: 75, label: "Tři čtvrtiny hotovo!" },
  { percent: 100, label: "Cíl splněn! Gratulace!" },
];

function MilestoneBar({ percentage }: { percentage: number }) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Progress value={percentage} />
        <div className="absolute inset-0 flex items-center pointer-events-none">
          {MILESTONES.map((m) => (
            <div
              key={m.percent}
              className="absolute flex flex-col items-center"
              style={{ left: `${m.percent}%`, transform: "translateX(-50%)" }}
            >
              <div
                className={cn(
                  "w-3 h-3 rounded-full border-2 -mt-1",
                  percentage >= m.percent
                    ? "bg-primary border-primary"
                    : "bg-background border-muted-foreground/30"
                )}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative h-5">
        {MILESTONES.map((m) => (
          <span
            key={m.percent}
            className={cn(
              "absolute text-[9px] font-mono -translate-x-1/2",
              percentage >= m.percent
                ? "text-primary font-semibold"
                : "text-muted-foreground"
            )}
            style={{ left: `${m.percent}%` }}
          >
            {m.percent}%
          </span>
        ))}
      </div>

      {MILESTONES.filter((m) => percentage >= m.percent).length > 0 && (
        <p className="text-xs text-primary font-medium text-center">
          {
            MILESTONES.filter((m) => percentage >= m.percent).slice(-1)[0]
              ?.label
          }
        </p>
      )}
    </div>
  );
}

/** Measurable detail section */
function MeasurableDetail({ goal }: { goal: Goal }) {
  const percentage = getProgressPercentage(goal);

  if (goal.target_value == null) return null;

  return (
    <>
      <Separator />
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-muted-foreground mb-1">
          <span>Pokrok</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
        <MilestoneBar percentage={percentage} />
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>Start: {goal.start_value ?? 0}</span>
          <span className="font-bold text-foreground">
            Nyní: {goal.current_value ?? 0}
          </span>
          <span>Cíl: {goal.target_value}</span>
        </div>
        {goal.metric && (
          <p className="text-xs text-muted-foreground text-center font-mono">
            Metrika: {goal.metric}
          </p>
        )}
      </div>
    </>
  );
}

/** Habit detail section */
function HabitDetail({ goal }: { goal: Goal }) {
  const target = goal.frequency_target ?? 5;
  const current = goal.current_value ?? 0;
  const adherence = target > 0 ? Math.round((current / target) * 100) : 0;

  return (
    <>
      <Separator />
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Tento týden</p>
          <p className="text-3xl font-bold font-mono">
            {current}/{target}
          </p>
        </div>

        {/* Weekly calendar grid */}
        <div className="flex justify-center gap-2">
          {["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground font-mono">
                {day}
              </span>
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium",
                  i < current
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {i < current ? "✓" : "·"}
              </div>
            </div>
          ))}
        </div>

        {/* Adherence */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Plnění tento měsíc</p>
          <p className="text-lg font-bold font-mono">
            {Math.min(adherence, 100)}%
          </p>
        </div>

        {goal.frequency && (
          <p className="text-xs text-muted-foreground text-center">
            Frekvence:{" "}
            {goal.frequency === "daily"
              ? "Každý den"
              : goal.frequency === "weekly"
              ? "1× týdně"
              : goal.frequency.replace("x_week", "× týdně")}
          </p>
        )}
      </div>
    </>
  );
}

/** Oneoff detail section */
function OneoffDetail({ goal }: { goal: Goal }) {
  const isDone = goal.status === "completed";

  return (
    <>
      <Separator />
      <div className="text-center space-y-3 py-4">
        <div
          className={cn(
            "w-16 h-16 rounded-full border-4 mx-auto flex items-center justify-center transition-colors",
            isDone
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/20"
          )}
        >
          {isDone ? (
            <CheckCircle2 size={32} className="text-primary" />
          ) : (
            <span className="text-2xl text-muted-foreground/40">?</span>
          )}
        </div>
        <p className="text-lg font-semibold">
          {isDone ? "Splněno!" : "Čeká na splnění"}
        </p>
        {isDone && goal.updated_at && (
          <p className="text-xs text-muted-foreground font-mono">
            Dokončeno:{" "}
            {new Date(goal.updated_at).toLocaleDateString("cs-CZ")}
          </p>
        )}
      </div>
    </>
  );
}

/** Challenge detail section */
function ChallengeDetail({ goal }: { goal: Goal }) {
  const totalDays = goal.challenge_days ?? 30;
  const currentDay = getChallengeDayNumber(goal);
  const percentage = Math.min(100, (currentDay / totalDays) * 100);
  const remaining = Math.max(0, totalDays - currentDay);

  return (
    <>
      <Separator />
      <div className="space-y-4">
        {/* Big day counter */}
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame size={28} className="text-orange-500" />
          </div>
          <p className="text-4xl font-bold font-mono">
            Den {Math.min(currentDay, totalDays)}/{totalDays}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {remaining > 0
              ? `Zbývá ${remaining} ${remaining === 1 ? "den" : remaining < 5 ? "dny" : "dní"}`
              : "Challenge dokončena!"}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <Progress value={percentage} />
          <p className="text-xs text-muted-foreground text-center font-mono">
            {percentage.toFixed(0)}%
          </p>
        </div>

        {/* Streak */}
        {currentDay > 1 && (
          <div className="text-center">
            <Badge
              variant="outline"
              className="text-sm font-mono text-orange-500 border-orange-200 px-4 py-1"
            >
              🔥 {currentDay - 1} dní streak
            </Badge>
          </div>
        )}

        {/* Calendar dots grid */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-semibold">
            Přehled dní
          </p>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: totalDays }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "w-5 h-5 rounded-sm text-[9px] font-mono flex items-center justify-center",
                  i + 1 <= currentDay
                    ? "bg-orange-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {goal.challenge_start && (
          <p className="text-xs text-muted-foreground text-center font-mono">
            Start:{" "}
            {new Date(goal.challenge_start).toLocaleDateString("cs-CZ")}
          </p>
        )}
      </div>
    </>
  );
}

export default async function GoalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getAuthUser();
  const supabase = await createClient();

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
  const goalType = (typedGoal.goal_type ?? "measurable") as GoalType;
  const goalArea = (typedGoal.area ?? "other") as GoalArea;
  const typeConfig = getGoalTypeConfig(goalType);
  const areaConfig = getGoalAreaConfig(goalArea);
  const borderClass = AREA_BORDER_COLORS[goalArea] ?? "border-l-gray-500";

  // Fetch milestones
  const milestones = await getMilestones(id);

  // Fetch related habits
  const { data: habits } = await supabase
    .from("daily_habits")
    .select("*")
    .eq("goal_id", id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const typedHabits = (habits ?? []) as DailyHabit[];

  // Feature 9: Shared goal — who last updated
  let lastUpdatedBy: string | null = null;
  if (goalType === "shared" && typedGoal.household_id) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", typedGoal.profile_id)
        .single();
      if (profile && typedGoal.updated_at) {
        const date = new Date(typedGoal.updated_at).toLocaleDateString(
          "cs-CZ",
          { day: "numeric", month: "numeric" }
        );
        lastUpdatedBy = `${profile.display_name}, ${date}`;
      }
    } catch {
      // Non-critical
    }
  }

  // Feature 10: Habit monthly adherence data
  let monthlyAdherence: {
    completedDays: number;
    totalDays: number;
    percentage: number;
    weekGrids: boolean[][];
  } | null = null;

  if (goalType === "habit" && typedHabits.length > 0) {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const fromDate = thirtyDaysAgo.toISOString().split("T")[0];
      const toDate = now.toISOString().split("T")[0];

      const habitIds = typedHabits.map((h) => h.id);

      const { data: completions } = await supabase
        .from("habit_completions")
        .select("date")
        .in("habit_id", habitIds)
        .eq("profile_id", user.id)
        .gte("date", fromDate)
        .lte("date", toDate);

      const completedDates = new Set(
        (completions ?? []).map((c) => c.date)
      );
      const completedDays = completedDates.size;

      // Count days in month so far
      const dayOfMonth = now.getDate();
      const totalDays = dayOfMonth;
      const percentage =
        totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

      // Build 4-week grids (last 28 days)
      const weekGrids: boolean[][] = [];
      for (let w = 3; w >= 0; w--) {
        const week: boolean[] = [];
        for (let d = 0; d < 7; d++) {
          const dayDate = new Date();
          dayDate.setDate(dayDate.getDate() - (w * 7 + (6 - d)));
          const dateStr = dayDate.toISOString().split("T")[0];
          week.push(completedDates.has(dateStr));
        }
        weekGrids.push(week);
      }

      monthlyAdherence = { completedDays, totalDays, percentage, weekGrids };
    } catch {
      // Non-critical
    }
  }

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
          <div className="flex items-center gap-2">
            <span className="text-xl">{typeConfig.emoji}</span>
            <h1 className="text-xl font-bold">{typedGoal.title}</h1>
          </div>
        </div>
        <Link href={`/goals/${id}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil size={14} />
            Upravit
          </Button>
        </Link>
      </div>

      {/* Main card */}
      <Card className={cn("p-6 space-y-4 border-l-4", borderClass)}>
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={typedGoal.status === "active" ? "default" : "secondary"}
          >
            {STATUS_LABELS[typedGoal.status]}
          </Badge>
          <Badge
            variant="outline"
            className={cn("gap-1 text-xs", areaConfig.color)}
          >
            {areaConfig.emoji} {areaConfig.label}
          </Badge>
          <Badge variant="outline" className="gap-1 text-xs">
            {typeConfig.emoji} {typeConfig.label}
          </Badge>
          {goalType === "shared" && (
            <Badge
              variant="outline"
              className="gap-1 text-xs text-pink-500 border-pink-200"
            >
              👫 Sdílený
            </Badge>
          )}
          {typedGoal.target_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays size={12} />
              <span className="font-mono">
                {new Date(typedGoal.target_date).toLocaleDateString("cs-CZ")}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {typedGoal.description && (
          <p className="text-sm text-muted-foreground">
            {typedGoal.description}
          </p>
        )}

        {/* Feature 9: Shared goal — who last contributed */}
        {goalType === "shared" && lastUpdatedBy && (
          <>
            <Separator />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-pink-500">👫</span>
              <span>
                Naposledy aktualizoval: <strong>{lastUpdatedBy}</strong>
              </span>
            </div>
          </>
        )}

        {/* Type-specific detail sections */}
        {(goalType === "measurable" || goalType === "shared") && (
          <MeasurableDetail goal={typedGoal} />
        )}
        {goalType === "habit" && <HabitDetail goal={typedGoal} />}
        {goalType === "oneoff" && <OneoffDetail goal={typedGoal} />}
        {goalType === "challenge" && <ChallengeDetail goal={typedGoal} />}
      </Card>

      {/* Milestones */}
      <MilestoneSection
        goalId={id}
        milestones={milestones}
        isActive={typedGoal.status === "active"}
      />

      {/* Feature 10: Habit monthly adherence */}
      {goalType === "habit" && monthlyAdherence && (
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Měsíční přehled
          </h2>

          {/* Month stat */}
          <div className="text-center">
            <p className="text-2xl font-bold font-mono">
              {monthlyAdherence.completedDays}/{monthlyAdherence.totalDays} dní
            </p>
            <p className="text-sm text-muted-foreground">
              ({monthlyAdherence.percentage}%)
            </p>
            <div className="mt-2">
              <Progress value={monthlyAdherence.percentage} />
            </div>
          </div>

          {/* 4-week mini calendar grids */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">
              Posledních 28 dní
            </p>
            <div className="flex justify-center gap-1">
              {["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map((d) => (
                <span
                  key={d}
                  className="w-6 text-center text-[9px] text-muted-foreground font-mono"
                >
                  {d}
                </span>
              ))}
            </div>
            {monthlyAdherence.weekGrids.map((week, wi) => (
              <div key={wi} className="flex justify-center gap-1">
                {week.map((done, di) => (
                  <div
                    key={di}
                    className={cn(
                      "w-6 h-6 rounded-sm flex items-center justify-center text-[10px] font-mono",
                      done
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {done ? "✓" : "·"}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Related habits */}
      {typedHabits.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Propojené návyky
          </h2>
          <div className="space-y-2">
            {typedHabits.map((habit) => (
              <Card
                key={habit.id}
                className="p-3 flex items-center justify-between"
              >
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
