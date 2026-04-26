"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { format, subDays, startOfWeek, addDays } from "date-fns";
import { DEV_MODE, MOCK_USER_ID } from "@/lib/dev/mock-user";
import { XP_VALUES } from "@/types/gamification";

async function getUserId() {
  if (DEV_MODE) return MOCK_USER_ID;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Nepřihlášen");
  return user.id;
}

async function awardXP(
  profileId: string,
  amount: number,
  reason: string,
  sourceType?: string,
  sourceId?: string
) {
  const supabase = await createClient();
  await supabase.from("xp_ledger").insert({
    profile_id: profileId,
    amount,
    reason,
    source_type: sourceType ?? null,
    source_id: sourceId ?? null,
  });

  const { data: profile } = await supabase
    .from("gamification_profiles")
    .select("total_xp, level, title")
    .eq("profile_id", profileId)
    .single();

  if (profile) {
    const newXP = profile.total_xp + amount;
    const { getLevelForXP } = await import("@/types/gamification");
    const newLevel = getLevelForXP(newXP);
    await supabase
      .from("gamification_profiles")
      .update({ total_xp: newXP, level: newLevel.level, title: newLevel.title })
      .eq("profile_id", profileId);
  }
}

// ==================== DEEP WORK ====================

export interface DeepWorkSession {
  id: string;
  date: string;
  started_at: string;
  ended_at: string | null;
  planned_minutes: number;
  actual_minutes: number | null;
  focus_score_1_10: number | null;
  task_description: string | null;
  interruptions: number;
  notes: string | null;
}

export async function startDeepWorkSession(
  plannedMinutes: number,
  taskDescription?: string
): Promise<{ id?: string; error?: string }> {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };

  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("deep_work_sessions")
    .insert({
      profile_id: userId,
      date: today,
      planned_minutes: plannedMinutes,
      task_description: taskDescription || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/work");
  return { id: data.id };
}

export async function endDeepWorkSession(
  sessionId: string,
  focusScore: number,
  interruptions: number,
  notes?: string
): Promise<{ xpAwarded?: number; error?: string }> {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };

  const supabase = await createClient();

  // Fetch session to calculate actual minutes
  const { data: session } = await supabase
    .from("deep_work_sessions")
    .select("started_at")
    .eq("id", sessionId)
    .eq("profile_id", userId)
    .single();

  if (!session) return { error: "Session nenalezena" };

  const startedAt = new Date(session.started_at);
  const endedAt = new Date();
  const actualMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);

  await supabase
    .from("deep_work_sessions")
    .update({
      ended_at: endedAt.toISOString(),
      actual_minutes: actualMinutes,
      focus_score_1_10: focusScore,
      interruptions,
      notes: notes || null,
    })
    .eq("id", sessionId);

  // Award XP
  let xp = XP_VALUES.DEEP_WORK_COMPLETED;
  if (focusScore >= 8) xp += XP_VALUES.DEEP_WORK_FOCUS_BONUS;

  await awardXP(userId, xp, "Deep work dokončen", "deep_work", sessionId);

  // Auto-create calendar event
  try {
    const today = format(new Date(), "yyyy-MM-dd");
    await supabase.from("calendar_events").insert({
      owner_id: userId,
      title: `Deep work (${actualMinutes} min)`,
      kind: "work_deep",
      starts_at: startedAt.toISOString(),
      ends_at: endedAt.toISOString(),
      all_day: false,
      visibility: "private",
      notes: notes || null,
    });
  } catch {
    // Non-critical
  }

  revalidatePath("/work");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  return { xpAwarded: xp };
}

export async function getTodayDeepWork(userId: string): Promise<DeepWorkSession[]> {
  if (DEV_MODE) return [];
  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data } = await supabase
    .from("deep_work_sessions")
    .select("*")
    .eq("profile_id", userId)
    .eq("date", today)
    .order("started_at", { ascending: false });

  return (data ?? []) as DeepWorkSession[];
}

export async function getActiveSession(userId: string): Promise<DeepWorkSession | null> {
  if (DEV_MODE) return null;
  const supabase = await createClient();

  const { data } = await supabase
    .from("deep_work_sessions")
    .select("*")
    .eq("profile_id", userId)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  return (data as DeepWorkSession) ?? null;
}

export async function getDeepWorkStats(userId: string, days: number = 7) {
  if (DEV_MODE) return { totalMinutes: 0, avgFocusScore: 0, sessionCount: 0, dailyBreakdown: [] };
  const supabase = await createClient();
  const since = format(subDays(new Date(), days), "yyyy-MM-dd");

  const { data } = await supabase
    .from("deep_work_sessions")
    .select("date, actual_minutes, focus_score_1_10")
    .eq("profile_id", userId)
    .gte("date", since)
    .not("ended_at", "is", null)
    .order("date", { ascending: true });

  const sessions = data ?? [];
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.actual_minutes ?? 0), 0);
  const withScore = sessions.filter((s) => s.focus_score_1_10 != null);
  const avgFocusScore = withScore.length > 0
    ? Math.round((withScore.reduce((sum, s) => sum + (s.focus_score_1_10 ?? 0), 0) / withScore.length) * 10) / 10
    : 0;

  // Daily breakdown
  const dailyMap = new Map<string, number>();
  for (const s of sessions) {
    dailyMap.set(s.date, (dailyMap.get(s.date) ?? 0) + (s.actual_minutes ?? 0));
  }

  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const dailyBreakdown = Array.from({ length: 7 }, (_, i) => {
    const d = format(addDays(monday, i), "yyyy-MM-dd");
    return { date: d, minutes: dailyMap.get(d) ?? 0 };
  });

  return { totalMinutes, avgFocusScore, sessionCount: sessions.length, dailyBreakdown };
}

