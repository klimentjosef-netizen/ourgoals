import { getAuthUser } from "@/lib/auth";
import { getWorkoutForToday, getSessionHistory } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dumbbell, Play, Clock, History, ListChecks, LayoutTemplate, PenLine, Zap } from "lucide-react";
import Link from "next/link";
import { TrainingSession } from "./session";
import { PLAN_TEMPLATES } from "./plan/templates";
import type { WorkoutExercise } from "@/types/training";

export default async function TrainingPage() {
  const user = await getAuthUser();
  const workout = await getWorkoutForToday(user.id);
  const recentSessions = await getSessionHistory(user.id, 5);

  const exercises = (workout?.workout_exercises ?? []) as WorkoutExercise[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell size={24} className="text-primary" />
          <h1 className="text-xl font-bold">Trénink</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/training/plan">
            <Button variant="outline" size="sm">
              <ListChecks size={14} />
              Plán
            </Button>
          </Link>
          <Link href="/training/history">
            <Button variant="outline" size="sm">
              <History size={14} />
              Historie
            </Button>
          </Link>
        </div>
      </div>

      {/* Today's workout */}
      {workout ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-base">
                Dnes: {workout.day_label}
              </span>
              {workout.focus && (
                <Badge variant="secondary" className="text-xs">
                  {workout.focus}
                </Badge>
              )}
            </CardTitle>
            {workout.target_duration_min && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={12} />
                ~{workout.target_duration_min} min
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    {ex.exercises?.name ?? "Cvik"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {ex.sets}×{ex.reps_low}
                    {ex.reps_high && ex.reps_high !== ex.reps_low
                      ? `-${ex.reps_high}`
                      : ""}
                    {ex.rpe_target ? ` @ RPE ${ex.rpe_target}` : ""}
                  </p>
                </div>
                {ex.rest_sec && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {ex.rest_sec}s rest
                  </span>
                )}
              </div>
            ))}

            <TrainingSession workoutId={workout.id} exercises={exercises} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center space-y-2 py-2">
            <div className="w-14 h-14 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <Dumbbell size={28} className="text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Začni trénovat podle plánu</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Vyber šablonu nebo si vytvoř vlastní plán na míru.
            </p>
          </div>

          {/* Template cards */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Vyber šablonu
            </p>
            {PLAN_TEMPLATES.map((t) => (
              <Link key={t.id} href={`/training/plan/edit`}>
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-3 pb-3 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <LayoutTemplate size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{t.name}</p>
                        <Badge variant="secondary" className="text-[10px]">
                          {t.daysPerWeek}×/týden
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Other options */}
          <div className="grid grid-cols-2 gap-2">
            <Link href="/training/plan/edit">
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardContent className="pt-4 pb-4 text-center space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-muted mx-auto flex items-center justify-center">
                    <PenLine size={16} className="text-muted-foreground" />
                  </div>
                  <p className="text-xs font-semibold">Vytvořit vlastní</p>
                  <p className="text-[10px] text-muted-foreground">Plán na míru</p>
                </CardContent>
              </Card>
            </Link>
            <Card className="hover:border-primary/50 transition-colors h-full">
              <CardContent className="pt-4 pb-4 text-center space-y-2">
                <div className="w-9 h-9 rounded-lg bg-muted mx-auto flex items-center justify-center">
                  <Zap size={16} className="text-muted-foreground" />
                </div>
                <p className="text-xs font-semibold">Trénovat bez plánu</p>
                <div className="pt-1">
                  <TrainingSession workoutId={null} exercises={[]} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Poslední tréninky
            </h2>
            {recentSessions.map((session: Record<string, unknown>) => (
              <Card key={session.id as string}>
                <CardContent className="pt-3 pb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {(session.workouts as Record<string, string>)?.day_label ?? "Volný trénink"}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {new Date(session.date as string).toLocaleDateString("cs-CZ")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {session.mood_1_10 ? (
                      <Badge variant="outline" className="text-[10px]">
                        Mood {String(session.mood_1_10)}/10
                      </Badge>
                    ) : null}
                    {session.completed_at ? (
                      <Badge variant="default" className="text-[10px]">Dokončeno</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Nedokončeno</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
