import { getAuthUser } from "@/lib/auth";
import { getWorkoutForToday, getSessionHistory } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dumbbell, Play, Clock, History, ListChecks } from "lucide-react";
import Link from "next/link";
import { TrainingSession } from "./session";
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
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <Dumbbell size={32} className="mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nemáš aktivní tréninkový plán.
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/training/plan">
                <Button size="sm">Vytvořit plán</Button>
              </Link>
              <TrainingSession workoutId={null} exercises={[]} />
            </div>
          </CardContent>
        </Card>
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
