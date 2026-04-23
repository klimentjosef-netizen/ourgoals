import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const DEMO_EMAIL = "demo@ourgoals.app";
const DEMO_PASSWORD = "demo-ourgoals-2026";

export async function GET() {
  const supabase = await createClient();

  // Try to sign in first
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

  if (signInData?.user) {
    // Already exists, signed in
    return NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_SUPABASE_URL ? "https://ourgoals.vercel.app" : "http://localhost:3000"));
  }

  // User doesn't exist, create via signup
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    options: {
      data: { display_name: "Demo User" },
    },
  });

  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 500 });
  }

  // If email confirmation is required, skip it by signing in directly
  // (Supabase might auto-confirm depending on settings)
  if (signUpData?.user) {
    // Mark onboarding as completed and set up demo modules
    const userId = signUpData.user.id;

    // Update profile
    await supabase
      .from("profiles")
      .update({
        display_name: "Demo User",
        onboarding_completed: true,
      })
      .eq("id", userId);

    // Set active modules
    await supabase
      .from("user_settings")
      .update({
        active_modules: [
          "goals_habits",
          "sleep_wellbeing",
          "calendar",
          "work_focus",
          "training",
          "nutrition",
        ],
        coach_tone: "friendly_mentor",
        protein_g: 200,
        carbs_g: 250,
        fat_g: 70,
        bedtime_target: "22:30",
        wake_target: "06:30",
      })
      .eq("profile_id", userId);

    // Create a sample goal
    await supabase.from("goals").insert({
      profile_id: userId,
      title: "Udržet streak 30 dní",
      description: "Každý den splnit check-in a alespoň 1 habit",
      metric: "streak",
      target_value: 30,
      start_value: 0,
      current_value: 0,
      status: "active",
    });

    // Create sample habits
    await supabase.from("daily_habits").insert([
      { profile_id: userId, title: "Ranní check-in", xp_value: 10, sort_order: 0 },
      { profile_id: userId, title: "Večerní check-in", xp_value: 10, sort_order: 1 },
      { profile_id: userId, title: "30 min cvičení", xp_value: 30, sort_order: 2 },
      { profile_id: userId, title: "Zalogovat jídla", xp_value: 20, sort_order: 3 },
      { profile_id: userId, title: "8h spánku", xp_value: 15, sort_order: 4 },
    ]);

    return NextResponse.redirect(
      new URL("/dashboard", "https://ourgoals.vercel.app")
    );
  }

  return NextResponse.json({ error: "Nepodařilo se vytvořit demo účet" }, { status: 500 });
}
