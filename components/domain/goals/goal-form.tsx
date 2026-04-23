"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { showXPToast } from "@/components/domain/gamification/xp-toast";
import { createGoal, updateGoal } from "@/app/(app)/goals/actions";
import type { Goal } from "@/types/database";

interface GoalFormProps {
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
} | null;

export function GoalForm({ goal }: GoalFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const isEditing = !!goal;

  async function formAction(_prevState: FormState, formData: FormData): Promise<FormState> {
    try {
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
    } catch (err) {
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
      router.push("/goals");
    }
  }, [state, router, isEditing, goal?.id]);

  return (
    <Card className="p-6">
      <form ref={formRef} action={dispatch} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Název cíle *</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="Např. Zhubnout 5 kg"
            defaultValue={goal?.title ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Popis</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Proč je pro tebe tento cíl důležitý?"
            rows={3}
            defaultValue={goal?.description ?? ""}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="metric">Metrika</Label>
            <Input
              id="metric"
              name="metric"
              placeholder="Např. kg, km, min"
              defaultValue={goal?.metric ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_date">Cílové datum</Label>
            <Input
              id="target_date"
              name="target_date"
              type="date"
              defaultValue={goal?.target_date ?? ""}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_value">Počáteční</Label>
            <Input
              id="start_value"
              name="start_value"
              type="number"
              step="any"
              placeholder="0"
              defaultValue={goal?.start_value ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_value">Aktuální</Label>
            <Input
              id="current_value"
              name="current_value"
              type="number"
              step="any"
              placeholder="0"
              defaultValue={goal?.current_value ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_value">Cílová</Label>
            <Input
              id="target_value"
              name="target_value"
              type="number"
              step="any"
              placeholder="10"
              defaultValue={goal?.target_value ?? ""}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending
              ? "Ukládám..."
              : isEditing
              ? "Uložit změny"
              : "Vytvořit cíl"}
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
