"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { showXPToast } from "@/components/domain/gamification/xp-toast";
import { createGoal, updateGoal } from "@/app/(app)/goals/actions";
import { cn } from "@/lib/utils";
import {
  getGoalTypeConfig,
  getGoalAreaConfig,
  GOAL_FREQUENCIES,
  CHALLENGE_PRESETS,
  type GoalType,
  type GoalArea,
} from "@/types/goals";
import type { Goal } from "@/types/database";

interface GoalFormProps {
  goalType: GoalType;
  goalArea: GoalArea;
  goal?: Goal;
}

type FormState = {
  error?: string;
  goal?: Goal;
  xpAwarded?: number;
  leveledUp?: boolean;
  newLevel?: number;
  newTitle?: string;
  achievementsUnlocked?: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    xp_reward: number;
  }>;
  success?: boolean;
  suggestHabit?: boolean;
} | null;

export function GoalForm({ goalType, goalArea, goal }: GoalFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const isEditing = !!goal;

  const typeConfig = getGoalTypeConfig(goalType);
  const areaConfig = getGoalAreaConfig(goalArea);

  const [frequency, setFrequency] = useState<string>(goal?.frequency ?? "daily");
  const [challengeDays, setChallengeDays] = useState<number>(
    goal?.challenge_days ?? 30
  );
  const [customChallenge, setCustomChallenge] = useState(false);

  async function formAction(
    _prevState: FormState,
    formData: FormData
  ): Promise<FormState> {
    try {
      // Inject type/area into formData
      formData.set("goal_type", goalType);
      formData.set("area", goalArea);

      if (goalType === "habit") {
        formData.set("frequency", frequency);
      }

      if (goalType === "challenge") {
        formData.set("challenge_days", String(challengeDays));
      }

      if (isEditing) {
        const result = await updateGoal(goal.id, formData);
        if (result.error) {
          return { error: result.error };
        }
        return { success: true };
      } else {
        const result = await createGoal(formData);
        if (result.error) {
          return { error: result.error };
        }
        return result;
      }
    } catch {
      return { error: "Neočekávaná chyba" };
    }
  }

  const [state, dispatch, isPending] = useActionState(formAction, null);

  useEffect(() => {
    if (!state) return;

    if (state.error) {
      toast.error(state.error);
      return;
    }

    if (state.xpAwarded) {
      showXPToast(state.xpAwarded, "Nový cíl vytvořen");
    }

    if (state.leveledUp && state.newLevel && state.newTitle) {
      toast.success(`Level Up! Lv.${state.newLevel} ${state.newTitle}`);
    }

    if (isEditing) {
      toast.success("Cíl aktualizován");
      router.push(`/goals/${goal.id}`);
    } else {
      toast.success("Cíl vytvořen!");

      // Feature 3: Suggest adding a habit for measurable goals
      if (state.suggestHabit) {
        toast("Chceš přidat návyk, který ti s tímto cílem pomůže?", {
          duration: 8000,
          action: {
            label: "Přidat návyk",
            onClick: () => router.push("/goals"),
          },
        });
      }

      router.push("/goals");
    }
  }, [state, router, isEditing, goal?.id]);

  return (
    <Card className="p-6">
      {/* Type & area badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{typeConfig.emoji}</span>
        <span className="text-sm font-semibold">{typeConfig.label}</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-lg">{areaConfig.emoji}</span>
        <span className={cn("text-sm font-semibold", areaConfig.color)}>
          {areaConfig.label}
        </span>
      </div>

      {/* Shared goal notice */}
      {goalType === "shared" && (
        <div className="mb-4 p-3 rounded-lg bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800">
          <p className="text-sm text-pink-700 dark:text-pink-300 flex items-center gap-2">
            <span className="text-lg">👫</span>
            Tento cíl bude sdílený s partnerem. Oba budete vidět pokrok.
          </p>
        </div>
      )}

      <form ref={formRef} action={dispatch} className="space-y-4">
        {/* Title — all types */}
        <div className="space-y-2">
          <Label htmlFor="title">Název cíle *</Label>
          <Input
            id="title"
            name="title"
            required
            className="h-11"
            placeholder={
              goalType === "measurable"
                ? "Např. Zhubnout 5 kg"
                : goalType === "habit"
                ? "Např. Cvičit 4× týdně"
                : goalType === "oneoff"
                ? "Např. Udělat certifikaci"
                : goalType === "challenge"
                ? "Např. 30 dní bez cukru"
                : "Např. Ušetřit 100 000 Kč společně"
            }
            defaultValue={goal?.title ?? ""}
          />
        </div>

        {/* === MEASURABLE fields === */}
        {goalType === "measurable" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="metric">Metrika *</Label>
              <Input
                id="metric"
                name="metric"
                required
                className="h-11"
                placeholder="Např. kg, km, Kč, min"
                defaultValue={goal?.metric ?? ""}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_value">Počáteční hodnota</Label>
                <Input
                  id="start_value"
                  name="start_value"
                  type="number"
                  step="any"
                  className="h-11"
                  placeholder="0"
                  defaultValue={goal?.start_value ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_value">Cílová hodnota *</Label>
                <Input
                  id="target_value"
                  name="target_value"
                  type="number"
                  step="any"
                  required
                  className="h-11"
                  placeholder="10"
                  defaultValue={goal?.target_value ?? ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_date">Cílové datum</Label>
              <Input
                id="target_date"
                name="target_date"
                type="date"
                className="h-11"
                defaultValue={goal?.target_date ?? ""}
              />
            </div>
          </>
        )}

        {/* === HABIT fields === */}
        {goalType === "habit" && (
          <>
            <div className="space-y-2">
              <Label>Frekvence</Label>
              <Select
                value={frequency}
                onValueChange={(val) => {
                  if (val !== null) setFrequency(val);
                }}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Vyber frekvenci" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency_target">
                Počet opakování za období
              </Label>
              <Input
                id="frequency_target"
                name="frequency_target"
                type="number"
                min={1}
                max={30}
                className="h-11"
                placeholder="Např. 4"
                defaultValue={goal?.frequency_target ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Popis (volitelný)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Co přesně chceš dělat?"
                rows={3}
                defaultValue={goal?.description ?? ""}
              />
            </div>
          </>
        )}

        {/* === ONEOFF fields === */}
        {goalType === "oneoff" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="description">Popis</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Co přesně chceš splnit?"
                rows={3}
                defaultValue={goal?.description ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_date">Deadline (volitelné)</Label>
              <Input
                id="target_date"
                name="target_date"
                type="date"
                className="h-11"
                defaultValue={goal?.target_date ?? ""}
              />
            </div>
          </>
        )}

        {/* === CHALLENGE fields === */}
        {goalType === "challenge" && (
          <>
            <div className="space-y-2">
              <Label>Délka challenge</Label>
              <div className="grid grid-cols-4 gap-2">
                {CHALLENGE_PRESETS.map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => {
                      setChallengeDays(preset.days);
                      setCustomChallenge(false);
                    }}
                    className={cn(
                      "rounded-lg border-2 py-2 px-3 text-sm font-semibold transition-all",
                      "hover:border-primary/50 active:scale-95",
                      challengeDays === preset.days && !customChallenge
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCustomChallenge(true)}
                  className={cn(
                    "rounded-lg border-2 py-2 px-3 text-sm font-semibold transition-all",
                    "hover:border-primary/50 active:scale-95",
                    customChallenge
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  Vlastní
                </button>
              </div>

              {customChallenge && (
                <Input
                  type="number"
                  min={1}
                  max={365}
                  className="h-11 mt-2"
                  placeholder="Počet dní"
                  value={challengeDays}
                  onChange={(e) =>
                    setChallengeDays(Number(e.target.value) || 30)
                  }
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Popis (volitelný)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Pravidla tvé challenge..."
                rows={3}
                defaultValue={goal?.description ?? ""}
              />
            </div>
          </>
        )}

        {/* === SHARED fields — same as measurable + note === */}
        {goalType === "shared" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="description">Popis</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Co chcete společně dosáhnout?"
                rows={3}
                defaultValue={goal?.description ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metric">Metrika (volitelná)</Label>
              <Input
                id="metric"
                name="metric"
                className="h-11"
                placeholder="Např. Kč, kg, dny"
                defaultValue={goal?.metric ?? ""}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_value">Počáteční hodnota</Label>
                <Input
                  id="start_value"
                  name="start_value"
                  type="number"
                  step="any"
                  className="h-11"
                  placeholder="0"
                  defaultValue={goal?.start_value ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_value">Cílová hodnota</Label>
                <Input
                  id="target_value"
                  name="target_value"
                  type="number"
                  step="any"
                  className="h-11"
                  placeholder="10"
                  defaultValue={goal?.target_value ?? ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_date">Cílové datum</Label>
              <Input
                id="target_date"
                name="target_date"
                type="date"
                className="h-11"
                defaultValue={goal?.target_date ?? ""}
              />
            </div>
          </>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending
              ? "Ukládám..."
              : isEditing
              ? "Uložit změny"
              : `Vytvořit ${typeConfig.label.toLowerCase()} cíl`}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Zrušit
          </Button>
        </div>
      </form>
    </Card>
  );
}
