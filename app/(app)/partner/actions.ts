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
  if (!user) throw new Error("Nepřihlášen");
  return user.id;
}

// HOUSEHOLD
export async function getHousehold(userId: string) {
  if (DEV_MODE) return null;
  const supabase = await createClient();
  // Find household where user is member
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id, role, households(id, name, created_by)")
    .eq("profile_id", userId)
    .limit(1)
    .single();
  if (!membership) return null;
  // Get all members with profiles
  const { data: members } = await supabase
    .from("household_members")
    .select("profile_id, role, profiles(display_name)")
    .eq("household_id", membership.household_id);
  // Get pending invites
  const { data: invites } = await supabase
    .from("household_invites")
    .select("*")
    .eq("household_id", membership.household_id)
    .is("accepted_at", null);
  return {
    household: membership.households,
    members: members ?? [],
    invites: invites ?? [],
    userRole: membership.role,
  };
}

export async function createHousehold(name: string) {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();
  const { data: household, error } = await supabase
    .from("households")
    .insert({ name, created_by: userId })
    .select()
    .single();
  if (error) return { error: error.message };
  // Add creator as owner
  await supabase.from("household_members").insert({
    household_id: household.id,
    profile_id: userId,
    role: "owner",
  });
  revalidatePath("/partner");
  return { household };
}

export async function invitePartner(email: string) {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();
  // Find user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("profile_id", userId)
    .single();
  if (!membership) return { error: "Nemáš domácnost" };
  const { error } = await supabase.from("household_invites").insert({
    household_id: membership.household_id,
    email,
    role: "adult",
  });
  if (error) return { error: error.message };
  revalidatePath("/partner");
  return { success: true };
}

