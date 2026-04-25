"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Moon, Zap, Smile, Loader2 } from "lucide-react";
import { getCorrelationData } from "@/app/(app)/checkin/history-actions";

interface CorrelationsProps {
  userId: string;
}

interface CorrelationResult {
  highSleepAvgEnergy: number | null;
  lowSleepAvgEnergy: number | null;
  highSleepAvgMood: number | null;
  lowSleepAvgMood: number | null;
  dataPoints: number;
}

export function Correlations({ userId }: CorrelationsProps) {
  const [data, setData] = useState<CorrelationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCorrelationData(userId, 14)
      .then(setData)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp size={18} />
            Tvoje vzorce
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.dataPoints < 5) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp size={18} />
            Tvoje vzorce
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Potřebujeme víc dat. Pokračuj v check-inech!
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Alespoň 5 dní pro smysluplné vzorce ({data?.dataPoints ?? 0}/5)
          </p>
        </CardContent>
      </Card>
    );
  }

  const insights: { icon: React.ReactNode; text: string; color: string }[] = [];

  if (data.highSleepAvgEnergy != null) {
    insights.push({
      icon: <Moon size={14} className="text-indigo-400 shrink-0" />,
      text: `Když spíš 7+ hodin, tvoje energie je průměrně ${data.highSleepAvgEnergy}/10`,
      color: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800",
    });
  }

  if (data.lowSleepAvgEnergy != null) {
    insights.push({
      icon: <Zap size={14} className="text-red-400 shrink-0" />,
      text: `Když spíš méně než 6h, energie klesá na ${data.lowSleepAvgEnergy}/10`,
      color: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
    });
  }

  if (data.highSleepAvgMood != null && data.lowSleepAvgMood != null) {
    const diff = data.highSleepAvgMood - data.lowSleepAvgMood;
    if (diff > 0.5) {
      insights.push({
        icon: <Smile size={14} className="text-amber-500 shrink-0" />,
        text: `Dobrý spánek zvyšuje náladu o ${diff.toFixed(1)} bodu (${data.lowSleepAvgMood} → ${data.highSleepAvgMood})`,
        color: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
      });
    }
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp size={18} />
            Tvoje vzorce
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Zatím nemáme dost variací v datech. Pokračuj v check-inech!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp size={18} />
          Tvoje vzorce
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`rounded-lg border p-3 flex items-start gap-2.5 ${insight.color}`}
          >
            {insight.icon}
            <p className="text-sm">{insight.text}</p>
          </div>
        ))}
        <p className="text-[10px] text-muted-foreground text-center pt-1">
          Na základě posledních 14 dní ({data.dataPoints} záznamů)
        </p>
      </CardContent>
    </Card>
  );
}
