"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { DEV_MODE, MOCK_USER_ID } from "@/lib/dev/mock-user";

async function getUserId() {
  if (DEV_MODE) return MOCK_USER_ID;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Neprihlaseny");
  return user.id;
}

export async function updateModules(
  modules: string[]
): Promise<{ success?: boolean; error?: string }> {
  try {
    if (DEV_MODE) {
      revalidatePath("/settings");
      revalidatePath("/dashboard");
      return { success: true };
    }

    const supabase = await createClient();
    const userId = await getUserId();

    const { error } = await supabase
      .from("user_settings")
      .update({ active_modules: modules })
      .eq("profile_id", userId);

    if (error) return { error: error.message };

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Chyba při ukládání modulů" };
  }
}

export async function updateCoachTone(
  tone: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    if (DEV_MODE) {
      revalidatePath("/settings");
      return { success: true };
    }

    const supabase = await createClient();
    const userId = await getUserId();

    const { error } = await supabase
      .from("user_settings")
      .update({ coach_tone: tone })
      .eq("profile_id", userId);

    if (error) return { error: error.message };

    revalidatePath("/settings");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Chyba při ukládání tónu" };
  }
}

export async function updateProfile(
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    if (DEV_MODE) {
      revalidatePath("/settings");
      return { success: true };
    }

    const supabase = await createClient();
    const userId = await getUserId();

    const displayName = formData.get("display_name") as string;
    const dateOfBirth = formData.get("date_of_birth") as string;

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName || null,
        date_of_birth: dateOfBirth || null,
      })
      .eq("id", userId);

    if (error) return { error: error.message };

    revalidatePath("/settings");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Chyba při ukládání profilu" };
  }
}

export async function updateTargets(
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    if (DEV_MODE) {
      revalidatePath("/settings");
      return { success: true };
    }

    const supabase = await createClient();
    const userId = await getUserId();

    const settings: Record<string, unknown> = {};

    const proteinG = formData.get("protein_g");
    const carbsG = formData.get("carbs_g");
    const fatG = formData.get("fat_g");
    const tdeeOverride = formData.get("tdee_override");
    const bedtimeTarget = formData.get("bedtime_target");
    const wakeTarget = formData.get("wake_target");
    const workDaysRaw = formData.get("work_days");

    if (proteinG !== null) settings.protein_g = proteinG ? Number(proteinG) : null;
    if (carbsG !== null) settings.carbs_g = carbsG ? Number(carbsG) : null;
    if (fatG !== null) settings.fat_g = fatG ? Number(fatG) : null;
    if (tdeeOverride !== null) settings.tdee_override = tdeeOverride ? Number(tdeeOverride) : null;
    if (bedtimeTarget !== null) settings.bedtime_target = bedtimeTarget || null;
    if (wakeTarget !== null) settings.wake_target = wakeTarget || null;
    if (workDaysRaw) {
      try {
        settings.work_days = JSON.parse(workDaysRaw as string);
      } catch {
        settings.work_days = [1, 2, 3, 4, 5];
      }
    }

    const { error } = await supabase
      .from("user_settings")
      .update(settings)
      .eq("profile_id", userId);

    if (error) return { error: error.message };

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Chyba při ukládání cílů" };
  }
}

export async function exportUserData(
  userId: string
): Promise<{ data?: Record<string, unknown>; error?: string }> {
  try {
    if (DEV_MODE) {
      return {
        data: {
          profile: { id: userId, display_name: "Dev User", email: "dev@ourgoals.app" },
          settings: { active_modules: ["goals_habits", "sleep_wellbeing", "calendar", "work_focus", "training", "nutrition"] },
          goals: [],
          habits: [],
          checkins: [],
          meals: [],
          sessions: [],
          body_metrics: [],
          xp_log: [],
          exported_at: new Date().toISOString(),
        },
      };
    }

    const supabase = await createClient();

    const [
      { data: profile },
      { data: settings },
      { data: goals },
      { data: habits },
      { data: checkins },
      { data: meals },
      { data: sessions },
      { data: bodyMetrics },
      { data: xpLog },
      { data: events },
      { data: founderLogs },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("user_settings").select("*").eq("profile_id", userId).single(),
      supabase.from("goals").select("*").eq("profile_id", userId),
      supabase.from("daily_habits").select("*").eq("profile_id", userId),
      supabase.from("checkins").select("*").eq("profile_id", userId),
      supabase.from("meals").select("*").eq("profile_id", userId),
      supabase.from("training_sessions").select("*").eq("profile_id", userId),
      supabase.from("body_metrics").select("*").eq("profile_id", userId),
      supabase.from("xp_log").select("*").eq("profile_id", userId),
      supabase.from("events").select("*").eq("profile_id", userId),
      supabase.from("founder_log_entries").select("*").eq("profile_id", userId),
    ]);

    return {
      data: {
        profile,
        settings,
        goals: goals ?? [],
        habits: habits ?? [],
        checkins: checkins ?? [],
        meals: meals ?? [],
        sessions: sessions ?? [],
        body_metrics: bodyMetrics ?? [],
        xp_log: xpLog ?? [],
        events: events ?? [],
        founder_logs: founderLogs ?? [],
        exported_at: new Date().toISOString(),
      },
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Chyba při exportu dat" };
  }
}

export async function deleteAccount(): Promise<{ success?: boolean; error?: string }> {
  try {
    if (DEV_MODE) {
      return { success: true };
    }

    const supabase = await createClient();
    const userId = await getUserId();

    // Delete profile (cascades to all related data via FK constraints)
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (error) return { error: error.message };

    // Sign out the user
    await supabase.auth.signOut();

    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Chyba při mazání účtu" };
  }
}
