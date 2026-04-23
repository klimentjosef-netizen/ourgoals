export const XP_VALUES = {
  MORNING_CHECKIN: 10,
  EVENING_CHECKIN: 10,
  HABIT_COMPLETED: 15,
  GOAL_CREATED: 25,
  GOAL_COMPLETED: 100,
  WEIGHT_LOGGED: 5,
  SLEEP_LOGGED: 5,
  PERFECT_DAY_BONUS: 0, // calculated as sum of day's XP (2x effect)
} as const;

export interface LevelDefinition {
  level: number;
  xpRequired: number;
  title: string;
}

export const LEVEL_THRESHOLDS: LevelDefinition[] = Array.from(
  { length: 50 },
  (_, i) => {
    const level = i + 1;
    const xpRequired = level === 1 ? 0 : Math.floor(50 * Math.pow(level, 1.5));
    let title: string;
    if (level < 5) title = "Nováček";
    else if (level < 10) title = "Svědomitý";
    else if (level < 15) title = "Disciplinovaný";
    else if (level < 25) title = "Bojovník";
    else if (level < 40) title = "Mistr";
    else title = "Legenda";
    return { level, xpRequired, title };
  }
);

export function getLevelForXP(totalXP: number): LevelDefinition {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i].xpRequired) {
      return LEVEL_THRESHOLDS[i];
    }
  }
  return LEVEL_THRESHOLDS[0];
}

export function getXPProgress(totalXP: number): {
  currentLevel: number;
  title: string;
  currentXP: number;
  nextLevelXP: number;
  percentage: number;
} {
  const current = getLevelForXP(totalXP);
  const nextIdx = LEVEL_THRESHOLDS.findIndex(
    (l) => l.level === current.level + 1
  );
  const nextLevelXP =
    nextIdx >= 0 ? LEVEL_THRESHOLDS[nextIdx].xpRequired : current.xpRequired;
  const xpInLevel = totalXP - current.xpRequired;
  const xpNeeded = nextLevelXP - current.xpRequired;
  const percentage = xpNeeded > 0 ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100;

  return {
    currentLevel: current.level,
    title: current.title,
    currentXP: totalXP,
    nextLevelXP,
    percentage,
  };
}

export type AchievementCategory =
  | "streak"
  | "training"
  | "nutrition"
  | "sleep"
  | "consistency"
  | "social"
  | "milestone";

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  xp_reward: number;
  condition_json: Record<string, unknown>;
}

export type CoachTone =
  | "strict_coach"
  | "friendly_mentor"
  | "calm_analyst"
  | "energetic_motivator"
  | "minimal";

export const COACH_TONES: {
  id: CoachTone;
  label: string;
  description: string;
  example: string;
}[] = [
  {
    id: "strict_coach",
    label: "Přísný kouč",
    description: "Žádné výmluvy. Přímý, nulová empatie k prokrastinaci.",
    example: "Vstávej. Je čas makat. Bez diskuse.",
  },
  {
    id: "friendly_mentor",
    label: "Kamarádský mentor",
    description: "Podporující, ale profesionální. Věří v tebe.",
    example: "Dobré ráno! Včera jsi to zvládl skvěle. Dnes to bude ještě lepší.",
  },
  {
    id: "calm_analyst",
    label: "Klidný analytik",
    description: "Data first. Čísla, fakta, trendy. Minimální emoce.",
    example: "Den 12/38. Streak: 7. Protein: -20g od cíle. Priorita: doplnit.",
  },
  {
    id: "energetic_motivator",
    label: "Energický motivátor",
    description: "Plný energie. Každý den je šance. Let's go!",
    example: "NOVÝ DEN! Pull day dneska! Pojď do toho, budeš skvělý!",
  },
  {
    id: "minimal",
    label: "Minimální",
    description: "Jen data, žádné hlášky. Pro ty, kdo chtějí klid.",
    example: "—",
  },
];
