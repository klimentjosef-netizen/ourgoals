"use client";

import { Card } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";

export function TrainingDayBanner() {
  return (
    <Card className="p-3 border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
      <div className="flex items-center gap-2">
        <Dumbbell size={16} className="text-green-600 dark:text-green-400 shrink-0" />
        <div>
          <p className="text-xs font-semibold">Tréninkový den!</p>
          <p className="text-[10px] text-muted-foreground">
            Doporučujeme +30g sacharidů navíc pro lepší výkon a regeneraci.
          </p>
        </div>
      </div>
    </Card>
  );
}
