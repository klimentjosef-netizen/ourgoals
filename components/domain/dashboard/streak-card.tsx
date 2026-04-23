"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Flame } from "lucide-react";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakCard({ currentStreak, longestStreak }: StreakCardProps) {
  return (
    <Card>
      <CardContent className="pt-2">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-full ${
              currentStreak > 0
                ? "bg-orange-100 dark:bg-orange-950/30 text-orange-500"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Flame size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">
              {currentStreak}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                {currentStreak === 1
                  ? "den"
                  : currentStreak >= 2 && currentStreak <= 4
                    ? "dny"
                    : "dní"}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Rekord: {longestStreak}{" "}
              {longestStreak === 1
                ? "den"
                : longestStreak >= 2 && longestStreak <= 4
                  ? "dny"
                  : "dní"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
