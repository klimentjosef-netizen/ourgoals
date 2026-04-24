"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Scale } from "lucide-react";
import Link from "next/link";

interface TrainingWidgetProps {
  workout: { day_label: string; focus: string | null } | null;
  latestWeight: number | null;
}

export function TrainingWidget({ workout, latestWeight }: TrainingWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Dumbbell size={16} className="text-green-500" />
          Dnešní trénink
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {workout ? (
          <div>
            <p className="text-sm font-medium">{workout.day_label}</p>
            {workout.focus && (
              <p className="text-xs text-muted-foreground">{workout.focus}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Odpočinkový den</p>
        )}

        {latestWeight != null && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Scale size={12} />
            <span>Poslední váha: {latestWeight} kg</span>
          </div>
        )}

        <Link href="/training">
          <Button variant="outline" size="sm" className="w-full">
            Začít trénink →
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
