"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { awardXP } from "@/lib/logic/xp";
import { DEV_MODE, MOCK_USER_ID } from "@/lib/dev/mock-user";

export async function getBodyMetrics(userId: string, limit = 30) {
  if (DEV_MODE) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("body_metrics")
    .select("*")
    .eq("profile_id", userId)
    .order("date", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getLatestMetric(userId: string) {
  if (DEV_MODE) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("body_metrics")
    .select("*")
    .eq("profile_id", userId)
    .order("date", { ascending: false })
    .limit(1)
    .single();
  return data;
}

export async function logBodyMetric(formData: FormData) {
  const supabase = await createClient();
  let userId: string;
  if (DEV_MODE) {
    userId = MOCK_USER_ID;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nepřihlášen");
    userId = user.id;
  }

  const date = (formData.get("date") as string) || new Date().toISOString().split("T")[0];

  const { error } = await supabase.from("body_metrics").upsert({
    profile_id: userId,
    date,
    weight_kg: formData.get("weight_kg") ? Number(formData.get("weight_kg")) : null,
    body_fat_pct: formData.get("body_fat_pct") ? Number(formData.get("body_fat_pct")) : null,
    waist_cm: formData.get("waist_cm") ? Number(formData.get("waist_cm")) : null,
    chest_cm: formData.get("chest_cm") ? Number(formData.get("chest_cm")) : null,
    hip_cm: formData.get("hip_cm") ? Number(formData.get("hip_cm")) : null,
    thigh_cm: formData.get("thigh_cm") ? Number(formData.get("thigh_cm")) : null,
    arm_cm: formData.get("arm_cm") ? Number(formData.get("arm_cm")) : null,
    notes: (formData.get("notes") as string) || null,
    visibility: "private",
  }, { onConflict: "profile_id,date" });

  if (error) return { error: error.message };

  try {
    await awardXP(supabase, userId, 5, "Tělesné měření", "body_metric");
  } catch {}

  revalidatePath("/body");
  revalidatePath("/dashboard");
  return { success: true, xpAwarded: 5 };
}
