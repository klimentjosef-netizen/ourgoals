"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface GottmanScoreProps {
  ratio: number;
  gratitude: number;
  bother: number;
  request: number;
  celebrate: number;
  status: "good" | "warning" | "danger";
}

const STATUS_CONFIG = {
  good: {
    text: "Vztah v kondici",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    ring: "ring-emerald-200 dark:ring-emerald-800",
    glow: "shadow-emerald-100 dark:shadow-emerald-900/20",
  },
  warning: {
    text: "Dá se zlepšit",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    ring: "ring-amber-200 dark:ring-amber-800",
    glow: "shadow-amber-100 dark:shadow-amber-900/20",
  },
  danger: {
    text: "Věnujte tomu pozornost",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    ring: "ring-red-200 dark:ring-red-800",
    glow: "shadow-red-100 dark:shadow-red-900/20",
  },
} as const;

export function GottmanScore({
  ratio,
  gratitude,
  bother,
  request,
  celebrate,
  status,
}: GottmanScoreProps) {
  const config = STATUS_CONFIG[status];
  const displayRatio = ratio >= 99 ? "∞" : ratio.toFixed(1);

  return (
    <Card
      className={cn(
        "overflow-hidden shadow-lg",
        config.glow,
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Heart size={16} className="text-pink-500" />
          Gottman skóre (7 dní)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Big ratio display */}
        <div className="flex flex-col items-center py-4">
          <div
            className={cn(
              "flex items-center justify-center w-24 h-24 rounded-full ring-4 shadow-lg",
              config.bg,
              config.ring,
              config.glow,
            )}
          >
            <span
              className={cn(
                "text-3xl font-bold tabular-nums",
                config.color,
              )}
            >
              {displayRatio}
            </span>
          </div>
          <p className={cn("mt-3 text-sm font-semibold", config.color)}>
            {config.text}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Ideální poměr je 5:1 (pozitivní : negativní)
          </p>
        </div>

        {/* Weekly breakdown */}
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20">
            <span className="text-lg">💚</span>
            <span className="text-base font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
              {gratitude}
            </span>
            <span className="text-[10px] text-muted-foreground">Vděčnost</span>
          </div>
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/20">
            <span className="text-lg">🟡</span>
            <span className="text-base font-bold tabular-nums text-amber-700 dark:text-amber-400">
              {bother}
            </span>
            <span className="text-[10px] text-muted-foreground">Mrzelo</span>
          </div>
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/20">
            <span className="text-lg">🔵</span>
            <span className="text-base font-bold tabular-nums text-blue-700 dark:text-blue-400">
              {request}
            </span>
            <span className="text-[10px] text-muted-foreground">Přání</span>
          </div>
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/20">
            <span className="text-lg">🎉</span>
            <span className="text-base font-bold tabular-nums text-purple-700 dark:text-purple-400">
              {celebrate}
            </span>
            <span className="text-[10px] text-muted-foreground">Oslava</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
