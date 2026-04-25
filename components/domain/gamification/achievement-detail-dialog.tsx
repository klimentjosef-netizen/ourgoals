"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale/cs";
import type { Achievement } from "@/types/gamification";

interface AchievementDetailDialogProps {
  achievement: Achievement | null;
  isUnlocked: boolean;
  unlockedAt: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getHintFromCondition(
  condition: Record<string, unknown>
): string {
  if (condition.streak && typeof condition.streak === "number") {
    return `Dosáhni ${condition.streak}denního streaku.`;
  }
  if (condition.total_xp && typeof condition.total_xp === "number") {
    return `Nasbírej ${condition.total_xp} XP.`;
  }
  if (
    condition.perfect_days &&
    typeof condition.perfect_days === "number"
  ) {
    return `Měj ${condition.perfect_days} perfektních dní.`;
  }
  if (condition.trainings && typeof condition.trainings === "number") {
    return `Absolvuj ${condition.trainings} tréninků.`;
  }
  if (condition.meals_logged && typeof condition.meals_logged === "number") {
    return `Zaloguj ${condition.meals_logged} jídel.`;
  }
  if (condition.goals_completed && typeof condition.goals_completed === "number") {
    return `Dokonči ${condition.goals_completed} cílů.`;
  }
  return "Pokračuj v plnění svých cílů a návyků.";
}

export function AchievementDetailDialog({
  achievement,
  isUnlocked,
  unlockedAt,
  open,
  onOpenChange,
}: AchievementDetailDialogProps) {
  if (!achievement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center text-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-2 ${
              isUnlocked ? "bg-primary/10" : "bg-muted/50"
            }`}
          >
            {isUnlocked ? (
              <span className="text-4xl">{achievement.icon || "🏆"}</span>
            ) : (
              <Lock size={28} className="text-muted-foreground" />
            )}
          </div>
          <DialogTitle className="text-lg">{achievement.name}</DialogTitle>
          <DialogDescription className="text-sm">
            {achievement.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {isUnlocked ? (
            <>
              {unlockedAt && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">
                    Odemčeno{" "}
                    {format(new Date(unlockedAt), "d. M. yyyy", {
                      locale: cs,
                    })}
                  </Badge>
                </div>
              )}
              {achievement.xp_reward > 0 && (
                <div className="flex items-center justify-center gap-1 text-yellow-600 font-mono font-bold">
                  <Sparkles size={16} />+{achievement.xp_reward} XP
                </div>
              )}
            </>
          ) : (
            <div className="text-center space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Jak odemknout
              </p>
              <p className="text-sm text-foreground">
                {getHintFromCondition(achievement.condition_json)}
              </p>
              {achievement.xp_reward > 0 && (
                <p className="text-xs text-muted-foreground">
                  Odměna: +{achievement.xp_reward} XP
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
