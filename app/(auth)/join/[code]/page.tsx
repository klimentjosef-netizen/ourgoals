import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function JoinPage({ params }: PageProps) {
  const { code } = await params;
  const supabase = await createClient();

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  // Find invite by token
  const { data: invite } = await supabase
    .from("household_invites")
    .select("id, household_id, accepted_at, expires_at, households(name)")
    .eq("token", code)
    .single();

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <AlertTriangle size={48} className="mx-auto text-amber-500" />
            <h1 className="text-xl font-bold">Pozvánka nenalezena</h1>
            <p className="text-sm text-muted-foreground">
              Tento odkaz je neplatný nebo vypršel.
            </p>
            <Link href="/login">
              <Button variant="outline">Přihlásit se</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invite.accepted_at) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <Heart size={48} className="mx-auto text-pink-500" />
            <h1 className="text-xl font-bold">Pozvánka již přijata</h1>
            <p className="text-sm text-muted-foreground">
              Tato pozvánka už byla použita.
            </p>
            <Link href="/dashboard">
              <Button>Přejít na Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <AlertTriangle size={48} className="mx-auto text-amber-500" />
            <h1 className="text-xl font-bold">Pozvánka vypršela</h1>
            <p className="text-sm text-muted-foreground">
              Požádej partnera o nový odkaz.
            </p>
            <Link href="/login">
              <Button variant="outline">Přihlásit se</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rawHousehold = invite.households;
  const household = Array.isArray(rawHousehold) ? rawHousehold[0] : rawHousehold;
  const householdName = (household as { name?: string } | null)?.name ?? "Domácnost";

  // If user is logged in, accept invite and redirect
  if (user) {
    // Check if already member
    const { data: existing } = await supabase
      .from("household_members")
      .select("profile_id")
      .eq("household_id", invite.household_id)
      .eq("profile_id", user.id)
      .single();

    if (!existing) {
      await supabase.from("household_members").insert({
        household_id: invite.household_id,
        profile_id: user.id,
        role: "adult",
      });

      await supabase
        .from("household_invites")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invite.id);
    }

    redirect("/partner");
  }

  // User not logged in — show invite details + register/login links
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-pink-50/50 to-background dark:from-pink-950/10">
      <Card className="max-w-sm w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mx-auto">
            <Heart size={36} className="text-pink-500" fill="currentColor" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold">Pozvánka do domácnosti</h1>
            <p className="text-lg font-semibold text-pink-600 dark:text-pink-400">
              {householdName}
            </p>
            <p className="text-sm text-muted-foreground">
              Někdo tě zve do společného prostoru v OurGoals.
              Sdílejte cíle, vzkazy a kalendář.
            </p>
          </div>

          <div className="space-y-3">
            <Link href={`/login?redirect=/join/${code}`} className="block">
              <Button className="w-full h-12 bg-pink-600 hover:bg-pink-700 text-white">
                Zaregistrovat se a připojit
              </Button>
            </Link>
            <Link href={`/login?redirect=/join/${code}`} className="block">
              <Button variant="outline" className="w-full h-11">
                Už mám účet — přihlásit se
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
