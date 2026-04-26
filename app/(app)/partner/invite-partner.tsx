"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Send, Link2, Copy, Check } from "lucide-react";
import { invitePartner, createInviteLink } from "@/app/(app)/partner/actions";
import { toast } from "sonner";

interface Invite {
  id: string;
  email: string;
  accepted_at: string | null;
  expires_at: string;
}

interface InvitePartnerProps {
  householdName: string;
  householdId: string;
  invites: Invite[];
}

export function InvitePartner({ householdName, householdId, invites }: InvitePartnerProps) {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleInvite() {
    if (!email.trim()) return;
    startTransition(async () => {
      const result = await invitePartner(email.trim());
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Pozvánka odeslána!");
      setEmail("");
    });
  }

  function handleCreateLink() {
    startTransition(async () => {
      // Need household_id — get from first pending invite or create one
      const result = await createInviteLink(householdId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.link) {
        setInviteLink(result.link);
      }
    });
  }

  async function handleCopyLink() {
    if (!inviteLink) return;
    try {
      // Try native share first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: `Připoj se k domácnosti ${householdName}`,
          text: "Pozvaní do společného prostoru v OurGoals",
          url: inviteLink,
        });
        return;
      }
      // Fallback to clipboard
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Link zkopírován!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Nepodařilo se zkopírovat");
    }
  }

  const pendingInvites = invites.filter((i) => !i.accepted_at);

  return (
    <div className="space-y-4">
      {/* Household info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart size={18} className="text-pink-500" />
            {householdName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center">
              <Heart size={28} className="text-pink-400" fill="currentColor" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Zatím jsi tu sám/sama. Pozvi partnera a začněte sdílet
              cíle, vzkazy a kalendář!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Invite by link — primary method */}
      <Card className="border-pink-200/50 dark:border-pink-800/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Link2 size={14} className="text-pink-500" />
            Sdílet odkaz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Partner klikne na odkaz, zaregistruje se a automaticky se připojí k tvé domácnosti.
          </p>

          {inviteLink ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="flex-1 text-xs font-mono"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Zkopírováno" : "Kopírovat"}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">Platnost: 7 dní</p>
            </div>
          ) : (
            <Button
              onClick={handleCreateLink}
              disabled={isPending}
              className="w-full h-11 bg-pink-600 hover:bg-pink-700 text-white"
            >
              <Link2 size={16} className="mr-2" />
              {isPending ? "Generuji..." : "Vytvořit pozvánkový odkaz"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Invite by email — secondary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Send size={14} />
            Nebo pozvat emailem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail partnera"
              type="email"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); handleInvite(); }
              }}
            />
            <Button
              onClick={handleInvite}
              disabled={isPending || !email.trim()}
              variant="outline"
            >
              <Send size={14} />
            </Button>
          </div>

          {pendingInvites.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground font-medium">Čekající pozvánky</p>
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between py-1.5">
                  <span className="text-sm">{invite.email}</span>
                  <Badge variant="outline" className="text-[10px]">Čeká</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
