"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { GOAL_AREAS, GOAL_TYPES } from "@/types/goals";

interface GoalsFilterBarProps {
  currentArea: string;
  currentType: string;
}

export function GoalsFilterBar({
  currentArea,
  currentType,
}: GoalsFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    router.push(qs ? `/goals?${qs}` : "/goals");
  }

  return (
    <div className="space-y-3">
      {/* Area filter — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        <button
          onClick={() => setFilter("area", "all")}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
            currentArea === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:border-primary/30"
          )}
        >
          Vše
        </button>
        {GOAL_AREAS.map((area) => (
          <button
            key={area.id}
            onClick={() => setFilter("area", area.id)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border flex items-center gap-1",
              currentArea === area.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/30"
            )}
          >
            <span>{area.emoji}</span>
            <span>{area.label}</span>
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        <button
          onClick={() => setFilter("type", "all")}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
            currentType === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:border-primary/30"
          )}
        >
          Vše
        </button>
        {GOAL_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setFilter("type", type.id)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border flex items-center gap-1",
              currentType === type.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/30"
            )}
          >
            <span>{type.emoji}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
