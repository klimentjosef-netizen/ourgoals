"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Square, ChevronRight, Timer } from "lucide-react";
import { toast } from "sonner";
import { startSession, logSet, completeSession } from "./actions";
import type { WorkoutExercise } from "@/types/training";

interface Props {
  workoutId: string | null;
  exercises: WorkoutExercise[];
}

export function TrainingSession({ workoutId, exercises }: Props) {
  const [active, setActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("");
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [mood, setMood] = useState("7");
  const [energy, setEnergy] = useState("7");
  const [completing, setCompleting] = useState(false);

  const currentEx = exercises[currentExIdx];

  async function handleStart() {
    const result = await startSession(workoutId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setSessionId(result.session?.id ?? null);
    setActive(true);
    setCurrentExIdx(0);
    setSetIdx(0);
    toast.success("Trénink zahájen!");
  }

  async function handleLogSet() {
    if (!sessionId || !currentEx) return;
    const w = parseFloat(weight);
    const r = parseInt(reps);
    if (isNaN(w) || isNaN(r)) {
      toast.error("Zadej váhu a repy");
      return;
    }

    const result = await logSet(
      sessionId,
      currentEx.exercise_id,
      setIdx,
      w,
      r,
      rpe ? parseFloat(rpe) : null,
      false
    );

    if (result?.error) {
      toast.error("Nepodařilo se uložit sérii");
      return;
    }

    toast.success(`Série ${setIdx + 1} uložena: ${w}kg × ${r}`);

    // Next set or next exercise
    if (setIdx + 1 < (currentEx.sets ?? 3)) {
      setSetIdx(setIdx + 1);
      // Start rest timer
      setRestTimer(currentEx.rest_sec ?? 90);
      const interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Next exercise
      if (currentExIdx + 1 < exercises.length) {
        setCurrentExIdx(currentExIdx + 1);
        setSetIdx(0);
        setWeight("");
        setReps("");
        setRpe("");
      } else {
        setCompleting(true);
      }
    }
  }

  async function handleComplete() {
    if (!sessionId) return;
    const result = await completeSession(
      sessionId,
      parseInt(mood) || null,
      parseInt(energy) || null,
      null
    );
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Trénink dokončen! +${result.xpAwarded} XP`);
    setActive(false);
    setCompleting(false);
    setSessionId(null);
  }

  if (!active) {
    return (
      <Button onClick={handleStart} className="w-full mt-4">
        <Play size={16} />
        {workoutId ? "Začít trénink" : "Začít volný trénink"}
      </Button>
    );
  }

  if (completing) {
    return (
      <Card className="p-4 mt-4 space-y-3">
        <h3 className="font-semibold text-sm">Hodnocení tréninku</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Mood (1-10)</label>
            <Input type="number" min={1} max={10} value={mood} onChange={(e) => setMood(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Energie (1-10)</label>
            <Input type="number" min={1} max={10} value={energy} onChange={(e) => setEnergy(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleComplete} className="w-full">
          <Square size={16} />
          Dokončit trénink
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4 mt-4 space-y-3 border-primary/30">
      {currentEx && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">
                {currentEx.exercises?.name ?? "Cvik"}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                Série {setIdx + 1} / {currentEx.sets}
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              {currentExIdx + 1}/{exercises.length}
            </Badge>
          </div>

          {restTimer !== null && (
            <div className="flex items-center gap-2 text-sm text-primary font-mono">
              <Timer size={14} />
              Odpočinek: {restTimer}s
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground">Váha (kg)</label>
              <Input
                type="number"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="kg"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Repy</label>
              <Input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="reps"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">RPE</label>
              <Input
                type="number"
                step="0.5"
                min={1}
                max={10}
                value={rpe}
                onChange={(e) => setRpe(e.target.value)}
                placeholder="—"
              />
            </div>
          </div>

          <Button onClick={handleLogSet} className="w-full" disabled={restTimer !== null}>
            Uložit sérii
            <ChevronRight size={14} />
          </Button>
        </>
      )}
    </Card>
  );
}
