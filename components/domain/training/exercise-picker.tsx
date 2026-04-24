"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { getExercises, addExerciseToWorkout } from "@/app/(app)/training/plan/actions";
import type { Exercise, ExerciseCategory } from "@/types/training";
import { EXERCISE_CATEGORIES } from "@/types/training";

interface Props {
  workoutId: string;
  nextOrderIdx: number;
  onAdded: () => void;
}

export function ExercisePicker({ workoutId, nextOrderIdx, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [sets, setSets] = useState("3");
  const [repsLow, setRepsLow] = useState("8");
  const [repsHigh, setRepsHigh] = useState("12");
  const [rpe, setRpe] = useState("7");
  const [rest, setRest] = useState("90");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open && exercises.length === 0) {
      getExercises().then(setExercises);
    }
  }, [open, exercises.length]);

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce(
    (acc, ex) => {
      const cat = ex.category as ExerciseCategory;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(ex);
      return acc;
    },
    {} as Record<ExerciseCategory, Exercise[]>
  );

  function handleSelect(ex: Exercise) {
    setSelected(ex);
  }

  function handleSubmit() {
    if (!selected) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("exercise_id", selected.id);
      fd.set("order_idx", String(nextOrderIdx));
      fd.set("sets", sets);
      fd.set("reps_low", repsLow);
      fd.set("reps_high", repsHigh);
      fd.set("rpe_target", rpe);
      fd.set("rest_sec", rest);

      const result = await addExerciseToWorkout(workoutId, fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${selected.name} přidán`);
        setSelected(null);
        setSearch("");
        setOpen(false);
        onAdded();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="w-full">
            <Plus size={14} />
            Přidat cvik
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selected ? selected.name : "Vybrat cvik"}
          </DialogTitle>
        </DialogHeader>

        {!selected ? (
          <div className="space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Hledat cvik..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-8"
              />
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {(Object.keys(grouped) as ExerciseCategory[]).map((cat) => (
                <div key={cat}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    {EXERCISE_CATEGORIES[cat]}
                  </p>
                  <div className="space-y-0.5">
                    {grouped[cat].map((ex) => (
                      <button
                        key={ex.id}
                        onClick={() => handleSelect(ex)}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-accent text-sm transition-colors"
                      >
                        <span className="font-medium">{ex.name}</span>
                        {ex.primary_muscle && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {ex.primary_muscle}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Žádné cviky nenalezeny
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {EXERCISE_CATEGORIES[selected.category]}
              </Badge>
              {selected.equipment && (
                <span className="text-xs text-muted-foreground">{selected.equipment}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Série</label>
                <Input
                  type="number"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  className="h-11"
                  min={1}
                  max={10}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">RPE cíl</label>
                <Input
                  type="number"
                  value={rpe}
                  onChange={(e) => setRpe(e.target.value)}
                  className="h-11"
                  min={1}
                  max={10}
                  step={0.5}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Opakování od</label>
                <Input
                  type="number"
                  value={repsLow}
                  onChange={(e) => setRepsLow(e.target.value)}
                  className="h-11"
                  min={1}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Opakování do</label>
                <Input
                  type="number"
                  value={repsHigh}
                  onChange={(e) => setRepsHigh(e.target.value)}
                  className="h-11"
                  min={1}
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground">Odpočinek (s)</label>
                <Input
                  type="number"
                  value={rest}
                  onChange={(e) => setRest(e.target.value)}
                  className="h-11"
                  min={0}
                  step={15}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelected(null)}
              >
                Zpět
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={isPending}
              >
                {isPending ? "Ukládám..." : "Přidat"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
