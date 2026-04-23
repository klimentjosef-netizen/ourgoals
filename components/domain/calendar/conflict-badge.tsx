"use client";

import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export function ConflictBadge() {
  return (
    <Badge
      variant="outline"
      className="gap-1 text-xs border-orange-400 text-orange-400"
    >
      <AlertTriangle size={12} />
      Konflikt
    </Badge>
  );
}
