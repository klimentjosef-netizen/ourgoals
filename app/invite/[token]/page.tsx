import { createClient } from "@/lib/supabase/server";
import { DEV_MODE } from "@/lib/dev/mock-user";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { acceptInvite } from "@/app/(app)/partner/actions";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

async function getInviteByToken(token: string) {
  if (DEV_MODE) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("household_invites")
    .select("*, households(id, name)")
    .eq("token", token)
    .single();
  return data;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  let isLoggedIn = false;
  if (!DEV_MODE) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      isLoggedIn = !!user;
    } catch { isLoggedIn = false; }
  }

  const invite = await getInviteByToken(token);

  if (DEV_MODE || !invite) {
    return (
      <InviteLayout>
        <IconCircle icon={AlertCircle} className="bg-red-100 dark:bg-red-900/20 text-red-500" />
        <h1 className="text-xl font-bold">Neplatná pozvánka</h1>
        <p className="text-sm text-muted-foreground">Pozvánka neexistuje nebo byla použita.</p>
        <Link href="/"><Button variant="outline">Zpět na úvod</Button></Link>
      </InviteLayout>
    );
  }

  if (invite.accepted_at) {
    return (
      <InviteLayout>
        <IconCircle icon={CheckCircle2} className="bg-green-100 dark:bg-green-900/20 text-green-600" />
        <h1 className="text-xl font-bold">Pozvánka již přijata</h1>
        <Link href="/partner"><Button>Přejít na Partner</Button></Link>
      </InviteLayout>
    );
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <InviteLayout>
        <IconCircle icon={Clock} className="bg-amber-100 dark:bg-amber-900/20 text-amber-500" />
        <h1 className="text-xl font-bold">Pozvánka vypršela</h1>
        <p className="text-sm text-muted-foreground">Požádej partnera o novou pozvánku.</p>
        <Link href="/"><Button variant="outline">Zpět na úvod</Button></Link>
      </InviteLayout>
    );
  }

  const householdName = (invite.households as { name: string } | null)?.name ?? "Domácnost";

  if (!isLoggedIn) {
    return (
      <InviteLayout>
        <IconCircle icon={Users} className="bg-primary/10 text-primary" />
        <h1 className="text-xl font-bold">Pozvánka do domácnosti</h1>
        <p className="text-base font-medium">{householdName}</p>
        <p className="text-sm text-muted-foreground">Pro přijetí se nejprve přihlas.</p>
        <Link href={`/login?redirect=/invite/${token}`}>
          <Button className="w-full max-w-xs">Přihlásit se</Button>
        </Link>
      </InviteLayout>
    );
  }

  async function handleAccept() {
    "use server";
    await acceptInvite(token);
    redirect("/partner");
  }

  return (
    <InviteLayout>
      <IconCircle icon={Users} className="bg-primary/10 text-primary" />
      <h1 className="text-xl font-bold">Pozvánka do domácnosti</h1>
      <p className="text-base font-medium">{householdName}</p>
      <p className="text-sm text-muted-foreground max-w-sm">
        Po přijetí budete sdílet partnerské vzkazy, nákupní seznamy a společné cíle.
      </p>
      <form action={handleAccept} className="w-full max-w-xs">
        <Button type="submit" className="w-full">Přijmout pozvánku</Button>
      </form>
    </InviteLayout>
  );
}

function InviteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 to-background">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4 text-center">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

function IconCircle({ icon: Icon, className }: { icon: React.ComponentType<{ className?: string }>; className: string }) {
  return (
    <div className={`flex h-16 w-16 items-center justify-center rounded-full ${className}`}>
      <Icon className="h-8 w-8" />
    </div>
  );
}
