"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingData } from "@/types/onboarding";

export async function completeOnboarding(
  data: OnboardingData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Nejste přihlášeni." };
    }

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        display_name: data.profile.displayName,
        date_of_birth: data.profile.dateOfBirth || null,
        timezone: data.profile.timezone,
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (profileError) {
      return { error: "Nepodařilo se uložit profil." };
    }

    // Build user_settings update
    const settingsUpdate: Record<string, unknown> = {
      active_modules: data.selectedModules,
      coach_tone: data.coachTone,
    };

    const sleepSetup = data.moduleSetups.sleep_wellbeing;
    if (sleepSetup) {
      settingsUpdate.bedtime_target = sleepSetup.bedtimeTarget || null;
      settingsUpdate.wake_target = sleepSetup.wakeTarget || null;
    }

    const nutritionSetup = data.moduleSetups.nutrition;
    if (nutritionSetup) {
      settingsUpdate.protein_g = nutritionSetup.proteinG || null;
      settingsUpdate.carbs_g = nutritionSetup.carbsG || null;
      settingsUpdate.fat_g = nutritionSetup.fatG || null;
    }

    const { error: settingsError } = await supabase
      .from("user_settings")
      .upsert({
        user_id: user.id,
        ...settingsUpdate,
      });

    if (settingsError) {
      return { error: "Nepodařilo se uložit nastavení." };
    }

    // Insert first goal if goals module selected and data provided
    const goalSetup = data.moduleSetups.goals_habits;
    if (
      data.selectedModules.includes("goals_habits") &&
      goalSetup?.title
    ) {
      await supabase.from("goals").insert({
        user_id: user.id,
        title: goalSetup.title,
        description: goalSetup.description || null,
        metric: goalSetup.metric || null,
        target_value: goalSetup.targetValue || null,
        start_value: goalSetup.startValue || null,
        target_date: goalSetup.targetDate || null,
      });
    }

    // Create default daily_habits based on selected modules
    const habits: { user_id: string; title: string; xp_reward: number }[] = [
      { user_id: user.id, title: "Ranní check-in", xp_reward: 10 },
      { user_id: user.id, title: "Večerní check-in", xp_reward: 10 },
    ];

    if (data.selectedModules.includes("goals_habits")) {
      habits.push({
        user_id: user.id,
        title: "Pracuj na svém cíli",
        xp_reward: 15,
      });
    }

    if (data.selectedModules.includes("training")) {
      habits.push({
        user_id: user.id,
        title: "Odcvič trénink",
        xp_reward: 30,
      });
    }

    if (data.selectedModules.includes("nutrition")) {
      habits.push({
        user_id: user.id,
        title: "Zaloguj jídla",
        xp_reward: 20,
      });
    }

    if (data.selectedModules.includes("sleep_wellbeing")) {
      habits.push({
        user_id: user.id,
        title: "Zapiš spánek",
        xp_reward: 5,
      });
    }

    await supabase.from("daily_habits").insert(habits);

    // Insert body metrics if training module selected with body data
    const trainingSetup = data.moduleSetups.training;
    if (
      data.selectedModules.includes("training") &&
      trainingSetup &&
      (trainingSetup.weightKg || trainingSetup.heightCm || trainingSetup.bodyFatPct)
    ) {
      await supabase.from("body_metrics").insert({
        user_id: user.id,
        weight_kg: trainingSetup.weightKg || null,
        height_cm: trainingSetup.heightCm || null,
        body_fat_pct: trainingSetup.bodyFatPct || null,
      });
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Něco se pokazilo. Zkuste to znovu." };
  }
}
