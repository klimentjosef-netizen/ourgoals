import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth";
import { format } from "date-fns";
import { MorningForm } from "./morning-form";
import { EveningForm } from "./evening-form";
import { CheckinSummary } from "@/components/domain/checkin/checkin-summary";
import { CheckinHistory } from "@/components/domain/checkin/checkin-history";
import { Correlations } from "@/components/domain/checkin/correlations";
import { Sunrise, MoonStar, CheckCircle2, AlertTriangle, Clock, Flame } from "lucide-react";
import type { DailyCheckin, SleepLog, GamificationProfile } from "@/types/database";
import { getHousehold } from "@/app/(app)/partner/actions";

export interface TrackingPrefs {
  trackMood: boolean;
  trackEnergy: boolean;
  trackStress: boolean;
  trackMeditation: boolean;
  trackScreenTime: boolean;
  trackCaffeine: boolean;
  trackAlcohol: boolean;
  bedtimeTarget: string | null;
  wakeTarget: string | null;
}

function StreakBadge({ streak }: { streak: number }) {
  if (streak <= 0) return null;
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 px-3 py-1.5">
      <Flame size={18} className="text-orange-500" />
      <span className="text-sm font-bold tabular-nums text-orange-700 dark:text-orange-300">
        {streak} dní v řadě
      </span>
    </div>
  );
}

export default async function CheckinPage() {
  const user = await getAuthUser();
  const supabase = await createClient();

  const today = format(new Date(), "yyyy-MM-dd");
  const currentHour = new Date().getHours();
  const isMorning = currentHour < 14;

  // Fetch today's checkin, gamification, and tracking preferences in parallel
  const [checkinRes, gamRes, settingsRes] = await Promise.all([
    supabase
      .from("daily_checkins")
      .select("*")
      .eq("profile_id", user.id)
      .eq("date", today)
      .single(),
    supabase
      .from("gamification_profiles")
      .select("*")
      .eq("profile_id", user.id)
      .single(),
    supabase
      .from("user_settings")
      .select("track_mood, track_energy, track_stress, track_meditation, track_screen_time, track_caffeine, track_alcohol, bedtime_target, wake_target")
      .eq("profile_id", user.id)
      .single(),
  ]);

  const typedCheckin = checkinRes.data as DailyCheckin | null;
  const gamification = gamRes.data as GamificationProfile | null;
  const currentStreak = gamification?.current_streak ?? 0;

  // Build tracking preferences (defaults = track everything)
  const prefs: TrackingPrefs = {
    trackMood: settingsRes.data?.track_mood ?? true,
    trackEnergy: settingsRes.data?.track_energy ?? true,
    trackStress: settingsRes.data?.track_stress ?? true,
    trackMeditation: settingsRes.data?.track_meditation ?? false,
    trackScreenTime: settingsRes.data?.track_screen_time ?? false,
    trackCaffeine: settingsRes.data?.track_caffeine ?? false,
    trackAlcohol: settingsRes.data?.track_alcohol ?? false,
    bedtimeTarget: settingsRes.data?.bedtime_target ?? null,
    wakeTarget: settingsRes.data?.wake_target ?? null,
  };

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

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={24} className="text-green-500" />
            <h1 className="text-2xl font-bold">Dnešní check-in hotový!</h1>
          </div>
          <StreakBadge streak={currentStreak} />
        </div>
        <CheckinSummary
          checkin={typedCheckin!}
          sleepLog={(sleepLog as SleepLog) ?? null}
          gamification={gamification}
        />
        <CheckinHistory userId={user.id} />
        <Correlations userId={user.id} />
      </div>
    );
  }

  // Determine which form to show
  if (!morningDone) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sunrise size={24} className="text-amber-500" />
            <h1 className="text-2xl font-bold">Ranní check-in</h1>
          </div>
          <StreakBadge streak={currentStreak} />
        </div>
        {!isMorning && (
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-3 text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            Je odpoledne, ale ranní check-in jsi ještě neudělal. Vyplň ho teď!
          </div>
        )}
        <MorningForm userId={user.id} trackingPrefs={prefs} />
        <CheckinHistory userId={user.id} />
        <Correlations userId={user.id} />
      </div>
    );
  }

  // Morning done, evening not done
  const householdData = await getHousehold(user.id);
  const hasHousehold = !!householdData?.household;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MoonStar size={24} className="text-indigo-500" />
          <h1 className="text-2xl font-bold">Večerní check-in</h1>
        </div>
        <StreakBadge streak={currentStreak} />
      </div>
      {isMorning && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
          <Clock size={16} className="shrink-0" />
          Ranní check-in hotový! Večerní bude relevantnější odpoledne.
        </div>
      )}
      <EveningForm hasHousehold={hasHousehold} userId={user.id} trackingPrefs={prefs} />
      <CheckinHistory userId={user.id} />
      <Correlations userId={user.id} />
    </div>
  );
}
