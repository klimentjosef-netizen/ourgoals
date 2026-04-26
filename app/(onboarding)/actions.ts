"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXP } from "@/lib/logic/xp";
import { DEV_MODE, MOCK_USER_ID } from "@/lib/dev/mock-user";
import { PLAN_TEMPLATES } from "@/app/(app)/training/plan/templates";
import { format } from "date-fns";
import type { OnboardingData, QuickGoalData } from "@/types/onboarding";

// Odvodit oblast cíle z kontextu
function inferGoalArea(goal: QuickGoalData, selectedModules: string[]): string {
  const title = goal.title.toLowerCase();

  // Zdraví & fitness
  if (title.includes("zhub") || title.includes("váh") || title.includes("síl") ||
      title.includes("cvič") || title.includes("trén") || title.includes("běh"))
    return "health";

  // Výživa
  if (title.includes("jíst") || title.includes("jídl") || title.includes("makr") ||
      title.includes("protein") || title.includes("kalor"))
    return "health";

  // Spánek & wellbeing
  if (title.includes("spá") || title.includes("medit") || title.includes("stres") ||
      title.includes("sleep"))
    return "mental";

  // Práce
  if (title.includes("deep work") || title.includes("projekt") || title.includes("práce") ||
      title.includes("dokonč"))
    return "work";

  // Vzdělání
  if (title.includes("knih") || title.includes("jazyk") || title.includes("nauč") ||
      title.includes("kurz"))
    return "growth";

  // Vztahy
  if (title.includes("komun") || title.includes("vztah") || title.includes("spol") ||
      title.includes("streak"))
    return "relationships";

  // Fallback: podle prvního relevantního modulu
  if (selectedModules.includes("training")) return "health";
  if (selectedModules.includes("work_focus")) return "work";
  if (selectedModules.includes("sleep_wellbeing")) return "mental";
  return "growth";
}

