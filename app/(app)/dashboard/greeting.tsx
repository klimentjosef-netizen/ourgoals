"use client";

import type { CoachTone } from "@/types/gamification";

const CZECH_DAYS = [
  "Neděle",
  "Pondělí",
  "Úterý",
  "Středa",
  "Čtvrtek",
  "Pátek",
  "Sobota",
];

const CZECH_MONTHS = [
  "ledna",
  "února",
  "března",
  "dubna",
  "května",
  "června",
  "července",
  "srpna",
  "září",
  "října",
  "listopadu",
  "prosince",
];

interface DashboardGreetingProps {
  displayName: string;
  coachTone: CoachTone;
  streak: number;
  morningDone: boolean;
  eveningDone: boolean;
}

function getCoachMessage(
  tone: CoachTone,
  streak: number,
  morningDone: boolean,
  eveningDone: boolean
): string {
  if (tone === "minimal") return "";

  if (!morningDone) {
    switch (tone) {
      case "strict_coach":
        return "Ranní check-in čeká. Žádné výmluvy.";
      case "friendly_mentor":
        return "Začni den ranním check-inem, zabere to minutu!";
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
          return `Skvělý streak, ${streak} dní! Dnes to dotáhni.`;
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

export function DashboardGreeting({
  displayName,
  coachTone,
  streak,
  morningDone,
  eveningDone,
}: DashboardGreetingProps) {
  const now = new Date();
  const hour = now.getHours();

  const timeEmoji = hour < 12 ? "🌅" : hour < 18 ? "☀️" : "🌙";
  const timeGreeting =
    hour < 12
      ? "Dobré ráno"
      : hour < 18
        ? "Dobré odpoledne"
        : "Dobrý večer";

  const dayName = CZECH_DAYS[now.getDay()];
  const day = now.getDate();
  const month = CZECH_MONTHS[now.getMonth()];
  const year = now.getFullYear();

  const coachMessage = getCoachMessage(coachTone, streak, morningDone, eveningDone);

  return (
    <div>
      <h1 className="text-2xl font-bold">
        {timeEmoji} {timeGreeting}, {displayName}!
      </h1>
      <p className="text-sm text-muted-foreground">
        {dayName} {day}. {month} {year}
      </p>
      {coachMessage && (
        <p className="text-sm text-muted-foreground mt-1.5 italic">
          &ldquo;{coachMessage}&rdquo;
        </p>
      )}
    </div>
  );
}
