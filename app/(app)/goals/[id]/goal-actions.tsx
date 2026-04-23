"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { showXPToast } from "@/components/domain/gamification/xp-toast";
import { completeGoal, pauseGoal, deleteGoal } from "@/app/(app)/goals/actions";
import { CheckCircle, Pause, Trash2 } from "lucide-react";

interface GoalActionsProps {
  goalId: string;
}

export function GoalActions({ goalId }: GoalActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  async function handleComplete() {
    setIsLoading("complete");
    try {
      const result = await completeGoal(goalId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Cíl dokončen! Gratulace!");
      if (result.xpAwarded) {
        showXPToast(result.xpAwarded, "Cíl dokončen");
      }
      if (result.leveledUp && result.newLevel && result.newTitle) {
        toast.success(`Level Up! Lv.${result.newLevel} ${result.newTitle}`);
      }
    } catch {
      toast.error("Něco se pokazilo");
    } finally {
      setIsLoading(null);
    }
  }

  async function handlePause() {
    setIsLoading("pause");
    try {
      const result = await pauseGoal(goalId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Cíl pozastaven");
    } catch {
      toast.error("Něco se pokazilo");
    } finally {
      setIsLoading(null);
    }
  }

  async function handleDelete() {
    if (!confirm("Opravdu chceš smazat tento cíl?")) return;

    setIsLoading("delete");
    try {
      const result = await deleteGoal(goalId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Cíl smazán");
      router.push("/goals");
    } catch {
      toast.error("Něco se pokazilo");
    } finally {
      setIsLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button
        onClick={handleComplete}
        disabled={isLoading !== null}
        className="flex-1"
      >
        <CheckCircle size={16} />
        {isLoading === "complete" ? "Dokončuji..." : "Dokončit cíl"}
      </Button>
      <Button
        variant="outline"
        onClick={handlePause}
        disabled={isLoading !== null}
      >
        <Pause size={16} />
        {isLoading === "pause" ? "..." : "Pozastavit"}
      </Button>
      <Button
        variant="outline"
        onClick={handleDelete}
        disabled={isLoading !== null}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 size={16} />
        {isLoading === "delete" ? "..." : "Smazat"}
      </Button>
    </div>
  );
}
