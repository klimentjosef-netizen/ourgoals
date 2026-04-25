"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SetLogEntry {
  set_idx: number;
  weight_kg: number | null;
  reps: number | null;
  rpe: number | null;
  is_warmup: boolean;
  exercises: { name: string } | null;
}

interface SessionData {
  id: string;
  date: string;
  completed_at: string | null;
  mood_1_10: number | null;
  energy_1_10: number | null;
  workouts: { day_label: string; focus: string | null } | null;
  set_logs: SetLogEntry[];
}

interface Props {
  session: SessionData;
}

export function SessionCard({ session }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Seskup série podle cviku
  const exerciseGroups = new Map<string, SetLogEntry[]>();
  for (const log of session.set_logs ?? []) {
    const name = log.exercises?.name ?? "Neznámý cvik";
    if (!exerciseGroups.has(name)) exerciseGroups.set(name, []);
    exerciseGroups.get(name)!.push(log);
  }

  const hasLogs = (session.set_logs?.length ?? 0) > 0;

  return (
    <Card
      className={hasLogs ? "cursor-pointer hover:border-primary/30 transition-colors" : ""}
      onClick={() => hasLogs && setExpanded(!expanded)}
    >
      <CardContent className="pt-3 pb-3 space-y-0">
        {/* Hlavička */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasLogs && (
              expanded
                ? <ChevronDown size={14} className="text-muted-foreground shrink-0" />
                : <ChevronRight size={14} className="text-muted-foreground shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium">
                {session.workouts?.day_label ?? "Volný trénink"}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {new Date(session.date).toLocaleDateString("cs-CZ")}
                {session.workouts?.focus && (
                  <span className="ml-2 text-muted-foreground/70">
                    {session.workouts.focus}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {session.mood_1_10 ? (
              <Badge variant="outline" className="text-[10px] font-mono">
                Mood {session.mood_1_10}
              </Badge>
            ) : null}
            {session.energy_1_10 ? (
              <Badge variant="outline" className="text-[10px] font-mono">
                Energie {session.energy_1_10}
              </Badge>
            ) : null}
            {session.completed_at ? (
              <Badge variant="default" className="text-[10px]">Dokončeno</Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">Nedokončeno</Badge>
            )}
          </div>
        </div>

        {/* Rozbalený detail */}
        {expanded && hasLogs && (
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            {Array.from(exerciseGroups.entries()).map(([exerciseName, sets]) => {
              const workingSets = sets
                .filter((s) => !s.is_warmup)
                .sort((a, b) => a.set_idx - b.set_idx);
              const warmupSets = sets
                .filter((s) => s.is_warmup)
                .sort((a, b) => a.set_idx - b.set_idx);

              return (
                <div key={exerciseName}>
                  <p className="text-xs font-semibold text-foreground">
                    {exerciseName}
                  </p>
                  {warmupSets.length > 0 && (
                    <p className="text-[10px] text-muted-foreground/70 font-mono">
                      Rozcvička:{" "}
                      {warmupSets
                        .map((s) => `${s.weight_kg ?? 0}kg×${s.reps ?? 0}`)
                        .join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground font-mono">
                    {workingSets
                      .map((s) => {
                        const base = `${s.weight_kg ?? 0}kg×${s.reps ?? 0}`;
                        return s.rpe ? `${base} @${s.rpe}` : base;
                      })
                      .join(", ")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