export async function acceptInvite(token: string) {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();
  const { data: invite } = await supabase
    .from("household_invites")
    .select("*")
    .eq("token", token)
    .is("accepted_at", null)
    .single();
  if (!invite) return { error: "Pozvánka neexistuje nebo vypršela" };
  if (new Date(invite.expires_at) < new Date())
    return { error: "Pozvánka vypršela" };
  // Add user to household
  await supabase.from("household_members").insert({
    household_id: invite.household_id,
    profile_id: userId,
    role: invite.role,
  });
  // Mark invite as accepted
  await supabase
    .from("household_invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);
  revalidatePath("/partner");
  return { success: true, householdId: invite.household_id };
}

// PARTNER NOTES
export async function getPartnerNotes(householdId: string, limit = 30) {
  if (DEV_MODE) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("partner_notes")
    .select("*, profiles:author_id(display_name)")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function createPartnerNote(formData: FormData) {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();
  const kind = formData.get("kind") as string;
  const content = formData.get("content") as string;
  if (!content?.trim()) return { error: "Vzkaz nemůže být prázdný" };

  // Find household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("profile_id", userId)
    .single();
  if (!membership) return { error: "Nemáš domácnost" };

  // Check bother limit (max 1/day)
  if (kind === "bother") {
    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase
      .from("partner_notes")
      .select("id")
      .eq("author_id", userId)
      .eq("kind", "bother")
      .eq("date", today);
    if (existing && existing.length > 0) {
      return { error: "Tento typ vzkazu lze odeslat max 1× denně" };
    }
  }

  const { error } = await supabase.from("partner_notes").insert({
    author_id: userId,
    household_id: membership.household_id,
    kind,
    content: content.trim(),
    date: new Date().toISOString().split("T")[0],
  });
  if (error) return { error: error.message };
  revalidatePath("/partner");
  return { success: true };
}

export async function markNoteAsRead(noteId: string) {
  if (DEV_MODE) return;
  const supabase = await createClient();
  await supabase
    .from("partner_notes")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", noteId);
  revalidatePath("/partner");
}

export async function getGottmanScore(householdId: string) {
  if (DEV_MODE)
    return {
      ratio: 5.0,
      gratitude: 10,
      bother: 2,
      request: 5,
      celebrate: 3,
      status: "good" as const,
    };
  const supabase = await createClient();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { data: notes } = await supabase
    .from("partner_notes")
    .select("kind")
    .eq("household_id", householdId)
    .gte("date", weekAgo.toISOString().split("T")[0]);
  const counts = { gratitude: 0, bother: 0, request: 0, celebrate: 0 };
  for (const n of notes ?? []) {
    if (n.kind in counts) counts[n.kind as keyof typeof counts]++;
  }
  const ratio =
    counts.bother === 0
      ? counts.gratitude > 0
        ? 99
        : 0
      : Math.round((counts.gratitude / counts.bother) * 10) / 10;
  const status = ratio >= 5 ? "good" : ratio >= 3 ? "warning" : "danger";
  return {
    ratio,
    ...counts,
    status: status as "good" | "warning" | "danger",
  };
}

// SHARED LISTS
export async function getSharedLists(householdId: string) {
  if (DEV_MODE) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("shared_lists")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createSharedList(name: string, kind: string) {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("profile_id", userId)
    .single();
  if (!membership) return { error: "Nemáš domácnost" };
  const { error } = await supabase.from("shared_lists").insert({
    household_id: membership.household_id,
    name,
    kind,
    items: [],
  });
  if (error) return { error: error.message };
  revalidatePath("/partner");
  return { success: true };
}

export async function addListItem(listId: string, text: string) {
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();
  const userId = await getUserId();
  const { data: list } = await supabase
    .from("shared_lists")
    .select("items")
    .eq("id", listId)
    .single();
  if (!list) return { error: "Seznam nenalezen" };
  const items = Array.isArray(list.items) ? list.items : [];
  items.push({
    text,
    checked: false,
    addedBy: userId,
    addedAt: new Date().toISOString(),
  });
  await supabase.from("shared_lists").update({ items }).eq("id", listId);
  revalidatePath("/partner");
  return { success: true };
}

export async function toggleListItem(listId: string, itemIndex: number) {
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();
  const { data: list } = await supabase
    .from("shared_lists")
    .select("items")
    .eq("id", listId)
    .single();
  if (!list) return { error: "Seznam nenalezen" };
  const items = Array.isArray(list.items) ? [...list.items] : [];
  if (items[itemIndex]) {
    items[itemIndex] = {
      ...items[itemIndex],
      checked: !items[itemIndex].checked,
    };
  }
  await supabase.from("shared_lists").update({ items }).eq("id", listId);
  revalidatePath("/partner");
  return { success: true };
}

export async function deleteSharedList(listId: string) {
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();
  await supabase.from("shared_lists").delete().eq("id", listId);
  revalidatePath("/partner");
  return { success: true };
}

// EDIT/DELETE PARTNER NOTES

export async function updatePartnerNote(
  noteId: string,
  content: string
): Promise<{ error?: string }> {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();

  // Only author can edit
  const { data: note } = await supabase
    .from("partner_notes")
    .select("author_id, created_at")
    .eq("id", noteId)
    .single();

  if (!note) return { error: "Poznámka nenalezena" };
  if (note.author_id !== userId) return { error: "Můžeš upravit jen své poznámky" };

  // 10-minute edit window
  const createdAt = new Date(note.created_at);
  const now = new Date();
  const minutesElapsed = (now.getTime() - createdAt.getTime()) / 60000;
  if (minutesElapsed > 10) {
    return { error: "Úprava je možná jen 10 minut po odeslání" };
  }

  const { error } = await supabase
    .from("partner_notes")
    .update({ content })
    .eq("id", noteId);

  if (error) return { error: error.message };
  revalidatePath("/partner");
  return {};
}

export async function deletePartnerNote(noteId: string): Promise<{ error?: string }> {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();

  // Only author can delete
  const { data: note } = await supabase
    .from("partner_notes")
    .select("author_id")
    .eq("id", noteId)
    .single();

  if (!note) return { error: "Poznámka nenalezena" };
  if (note.author_id !== userId) return { error: "Můžeš smazat jen své poznámky" };

  const { error } = await supabase
    .from("partner_notes")
    .delete()
    .eq("id", noteId);

  if (error) return { error: error.message };
  revalidatePath("/partner");
  return {};
}

// LIST ITEM CATEGORIES

// ==================== HOUSEHOLD TASKS ====================

export interface HouseholdTask {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: number;
  due_date: string | null;
  due_time: string | null;
  status: string;
  assigned_to: string | null;
  created_by: string;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
  assigned_profile?: { display_name: string } | null;
  creator_profile?: { display_name: string } | null;
}

export async function getHouseholdTasks(householdId: string): Promise<HouseholdTask[]> {
  if (DEV_MODE) return [];
  const supabase = await createClient();

  const { data } = await supabase
    .from("household_tasks")
    .select("*, assigned_profile:profiles!household_tasks_assigned_to_fkey(display_name), creator_profile:profiles!household_tasks_created_by_fkey(display_name)")
    .eq("household_id", householdId)
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });

  return (data ?? []) as HouseholdTask[];
}

export async function createHouseholdTask(
  householdId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const category = (formData.get("category") as string) || "general";
  const assignedTo = (formData.get("assigned_to") as string) || null;
  const dueDate = (formData.get("due_date") as string) || null;
  const dueTime = (formData.get("due_time") as string) || null;
  const priority = Number(formData.get("priority")) || 3;

  if (!title.trim()) return { error: "Název je povinný" };

  const { error } = await supabase.from("household_tasks").insert({
    household_id: householdId,
    created_by: userId,
    assigned_to: assignedTo,
    title: title.trim(),
    category,
    priority,
    due_date: dueDate || null,
    due_time: dueTime || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/partner");
  return {};
}

export async function completeHouseholdTask(taskId: string): Promise<{ error?: string }> {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();

  const { error } = await supabase
    .from("household_tasks")
    .update({
      status: "done",
      completed_at: new Date().toISOString(),
      completed_by: userId,
    })
    .eq("id", taskId);

  if (error) return { error: error.message };
  revalidatePath("/partner");
  return {};
}

export async function deleteHouseholdTask(taskId: string): Promise<{ error?: string }> {
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();
  const { error } = await supabase.from("household_tasks").delete().eq("id", taskId);
  if (error) return { error: error.message };
  revalidatePath("/partner");
  return {};
}

// ==================== QUALITY TIME ====================

export async function logQualityTime(
  householdId: string,
  minutes: number,
  activity: string,
  notes?: string
): Promise<{ error?: string }> {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();

  const { error } = await supabase.from("quality_time_logs").insert({
    household_id: householdId,
    logged_by: userId,
    minutes,
    activity,
    notes: notes || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/partner");
  return {};
}

export async function getQualityTimeThisWeek(householdId: string): Promise<number> {
  if (DEV_MODE) return 0;
  const supabase = await createClient();
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const mondayStr = monday.toISOString().split("T")[0];

  const { data } = await supabase
    .from("quality_time_logs")
    .select("minutes")
    .eq("household_id", householdId)
    .gte("date", mondayStr);

  return (data ?? []).reduce((sum, r) => sum + ((r as { minutes: number }).minutes ?? 0), 0);
}

// ==================== RELATIONSHIP CHECK-IN ====================

export async function saveRelationshipCheckin(
  householdId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();

  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const weekStart = monday.toISOString().split("T")[0];

  const { error } = await supabase.from("relationship_checkins").upsert({
    household_id: householdId,
    profile_id: userId,
    week_start: weekStart,
    connection_score: Number(formData.get("connection")) || null,
    communication_score: Number(formData.get("communication")) || null,
    support_score: Number(formData.get("support")) || null,
    quality_time_score: Number(formData.get("quality_time")) || null,
    grateful_for: (formData.get("grateful_for") as string) || null,
    wish_for: (formData.get("wish_for") as string) || null,
    highlight: (formData.get("highlight") as string) || null,
  }, { onConflict: "household_id,profile_id,week_start" });

  if (error) return { error: error.message };
  revalidatePath("/partner");
  return {};
}

export async function getRelationshipHealth(householdId: string) {
  if (DEV_MODE) return { avgScore: null, trend: null, lastCheckin: null };
  const supabase = await createClient();

  const { data } = await supabase
    .from("relationship_checkins")
    .select("connection_score, communication_score, support_score, quality_time_score, week_start")
    .eq("household_id", householdId)
    .order("week_start", { ascending: false })
    .limit(8);

  if (!data || data.length === 0) return { avgScore: null, trend: null, lastCheckin: null };

  const latest = data[0];
  const scores = [latest.connection_score, latest.communication_score, latest.support_score, latest.quality_time_score].filter((s): s is number => s != null);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : null;

  // Trend: compare last 2 weeks
  let trend: "up" | "down" | "same" | null = null;
  if (data.length >= 2) {
    const prev = data[1];
    const prevScores = [prev.connection_score, prev.communication_score, prev.support_score, prev.quality_time_score].filter((s): s is number => s != null);
    const prevAvg = prevScores.length > 0 ? prevScores.reduce((a, b) => a + b, 0) / prevScores.length : null;
    if (avgScore != null && prevAvg != null) {
      const diff = avgScore - prevAvg;
      trend = Math.abs(diff) < 0.3 ? "same" : diff > 0 ? "up" : "down";
    }
  }

  return { avgScore, trend, lastCheckin: latest.week_start };
}

// ==================== SHARED CHALLENGES ====================

export async function createSharedChallenge(
  householdId: string,
  title: string,
  durationDays: number,
  description?: string
): Promise<{ error?: string }> {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();

  const { error } = await supabase.from("shared_challenges").insert({
    household_id: householdId,
    created_by: userId,
    title,
    description: description || null,
    duration_days: durationDays,
  });

  if (error) return { error: error.message };
  revalidatePath("/partner");
  return {};
}

export async function getSharedChallenges(householdId: string) {
  if (DEV_MODE) return [];
  const supabase = await createClient();

  const { data } = await supabase
    .from("shared_challenges")
    .select("*, shared_challenge_days(profile_id, date, completed)")
    .eq("household_id", householdId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return data ?? [];
}

// ==================== PARTNER MOOD SHARING ====================

export async function getPartnerMood(householdId: string, currentUserId: string) {
  if (DEV_MODE) return null;
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Find partner's profile_id
  const { data: members } = await supabase
    .from("household_members")
    .select("profile_id")
    .eq("household_id", householdId)
    .neq("profile_id", currentUserId);

  if (!members || members.length === 0) return null;
  const partnerId = members[0].profile_id;

  // Get partner's today's checkin
  const { data: checkin } = await supabase
    .from("daily_checkins")
    .select("mood_1_10, energy_1_10, morning_ritual_done")
    .eq("profile_id", partnerId)
    .eq("date", today)
    .single();

  if (!checkin) return null;

  // Get partner name
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", partnerId)
    .single();

  return {
    name: profile?.display_name ?? "Partner",
    mood: checkin.mood_1_10,
    energy: checkin.energy_1_10,
    hasCheckedIn: checkin.morning_ritual_done ?? false,
  };
}

export async function addListItemWithCategory(
  listId: string,
  text: string,
  category?: string
) {
  const userId = await getUserId();
  if (DEV_MODE) return { error: "Dev mode" };
  const supabase = await createClient();

  const { data: list } = await supabase
    .from("shared_lists")
    .select("items")
    .eq("id", listId)
    .single();

  if (!list) return { error: "Seznam nenalezen" };

  const items = (list.items as Array<Record<string, unknown>>) ?? [];
  items.push({
    text,
    category: category || null,
    addedBy: userId,
    addedAt: new Date().toISOString(),
    checked: false,
  });

  const { error } = await supabase
    .from("shared_lists")
    .update({ items })
    .eq("id", listId);

  if (error) return { error: error.message };
  revalidatePath("/partner");
  return { success: true };
}
