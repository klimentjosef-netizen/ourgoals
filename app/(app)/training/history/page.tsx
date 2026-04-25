import { getAuthUser } from "@/lib/auth";
import { getSessionHistoryWithSets, getExerciseProgressData } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";
import { SessionCard } from "./session-card";
import { ExerciseProgress } from "@/components/domain/training/exercise-progress";

export default async function TrainingHistoryPage() {
  const user = await getAuthUser();
  const sessions = await getSessionHistoryWithSets(user.id, 30);
  const progressData = await getExerciseProgressData(user.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/training" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Historie tréninků</h1>
      </div>

      {/* Feature 11: Exercise progress charts */}
      {progressData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp size={14} className="text-primary" />
              Progrese — max váha za trénink
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {progressData.map((ex) => (
              <ExerciseProgress
                key={ex.exerciseName}
                exerciseName={ex.exerciseName}
                data={ex.data}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="pt-4 text-center text-muted-foreground text-sm">
            Zatím žádné tréninky.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sessions.map((s: Record<string, unknown>) => (
            <SessionCard
              key={s.id as string}
              session={s as {
                id: string;
                date: string;
                completed_at: string | null;
                mood_1_10: number | null;
                energy_1_10: number | null;
                workouts: { day_label: string; focus: string | null } | null;
                set_logs: {
                  set_idx: number;
                  weight_kg: number | null;
                  reps: number | null;
                  rpe: number | null;
                  is_warmup: boolean;
                  exercises: { name: string } | null;
                }[];
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
