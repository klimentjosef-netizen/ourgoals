"use client";

import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { Pencil, Trash2, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FounderLogEntry as FounderLogEntryType } from "@/types/founder-log";
import { FOUNDER_LOG_CATEGORIES } from "@/types/founder-log";

interface LogEntryProps {
  entry: FounderLogEntryType;
  onEdit?: (entry: FounderLogEntryType) => void;
  onDelete?: (id: string) => void;
}

export function LogEntry({ entry, onEdit, onDelete }: LogEntryProps) {
  const categoryInfo = FOUNDER_LOG_CATEGORIES.find(
    (c) => c.value === entry.category
  );

  const priority = entry.priority_1_5 ?? 0;

  return (
    <Card className="p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs font-mono">
            {format(new Date(entry.date), "d. MMM yyyy", { locale: cs })}
          </Badge>
          {categoryInfo && (
            <Badge variant="secondary" className={categoryInfo.color}>
              {categoryInfo.label}
            </Badge>
          )}
          {priority > 0 && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < priority
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  }
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground"
              onClick={() => onEdit(entry)}
            >
              <Pencil size={14} />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(entry.id)}
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </div>

      <p className="font-semibold text-sm leading-snug">{entry.insight}</p>

      {entry.notes && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {entry.notes}
        </p>
      )}
    </Card>
  );
}
