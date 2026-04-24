"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, ArrowRight } from "lucide-react";
import Link from "next/link";
import { EVENT_KIND_CONFIG, type EventKind } from "@/types/calendar";

interface CalendarWidgetProps {
  events: Array<{
    id: string;
    title: string;
    kind: string;
    starts_at: string | null;
  }>;
}

function formatTime(isoString: string | null): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function CalendarWidget({ events }: CalendarWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays size={16} className="text-blue-500" />
            Dnešní události
          </CardTitle>
          <Link
            href="/calendar"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Kalendář
            <ArrowRight size={12} />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Žádné dnešní eventy
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => {
              const kindConfig =
                EVENT_KIND_CONFIG[event.kind as EventKind] ??
                EVENT_KIND_CONFIG.custom;
              return (
                <div key={event.id} className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full shrink-0 ${kindConfig.color.replace("text-", "bg-")}`}
                  />
                  <span className="text-sm truncate flex-1">
                    {event.title}
                  </span>
                  {event.starts_at && (
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                      {formatTime(event.starts_at)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
