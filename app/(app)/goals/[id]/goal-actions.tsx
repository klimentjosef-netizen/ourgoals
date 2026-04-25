"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { showXPToast } from "@/components/domain/gamification/xp-toast";
import { completeGoal, pauseGoal, deleteGoal } from "@/app/(app)/goals/actions";
import { CheckCircle, Pause, Trash2, PartyPopper, Plus, ArrowLeft } from "lucide-react";

interface GoalActionsProps {
  goalId: string;
}

export function GoalActions({ goalId }: GoalActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationXP, setCelebrationXP] = useState(0);

  async function handleComplete() {
    setIsLoading("complete");
    try {
      const result = await completeGoal(goalId);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      // Feature 5: Show celebration dialog
      if (result.celebration) {
        setCelebrationXP(result.xpAwarded ?? 0);
        setShowCelebration(true);
      } else {
        toast.success("Cíl dokončen! Gratulace!");
      }

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
    <>
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

      {/* Feature 5: Celebration dialog */}
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="text-center sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="sr-only">Cíl splněn</DialogTitle>
            <DialogDescription className="sr-only">
              Gratulace ke splnění cíle
            </DialogDescription>
          </DialogHeader>

          {/* CSS confetti */}
          <div className="relative overflow-hidden py-6">
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 60}%`,
                    backgroundColor: [
                      "#ef4444",
                      "#f59e0b",
                      "#10b981",
                      "#3b82f6",
                      "#8b5cf6",
                      "#ec4899",
                    ][i % 6],
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`,
                    opacity: 0.8,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                <PartyPopper size={40} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Cíl splněn!</h2>
              {celebrationXP > 0 && (
                <p className="text-lg font-semibold text-yellow-500">
                  +{celebrationXP} XP
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Gratulujeme! Vydrž a nastav si další cíl.
              </p>
            </div>
          </div>

          {/* Feature 6: "Co dál?" buttons */}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/goals/new">
              <Button className="w-full sm:w-auto">
                <Plus size={16} />
                Nový cíl
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                setShowCelebration(false);
                router.push("/goals");
              }}
            >
              <ArrowLeft size={16} />
              Zpět na cíle
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
