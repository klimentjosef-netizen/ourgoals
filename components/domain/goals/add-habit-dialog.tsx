"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { createHabit } from "@/app/(app)/goals/habits/actions";
import { toast } from "sonner";
import type { Goal } from "@/types/database";

interface AddHabitDialogProps {
  goals: Goal[];
}

export function AddHabitDialog({ goals }: AddHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (selectedGoalId && selectedGoalId !== "__none__") {
        formData.set("goal_id", selectedGoalId);
      }

      const result = await createHabit(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Návyk přidán!");
      setOpen(false);
      setSelectedGoalId("");
      formRef.current?.reset();
    } catch {
      toast.error("Něco se pokazilo");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Plus size={14} />
            Přidat návyk
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Přidat návyk</DialogTitle>
          <DialogDescription>
            Vytvoř si denní návyk a získávej XP za jeho plnění.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit-title">Název návyku *</Label>
            <Input
              id="habit-title"
              name="title"
              required
              placeholder="Např. 30 min čtení"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="habit-xp">XP za splnění</Label>
            <Input
              id="habit-xp"
              name="xp_value"
              type="number"
              min={1}
              max={100}
              defaultValue={15}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label>Propojit s cílem (volitelné)</Label>
            <Select value={selectedGoalId} onValueChange={(val) => { if (val !== null) setSelectedGoalId(val); }}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Bez propojení" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Bez propojení</SelectItem>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? "Ukládám..." : "Vytvořit návyk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
