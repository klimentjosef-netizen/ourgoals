import { getAuthUser } from "@/lib/auth";
import { getTrainingPlans } from "../actions";
import { createClient } from "@/lib/supabase/server";
import { DEV_MODE } from "@/lib/dev/mock-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dumbbell, Clock } from "lucide-react";
import Link from "next/link";

export default async function TrainingPlanPage() {
  const user = await getAuthUser();
  const plans = await getTrainingPlans(user.id);

  let workouts: Record<string, unknown>[] = [];
  if (!DEV_MODE && plans.length > 0) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("workouts")
      .select("*, workout_exercises(*, exercises(name, category))")
      .eq("plan_id", plans[0].id)
      .order("day_index");
    workouts = data ?? [];
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/training" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Tréninkový plán</h1>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <Dumbbell size={32} className="mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nemáš žádný tréninkový plán. Vytvoř si ho nebo vyber šablonu.
            </p>
            <p className="text-xs text-muted-foreground">
              (Editor plánu bude v další iteraci)
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{plans[0].name}</CardTitle>
              <p className="text-xs text-muted-foreground font-mono">
                {plans[0].start_date} → {plans[0].end_date ?? "bez konce"}
                {plans[0].days_per_week && ` • ${plans[0].days_per_week}×/týden`}
              </p>
            </CardHeader>
          </Card>

          <div className="grid gap-3">
            {workouts.map((w: Record<string, unknown>) => {
              const exercises = (w.workout_exercises ?? []) as Record<string, unknown>[];
              return (
                <Card key={w.id as string}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold">{w.day_label as string}</p>
                      <div className="flex gap-2">
                        {w.focus ? <Badge variant="secondary" className="text-[10px]">{String(w.focus)}</Badge> : null}
                        {w.target_duration_min ? (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock size={10} />{String(w.target_duration_min)}min
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {exercises.map((ex: Record<string, unknown>) => (
                        <p key={ex.id as string} className="text-xs text-muted-foreground font-mono">
                          {(ex.exercises as Record<string, string>)?.name ?? "?"} — {ex.sets as number}×{ex.reps_low as number}{ex.reps_high ? `-${ex.reps_high}` : ""}
                        </p>
                      ))}
                      {exercises.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">Žádné cviky</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
