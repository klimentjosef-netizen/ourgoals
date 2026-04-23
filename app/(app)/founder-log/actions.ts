"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { FounderLogEntry } from "@/types/founder-log";
import { DEV_MODE, MOCK_USER_ID } from "@/lib/dev/mock-user";

export async function getFounderLogEntries(
  userId: string,
  limit: number = 50
): Promise<FounderLogEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("founder_log")
    .select("*")
    .eq("profile_id", userId)
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Chyba při načítání záznamů: ${error.message}`);
  }

  return (data ?? []) as FounderLogEntry[];
}

export async function createFounderLogEntry(formData: FormData) {
  const supabase = await createClient();
  let userId: string;
  if (DEV_MODE) {
    userId = MOCK_USER_ID;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nepřihlášen");
    userId = user.id;
  }

  const insight = formData.get("insight") as string;
  const category = formData.get("category") as string;
  const priority_1_5 = formData.get("priority_1_5")
    ? Number(formData.get("priority_1_5"))
    : null;
  const notes = (formData.get("notes") as string) || null;
  const date =
    (formData.get("date") as string) ||
    new Date().toISOString().split("T")[0];

  const { error } = await supabase.from("founder_log").insert({
    profile_id: userId,
    insight,
    category,
    priority_1_5,
    notes,
    date,
  });

  if (error) {
    return { error: `Chyba při vytváření záznamu: ${error.message}` };
  }

  revalidatePath("/founder-log");

  return { success: true };
}

export async function updateFounderLogEntry(id: string, formData: FormData) {
  const supabase = await createClient();
  let userId: string;
  if (DEV_MODE) {
    userId = MOCK_USER_ID;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nepřihlášen");
    userId = user.id;
  }

  const insight = formData.get("insight") as string;
  const category = formData.get("category") as string;
  const priority_1_5 = formData.get("priority_1_5")
    ? Number(formData.get("priority_1_5"))
    : null;
  const notes = (formData.get("notes") as string) || null;
  const date =
    (formData.get("date") as string) ||
    new Date().toISOString().split("T")[0];

  const { error } = await supabase
    .from("founder_log")
    .update({
      insight,
      category,
      priority_1_5,
      notes,
      date,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("profile_id", userId);

  if (error) {
    return { error: `Chyba při aktualizaci záznamu: ${error.message}` };
  }

  revalidatePath("/founder-log");

  return { success: true };
}

export async function deleteFounderLogEntry(id: string) {
  const supabase = await createClient();
  let userId: string;
  if (DEV_MODE) {
    userId = MOCK_USER_ID;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nepřihlášen");
    userId = user.id;
  }

  const { error } = await supabase
    .from("founder_log")
    .delete()
    .eq("id", id)
    .eq("profile_id", userId);

  if (error) {
    return { error: `Chyba při mazání záznamu: ${error.message}` };
  }

  revalidatePath("/founder-log");

  return { success: true };
}
