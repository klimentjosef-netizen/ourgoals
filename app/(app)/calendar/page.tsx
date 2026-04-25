import { startOfWeek, endOfWeek, format } from "date-fns";
import { getAuthUser } from "@/lib/auth";
import { getCalendarEvents, getUserModuleSettings } from "@/app/(app)/calendar/actions";
import { detectConflicts } from "@/lib/calendar/conflicts";
import { CalendarView } from "@/app/(app)/calendar/calendar-view";

export default async function CalendarPage() {
  const user = await getAuthUser();

  // Compute current week range (Monday to Sunday)
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const rangeStart = format(weekStart, "yyyy-MM-dd'T'00:00:00");
  const rangeEnd = format(weekEnd, "yyyy-MM-dd'T'23:59:59");

  // Fetch events and module settings in parallel
  const [{ events }, moduleConfig] = await Promise.all([
    getCalendarEvents(user.id, rangeStart, rangeEnd),
    getUserModuleSettings(user.id).catch(() => ({
      enableSleep: false,
      bedtimeTarget: null,
      wakeTarget: null,
      enableCheckin: false,
    })),
  ]);

  const conflicts = detectConflicts(events);
  // Serialize Map for client component
  const conflictsArray = Array.from(conflicts.entries());

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 space-y-2">
      <h1 className="text-2xl font-bold">Kalendář</h1>
      <CalendarView
        initialEvents={events}
        initialConflicts={conflictsArray}
        initialWeekStart={format(weekStart, "yyyy-MM-dd")}
        userId={user.id}
        moduleConfig={moduleConfig}
      />
    </div>
  );
}
