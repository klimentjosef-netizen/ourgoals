"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { SliderField } from "@/components/domain/checkin/slider-field";
import { Play, Square, Loader2, Timer, Brain } from "lucide-react";
import { startDeepWorkSession, endDeepWorkSession } from "@/app/(app)/work/actions";
import { toast } from "sonner";
import type { DeepWorkSession } from "@/app/(app)/work/actions";

interface DeepWorkTimerProps {
  activeSession: DeepWorkSession | null;
  targetMinutes: number;
  todayMinutes: number;
}

export function DeepWorkTimer({ activeSession, targetMinutes, todayMinutes }: DeepWorkTimerProps) {
  const [isPending, startTransition] = useTransition();
  const [sessionId, setSessionId] = useState<string | null>(activeSession?.id ?? null);
  const [isRunning, setIsRunning] = useState(!!activeSession);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [taskDesc, setTaskDesc] = useState("");
  const [focusScore, setFocusScore] = useState(7);
  const [interruptions, setInterruptions] = useState(0);
  const [notes, setNotes] = useState("");
  const [plannedMinutes, setPlannedMinutes] = useState(Math.min(60, Math.max(25, targetMinutes - todayMinutes)));

  // Calculate initial elapsed if session is active
  useEffect(() => {
    if (activeSession && !activeSession.ended_at) {
      const start = new Date(activeSession.started_at).getTime();
      const now = Date.now();
      setElapsedSeconds(Math.floor((now - start) / 1000));
      setTaskDesc(activeSession.task_description ?? "");
    }
  }, [activeSession]);

  // Timer tick
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  function handleStart() {
    startTransition(async () => {
      const result = await startDeepWorkSession(plannedMinutes, taskDesc || undefined);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setSessionId(result.id!);
      setIsRunning(true);
      setElapsedSeconds(0);
    });
  }

  function handleStop() {
    setIsRunning(false);
    setShowEndDialog(true);
  }

  function handleFinish() {
    if (!sessionId) return;
    startTransition(async () => {
      const result = await endDeepWorkSession(sessionId, focusScore, interruptions, notes || undefined);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`+${result.xpAwarded} XP za deep work!`, {
        description: `${minutes} minut soustředění`,
      });
      setSessionId(null);
      setShowEndDialog(false);
      setElapsedSeconds(0);
      setTaskDesc("");
      setNotes("");
      setInterruptions(0);
      setFocusScore(7);
    });
  }

  // End dialog
  if (showEndDialog) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-5 space-y-4">
          <div className="text-center">
            <p className="text-sm font-semibold">Deep work ukončen</p>
            <p className="text-3xl font-bold tabular-nums mt-1">
              {minutes} min
            </p>
          </div>

          <SliderField
            name="focus_score"
            label="Jak moc jsi se soustředil?"
            value={focusScore}
            onChange={setFocusScore}
          />

          <div className="space-y-1.5">
            <Label className="text-xs">Kolikrát tě něco vyrušilo?</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => setInterruptions((i) => Math.max(0, i - 1))}
              >
                -
              </Button>
              <span className="text-lg font-bold tabular-nums w-6 text-center">
                {interruptions}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => setInterruptions((i) => i + 1)}
              >
                +
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Poznámky (volitelné)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Co jsi zvládl, co příště lépe..."
              className="h-11"
            />
          </div>

          <Button
            onClick={handleFinish}
            disabled={isPending}
            className="w-full h-11"
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : null}
            Uložit a získat XP
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Running state
  if (isRunning) {
    const plannedSec = (activeSession?.planned_minutes ?? plannedMinutes) * 60;
    const progressPct = plannedSec > 0 ? Math.min(100, Math.round((elapsedSeconds / plannedSec) * 100)) : 0;
    const isOvertime = elapsedSeconds > plannedSec;

    return (
      <Card className={`border-2 ${isOvertime ? "border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/10" : "border-primary/50 bg-primary/5"}`}>
        <CardContent className="pt-6 pb-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Brain size={20} className="text-primary animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">
              {taskDesc || "Deep work probíhá..."}
            </span>
          </div>

          <p className="text-5xl font-bold tabular-nums tracking-tight">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </p>

          {isOvertime && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Překročen plánovaný čas +{minutes - (activeSession?.planned_minutes ?? plannedMinutes)} min
            </p>
          )}

          <div className="h-2 rounded-full bg-muted overflow-hidden max-w-xs mx-auto">
            <div
              className={`h-full rounded-full transition-all ${isOvertime ? "bg-amber-500" : "bg-primary"}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <Button
            onClick={handleStop}
            variant="destructive"
            className="h-12 px-8"
          >
            <Square size={16} className="mr-2" />
            Ukončit blok
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Idle state - start new session
  return (
    <Card>
      <CardContent className="pt-5 pb-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Timer size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Spustit deep work</p>
            <p className="text-xs text-muted-foreground">
              Soustředěná práce bez přerušení
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Na čem budeš pracovat?</Label>
            <Input
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              placeholder="Např. Návrh API, kódování..."
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Kolik minut?</Label>
            <Input
              type="number"
              value={plannedMinutes}
              onChange={(e) => setPlannedMinutes(Number(e.target.value) || 25)}
              min={5}
              max={240}
              className="h-11"
            />
          </div>
        </div>

        <Button
          onClick={handleStart}
          disabled={isPending}
          className="w-full h-12 text-base"
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin mr-2" />
          ) : (
            <Play size={16} className="mr-2" />
          )}
          Spustit deep work
        </Button>
      </CardContent>
    </Card>
  );
}
