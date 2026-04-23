"use server";

import { XP_VALUES, getLevelForXP } from "@/types/gamification";
import type { SupabaseClient } from "@supabase/supabase-js";

// XP_VALUES imported from types/gamification.ts directly by consumers

interface AwardXPResult {
  newTotal: number;
  leveledUp: boolean;
  newLevel?: number;
  newTitle?: string;
}

export async function awardXP(
  supabase: SupabaseClient,
  profileId: string,
  amount: number,
  reason: string,
  sourceType?: string,
  sourceId?: string
): Promise<AwardXPResult> {
  // Insert ledger entry
  const { error: ledgerError } = await supabase.from("xp_ledger").insert({
    profile_id: profileId,
    amount,
    reason,
    source_type: sourceType ?? null,
    source_id: sourceId ?? null,
  });

  if (ledgerError) {
    throw new Error(`Chyba při zápisu XP: ${ledgerError.message}`);
  }

  // Get current profile
  const { data: profile, error: profileError } = await supabase
    .from("gamification_profiles")
    .select("total_xp, level, title")
    .eq("profile_id", profileId)
    .single();

  if (profileError || !profile) {
    throw new Error(`Profil nenalezen: ${profileError?.message}`);
  }

  const oldLevel = profile.level;
  const newTotal = profile.total_xp + amount;
  const newLevelDef = getLevelForXP(newTotal);
  const leveledUp = newLevelDef.level > oldLevel;

  // Update profile
  const { error: updateError } = await supabase
    .from("gamification_profiles")
    .update({
      total_xp: newTotal,
      level: newLevelDef.level,
      title: newLevelDef.title,
      updated_at: new Date().toISOString(),
    })
    .eq("profile_id", profileId);

  if (updateError) {
    throw new Error(`Chyba při aktualizaci profilu: ${updateError.message}`);
  }

  return {
    newTotal,
    leveledUp,
    ...(leveledUp && {
      newLevel: newLevelDef.level,
      newTitle: newLevelDef.title,
    }),
  };
}
