import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "./wizard";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profileResult = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  let profile = profileResult.data;
  if (!profile) {
    // Auto-create profile
    await supabase.from("profiles").insert({
      id: user.id,
      display_name: user.email?.split("@")[0] ?? "User",
      onboarding_completed: false,
    });
    // Also create user_settings and gamification_profiles
    await supabase.from("user_settings").insert({ profile_id: user.id });
    await supabase.from("gamification_profiles").insert({ profile_id: user.id, total_xp: 0, level: 1, title: 'Nováček', current_streak: 0, longest_streak: 0, perfect_days: 0, ok_days: 0, missed_days: 0 });
    profile = { onboarding_completed: false };
  }

  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  return <OnboardingWizard />;
}
