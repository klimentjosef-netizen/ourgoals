"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { addWaterGlass, removeWaterGlass } from "@/app/(app)/nutrition/actions";

interface WaterTrackerProps {
  initialGlasses: number;
  date: string;
  target?: number;
}

export function WaterTracker({ initialGlasses, date, target = 8 }: WaterTrackerProps) {
  const [glasses, setGlasses] = useState(initialGlasses);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      const result = await addWaterGlass(date);
      setGlasses(result.glasses);
    });
  }

  function handleRemove() {
    if (glasses <= 0) return;
    startTransition(async () => {
      const result = await removeWaterGlass(date);
      setGlasses(result.glasses);
    });
  }

  const percentage = Math.min((glasses / target) * 100, 100);

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💧</span>
          <div>
            <p className="text-xs font-semibold">Voda</p>
            <p className="text-[10px] text-muted-foreground">
              {glasses}/{target} skleniček
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Visual glasses */}
          <div className="flex gap-0.5 mr-2">
            {Array.from({ length: target }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-4 rounded-sm transition-colors ${
                  i < glasses
                    ? "bg-blue-500"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleRemove}
            disabled={isPending || glasses <= 0}
          >
            <Minus size={12} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleAdd}
            disabled={isPending}
          >
            <Plus size={12} />
          </Button>
        </div>
      </div>
      {/* Progress bar */}
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted mt-2">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </Card>
  );
}