// Získat den v týdnu z preference
function getPreferredTrainingTimes(preference?: string): { hour: number; minute: number } {
  switch (preference) {
    case "morning": return { hour: 7, minute: 0 };
    case "afternoon": return { hour: 14, minute: 0 };
    case "evening": return { hour: 18, minute: 0 };
    default: return { hour: 17, minute: 0 };
  }
}

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
      settings.children_ages = familySetup.childrenAges || [];
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

    // 4. Goals (multi-goal support) — NOW WITH goal_type AND area
    const goalsSetup = data.moduleSetups.goals_habits;
    const createdGoalIds: { id: string; type: string; title: string; frequency?: number }[] = [];

    if (goalsSetup?.goals && goalsSetup.goals.length > 0) {
      const goalRows = goalsSetup.goals.map((g) => {
        const row: Record<string, unknown> = {
          profile_id: userId,
          title: g.title,
          goal_type: g.type,
          area: inferGoalArea(g, data.selectedModules),
          status: "active",
          visibility: "private",
        };

        switch (g.type) {
          case "measurable":
            row.metric = g.title.toLowerCase().includes("váh") ? "kg" : "value";
            row.target_value = g.targetWeight || null;
            row.start_value = trainingSetup?.weightKg || 0;
            row.current_value = trainingSetup?.weightKg || 0;
            break;
          case "habit":
            row.metric = "frequency";
            row.frequency = g.frequency || 3;
            row.frequency_target = g.frequency || 3;
            break;
          case "challenge":
            row.metric = "days";
            row.target_value = g.challengeDays || 30;
            row.challenge_days = g.challengeDays || 30;
            row.challenge_start = new Date().toISOString().split("T")[0];
            break;
          case "oneoff":
            row.target_date = g.deadline || null;
            break;
        }

        return row;
      });

      const { data: insertedGoals } = await supabase
        .from("goals")
        .insert(goalRows)
        .select("id, goal_type, title, frequency");

      if (insertedGoals) {
        for (const ig of insertedGoals) {
          createdGoalIds.push({
            id: ig.id,
            type: ig.goal_type,
            title: ig.title,
            frequency: ig.frequency,
          });
        }
      }
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
        goal_type: "oneoff",
        area: "growth",
        status: "active",
        visibility: "private",
      });
    }

    // 5. Default habits + LINKED HABITS for habit-type goals
    const habits: {
      profile_id: string;
      title: string;
      xp_value: number;
      sort_order: number;
      goal_id?: string;
      frequency?: string;
      active_days?: number[];
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
    if (data.selectedModules.includes("work_focus")) {
      habits.push({
        profile_id: userId,
        title: "Deep work blok",
        xp_value: 20,
        sort_order: order++,
      });
    }

    // Auto-create linked habits for habit-type goals
    for (const goal of createdGoalIds) {
      if (goal.type === "habit") {
        habits.push({
          profile_id: userId,
          title: goal.title,
          xp_value: 15,
          sort_order: order++,
          goal_id: goal.id,
        });
      }
    }

    if (habits.length > 0) {
      await supabase.from("daily_habits").insert(habits);
    }

    // 6. Auto-create training plan from template
    if (
      trainingSetup?.templatePlan &&
      trainingSetup.templatePlan !== "custom" &&
      !DEV_MODE
    ) {
      try {
        const template = PLAN_TEMPLATES.find((t) => t.id === trainingSetup.templatePlan);
        if (template) {
          const { data: plan } = await supabase
            .from("training_plans")
            .insert({
              profile_id: userId,
              name: template.name,
              start_date: format(new Date(), "yyyy-MM-dd"),
              days_per_week: template.daysPerWeek,
              split_type: template.splitType,
            })
            .select()
            .single();

          if (plan) {
            // Fetch exercises to map names → IDs
            const { data: allExercises } = await supabase
              .from("exercises")
              .select("id, name");

            const exerciseMap = new Map(
              (allExercises ?? []).map((e: { id: string; name: string }) => [e.name, e.id])
            );

            for (const day of template.days) {
              const { data: workout } = await supabase
                .from("workouts")
                .insert({
                  plan_id: plan.id,
                  profile_id: userId,
                  day_index: day.dayIndex,
                  day_label: day.label,
                  focus: day.focus,
                  target_duration_min: 60,
                })
                .select()
                .single();

              if (workout) {
                const exerciseRows = day.exercises
                  .map((name, idx) => {
                    const exerciseId = exerciseMap.get(name);
                    if (!exerciseId) return null;
                    return {
                      workout_id: workout.id,
                      exercise_id: exerciseId,
                      order_idx: idx,
                      sets: 3,
                      reps_low: 8,
                      reps_high: 12,
                      rpe_target: 7,
                      rest_sec: 90,
                    };
                  })
                  .filter(Boolean);

                if (exerciseRows.length > 0) {
                  await supabase.from("workout_exercises").insert(exerciseRows);
                }
              }
            }
          }
        }
      } catch {
        // Non-critical: training plan creation failure shouldn't block onboarding
      }
    }

    // 7. Auto-create calendar events from commitments and meetings
    if (!DEV_MODE) {
      const calendarEvents: Record<string, unknown>[] = [];

      // Work meetings → calendar events
      if (workSetup?.meetings && workSetup.meetings.length > 0) {
        const dayNames = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];
        for (const meeting of workSetup.meetings) {
          // Najít nejbližší datum pro daný den týdne
          const today = new Date();
          const todayDay = (today.getDay() + 6) % 7; // 0=Po
          let daysUntil = meeting.day - todayDay;
          if (daysUntil < 0) daysUntil += 7;
          const eventDate = new Date(today);
          eventDate.setDate(today.getDate() + daysUntil);
          const dateStr = format(eventDate, "yyyy-MM-dd");

          calendarEvents.push({
            owner_id: userId,
            title: meeting.name || `Meeting (${dayNames[meeting.day]})`,
            kind: "work_meeting",
            starts_at: `${dateStr}T${meeting.timeFrom}:00`,
            ends_at: `${dateStr}T${meeting.timeTo}:00`,
            all_day: false,
            rrule: `FREQ=WEEKLY;BYDAY=${["MO","TU","WE","TH","FR","SA","SU"][meeting.day]}`,
            visibility: "private",
          });
        }
      }

      // Calendar commitments → calendar events
      if (calendarSetup?.commitments && calendarSetup.commitments.length > 0) {
        const commitmentKindMap: Record<string, string> = {
          work: "work_meeting",
          training: "training",
          family: "family",
        };

        for (const commitment of calendarSetup.commitments) {
          if (commitment.day < 0) continue; // skip "any day" commitments

          const today = new Date();
          const todayDay = (today.getDay() + 6) % 7;
          let daysUntil = commitment.day - todayDay;
          if (daysUntil < 0) daysUntil += 7;
          const eventDate = new Date(today);
          eventDate.setDate(today.getDate() + daysUntil);
          const dateStr = format(eventDate, "yyyy-MM-dd");

          const kind = commitmentKindMap[commitment.name.toLowerCase()] || "custom";

          calendarEvents.push({
            owner_id: userId,
            title: commitment.name,
            kind,
            starts_at: `${dateStr}T${commitment.timeFrom}:00`,
            ends_at: `${dateStr}T${commitment.timeTo}:00`,
            all_day: false,
            rrule: commitment.recurring
              ? `FREQ=WEEKLY;BYDAY=${["MO","TU","WE","TH","FR","SA","SU"][commitment.day]}`
              : null,
            visibility: "private",
          });
        }
      }

      if (calendarEvents.length > 0) {
        await supabase.from("calendar_events").insert(calendarEvents);
      }
    }

    // 8. Award XP for onboarding
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
