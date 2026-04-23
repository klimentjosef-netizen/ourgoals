import type { CoachTone } from "@/types/gamification";

const GREETINGS: Record<CoachTone, string[]> = {
  strict_coach: [
    "Vstávej. Je čas makat.",
    "Nový den, nové výzvy. Bez výmluv.",
    "Budíček. Dneska se neflákáme.",
    "Čas na akci. Připraven?",
    "Zero bullshit. Jdeme na to.",
  ],
  friendly_mentor: [
    "Dobré ráno! Dneska to dáme!",
    "Ahoj! Připraven na skvělý den?",
    "Krásné ráno! Co dneska zvládneme?",
    "Zdravím tě! Věřím, že to bude super den.",
    "Hey! Včera jsi to zvládl, dneska to bude ještě lepší.",
  ],
  calm_analyst: [
    "Nový den. Kontrola systému zahájena.",
    "Dobré ráno. Pojďme se podívat na data.",
    "Systém aktivní. Denní přehled připraven.",
    "Start dne. Metriky čekají.",
    "Inicializace nového dne. Vše online.",
  ],
  energetic_motivator: [
    "DOBRÉ RÁNO! Dneska bude LEGENDÁRNÍ!",
    "NOVÝ DEN! Pojď do toho, šampione!",
    "WOW, další šance být úžasný! LET'S GO!",
    "GOOD MORNING! Energie na max, jdeme!",
    "RISE AND SHINE! Dneska se píše historie!",
  ],
  minimal: ["—", "—", "—", "—", "—"],
};

interface DailyContext {
  streak: number;
  level: number;
  missedYesterday: boolean;
  perfectDays: number;
}

type Scenario = "streak_broken" | "streak_continues" | "level_up_close" | "default";

function getScenario(context: DailyContext): Scenario {
  if (context.missedYesterday && context.streak === 0) return "streak_broken";
  if (context.streak >= 3) return "streak_continues";
  return "default";
}

const DAILY_MESSAGES: Record<CoachTone, Record<Scenario, string[]>> = {
  strict_coach: {
    streak_broken: [
      "Streak pryč. Bez výmluv. Dneska to začínáme znovu.",
      "Včera jsi selhal. To se stane. Ale dneska ne.",
      "Reset. Žádné litování. Jen akce.",
    ],
    streak_continues: [
      "Streak běží. Nepolevuj. Každý den se počítá.",
      "Dobrá práce, ale to nestačí. Pokračuj.",
      "Streak {streak} dní. Udrž to. Bez kompromisů.",
    ],
    level_up_close: [
      "Level up na dosah. Nech si ho neujít.",
      "Blízko dalšímu levelu. Dneska to dotáhni.",
      "Pár XP chybí. Makej.",
    ],
    default: [
      "Den jako každý jiný. Odmakaš ho, nebo ne. Tvoje volba.",
      "Žádné výmluvy. Jdi a splň úkoly.",
      "Jdeme na to. Checklist čeká.",
    ],
  },
  friendly_mentor: {
    streak_broken: [
      "Včera to nevyšlo, ale to nevadí! Dneska začínáme znovu. 💪",
      "Každý mistr má své slabé dny. Důležité je vstát a jít dál.",
      "Nový den, nová šance. Věřím v tebe!",
    ],
    streak_continues: [
      "Wow, {streak} dní v řadě! Skvělá práce, pokračuj!",
      "Tvůj streak roste! Jsi na dobré cestě.",
      "Úžasná konzistence! {streak} dní — to je síla.",
    ],
    level_up_close: [
      "Blížíš se k novému levelu! Ještě trochu a máš to.",
      "Level up je na dosah! Dneska to můžeš dotáhnout.",
      "Pár kroků k dalšímu levelu. Držím palce!",
    ],
    default: [
      "Krásný den! Co dneska zvládneme?",
      "Pojďme na to! Každý malý krok se počítá.",
      "Připraven na další den? Já jo!",
    ],
  },
  calm_analyst: {
    streak_broken: [
      "Streak resetován na 0. Doporučení: zaměřit se na základní návyky.",
      "Data ukazují přerušení. Priorita: obnovit rutinu.",
      "Včerejší data chybí. Dnešní fokus: restart sekvence.",
    ],
    streak_continues: [
      "Streak: {streak} dní. Trend: stabilní. Pokračuj.",
      "Aktuální série: {streak}. Konzistence nad průměrem.",
      "{streak} dní aktivních. Data pozitivní.",
    ],
    level_up_close: [
      "Zbývá málo XP do dalšího levelu. Optimální den pro postup.",
      "Level up v dosahu. Aktuální XP blízko prahu.",
      "Analýza: level up možný dnes při standardní aktivitě.",
    ],
    default: [
      "Denní přehled připraven. Čeká {perfectDays} perfektních dní celkem.",
      "Systém aktivní. Level {level}. Úkoly čekají.",
      "Data načtena. Připraven na dnešní tracking.",
    ],
  },
  energetic_motivator: {
    streak_broken: [
      "HEY! Streak je pryč, ale TO NEVADÍ! Dneska ZAČÍNÁME ZNOVU!",
      "Padni sedmkrát, vstaň osmkrát! JDEME NA TO!",
      "Reset? To je jen nový START! Pojď do toho!",
    ],
    streak_continues: [
      "{streak} DNÍ V ŘADĚ! To je ÚŽASNÉ! Nepřestávej!",
      "WOOO! Streak {streak}! Jsi NEZASTAVITELNÝ!",
      "BOMBA! {streak} dní! Tohle je tvůj rok!",
    ],
    level_up_close: [
      "LEVEL UP JE TAK BLÍZKO! Dneska to DOTÁHNEŠ!",
      "Už skoro tam! Nový level čeká! POJĎ!",
      "Pár XP a máš to! FULL POWER dneska!",
    ],
    default: [
      "NOVÝ DEN! Nová energie! JDEME NA TO!",
      "POJĎ! Dneska bude SUPER! Věřím ti!",
      "Let's GOOO! Každý den je šance být lepší!",
    ],
  },
  minimal: {
    streak_broken: ["Streak: 0"],
    streak_continues: ["Streak: {streak}"],
    level_up_close: ["Level up blízko"],
    default: ["—"],
  },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function interpolate(template: string, context: DailyContext): string {
  return template
    .replace(/\{streak\}/g, String(context.streak))
    .replace(/\{level\}/g, String(context.level))
    .replace(/\{perfectDays\}/g, String(context.perfectDays));
}

export function getGreeting(tone: CoachTone): string {
  return pickRandom(GREETINGS[tone]);
}

export function getDailyMessage(tone: CoachTone, context: DailyContext): string {
  const scenario = getScenario(context);
  const templates = DAILY_MESSAGES[tone][scenario];
  const template = pickRandom(templates);
  return interpolate(template, context);
}
