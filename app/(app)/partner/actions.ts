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
