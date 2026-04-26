import { getAuthUser } from "@/lib/auth";
import { FAMILY_MODULE_ENABLED } from "@/lib/flags";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Lock } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import {
  getHousehold,
  getGottmanScore,
  getPartnerNotes,
  getSharedLists,
  getHouseholdTasks,
  getQualityTimeThisWeek,
  getRelationshipHealth,
  getSharedChallenges,
  getPartnerMood,
} from "@/app/(app)/partner/actions";
import { PartnerDashboard } from "./partner-dashboard";
import { SetupHousehold } from "./setup-household";
import { InvitePartner } from "./invite-partner";

export default async function PartnerPage() {
  const user = await getAuthUser();

  if (!FAMILY_MODULE_ENABLED) {
    return (
      <div className="space-y-6">
        <PageHeader icon={Heart} title="Partner & rodina" />
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <Lock size={48} className="mx-auto text-muted-foreground/30" />
            <h2 className="text-lg font-semibold">Tento modul zatím není aktivní</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Rodinný modul umožní sdílení kalendáře, partnerské vzkazy,
              sdílené úkoly a společné cíle.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch household data
  const householdData = await getHousehold(user.id);

  // State 1: No household
  if (!householdData) {
    return (
      <div className="space-y-6">
        <PageHeader icon={Heart} title="Partner & rodina" />
        <SetupHousehold />
      </div>
    );
  }

  const { household: rawHousehold, members, invites } = householdData;
  const household = Array.isArray(rawHousehold) ? rawHousehold[0] : rawHousehold;
  const partnerMembers = members.filter((m: Record<string, unknown>) => m.profile_id !== user.id);
  const hasPartner = partnerMembers.length > 0;

  // State 2: Household but no partner
  if (!hasPartner) {
    return (
      <div className="space-y-6">
        <PageHeader icon={Heart} title="Partner & rodina" />
        <InvitePartner
          householdName={household?.name ?? "Domácnost"}
          householdId={household?.id ?? ""}
          invites={invites}
        />
      </div>
    );
  }

  // State 3: Full relationship dashboard
  const householdId = household?.id;
  if (!householdId) return null;

  const [gottmanScore, notes, sharedLists, tasks, qualityTimeMinutes, relationshipHealth, challenges, partnerMood] = await Promise.all([
    getGottmanScore(householdId),
    getPartnerNotes(householdId, 20),
    getSharedLists(householdId),
    getHouseholdTasks(householdId),
    getQualityTimeThisWeek(householdId),
    getRelationshipHealth(householdId),
    getSharedChallenges(householdId),
    getPartnerMood(householdId, user.id),
  ]);

  const partnerName =
    (partnerMembers[0]?.profiles as { display_name?: string } | null)
      ?.display_name ?? "Partner";

  return (
    <div className="space-y-6">
      <PageHeader icon={Heart} title="Partner & rodina">
        <span className="text-xs text-muted-foreground font-medium">
          s {partnerName}
        </span>
      </PageHeader>

      <PartnerDashboard
        gottmanScore={gottmanScore}
        notes={notes}
        sharedLists={sharedLists}
        currentUserId={user.id}
        householdId={householdId}
        tasks={tasks}
        qualityTimeMinutes={qualityTimeMinutes}
        relationshipHealth={relationshipHealth}
        challenges={challenges}
        partnerMood={partnerMood}
        partnerName={partnerName}
      />
    </div>
  );
}
