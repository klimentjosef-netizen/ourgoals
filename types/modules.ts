import {
  Dumbbell,
  UtensilsCrossed,
  CalendarDays,
  Target,
  Moon,
  Users,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export const MODULE_IDS = [
  "training",
  "nutrition",
  "calendar",
  "goals_habits",
  "sleep_wellbeing",
  "family",
  "work_focus",
] as const;

export type ModuleId = (typeof MODULE_IDS)[number];

export interface ModuleDefinition {
  id: ModuleId;
  label: string;
  description: string;
  icon: LucideIcon;
  routes: string[];
  featureFlag?: string;
  onboardingStep?: boolean;
}

export const MODULE_REGISTRY: ModuleDefinition[] = [
  {
    id: "goals_habits",
    label: "Cíle & návyky",
    description: "Jakékoliv cíle, denní checklist, streak tracking, gamifikace",
    icon: Target,
    routes: ["/goals"],
    onboardingStep: true,
  },
  {
    id: "sleep_wellbeing",
    label: "Spánek & wellbeing",
    description: "Spánek, nálada, energie, stres, ranní a večerní rituál",
    icon: Moon,
    routes: ["/checkin", "/wellbeing"],
    onboardingStep: true,
  },
  {
    id: "calendar",
    label: "Kalendář & čas",
    description: "Plánování dne, konflikty, rozvrh, eventy",
    icon: CalendarDays,
    routes: ["/calendar"],
    onboardingStep: true,
  },
  {
    id: "work_focus",
    label: "Práce & focus",
    description: "Deep work bloky, meetingy, produktivita, priority",
    icon: Briefcase,
    routes: ["/founder-log"],
    onboardingStep: true,
  },
  {
    id: "training",
    label: "Trénink & tělo",
    description: "Plány, logování, progressive overload, body metriky",
    icon: Dumbbell,
    routes: ["/training", "/body"],
    onboardingStep: true,
  },
  {
    id: "nutrition",
    label: "Jídlo & výživa",
    description: "Makra, kalorie, jídelní šablony, týdenní přehled",
    icon: UtensilsCrossed,
    routes: ["/nutrition"],
    onboardingStep: true,
  },
  {
    id: "family",
    label: "Rodina & partner",
    description: "Sdílený kalendář, vzkazy, nákupy, vztahové metriky",
    icon: Users,
    routes: ["/partner"],
    featureFlag: "FAMILY_MODULE_ENABLED",
    onboardingStep: true,
  },
];

export function getModuleById(id: ModuleId): ModuleDefinition | undefined {
  return MODULE_REGISTRY.find((m) => m.id === id);
}

export function getActiveRoutes(activeModules: ModuleId[]): string[] {
  return MODULE_REGISTRY.filter((m) => activeModules.includes(m.id)).flatMap(
    (m) => m.routes
  );
}
