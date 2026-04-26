import { getAuthUser } from "@/lib/auth";
import { Briefcase, Clock, ListTodo, BarChart3, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  getTodayDeepWork,
  getActiveSession,
  getDeepWorkStats,
  getWorkTasks,
  getWorkSettings,
  getWeeklyProductivity,
} from "./actions";
import { DeepWorkTimer } from "@/components/domain/work/deep-work-timer";
import { TaskList } from "@/components/domain/work/task-list";
import { ProductivityChart } from "@/components/domain/work/productivity-chart";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

export default async function WorkPage() {
  const user = await getAuthUser();

  const [todaySessions, activeSession, stats, tasks, settings, weekly] = await Promise.all([
    getTodayDeepWork(user.id),
    getActiveSession(user.id),
    getDeepWorkStats(user.id, 7),
    getWorkTasks(user.id),
    getWorkSettings(user.id),
    getWeeklyProductivity(user.id),
  ]);

  const todayMinutes = todaySessions
    .filter((s) => s.ended_at)
    .reduce((sum, s) => sum + (s.actual_minutes ?? 0), 0);
  const targetMinutes = (settings.deepWorkHours ?? 4) * 60;
  const progressPct = targetMinutes > 0 ? Math.min(100, Math.round((todayMinutes / targetMinutes) * 100)) : 0;

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const overdueTasks = tasks.filter(
    (t) => t.due_date && t.status !== "done" && t.due_date < format(new Date(), "yyyy-MM-dd")
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase size={24} className="text-primary" />
          <h1 className="text-xl font-bold">Práce & Focus</h1>
        </div>
        <Link href="/founder-log">
          <Button variant="outline" size="sm">
            <FileText size={14} />
            Deník
          </Button>
        </Link>
      </div>

      {/* Deep Work Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Clock size={14} />
          Deep Work
        </h2>

        {/* Timer */}
        <DeepWorkTimer
          activeSession={activeSession}
          targetMinutes={targetMinutes}
          todayMinutes={todayMinutes}
        />

        {/* Today's progress */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Dnešní deep work</span>
              <span className="text-sm font-bold tabular-nums">
                {Math.round(todayMinutes)} / {targetMinutes} min
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
              <span>{progressPct}%</span>
              <span>Cíl: {settings.deepWorkHours}h denně</span>
            </div>
          </CardContent>
        </Card>

        {/* Today's sessions */}
        {todaySessions.filter((s) => s.ended_at).length > 0 && (
          <div className="space-y-1.5">
            {todaySessions
              .filter((s) => s.ended_at)
              .map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {s.task_description || "Deep work blok"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.actual_minutes} min • Focus: {s.focus_score_1_10 ?? "–"}/10
                      {s.interruptions > 0 && ` • ${s.interruptions} přerušení`}
                    </p>
                  </div>
                  {s.focus_score_1_10 && s.focus_score_1_10 >= 8 && (
                    <Badge variant="default" className="text-[10px]">
                      Skvělý focus
                    </Badge>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Week stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="pt-3 pb-3 text-center">
              <p className="text-2xl font-bold tabular-nums">
                {Math.round(stats.totalMinutes / 60 * 10) / 10}h
              </p>
              <p className="text-[10px] text-muted-foreground">Tento týden</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 pb-3 text-center">
              <p className="text-2xl font-bold tabular-nums">
                {stats.avgFocusScore || "–"}
              </p>
              <p className="text-[10px] text-muted-foreground">Prům. focus</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 pb-3 text-center">
              <p className="text-2xl font-bold tabular-nums">
                {stats.sessionCount}
              </p>
              <p className="text-[10px] text-muted-foreground">Bloků</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Tasks Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <ListTodo size={14} />
            Úkoly
          </h2>
          {overdueTasks.length > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              {overdueTasks.length} po termínu
            </Badge>
          )}
        </div>

        <TaskList
          todoTasks={todoTasks}
          inProgressTasks={inProgressTasks}
          doneTasks={doneTasks}
        />
      </section>

      <Separator />

      {/* Productivity Chart */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <BarChart3 size={14} />
          Produktivita tento týden
        </h2>
        <ProductivityChart
          deepWork={weekly.deepWork}
          tasksCompleted={weekly.tasksCompleted}
        />
      </section>
    </div>
  );
}
