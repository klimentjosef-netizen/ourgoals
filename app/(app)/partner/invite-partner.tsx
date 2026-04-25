"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Send } from "lucide-react";
import { invitePartner } from "@/app/(app)/partner/actions";
import { toast } from "sonner";

interface Invite {
  id: string;
  email: string;
  accepted_at: string | null;
  expires_at: string;
}

interface InvitePartnerProps {
  householdName: string;
  invites: Invite[];
}

export function InvitePartner({ householdName, invites }: InvitePartnerProps) {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

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
              <Heart
                size={28}
                className="text-pink-400"
                fill="currentColor"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Zatím jsi tu sám/sama. Pozvi partnera a začněte sdílet
              cíle, vzkazy a kalendář!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Invite form */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Pozvat partnera
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
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleInvite();
                }
              }}
            />
            <Button
              onClick={handleInvite}
              disabled={isPending || !email.trim()}
              className="bg-pink-600 hover:bg-pink-700 text-white"
            >
              <Send size={14} />
              {isPending ? "Posílám..." : "Pozvat"}
            </Button>
          </div>

          {/* Pending invites */}
          {pendingInvites.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground font-medium">
                Čekající pozvánky
              </p>
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between py-1.5"
                >
                  <span className="text-sm">{invite.email}</span>
                  <Badge variant="outline" className="text-[10px]">
                    Čeká na přijetí
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
