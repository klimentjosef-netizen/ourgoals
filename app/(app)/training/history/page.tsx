import { getAuthUser } from "@/lib/auth";
import { getSessionHistory } from "../actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function TrainingHistoryPage() {
  const user = await getAuthUser();
  const sessions = await getSessionHistory(user.id, 30);

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
            <Card key={s.id as string}>
              <CardContent className="pt-3 pb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {(s.workouts as Record<string, string>)?.day_label ?? "Volný trénink"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {new Date(s.date as string).toLocaleDateString("cs-CZ")}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  {s.mood_1_10 ? <Badge variant="outline" className="text-[10px] font-mono">Mood {String(s.mood_1_10)}</Badge> : null}
                  {s.energy_1_10 ? <Badge variant="outline" className="text-[10px] font-mono">Energie {String(s.energy_1_10)}</Badge> : null}
                  {s.completed_at ? (
                    <Badge variant="default" className="text-[10px]">Dokončeno</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">Nedokončeno</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
