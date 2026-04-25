"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { awardXP } from "@/lib/logic/xp";
import { DEV_MODE, MOCK_USER_ID } from "@/lib/dev/mock-user";

export async function getCalendarEvents(
  userId: string,
  rangeStart: string,
  rangeEnd: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("owner_id", userId)
    .or(
      `and(starts_at.gte.${rangeStart},starts_at.lte.${rangeEnd}),and(all_day.eq.true,starts_at.lte.${rangeEnd},ends_at.gte.${rangeStart})`
    )
    .order("starts_at", { ascending: true });

  if (error) {
    return { error: error.message, events: [] };
  }

  return { events: data ?? [] };
}

export async function createCalendarEvent(formData: FormData) {
  const supabase = await createClient();
  let userId: string;
  if (DEV_MODE) {
    userId = MOCK_USER_ID;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nepřihlášen");
    userId = user.id;
  }

  const title = formData.get("title") as string;
  const kind = formData.get("kind") as string;
  const date = formData.get("date") as string;
  const allDay = formData.get("all_day") === "on";
  const startsAtTime = formData.get("starts_at_time") as string;
  const endsAtTime = formData.get("ends_at_time") as string;
  const rrule = (formData.get("rrule") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const reminderStr = formData.get("reminder_minutes") as string;
  const reminderMinutes = reminderStr && reminderStr !== "none" ? parseInt(reminderStr, 10) : null;

  let startsAt: string | null = null;
  let endsAt: string | null = null;

  if (allDay) {
    startsAt = `${date}T00:00:00`;
    endsAt = `${date}T23:59:59`;
  } else {
    startsAt = startsAtTime ? `${date}T${startsAtTime}:00` : null;
    endsAt = endsAtTime ? `${date}T${endsAtTime}:00` : null;
  }

  const { data: event, error } = await supabase
    .from("calendar_events")
    .insert({
      owner_id: userId,
      title,
      kind,
      starts_at: startsAt,
      ends_at: endsAt,
      all_day: allDay,
      rrule: rrule === "none" ? null : rrule,
      notes,
      reminder_minutes: reminderMinutes,
      visibility: "private",
      is_completed: false,
    })
    .select()
    .single();

  if (error) {
    return { error: `Chyba při vytváření eventu: ${error.message}` };
  }

  // Award XP
  let xpResult;
  try {
    xpResult = await awardXP(
      supabase,
      userId,
      10,
      "Nový event v kalendáři",
      "calendar_event",
      event.id
    );
  } catch {
    // XP award failure is non-critical
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");

  return {
    event,
    xpAwarded: 10,
    leveledUp: xpResult?.leveledUp ?? false,
    newLevel: xpResult?.newLevel,
    newTitle: xpResult?.newTitle,
  };
}

export async function updateCalendarEvent(id: string, formData: FormData) {
  const supabase = await createClient();
  let userId: string;
  if (DEV_MODE) {
    userId = MOCK_USER_ID;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nepřihlášen");
    userId = user.id;
  }

  const title = formData.get("title") as string;
  const kind = formData.get("kind") as string;
  const date = formData.get("date") as string;
  const allDay = formData.get("all_day") === "on";
  const startsAtTime = formData.get("starts_at_time") as string;
  const endsAtTime = formData.get("ends_at_time") as string;
  const rrule = (formData.get("rrule") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const reminderStr = formData.get("reminder_minutes") as string;
  const reminderMinutes = reminderStr && reminderStr !== "none" ? parseInt(reminderStr, 10) : null;

  let startsAt: string | null = null;
  let endsAt: string | null = null;

  if (allDay) {
    startsAt = `${date}T00:00:00`;
    endsAt = `${date}T23:59:59`;
  } else {
    startsAt = startsAtTime ? `${date}T${startsAtTime}:00` : null;
    endsAt = endsAtTime ? `${date}T${endsAtTime}:00` : null;
  }

  const { error } = await supabase
    .from("calendar_events")
    .update({
      title,
      kind,
      starts_at: startsAt,
      ends_at: endsAt,
      all_day: allDay,
      rrule: rrule === "none" ? null : rrule,
      notes,
      reminder_minutes: reminderMinutes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("owner_id", userId);

  if (error) {
    return { error: `Chyba při aktualizaci: ${error.message}` };
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function deleteCalendarEvent(id: string) {
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
    .from("calendar_events")
    .delete()
    .eq("id", id)
    .eq("owner_id", userId);

  if (error) {
    return { error: `Chyba při mazání: ${error.message}` };
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");

  return { success: true };
}

/** FEATURE 4: Přesun eventu na nový čas */
export async function moveEvent(
  eventId: string,
  newStartsAt: string,
  newEndsAt: string
) {
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
    .from("calendar_events")
    .update({
      starts_at: newStartsAt,
      ends_at: newEndsAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .eq("owner_id", userId);

  if (error) {
    return { error: `Chyba při přesunu: ${error.message}` };
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");

  return { success: true };
}

/** FEATURE 3: Načti nastavení uživatelských modulů pro virtuální eventy */
export async function getUserModuleSettings(userId: string) {
  const supabase = await createClient();

  // Zkus načíst user_settings tabulku
  const { data: settings } = await supabase
    .from("user_settings")
    .select("bedtime_target, wake_target")
    .eq("user_id", userId)
    .single();

  // Zkontroluj, jestli má aktivní moduly
  const { data: modules } = await supabase
    .from("user_modules")
    .select("module_key, is_active")
    .eq("user_id", userId);

  const activeModules = new Set(
    (modules ?? []).filter((m) => m.is_active).map((m) => m.module_key)
  );

  return {
    enableSleep: activeModules.has("sleep"),
    bedtimeTarget: settings?.bedtime_target ?? null,
    wakeTarget: settings?.wake_target ?? null,
    enableCheckin: activeModules.has("checkin"),
  };
}

export async function toggleEventCompleted(id: string) {
  const supabase = await createClient();
  let userId: string;
  if (DEV_MODE) {
    userId = MOCK_USER_ID;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nepřihlášen");
    userId = user.id;
  }

  // Fetch current state
  const { data: event, error: fetchError } = await supabase
    .from("calendar_events")
    .select("is_completed")
    .eq("id", id)
    .eq("owner_id", userId)
    .single();

  if (fetchError || !event) {
    return { error: "Event nenalezen" };
  }

  const { error } = await supabase
    .from("calendar_events")
    .update({
      is_completed: !event.is_completed,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("owner_id", userId);

  if (error) {
    return { error: `Chyba: ${error.message}` };
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");

  return { success: true, isCompleted: !event.is_completed };
}