// ==================== TASKS ====================

export interface WorkTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  due_date: string | null;
  project: string | null;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  completed_at: string | null;
  created_at: string;
}

export async function getWorkTasks(userId: string, status?: string): Promise<WorkTask[]> {
  if (DEV_MODE) return [];
  const supabase = await createClient();

  let query = supabase
    .from("work_tasks")
    .select("*")
    .eq("profile_id", userId)
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data } = await query;
  return (data ?? []) as WorkTask[];
}

export async function createWorkTask(formData: FormData): Promise<{ error?: string }> {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };

  const supabase = await createClient();
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const priority = Number(formData.get("priority")) || 3;
  const dueDate = (formData.get("due_date") as string) || null;
  const project = (formData.get("project") as string) || null;
  const estimatedMinutes = formData.get("estimated_minutes") ? Number(formData.get("estimated_minutes")) : null;

  if (!title.trim()) return { error: "Název je povinný" };

  const { error } = await supabase.from("work_tasks").insert({
    profile_id: userId,
    title: title.trim(),
    description,
    priority,
    due_date: dueDate || null,
    project,
    estimated_minutes: estimatedMinutes,
  });

  if (error) return { error: error.message };
  revalidatePath("/work");
  return {};
}

export async function updateTaskStatus(
  taskId: string,
  status: string
): Promise<{ xpAwarded?: number; error?: string }> {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };

  const supabase = await createClient();

  const update: Record<string, unknown> = { status };
  if (status === "done") {
    update.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("work_tasks")
    .update(update)
    .eq("id", taskId)
    .eq("profile_id", userId);

  if (error) return { error: error.message };

  let xpAwarded = 0;
  if (status === "done") {
    xpAwarded = XP_VALUES.TASK_COMPLETED;
    await awardXP(userId, xpAwarded, "Úkol dokončen", "task", taskId);
  }

  revalidatePath("/work");
  revalidatePath("/dashboard");
  return { xpAwarded };
}

export async function deleteWorkTask(taskId: string): Promise<{ error?: string }> {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("work_tasks")
    .delete()
    .eq("id", taskId)
    .eq("profile_id", userId);

  if (error) return { error: error.message };
  revalidatePath("/work");
  return {};
}

// ==================== WEEKLY PRODUCTIVITY ====================

export async function getWeeklyProductivity(userId: string) {
  if (DEV_MODE) return { deepWork: [], tasksCompleted: [] };
  const supabase = await createClient();
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const mondayStr = format(monday, "yyyy-MM-dd");
  const sundayStr = format(addDays(monday, 6), "yyyy-MM-dd");

  const [dwRes, taskRes] = await Promise.all([
    supabase
      .from("deep_work_sessions")
      .select("date, actual_minutes")
      .eq("profile_id", userId)
      .gte("date", mondayStr)
      .lte("date", sundayStr)
      .not("ended_at", "is", null),
    supabase
      .from("work_tasks")
      .select("completed_at")
      .eq("profile_id", userId)
      .eq("status", "done")
      .gte("completed_at", `${mondayStr}T00:00:00`)
      .lte("completed_at", `${sundayStr}T23:59:59`),
  ]);

  const dwSessions = dwRes.data ?? [];
  const tasks = taskRes.data ?? [];

  // Aggregate per day
  const dwMap = new Map<string, number>();
  for (const s of dwSessions) {
    dwMap.set(s.date, (dwMap.get(s.date) ?? 0) + (s.actual_minutes ?? 0));
  }

  const taskMap = new Map<string, number>();
  for (const t of tasks) {
    if (t.completed_at) {
      const d = format(new Date(t.completed_at), "yyyy-MM-dd");
      taskMap.set(d, (taskMap.get(d) ?? 0) + 1);
    }
  }

  const days = Array.from({ length: 7 }, (_, i) => format(addDays(monday, i), "yyyy-MM-dd"));

  return {
    deepWork: days.map((d) => ({ date: d, minutes: dwMap.get(d) ?? 0 })),
    tasksCompleted: days.map((d) => ({ date: d, count: taskMap.get(d) ?? 0 })),
  };
}

// ==================== WORK SETTINGS ====================

export async function getWorkSettings(userId: string) {
  if (DEV_MODE) return { deepWorkHours: 4, workStartTime: "08:00", workEndTime: "17:00" };
  const supabase = await createClient();

  const { data } = await supabase
    .from("user_settings")
    .select("deep_work_hours, work_start_time, work_end_time")
    .eq("profile_id", userId)
    .single();

  return {
    deepWorkHours: data?.deep_work_hours ?? 4,
    workStartTime: data?.work_start_time ?? "08:00",
    workEndTime: data?.work_end_time ?? "17:00",
  };
}
