import { getAuthUser } from "@/lib/auth";
import { FAMILY_MODULE_ENABLED } from "@/lib/flags";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Lock, MessageCircle, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import {
  getHousehold,
  getGottmanScore,
  getPartnerNotes,
  getSharedLists,
} from "@/app/(app)/partner/actions";
import { PartnerDashboard } from "./partner-dashboard";
import { SetupHousehold } from "./setup-household";
import { InvitePartner } from "./invite-partner";

export default async function PartnerPage() {
  const user = await getAuthUser();

  if (!FAMILY_MODULE_ENABLED) {
    return (
      <div className="space-y-6">
        <PageHeader icon={Heart} title="Partner" />

        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <Lock size={48} className="mx-auto text-muted-foreground/30" />
            <h2 className="text-lg font-semibold">
              Tento modul zatím není aktivní
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Rodinný modul umožní sdílení kalendáře, partnerské vzkazy
              (vděčnost, přání), sdílené nákupní seznamy a společné cíle.
              Aktivuje se po rozhovoru s partnerem.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <Heart size={20} className="text-pink-500" />
                <p className="text-xs font-medium">Partnerské vzkazy</p>
                <p className="text-[10px] text-muted-foreground">
                  Vděčnost, přání, oslavy (Gottman 5:1)
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <MessageCircle size={20} className="text-blue-500" />
                <p className="text-xs font-medium">Sdílený kalendář</p>
                <p className="text-[10px] text-muted-foreground">
                  Společné eventy, dětské dny, plánování
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <ShoppingCart size={20} className="text-green-500" />
                <p className="text-xs font-medium">Sdílené seznamy</p>
                <p className="text-[10px] text-muted-foreground">
                  Nákupy, úkoly, nápady – společně
                </p>
              </div>
            </div>
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
        <PageHeader icon={Heart} title="Partner" />
        <SetupHousehold />
      </div>
    );
  }

  const { household: rawHousehold, members, invites } = householdData;
  // Supabase join may return array or object
  const household = Array.isArray(rawHousehold) ? rawHousehold[0] : rawHousehold;
  const partnerMembers = members.filter((m: Record<string, unknown>) => m.profile_id !== user.id);
  const hasPartner = partnerMembers.length > 0;

  // State 2: Household but no partner
  if (!hasPartner) {
    return (
      <div className="space-y-6">
        <PageHeader icon={Heart} title="Partner" />
        <InvitePartner
          householdName={household?.name ?? "Domácnost"}
          invites={invites}
        />
      </div>
    );
  }

  // State 3: Full relationship dashboard
  const householdId = household?.id;
  if (!householdId) {
    return null;
  }

  const [gottmanScore, notes, sharedLists] = await Promise.all([
    getGottmanScore(householdId),
    getPartnerNotes(householdId, 20),
    getSharedLists(householdId),
  ]);

  const partnerName =
    (partnerMembers[0]?.profiles as { display_name?: string } | null)
      ?.display_name ?? "Partner";

  return (
    <div className="space-y-6">
      <PageHeader icon={Heart} title="Partner">
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
      />
    </div>
  );
}
