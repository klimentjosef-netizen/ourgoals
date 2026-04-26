import type { GoalType } from "@/types/onboarding";

export interface GoalTemplate {
  title: string;
  type: GoalType;
  modules: string[];
  timeHorizon: "short_term" | "long_term";
  description: string;
  howTo: string[];
  suggestedHabits: { title: string; frequency: string }[];
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  // HEALTH
  {
    title: "Zhubnout",
    type: "measurable",
    modules: ["training"],
    timeHorizon: "long_term",
    description: "Zdravý úbytek 0.5-1 kg týdně skrze kalorický deficit a pohyb.",
    howTo: [
      "Nastav si mírný kalorický deficit (300-500 kcal pod TDEE)",
      "Kombinuj silový trénink s kardiem",
      "Sleduj váhu 1x týdně ráno nalačno",
      "Zaměř se na protein (2g/kg) pro udržení svalů",
    ],
    suggestedHabits: [
      { title: "Zalogovat jídla", frequency: "daily" },
      { title: "10 000 kroků", frequency: "daily" },
      { title: "Silový trénink", frequency: "3x_week" },
    ],
  },
  {
    title: "Zvýšit sílu",
    type: "measurable",
    modules: ["training"],
    timeHorizon: "long_term",
    description: "Progresivní přetěžování v základních cvicích. Měř 1RM nebo pracovní váhy.",
    howTo: [
      "Drž se plánu s progresí (přidávej 2.5kg/týden)",
      "Jez dostatek bílkovin (2g/kg) a kalorii",
      "Spi 7-9 hodin pro regeneraci",
      "Zaznamenávej si váhy a opakování",
    ],
    suggestedHabits: [
      { title: "Trénink podle plánu", frequency: "3x_week" },
      { title: "Splnit protein cíl", frequency: "daily" },
      { title: "Spát 7+ hodin", frequency: "daily" },
    ],
  },
  {
    title: "Cvičit pravidelně",
    type: "habit",
    modules: ["training"],
    timeHorizon: "short_term",
    description: "Vybuduj si rutinu pohybu. Konzistence je důležitější než intenzita.",
    howTo: [
      "Začni s reálným počtem dní (3x týdně)",
      "Zvol čas a drž se ho",
      "Připrav si oblečení den předem",
      "Sleduj streak — nepřerušuj sérii",
    ],
    suggestedHabits: [
      { title: "Odcvičit trénink", frequency: "3x_week" },
      { title: "Aktivní odpočinek (procházka, strečink)", frequency: "2x_week" },
    ],
  },

  // NUTRITION
  {
    title: "Jíst zdravěji",
    type: "habit",
    modules: ["nutrition"],
    timeHorizon: "long_term",
    description: "Postupně nahrazuj zpracované potraviny celými, čerstvými ingrediencemi.",
    howTo: [
      "Přidej zeleninu ke každému jídlu",
      "Vař si doma alespoň 4x týdně",
      "Omez sladkosti na 1x denně",
      "Pij 2+ litry vody denně",
    ],
    suggestedHabits: [
      { title: "Vařit doma", frequency: "4x_week" },
      { title: "Zelenina ke každému jídlu", frequency: "daily" },
      { title: "2 litry vody", frequency: "daily" },
    ],
  },
  {
    title: "Hlídat makra",
    type: "habit",
    modules: ["nutrition"],
    timeHorizon: "short_term",
    description: "Loguj jídla a sleduj protein, sacharidy a tuky. Data = kontrola.",
    howTo: [
      "Loguj každé jídlo hned po snězení",
      "Zaměř se nejdřív na protein — zbytek přijde",
      "Používej šablony pro opakující se jídla",
      "Reviduj makra na konci každého dne",
    ],
    suggestedHabits: [
      { title: "Zalogovat všechna jídla", frequency: "daily" },
      { title: "Splnit protein cíl", frequency: "daily" },
    ],
  },

  // SLEEP & WELLBEING
  {
    title: "Spát víc",
    type: "habit",
    modules: ["sleep_wellbeing"],
    timeHorizon: "short_term",
    description: "Kvalitní spánek je základ všeho. Cíl: 7-9 hodin každou noc.",
    howTo: [
      "Nastav si budík na usínání (ne jen na vstávání)",
      "Vypni obrazovky 30 min před spaním",
      "Ztlum osvětlení od 21:00",
      "Vyhni se kofeinu po 14:00",
    ],
    suggestedHabits: [
      { title: "Jít spát do cílového bedtime", frequency: "daily" },
      { title: "Bez obrazovky 30 min před spaním", frequency: "daily" },
      { title: "Bez kofeinu po 14:00", frequency: "daily" },
    ],
  },
  {
    title: "Snížit stres",
    type: "habit",
    modules: ["sleep_wellbeing"],
    timeHorizon: "long_term",
    description: "Pravidelné techniky na zvládání stresu: dýchání, meditace, pohyb.",
    howTo: [
      "Medituj 5-10 minut denně (ráno nebo večer)",
      "Choď na procházky v přírodě 3x týdně",
      "Piš si deník — zapiš co tě trápí",
      "Dýchací cvičení 4-7-8 při úzkosti",
    ],
    suggestedHabits: [
      { title: "Meditace 10 minut", frequency: "daily" },
      { title: "Procházka v přírodě", frequency: "3x_week" },
      { title: "Dýchací cvičení", frequency: "daily" },
    ],
  },
  {
    title: "30 dní meditace",
    type: "challenge",
    modules: ["sleep_wellbeing"],
    timeHorizon: "short_term",
    description: "Výzva na 30 dní nepřetržité meditace. Stačí 5 minut denně.",
    howTo: [
      "Začni s 5 minutami, postupně zvyšuj",
      "Medituj každý den ve stejný čas",
      "Použij řízenou meditaci (YouTube, Insight Timer)",
      "Nesuď se — důležité je sedět, ne kvalita",
    ],
    suggestedHabits: [
      { title: "Meditace", frequency: "daily" },
    ],
  },

