import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface WorkWidgetProps {
  todayDeepWorkMinutes: number;
  targetMinutes: number;
  overdueTasks: number;
  activeTasks: number;
}

export function WorkWidget({ todayDeepWorkMinutes, targetMinutes, overdueTasks, activeTasks }: WorkWidgetProps) {
  const progressPct = targetMinutes > 0 ? Math.min(100, Math.round((todayDeepWorkMinutes / targetMinutes) * 100)) : 0;

  return (
    <Link href="/work">
      <Card className="hover:border-primary/50 transition-colors h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Briefcase size={14} className="text-primary" />
              Práce
            </div>
            <ArrowRight size={14} className="text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Deep work progress */}
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-muted-foreground shrink-0" />
            <div className="flex-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-mono tabular-nums shrink-0">
              {Math.round(todayDeepWorkMinutes)}m
            </span>
          </div>

          {/* Task info */}
          <div className="flex items-center gap-2 text-xs">
            {overdueTasks > 0 && (
              <Badge variant="destructive" className="text-[10px] gap-0.5">
                <AlertTriangle size={8} />
                {overdueTasks} po termínu
              </Badge>
            )}
            {activeTasks > 0 && (
              <span className="text-muted-foreground">
                {activeTasks} aktivních úkolů
              </span>
            )}
            {activeTasks === 0 && overdueTasks === 0 && (
              <span className="text-muted-foreground">
                Žádné úkoly
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
