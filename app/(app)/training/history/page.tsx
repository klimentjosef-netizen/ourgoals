import { getAuthUser } from "@/lib/auth";
import { getSessionHistoryWithSets } from "../actions";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SessionCard } from "./session-card";

export default async function TrainingHistoryPage() {
  const user = await getAuthUser();
  const sessions = await getSessionHistoryWithSets(user.id, 30);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/training" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Historie tréninků</h1>
      </div>

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
