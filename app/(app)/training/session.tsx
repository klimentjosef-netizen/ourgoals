"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Square,
  ChevronRight,
  Timer,
  TrendingUp,
  Info,
  X,
  SkipForward,
  Plus,
  Minus,
  Trophy,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import {
  startSession,
  logSet,
  completeSession,
  getExerciseSuggestion,
  checkForPR,
} from "./actions";
import type { ExerciseSuggestionResult } from "./actions";
import type { WorkoutExercise } from "@/types/training";

/* ============================================================
   TYPES
   ============================================================ */

interface Props {
  userId: string;
  workoutId: string | null;
  exercises: WorkoutExercise[];
}

interface LoggedSet {
  exerciseId: string;
  exerciseName: string;
  setIdx: number;
  weight: number;
  reps: number;
  rpe: number | null;
  isPR: boolean;
}

/* ============================================================
   COMPONENT
   ============================================================ */

export function TrainingSession({ userId, workoutId, exercises }: Props) {
  const [active, setActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("");
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restTimerMax, setRestTimerMax] = useState<number>(90);
  const [mood, setMood] = useState("7");
  const [energy, setEnergy] = useState("7");
  const [completing, setCompleting] = useState(false);
  const [suggestion, setSuggestion] = useState<ExerciseSuggestionResult | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  // Feature 1: Exercise info tooltip
  const [showExInfo, setShowExInfo] = useState<string | null>(null);

  // Feature 2: Warm-up reminder
  const [showWarmup, setShowWarmup] = useState(false);

  // Feature 4: Session summary
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState<Date | null>(null);
  const [loggedSets, setLoggedSets] = useState<LoggedSet[]>([]);

  // Feature 5: PR highlight (set indexes that are PRs)
  const [prSets, setPrSets] = useState<Set<string>>(new Set());

  // Feature 8: Free training suggestion
  const [freeSuggestion, setFreeSuggestion] = useState<ExerciseSuggestionResult | null>(null);

  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentEx = exercises[currentExIdx];

  // Načti doporučení při změně cviku
  useEffect(() => {
    if (!active || !currentEx) {
      setSuggestion(null);
      return;
    }

    let cancelled = false;
    setLoadingSuggestion(true);

    getExerciseSuggestion(
      userId,
      currentEx.exercise_id,
      currentEx.reps_low ?? 6,
      currentEx.reps_high ?? 12,
      currentEx.rpe_target ?? 8
    )
      .then((result) => {
        if (cancelled) return;
        setSuggestion(result);
        // Předvyplň váhu a repy doporučenou hodnotou
        if (result.suggestedWeight) {
          setWeight(String(result.suggestedWeight));
        }
        if (result.suggestedReps) {
          setReps(String(result.suggestedReps));
        }
        setLoadingSuggestion(false);
      })
      .catch(() => {
        if (!cancelled) setLoadingSuggestion(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, currentExIdx, userId]);

  // Feature 8: Free training — load suggestion for current exercise
  useEffect(() => {
    if (!active || !currentEx || workoutId) {
      setFreeSuggestion(null);
      return;
    }

    let cancelled = false;
    getExerciseSuggestion(
      userId,
      currentEx.exercise_id,
      currentEx.reps_low ?? 6,
      currentEx.reps_high ?? 12,
      currentEx.rpe_target ?? 8
    ).then((result) => {
      if (!cancelled) setFreeSuggestion(result);
    }).catch(() => {});

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, currentExIdx, userId, workoutId]);

  // Cleanup rest timer interval on unmount
  useEffect(() => {
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, []);

  /* ============================================================
     HANDLERS
     ============================================================ */

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
    setSessionStartedAt(new Date());
    setLoggedSets([]);
    setPrSets(new Set());

    // Feature 2: Warm-up reminder
    setShowWarmup(true);
    setTimeout(() => setShowWarmup(false), 5000);

    toast.success("Trénink zahájen!");
  }

  function skipRestTimer() {
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
      restIntervalRef.current = null;
    }
    setRestTimer(null);
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

    // Feature 5: Check for PR
    let isPR = false;
    try {
      const prResult = await checkForPR(userId, currentEx.exercise_id, w, r);
      if (prResult.isPR) {
        isPR = true;
        const prKey = `${currentEx.exercise_id}-${setIdx}`;
        setPrSets((prev) => new Set(prev).add(prKey));
        toast.success(
          `🏆 NOVÝ REKORD! ${w} kg (předchozí: ${prResult.previousBest ?? "—"} kg)`,
          { duration: 5000 }
        );
      }
    } catch {}

    // Track logged set for summary
    setLoggedSets((prev) => [
      ...prev,
      {
        exerciseId: currentEx.exercise_id,
        exerciseName: currentEx.exercises?.name ?? "Cvik",
        setIdx,
        weight: w,
        reps: r,
        rpe: rpe ? parseFloat(rpe) : null,
        isPR,
      },
    ]);

    toast.success(`Série ${setIdx + 1} uložena: ${w}kg × ${r}`);

    // Next set or next exercise
    if (setIdx + 1 < (currentEx.sets ?? 3)) {
      setSetIdx(setIdx + 1);
      // Start rest timer
      const restSec = currentEx.rest_sec ?? 90;
      setRestTimerMax(restSec);
      setRestTimer(restSec);
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      restIntervalRef.current = setInterval(() => {
        setRestTimer((prev) => {
          if (prev === null || prev <= 1) {
            if (restIntervalRef.current) clearInterval(restIntervalRef.current);
            restIntervalRef.current = null;
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
    setCompleting(false);
    setShowSummary(true);
  }

  function handleCloseSummary() {
    setShowSummary(false);
    setActive(false);
    setSessionId(null);
    setLoggedSets([]);
    setPrSets(new Set());
    setSessionStartedAt(null);
  }

  /* ============================================================
     HELPERS
     ============================================================ */

  function formatDuration(start: Date, end: Date): string {
    const diffMs = end.getTime() - start.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}h ${remainMins}min`;
  }

  function totalVolume(): number {
    return loggedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  }

  function prCount(): number {
    return loggedSets.filter((s) => s.isPR).length;
  }

  /* ============================================================
     RENDER: Not active → Start button
     ============================================================ */

  if (!active && !showSummary) {
    return (
      <Button onClick={handleStart} className="w-full mt-4">
        <Play size={16} />
        {workoutId ? "Začít trénink" : "Začít volný trénink"}
      </Button>
    );
  }

  /* ============================================================
     RENDER: Feature 4 — Session completion summary
     ============================================================ */

  if (showSummary) {
    const now = new Date();
    const duration = sessionStartedAt ? formatDuration(sessionStartedAt, now) : "—";
    const vol = totalVolume();
    const prs = prCount();

    return (
      <Card className="p-5 mt-4 space-y-4 border-primary/40 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="text-center space-y-1">
          <p className="text-2xl font-bold">Trénink dokončen! 🎉</p>
          <p className="text-sm text-muted-foreground">Skvělá práce!</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">Doba trvání</p>
            <p className="text-lg font-bold font-mono">{duration}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">Celkový objem</p>
            <p className="text-lg font-bold font-mono">
              {vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${vol} kg`}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">Sérií</p>
            <p className="text-lg font-bold font-mono">{loggedSets.length}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">XP</p>
            <p className="text-lg font-bold font-mono text-primary">+30</p>
          </div>
        </div>

        {prs > 0 && (
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3 text-center">
            <p className="text-sm font-semibold text-yellow-600">
              🏆 {prs} {prs === 1 ? "osobní rekord" : "osobní rekordy"}!
            </p>
          </div>
        )}

        <div className="flex gap-3 text-sm">
          <div className="flex-1 text-center">
            <p className="text-xs text-muted-foreground">Mood</p>
            <p className="font-semibold">{mood}/10</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-xs text-muted-foreground">Energie</p>
            <p className="font-semibold">{energy}/10</p>
          </div>
        </div>

        <Button onClick={handleCloseSummary} className="w-full">
          <ArrowLeft size={14} />
          Zpět na přehled
        </Button>
      </Card>
    );
  }

  /* ============================================================
     RENDER: Completing → Mood/Energy form
     ============================================================ */

  if (completing) {
    return (
      <Card className="p-4 mt-4 space-y-3">
        <h3 className="font-semibold text-sm">Hodnocení tréninku</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Mood (1-10)</label>
            <Input
              type="number"
              min={1}
              max={10}
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Energie (1-10)</label>
            <Input
              type="number"
              min={1}
              max={10}
              value={energy}
              onChange={(e) => setEnergy(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleComplete} className="w-full">
          <Square size={16} />
          Dokončit trénink
        </Button>
      </Card>
    );
  }

  /* ============================================================
     RENDER: Active training session
     ============================================================ */

  // Rest timer progress (0-1)
  const restProgress =
    restTimer !== null && restTimerMax > 0 ? restTimer / restTimerMax : 0;

  return (
    <Card className="p-4 mt-4 space-y-3 border-primary/30">
      {/* Feature 2: Warm-up reminder */}
      {showWarmup && (
        <div className="relative rounded-lg bg-orange-500/10 border border-orange-500/30 p-3 animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => setShowWarmup(false)}
            className="absolute top-2 right-2 text-orange-500/60 hover:text-orange-500"
          >
            <X size={14} />
          </button>
          <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
            🔥 Nezapomeň na rozcvičku!
          </p>
          <p className="text-xs text-orange-600/80 dark:text-orange-400/70 mt-0.5">
            5-10 min lehkého kardio + mobilita.
          </p>
        </div>
      )}

      {currentEx && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <p className="font-semibold text-sm">
                  {currentEx.exercises?.name ?? "Cvik"}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  Série {setIdx + 1} / {currentEx.sets}
                </p>
              </div>
              {/* Feature 1: Exercise info icon */}
              <button
                onClick={() =>
                  setShowExInfo(
                    showExInfo === currentEx.exercise_id
                      ? null
                      : currentEx.exercise_id
                  )
                }
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Informace o cviku"
              >
                <Info size={16} />
              </button>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              {currentExIdx + 1}/{exercises.length}
            </Badge>
          </div>

          {/* Feature 1: Exercise info tooltip */}
          {showExInfo === currentEx.exercise_id && (
            <div className="rounded-md bg-muted border border-border px-3 py-2 text-xs space-y-0.5 animate-in fade-in slide-in-from-top-1">
              <p>
                <span className="text-muted-foreground">Primární sval:</span>{" "}
                <span className="font-medium">
                  {currentEx.exercises?.primary_muscle ?? "Neuvedeno"}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Vybavení:</span>{" "}
                <span className="font-medium">
                  {currentEx.exercises?.equipment ?? "Žádné"}
                </span>
              </p>
            </div>
          )}

          {/* Doporučení progresivního přetížení */}
          {suggestion &&
            !loadingSuggestion &&
            (suggestion.lastSets || suggestion.suggestedWeight) && (
              <div className="rounded-md bg-muted/50 border border-muted px-3 py-2 space-y-1">
                {suggestion.lastSets && (
                  <p className="text-xs text-muted-foreground">
                    Minule:{" "}
                    <span className="font-mono">{suggestion.lastSets}</span>
                  </p>
                )}
                {suggestion.suggestedWeight && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp size={12} className="text-primary" />
                    Doporučeno:{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {suggestion.suggestedWeight} kg
                    </span>
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground italic">
                  {suggestion.reasoning}
                </p>
              </div>
            )}
          {loadingSuggestion && (
            <p className="text-xs text-muted-foreground animate-pulse">
              Načítám doporučení...
            </p>
          )}

          {/* Feature 8: Free training — show previous results */}
          {!workoutId && freeSuggestion && freeSuggestion.lastSets && (
            <div className="rounded-md bg-muted/50 border border-muted px-3 py-2 space-y-1">
              <p className="text-xs text-muted-foreground">
                Minule:{" "}
                <span className="font-mono">{freeSuggestion.lastSets}</span>
              </p>
              {freeSuggestion.suggestedWeight && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp size={12} className="text-primary" />
                  Doporučeno:{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {freeSuggestion.suggestedWeight} kg
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Feature 3: Rest timer redesign — prominent overlay */}
          {restTimer !== null && (
            <div className="relative flex flex-col items-center py-6 rounded-xl bg-muted/60 border border-primary/20">
              {/* SVG circular progress ring */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90"
                  viewBox="0 0 120 120"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-muted/40"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="text-primary transition-all duration-1000"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - restProgress)}`}
                  />
                </svg>
                <span className="text-5xl font-bold font-mono tabular-nums text-foreground">
                  {restTimer}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Timer size={12} />
                Odpočinek
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={skipRestTimer}
                className="mt-2 text-xs"
              >
                <SkipForward size={14} />
                Přeskočit
              </Button>
            </div>
          )}

          {/* Feature 12: Bigger session inputs with +/- buttons */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground">
                Váha (kg)
              </label>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-10 shrink-0"
                  onClick={() =>
                    setWeight(String(Math.max(0, (parseFloat(weight) || 0) - 2.5)))
                  }
                >
                  <Minus size={14} />
                </Button>
                <Input
                  type="number"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="kg"
                  className="h-14 text-xl text-center font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-10 shrink-0"
                  onClick={() =>
                    setWeight(String((parseFloat(weight) || 0) + 2.5))
                  }
                >
                  <Plus size={14} />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Repy</label>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-10 shrink-0"
                  onClick={() =>
                    setReps(String(Math.max(1, (parseInt(reps) || 0) - 1)))
                  }
                >
                  <Minus size={14} />
                </Button>
                <Input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="reps"
                  className="h-14 text-xl text-center font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-10 shrink-0"
                  onClick={() =>
                    setReps(String((parseInt(reps) || 0) + 1))
                  }
                >
                  <Plus size={14} />
                </Button>
              </div>
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
                className="h-14 text-xl text-center font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Feature 5: Show logged sets for current exercise with PR highlight */}
          {loggedSets.filter((s) => s.exerciseId === currentEx.exercise_id).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {loggedSets
                .filter((s) => s.exerciseId === currentEx.exercise_id)
                .map((s, i) => (
                  <Badge
                    key={i}
                    variant={s.isPR ? "default" : "secondary"}
                    className={`text-[10px] font-mono ${
                      s.isPR
                        ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/40"
                        : ""
                    }`}
                  >
                    {s.isPR && <Trophy size={10} className="mr-0.5" />}
                    {s.weight}kg×{s.reps}
                  </Badge>
                ))}
            </div>
          )}

          <Button
            onClick={handleLogSet}
            className="w-full h-12 text-base"
            disabled={restTimer !== null}
          >
            Uložit sérii
            <ChevronRight size={14} />
          </Button>
        </>
      )}
    </Card>
  );
}
