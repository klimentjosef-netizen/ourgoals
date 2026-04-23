"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles } from "lucide-react";

interface UnlockedAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
}

interface AchievementUnlockDialogProps {
  achievement: UnlockedAchievement | null;
  onClose: () => void;
}

export function AchievementUnlockDialog({
  achievement,
  onClose,
}: AchievementUnlockDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (achievement) {
      setOpen(true);
    }
  }, [achievement]);

  function handleClose() {
    setOpen(false);
    onClose();
  }

  if (!achievement) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="text-center">
        <DialogHeader className="items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl mx-auto mb-2">
            {achievement.icon || <Trophy size={32} className="text-primary" />}
          </div>
          <DialogTitle className="text-lg">
            Nový úspěch odemčen!
          </DialogTitle>
          <DialogDescription className="space-y-1">
            <span className="block text-base font-semibold text-foreground">
              {achievement.name}
            </span>
            <span className="block text-sm text-muted-foreground">
              {achievement.description}
            </span>
          </DialogDescription>
        </DialogHeader>
        {achievement.xp_reward > 0 && (
          <div className="flex items-center justify-center gap-1 text-yellow-600 font-mono font-bold">
            <Sparkles size={16} />
            +{achievement.xp_reward} XP
          </div>
        )}
        <DialogFooter>
          <Button onClick={handleClose} className="w-full">
            Super!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
