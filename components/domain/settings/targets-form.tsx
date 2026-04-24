"use client";

import { useState, useTransition } from "react";
import { updateTargets } from "@/app/(app)/settings/actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const DAYS = [
  { value: 1, label: "Po" },
  { value: 2, label: "Út" },
  { value: 3, label: "St" },
  { value: 4, label: "Čt" },
  { value: 5, label: "Pá" },
  { value: 6, label: "So" },
  { value: 0, label: "Ne" },
];

interface TargetsFormProps {
  tdeeOverride: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  bedtimeTarget: string | null;
  wakeTarget: string | null;
  workDays: number[];
}

export function TargetsForm({
  tdeeOverride,
  proteinG,
  carbsG,
  fatG,
  bedtimeTarget,
  wakeTarget,
  workDays: initialWorkDays,
}: TargetsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [workDays, setWorkDays] = useState<number[]>(initialWorkDays);

  function toggleDay(day: number) {
    setWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleSubmit(formData: FormData) {
    formData.set("work_days", JSON.stringify(workDays));

    startTransition(async () => {
      const result = await updateTargets(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Cíle uloženy");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Makra */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Makra & kalorie</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="tdee_override" className="text-xs">
              Kalorie (kcal)
            </Label>
            <Input
              id="tdee_override"
              name="tdee_override"
              type="number"
              defaultValue={tdeeOverride ?? ""}
              placeholder="2400"
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="protein_g" className="text-xs">
              Protein (g)
            </Label>
            <Input
              id="protein_g"
              name="protein_g"
              type="number"
              defaultValue={proteinG ?? ""}
              placeholder="160"
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="carbs_g" className="text-xs">
              Sacharidy (g)
            </Label>
            <Input
              id="carbs_g"
              name="carbs_g"
              type="number"
              defaultValue={carbsG ?? ""}
              placeholder="250"
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fat_g" className="text-xs">
              Tuky (g)
            </Label>
            <Input
              id="fat_g"
              name="fat_g"
              type="number"
              defaultValue={fatG ?? ""}
              placeholder="80"
              className="h-11"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Spánek */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Spánek</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="bedtime_target" className="text-xs">
              Cíl usnutí
            </Label>
            <Input
              id="bedtime_target"
              name="bedtime_target"
              type="time"
              defaultValue={bedtimeTarget ?? ""}
              placeholder="22:30"
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wake_target" className="text-xs">
              Cíl buzení
            </Label>
            <Input
              id="wake_target"
              name="wake_target"
              type="time"
              defaultValue={wakeTarget ?? ""}
              placeholder="06:00"
              className="h-11"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Pracovní dny */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Pracovní dny</h3>
        <div className="flex gap-2 flex-wrap">
          {DAYS.map((day) => {
            const isActive = workDays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`w-11 h-11 rounded-lg text-sm font-medium transition-all border-2 ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Ukládám..." : "Uložit cíle"}
      </Button>
    </form>
  );
}
