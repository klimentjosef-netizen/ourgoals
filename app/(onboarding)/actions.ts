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
        locale: data.profile.locale || "cs",
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
      settings.track_meditation = sleepSetup.trackMeditation ?? false;
      settings.track_screen_time = sleepSetup.trackScreenTime ?? false;
      settings.track_caffeine = sleepSetup.trackCaffeine ?? false;
      settings.track_alcohol = sleepSetup.trackAlcohol ?? false;
    }

    // Nutrition module
    const nutritionSetup = data.moduleSetups.nutrition;
    if (nutritionSetup) {
      settings.protein_g = nutritionSetup.proteinG || null;
      settings.carbs_g = nutritionSetup.carbsG || null;
      settings.fat_g = nutritionSetup.fatG || null;
      settings.tdee_override = nutritionSetup.targetKcal || null;
      settings.nutrition_tracking_level = nutritionSetup.trackingLevel || "macros";
      settings.allergies = nutritionSetup.allergies || [];
      settings.diet_type = nutritionSetup.dietType || "none";
      settings.meals_per_day = nutritionSetup.mealsPerDay || 3;
    }

    // Training module
    const trainingSetup = data.moduleSetups.training;
    if (trainingSetup) {
      settings.training_days_per_week = trainingSetup.daysPerWeek || null;
      settings.experience_level = trainingSetup.experienceLevel || null;
      settings.training_location = trainingSetup.trainingLocation || "gym";
      settings.training_goal = trainingSetup.trainingGoal || "maintain";
    }

    // Work module
    const workSetup = data.moduleSetups.work_focus;
    if (workSetup) {
      settings.work_location = workSetup.workLocation || "home";
      settings.work_start_time = workSetup.workStartTime || null;
      settings.work_end_time = workSetup.workEndTime || null;
      settings.deep_work_hours = workSetup.deepWorkHours || null;
      settings.work_meetings = workSetup.meetings || [];
    }

    // Calendar module
    const calendarSetup = data.moduleSetups.calendar;
    if (calendarSetup) {
      const workDays = calendarSetup.workDays
        ?? calendarSetup.weekDays
          ?.filter((d) => d.isWorkDay)
          .map((d) => d.day)
        ?? [1, 2, 3, 4, 5];
      settings.work_days = workDays;
      settings.week_schedule = calendarSetup.weekDays || null;
      settings.fixed_commitments = calendarSetup.commitments || [];
      settings.prefer_training = calendarSetup.preferTraining || null;
      settings.prefer_deep_work = calendarSetup.preferDeepWork || null;
    }

    // Family module
    const familySetup = data.moduleSetups.family;
    if (familySetup) {
      settings.has_partner = familySetup.hasPartner ?? false;
      settings.has_children = familySetup.hasChildren ?? false;
      settings.children_count = familySetup.childrenCount ?? 0;
      settings.sharing_preferences = familySetup.sharingPreferences || [];
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
          height_cm: trainingSetup.heightCm || null,
          body_fat_pct: trainingSetup.bodyFatPct || null,
          visibility: "private",
        },
        { onConflict: "profile_id,date" }
      );
    }

    // 4. Goals (multi-goal support)
    const goalsSetup = data.moduleSetups.goals_habits;
    if (goalsSetup?.goals && goalsSetup.goals.length > 0) {
      const goalRows = goalsSetup.goals.map((g) => {
        const row: Record<string, unknown> = {
          profile_id: userId,
          title: g.title,
          status: "active",
          visibility: "private",
        };

        switch (g.type) {
          case "measurable":
            row.metric = "value";
            row.target_value = g.targetWeight || null;
            break;
          case "habit":
            row.metric = "frequency";
            row.target_value = g.frequency || null;
            break;
          case "challenge":
            row.metric = "days";
            row.target_value = g.challengeDays || null;
            break;
          case "oneoff":
            row.target_date = g.deadline || null;
            break;
        }

        return row;
      });

      await supabase.from("goals").insert(goalRows);
    } else if (goalsSetup?.title) {
      // Backward compat: single goal
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
