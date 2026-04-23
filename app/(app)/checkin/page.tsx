import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth";
import { format } from "date-fns";
import { MorningForm } from "./morning-form";
import { EveningForm } from "./evening-form";
import { CheckinSummary } from "@/components/domain/checkin/checkin-summary";
import type { DailyCheckin, SleepLog, GamificationProfile } from "@/types/database";

export default async function CheckinPage() {
  const user = await getAuthUser();
  const supabase = await createClient();

  const today = format(new Date(), "yyyy-MM-dd");
  const currentHour = new Date().getHours();
  const isMorning = currentHour < 14;

  // Fetch today's checkin
  const { data: checkin } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("profile_id", user.id)
    .eq("date", today)
    .single();

  const typedCheckin = checkin as DailyCheckin | null;

  const morningDone = typedCheckin?.morning_ritual_done ?? false;
  const eveningDone = typedCheckin?.evening_ritual_done ?? false;

  // If both done, fetch extra data for summary
  if (morningDone && eveningDone) {
    const { data: sleepLog } = await supabase
      .from("sleep_logs")
      .select("*")
      .eq("profile_id", user.id)
      .eq("date", today)
      .single();

    const { data: gamification } = await supabase
      .from("gamification_profiles")
      .select("*")
      .eq("profile_id", user.id)
      .single();

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Check-in</h1>
        <CheckinSummary
          checkin={typedCheckin!}
          sleepLog={(sleepLog as SleepLog) ?? null}
          gamification={(gamification as GamificationProfile) ?? null}
        />
      </div>
    );
  }

  // Determine which form to show
  if (!morningDone) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Check-in</h1>
        {!isMorning && (
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-3 text-sm text-yellow-800 dark:text-yellow-200">
            Je odpoledne, ale ranní check-in jsi ještě neudělal. Vyplň ho teď!
          </div>
        )}
        <MorningForm />
      </div>
    );
  }

  // Morning done, evening not done
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Check-in</h1>
      {isMorning && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-800 dark:text-blue-200">
          Ranní check-in hotový! Večerní check-in bude k dispozici odpoledne.
        </div>
      )}
      <EveningForm />
    </div>
  );
}
