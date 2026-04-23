"use client";

import { Badge } from "@/components/ui/badge";
import { EVENT_KIND_CONFIG, type EventKind } from "@/types/calendar";

interface EventKindBadgeProps {
  kind: EventKind;
}

export function EventKindBadge({ kind }: EventKindBadgeProps) {
  const config = EVENT_KIND_CONFIG[kind];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1 text-xs ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </Badge>
  );
}
