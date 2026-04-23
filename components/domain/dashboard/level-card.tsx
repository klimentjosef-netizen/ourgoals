"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getXPProgress } from "@/types/gamification";
import { Trophy } from "lucide-react";

interface LevelCardProps {
  totalXP: number;
}

export function LevelCard({ totalXP }: LevelCardProps) {
  const xp = getXPProgress(totalXP);

  return (
    <Card>
      <CardContent className="pt-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
            <Trophy size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="default">Lv. {xp.currentLevel}</Badge>
              <span className="text-sm font-medium">{xp.title}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {xp.currentXP} / {xp.nextLevelXP} XP
            </p>
          </div>
        </div>
        <Progress value={xp.percentage} />
      </CardContent>
    </Card>
  );
}