  // WORK
  {
    title: "Víc deep work",
    type: "habit",
    modules: ["work_focus"],
    timeHorizon: "short_term",
    description: "Soustředěná práce bez přerušení. Cíl: 2-4 hodiny denně.",
    howTo: [
      "Blokuj si čas v kalendáři — deep work je schůzka sám se sebou",
      "Vypni notifikace a telefon dej do režimu nerušit",
      "Pracuj v blocích 25-50 minut (Pomodoro)",
      "Sleduj focus score po každém bloku",
    ],
    suggestedHabits: [
      { title: "Deep work blok", frequency: "daily" },
      { title: "Telefon v režimu nerušit", frequency: "daily" },
    ],
  },
  {
    title: "Dokončit projekt",
    type: "oneoff",
    modules: ["work_focus"],
    timeHorizon: "short_term",
    description: "Jednorázový cíl s deadlinem. Rozděl na menší milestones.",
    howTo: [
      "Rozděl projekt na milestones (max 1-2 týdny každý)",
      "Každý den pracuj alespoň 30 minut na projektu",
      "Sleduj progress v procentech",
      "Nastav si deadline a drž se ho",
    ],
    suggestedHabits: [
      { title: "Pracovat na projektu 30 min", frequency: "daily" },
    ],
  },

  // GROWTH
  {
    title: "Přečíst X knih",
    type: "measurable",
    modules: ["goals_habits"],
    timeHorizon: "long_term",
    description: "Čtení rozšiřuje obzory. Cíl: 1-2 knihy měsíčně.",
    howTo: [
      "Čti 20-30 minut denně (ráno nebo před spaním)",
      "Měj vždy rozečtenou knihu u postele",
      "Střídej žánry — odborné a beletrie",
      "Dělej si poznámky z toho, co tě zaujme",
    ],
    suggestedHabits: [
      { title: "Číst 20 minut", frequency: "daily" },
    ],
  },
  {
    title: "Naučit se jazyk",
    type: "oneoff",
    modules: ["goals_habits"],
    timeHorizon: "long_term",
    description: "Konzistentní denní praxe je klíč. 15 minut denně > 2 hodiny jednou.",
    howTo: [
      "Používej spaced repetition (Anki, Duolingo)",
      "Denně se nauč 5 nových slov",
      "Poslouchej podcasty v cílovém jazyce",
      "Najdi si konverzačního partnera",
    ],
    suggestedHabits: [
      { title: "Jazyková lekce 15 min", frequency: "daily" },
      { title: "5 nových slovíček", frequency: "daily" },
    ],
  },

  // RELATIONSHIPS
  {
    title: "Společný streak",
    type: "challenge",
    modules: ["family"],
    timeHorizon: "short_term",
    description: "Výzva pro oba partnery. Oba musí splnit den, aby streak pokračoval.",
    howTo: [
      "Domluvte se na jedné společné aktivitě denně",
      "Může to být procházka, cvičení, nebo i 10 minut povídání",
      "Sledujte streak společně — motivujte se navzájem",
    ],
    suggestedHabits: [
      { title: "Společná aktivita s partnerem", frequency: "daily" },
    ],
  },
  {
    title: "Lepší komunikace",
    type: "habit",
    modules: ["family"],
    timeHorizon: "long_term",
    description: "Kvalitní komunikace = kvalitní vztah. Gottman říká: 5 pozitivních na 1 negativní.",
    howTo: [
      "Pošli partnerovi denně 1 vzkaz vděčnosti",
      "Večer si sedněte a promluvte si 10 minut bez telefonů",
      "Naslouchej aktivně — opakuj co jsi slyšel",
      "Řešte konflikty v klidu, ne v emocích",
    ],
    suggestedHabits: [
      { title: "Vzkaz vděčnosti partnerovi", frequency: "daily" },
      { title: "10 minut povídání bez telefonů", frequency: "daily" },
    ],
  },
];
