import { startOfWeek, endOfWeek, format } from "date-fns";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCalendarEvents, getUserModuleSettings } from "@/app/(app)/calendar/actions";
import { detectConflicts } from "@/lib/calendar/conflicts";
import { CalendarView } from "@/app/(app)/calendar/calendar-view";

export default async function CalendarPage() {
  const user = await getAuthUser();
  const supabase = await createClient();

  // Compute current week range (Monday to Sunday)
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const rangeStart = format(weekStart, "yyyy-MM-dd'T'00:00:00");
  const rangeEnd = format(weekEnd, "yyyy-MM-dd'T'23:59:59");

  // Fetch events, module settings, and extended work/training config in parallel
  const [{ events }, moduleConfig, settingsRes, workoutsRes] = await Promise.all([
    getCalendarEvents(user.id, rangeStart, rangeEnd),
    getUserModuleSettings(user.id).catch(() => ({
      enableSleep: false,
      bedtimeTarget: null,
      wakeTarget: null,
      enableCheckin: false,
    })),
    supabase
      .from("user_settings")
      .select("work_days, work_start_time, work_end_time, deep_work_hours, prefer_deep_work, prefer_training, active_modules")
      .eq("profile_id", user.id)
      .single(),
    supabase
      .from("workouts")
      .select("day_index, day_label, focus")
      .eq("profile_id", user.id)
      .order("day_index", { ascending: true }),
  ]);

  const conflicts = detectConflicts(events);
  const conflictsArray = Array.from(conflicts.entries());

  // Build extended module config
  const activeModules = (settingsRes.data?.active_modules as string[] | null) ?? [];
  const hasTraining = activeModules.includes("training");
  const hasWork = activeModules.includes("work_focus");

  const extendedConfig = {
    ...moduleConfig,
    // Training days from workout plan
    trainingDays: hasTraining && workoutsRes.data ? workoutsRes.data.map((w) => ({
      dayIndex: w.day_index as number,
      dayLabel: w.day_label as string,
      focus: (w.focus as string) ?? null,
    })) : undefined,
    preferTrainingTime: settingsRes.data?.prefer_training ?? undefined,
    // Work schedule
    workDays: hasWork ? (settingsRes.data?.work_days as number[] | null) ?? undefined : undefined,
    workStartTime: hasWork ? (settingsRes.data?.work_start_time as string | null) ?? undefined : undefined,
    workEndTime: hasWork ? (settingsRes.data?.work_end_time as string | null) ?? undefined : undefined,
    deepWorkHours: hasWork ? (settingsRes.data?.deep_work_hours as number | null) ?? undefined : undefined,
    preferDeepWork: hasWork ? (settingsRes.data?.prefer_deep_work as string | null) ?? undefined : undefined,
  };

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 space-y-2">
      <h1 className="text-2xl font-bold">Kalendář</h1>
      <CalendarView
        initialEvents={events}
        initialConflicts={conflictsArray}
        initialWeekStart={format(weekStart, "yyyy-MM-dd")}
        userId={user.id}
        moduleConfig={extendedConfig}
      />
    </div>
  );
}
