"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateDisplayName(name: string) {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 100) {
    return { error: "Jméno musí mít 1–100 znaků." };
  }

  const user = await getAuthUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: trimmed })
    .eq("id", user.id);

  if (error) {
    return { error: "Nepodařilo se uložit jméno." };
  }

  revalidatePath("/profile");
  return { success: true };
}
