"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, GripVertical, Clock, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import {
  addWorkoutToPlan,
  removeWorkout,
  removeExerciseFromWorkout,
  reorderExercise,
} from "@/app/(app)/training/plan/actions";
import { ExercisePicker } from "@/components/domain/training/exercise-picker";
import type { Workout, WorkoutExercise, Exercise } from "@/types/training";

interface WorkoutWithExercises extends Workout {
  workout_exercises: (WorkoutExercise & { exercises: Exercise })[];
}

interface Props {
  planId: string;
  planName: string;
  workouts: WorkoutWithExercises[];
}

export function PlanEditor({ planId, planName, workouts: initialWorkouts }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Add day form
  const [showAddDay, setShowAddDay] = useState(false);
  const [dayLabel, setDayLabel] = useState("");
  const [dayFocus, setDayFocus] = useState("");
  const [dayDuration, setDayDuration] = useState("60");

  function handleAddDay() {
    if (!dayLabel.trim()) {
      toast.error("Zadej název dne");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      // Next available day index
      const maxIdx = initialWorkouts.reduce((max, w) => Math.max(max, w.day_index), -1);
      fd.set("day_index", String(maxIdx + 1));
      fd.set("day_label", dayLabel);
      fd.set("focus", dayFocus);
      fd.set("target_duration_min", dayDuration);

      const result = await addWorkoutToPlan(planId, fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Den "${dayLabel}" přidán`);
        setDayLabel("");
        setDayFocus("");
        setShowAddDay(false);
        router.refresh();
      }
    });
  }

  function handleRemoveWorkout(workoutId: string, label: string) {
    if (!confirm(`Opravdu smazat "${label}" a všechny jeho cviky?`)) return;
    startTransition(async () => {
      const result = await removeWorkout(workoutId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Den "${label}" smazán`);
        router.refresh();
      }
    });
  }

  function handleRemoveExercise(exerciseId: string, name: string) {
    startTransition(async () => {
      const result = await removeExerciseFromWorkout(exerciseId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${name} odebrán`);
        router.refresh();
      }
    });
  }

  // Feature 7: Reorder exercise
  function handleReorder(exerciseId: string, direction: "up" | "down") {
    startTransition(async () => {
      const result = await reorderExercise(exerciseId, direction);
      if (result.error) {
        toast.error(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Plan header */}
      <div>
        <h2 className="text-lg font-bold">{planName}</h2>
        <p className="text-xs text-muted-foreground">
          {initialWorkouts.length} tréninkových dnů
        </p>
      </div>

      {/* Workout days */}
      {initialWorkouts
        .sort((a, b) => a.day_index - b.day_index)
        .map((workout) => (
          <Card key={workout.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <GripVertical size={14} className="text-muted-foreground" />
                  <span>{workout.day_label}</span>
                  {workout.focus && (
                    <Badge variant="secondary" className="text-[10px]">
                      {workout.focus}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {workout.target_duration_min && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock size={10} />
                      {workout.target_duration_min}min
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemoveWorkout(workout.id, workout.day_label)}
                    disabled={isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {workout.workout_exercises
                .sort((a, b) => a.order_idx - b.order_idx)
                .map((ex, idx, arr) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between py-1.5 border-b border-border last:border-0 group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {ex.exercises?.name ?? "Cvik"}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {ex.sets}×{ex.reps_low}
                        {ex.reps_high && ex.reps_high !== ex.reps_low
                          ? `-${ex.reps_high}`
                          : ""}
                        {ex.rpe_target ? ` @ RPE ${ex.rpe_target}` : ""}
                        {ex.rest_sec ? ` • ${ex.rest_sec}s` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {/* Feature 7: Reorder buttons */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleReorder(ex.id, "up")}
                        disabled={isPending || idx === 0}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                      >
                        <ArrowUp size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleReorder(ex.id, "down")}
                        disabled={isPending || idx === arr.length - 1}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                      >
                        <ArrowDown size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          handleRemoveExercise(ex.id, ex.exercises?.name ?? "cvik")
                        }
                        disabled={isPending}
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive transition-opacity"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                ))}

              {workout.workout_exercises.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-2">
                  Žádné cviky — přidej první
                </p>
              )}

              <div className="pt-2">
                <ExercisePicker
                  workoutId={workout.id}
                  nextOrderIdx={workout.workout_exercises.length}
                  onAdded={() => router.refresh()}
                />
              </div>
            </CardContent>
          </Card>
        ))}

      {/* Add day */}
      {showAddDay ? (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <p className="text-sm font-semibold">Nový tréninkový den</p>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">Název dne</label>
                <Input
                  placeholder="např. Upper A"
                  value={dayLabel}
                  onChange={(e) => setDayLabel(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Zaměření</label>
                  <Input
                    placeholder="např. Horní tělo"
                    value={dayFocus}
                    onChange={(e) => setDayFocus(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Délka (min)</label>
                  <Input
                    type="number"
                    value={dayDuration}
                    onChange={(e) => setDayDuration(e.target.value)}
                    className="h-11"
                    min={15}
                    max={180}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddDay(false)}
              >
                Zrušit
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddDay}
                disabled={isPending}
              >
                {isPending ? "Ukládám..." : "Přidat den"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAddDay(true)}
        >
          <Plus size={14} />
          Přidat tréninkový den
        </Button>
      )}
    </div>
  );
}
