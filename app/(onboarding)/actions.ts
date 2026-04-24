"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXP } from "@/lib/logic/xp";
import { DEV_MODE, MOCK_USER_ID } from "@/lib/dev/mock-user";
import type { OnboardingData } from "@/types/onboarding";

export async function completeOnboarding(
  data: OnboardingData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    let userId: string;
    if (DEV_MODE) {
      userId = MOCK_USER_ID;
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: "Nepřihlášen" };
      userId = user.id;
    }

    // 1. Update profile
    await supabase
      .from("profiles")
      .update({
        display_name: data.profile.displayName,
        date_of_birth: data.profile.dateOfBirth || null,
        timezone: data.profile.timezone,
        onboarding_completed: true,
      })
      .eq("id", userId);

    // 2. Build user_settings update
    const settings: Record<string, unknown> = {
      active_modules: data.selectedModules,
      coach_tone: data.coachTone,
    };

    // Sleep module
    const sleepSetup = data.moduleSetups.sleep_wellbeing;
    if (sleepSetup) {
      settings.bedtime_target = sleepSetup.bedtimeTarget || null;
      settings.wake_target = sleepSetup.wakeTarget || null;
      settings.track_mood = sleepSetup.trackMood ?? true;
      settings.track_energy = sleepSetup.trackEnergy ?? true;
      settings.track_stress = sleepSetup.trackStress ?? true;
    }

    // Nutrition module
    const nutritionSetup = data.moduleSetups.nutrition;
    if (nutritionSetup) {
      settings.protein_g = nutritionSetup.proteinG || null;
      settings.carbs_g = nutritionSetup.carbsG || null;
      settings.fat_g = nutritionSetup.fatG || null;
      settings.tdee_override = nutritionSetup.targetKcal || null;
    }

    // Training module
    const trainingSetup = data.moduleSetups.training;
    if (trainingSetup) {
      settings.training_days_per_week = trainingSetup.daysPerWeek || null;
      settings.experience_level = trainingSetup.experienceLevel || null;
    }

    // Work module
    const workSetup = data.moduleSetups.work_focus;
    if (workSetup) {
      settings.work_start_time = workSetup.workStartTime || null;
      settings.work_end_time = workSetup.workEndTime || null;
      settings.deep_work_hours = workSetup.deepWorkHours || null;
    }

    // Calendar module
    const calendarSetup = data.moduleSetups.calendar;
    if (calendarSetup) {
      settings.work_days = calendarSetup.workDays || [1, 2, 3, 4, 5];
    }

    await supabase
      .from("user_settings")
      .update(settings)
      .eq("profile_id", userId);

    // 3. Body metrics (training module)
    if (
      trainingSetup &&
      (trainingSetup.weightKg || trainingSetup.bodyFatPct)
    ) {
      await supabase.from("body_metrics").upsert(
        {
          profile_id: userId,
          date: new Date().toISOString().split("T")[0],
          weight_kg: trainingSetup.weightKg || null,
          body_fat_pct: trainingSetup.bodyFatPct || null,
          visibility: "private",
        },
        { onConflict: "profile_id,date" }
      );
    }

    // 4. First goal
    const goalsSetup = data.moduleSetups.goals_habits;
    if (goalsSetup?.title) {
      await supabase.from("goals").insert({
        profile_id: userId,
        title: goalsSetup.title,
        description: goalsSetup.description || null,
        metric: goalsSetup.metric || null,
        target_value: goalsSetup.targetValue || null,
        start_value: goalsSetup.startValue || null,
        current_value: goalsSetup.startValue || null,
        target_date: goalsSetup.targetDate || null,
        status: "active",
        visibility: "private",
      });
    }

    // 5. Default habits
    const habits: {
      profile_id: string;
      title: string;
      xp_value: number;
      sort_order: number;
    }[] = [];
    let order = 0;

    if (data.selectedModules.includes("sleep_wellbeing")) {
      habits.push({
        profile_id: userId,
        title: "Ranní check-in",
        xp_value: 10,
        sort_order: order++,
      });
      habits.push({
        profile_id: userId,
        title: "Večerní check-in",
        xp_value: 10,
        sort_order: order++,
      });
    }
    if (data.selectedModules.includes("goals_habits")) {
      habits.push({
        profile_id: userId,
        title: "Pracuj na svém cíli",
        xp_value: 15,
        sort_order: order++,
      });
    }
    if (data.selectedModules.includes("training")) {
      habits.push({
        profile_id: userId,
        title: "Odcvič trénink",
        xp_value: 30,
        sort_order: order++,
      });
    }
    if (data.selectedModules.includes("nutrition")) {
      habits.push({
        profile_id: userId,
        title: "Zaloguj jídla",
        xp_value: 20,
        sort_order: order++,
      });
    }
    if (data.selectedModules.includes("sleep_wellbeing")) {
      habits.push({
        profile_id: userId,
        title: "Kvalitní spánek",
        xp_value: 15,
        sort_order: order++,
      });
    }

    if (habits.length > 0) {
      await supabase.from("daily_habits").insert(habits);
    }

    // 6. Award XP for onboarding
    try {
      await awardXP(
        supabase,
        userId,
        50,
        "Onboarding dokončen",
        "onboarding"
      );
    } catch {
      // non-critical
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Něco se pokazilo. Zkus to znovu.",
    };
  }
}
