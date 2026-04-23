import {
  Dumbbell,
  Briefcase,
  Users2,
  Baby,
  Moon,
  UtensilsCrossed,
  Layers,
  ClipboardCheck,
  Video,
  type LucideIcon,
} from "lucide-react";

export type EventKind =
  | "training"
  | "work_deep"
  | "work_meeting"
  | "family"
  | "son"
  | "sleep"
  | "meal"
  | "custom"
  | "checkin";

export interface CalendarEvent {
  id: string;
  owner_id: string;
  household_id: string | null;
  title: string;
  kind: EventKind;
  starts_at: string | null;
  ends_at: string | null;
  all_day: boolean;
  rrule: string | null;
  color: string | null;
  visibility: string;
  notes: string | null;
  linked_entity_type: string | null;
  linked_entity_id: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventKindConfig {
  label: string;
  color: string;
  bgClass: string;
  icon: LucideIcon;
}

export const EVENT_KIND_CONFIG: Record<EventKind, EventKindConfig> = {
  training: { label: "Trénink", color: "text-green-500", bgClass: "bg-green-500/10 border-l-green-500", icon: Dumbbell },
  work_deep: { label: "Deep work", color: "text-blue-500", bgClass: "bg-blue-500/10 border-l-blue-500", icon: Briefcase },
  work_meeting: { label: "Meeting", color: "text-gray-400", bgClass: "bg-gray-400/10 border-l-gray-400", icon: Video },
  family: { label: "Rodina", color: "text-purple-500", bgClass: "bg-purple-500/10 border-l-purple-500", icon: Users2 },
  son: { label: "Syn", color: "text-sky-400", bgClass: "bg-sky-400/10 border-l-sky-400", icon: Baby },
  sleep: { label: "Spánek", color: "text-zinc-500", bgClass: "bg-zinc-500/10 border-l-zinc-500", icon: Moon },
  meal: { label: "Jídlo", color: "text-amber-500", bgClass: "bg-amber-500/10 border-l-amber-500", icon: UtensilsCrossed },
  custom: { label: "Vlastní", color: "text-zinc-300", bgClass: "bg-zinc-300/10 border-l-zinc-300", icon: Layers },
  checkin: { label: "Check-in", color: "text-primary", bgClass: "bg-primary/10 border-l-primary", icon: ClipboardCheck },
};

export const EVENT_KIND_OPTIONS = Object.entries(EVENT_KIND_CONFIG).map(
  ([id, config]) => ({ value: id as EventKind, label: config.label })
);
