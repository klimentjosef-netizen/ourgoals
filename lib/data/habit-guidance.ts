export interface HabitGuidance {
  title: string;
  shortDescription: string;
  steps: string[];
  whyItMatters: string;
  frequency: string;
}

const GUIDANCE_MAP: Record<string, HabitGuidance> = {
  "Ranní check-in": {
    title: "Ranní check-in",
    shortDescription: "Začni den s přehledem o tom, jak se cítíš a co tě čeká.",
    steps: [
      "Otevři OurGoals hned po probuzení",
      "Zaznamenej jak jsi spal (bedtime, wake time, kvalita)",
      "Ohodnoť svou náladu a energii",
      "Napiš 1-3 priority na dnešek",
    ],
    whyItMatters: "Ranní reflexe ti pomůže vědomě začít den a sledovat vzorce ve spánku a náladě.",
    frequency: "Každý den ráno",
  },
  "Večerní check-in": {
    title: "Večerní check-in",
    shortDescription: "Zhodnoť den, zaznamenej co se povedlo a co ne.",
    steps: [
      "Ohodnoť celkově svůj den (1-10)",
      "Zapiš nejlepší a nejhorší moment",
      "Zaznamenej stres, kofein, alkohol",
      "Zamysli se nad riziky zítřka",
    ],
    whyItMatters: "Večerní reflexe uzavírá den a pomáhá identifikovat vzorce chování.",
    frequency: "Každý den večer",
  },
  "Pracuj na svém cíli": {
    title: "Práce na cíli",
    shortDescription: "Věnuj alespoň 15 minut denně svému hlavnímu cíli.",
    steps: [
      "Zvol si jeden konkrétní úkol směrem k cíli",
      "Nastav si timer na 15-30 minut",
      "Pracuj bez přerušení",
      "Zaznamenej co jsi udělal",
    ],
    whyItMatters: "Konzistentní malé kroky jsou efektivnější než sporadické velké snahy.",
    frequency: "Každý den",
  },
  "Odcvič trénink": {
    title: "Trénink",
    shortDescription: "Dodržuj tréninkový plán. Konzistence > intenzita.",
    steps: [
      "Podívej se na dnešní trénink v plánu",
      "Připrav si oblečení a vodu",
      "Zahřej se 5 minut",
      "Odcvič trénink a zaloguj sety",
    ],
    whyItMatters: "Pravidelný pohyb zlepšuje náladu, energii, spánek a celkové zdraví.",
    frequency: "Podle plánu (3-6x týdně)",
  },
  "Zaloguj jídla": {
    title: "Logování jídel",
    shortDescription: "Zaznamenej co jíš. Co měříš, to řídíš.",
    steps: [
      "Zaloguj každé jídlo hned po snězení",
      "Použij vyhledávání nebo šablony",
      "Zkontroluj makra na konci dne",
      "Uprav zítřejší jídla podle potřeby",
    ],
    whyItMatters: "Sledování stravy je nejefektivnější způsob jak dosáhnout váhových cílů.",
    frequency: "Po každém jídle",
  },
  "Kvalitní spánek": {
    title: "Kvalitní spánek",
    shortDescription: "Dodržuj cílový bedtime a rutinu před spaním.",
    steps: [
      "Nastav si budík na usínání",
      "30 min před spaním vypni obrazovky",
      "Ztlum osvětlení a vyvětrej",
      "Žádný kofein po 14:00",
    ],
    whyItMatters: "Spánek je základ regenerace. Špatný spánek = špatný výkon ve všem.",
    frequency: "Každou noc",
  },
  "Deep work blok": {
    title: "Deep work",
    shortDescription: "Blok soustředěné práce bez přerušení.",
    steps: [
      "Zvol si jeden úkol na celý blok",
      "Vypni notifikace a telefon do režimu nerušit",
      "Nastav timer (25-50 minut)",
      "Po bloku ohodnoť focus score",
    ],
    whyItMatters: "Deep work je nejcennější dovednost v ekonomice znalostí. 2h deep work > 8h rozptýlené práce.",
    frequency: "Každý pracovní den",
  },
  "Meditace 10 minut": {
    title: "Meditace",
    shortDescription: "10 minut tiché meditace nebo řízené relaxace.",
    steps: [
      "Sedni si pohodlně, zavři oči",
      "Zaměř se na dech — nádech, výdech",
      "Když se myšlenky vrátí, jemně se vrať k dechu",
      "Nesuď se — každá meditace je dobrá meditace",
    ],
    whyItMatters: "Meditace snižuje stres, zlepšuje soustředění a emoční regulaci.",
    frequency: "Denně ráno nebo večer",
  },
  "10 000 kroků": {
    title: "10 000 kroků",
    shortDescription: "Přirozený pohyb během celého dne.",
    steps: [
      "Choď pěšky na kratší vzdálenosti",
      "Vezmi si procházku po obědě",
      "Používej schody místo výtahu",
      "Večerní procházka s partnerem/psem",
    ],
    whyItMatters: "NEAT (non-exercise activity thermogenesis) je největší část denního výdeje energie.",
    frequency: "Každý den",
  },
};

export function getHabitGuidance(title: string): HabitGuidance | null {
  // Exact match first
  if (GUIDANCE_MAP[title]) return GUIDANCE_MAP[title];

  // Fuzzy match by keywords
  const lower = title.toLowerCase();
  for (const [key, guidance] of Object.entries(GUIDANCE_MAP)) {
    const keyLower = key.toLowerCase();
    if (lower.includes(keyLower) || keyLower.includes(lower)) {
      return guidance;
    }
  }

  // Keyword-based fallback
  if (lower.includes("medit")) return GUIDANCE_MAP["Meditace 10 minut"];
  if (lower.includes("trénink") || lower.includes("cvič")) return GUIDANCE_MAP["Odcvič trénink"];
  if (lower.includes("spánek") || lower.includes("spát")) return GUIDANCE_MAP["Kvalitní spánek"];
  if (lower.includes("deep work") || lower.includes("soustřed")) return GUIDANCE_MAP["Deep work blok"];
  if (lower.includes("krok")) return GUIDANCE_MAP["10 000 kroků"];
  if (lower.includes("jíd") || lower.includes("log")) return GUIDANCE_MAP["Zaloguj jídla"];
  if (lower.includes("check")) return GUIDANCE_MAP["Ranní check-in"];

  return null;
}
