"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import type { CoachTone } from "@/types/gamification";

interface CoachMessageProps {
  tone: CoachTone;
  streak: number;
  morningDone: boolean;
  eveningDone: boolean;
  displayName: string;
}

function getGreeting(tone: CoachTone, name: string): string {
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "Dobré ráno" : hour < 18 ? "Dobré odpoledne" : "Dobrý večer";

  switch (tone) {
    case "strict_coach":
      return `${timeGreeting}. Čas makat.`;
    case "friendly_mentor":
      return `${timeGreeting}, ${name}! Jak se dnes máš?`;
    case "calm_analyst":
      return `${timeGreeting}. Pojďme na data.`;
    case "energetic_motivator":
      return `${timeGreeting.toUpperCase()}, ${name}! Nový den, nové šance!`;
    case "minimal":
      return timeGreeting;
    default:
      return `${timeGreeting}, ${name}!`;
  }
}

function getDailyMessage(
  tone: CoachTone,
  streak: number,
  morningDone: boolean,
  eveningDone: boolean
): string {
  if (tone === "minimal") return "";

  // Suggest action based on state
  if (!morningDone) {
    switch (tone) {
      case "strict_coach":
        return "Ranní check-in čeká. Žádné výmluvy.";
      case "friendly_mentor":
        return "Začni den ranním check-inem — zabere to minutu!";
      case "calm_analyst":
        return "Ranní check-in: nevyplněn. Priorita: vyplnit.";
      case "energetic_motivator":
        return "Pojď do toho! Ranní check-in tě nastartuje!";
      default:
        return "Nezapomeň na ranní check-in.";
    }
  }

  if (morningDone && !eveningDone) {
    if (streak > 7) {
      switch (tone) {
        case "strict_coach":
          return `Streak ${streak} dní. Neztrácej ho. Večerní check-in tě čeká.`;
        case "friendly_mentor":
          return `Skvělý streak — ${streak} dní! Večerní check-in ho posílí.`;
        case "calm_analyst":
          return `Streak: ${streak}. Večerní check-in: pending.`;
        case "energetic_motivator":
          return `WOW, ${streak} dní v řadě! Dnes to dotáhni do konce!`;
        default:
          return `Streak: ${streak} dní. Dokonči večerní check-in.`;
      }
    }
    switch (tone) {
      case "strict_coach":
        return "Ráno hotovo. Teď dodělej zbytek dne a dokonči to večer.";
      case "friendly_mentor":
        return "Super start dne! Nezapomeň večer na check-in.";
      case "calm_analyst":
        return "Ranní check-in: OK. Čeká: večerní check-in.";
      case "energetic_motivator":
        return "Skvělé ráno za sebou! Dnes to bude perfektní den!";
      default:
        return "Ranní check-in hotový. Večerní tě čeká.";
    }
  }

  // Both done
  switch (tone) {
    case "strict_coach":
      return "Oba check-iny hotové. Dobrá práce. Zítra znovu.";
    case "friendly_mentor":
      return "Dnes jsi to zvládl na jedničku! Odpočiň si a zítra znovu.";
    case "calm_analyst":
      return `Check-iny: kompletní. Streak: ${streak}.`;
    case "energetic_motivator":
      return "HOTOVO! Perfektní den! Zítra to opakujeme!";
    default:
      return "Dnešní check-iny kompletní.";
  }
}

export function CoachMessage({
  tone,
  streak,
  morningDone,
  eveningDone,
  displayName,
}: CoachMessageProps) {
  if (tone === "minimal") return null;

  const greeting = getGreeting(tone, displayName);
  const message = getDailyMessage(tone, streak, morningDone, eveningDone);

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="pt-2">
        <div className="flex gap-3">
          <MessageCircle
            size={20}
            className="text-primary shrink-0 mt-0.5"
          />
          <div>
            <p className="font-medium text-sm">{greeting}</p>
            {message && (
              <p className="text-sm text-muted-foreground mt-1">{message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
