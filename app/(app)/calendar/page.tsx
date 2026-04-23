import { redirect } from "next/navigation";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getCalendarEvents } from "@/app/(app)/calendar/actions";
import { detectConflicts } from "@/lib/calendar/conflicts";
import { CalendarView } from "@/app/(app)/calendar/calendar-view";

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Compute current week range (Monday to Sunday)
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const rangeStart = format(weekStart, "yyyy-MM-dd'T'00:00:00");
  const rangeEnd = format(weekEnd, "yyyy-MM-dd'T'23:59:59");

  const { events } = await getCalendarEvents(user.id, rangeStart, rangeEnd);

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
      />
    </div>
  );
}
