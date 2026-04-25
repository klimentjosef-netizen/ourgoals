import { getAuthUser } from "@/lib/auth";
import { FAMILY_MODULE_ENABLED } from "@/lib/flags";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Heart, MessageCircle, ShoppingCart, Lock } from "lucide-react";

export default async function PartnerPage() {
  await getAuthUser();

  if (!FAMILY_MODULE_ENABLED) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Users size={24} className="text-primary" />
          <h1 className="text-xl font-bold">Rodina & partner</h1>
        </div>

        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <Lock size={48} className="mx-auto text-muted-foreground/30" />
            <h2 className="text-lg font-semibold">Tento modul zatím není aktivní</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Rodinný modul umožní sdílení kalendáře, partnerské vzkazy (vděčnost, přání),
              sdílené nákupní seznamy a společné cíle. Aktivuje se po rozhovoru s partnerem.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                <Heart size={20} className="text-pink-500" />
                <p className="text-xs font-medium">Partner notes</p>
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

  // TODO: Active family module UI when FAMILY_MODULE_ENABLED = true
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users size={24} className="text-primary" />
        <h1 className="text-xl font-bold">Rodina & partner</h1>
      </div>
      <p className="text-muted-foreground text-sm">Modul je aktivní. Implementace probíhá.</p>
    </div>
  );
}
